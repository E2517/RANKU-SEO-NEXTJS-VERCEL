import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import User from '@/models/User';
import SearchResult from '@/models/SearchResult';
import { connectDB } from '@/lib/mongoose';
import { normalizeDomain, getKeywordLimit } from '@/lib/utils';
import axios from 'axios';

const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;

interface SerpApiResponse {
    organic_results?: {
        link?: string;
        position?: number;
    }[];
    local_results?: any[];
    ads_results?: any[];
}

export async function POST(req: Request) {
    await connectDB();

    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;

    if (!userId) {
        return NextResponse.json({ success: false, message: 'No autenticado.' }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user) {
        return NextResponse.json({ success: false, message: 'Usuario no encontrado.' }, { status: 404 });
    }

    const limit = getKeywordLimit(user.subscriptionPlan);
    if (limit === 0) {
        return NextResponse.json({
            success: false,
            message: 'Acceso restringido. Actualiza tu plan para seguir usando el servicio.',
            actionText: 'Ir a Perfil y Suscripción',
            redirectTo: '/dashboard?tab=profile-section'
        }, { status: 403 });
    }

    const totalKeywords = await SearchResult.countDocuments({
        userId: user._id,
        tipoBusqueda: 'palabraClave'
    });

    if (totalKeywords >= limit) {
        return NextResponse.json({
            success: false,
            message: 'Has alcanzado el límite de búsquedas permitidas en tu plan actual.',
            actionText: 'Ir a Perfil y Suscripción',
            redirectTo: '/dashboard?tab=profile-section'
        }, { status: 403 });
    }

    const body = await req.json();
    const { keywords, domain, location, searchEngine, device } = body;

    if (!keywords || !domain) {
        return NextResponse.json({ success: false, message: 'Faltan palabras clave o dominio.' }, { status: 400 });
    }

    const keywordList = keywords
        .split(/[\n,]+/)
        .map((k: string) => k.trim())
        .filter((k: string) => k.length > 0);

    if (keywordList.length === 0) {
        return NextResponse.json({ success: false, message: 'No se encontraron palabras clave válidas.' }, { status: 400 });
    }

    const remaining = limit - totalKeywords;
    if (keywordList.length > remaining) {
        return NextResponse.json({
            success: false,
            message: 'No puedes realizar esta búsqueda: excede tu límite de búsquedas disponibles.',
            actionText: 'Ir a Perfil y Suscripción',
            redirectTo: '/dashboard?tab=profile-section'
        }, { status: 403 });
    }

    const normalizedDomain = normalizeDomain(domain);
    if (!normalizedDomain) {
        return NextResponse.json({ success: false, message: 'Dominio inválido.' }, { status: 400 });
    }

    const devices = Array.isArray(device) ? device : ['desktop'];
    const allResults: any[] = [];
    let foundAnyResult = false;

    try {
        for (const keyword of keywordList) {
            for (const dispositivo of devices) {
                if (dispositivo === 'google_local') {
                    if (!SERPAPI_API_KEY) {
                        return NextResponse.json({ success: false, message: 'SerpAPI no configurada.' }, { status: 500 });
                    }
                    const effectiveKeyword = location ? `${keyword} ${location}` : keyword;
                    let position = 0;
                    let rating = null;
                    let reviews = null;
                    let foundDomain = null;

                    for (let start = 0; start < 100; start += 20) {
                        const params: any = {
                            api_key: SERPAPI_API_KEY,
                            q: effectiveKeyword,
                            engine: 'google_local',
                            location: location,
                            google_domain: 'google.com',
                            gl: 'es',
                            hl: 'es',
                            num: 20,
                            start: start,
                            device: 'mobile'
                        };
                        if (location) params.location = location;

                        const response = await axios.get<SerpApiResponse>('https://serpapi.com/search', { params });
                        const pageResults = response.data.local_results || response.data.ads_results || [];
                        if (pageResults.length === 0) break;

                        let foundInPage = false;
                        for (const result of pageResults) {
                            if (result.position !== undefined) {
                                let resultDomain = null;

                                if (result.website) {
                                    resultDomain = normalizeDomain(result.website);
                                } else if (result.links?.website) {
                                    resultDomain = normalizeDomain(result.links.website);
                                }

                                if (!resultDomain && result.title) {
                                    const cleanTitle = result.title.toLowerCase().replace(/[^a-z0-9]/g, '');
                                    const domainBase = normalizedDomain
                                        .replace(/^(www\.)?/, '')
                                        .replace(/\.(es|com|net|org|eu|io|co)$/, '')
                                        .toLowerCase()
                                        .replace(/[^a-z0-9]/g, '');

                                    if (cleanTitle.includes(domainBase) || domainBase.includes(cleanTitle)) {
                                        resultDomain = normalizedDomain;
                                    }
                                }

                                if (resultDomain === normalizedDomain) {
                                    position = start + result.position;
                                    rating = result.rating || null;
                                    reviews = result.reviews || null;
                                    foundDomain = resultDomain;
                                    foundInPage = true;
                                    break;
                                }
                            }
                        }

                        if (foundInPage) break;
                    }

                    if (position > 0) {
                        foundAnyResult = true;
                        const updateFilter = {
                            userId: user._id,
                            palabraClave: keyword,
                            dominioFiltrado: normalizedDomain,
                            dispositivo: 'google_local',
                            ...(location ? { location } : {})
                        };

                        const existing = await SearchResult.findOne(updateFilter);

                        const now = new Date();
                        const newSetData: any = {
                            userId: user._id,
                            buscador: 'google_local',
                            dispositivo: 'google_local',
                            posicion: position,
                            palabraClave: keyword,
                            dominio: foundDomain || normalizedDomain,
                            tipoBusqueda: 'palabraClave',
                            dominioFiltrado: normalizedDomain,
                            location: location || null,
                            rating,
                            reviews,
                            updatedAt: now
                        };

                        if (existing && existing.posicion !== undefined) {
                            newSetData.posicionAnterior = existing.posicion;
                            newSetData.fechaPosicionAnterior = existing.updatedAt || existing.createdAt;
                        }

                        await SearchResult.findOneAndUpdate(
                            updateFilter,
                            { $set: newSetData },
                            { upsert: true, new: true }
                        );

                        allResults.push({
                            position,
                            dominio: foundDomain || normalizedDomain,
                            palabraClave: keyword,
                            device: 'google_local',
                            location,
                            rating,
                            reviews
                        });
                    }
                } else {
                    if (!SERPAPI_API_KEY) {
                        return NextResponse.json({ success: false, message: 'SerpAPI no configurada.' }, { status: 500 });
                    }
                    const effectiveKeyword = location ? `${keyword} ${location}` : keyword;
                    let position = 0;
                    let foundDomain = null;

                    for (let start = 0; start < 100; start += 10) {
                        const params: any = {
                            api_key: SERPAPI_API_KEY,
                            q: effectiveKeyword,
                            engine: searchEngine || 'google',
                            location: location,
                            google_domain: 'google.es',
                            gl: 'es',
                            hl: 'es',
                            num: 10,
                            start: start,
                            device: dispositivo
                        };
                        if (location) params.location = location;

                        const response = await axios.get<SerpApiResponse>('https://serpapi.com/search', { params });
                        const organic = response.data.organic_results || [];
                        if (organic.length === 0) break;

                        let foundInPage = false;
                        for (let i = 0; i < organic.length; i++) {
                            const result = organic[i];
                            if (result.link) {
                                const resultDomain = normalizeDomain(result.link);
                                if (resultDomain === normalizedDomain) {
                                    position = start + (result.position || i + 1);
                                    foundDomain = resultDomain;
                                    foundInPage = true;
                                    break;
                                }
                            }
                        }

                        if (foundInPage) break;
                    }

                    if (position > 0) {
                        foundAnyResult = true;
                        const updateFilter = {
                            userId: user._id,
                            palabraClave: keyword,
                            dominioFiltrado: normalizedDomain,
                            dispositivo: dispositivo,
                            ...(location ? { location } : {})
                        };

                        const existing = await SearchResult.findOne(updateFilter);

                        const now = new Date();
                        const newSetData: any = {
                            userId: user._id,
                            buscador: searchEngine || 'google',
                            dispositivo: dispositivo,
                            posicion: position,
                            palabraClave: keyword,
                            dominio: foundDomain || normalizedDomain,
                            tipoBusqueda: 'palabraClave',
                            dominioFiltrado: normalizedDomain,
                            location: location || null,
                            updatedAt: now
                        };

                        if (existing && existing.posicion !== undefined) {
                            newSetData.posicionAnterior = existing.posicion;
                            newSetData.fechaPosicionAnterior = existing.updatedAt || existing.createdAt;
                        }

                        await SearchResult.findOneAndUpdate(
                            updateFilter,
                            { $set: newSetData },
                            { upsert: true, new: true }
                        );

                        allResults.push({
                            position,
                            dominio: foundDomain || normalizedDomain,
                            palabraClave: keyword,
                            device: dispositivo,
                            location
                        });
                    }
                }
            }
        }

        if (!foundAnyResult) {
            return NextResponse.json({
                success: false,
                message: 'No se encontró el dominio en los resultados de búsqueda para ninguna de las combinaciones.'
            });
        }

        return NextResponse.json({
            success: true,
            results: allResults,
            message: 'Búsqueda guardada correctamente.'
        });
    } catch (error: any) {
        console.error('Error en búsqueda:', error.response?.data || error.message || error);
        return NextResponse.json({ success: false, message: 'Error al realizar la búsqueda.' }, { status: 500 });
    }
}

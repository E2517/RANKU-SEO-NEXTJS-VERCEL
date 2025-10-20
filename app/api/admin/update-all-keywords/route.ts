import { NextResponse } from 'next/server';
import SearchResult from '@/models/SearchResult';
import User from '@/models/User';
import { connectDB } from '@/lib/mongoose';
import { normalizeDomain } from '@/lib/utils';
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

export async function GET() {
    await connectDB();

    if (!SERPAPI_API_KEY) {
        return NextResponse.json({ success: false, message: 'SerpAPI no configurada.' }, { status: 500 });
    }

    try {
        const allKeywords = await SearchResult.aggregate([
            {
                $group: {
                    _id: {
                        palabraClave: "$palabraClave",
                        dominioFiltrado: "$dominioFiltrado",
                        dispositivo: "$dispositivo",
                        location: "$location",
                    },
                    userIds: { $addToSet: "$userId" },
                }
            }
        ]);

        if (allKeywords.length === 0) {
            return NextResponse.json({ success: true, message: 'No hay keywords para actualizar.', updated: 0 });
        }

        let updatedCount = 0;

        for (const entry of allKeywords) {
            const { palabraClave, dominioFiltrado, dispositivo, location } = entry._id;

            if (dispositivo === 'google_local') {
                let position = 0;
                let rating = null;
                let reviews = null;
                let foundDomain = null;

                for (let start = 0; start < 100; start += 20) {
                    const params: any = {
                        api_key: SERPAPI_API_KEY,
                        q: location ? `${palabraClave} ${location}` : palabraClave,
                        engine: 'google_local',
                        location: location,
                        google_domain: 'google.com',
                        gl: 'es',
                        hl: 'es',
                        num: 20,
                        start: start,
                        device: 'mobile'
                    };

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
                                const domainBase = dominioFiltrado
                                    .replace(/^(www\.)?/, '')
                                    .replace(/\.(es|com|net|org|eu|io|co)$/, '')
                                    .toLowerCase()
                                    .replace(/[^a-z0-9]/g, '');

                                if (cleanTitle.includes(domainBase) || domainBase.includes(cleanTitle)) {
                                    resultDomain = dominioFiltrado;
                                }
                            }

                            if (resultDomain === dominioFiltrado) {
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
                    for (const userId of entry.userIds) {
                        const updateFilter = {
                            userId: userId,
                            palabraClave: palabraClave,
                            dominioFiltrado: dominioFiltrado,
                            dispositivo: 'google_local',
                            ...(location ? { location } : {})
                        };

                        const existing = await SearchResult.findOne(updateFilter);

                        const now = new Date();
                        const newSetData: any = {
                            userId: userId,
                            buscador: 'google_local',
                            dispositivo: 'google_local',
                            posicion: position,
                            palabraClave: palabraClave,
                            dominio: foundDomain || dominioFiltrado,
                            tipoBusqueda: 'palabraClave',
                            dominioFiltrado: dominioFiltrado,
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
                    }
                    updatedCount++;
                }
            } else {
                let position = 0;
                let foundDomain = null;

                for (let start = 0; start < 100; start += 10) {
                    const params: any = {
                        api_key: SERPAPI_API_KEY,
                        q: location ? `${palabraClave} ${location}` : palabraClave,
                        engine: 'google',
                        location: location,
                        google_domain: 'google.es',
                        gl: 'es',
                        hl: 'es',
                        num: 10,
                        start: start,
                        device: dispositivo
                    };

                    const response = await axios.get<SerpApiResponse>('https://serpapi.com/search', { params });
                    const organic = response.data.organic_results || [];
                    if (organic.length === 0) break;

                    let foundInPage = false;
                    for (let i = 0; i < organic.length; i++) {
                        const result = organic[i];
                        if (result.link) {
                            const resultDomain = normalizeDomain(result.link); // <-- Aquí podría fallar
                            if (resultDomain === dominioFiltrado) {
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
                    for (const userId of entry.userIds) {
                        const updateFilter = {
                            userId: userId,
                            palabraClave: palabraClave,
                            dominioFiltrado: dominioFiltrado,
                            dispositivo: dispositivo,
                            ...(location ? { location } : {})
                        };

                        const existing = await SearchResult.findOne(updateFilter);

                        const now = new Date();
                        const newSetData: any = {
                            userId: userId,
                            buscador: 'google',
                            dispositivo: dispositivo,
                            posicion: position,
                            palabraClave: palabraClave,
                            dominio: foundDomain || dominioFiltrado,
                            tipoBusqueda: 'palabraClave',
                            dominioFiltrado: dominioFiltrado,
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
                    }
                    updatedCount++;
                }
            }
        }

        return NextResponse.json({ success: true, message: 'Keywords actualizadas.', updated: updatedCount });
    } catch (error: any) {
        console.error('Error actualizando keywords:', error.response?.data || error.message || error);
        return NextResponse.json({ success: false, message: 'Error al actualizar las keywords.' }, { status: 500 });
    }
}
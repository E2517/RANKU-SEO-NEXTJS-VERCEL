import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import SearchResult from '@/models/SearchResult';
import User from '@/models/User';
import { normalizeDomain } from '@/lib/utils';
import { getKeywordLimit } from '@/lib/utils';
import { cookies } from 'next/headers';
import axios from 'axios';

export const dynamic = 'force-dynamic';

async function geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.GOOGLE_MAPS_API_KEY}`
    );
    const data = await response.json();
    if (data.results.length === 0) {
        throw new Error('Dirección no encontrada');
    }
    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lng };
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3;
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

async function getComparisonData(
    userId: string,
    keyword: string,
    domain: string,
    currentPos: number,
    now: Date
) {
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const query = { userId, palabraClave: keyword, dominio: domain };
    const results24h = await SearchResult.findOne({ ...query, createdAt: { $lte: oneDayAgo } }).sort({
        createdAt: -1,
    });
    const results7d = await SearchResult.findOne({ ...query, createdAt: { $lte: sevenDaysAgo } }).sort({
        createdAt: -1,
    });
    let diff24 = null,
        diff7 = null,
        color24 = '',
        color7 = '';
    if (results24h && typeof results24h.posicion === 'number' && results24h.posicion > 0) {
        diff24 = currentPos - results24h.posicion;
        color24 = diff24 < 0 ? 'green' : diff24 > 0 ? 'red' : '';
    }
    if (results7d && typeof results7d.posicion === 'number' && results7d.posicion > 0) {
        diff7 = currentPos - results7d.posicion;
        color7 = diff7 < 0 ? 'green' : diff7 > 0 ? 'red' : '';
    }
    return { diff24, diff7, color24, color7 };
}

interface SerpApiResponse {
    local_results?: Array<{
        title?: string;
        address?: string;
        rating?: number;
        reviews?: number;
        gps_coordinates?: {
            latitude: number;
            longitude: number;
        };
        website?: string;
        place_id_search?: string;
    }>;
}

export async function POST(req: NextRequest) {
    console.log('🔍 Iniciando búsqueda RankMap...');

    const cookieStore = await cookies();
    const userIdFromCookie = cookieStore.get('user_id')?.value;

    if (!userIdFromCookie) {
        console.log('❌ No se encontró cookie de sesión (user_id).');
        return NextResponse.json({ success: false, message: 'No autenticado.' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(userIdFromCookie);
    if (!user) {
        console.log('❌ Usuario no encontrado para el ID en la cookie.');
        return NextResponse.json({ success: false, message: 'Usuario no encontrado.' }, { status: 404 });
    }

    const userId = user._id.toString();
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
    const { keyword, location, domain, distanceFilter } = body;
    console.log('📝 Parámetros recibidos:', { keyword, location, domain, distanceFilter });
    if (!keyword || !location) {
        return NextResponse.json(
            { success: false, message: 'Faltan palabra clave o localización.' },
            { status: 400 }
        );
    }

    let llParam = location;
    if (typeof location === 'string') {
        if (location.startsWith('@')) {
            llParam = location;
        } else if (/^[\d.-]+,[\d.-]+$/.test(location)) {
            const [lat, lng] = location.split(',').map(Number);
            if (isNaN(lat) || isNaN(lng)) {
                return NextResponse.json(
                    { success: false, message: 'Localización inválida.' },
                    { status: 400 }
                );
            }
            llParam = `@${lat},${lng},14z`;
        } else {
            try {
                const coords = await geocodeAddress(location);
                llParam = `@${coords.lat},${coords.lng},14z`;
            } catch (e) {
                return NextResponse.json(
                    { success: false, message: 'Dirección no válida o no encontrada.' },
                    { status: 400 }
                );
            }
        }
    }

    try {
        const serpResponse = await axios.get<SerpApiResponse>('https://serpapi.com/search', {
            params: {
                api_key: process.env.SERPAPI_API_KEY,
                engine: 'google_maps',
                type: 'search',
                q: keyword,
                ll: llParam,
                num: 20,
            }
        });
        const serpData = serpResponse.data;
        const places = serpData.local_results || [];
        console.log(`📍 SerpAPI devolvió ${places.length} resultados.`);
        const results = places.map((place: any, index: number) => {
            let domainValue: string | null = null;
            if (place.website) domainValue = normalizeDomain(place.website);
            return {
                title: place.title,
                address: place.address,
                rating: place.rating,
                reviews: place.reviews,
                lat: place.gps_coordinates?.latitude,
                lng: place.gps_coordinates?.longitude,
                domain: domainValue,
                googleMapsUrl: place.place_id_search || '#',
                position: index + 1,
            };
        });
        const totalResults = results.length;
        const normalizedInputDomain = domain ? normalizeDomain(domain) : null;
        const domainResults = normalizedInputDomain
            ? results.filter((p: any) => p.domain && p.domain === normalizedInputDomain)
            : [];
        const domainPosition = domainResults.length > 0 ? domainResults[0].position : 0;
        const domainPositionText =
            domainPosition > 0 ? `${domainPosition}/${totalResults}` : 'No encontrado';
        const avgPosition =
            totalResults > 0
                ? results.reduce((sum: number, p: any) => sum + p.position, 0) / totalResults
                : 0;
        const avgRating =
            totalResults > 0
                ? results.reduce((sum: number, p: any) => sum + (p.rating || 0), 0) / totalResults
                : 0;
        const avgReviews =
            totalResults > 0
                ? results.reduce((sum: number, p: any) => sum + (p.reviews || 0), 0) / totalResults
                : 0;
        let isBetterThanCompetitors: any = null;
        if (domainResults.length > 0) {
            const domainRating = domainResults[0].rating || 0;
            const domainReviews = domainResults[0].reviews || 0;
            isBetterThanCompetitors = {
                rating: domainRating > avgRating,
                reviews: domainReviews > avgReviews,
            };
        }

        if (normalizedInputDomain) {
            const updateFilter = {
                userId: new (require('mongoose').Types.ObjectId)(userId),
                palabraClave: keyword,
                dominioFiltrado: normalizedInputDomain,
                dispositivo: 'google_local',
                buscador: 'google_maps',
                ...(location ? { location } : {})
            };

            const existing = await SearchResult.findOne(updateFilter);

            const now = new Date();
            const newSetData: any = {
                userId: new (require('mongoose').Types.ObjectId)(userId),
                buscador: 'google_maps',
                dispositivo: 'google_local',
                posicion: domainPosition,
                palabraClave: keyword,
                dominio: normalizedInputDomain,
                tipoBusqueda: 'palabraClave',
                dominioFiltrado: normalizedInputDomain,
                location: location || null,
                rating: domainResults.length > 0 ? domainResults[0].rating : null,
                reviews: domainResults.length > 0 ? domainResults[0].reviews : null,
                updatedAt: now
            };

            if (existing && existing.posicion !== undefined) {
                newSetData.posicionAnterior = existing.posicion;
                newSetData.fechaPosicionAnterior = existing.updatedAt || existing.createdAt;
            }

            const saved = await SearchResult.findOneAndUpdate(
                updateFilter,
                { $set: newSetData },
                { upsert: true, new: true }
            );
            console.log('💾 Resultado RankMap guardado/actualizado en BD:', saved._id);

            if (domainPosition > 0) {
                const comparison = await getComparisonData(
                    userId,
                    keyword,
                    normalizedInputDomain,
                    domainPosition,
                    now
                );
                await SearchResult.findByIdAndUpdate(saved._id, {
                    comparison24h: comparison.diff24,
                    comparison7d: comparison.diff7,
                    color24h: comparison.color24,
                    color7d: comparison.color7,
                });
            }
        }

        if (distanceFilter && domainResults.length > 0 && domainResults[0].lat != null && domainResults[0].lng != null) {
            const domainLocation = domainResults[0];
            const filteredResults = results.filter((place: any) => {
                if (place.lat == null || place.lng == null) return false;
                const distance = calculateDistance(
                    domainLocation.lat,
                    domainLocation.lng,
                    place.lat,
                    place.lng
                );
                return distance <= distanceFilter;
            });
            const recalculatedResults = filteredResults.map((place: any, index: number) => ({
                ...place,
                position: index + 1,
            }));
            const filteredTotal = recalculatedResults.length;
            const filteredDomainResults = normalizedInputDomain
                ? recalculatedResults.filter((p: any) => p.domain && p.domain === normalizedInputDomain)
                : [];
            const filteredDomainPosition = filteredDomainResults.length > 0 ? filteredDomainResults[0].position : 0;
            const filteredDomainPositionText =
                filteredDomainPosition > 0 ? `${filteredDomainPosition}/${filteredTotal}` : 'No encontrado';
            const filteredAvgPosition =
                filteredTotal > 0
                    ? recalculatedResults.reduce((sum: number, p: any) => sum + p.position, 0) / filteredTotal
                    : 0;
            const filteredAvgRating =
                filteredTotal > 0
                    ? recalculatedResults.reduce((sum: number, p: any) => sum + (p.rating || 0), 0) / filteredTotal
                    : 0;
            const filteredAvgReviews =
                filteredTotal > 0
                    ? recalculatedResults.reduce((sum: number, p: any) => sum + (p.reviews || 0), 0) / filteredTotal
                    : 0;
            let filteredIsBetterThanCompetitors: any = null;
            if (filteredDomainResults.length > 0) {
                const filteredDomainRating = filteredDomainResults[0].rating || 0;
                const filteredDomainReviews = filteredDomainResults[0].reviews || 0;
                filteredIsBetterThanCompetitors = {
                    rating: filteredDomainRating > filteredAvgRating,
                    reviews: filteredDomainReviews > filteredAvgReviews,
                };
            }
            return NextResponse.json({
                success: true,
                results: recalculatedResults,
                domainPosition: filteredDomainPosition,
                domainPositionText: filteredDomainPositionText,
                avgPosition: filteredAvgPosition,
                avgRating: filteredAvgRating,
                avgReviews: filteredAvgReviews,
                isBetterThanCompetitors: filteredIsBetterThanCompetitors,
                totalResults: filteredTotal,
                distanceFilter,
            });
        } else {
            return NextResponse.json({
                success: true,
                results,
                domainPosition,
                domainPositionText,
                avgPosition,
                avgRating,
                avgReviews,
                isBetterThanCompetitors,
                totalResults,
            });
        }
    } catch (error: any) {
        console.error('❌ Error en /api/rankmap:', error.response?.data || error.message || error);
        return NextResponse.json(
            { success: false, message: 'Error al consultar Google Maps.' },
            { status: 500 }
        );
    }
}
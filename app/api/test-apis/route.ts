// app/api/test-apis/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

const SERPAPI_API_KEY = process.env.SERPAPI_API_KEY;
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

function normalizeDomain(url: string): string | null {
    if (!url) return null;
    try {
        let fullUrl = url;
        if (url.startsWith('//')) {
            fullUrl = 'https:' + url;
        } else if (!url.startsWith('http')) {
            fullUrl = 'https://' + url;
        }
        const domain = new URL(fullUrl).hostname;
        return domain.replace(/^www\./, '').toLowerCase();
    } catch {
        console.warn('⚠️ URL inválida:', url);
        return null;
    }
}

export async function GET() {
    const keyword = 'abogado penalista';
    const location = 'Murcia, Spain';
    const targetDomain = 'alvaroprieto.es';

    console.log(`🔍 Buscando "${keyword}" en "${location}" para el dominio "${targetDomain}"`);

    try {
        console.log('\n📡 SerpAPI - Desktop');
        if (!SERPAPI_API_KEY) {
            console.warn('⚠️ SERPAPI_API_KEY no configurada');
        } else {
            const params = {
                api_key: SERPAPI_API_KEY,
                q: keyword,
                engine: 'google',
                location: 'Murcia, Murcia, Spain',
                google_domain: 'google.es',
                gl: 'es',
                hl: 'es',
                device: 'desktop',
                num: 100
            };
            const res = await axios.get('https://serpapi.com/search', { params });
            const data = res.data as any;
            let found = false;
            if (data.organic_results?.length) {
                for (let i = 0; i < data.organic_results.length; i++) {
                    const result = data.organic_results[i];
                    if (result.link) {
                        const domain = normalizeDomain(result.link);
                        console.log(`   [${i + 1}] ${result.link} → ${domain}`);
                        if (domain === targetDomain) {
                            console.log(`✅ ENCONTRADO en Desktop: posición ${i + 1}`);
                            found = true;
                            break;
                        }
                    }
                }
            }
            if (!found) console.log('❌ NO encontrado en Desktop');
        }

        console.log('\n📱 SerpAPI - Mobile (Buscando place_ids)');
        if (!SERPAPI_API_KEY) {
            console.warn('⚠️ SERPAPI_API_KEY no configurada');
            return NextResponse.json({ error: 'Falta SERPAPI_API_KEY' }, { status: 500 });
        }

        const paramsMobile = {
            api_key: SERPAPI_API_KEY,
            q: keyword,
            engine: 'google_local',
            location: 'Murcia, Murcia, Spain',
            google_domain: 'google.com',
            gl: 'es',
            hl: 'es',
            device: 'mobile',
            num: 100
        };

        const resMobile = await axios.get('https://serpapi.com/search', { params: paramsMobile });
        const dataMobile = resMobile.data as any;

        if (!dataMobile.local_results?.length) {
            console.log('❌ No se encontraron resultados locales.');
            return NextResponse.json({ success: true, message: 'No se encontraron resultados locales.' });
        }

        for (let i = 0; i < dataMobile.local_results.length; i++) {
            const result = dataMobile.local_results[i];
            if (result.position === undefined || !result.title) continue;

            console.log(`   [${result.position}] ${result.title} - ${result.address || 'Dirección no disponible'} (Place ID: ${result.place_id})`);

            if (!GOOGLE_PLACES_API_KEY) {
                console.warn('⚠️ GOOGLE_PLACES_API_KEY no configurada. No se puede obtener el dominio.');
                continue;
            }

            try {
                const detailsRes = await axios.get(`https://maps.googleapis.com/maps/api/place/details/json`, {
                    params: {
                        place_id: result.place_id,
                        fields: 'website',
                        key: GOOGLE_PLACES_API_KEY
                    }
                });

                const detailsData = detailsRes.data as any;
                if (detailsData.result?.website) {
                    const domain = new URL(detailsData.result.website).hostname.replace(/^www\./, '').toLowerCase();
                    console.log(`      -> Dominio encontrado: ${domain} (${detailsData.result.website})`);

                    if (domain === targetDomain) {
                        console.log(`✅ ENCONTRADO en Mobile (por dominio): posición ${result.position}`);
                        return NextResponse.json({ success: true, message: `Encontrado en posición ${result.position}` });
                    }
                } else {
                    console.log(`      -> Dominio no disponible para este lugar.`);
                }
            } catch (detailsError: any) {
                console.error(`      -> Error obteniendo detalles para place_id ${result.place_id}:`, detailsError.response?.data || detailsError.message);
            }
        }

        console.log('❌ NO encontrado en Mobile (por dominio).');

        return NextResponse.json({ success: true, message: 'Búsqueda completada (sin encontrar dominio objetivo).' });

    } catch (error: any) {
        console.error('\n💥 Error general:', error.response?.data || error.message);
        return NextResponse.json({ error: 'Error interno' }, { status: 500 });
    }
}
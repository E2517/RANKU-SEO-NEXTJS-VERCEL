import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/mongoose';
import SearchResult from '@/models/SearchResult';
import LocalVisibilityCampaign from '@/models/LocalVisibilityCampaign';
import LocalVisibilityResult from '@/models/LocalVisibilityResult';
import { Types } from 'mongoose';
import puppeteer from 'puppeteer';

function generateSEOExplanation(position: number, keyword: string, domain: string): string {
    if (position <= 0) {
        return `⚠️ El dominio <strong>${domain}</strong> no aparece en los primeros 100 resultados para la palabra clave <em>"${keyword}"</em>. Esto indica una visibilidad muy baja.`;
    } else if (position <= 3) {
        return `✅ Excelente posición. El dominio <strong>${domain}</strong> se encuentra en el <strong>top 3</strong> para <em>"${keyword}"</em>, lo que sugiere una fuerte autoridad temática.`;
    } else if (position <= 10) {
        return `👍 Buena visibilidad. Aparecer en el <strong>top 10</strong> para <em>"${keyword}"</em> indica que el dominio <strong>${domain}</strong> tiene relevancia.`;
    } else {
        return `🔍 El dominio <strong>${domain}</strong> aparece en la posición <strong>#${position}</strong> para <em>"${keyword}"</em>. Aunque está indexado, su visibilidad es limitada.`;
    }
}

export async function GET(req: NextRequest) {
    await connectDB();

    const cookieStore = await cookies();
    const userIdStr = cookieStore.get('user_id')?.value;

    if (!userIdStr) {
        return NextResponse.json({ success: false, message: 'No autenticado.' }, { status: 401 });
    }

    let userId;
    try {
        userId = new Types.ObjectId(userIdStr);
    } catch (e) {
        console.error(e)
        return NextResponse.json({ success: false, message: 'ID de usuario inválido.' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain') || '';
    const keyword = searchParams.get('keyword') || '';
    const devices = searchParams.getAll('device').map(d => d.trim()).filter(d => d !== '');

    if (!domain && !keyword) {
        return NextResponse.json({ success: false, message: 'Se requiere dominio o palabra clave.' }, { status: 400 });
    }

    try {
        const query: any = { userId, tipoBusqueda: 'palabraClave' };
        if (domain) query.dominio = domain;
        if (keyword) query.palabraClave = keyword;

        const allSeoResults = await SearchResult.find(query).sort({ createdAt: -1 }).limit(500);
        console.log('🔍 allSeoResults count:', allSeoResults.length);
        console.log('🔍 allSeoResults sample:', allSeoResults.slice(0, 3));

        if (allSeoResults.length === 0) {
            return NextResponse.json({ success: false, message: 'No se encontraron resultados.' }, { status: 404 });
        }

        let filteredSeoResults = [...allSeoResults];
        if (devices.length > 0) {
            filteredSeoResults = allSeoResults.filter(r => r.dispositivo && devices.includes(r.dispositivo));
        }
        console.log('📱 filteredSeoResults count:', filteredSeoResults.length);
        console.log('📱 filteredSeoResults devices:', [...new Set(filteredSeoResults.map(r => r.dispositivo))]);

        const deviceOrder: Record<string, number> = { 'desktop': 1, 'mobile': 2, 'google_local': 3 };
        filteredSeoResults.sort((a, b) => {
            const orderA = deviceOrder[a.dispositivo ?? ''] ?? 99;
            const orderB = deviceOrder[b.dispositivo ?? ''] ?? 99;
            if (orderA !== orderB) return orderA - orderB;
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
        });

        const uniqueSeoResults: any[] = [];
        const seenKeys = new Set<string>();
        for (const r of filteredSeoResults) {
            const key = `${r.dispositivo}-${r.buscador}-${r.location || 'null'}`;
            if (!seenKeys.has(key)) {
                seenKeys.add(key);
                uniqueSeoResults.push(r);
            }
        }
        console.log('✅ uniqueSeoResults count:', uniqueSeoResults.length);
        console.log('✅ uniqueSeoResults sample:', uniqueSeoResults.slice(0, 3));

        const serpResults = uniqueSeoResults.filter(r => r.dispositivo === 'desktop' || r.dispositivo === 'mobile');
        const googleLocalResults = uniqueSeoResults.filter(r => r.dispositivo === 'google_local' && r.buscador === 'google_local');
        const rankMapResults = uniqueSeoResults.filter(r => r.buscador === 'google_maps');

        console.log('📊 SERP results:', serpResults.length);
        console.log('📊 Google Local results:', googleLocalResults.length);
        console.log('📊 RankMap results:', rankMapResults.length);

        let mostRecentGoogleLocal = null;
        if (googleLocalResults.length > 0) {
            mostRecentGoogleLocal = googleLocalResults[0];
        }

        let scanMapResults: any[] = [];
        let latestScanMapCampaign = null;
        if (domain) {
            const campaignQuery: any = { userId, domain };
            if (keyword) campaignQuery.keyword = keyword;
            latestScanMapCampaign = await LocalVisibilityCampaign.findOne(campaignQuery).sort({ createdAt: -1 });
            if (latestScanMapCampaign) {
                scanMapResults = await LocalVisibilityResult.find({ campaignId: latestScanMapCampaign._id });
            }
        }
        console.log('🗺️ ScanMap campaign found:', !!latestScanMapCampaign);
        console.log('🗺️ ScanMap results count:', scanMapResults.length);

        let businessAddress = '';
        if (mostRecentGoogleLocal) {
            businessAddress = mostRecentGoogleLocal.location || 'N/A';
        } else if (latestScanMapCampaign) {
            businessAddress = latestScanMapCampaign.centerLocation?.name || 'N/A';
        } else if (rankMapResults.length > 0) {
            businessAddress = rankMapResults[0].location || 'N/A';
        }

        const headerHtml = `
        <div style="padding: 1.5rem; text-align: center; margin-bottom: 2rem;">
            <h1 style="margin: 0; font-size: 2rem;">📄 Informe SEO – RANKU</h1>
            <p style="margin: 0.5rem 0 0; font-size: 1.1rem;">Generado el ${new Date().toLocaleDateString('es-ES')}</p>
            <div style="display: flex; justify-content: center; gap: 2rem; margin-top: 1rem; font-size: 1.1rem;">
                <span><strong>Dominio:</strong> ${domain || 'Todos'}</span>
                <span><strong>Dirección Negocio:</strong> ${businessAddress}</span>
            </div>
        </div>
        `;

        let serpHtml = '';
        for (const r of serpResults) {
            const positions = [r.posicion].filter(p => p > 0);
            const avgPos = positions.length > 0 ? (positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(1) : 'N/A';
            const bestPos = positions.length > 0 ? Math.min(...positions) : 'N/A';
            serpHtml += `
            <div style="margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 0.5rem;">
                <h3 style="color: #6c4ab6; margin-bottom: 0.5rem;">${r.dispositivo} — ${r.location || 'Global'}</h3>
                <p><strong>Palabra clave:</strong> ${r.palabraClave}</p>
                <p><strong>Dominio:</strong> ${r.dominio}</p>
                <p><strong>Mejor posición:</strong> #${bestPos}</p>
                <p><strong>Posición media:</strong> #${avgPos}</p>
                <div style="margin-top: 0.5rem; padding: 0.75rem; background: #eef7ff; border-left: 3px solid #6c4ab6;">
                    <strong>Análisis:</strong><br>
                    ${generateSEOExplanation(bestPos === 'N/A' ? 0 : bestPos, r.palabraClave, r.dominio)}
                </div>
            </div>
            `;
        }

        let googleLocalHtml = '';
        if (mostRecentGoogleLocal) {
            const positions = [mostRecentGoogleLocal.posicion].filter(p => p > 0);
            const avgPos = positions.length > 0 ? (positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(1) : 'N/A';
            const bestPos = positions.length > 0 ? Math.min(...positions) : 'N/A';
            let ratingDisplay = '';
            if (mostRecentGoogleLocal.rating !== null) {
                ratingDisplay = `<br>⭐ ${mostRecentGoogleLocal.rating} (${mostRecentGoogleLocal.reviews || 'N/A'})`;
            }
            googleLocalHtml = `
            <div style="margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 0.5rem;">
                <h3 style="color: #6c4ab6; margin-bottom: 0.5rem;">Google Local — ${mostRecentGoogleLocal.location || 'Global'}${ratingDisplay}</h3>
                <p><strong>Palabra clave:</strong> ${mostRecentGoogleLocal.palabraClave}</p>
                <p><strong>Dominio:</strong> ${mostRecentGoogleLocal.dominio}</p>
                <p><strong>Mejor posición:</strong> #${bestPos}</p>
                <p><strong>Posición media:</strong> #${avgPos}</p>
                <div style="margin-top: 0.5rem; padding: 0.75rem; background: #eef7ff; border-left: 3px solid #6c4ab6;">
                    <strong>Análisis:</strong><br>
                    ${generateSEOExplanation(bestPos === 'N/A' ? 0 : bestPos, mostRecentGoogleLocal.palabraClave, mostRecentGoogleLocal.dominio)}
                </div>
            </div>
            `;
        }

        let rankMapHtml = '<p>❌ No se han encontrado resultados de RankMap (Google Maps) para esta combinación.</p>';
        if (rankMapResults.length > 0) {
            const found = rankMapResults.filter(r => r.posicion > 0);
            if (found.length > 0) {
                const positions = found.map(r => r.posicion);
                const best = Math.min(...positions);
                const worst = Math.max(...positions);
                const avg = (positions.reduce((a, b) => a + b, 0) / positions.length).toFixed(1);
                rankMapHtml = `
                <p>✅ Resultados de RankMap (Google Maps) encontrados en <strong>${rankMapResults.length}</strong> ubicaciones.</p>
                <ul>
                    <li><strong>Mejor posición:</strong> #${best}</li>
                    <li><strong>Posición media:</strong> #${avg}</li>
                    <li><strong>Peor posición:</strong> #${worst}</li>
                    <li><strong>Aparece en:</strong> ${found.length} de ${rankMapResults.length} ubicaciones</li>
                </ul>
                <p><em>Los datos de tu última busqueda en la sección RankMap.</em></p>
                `;
            } else {
                rankMapHtml = '<p>⚠️ Se encontraron resultados de RankMap, pero ninguno contiene una posición válida (>0).</p>';
            }
        }

        let scanMapHtml = '<p>❌ No se ha ejecutado ninguna simulación ScanMap para esta combinación.</p>';
        if (scanMapResults.length > 0) {
            const found = scanMapResults.filter(r => r.ranking > 0);
            if (found.length > 0) {
                const rankings = found.map(r => r.ranking);
                const best = Math.min(...rankings);
                const worst = Math.max(...rankings);
                const avg = (rankings.reduce((a, b) => a + b, 0) / rankings.length).toFixed(1);
                scanMapHtml = `
                <p>✅ Simulación completada con <strong>${scanMapResults.length}</strong> puntos.</p>
                <ul>
                    <li><strong>Mejor posición:</strong> #${best}</li>
                    <li><strong>Posición media:</strong> #${avg}</li>
                    <li><strong>Peor posición:</strong> #${worst}</li>
                    <li><strong>Aparece en:</strong> ${found.length} de ${scanMapResults.length} ubicaciones</li>
                </ul>
                <p><em>Los datos de tu última busqueda en la sección ScanMap.</em></p>
                `;
            } else {
                scanMapHtml = '<p>⚠️ Se encontraron resultados de ScanMap, pero ninguno contiene un ranking válido (>0).</p>';
            }
        }

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Informe RANKU</title>
                <style>
                    body {
                        font-family: 'Inter', Arial, sans-serif;
                        margin: 2rem;
                        background: white;
                        color: #2d2d2d;
                    }
                    .header {
                        text-align: center;
                        margin-bottom: 2rem;
                        border-bottom: 2px solid #6c4ab6;
                        padding-bottom: 1rem;
                    }
                    h1 {
                        color: #6c4ab6;
                    }
                    h2 {
                        color: #6c4ab6;
                        margin: 1.5rem 0 1rem;
                    }
                    h3 {
                        color: #4a30a5;
                    }
                    ul {
                        padding-left: 1.5rem;
                    }
                    .footer {
                        margin-top: 3rem;
                        text-align: center;
                        color: #666;
                        font-size: 0.9rem;
                    }
                    .page-break {
                        page-break-before: always;
                    }
                    @media print {
                        .page-break {
                            page-break-before: always;
                        }
                    }
                </style>
            </head>
            <body>
                ${headerHtml}
                ${serpHtml ? `<h2>🔍 SERP – Google Búsqueda</h2>${serpHtml}` : ''}
                <div class="page-break"></div>
                ${googleLocalHtml ? `<h2>📍 Google Local</h2>${googleLocalHtml}` : ''}
                <h2>🗺️ RankMap – Google Maps</h2>
                ${rankMapHtml}
                <h2>🥷 ScanMap – Visibilidad Local</h2>
                ${scanMapHtml}
                <div class="footer">
                    <p>Informe generado con <strong>RANKU.ES | SEO Local </strong> • Datos actualizados al ${new Date().toLocaleDateString('es-ES')}</p>
                </div>
            </body>
            </html>
        `;

        let browser;
        if (process.env.VERCEL) {
            const chromium = require('@sparticuz/chromium');
            browser = await puppeteer.launch({
                args: [
                    ...chromium.args,
                    '--disable-gpu',
                    '--disable-dev-shm-usage',
                    '--disable-setuid-sandbox',
                    '--no-sandbox',
                    '--disable-web-security',
                ],
                executablePath: await chromium.executablePath(),
                headless: true,
            });
        } else {
            browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--disable-gpu',
                    '--disable-dev-shm-usage',
                    '--disable-setuid-sandbox',
                    '--no-sandbox',
                    '--disable-web-security',
                ],
            });
        }

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
        const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
        await browser.close();

        const headers = new Headers();
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Disposition', `attachment; filename=ranku_informe_${domain || 'todos'}_${keyword || 'todas'}.pdf`);

        return new NextResponse(pdfBuffer as any as ArrayBuffer, { headers });
    } catch (error) {
        console.error('Error al generar PDF:', error);
        return NextResponse.json({ success: false, message: 'Error interno al generar el informe.' }, { status: 500 });
    }
}
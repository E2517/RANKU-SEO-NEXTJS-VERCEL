// import { NextResponse } from 'next/server';
// import { cookies } from 'next/headers';
// import User from '@/models/User';
// import SearchResult from '@/models/SearchResult';
// import { connectDB } from '@/lib/mongoose';
// import { normalizeDomain, getKeywordLimit } from '@/lib/utils';

// export async function POST(req: Request) {
//     await connectDB();

//     const cookieStore = await cookies();
//     const userId = cookieStore.get('user_id')?.value;

//     if (!userId) {
//         return NextResponse.json({ success: false, message: 'No autenticado.' }, { status: 401 });
//     }

//     const user = await User.findById(userId);
//     if (!user) {
//         return NextResponse.json({ success: false, message: 'Usuario no encontrado.' }, { status: 404 });
//     }

//     const limit = getKeywordLimit(user.subscriptionPlan);
//     if (limit === null) {
//         return NextResponse.json({ success: false, message: 'Plan no válido.' }, { status: 403 });
//     }

//     const uniqueCombinations = await SearchResult.aggregate([
//         {
//             $match: {
//                 userId: user._id,
//                 tipoBusqueda: 'palabraClave',
//                 palabraClave: { $nin: [null, ''] },
//                 dominioFiltrado: { $nin: [null, ''] },
//                 dispositivo: { $nin: [null, ''] }
//             }
//         },
//         {
//             $group: {
//                 _id: {
//                     palabraClave: '$palabraClave',
//                     dominioFiltrado: '$dominioFiltrado',
//                     dispositivo: '$dispositivo'
//                 }
//             }
//         }
//     ]);

//     const used = uniqueCombinations.length;
//     if (used >= limit) {
//         return NextResponse.json(
//             { success: false, message: `Has alcanzado el límite de ${limit} keywords únicas para tu plan.` },
//             { status: 403 }
//         );
//     }

//     const body = await req.json();
//     const { keywords, domain, location, searchEngine, device } = body;

//     if (!keywords || !domain) {
//         return NextResponse.json({ success: false, message: 'Faltan palabras clave o dominio.' }, { status: 400 });
//     }

//     const keywordList = keywords
//         .split(/[\n,]+/)
//         .map((k: string) => k.trim())
//         .filter((k: string) => k.length > 0);

//     if (keywordList.length === 0) {
//         return NextResponse.json({ success: false, message: 'No se encontraron palabras clave válidas.' }, { status: 400 });
//     }

//     const normalizedDomain = normalizeDomain(domain);
//     if (!normalizedDomain) {
//         return NextResponse.json({ success: false, message: 'Dominio inválido.' }, { status: 400 });
//     }

//     const devices = Array.isArray(device) ? device : ['desktop'];

//     const documents = [];
//     for (const keyword of keywordList) {
//         for (const dispositivo of devices) {
//             documents.push({
//                 userId: user._id,
//                 buscador: searchEngine,
//                 dispositivo,
//                 palabraClave: keyword,
//                 dominio: normalizedDomain,
//                 dominioFiltrado: normalizedDomain,
//                 location,
//                 tipoBusqueda: 'palabraClave'
//             });
//         }
//     }

//     if (documents.length > 0) {
//         await SearchResult.insertMany(documents);
//     }

//     return NextResponse.json({
//         success: true,
//         message: 'Búsqueda guardada correctamente.'
//     });
// }
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import SearchResult from '@/models/SearchResult';
import { connectDB } from '@/lib/mongoose';

export async function GET() {
    console.log('Iniciando GET en /api/historial-options-domains');
    await connectDB();

    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    console.log('user_id desde cookies:', userId);

    if (!userId) {
        console.log('Usuario no autenticado: user_id ausente');
        return NextResponse.json({ success: false, message: 'No autenticado.' }, { status: 401 });
    }

    try {
        console.log('Consultando dominios para userId:', userId);
        const domains = (
            await SearchResult.distinct('dominio', {
                userId,
                dominio: { $nin: [null, ''] }
            })
        ).filter((d) => d && d.length > 0);
        console.log('Dominios encontrados:', domains);

        return NextResponse.json({ success: true, domains });
    } catch (err) {
        console.error('Error al cargar opciones de historial de dominios:', err);
        return NextResponse.json({ success: false, message: 'Error interno del servidor.' }, { status: 500 });
    }
}
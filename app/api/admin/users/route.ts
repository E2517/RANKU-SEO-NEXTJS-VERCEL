import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/mongoose';
import { cookies } from 'next/headers';

export async function GET() {
    await connectDB();

    const cookieStore = await cookies();
    const userId = cookieStore.get('user_id')?.value;
    if (!userId) {
        return NextResponse.json({ success: false, message: 'No autenticado.' }, { status: 401 });
    }

    const user = await User.findById(userId);
    if (!user || user.role !== 'admin') {
        return NextResponse.json({ success: false, message: 'Acceso denegado.' }, { status: 403 });
    }

    try {
        const users = await User.find({}).select('email subscriptionPlan subscriptionStartDate subscriptionEndDate isSubscriptionCanceled createdAt limitKeywords limitScanMap');
        return NextResponse.json({ success: true, users });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json({ success: false, message: 'Error interno del servidor.' }, { status: 500 });
    }
}
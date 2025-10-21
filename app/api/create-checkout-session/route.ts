import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import User from '@/models/User';
import Promotion from '@/models/Promotion';
import { connectDB } from '@/lib/mongoose';
import { cookies } from 'next/headers';

const PLAN_PRICE_IDS = {
    Basico: process.env.STRIPE_BASICO_PRICE_ID,
    Pro: process.env.STRIPE_PRO_PRICE_ID,
    Ultra: process.env.STRIPE_ULTRA_PRICE_ID,
} as const;

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

    const { plan } = await req.json();
    const priceId = PLAN_PRICE_IDS[plan as keyof typeof PLAN_PRICE_IDS];
    if (!priceId) {
        return NextResponse.json({ success: false, message: 'Plan no válido.' }, { status: 400 });
    }

    try {
        let trialPeriodDays: number | undefined = undefined;
        const promotion = await Promotion.findOne({ type: 'trial' });
        if (promotion?.isActive && promotion.trialPeriodDays > 0) {
            trialPeriodDays = promotion.trialPeriodDays;
        }

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            subscription_data: trialPeriodDays ? { trial_period_days: trialPeriodDays } : {},
            success_url: `${process.env.APP_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.APP_URL}/profile`,
            client_reference_id: userId,
            metadata: { plan },
        });

        return NextResponse.json({ url: session.url });
    } catch (error) {
        console.error('Error en create-checkout-session:', error);
        const message = error instanceof Error ? error.message : 'Error interno del servidor';
        return NextResponse.json({ success: false, error: message }, { status: 500 });
    }
}
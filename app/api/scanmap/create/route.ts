import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongoose';
import User from '@/models/User';
import LocalVisibilityCampaign from '@/models/LocalVisibilityCampaign';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function geocodeAddress(address: string) {
    const url = new URL('https://maps.googleapis.com/maps/api/geocode/json');
    url.searchParams.set('address', address);
    url.searchParams.set('key', process.env.GOOGLE_MAPS_API_KEY as string);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (data.status !== 'OK' || data.results.length === 0) {
        throw new Error('Dirección no encontrada');
    }
    const { lat, lng } = data.results[0].geometry.location;
    return { lat, lng };
}

function getScanMapLimit(subscriptionPlan: string): number {
    if (subscriptionPlan === 'Basico') return 5;
    if (subscriptionPlan === 'Pro') return 10;
    if (subscriptionPlan === 'Ultra') return 15;
    return 0;
}

function getStartOfCurrentBillingCycle(user: any): Date {
    if (user.subscriptionId && !user.isSubscriptionCanceled && user.subscriptionStartDate) {
        return new Date(user.subscriptionStartDate);
    }
    return new Date(user.createdAt || Date.now());
}

async function checkScanMapLimit(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new Error('Usuario no encontrado');
    const baseLimit = getScanMapLimit(user.subscriptionPlan);
    const cycleStart = getStartOfCurrentBillingCycle(user);
    const usedThisCycle = await LocalVisibilityCampaign.countDocuments({
        userId,
        createdAt: { $gte: cycleStart }
    });
    if (usedThisCycle < baseLimit) return true;
    const totalUsedEver = await LocalVisibilityCampaign.countDocuments({ userId });
    const userCreatedAt = user.createdAt ? new Date(user.createdAt) : new Date(0);
    const baseLimitEver = await LocalVisibilityCampaign.countDocuments({
        userId,
        createdAt: { $gte: userCreatedAt }
    });
    const creditsUsed = Math.max(0, totalUsedEver - baseLimitEver);
    if (creditsUsed < user.limitScanMap) return true;
    return false;
}

export async function POST(req: NextRequest) {
    const cookieStore = await cookies();
    const userIdFromCookie = cookieStore.get('user_id')?.value;
    if (!userIdFromCookie) {
        return NextResponse.json({ success: false, message: 'No autenticado.' }, { status: 401 });
    }
    await connectDB();
    const user = await User.findById(userIdFromCookie);
    if (!user) {
        return NextResponse.json({ success: false, message: 'Usuario no encontrado.' }, { status: 404 });
    }
    const hasCredits = await checkScanMapLimit(userIdFromCookie);
    if (!hasCredits) {
        return NextResponse.json({ success: false, message: 'Límite de ScanMap alcanzado.' }, { status: 403 });
    }
    const body = await req.json();
    const { keyword, domain, address, maxRadiusMeters = 1000, stepMeters = 500 } = body;
    if (!keyword || !domain || !address) {
        return NextResponse.json({ success: false, message: 'Faltan parámetros.' }, { status: 400 });
    }
    try {
        const { lat, lng } = await geocodeAddress(address);
        const campaign = new LocalVisibilityCampaign({
            userId: userIdFromCookie,
            keyword,
            domain,
            centerLocation: { name: address, lat, lng },
            maxRadiusMeters,
            stepMeters,
            status: 'processing'
        });
        await campaign.save();
        const campaignId = campaign._id.toString();
        console.log('🚀 ScanMap iniciado. ID:', campaignId, 'Dominio:', domain, 'Keyword:', keyword);

        fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/scanmap/process`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ campaignId, keyword, domain, lat, lng, maxRadiusMeters, stepMeters })
        }).catch(console.error);

        return NextResponse.json({ success: true, campaignId });
    } catch (error: any) {
        console.error('Error al crear ScanMap:', error.message);
        return NextResponse.json({ success: false, message: error.message || 'Error interno.' }, { status: 500 });
    }
}
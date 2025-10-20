import { NextResponse } from 'next/server';
import User from '@/models/User';
import { connectDB } from '@/lib/mongoose';
import { getKeywordLimit } from '@/lib/utils';

// Configura un cron job diario (por ejemplo, con Vercel Cron, Railway, o un servidor) que llame a GET /api/reset-keyword-limits
export async function GET() {
    await connectDB();

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const usersToUpdate = await User.find({
        subscriptionPlan: { $ne: 'Gratuito' },
        isSubscriptionCanceled: false,
        subscriptionEndDate: { $gte: today },
    });

    for (const user of usersToUpdate) {
        const newLimit = getKeywordLimit(user.subscriptionPlan);
        user.limitKeywords = newLimit;
        await user.save();
    }

    return NextResponse.json({ success: true, updated: usersToUpdate.length });
}
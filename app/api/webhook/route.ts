import { NextRequest } from 'next/server';
import { stripe } from '@/lib/stripe';
import User from '@/models/User';
import { connectDB } from '@/lib/mongoose';
import { Stripe } from 'stripe';
import { getKeywordLimit, getScanMapBaseLimit } from '@/lib/utils';

const relevantEvents = new Set([
  'checkout.session.completed',
  'invoice.payment_succeeded',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

export async function POST(req: NextRequest) {
  await connectDB();

  const body = await req.text();
  const sig = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!sig || !webhookSecret) {
    return new Response('Webhook secret missing', { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err: any) {
    console.error(`Webhook Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  if (!relevantEvents.has(event.type)) {
    return new Response(null, { status: 200 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        if (!userId) break;

        if (session.mode === 'subscription') {
          const plan = session.metadata?.plan || 'Basico';
          const customerId = session.customer as string;

          // Obtener la suscripción directamente usando el ID de la sesión
          const subscriptionId = session.subscription as string;
          if (!subscriptionId) {
            console.error('No subscription ID found in session');
            break;
          }

          const sub = await stripe.subscriptions.retrieve(subscriptionId);

          // Acceder a las propiedades con seguridad de tipo
          const startDate = new Date((sub as any).current_period_start * 1000);
          const endDate = new Date((sub as any).current_period_end * 1000);

          const keywordLimit = getKeywordLimit(plan);
          const scanMapBase = getScanMapBaseLimit(plan);

          await User.findByIdAndUpdate(userId, {
            stripeCustomerId: customerId,
            subscriptionId: sub.id,
            subscriptionPlan: plan,
            subscriptionStartDate: startDate,
            subscriptionEndDate: endDate,
            isSubscriptionCanceled: false,
            limitKeywords: keywordLimit,
            limitScanMap: scanMapBase,
          });
        } else if (
          session.mode === 'payment' &&
          session.metadata?.type === 'scanmap_credits'
        ) {
          const credits = parseInt(session.metadata.credits!, 10);
          if (!isNaN(credits) && credits > 0) {
            await User.findByIdAndUpdate(userId, { $inc: { limitScanMap: credits } });
          }
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;

        // Acceder a subscription con verificación de tipo
        const subscriptionId = typeof (invoice as any).subscription === 'string'
          ? (invoice as any).subscription
          : null;

        if (!subscriptionId) {
          console.error('No subscription ID found in invoice');
          break;
        }

        const sub = await stripe.subscriptions.retrieve(subscriptionId);
        const endDate = new Date((sub as any).current_period_end * 1000);

        await User.findOneAndUpdate(
          { subscriptionId },
          { subscriptionEndDate: endDate }
        );
        break;
      }

      case 'customer.subscription.updated': {
        const sub = event.data.object as Stripe.Subscription;
        const subscriptionId = sub.id;
        const cancelAtPeriodEnd = sub.cancel_at_period_end;

        let newPlan: string | null = null;
        if (sub.items.data.length > 0) {
          const priceId = sub.items.data[0].price.id;
          if (priceId === process.env.STRIPE_BASICO_PRICE_ID) newPlan = 'Basico';
          else if (priceId === process.env.STRIPE_PRO_PRICE_ID) newPlan = 'Pro';
          else if (priceId === process.env.STRIPE_ULTRA_PRICE_ID) newPlan = 'Ultra';
        }

        const update: any = { isSubscriptionCanceled: cancelAtPeriodEnd };
        if (newPlan) {
          update.subscriptionPlan = newPlan;
          update.limitKeywords = getKeywordLimit(newPlan);
          update.limitScanMap = getScanMapBaseLimit(newPlan);
        }

        await User.findOneAndUpdate({ subscriptionId }, update);
        break;
      }

      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        const subscriptionId = sub.id;
        await User.findOneAndUpdate(
          { subscriptionId },
          {
            subscriptionId: null,
            subscriptionPlan: 'Gratuito',
            subscriptionStartDate: null,
            subscriptionEndDate: null,
            isSubscriptionCanceled: false,
            limitKeywords: 0,
            limitScanMap: 0,
          }
        );
        break;
      }
    }

    return new Response(null, { status: 200 });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return new Response('Webhook handler failed', { status: 500 });
  }
}

//export const runtime = 'edge';
export const runtime = 'nodejs';

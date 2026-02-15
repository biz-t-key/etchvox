import { NextRequest, NextResponse } from 'next/server';
import { validateEvent } from '@polar-sh/sdk/webhooks';
import { POLAR_CONFIG } from '@/config/features';
import { updateSubscription } from '@/lib/subscription';
import { unlockResult } from '@/lib/storage';

export async function POST(request: NextRequest) {
    const rawBody = await request.text();
    const signature = request.headers.get('webhook-signature');

    if (!signature) {
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
    }

    try {
        // Validate the webhook event
        const event = validateEvent(rawBody, { 'webhook-signature': signature }, POLAR_CONFIG.WEBHOOK_SECRET);

        console.log(`[Polar Webhook] Received: ${event.type}`);

        // Map Polar events to our business logic
        switch (event.type) {
            case 'order.created':
                await handleOrderCreated(event.data);
                break;

            case 'subscription.created':
            case 'subscription.updated':
            case 'subscription.revoked':
                await handleSubscriptionUpdated(event.data);
                break;

            default:
                console.log(`[Polar Webhook] Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Polar Webhook Error:', error.message);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 400 });
    }
}

async function handleOrderCreated(order: any) {
    // Extract metadata
    const resultId = order.metadata?.result_id || order.custom_field_data?.result_id;
    const email = order.customer?.email;

    if (resultId) {
        await unlockResult(resultId, email);
        console.log(`✓ Result ${resultId} unlocked via Polar.sh order (Email: ${email || 'none'})`);
    } else {
        console.warn('[Polar Webhook] Order created without result_id in metadata');
    }
}

async function handleSubscriptionUpdated(subscription: any) {
    // Extract userHash from metadata
    const userHash = subscription.metadata?.user_hash || subscription.custom_field_data?.user_hash;

    if (!userHash) {
        console.error('[Polar Webhook] Subscription update missing user_hash');
        return;
    }

    // Map product ID to plan
    let plan: 'weekly' | 'monthly' = 'monthly';
    if (subscription.product_id === POLAR_CONFIG.WEEKLY_PRODUCT_ID) {
        plan = 'weekly';
    }

    // Calculate expiration
    const expiresAt = new Date(subscription.current_period_end || Date.now() + 30 * 24 * 60 * 60 * 1000);

    await updateSubscription(userHash, {
        plan,
        expiresAt,
        polarId: subscription.id,
        customerEmail: subscription.customer?.email || '',
        status: subscription.status === 'active' ? 'active' : 'cancelled'
    });

    console.log(`✓ Subscription updated for ${userHash} (${plan}) - Status: ${subscription.status}`);
}

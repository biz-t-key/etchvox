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
            case 'order.updated':
                // Polar sends order.updated when an order is refunded
                if (event.data.status === 'refunded' || event.data.status === 'partially_refunded') {
                    await handleOrderRefunded(event.data);
                }
                break;
            case 'refund.created':
                await handleOrderRefunded(event.data);
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
        // Only store hash now, no more plaintext emails
        const emailHash = email ? require('@/lib/auth').hashEmail(email) : null;
        await unlockResult(resultId, emailHash);
        console.log(`✓ Result ${resultId} unlocked via Polar.sh order (Hash stored)`);
    } else {
        console.warn('[Polar Webhook] Order created without result_id in metadata');
    }
}

async function handleOrderRefunded(data: any) {
    // Polar order.updated and refund.created data shapes vary slightly
    const order = data.order || data;
    const resultId = order.metadata?.result_id || order.custom_field_data?.result_id;

    if (resultId) {
        if (resultId === 'mirror') {
            // Handle Mirror Subscription Revocation
            const userHash = order.metadata?.user_hash || order.custom_field_data?.user_hash;
            if (userHash) {
                const { revokeSubscription } = await import('@/lib/subscription');
                await revokeSubscription(userHash);
                console.log(`⚠ Mirror Subscription REVOKED for ${userHash} due to Polar.sh refund`);
            } else {
                console.warn('[Polar Webhook] Refund for mirror but no user_hash in metadata');
            }
        } else {
            // Handle Single Report Locking
            const { lockResult } = await import('@/lib/storage');
            await lockResult(resultId);
            console.log(`⚠ Result ${resultId} LOCKED due to Polar.sh refund`);
        }
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
    } else if (subscription.product_id === POLAR_CONFIG.UPGRADE_PRODUCT_ID) {
        plan = 'monthly'; // Upgrade results in monthly status
    }

    // Calculate expiration
    const expiresAt = new Date(subscription.current_period_end || Date.now() + 30 * 24 * 60 * 60 * 1000);

    await updateSubscription(userHash, {
        plan,
        expiresAt,
        polarId: subscription.id,
        customerEmailHash: subscription.customer?.email ? require('@/lib/auth').hashEmail(subscription.customer.email) : undefined,
        status: subscription.status === 'active' ? 'active' : 'cancelled'
    });

    console.log(`✓ Subscription updated for ${userHash} (${plan}) - Status: ${subscription.status}`);
}

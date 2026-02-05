// API Route: Lemon Squeezy Webhook Handler
// POST /api/webhook/lemonsqueezy

import { NextRequest, NextResponse } from 'next/server';
import { createHmac } from 'crypto';
import { LEMONSQUEEZY_CONFIG } from '@/config/features';
import { updateSubscription } from '@/lib/subscription';
import { unlockResult } from '@/lib/storage';

// Verify webhook signature
function verifySignature(payload: string, signature: string): boolean {
    const secret = LEMONSQUEEZY_CONFIG.WEBHOOK_SECRET;
    if (!secret) return false;

    const hmac = createHmac('sha256', secret);
    const digest = hmac.update(payload).digest('hex');

    return digest === signature;
}

export async function POST(request: NextRequest) {
    try {
        const signature = request.headers.get('x-signature');
        const rawBody = await request.text();

        // Verify signature
        if (!signature || !verifySignature(rawBody, signature)) {
            console.error('Invalid webhook signature');
            return NextResponse.json(
                { error: 'Invalid signature' },
                { status: 401 }
            );
        }

        const event = JSON.parse(rawBody);
        const eventName = event.meta.event_name;
        const data = event.data;

        console.log(`[Webhook] Received: ${eventName}`);

        // Extract userHash and resultId from custom data
        const customData = event.meta.custom_data;
        const userHash = customData?.user_hash || data.attributes.first_order_item?.product_name;
        const resultId = customData?.result_id;

        if (!userHash && !resultId) {
            console.error('No userHash or resultId found in webhook payload');
            return NextResponse.json(
                { error: 'Missing identifiers' },
                { status: 400 }
            );
        }

        // Handle different Lemon Squeezy events
        switch (eventName) {
            case 'order_created':
                if (resultId) await handleOrderCreated(data, resultId);
                break;

            case 'subscription_created':
            case 'subscription_updated':
                if (userHash) await handleSubscriptionUpdate(data, userHash);
                break;

            case 'subscription_cancelled':
            case 'subscription_expired':
                if (userHash) await handleSubscriptionCancellation(data, userHash);
                break;

            default:
                console.log(`[Webhook] Unhandled event: ${eventName}`);
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Webhook error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

async function handleSubscriptionUpdate(data: any, userHash: string) {
    const attributes = data.attributes;
    const variantId = attributes.variant_id?.toString();

    // Determine plan from variant ID
    let plan: 'weekly' | 'monthly' = 'monthly';
    if (variantId === LEMONSQUEEZY_CONFIG.WEEKLY_VARIANT_ID) {
        plan = 'weekly';
    }

    // Calculate expiration date
    const renewsAt = new Date(attributes.renews_at);

    await updateSubscription(userHash, {
        plan,
        expiresAt: renewsAt,
        lemonSqueezyId: data.id,
        customerEmail: attributes.user_email,
        status: 'active'
    });

    console.log(`✓ Subscription activated for ${userHash} (${plan})`);
}

async function handleSubscriptionCancellation(data: any, userHash: string) {
    const attributes = data.attributes;
    const endsAt = new Date(attributes.ends_at || Date.now());

    await updateSubscription(userHash, {
        plan: 'monthly', // Preserve existing plan
        expiresAt: endsAt,
        lemonSqueezyId: data.id,
        customerEmail: attributes.user_email,
        status: 'cancelled'
    });

    console.log(`✓ Subscription cancelled for ${userHash}`);
}

async function handleOrderCreated(data: any, resultId: string) {
    const attributes = data.attributes;

    // Check if it's a successful payment
    if (attributes.status === 'paid') {
        await unlockResult(resultId);
        console.log(`✓ Result ${resultId} unlocked via one-time purchase`);
    } else {
        console.log(`[Webhook] Order ${data.id} for result ${resultId} has status: ${attributes.status}`);
    }
}

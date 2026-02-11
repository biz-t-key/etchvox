import { NextRequest, NextResponse } from 'next/server';
import { Polar } from '@polar-sh/sdk';
import { POLAR_CONFIG } from '@/config/features';

const polar = new Polar({
    accessToken: POLAR_CONFIG.ACCESS_TOKEN,
    server: 'production', // Use 'sandbox' for testing if needed
});

export async function POST(request: NextRequest) {
    try {
        const { userHash, resultId, plan } = await request.json();

        if (!plan) {
            return NextResponse.json({ error: 'Missing plan' }, { status: 400 });
        }

        const validPlans = ['weekly', 'monthly', 'solo', 'couple', 'spy'];
        if (!validPlans.includes(plan)) {
            return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
        }

        // Select Product ID based on plan
        let productId = '';
        switch (plan) {
            case 'weekly':
                productId = POLAR_CONFIG.WEEKLY_PRODUCT_ID;
                break;
            case 'monthly':
                productId = POLAR_CONFIG.MONTHLY_PRODUCT_ID;
                break;
            case 'solo':
                productId = POLAR_CONFIG.SOLO_PRODUCT_ID;
                break;
            case 'couple':
                productId = POLAR_CONFIG.COUPLE_PRODUCT_ID;
                break;
            case 'spy':
                productId = POLAR_CONFIG.SPY_PRODUCT_ID;
                break;
        }

        if (!productId) {
            return NextResponse.json(
                { error: 'Product ID not configured' },
                { status: 500 }
            );
        }

        // Create Checkout Session via Polar SDK
        const checkout = await polar.checkouts.create({
            products: [productId],
            successUrl: `${request.nextUrl.origin}/status/success?resultId=${resultId}`,
            metadata: {
                user_hash: userHash || '',
                result_id: resultId || '',
                plan: plan,
            },
        });

        return NextResponse.json({ checkoutUrl: checkout.url });
    } catch (error: any) {
        console.error('Polar Checkout error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create checkout' },
            { status: 500 }
        );
    }
}

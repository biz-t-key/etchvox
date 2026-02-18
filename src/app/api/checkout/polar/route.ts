import { NextRequest, NextResponse } from 'next/server';
import { Polar } from '@polar-sh/sdk';
import { POLAR_CONFIG } from '@/config/features';

const polar = new Polar({
    accessToken: POLAR_CONFIG.ACCESS_TOKEN,
    server: 'production', // Use 'sandbox' for testing if needed
});

export async function POST(request: NextRequest) {
    try {
        // Config Verification
        if (!POLAR_CONFIG.ACCESS_TOKEN) {
            console.error('[Polar API] Missing POLAR_ACCESS_TOKEN');
            return NextResponse.json({ error: 'Polar API configuration missing (Token)' }, { status: 500 });
        }

        const { userHash, resultId, plan } = await request.json();

        if (!plan) {
            return NextResponse.json({ error: 'Missing plan selection' }, { status: 400 });
        }

        const validPlans = ['weekly', 'monthly', 'solo', 'couple', 'spy', 'upgrade', 'identity_solo', 'identity_duo'];
        if (!validPlans.includes(plan)) {
            return NextResponse.json({ error: `Invalid plan: ${plan}` }, { status: 400 });
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
            case 'upgrade':
                productId = POLAR_CONFIG.UPGRADE_PRODUCT_ID;
                break;
            case 'identity_solo':
                productId = POLAR_CONFIG.IDENTITY_SOLO_PRODUCT_ID;
                break;
            case 'identity_duo':
                productId = POLAR_CONFIG.IDENTITY_DUO_PRODUCT_ID;
                break;
        }

        if (!productId) {
            console.error(`[Polar API] Product ID missing for plan: ${plan}. Check environment variables.`);
            return NextResponse.json(
                { error: `Product configuration missing for ${plan}` },
                { status: 500 }
            );
        }

        const successUrl = resultId === 'mirror'
            ? `${request.nextUrl.origin}/mirror?status=success`
            : `${request.nextUrl.origin}/result/${resultId}?status=success`;

        // Create Checkout Session via Polar SDK
        const checkout = await polar.checkouts.create({
            products: [productId],
            successUrl,
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
            {
                error: 'Failed to create checkout',
                details: error.message || 'Unknown error',
                code: error.status || 500
            },
            { status: 500 }
        );
    }
}

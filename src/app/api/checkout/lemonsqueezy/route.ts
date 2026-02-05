// API Route: Generate Lemon Squeezy Checkout URL
// POST /api/checkout/lemonsqueezy

import { NextRequest, NextResponse } from 'next/server';
import { LEMONSQUEEZY_CONFIG } from '@/config/features';

export async function POST(request: NextRequest) {
    try {
        const { userHash, resultId, plan } = await request.json();

        if (!plan) {
            return NextResponse.json(
                { error: 'Missing plan' },
                { status: 400 }
            );
        }

        const validPlans = ['weekly', 'monthly', 'solo', 'couple', 'spy'];
        if (!validPlans.includes(plan)) {
            return NextResponse.json(
                { error: 'Invalid plan' },
                { status: 400 }
            );
        }

        // Select variant ID based on plan
        let variantId = '';
        switch (plan) {
            case 'weekly': variantId = LEMONSQUEEZY_CONFIG.WEEKLY_VARIANT_ID; break;
            case 'monthly': variantId = LEMONSQUEEZY_CONFIG.MONTHLY_VARIANT_ID; break;
            case 'solo': variantId = LEMONSQUEEZY_CONFIG.SOLO_VARIANT_ID; break;
            case 'couple': variantId = LEMONSQUEEZY_CONFIG.COUPLE_VARIANT_ID; break;
            case 'spy': variantId = LEMONSQUEEZY_CONFIG.SPY_VARIANT_ID; break;
        }

        if (!variantId) {
            return NextResponse.json(
                { error: 'Variant ID not configured' },
                { status: 500 }
            );
        }

        // Create checkout via Lemon Squeezy API
        const checkoutResponse = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
            method: 'POST',
            headers: {
                'Accept': 'application/vnd.api+json',
                'Content-Type': 'application/vnd.api+json',
                'Authorization': `Bearer ${LEMONSQUEEZY_CONFIG.API_KEY}`
            },
            body: JSON.stringify({
                data: {
                    type: 'checkouts',
                    attributes: {
                        checkout_data: {
                            custom: {
                                user_hash: userHash || '',
                                result_id: resultId || ''
                            }
                        }
                    },
                    relationships: {
                        store: {
                            data: {
                                type: 'stores',
                                id: LEMONSQUEEZY_CONFIG.STORE_ID
                            }
                        },
                        variant: {
                            data: {
                                type: 'variants',
                                id: variantId
                            }
                        }
                    }
                }
            })
        });

        if (!checkoutResponse.ok) {
            const errorText = await checkoutResponse.text();
            console.error('Lemon Squeezy API error:', errorText);
            return NextResponse.json(
                { error: 'Failed to create checkout' },
                { status: 500 }
            );
        }

        const checkoutData = await checkoutResponse.json();
        const checkoutUrl = checkoutData.data.attributes.url;

        return NextResponse.json({ checkoutUrl });

    } catch (error) {
        console.error('Checkout error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

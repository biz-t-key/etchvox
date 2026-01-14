import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';


export async function POST(req: NextRequest) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
        apiVersion: '2025-01-27.acacia' as any,
    });
    try {
        const { resultId, type, priceId } = await req.json();

        // Validate
        if (!resultId || !type) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Determine price and product details
        const isVault = type === 'vault';
        const amount = isVault ? 1000 : 499; // $10.00 or $4.99
        const productName = isVault
            ? 'EtchVox Vault - Lifetime Access'
            : 'EtchVox Full Report';
        const description = isVault
            ? 'Preserve your voice forever. Track aging. Raw audio included.'
            : 'Full roast, detailed metrics, and waveform visualization.';

        // Create Checkout Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: productName,
                            description: description,
                            images: [`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/og?type=HFEC&id=${resultId}`],
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/result/${resultId}?payment=success&type=${type}`,
            cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/result/${resultId}?payment=cancel`,
            metadata: {
                resultId,
                type,
            },
            allow_promotion_codes: true,
        });

        return NextResponse.json({ sessionId: session.id, url: session.url });
    } catch (error: any) {
        console.error('Stripe error:', error);
        return NextResponse.json(
            { error: error.message || 'Payment processing failed' },
            { status: 500 }
        );
    }
}

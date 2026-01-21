import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';


export async function POST(req: NextRequest) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
        apiVersion: '2025-01-27.acacia' as any,
    });
    try {
        const { resultId, type, priceId, successUrl, cancelUrl } = await req.json();

        // Validate
        if (!resultId || !type) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        // Determine price and product details based on type
        let amount: number;
        let productName: string;
        let description: string;

        switch (type) {
            case 'couple':
                amount = 1500; // $15.00
                productName = 'EtchVox Couple Resonance Report';
                description = 'AI-powered relationship analysis + Video Export.';
                break;
            case 'unlock':
                amount = 500; // $5.00
                productName = 'EtchVox Video Unlock';
                description = 'Unlock your high-quality analysis video for sharing.';
                break;
            case 'vault':
                amount = 1000; // $10.00
                productName = 'EtchVox Vault + Premium Report';
                description = 'Full AI Identity Audit + Video Export + Voice evolution tracking.';
                break;
            case 'solo':
            default:
                amount = 1000; // $10.00
                productName = 'EtchVox AI Identity Audit';
                description = 'Deep AI Gap Analysis (MBTI vs Voice) + Video Export.';
        }

        // Use custom URLs if provided, otherwise use defaults
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const finalSuccessUrl = successUrl || `${baseUrl}/result/${resultId}?payment=success&type=${type}`;
        const finalCancelUrl = cancelUrl || `${baseUrl}/result/${resultId}?payment=cancel`;

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
                            images: [`${baseUrl}/api/og?type=HFEC&id=${resultId}`],
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: finalSuccessUrl,
            cancel_url: finalCancelUrl,
            metadata: {
                resultId,
                type, // ✅ This will be used in webhook
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

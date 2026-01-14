import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDb, isFirebaseConfigured } from '@/lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';


export async function POST(req: NextRequest) {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder', {
        apiVersion: '2025-01-27.acacia' as any,
    });
    const body = await req.text();
    const sig = req.headers.get('stripe-signature');

    if (!sig) {
        return NextResponse.json({ error: 'No signature' }, { status: 400 });
    }

    try {
        const event = stripe.webhooks.constructEvent(
            body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET || ''
        );

        // Handle the event
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object as Stripe.Checkout.Session;
            const { resultId, type } = session.metadata || {};

            if (!resultId) {
                console.error('No resultId in session metadata');
                return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 });
            }

            // Update Firestore (if configured)
            if (isFirebaseConfigured()) {
                try {
                    const db = getDb();
                    await updateDoc(doc(db, 'results', resultId), {
                        isPremium: true,
                        vaultEnabled: type === 'vault',
                        purchasedAt: new Date().toISOString(),
                        stripeSessionId: session.id,
                        amountPaid: session.amount_total,
                    });

                    console.log(`Updated result ${resultId} with payment info`);
                } catch (err) {
                    console.error('Firestore update error:', err);
                    // Don't fail the webhook if Firestore fails
                }
            }

            // Also update localStorage (for demo mode)
            // This would be handled client-side via success_url callback
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error('Webhook error:', err.message);
        return NextResponse.json(
            { error: `Webhook Error: ${err.message}` },
            { status: 400 }
        );
    }
}

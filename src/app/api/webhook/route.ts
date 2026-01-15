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
                    // First, get the current result data to perform analysis
                    const { getDoc } = await import('firebase/firestore');
                    const { SoloIdentityEngine, CoupleResonanceEngine } = await import('@/lib/voiceProcessor');
                    const { generateContent } = await import('@/lib/gemini');
                    const { SOLO_AUDIT_SYSTEM_PROMPT, COUPLE_AUDIT_SYSTEM_PROMPT } = await import('@/lib/prompts');

                    const resultRef = doc(db, 'results', resultId);
                    const resultSnap = await getDoc(resultRef);

                    let aiReport = null;

                    if (resultSnap.exists()) {
                        const data = resultSnap.data();

                        // --- SOLO FLOW ---
                        if (type === 'solo' && data.metrics) {
                            const engine = new SoloIdentityEngine(
                                data.metrics.pitch || 50,
                                data.metrics.speed || 50,
                                data.metrics.volume || 50,
                                data.metrics.tone || 50,
                                data.typeCode?.replace('_', '').substring(0, 4) || 'INTJ'
                            );

                            const payload = engine.generatePayload();
                            console.log('Generating Solo Report for:', resultId);
                            aiReport = await generateContent(SOLO_AUDIT_SYSTEM_PROMPT, JSON.stringify(payload, null, 2));
                        }

                        // --- COUPLE FLOW ---
                        if (type === 'couple' && data.coupleData) {
                            const { userA, userB } = data.coupleData;

                            if (userA && userB) {
                                // Map AnalysisMetrics (pitch, speed, vibe, tone) to Engine input (p, s, v, t)
                                const safeMap = (m: any) => ({
                                    p: Math.min(100, Math.max(0, (m.pitch || 150) / 3)),
                                    s: Math.min(100, Math.max(0, (m.speed || 0.5) * 100)),
                                    v: Math.min(100, Math.max(0, (m.vibe || 0.1) * 500)),
                                    t: Math.min(100, Math.max(0, (m.tone || 2000) / 40))
                                });

                                const engine = new CoupleResonanceEngine(
                                    { ...safeMap(userA.metrics), name: userA.name, job: userA.job, accent: 'Unknown' },
                                    { ...safeMap(userB.metrics), name: userB.name, job: userB.job, accent: 'Unknown' }
                                );

                                const payload = engine.generatePayload();
                                console.log('Generating Couple Report for:', resultId);
                                aiReport = await generateContent(COUPLE_AUDIT_SYSTEM_PROMPT, JSON.stringify(payload, null, 2));
                            }
                        }

                        // Update Doc with Payment AND AI Result
                        await updateDoc(resultRef, {
                            isPremium: true,
                            vaultEnabled: type === 'vault' || type === 'solo_video',
                            purchasedAt: new Date().toISOString(),
                            stripeSessionId: session.id,
                            amountPaid: session.amount_total,
                            // ✅ Save the AI Report
                            ...(aiReport ? { aiAnalysis: aiReport } : {})
                        });

                        console.log(`Updated result ${resultId} with payment info & AI Analysis`);
                    }
                } catch (err) {
                    console.error('Firestore update/AI generation error:', err);
                }
            }
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

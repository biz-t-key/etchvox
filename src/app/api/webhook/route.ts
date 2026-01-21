import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { getDb, isFirebaseConfigured } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { r2Client } from '@/lib/r2';
import { CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// ✅ Configuration for Vercel/Next.js
export const maxDuration = 60; // 60 seconds max timeout
export const dynamic = 'force-dynamic';

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
            const customerEmail = session.customer_details?.email;

            if (!resultId) {
                console.error('No resultId in session metadata');
                return NextResponse.json({ error: 'Invalid metadata' }, { status: 400 });
            }

            // Update Firestore (if configured)
            if (isFirebaseConfigured()) {
                try {
                    const db = getDb();
                    // Import only what's not imported at the top
                    const { SoloIdentityEngine, CoupleResonanceEngine, normalizeMetricsForEngine } = await import('@/lib/voiceProcessor');
                    const { generateContent } = await import('@/lib/gemini');
                    const { SOLO_AUDIT_SYSTEM_PROMPT, COUPLE_AUDIT_SYSTEM_PROMPT } = await import('@/lib/prompts');

                    const resultRef = doc(db, 'results', resultId);
                    const resultSnap = await getDoc(resultRef);

                    let aiReport = null;

                    if (resultSnap.exists()) {
                        const data = resultSnap.data();

                        // --- SOLO / VAULT FLOW ---
                        if ((type === 'solo' || type === 'vault') && data.metrics) {
                            // ✅ Normalize raw metrics to 0-100 scale
                            const normalized = normalizeMetricsForEngine(data.metrics);

                            const engine = new SoloIdentityEngine(
                                normalized.p,
                                normalized.s,
                                normalized.v,
                                normalized.t,
                                data.mbti || 'INTJ',
                                data.gender,
                                data.birthYear
                            );

                            const payload = engine.generatePayload();
                            console.log('Generating Solo Report for:', resultId);
                            aiReport = await generateContent(SOLO_AUDIT_SYSTEM_PROMPT, JSON.stringify(payload, null, 2));
                        }

                        // --- COUPLE FLOW ---
                        if (type === 'couple' && data.coupleData) {
                            const { userA, userB } = data.coupleData;

                            if (userA && userB) {
                                // ✅ Normalize metrics for both users
                                const normalizedA = normalizeMetricsForEngine(userA.metrics);
                                const normalizedB = normalizeMetricsForEngine(userB.metrics);

                                const engine = new CoupleResonanceEngine(
                                    { ...normalizedA, name: userA.name, job: userA.job, accent: 'Unknown', gender: userA.gender, birthYear: userA.birthYear },
                                    { ...normalizedB, name: userB.name, job: userB.job, accent: 'Unknown', gender: userB.gender, birthYear: userB.birthYear }
                                );

                                const payload = engine.generatePayload();
                                console.log('Generating Couple Report for:', resultId);
                                aiReport = await generateContent(COUPLE_AUDIT_SYSTEM_PROMPT, JSON.stringify(payload, null, 2));
                            }
                        }

                        // Update Doc with Payment AND AI Result
                        await updateDoc(resultRef, {
                            isPremium: true,
                            vaultEnabled: type === 'vault' || type === 'solo' || type === 'couple',
                            purchasedAt: new Date().toISOString(),
                            stripeSessionId: session.id,
                            amountPaid: session.amount_total,
                            email: customerEmail,
                            // ✅ Save the AI Report
                            ...(aiReport ? { aiAnalysis: aiReport } : {})
                        });

                        console.log(`Updated result ${resultId} with payment info & AI Analysis`);

                        // ✅ Promote audio files to Vault
                        const bucketName = process.env.R2_BUCKET_NAME;
                        if (bucketName) {
                            const filesToMove = [
                                `${resultId}.webm`,
                                `${resultId}_userA.webm`,
                                `${resultId}_userB.webm`
                            ];

                            for (const file of filesToMove) {
                                try {
                                    // Move from temp/ to vault/
                                    const sourceKey = `temp/${file}`;
                                    const destKey = `vault/${file}`;

                                    await r2Client.send(new CopyObjectCommand({
                                        Bucket: bucketName,
                                        CopySource: `${bucketName}/${sourceKey}`,
                                        Key: destKey,
                                    }));

                                    await r2Client.send(new DeleteObjectCommand({
                                        Bucket: bucketName,
                                        Key: sourceKey,
                                    }));
                                    console.log(`Promoted ${file} to vault/`);
                                } catch (e) {
                                    // Ignore if file doesn't exist in temp (might already be moved or didn't upload)
                                    console.log(`Promotion skipped for ${file} (not found in temp/)`);
                                }
                            }
                        }
                    }
                } catch (err: any) {
                    console.error('Firestore update/AI generation error:', err);
                    // ✅ Save error message to Firestore so user can see what happened
                    try {
                        const db = getDb();
                        const resultRef = doc(db, 'results', resultId);
                        await updateDoc(resultRef, {
                            isPremium: true,
                            aiAnalysisError: `AI generation failed: ${err.message || 'Unknown error'}. Please contact support.`
                        });
                    } catch (updateErr) {
                        console.error('Failed to save error state:', updateErr);
                    }
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

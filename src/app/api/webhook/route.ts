import { NextRequest, NextResponse } from 'next/server';
import { getDb, isFirebaseConfigured } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { r2Client } from '@/lib/r2';
import { CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// ✅ Configuration for Vercel/Next.js
export const maxDuration = 60; // 60 seconds max timeout
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        const payload = await req.json();
        console.log('BMAC Webhook Received:', JSON.stringify(payload, null, 2));

        // BMAC Webhook structure for a donation
        const data = payload.data || payload;
        const message = data.support_note || data.noted || "";
        const amountCents = Math.round((data.support_amount || data.amount || 0) * 100);
        const customerEmail = data.support_email || data.payer_email;

        // Pattern: ID: {resultId}
        const idMatch = message.match(/ID:\s*([a-zA-Z0-9_-]+)/i);
        const resultId = idMatch ? idMatch[1] : null;

        if (!resultId) {
            console.error('No resultId found in BMAC message:', message);
            return NextResponse.json({ error: 'No resultId in message' }, { status: 400 });
        }

        let type: 'unlock' | 'vault' | 'couple' = 'vault';
        if (amountCents >= 1500) type = 'couple';
        else if (amountCents >= 1000) type = 'vault';
        else if (amountCents >= 500) type = 'unlock';

        if (isFirebaseConfigured()) {
            try {
                const db = getDb();
                const resultRef = doc(db, 'results', resultId);
                const resultSnap = await getDoc(resultRef);

                let aiReport = null;

                if (resultSnap.exists()) {
                    const resultData = resultSnap.data();
                    const isSpy = !!resultData.spyMetadata || ['HIRED', 'SUSP', 'REJT', 'BURN'].includes(resultData.typeCode);

                    // 🧬 AI Report Generation
                    if (resultData.metrics) {
                        const { SoloIdentityEngine, CoupleResonanceEngine, SpyIntelligenceEngine, normalizeMetricsForEngine } = await import('@/lib/voiceProcessor');
                        const { generateContent } = await import('@/lib/gemini');
                        const { SOLO_AUDIT_SYSTEM_PROMPT, COUPLE_AUDIT_SYSTEM_PROMPT, SPY_AUDIT_SYSTEM_PROMPT } = await import('@/lib/prompts');

                        if (isSpy && (type === 'unlock' || type === 'vault')) {
                            // 🕵️ SPY Premium Audit
                            const engine = new SpyIntelligenceEngine(resultData.metrics, {
                                ...resultData.spyMetadata,
                                codename: resultData.spyMetadata?.codename || resultId,
                                requestedDivision: resultData.spyMetadata?.requestedDivision
                            });
                            const aiPayload = engine.generatePayload();
                            aiReport = await generateContent(SPY_AUDIT_SYSTEM_PROMPT, JSON.stringify(aiPayload, null, 2));
                        } else if (type === 'couple' && resultData.coupleData) {
                            // 💑 Couple Resonance
                            const { userA, userB } = resultData.coupleData;
                            if (userA && userB) {
                                const normalizedA = normalizeMetricsForEngine(userA.metrics);
                                const normalizedB = normalizeMetricsForEngine(userB.metrics);
                                const engine = new CoupleResonanceEngine(
                                    { ...normalizedA, name: userA.name, job: userA.job, accent: 'Unknown', gender: userA.gender, birthYear: userA.birthYear },
                                    { ...normalizedB, name: userB.name, job: userB.job, accent: 'Unknown', gender: userB.gender, birthYear: userB.birthYear }
                                );
                                const aiPayload = engine.generatePayload();
                                aiReport = await generateContent(COUPLE_AUDIT_SYSTEM_PROMPT, JSON.stringify(aiPayload, null, 2));
                            }
                        } else if (type === 'vault' || type === 'unlock') {
                            // 👤 Standard Solo Identity Audit (Now also for $5 unlock)
                            const normalized = normalizeMetricsForEngine(resultData.metrics);
                            const engine = new SoloIdentityEngine(
                                normalized.p, normalized.s, normalized.v, normalized.t,
                                resultData.mbti || 'INTJ', resultData.gender, resultData.birthYear
                            );
                            const aiPayload = engine.generatePayload();
                            aiReport = await generateContent(SOLO_AUDIT_SYSTEM_PROMPT, JSON.stringify(aiPayload, null, 2));
                        }
                    }

                    await updateDoc(resultRef, {
                        isPremium: true,
                        vaultEnabled: type === 'vault' || type === 'couple',
                        purchasedAt: new Date().toISOString(),
                        amountPaid: amountCents,
                        email: customerEmail,
                        paymentSource: 'bmac',
                        ...(aiReport ? { aiAnalysis: aiReport } : {})
                    });

                    const bucketName = process.env.R2_BUCKET_NAME;
                    if (bucketName) {
                        const filesToMove = [`${resultId}.webm`, `${resultId}_userA.webm`, `${resultId}_userB.webm`];
                        for (const file of filesToMove) {
                            try {
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
                                console.log(`Promotion skipped for ${file} (not found in temp/)`);
                            }
                        }
                    }
                }
            } catch (err: any) {
                console.error('Webhook fulfillment error:', err);
            }
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error('Webhook error:', err.message);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }
}

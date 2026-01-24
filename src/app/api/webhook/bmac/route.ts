import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getDb, isFirebaseConfigured } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { r2Client } from '@/lib/r2';
import { CopyObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

// ✅ Buy Me a Coffee Webhook Handler
export async function POST(req: NextRequest) {
    try {
        const rawBody = await req.text();
        const body = JSON.parse(rawBody);

        // 🔒 Verify Signature
        const signature = req.headers.get('x-bmac-signature');
        const secret = process.env.BMAC_WEBHOOK_SECRET;

        if (secret && signature) {
            const hash = crypto
                .createHmac('sha256', secret)
                .update(rawBody)
                .digest('hex');

            if (hash !== signature) {
                console.error('BMAC Signature Mismatch');
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        }

        // BMAC sends the specific event type.
        // Based on user dashboard, 'support.created' is the key event.
        if (body.type === 'donation.created' || body.type === 'extra.purchased' || body.type === 'support.created') {
            const data = body.data;
            const customerEmail = data.payer_email;

            // BMAC doesn't lend itself to custom metadata as easily as Stripe,
            // so we usually pass the resultId in the "message" or a custom field.
            // Assumption: User puts their Result ID in the message or we use a custom link.
            // For now, let's look for a pattern like "ID: [resultId]" in the message.
            const message = data.donation_message || '';
            const match = message.match(/ID:\s*([a-zA-Z0-9_-]+)/);
            const resultId = match ? match[1] : null;

            if (!resultId) {
                console.error('No Result ID found in BMAC message');
                return NextResponse.json({ error: 'No Result ID' }, { status: 400 });
            }

            const amount = parseFloat(data.amount);
            let type = 'vault';
            if (amount < 8) type = 'unlock'; // $5 logic
            if (amount > 12) type = 'couple'; // $15 logic

            if (isFirebaseConfigured()) {
                const db = getDb();
                const resultRef = doc(db, 'results', resultId);
                const resultSnap = await getDoc(resultRef);

                if (resultSnap.exists()) {
                    // 1. Update individual result
                    await updateDoc(resultRef, {
                        isPremium: true,
                        vaultEnabled: type === 'vault' || type === 'couple',
                        purchasedAt: new Date().toISOString(),
                        amountPaid: amount * 100, // store in cents
                        email: customerEmail,
                        paymentProvider: 'bmac'
                    });

                    // 2. ✅ Update GLOBAL Funding Total
                    try {
                        const statsRef = doc(db, 'stats', 'global');
                        const statsSnap = await getDoc(statsRef);

                        const amountCents = Math.round(amount * 100);

                        if (statsSnap.exists()) {
                            // Increment existing total
                            const currentTotal = statsSnap.data().totalAmount || 0;
                            await updateDoc(statsRef, {
                                totalAmount: currentTotal + amountCents,
                                lastUpdated: new Date().toISOString()
                            });
                        } else {
                            // Create first record
                            const { setDoc } = await import('firebase/firestore');
                            await setDoc(statsRef, {
                                totalAmount: amountCents,
                                lastUpdated: new Date().toISOString()
                            });
                        }
                        console.log(`[GLOBAL] Updated total funding by +${amountCents} cents`);
                    } catch (statsErr) {
                        console.error('Failed to update global stats:', statsErr);
                    }

                    // 3. Promote to Vault in R2
                    const bucketName = process.env.R2_BUCKET_NAME;
                    if (bucketName) {
                        const filesToMove = [
                            `${resultId}.webm`,
                            `${resultId}_userA.webm`,
                            `${resultId}_userB.webm`
                        ];

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
                                console.log(`[BMAC] Promoted ${file} to vault/`);
                            } catch (e) {
                                console.log(`[BMAC] Skip ${file}`);
                            }
                        }
                    }
                }
            }
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('BMAC Webhook error:', error);
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

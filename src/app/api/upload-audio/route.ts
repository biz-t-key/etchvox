import { NextRequest, NextResponse } from 'next/server';
import { r2Client } from '@/lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getDb } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const resultId = formData.get('resultId') as string;
        const consentAgreed = formData.get('consentAgreed') === 'true';

        if (!file || !resultId) {
            return NextResponse.json({ error: 'File and resultId are required' }, { status: 400 });
        }

        // 🔓 Community Unlock Check: Full Vault ($15k)
        let isVaultTargetReached = false;
        try {
            const db = getDb();
            const statsSnap = await getDoc(doc(db, 'stats', 'global'));
            if (statsSnap.exists()) {
                const totalCents = statsSnap.data().totalAmount || 0;
                isVaultTargetReached = totalCents >= 1500000;
            }
        } catch (e) {
            console.warn('Failed to fetch stats in upload API', e);
        }

        const buffer = Buffer.from(await file.arrayBuffer());

        // Final Safety: Only vault if Goal reached AND user consented
        const useVault = isVaultTargetReached && consentAgreed;
        const folder = useVault ? 'vault' : 'temp';
        const fileName = `${folder}/${resultId}.webm`;
        const bucketName = process.env.R2_BUCKET_NAME;

        if (!bucketName) {
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: fileName,
            Body: buffer,
            ContentType: file.type || 'audio/webm',
        });

        await r2Client.send(command);

        console.log(`Uploaded ${fileName} to R2`);

        // Return the R2 path identifier (not the full URL yet, as it might be private)
        return NextResponse.json({
            success: true,
            path: fileName,
            storageType: 'r2'
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}

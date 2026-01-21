import { NextRequest, NextResponse } from 'next/server';
import { r2Client } from '@/lib/r2';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const resultId = searchParams.get('id');

    if (!resultId) {
        return NextResponse.json({ error: 'Result ID required' }, { status: 400 });
    }

    const bucketName = process.env.R2_BUCKET_NAME;

    try {
        // 1. Try to see if it's in the vault
        const vaultKey = `vault/${resultId}.webm`;
        const tempKey = `temp/${resultId}.webm`;
        const legacyKey = `${resultId}.webm`; // For backward compatibility

        let finalKey = tempKey;

        // Check if vault version exists (using head or just try/catch)
        try {
            const { HeadObjectCommand } = await import('@aws-sdk/client-s3');
            await r2Client.send(new HeadObjectCommand({ Bucket: bucketName, Key: vaultKey }));
            finalKey = vaultKey;
        } catch (e) {
            // Not in vault, try temp
            try {
                const { HeadObjectCommand } = await import('@aws-sdk/client-s3');
                await r2Client.send(new HeadObjectCommand({ Bucket: bucketName, Key: tempKey }));
                finalKey = tempKey;
            } catch (e2) {
                // Last ditch effort for legacy files at root
                finalKey = legacyKey;
            }
        }

        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: finalKey,
        });

        // Generate a signed URL valid for 1 hour
        const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

        return NextResponse.redirect(signedUrl);
    } catch (error) {
        console.error('Failed to generate signed URL:', error);
        return NextResponse.json({ error: 'Failed to generate URL' }, { status: 500 });
    }
}

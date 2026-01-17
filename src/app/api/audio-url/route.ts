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
    const fileName = `${resultId}.webm`;

    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: fileName,
        });

        // Generate a signed URL valid for 1 hour
        const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 });

        return NextResponse.redirect(signedUrl);
    } catch (error) {
        console.error('Failed to generate signed URL:', error);
        return NextResponse.json({ error: 'Failed to generate URL' }, { status: 500 });
    }
}

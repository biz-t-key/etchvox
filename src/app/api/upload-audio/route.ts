import { NextRequest, NextResponse } from 'next/server';
import { r2Client } from '@/lib/r2';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { nanoid } from 'nanoid';

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const resultId = formData.get('resultId') as string;

        if (!file || !resultId) {
            return NextResponse.json({ error: 'File and resultId are required' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileName = `temp/${resultId}.webm`; // Store in temp by default
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

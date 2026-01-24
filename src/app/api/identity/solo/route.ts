import { NextRequest, NextResponse } from 'next/server';
import { getSoloIdentity } from '@/lib/soloIdentityMatrix';
import { MBTIType } from '@/lib/mbti';
import { TypeCode } from '@/lib/types';

/**
 * Solo Identity API
 * Returns identity name and roast based on MBTI and Voice Type.
 * This keeps the full roast matrix on the server to prevent spoilers.
 */
export async function POST(req: NextRequest) {
    try {
        const { mbti, voiceTypeCode } = await req.json();

        if (!mbti || !voiceTypeCode) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const identity = getSoloIdentity(mbti as MBTIType, voiceTypeCode as TypeCode);

        // We only return the necessary fields
        return NextResponse.json({
            brandName: identity.brandName,
            roast: identity.roast
        });
    } catch (error) {
        console.error('Solo Identity API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

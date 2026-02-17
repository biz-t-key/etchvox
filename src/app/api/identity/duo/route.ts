import { NextRequest, NextResponse } from 'next/server';
import { getDuoIdentity } from '@/lib/duoIdentityMatrix';
import { TypeCode } from '@/lib/types';

/**
 * Duo Identity API
 * Returns duo identity name and roast based on two voice types.
 * Prevents full duo matrix leakage to client side.
 */
export async function POST(req: NextRequest) {
    try {
        const { typeCodeA, typeCodeB, relationshipType } = await req.json();

        if (!typeCodeA || !typeCodeB) {
            return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
        }

        const identity = getDuoIdentity(typeCodeA as TypeCode, typeCodeB as TypeCode, relationshipType);

        return NextResponse.json({
            label: identity.label,
            roast: identity.roast
        });
    } catch (error) {
        console.error('Duo Identity API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

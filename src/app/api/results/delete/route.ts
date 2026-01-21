import { NextRequest, NextResponse } from 'next/server';
import { getDb, isFirebaseConfigured } from '@/lib/firebase';
import { doc, deleteDoc, getDoc } from 'firebase/firestore';

export async function POST(req: NextRequest) {
    if (!isFirebaseConfigured()) {
        return NextResponse.json({ error: 'Firebase not configured' }, { status: 500 });
    }

    try {
        const { resultId } = await req.json();

        if (!resultId) {
            return NextResponse.json({ error: 'Result ID required' }, { status: 400 });
        }

        const db = getDb();
        const resultRef = doc(db, 'results', resultId);

        // Verify existence
        const snap = await getDoc(resultRef);
        if (!snap.exists()) {
            return NextResponse.json({ error: 'Result not found' }, { status: 404 });
        }

        // Perform deletion
        await deleteDoc(resultRef);

        // Note: In a production environment, you would also delete the audio files 
        // from Firebase Storage/R2 here.

        console.log(`Permanently deleted result: ${resultId}`);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Delete result error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

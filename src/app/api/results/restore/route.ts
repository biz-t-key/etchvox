import { NextRequest, NextResponse } from 'next/server';
import { getDb, isFirebaseConfigured } from '@/lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';

export async function POST(req: NextRequest) {
    if (!isFirebaseConfigured()) {
        return NextResponse.json({ error: 'Firebase not configured' }, { status: 500 });
    }

    try {
        const { email } = await req.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
        }

        const db = getDb();
        const resultsRef = collection(db, 'results');

        // Find all results linked to this email
        // Note: For this to work in Firestore, you'll need an index on 'email' and 'createdAt'
        // If index doesn't exist, it might fail initially.
        const q = query(
            resultsRef,
            where('email', '==', email.toLowerCase().trim()),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            // Ensure Timestamp is converted back to string for consistency
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : doc.data().createdAt,
        }));

        console.log(`Restored ${results.length} results for ${email}`);

        return NextResponse.json({ results });
    } catch (error: any) {
        console.error('Restore history error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

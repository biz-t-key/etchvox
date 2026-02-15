import { NextRequest, NextResponse } from 'next/server';
import { getDb, isFirebaseConfigured } from '@/lib/firebase';
import { doc, getDoc, deleteDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';

/**
 * Vault Verification API (Phase 2)
 * Validates the 6-digit OTP and returns the user's diagnostic history.
 */
export async function POST(req: NextRequest) {
    if (!isFirebaseConfigured()) {
        return NextResponse.json({ error: 'Firebase not configured' }, { status: 500 });
    }

    try {
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Email and verification code required' }, { status: 400 });
        }

        const emailHash = require('@/lib/auth').hashEmail(email);
        const db = getDb();

        // 1. Get and Validate OTP from Firestore
        const otpRef = doc(db, 'otps', emailHash);
        const otpSnap = await getDoc(otpRef);

        if (!otpSnap.exists()) {
            return NextResponse.json({ error: 'No active verification request found. Try again.' }, { status: 404 });
        }

        const { otp: storedOtp, expiresAt } = otpSnap.data();

        // Check expiration
        if (expiresAt.toDate() < new Date()) {
            await deleteDoc(otpRef);
            return NextResponse.json({ error: 'Verification code expired. Request a new one.' }, { status: 400 });
        }

        // Check code match
        if (storedOtp !== otp) {
            return NextResponse.json({ error: 'Invalid verification code.' }, { status: 401 });
        }

        // 2. Success! Delete the OTP
        await deleteDoc(otpRef);

        // 3. Fetch recorded results
        const resultsRef = collection(db, 'results');
        const resultsQuery = query(
            resultsRef,
            where('emailHash', '==', emailHash),
            orderBy('createdAt', 'desc')
        );

        const resultsSnap = await getDocs(resultsQuery);
        const results = resultsSnap.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : doc.data().createdAt,
        }));

        // 4. Fetch subscription status
        const subsRef = collection(db, 'subscriptions');
        const subsQuery = query(
            subsRef,
            where('customerEmailHash', '==', emailHash)
        );
        const subsSnap = await getDocs(subsQuery);
        const subscription = !subsSnap.empty ? {
            id: subsSnap.docs[0].id,
            ...subsSnap.docs[0].data(),
            expiresAt: subsSnap.docs[0].data().expiresAt?.toDate ? subsSnap.docs[0].data().expiresAt.toDate().toISOString() : subsSnap.docs[0].data().expiresAt
        } : null;

        console.log(`[AUTH] Successfully verified ${email}. Restoring ${results.length} records and ${subscription ? '1' : '0'} subscriptions.`);

        return NextResponse.json({ results, subscription });

    } catch (error: any) {
        console.error('OTP Verification Error:', error);
        return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
    }
}

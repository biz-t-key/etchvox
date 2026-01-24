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

        const normalizedEmail = email.toLowerCase().trim();
        const db = getDb();

        // 1. Get and Validate OTP from Firestore
        const otpRef = doc(db, 'otps', normalizedEmail);
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

        // 2. Success! Delete the OTP and fetch recorded results
        await deleteDoc(otpRef);

        const resultsRef = collection(db, 'results');
        const q = query(
            resultsRef,
            where('email', '==', normalizedEmail),
            orderBy('createdAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const results = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate ? doc.data().createdAt.toDate().toISOString() : doc.data().createdAt,
        }));

        console.log(`[AUTH] Successfully verified ${normalizedEmail}. Restoring ${results.length} records.`);

        return NextResponse.json({ results });

    } catch (error: any) {
        console.error('OTP Verification Error:', error);
        return NextResponse.json({ error: error.message || 'Verification failed' }, { status: 500 });
    }
}

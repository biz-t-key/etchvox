import { NextRequest, NextResponse } from 'next/server';
import { getDb, isFirebaseConfigured } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, setDoc, Timestamp } from 'firebase/firestore';
import { sendOtpEmail } from '@/lib/mail';

/**
 * Vault Restoration Request (Phase 1)
 * Checks if user has records, generates a 6-digit OTP, and sends via email.
 */
export async function POST(req: NextRequest) {
    if (!isFirebaseConfigured()) {
        return NextResponse.json({ error: 'Firebase not configured' }, { status: 500 });
    }

    try {
        const { email } = await req.json();

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Valid email required' }, { status: 400 });
        }

        const emailHash = require('@/lib/auth').hashEmail(email);
        const db = getDb();

        // 1. Verify that this email actually has purchased records
        const resultsRef = collection(db, 'results');
        const q = query(
            resultsRef,
            where('emailHash', '==', emailHash)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return NextResponse.json({ error: 'No diagnostic history found for this email.' }, { status: 404 });
        }

        // 2. Generate a 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // 3. Save OTP to Firestore (expiring in 10 minutes)
        const otpRef = doc(db, 'otps', emailHash);
        await setDoc(otpRef, {
            otp,
            createdAt: Timestamp.now(),
            expiresAt: Timestamp.fromDate(new Date(Date.now() + 10 * 60 * 1000)) // 10 mins
        });

        // 4. Send Email via Resend
        console.log(`[AUTH] Sending OTP ${otp} to ${email}`);
        await sendOtpEmail(email, otp);

        return NextResponse.json({ success: true, message: 'Verification code sent.' });

    } catch (error: any) {
        console.error('Restore request error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

// Subscription Service for Voice Mirror
// Manages subscription status via Firestore

import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { getDb, isFirebaseConfigured } from './firebase';

export interface SubscriptionStatus {
    isActive: boolean;
    plan?: 'weekly' | 'monthly';
    expiresAt?: Date;
    polarId?: string;
    customerEmailHash?: string;
    status: 'active' | 'cancelled' | 'expired' | 'refunded';
}

/**
 * Check if a user has an active subscription
 */
export async function checkSubscription(userHash: string): Promise<SubscriptionStatus> {
    if (!isFirebaseConfigured()) {
        return { isActive: false, status: 'expired' };
    }

    try {
        const db = getDb();
        const subRef = doc(db, 'subscriptions', userHash);
        const subSnap = await getDoc(subRef);

        if (!subSnap.exists()) {
            return { isActive: false, status: 'expired' };
        }

        const data = subSnap.data();
        const expiresAt = data.expiresAt?.toDate();
        const now = new Date();

        // Check if subscription is still valid
        const isActive = expiresAt ? expiresAt > now : false;

        return {
            isActive,
            plan: data.plan,
            expiresAt,
            polarId: data.polarId,
            customerEmailHash: data.customerEmailHash,
            status: data.status || (isActive ? 'active' : 'expired')
        };
    } catch (error) {
        console.error('Failed to check subscription:', error);
        return { isActive: false, status: 'expired' };
    }
}

/**
 * Update subscription status (called by webhook)
 */
export async function updateSubscription(
    userHash: string,
    data: {
        plan: 'weekly' | 'monthly';
        expiresAt: Date;
        polarId?: string;
        customerEmailHash?: string;
        status: 'active' | 'cancelled' | 'expired';
    }
): Promise<void> {
    if (!isFirebaseConfigured()) {
        throw new Error('Firebase not configured');
    }

    try {
        const db = getDb();
        const subRef = doc(db, 'subscriptions', userHash);

        await setDoc(subRef, {
            plan: data.plan,
            expiresAt: Timestamp.fromDate(data.expiresAt),
            polarId: data.polarId || null,
            customerEmailHash: data.customerEmailHash || null,
            status: data.status,
            updatedAt: Timestamp.now()
        }, { merge: true });

        console.log(`✓ Subscription updated for ${userHash}`);
    } catch (error) {
        console.error('Failed to update subscription:', error);
        throw error;
    }
}

/**
 * Revoke subscription (called on refund)
 */
export async function revokeSubscription(userHash: string): Promise<void> {
    if (!isFirebaseConfigured()) return;

    try {
        const db = getDb();
        const subRef = doc(db, 'subscriptions', userHash);

        await setDoc(subRef, {
            status: 'refunded',
            expiresAt: Timestamp.fromDate(new Date()), // Expire immediately
            updatedAt: Timestamp.now()
        }, { merge: true });

        console.log(`⚠ Subscription REVOKED for ${userHash}`);
    } catch (error) {
        console.error('Failed to revoke subscription:', error);
    }
}

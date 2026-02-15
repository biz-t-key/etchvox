// Result Storage Service
// Handles saving and retrieving voice analysis results

import {
    doc,
    setDoc,
    getDoc,
    collection,
    Timestamp,
    increment,
    updateDoc
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getDb, getStorageInstance, isFirebaseConfigured } from './firebase';
import { TypeCode, AnalysisMetrics } from './types';
import { ToxicityProfile } from './toxicity';

export interface VoiceResult {
    id: string;
    sessionId: string;
    typeCode: TypeCode;
    metrics: AnalysisMetrics;
    gender?: string; // Solo gender
    birthYear?: number; // Solo birth year
    isPremium?: boolean;
    purchasedAt?: string;
    accentOrigin: string;
    createdAt: string;
    locale: string;
    userAgent?: string;
    country?: string;
    audioUrl?: string;
    audioPath?: string;
    vaultEnabled?: boolean;
    toxicityProfile?: ToxicityProfile;
    aiAnalysis?: string; // Markdown text from Gemini
    mbti?: string; // User's self-reported MBTI
    mode?: 'solo' | 'elon' | 'spy'; // Which feature was used
    coupleData?: {
        userA: { name: string; job: string; metrics: AnalysisMetrics; gender?: string; birthYear?: number; typeCode?: TypeCode; consentAgreed: boolean; researchConsentAgreed: boolean };
        userB: { name: string; job: string; metrics: AnalysisMetrics; gender?: string; birthYear?: number; typeCode?: TypeCode; consentAgreed: boolean; researchConsentAgreed: boolean };
    };
    consentAgreed: boolean;
    researchConsentAgreed: boolean;
    consentVersion: string;
    consentAt: string;
    consentStatement?: string; // Full text of the consent given
    consentHash?: string; // SHA-256 hash for integrity
    wellnessConsentAgreed: boolean; // Mandatory wellness processing consent
    logV2?: import('./types').VoiceLogV2; // Optional enriched Version 2.0 log
    logV3?: import('./types').VoiceLogV3; // New Schema 2.0.0
    spyMetadata?: { origin: string; target: string };
    spyAnalysis?: { score: number; reason: string; isGhost: boolean; stamp?: string };
    postReading?: import('./types').PostReadingInsight;
}

// Generate a SHA-256 hash of the consent record for audit traceability
async function generateConsentHash(result: VoiceResult): Promise<string> {
    const consent = result.logV3?.meta.consent || {
        termsAccepted: result.consentAgreed,
        privacyPolicyAccepted: result.consentAgreed,
        dataDonationAllowed: result.researchConsentAgreed,
        marketingAllowed: false
    };

    const data = `${result.consentVersion}|${result.consentAt}|${result.sessionId}|${consent.termsAccepted}|${consent.privacyPolicyAccepted}|${consent.dataDonationAllowed}|${result.consentStatement || ''}`;
    const msgUint8 = new TextEncoder().encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Deeply remove undefined values from an object for Firestore compatibility
function sanitizeForFirestore(obj: any): any {
    if (Array.isArray(obj)) {
        return obj.map(v => sanitizeForFirestore(v));
    } else if (obj !== null && typeof obj === 'object' && !(obj instanceof Date) && !(obj instanceof Timestamp)) {
        return Object.fromEntries(
            Object.entries(obj)
                .filter(([_, v]) => v !== undefined)
                .map(([k, v]) => [k, sanitizeForFirestore(v)])
        );
    }
    return obj;
}

// Save result to Firestore (and localStorage as fallback)
export async function saveResult(
    result: VoiceResult,
    audioBlob?: Blob,
    coupleAudioBlobs?: { userA: Blob; userB: Blob }
): Promise<void> {
    // Always save to localStorage first (fallback)
    localStorage.setItem(`etchvox_result_${result.id}`, JSON.stringify(result));
    localStorage.setItem('etchvox_latest_result', result.id);

    // Update history index
    try {
        const historyIds = JSON.parse(localStorage.getItem('etchvox_history') || '[]');
        if (!historyIds.includes(result.id)) {
            historyIds.unshift(result.id); // Add to beginning
            localStorage.setItem('etchvox_history', JSON.stringify(historyIds.slice(0, 50))); // Keep last 50
        }
    } catch (e) {
        console.error('Failed to update history index:', e);
    }

    // If Firebase is configured, also save to Firestore
    if (isFirebaseConfigured()) {
        try {
            const db = getDb();
            const resultRef = doc(db, 'results', result.id);

            // Generate consent hash before saving
            if (result.consentAgreed) {
                let statement = `I consent to recording: ${result.consentAgreed}. I consent to AI research: ${result.researchConsentAgreed}.`;
                if (result.logV3) {
                    const c = result.logV3.meta.consent;
                    statement = `V2_CONSENT - Terms:${c.termsAccepted}, Privacy:${c.privacyPolicyAccepted}, Research:${c.dataDonationAllowed}`;
                }
                if (result.coupleData) {
                    statement = `DUAL CONSENT - Alpha[rec:${result.coupleData.userA.consentAgreed}, res:${result.coupleData.userA.researchConsentAgreed}] Beta[rec:${result.coupleData.userB.consentAgreed}, res:${result.coupleData.userB.researchConsentAgreed}]`;
                }
                result.consentStatement = statement;
                result.consentHash = await generateConsentHash(result);
            }

            if (result.logV2) {
                // Generate Data Hash for integrity Schema 1.0.0 (Stream B)
                const logData = JSON.stringify(result.logV2.features);
                const msgUint8 = new TextEncoder().encode(logData);
                const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
                result.logV2.meta = {
                    dataHash: Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('')
                };
            }

            if (result.logV3) {
                // Generate Data Hash for integrity Schema 2.0.0 (Stream B)
                const logData = JSON.stringify(result.logV3.metrics);
                const msgUint8 = new TextEncoder().encode(logData);
                const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
                result.logV3.meta.dataHash = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
            }

            const sanitizedResult = sanitizeForFirestore(result);

            await setDoc(resultRef, {
                ...sanitizedResult,
                createdAt: Timestamp.fromDate(new Date(result.createdAt)),
                updatedAt: Timestamp.now(),
            });

            // DUAL-STREAM PRIVACY COMPLIANCE: Raw audio is NEVER saved to persistent storage.
            // Feature extraction happens in memory, then audio is purged immediately.
            // (Audio upload code removed for extreme privacy)

            // Update global stats
            await updateGlobalStats();

            console.log('Result saved to Firestore (Features only):', result.id);
        } catch (error) {
            console.error('Failed to save to Firestore:', error);
        }
    }
}

/**
 * Save Mirror Log to Firestore for Asset-ization
 */
export async function saveMirrorLog(log: any, analysis: any): Promise<void> {
    if (!isFirebaseConfigured()) return;

    try {
        const db = getDb();
        const logId = `mirror_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        const logRef = doc(db, 'mirror_logs', logId);

        // Sanitize vectors and metadata
        const sanitizedData = sanitizeForFirestore({
            ...log,
            analysis,
            createdAt: Timestamp.now(),
            version: '1.0.0'
        });

        await setDoc(logRef, sanitizedData);
        console.log('>[ASSET] Mirror log secured in Firestore:', logId);
    } catch (error) {
        console.error('Failed to save Mirror log to Firestore:', error);
    }
}

/**
 * Fetch Mirror Logs for a specific user from Firestore
 */
export async function getMirrorLogs(userHash: string): Promise<any[]> {
    if (!isFirebaseConfigured() || !userHash) return [];

    try {
        const db = getDb();
        const { query, where, getDocs, orderBy } = await import('firebase/firestore');
        const q = query(
            collection(db, 'mirror_logs'),
            where('userHash', '==', userHash),
            orderBy('timestamp', 'desc')
        );

        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ...data,
                timestamp: data.timestamp?.toDate ? data.timestamp.toDate() : new Date(data.timestamp)
            };
        });
    } catch (error) {
        console.error('Failed to fetch Mirror logs:', error);
        return [];
    }
}

export async function unlockResult(resultId: string, email?: string): Promise<void> {
    if (!isFirebaseConfigured()) return;

    try {
        const db = getDb();
        const resultRef = doc(db, 'results', resultId);

        await updateDoc(resultRef, {
            isPremium: true,
            purchasedAt: new Date().toISOString(),
            updatedAt: Timestamp.now(),
            email: email || null
        });

        // Also update local storage cache if present
        if (typeof window !== 'undefined') {
            const localData = localStorage.getItem(`etchvox_result_${resultId}`);
            if (localData) {
                const result = JSON.parse(localData);
                result.isPremium = true;
                result.purchasedAt = new Date().toISOString();
                localStorage.setItem(`etchvox_result_${resultId}`, JSON.stringify(result));
            }
        }

        console.log(`✓ Result ${resultId} unlocked successfully`);
    } catch (error) {
        console.error('Failed to unlock result:', error);
        throw error;
    }
}

/**
 * Delete all Mirror Logs for a user from Firestore (Right to Erasure)
 */
export async function deleteMirrorLogs(userHash: string): Promise<boolean> {
    if (!isFirebaseConfigured() || !userHash) return false;

    try {
        const db = getDb();
        const { query, where, getDocs, deleteDoc } = await import('firebase/firestore');
        const q = query(
            collection(db, 'mirror_logs'),
            where('userHash', '==', userHash)
        );

        const snapshot = await getDocs(q);
        const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

        console.log(`✓ Purged ${snapshot.size} Mirror logs from Firestore for ${userHash}`);
        return true;
    } catch (error) {
        console.error('Failed to purge Mirror logs from Firestore:', error);
        return false;
    }
}

// Get result from Firestore or localStorage
export async function getResult(resultId: string): Promise<VoiceResult | null> {
    // Try localStorage first (faster)
    const localResult = localStorage.getItem(`etchvox_result_${resultId}`);
    if (localResult) {
        try {
            return JSON.parse(localResult) as VoiceResult;
        } catch {
            // Invalid JSON, try Firestore
        }
    }

    // Try Firestore
    if (isFirebaseConfigured()) {
        try {
            const db = getDb();
            const resultRef = doc(db, 'results', resultId);
            const docSnap = await getDoc(resultRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                const result: VoiceResult = {
                    id: resultId,
                    sessionId: data.sessionId,
                    typeCode: data.typeCode,
                    metrics: data.metrics,
                    accentOrigin: data.accentOrigin,
                    createdAt: data.createdAt?.toDate?.()?.toISOString() || data.createdAt,
                    locale: data.locale,
                    userAgent: data.userAgent,
                    country: data.country,
                    audioUrl: data.audioUrl,
                    audioPath: data.audioPath,
                    gender: data.gender,
                    birthYear: data.birthYear,
                    isPremium: data.isPremium,
                    purchasedAt: data.purchasedAt,
                    vaultEnabled: data.vaultEnabled,
                    toxicityProfile: data.toxicityProfile,
                    aiAnalysis: data.aiAnalysis,
                    mbti: data.mbti,
                    mode: data.mode,
                    coupleData: data.coupleData,
                    consentAgreed: data.consentAgreed || false,
                    researchConsentAgreed: data.researchConsentAgreed || false,
                    consentVersion: data.consentVersion || '0.0.0',
                    consentAt: data.consentAt || '',
                    wellnessConsentAgreed: data.wellnessConsentAgreed || false,
                    logV2: data.logV2,
                };

                // Cache in localStorage
                localStorage.setItem(`etchvox_result_${resultId}`, JSON.stringify(result));

                return result;
            }
        } catch (error) {
            console.error('Failed to get from Firestore:', error);
        }
    }

    return null;
}

// Upload audio file to Cloudflare R2 (via API)
export async function uploadAudio(
    resultId: string,
    audioBlob: Blob,
    consentAgreed: boolean = false
): Promise<{ url: string; path: string } | null> {
    try {
        const formData = new FormData();
        formData.append('file', audioBlob);
        formData.append('resultId', resultId);
        formData.append('consentAgreed', String(consentAgreed));

        const response = await fetch('/api/upload-audio', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Upload failed: ${response.statusText}`);
        }

        const data = await response.json();

        // Use the redirect API as the stored URL
        const proxyUrl = `/api/audio-url?id=${resultId}`;
        const storagePath = `r2://${data.path}`; // Internal reference

        console.log('Audio uploaded to R2:', storagePath);

        return { url: proxyUrl, path: storagePath };
    } catch (error) {
        console.error('Failed to upload audio to R2:', error);

        // Fallback or just return null
        return null; // For now, strict migration.
    }
}

// Update global stats counter
async function updateGlobalStats(): Promise<void> {
    if (!isFirebaseConfigured()) return;

    try {
        const db = getDb();
        const statsRef = doc(db, 'stats', 'global');

        await setDoc(statsRef, {
            totalScans: increment(1),
            lastUpdatedAt: Timestamp.now(),
        }, { merge: true });
    } catch (error) {
        console.error('Failed to update stats:', error);
    }
}

// Session management
export function getSessionId(): string {
    if (typeof window === 'undefined') {
        return `session_${Date.now()}`;
    }

    let sessionId = localStorage.getItem('etchvox_session');
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
        localStorage.setItem('etchvox_session', sessionId);
    }

    return sessionId;
}

// Get history from localStorage
export async function getHistory(): Promise<VoiceResult[]> {
    if (typeof window === 'undefined') return [];

    try {
        const historyIds = JSON.parse(localStorage.getItem('etchvox_history') || '[]');
        const results = historyIds.map((id: string) => {
            const data = localStorage.getItem(`etchvox_result_${id}`);
            return data ? JSON.parse(data) : null;
        }).filter((r: any) => r !== null);

        return results;
    } catch (e) {
        console.error('Failed to get history:', e);
        return [];
    }
}

/**
 * Phase 1: Request an OTP to be sent to the user's email.
 */
export async function requestSyncOtp(email: string): Promise<boolean> {
    try {
        const response = await fetch('/api/results/restore', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        return response.ok;
    } catch (e) {
        console.error('Failed to request OTP:', e);
        return false;
    }
}

/**
 * Phase 2: Verify the OTP and synchronize the history.
 */
export async function verifySyncOtp(email: string, otp: string): Promise<boolean> {
    try {
        const response = await fetch('/api/results/verify-otp', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp }),
        });

        if (!response.ok) return false;

        const { results, subscription } = await response.json();

        // 1. Restore Subscription State if present
        if (subscription) {
            localStorage.setItem('etchvox_subscription', JSON.stringify({
                isActive: subscription.status === 'active',
                expiresAt: subscription.expiresAt,
                plan: subscription.plan
            }));
            console.log(`[Storage] Subscription restored for ${email}: ${subscription.plan}`);
        }

        if (!results || results.length === 0) return true;

        // Update local history index
        const historyIds = JSON.parse(localStorage.getItem('etchvox_history') || '[]');

        results.forEach((res: VoiceResult) => {
            localStorage.setItem(`etchvox_result_${res.id}`, JSON.stringify(res));
            if (!historyIds.includes(res.id)) {
                historyIds.push(res.id);
            }
        });

        // Re-sort by createdAt descending
        const allStoredResults = historyIds.map((id: string) => {
            const data = localStorage.getItem(`etchvox_result_${id}`);
            return data ? JSON.parse(data) : null;
        }).filter((r: any) => r !== null);

        allStoredResults.sort((a: any, b: any) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const sortedIds = allStoredResults.map((r: any) => r.id);
        localStorage.setItem('etchvox_history', JSON.stringify(sortedIds.slice(0, 50)));

        return true;
    } catch (e) {
        console.error('Failed to verify OTP:', e);
        return false;
    }
}

// Remove a result from local history and optionally from server
export async function removeFromHistory(id: string, deleteFromServer: boolean = false): Promise<void> {
    try {
        // 1. Remove from index
        const historyIds = JSON.parse(localStorage.getItem('etchvox_history') || '[]');
        const updatedIds = historyIds.filter((itemId: string) => itemId !== id);
        localStorage.setItem('etchvox_history', JSON.stringify(updatedIds));

        // 2. Remove actual data from local storage
        localStorage.removeItem(`etchvox_result_${id}`);

        // 3. Optional server-side deletion
        if (deleteFromServer) {
            await fetch('/api/results/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resultId: id }),
            });
        }
    } catch (e) {
        console.error('Failed to remove from history:', e);
    }
}

/**
 * Upload a Mirror audio/video blob to R2 for cross-device persistence
 */
export async function uploadMirrorBlob(
    userHash: string,
    dayIndex: number,
    blob: Blob
): Promise<boolean> {
    if (!isFirebaseConfigured()) return false;

    try {
        const formData = new FormData();
        formData.append('file', blob);
        // We use a special ID format for Mirror blobs to distinguish them in R2
        const mirrorId = `mirror_${userHash}_day${dayIndex}`;
        formData.append('resultId', mirrorId);
        formData.append('consentAgreed', 'true'); // Mirror users have agreed to wellness consent

        const response = await fetch('/api/upload-audio', {
            method: 'POST',
            body: formData,
        });

        return response.ok;
    } catch (error) {
        console.error('Failed to upload mirror blob to R2:', error);
        return false;
    }
}

/**
 * Fetch all cloud-cached Mirror blobs for a user
 * Placeholder for future implementation using a specialized list API
 */
export async function fetchMirrorBlobs(userHash: string): Promise<{ dayIndex: number; blob: Blob }[]> {
    if (!isFirebaseConfigured() || !userHash) return [];

    // Future: implement fetch logic from R2 list API
    return [];
}

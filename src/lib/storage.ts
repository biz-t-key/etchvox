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
    accentOrigin: string;
    createdAt: string;
    locale: string;
    userAgent?: string;
    country?: string;
    audioUrl?: string;
    audioPath?: string;
    isPremium?: boolean;
    vaultEnabled?: boolean;
    purchasedAt?: string;
    toxicityProfile?: ToxicityProfile;
    aiAnalysis?: string; // Markdown text from Gemini
    mbti?: string; // User's self-reported MBTI
    email?: string; // Customer email from payment provider (BMAC)
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
    logV2?: import('./types').VoiceLogV2; // Optional enriched Version 2.0 log
    logV3?: import('./types').VoiceLogV3; // New Schema 2.0.0
    spyMetadata?: { origin: string; target: string };
    spyAnalysis?: { score: number; reason: string; isGhost: boolean; stamp?: string };
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

            await setDoc(resultRef, {
                ...result,
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
                    vaultEnabled: data.vaultEnabled,
                    purchasedAt: data.purchasedAt,
                    toxicityProfile: data.toxicityProfile,
                    aiAnalysis: data.aiAnalysis,
                    mbti: data.mbti,
                    coupleData: data.coupleData,
                    consentAgreed: data.consentAgreed || false,
                    researchConsentAgreed: data.researchConsentAgreed || false,
                    consentVersion: data.consentVersion || '0.0.0',
                    consentAt: data.consentAt || '',
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

        const { results } = await response.json();
        if (!results || results.length === 0) return true; // Could be success with 0 results

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

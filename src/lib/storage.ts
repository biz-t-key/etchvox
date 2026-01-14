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
}

// Save result to Firestore (and localStorage as fallback)
export async function saveResult(result: VoiceResult, audioBlob?: Blob): Promise<void> {
    // Always save to localStorage first (fallback)
    localStorage.setItem(`etchvox_result_${result.id}`, JSON.stringify(result));
    localStorage.setItem('etchvox_latest_result', result.id);

    // If Firebase is configured, also save to Firestore
    if (isFirebaseConfigured()) {
        try {
            const db = getDb();
            const resultRef = doc(db, 'results', result.id);

            await setDoc(resultRef, {
                ...result,
                createdAt: Timestamp.fromDate(new Date(result.createdAt)),
                updatedAt: Timestamp.now(),
            });

            // ✅ 全ユーザーの音声を保存（ML訓練 & Vault機能用）
            if (audioBlob) {
                const uploadResult = await uploadAudio(result.id, audioBlob);
                if (uploadResult) {
                    // Update result with audio URL
                    await updateDoc(resultRef, {
                        audioUrl: uploadResult.url,
                        audioPath: uploadResult.path,
                    });

                    // Update localStorage as well
                    result.audioUrl = uploadResult.url;
                    result.audioPath = uploadResult.path;
                    localStorage.setItem(`etchvox_result_${result.id}`, JSON.stringify(result));

                    console.log('✅ Audio saved for all users:', uploadResult.path);
                }
            }

            // Update global stats
            await updateGlobalStats();

            console.log('Result saved to Firestore:', result.id);
        } catch (error) {
            console.error('Failed to save to Firestore:', error);
            // localStorage fallback already saved
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
                    isPremium: data.isPremium,
                    vaultEnabled: data.vaultEnabled,
                    purchasedAt: data.purchasedAt,
                    toxicityProfile: data.toxicityProfile,
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

// Upload audio file to Firebase Storage
export async function uploadAudio(
    resultId: string,
    audioBlob: Blob
): Promise<{ url: string; path: string } | null> {
    if (!isFirebaseConfigured()) {
        console.warn('Firebase not configured, skipping audio upload');
        return null;
    }

    try {
        const storage = getStorageInstance();
        const path = `audio/${resultId}.webm`;
        const audioRef = ref(storage, path);

        await uploadBytes(audioRef, audioBlob, {
            contentType: 'audio/webm',
            customMetadata: {
                recordedAt: new Date().toISOString(),
            },
        });

        const url = await getDownloadURL(audioRef);

        console.log('Audio uploaded:', path);

        return { url, path };
    } catch (error) {
        console.error('Failed to upload audio:', error);
        return null;
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

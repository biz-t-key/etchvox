// Vault Audio Re-Upload Service
// After Vault purchase, allow user to upload their raw audio

import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { doc, updateDoc } from 'firebase/firestore';
import { getDb, getStorageInstance, isFirebaseConfigured } from './firebase';

export async function enableVaultForResult(
    resultId: string,
    audioBlob: Blob
): Promise<{ success: boolean; audioUrl?: string }> {
    if (!isFirebaseConfigured()) {
        console.warn('Firebase not configured');
        return { success: false };
    }

    try {
        // Upload audio to Firebase Storage
        const storage = getStorageInstance();
        const path = `vault/${resultId}.webm`;
        const audioRef = ref(storage, path);

        await uploadBytes(audioRef, audioBlob, {
            contentType: 'audio/webm',
            customMetadata: {
                vaultEnabled: 'true',
                uploadedAt: new Date().toISOString(),
            },
        });

        const audioUrl = await getDownloadURL(audioRef);

        // Update Firestore
        const db = getDb();
        const resultRef = doc(db, 'results', resultId);
        await updateDoc(resultRef, {
            vaultEnabled: true,
            audioUrl,
            audioPath: path,
            vaultActivatedAt: new Date().toISOString(),
        });

        console.log('✅ Vault enabled for result:', resultId);

        return { success: true, audioUrl };
    } catch (error) {
        console.error('Failed to enable Vault:', error);
        return { success: false };
    }
}

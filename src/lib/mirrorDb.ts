// IndexedDB utility for storing large audio blobs
// Used for the 7-day Voice Mirror Recap

const DB_NAME = 'EtchvoxMirrorDB';
const STORE_NAME = 'audio_blobs';
const DB_VERSION = 1;

export async function initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            const db = (event.target as IDBOpenDBRequest).result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME);
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export async function saveAudioBlob(key: string, blob: Blob): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(blob, key);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function getAudioBlob(key: string): Promise<Blob | null> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(key);

        request.onsuccess = () => resolve(request.result || null);
        request.onerror = () => reject(request.error);
    });
}

export async function clearAudioBlobs(): Promise<void> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
}

export async function getAllAudioBlobs(userHash: string): Promise<{ dayIndex: number; blob: Blob }[]> {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.openCursor();
        const results: { dayIndex: number; blob: Blob }[] = [];

        request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
                const key = cursor.key.toString();
                if (key.startsWith(`voice_blob_${userHash}_`)) {
                    const dayIndex = parseInt(key.split('_').pop() || '0');
                    results.push({ dayIndex, blob: cursor.value });
                }
                cursor.continue();
            } else {
                resolve(results.sort((a, b) => a.dayIndex - b.dayIndex));
            }
        };
        request.onerror = () => reject(request.error);
    });
}

// Firebase Configuration for EtchVox
// Client-side SDK only (no Admin SDK needed)

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;

function initializeFirebase() {
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig);

        // Initialize App Check (Bot protection)
        if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
            try {
                initializeAppCheck(app, {
                    provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY),
                    isTokenAutoRefreshEnabled: true
                });
                console.log('✅ Firebase App Check initialized (Bot protection active)');
            } catch (error) {
                console.warn('⚠️ App Check failed to initialize:', error);
            }
        }
    } else {
        app = getApps()[0];
    }

    db = getFirestore(app);
    storage = getStorage(app);

    return { app, db, storage };
}

// Check if Firebase is configured
export function isFirebaseConfigured(): boolean {
    return !!(
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
        process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
    );
}

// Get Firebase instances
export function getFirebaseApp(): FirebaseApp {
    if (!app) initializeFirebase();
    return app;
}

export function getDb(): Firestore {
    if (!db) initializeFirebase();
    return db;
}

export function getStorageInstance(): FirebaseStorage {
    if (!storage) initializeFirebase();
    return storage;
}

// Export initialized instances
export { app, db, storage };

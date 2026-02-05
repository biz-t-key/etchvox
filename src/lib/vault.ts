import { getDb, isFirebaseConfigured } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function secureVault(vectors: any, metrics: any, context: any, hasBioConsent: boolean, hasWellnessConsent: boolean = false) {
    // 1. 同意がない場合は絶対に保存しない (GDPR順守の絶対条件)
    if (!hasBioConsent) {
        console.log(">[PRIVACY] No biometric consent. Data discarded.");
        return;
    }

    // 2. Firebaseが設定されているか確認
    if (!isFirebaseConfigured()) {
        console.warn(">[VAULT] Firebase not configured. Skipping remote vault storage.");
        return;
    }

    // 3. 削除用トークンの生成 (ユーザーのブラウザにだけ残す)
    const recoveryToken = crypto.randomUUID();
    localStorage.setItem('etchvox_recovery_token', recoveryToken);

    // 4. データサニタイズ (undefinedをFirestoreが受け付けないためnullに変換)
    const sanitize = (val: any) => val === undefined ? null : val;

    const payload = {
        created_at: serverTimestamp(),
        recovery_token: recoveryToken,
        consent_version: 'v1.0_global',
        is_eu_resident: isEuTimezone(),
        mode: sanitize(context.mode),
        bio_consent_granted: true,
        wellness_consent_granted: hasWellnessConsent,

        vec_1: sanitize(vectors.step1),
        vec_2: sanitize(vectors.step2),
        vec_3: sanitize(vectors.step3),

        latency_ms: Math.round(metrics.latency || 0),
        pitch_var: parseFloat((metrics.pitchVar || 0).toFixed(4)),
        snr_db: parseFloat((metrics.hnr || 0).toFixed(2)),
        noise_db: parseFloat((metrics.noiseFloor || 0).toFixed(2)),

        metadata: sanitize(context.metadata) || {},
        lang_code: typeof navigator !== 'undefined' ? navigator.language : 'en',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        result_label: sanitize(context.result) || 'REJECTED',
        ai_prob: sanitize(context.aiScore) || 0.0
    };

    try {
        const db = getDb();
        const vaultCollection = collection(db, 'voice_assets');
        console.log(">[VAULT] Attempting to secure asset in collection: voice_assets");
        const docRef = await addDoc(vaultCollection, payload);
        console.log(">[VAULT] Asset secured successfully. Doc ID:", docRef.id);
        console.log(">[VAULT] Recovery Token saved locally (localStorage).");
    } catch (err: any) {
        console.error(">[ERROR] Vault access failed at Firestore level.");
        console.error(">[ERROR] Full error details:", err);
        if (err.code === 'permission-denied') {
            console.error(">[CRITICAL] Firestore Security Rules are blocking 'voice_assets' collection.");
        }
    }
}

function isEuTimezone() {
    if (typeof Intl === 'undefined') return false;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz.startsWith('Europe/');
}

import { getDb } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function secureVault(vectors: any, metrics: any, context: any, hasBioConsent: boolean) {
    // 1. 同意がない場合は絶対に保存しない (GDPR順守の絶対条件)
    if (!hasBioConsent) {
        console.log(">[PRIVACY] No biometric consent. Data discarded.");
        return;
    }

    // 2. 削除用トークンの生成 (ユーザーのブラウザにだけ残す)
    const recoveryToken = crypto.randomUUID();
    localStorage.setItem('etchvox_recovery_token', recoveryToken);

    const payload = {
        created_at: serverTimestamp(),
        recovery_token: recoveryToken,
        consent_version: 'v1.0_global',
        is_eu_resident: isEuTimezone(),
        mode: context.mode || 'unknown',
        bio_consent_granted: true,

        vec_1: vectors.step1 || null,
        vec_2: vectors.step2 || null,
        vec_3: vectors.step3 || null,

        latency_ms: Math.round(metrics.latency || 0),
        pitch_var: parseFloat((metrics.pitchVar || 0).toFixed(4)),
        snr_db: parseFloat((metrics.hnr || 0).toFixed(2)),
        noise_db: parseFloat((metrics.noiseFloor || 0).toFixed(2)),

        metadata: context.metadata || {},
        lang_code: typeof navigator !== 'undefined' ? navigator.language : 'en',
        user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
        result_label: context.result || 'REJECTED',
        ai_prob: context.aiScore || 0.0
    };

    try {
        const db = getDb();
        const vaultCollection = collection(db, 'voice_assets');
        await addDoc(vaultCollection, payload);
        console.log(">[VAULT] Asset secured. Recovery Token saved locally (Firestore).");
    } catch (err) {
        console.error(">[ERROR] Vault access failed:", err);
    }
}

function isEuTimezone() {
    if (typeof Intl === 'undefined') return false;
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz.startsWith('Europe/');
}

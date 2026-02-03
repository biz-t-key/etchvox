// Zero-Knowledge Authentication Service
// Implements wallet-style mnemonic auth for Voice Mirror

import * as bip39 from 'bip39';

const STORAGE_KEY = 'etchvox_mnemonic';
const USER_HASH_KEY = 'etchvox_user_hash';

export interface MnemonicAuth {
    mnemonic: string;
    userHash: string;
}

/**
 * Generate a new 12-word BIP39 mnemonic phrase
 */
export function generateMnemonic(): string {
    return bip39.generateMnemonic(128); // 128 bits = 12 words
}

/**
 * Derive a SHA-256 hash from the mnemonic to use as user_hash
 */
export async function getUserHash(mnemonic: string): Promise<string> {
    // Validate mnemonic first
    if (!bip39.validateMnemonic(mnemonic)) {
        throw new Error('Invalid mnemonic phrase');
    }

    const encoder = new TextEncoder();
    const data = encoder.encode(mnemonic);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    return hashHex;
}

/**
 * Save mnemonic to localStorage (encrypted would be better in production)
 */
export function saveMnemonic(mnemonic: string): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(STORAGE_KEY, mnemonic);
        console.log('✓ Mnemonic saved to local storage');
    } catch (e) {
        console.error('Failed to save mnemonic:', e);
    }
}

/**
 * Load mnemonic from localStorage
 */
export function loadMnemonic(): string | null {
    if (typeof window === 'undefined') return null;

    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
        console.error('Failed to load mnemonic:', e);
        return null;
    }
}

/**
 * Save user hash to localStorage for quick access
 */
export function saveUserHash(hash: string): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem(USER_HASH_KEY, hash);
    } catch (e) {
        console.error('Failed to save user hash:', e);
    }
}

/**
 * Load user hash from localStorage
 */
export function loadUserHash(): string | null {
    if (typeof window === 'undefined') return null;

    try {
        return localStorage.getItem(USER_HASH_KEY);
    } catch (e) {
        console.error('Failed to load user hash:', e);
        return null;
    }
}

/**
 * Initialize or restore user identity
 * Returns { mnemonic, userHash, isNew }
 */
export async function initializeAuth(): Promise<{ mnemonic: string; userHash: string; isNew: boolean }> {
    // Try to load existing mnemonic
    const existingMnemonic = loadMnemonic();

    if (existingMnemonic) {
        // Restore existing identity
        const userHash = await getUserHash(existingMnemonic);
        saveUserHash(userHash);
        return {
            mnemonic: existingMnemonic,
            userHash,
            isNew: false
        };
    }

    // Generate new identity
    const newMnemonic = generateMnemonic();
    const userHash = await getUserHash(newMnemonic);

    saveMnemonic(newMnemonic);
    saveUserHash(userHash);

    return {
        mnemonic: newMnemonic,
        userHash,
        isNew: true
    };
}

/**
 * Restore identity from a backup mnemonic phrase
 */
export async function restoreFromMnemonic(mnemonic: string): Promise<{ userHash: string }> {
    // Validate first
    if (!bip39.validateMnemonic(mnemonic)) {
        throw new Error('Invalid mnemonic phrase. Please check your 12 words.');
    }

    const userHash = await getUserHash(mnemonic);

    saveMnemonic(mnemonic);
    saveUserHash(userHash);

    return { userHash };
}

/**
 * Clear all auth data (logout)
 */
export function clearAuth(): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem(STORAGE_KEY);
        localStorage.removeItem(USER_HASH_KEY);
        console.log('✓ Auth data cleared');
    } catch (e) {
        console.error('Failed to clear auth:', e);
    }
}

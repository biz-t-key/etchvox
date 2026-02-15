import crypto from 'crypto';

/**
 * Normalizes an email address for consistent hashing.
 * Lowercases and trims whitespace.
 */
export function normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
}

/**
 * Generates a SHA-256 hash of a normalized email address.
 * Use this to store "fingerprints" of emails without storing the PII itself.
 */
export function hashEmail(email: string): string {
    const normalized = normalizeEmail(email);
    // Use the native crypto module if in Node context (API routes)
    // or SubtleCrypto if in browser context.
    // For simplicity and consistency in this project's Next.js setup:
    const hash = require('crypto').createHash('sha256').update(normalized).digest('hex');
    return hash;
}

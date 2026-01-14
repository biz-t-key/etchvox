// Permalink ID Generation
// Creates unique, readable IDs for result pages

import { customAlphabet } from 'nanoid';

// Use readable characters only (exclude 0/O, 1/I/l for clarity)
const alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
const nanoid = customAlphabet(alphabet, 7);

// Generate a unique result ID in format XXX-XXXX
export function generateResultId(): string {
    const id = nanoid();
    return `${id.slice(0, 3)}-${id.slice(3)}`;
}

// Validate result ID format
export function isValidResultId(id: string): boolean {
    const pattern = /^[23456789A-HJ-NP-Z]{3}-[23456789A-HJ-NP-Z]{4}$/;
    return pattern.test(id);
}

// Generate a session ID for tracking retries
export function generateSessionId(): string {
    return `session_${nanoid()}`;
}

// Get or create session ID from localStorage
export function getSessionId(): string {
    if (typeof window === 'undefined') {
        return generateSessionId();
    }

    const stored = localStorage.getItem('etchvox_session');
    if (stored) {
        return stored;
    }

    const newSession = generateSessionId();
    localStorage.setItem('etchvox_session', newSession);
    return newSession;
}

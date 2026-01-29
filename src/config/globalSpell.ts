/**
 * Global Spell Script V1 (Language-Agnostic Phoneme Pattern)
 * 
 * Designed to eliminate semantic meaning and cultural bias while ensuring
 * comprehensive phonetic coverage for acoustic analysis.
 */

export interface ScriptDefinition {
    id: string;
    version: string;
    script: string;
    duration: number; // Expected duration in seconds
    ui: string; // UI display text
    phonetic_coverage: string[]; // Target phonemes
    syllable_count: number;
}

/**
 * The Global Spell - Universal Phoneme Pattern
 * 
 * Ensures coverage of:
 * - Plosives: P, T, K
 * - Vowels: A, I, U, E, O  
 * - Fricatives: S, Z
 * - Nasals: M, N
 * 
 * Total: 8 syllables across 2 sentences
 */
export const GLOBAL_SPELL: ScriptDefinition = {
    id: 'spell_global_v1',
    version: '1.0.0',
    script: 'Vala-moro kesta, zinjibar. Pata-kaka tulu, shimin.',
    duration: 8,
    ui: 'Reading Universal Phoneme Pattern...',
    phonetic_coverage: ['P', 'T', 'K', 'V', 'L', 'M', 'R', 'S', 'Z', 'J', 'B', 'N', 'A', 'I', 'U', 'E', 'O'],
    syllable_count: 8,
};

/**
 * Legacy scripts (for backward compatibility during migration)
 */
export const LEGACY_SCRIPTS = {
    calibration: {
        id: 'legacy_calibration_v1',
        script: 'I parked my car in the garage to drink a bottle of water. I am definitely not a robot.',
        duration: 10,
        ui: 'Calibrating Location Data...',
    },
    stress: {
        id: 'legacy_stress_v1',
        script: 'Warning! System failure! Shut it down NOW!',
        duration: 8,
        ui: 'Testing Vocal Stress Levels...',
    },
    speed: {
        id: 'legacy_speed_v1',
        script: 'Six systems synthesized sixty-six signals simultaneously.',
        duration: 8,
        ui: 'Analyzing Processing Speed...',
    },
};

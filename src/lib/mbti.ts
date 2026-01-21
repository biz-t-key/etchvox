// MBTI Type System
// 16 personality types organized into 4 groups

export type MBTIType =
    | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'  // Analysts (Purple)
    | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'  // Diplomats (Green)
    | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'  // Sentinels (Blue)
    | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP'; // Explorers (Yellow)

export type MBTIGroup = 'Analysts' | 'Diplomats' | 'Sentinels' | 'Explorers';

export interface MBTIInfo {
    code: MBTIType;
    nickname: string;
    group: MBTIGroup;
    color: string;
}

export const mbtiGroups: Record<MBTIGroup, { color: string; emoji: string }> = {
    Analysts: {
        color: '#8E44AD', // Purple
        emoji: '🧠',
    },
    Diplomats: {
        color: '#27AE60', // Green
        emoji: '💚',
    },
    Sentinels: {
        color: '#2980B9', // Blue
        emoji: '🛡️',
    },
    Explorers: {
        color: '#F1C40F', // Yellow
        emoji: '🌟',
    },
};

export const mbtiTypes: Record<MBTIType, MBTIInfo> = {
    // Analysts (NT)
    INTJ: { code: 'INTJ', nickname: 'The Architect', group: 'Analysts', color: '#8E44AD' },
    INTP: { code: 'INTP', nickname: 'The Logician', group: 'Analysts', color: '#8E44AD' },
    ENTJ: { code: 'ENTJ', nickname: 'The Commander', group: 'Analysts', color: '#8E44AD' },
    ENTP: { code: 'ENTP', nickname: 'The Debater', group: 'Analysts', color: '#8E44AD' },

    // Diplomats (NF)
    INFJ: { code: 'INFJ', nickname: 'The Advocate', group: 'Diplomats', color: '#27AE60' },
    INFP: { code: 'INFP', nickname: 'The Mediator', group: 'Diplomats', color: '#27AE60' },
    ENFJ: { code: 'ENFJ', nickname: 'The Protagonist', group: 'Diplomats', color: '#27AE60' },
    ENFP: { code: 'ENFP', nickname: 'The Campaigner', group: 'Diplomats', color: '#27AE60' },

    // Sentinels (SJ)
    ISTJ: { code: 'ISTJ', nickname: 'The Logistician', group: 'Sentinels', color: '#2980B9' },
    ISFJ: { code: 'ISFJ', nickname: 'The Defender', group: 'Sentinels', color: '#2980B9' },
    ESTJ: { code: 'ESTJ', nickname: 'The Executive', group: 'Sentinels', color: '#2980B9' },
    ESFJ: { code: 'ESFJ', nickname: 'The Consul', group: 'Sentinels', color: '#2980B9' },

    // Explorers (SP)
    ISTP: { code: 'ISTP', nickname: 'The Virtuoso', group: 'Explorers', color: '#F1C40F' },
    ISFP: { code: 'ISFP', nickname: 'The Adventurer', group: 'Explorers', color: '#F1C40F' },
    ESTP: { code: 'ESTP', nickname: 'The Entrepreneur', group: 'Explorers', color: '#F1C40F' },
    ESFP: { code: 'ESFP', nickname: 'The Entertainer', group: 'Explorers', color: '#F1C40F' },
};

export const mbtiOrder: MBTIType[] = [
    // Analysts
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    // Diplomats
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    // Sentinels
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    // Explorers
    'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

/**
 * Calculates the "Identity Gap" level (0-100) between self-reported MBTI
 * and the actual biometric vocal metrics recorded.
 */
export function calculateGapLevel(mbti: MBTIType, metrics: { pitch: number; speed: number; vibe: number; tone: number }): number {
    // Simplified psycho-acoustic mapping
    // We define "Ideal" metric centers for each MBTI trait
    const isE = mbti.startsWith('E');
    const isN = mbti[1] === 'N';
    const isF = mbti[2] === 'F';
    const isP = mbti.endsWith('P');

    // Targets (Normalized 0-1)
    const targetPitch = isE ? 0.7 : 0.4;  // Extraverts tend to have higher social energy/pitch
    const targetSpeed = isP ? 0.8 : 0.5;  // Perceivers often have more dynamic/variable speed
    const targetVibe = isN ? 0.7 : 0.3;   // Intuitive types often have higher vocal variance
    const targetTone = isF ? 0.3 : 0.7;   // Feeling types often have warmer (lower centroid) tones

    // Actuals (Normalized - pitch and tone need scaling as they are raw Hz)
    // Based on analyzer.ts ranges usually seen
    const normPitch = Math.min(Math.max((metrics.pitch - 80) / 220, 0), 1);
    const normTone = Math.min(Math.max((metrics.tone - 500) / 3500, 0), 1);
    const normSpeed = metrics.speed;
    const normVibe = metrics.vibe;

    // Calculate absolute Euclidean distance
    const dist = Math.sqrt(
        Math.pow(targetPitch - normPitch, 2) +
        Math.pow(targetSpeed - normSpeed, 2) +
        Math.pow(targetVibe - normVibe, 2) +
        Math.pow(targetTone - normTone, 2)
    );

    // Max distance is 2.0 (sqrt of 1^2 * 4). Scale to 0-100.
    // We add a baseline randomness for "humanness"
    let gap = (dist / 1.5) * 100;

    // Salt the gap based on the specific type personality to ensure 
    // it's not just a flat distance but feels "personal"
    const salt = (mbti.charCodeAt(0) + mbti.charCodeAt(3)) % 15;
    gap += salt;

    return Math.min(Math.max(Math.round(gap), 12), 98);
}

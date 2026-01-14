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

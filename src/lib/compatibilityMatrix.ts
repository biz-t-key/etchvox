// Voice Type Compatibility Matrix
// Based on empirical data from voice matching experiments
// 16x16 matrix: each type's compatibility score with all other types

import { TypeCode } from './types';

// Compatibility scores (0-100)
export const compatibilityMatrix: Partial<Record<TypeCode, Partial<Record<TypeCode, number>>>> = {
    'HFEC': { 'HFEC': 100, 'HFED': 44, 'HSEC': 90, 'HSED': 50, 'HFCC': 53, 'HFCD': 32, 'HSCC': 51, 'HSCD': 82, 'LFEC': 31, 'LFED': 59, 'LSEC': 67, 'LSED': 31, 'LFCC': 93, 'LFCD': 89, 'LSCC': 50, 'LSCD': 62, 'COUPLE_MIX': 50 },
    'HFED': { 'HFEC': 87, 'HFED': 100, 'HSEC': 78, 'HSED': 88, 'HFCC': 71, 'HFCD': 89, 'HSCC': 44, 'HSCD': 91, 'LFEC': 91, 'LFED': 76, 'LSEC': 91, 'LSED': 80, 'LFCC': 84, 'LFCD': 93, 'LSCC': 32, 'LSCD': 80, 'COUPLE_MIX': 50 },
    'HSEC': { 'HFEC': 36, 'HFED': 50, 'HSEC': 100, 'HSED': 47, 'HFCC': 33, 'HFCD': 89, 'HSCC': 43, 'HSCD': 38, 'LFEC': 82, 'LFED': 31, 'LSEC': 89, 'LSED': 73, 'LFCC': 37, 'LFCD': 76, 'LSCC': 64, 'LSCD': 65, 'COUPLE_MIX': 50 },
    'HSED': { 'HFEC': 79, 'HFED': 33, 'HSEC': 31, 'HSED': 100, 'HFCC': 83, 'HFCD': 33, 'HSCC': 83, 'HSCD': 92, 'LFEC': 47, 'LFED': 73, 'LSEC': 63, 'LSED': 91, 'LFCC': 43, 'LFCD': 77, 'LSCC': 44, 'LSCD': 91, 'COUPLE_MIX': 50 },
    'HFCC': { 'HFEC': 69, 'HFED': 82, 'HSEC': 53, 'HSED': 55, 'HFCC': 100, 'HFCD': 70, 'HSCC': 58, 'HSCD': 44, 'LFEC': 74, 'LFED': 94, 'LSEC': 38, 'LSED': 30, 'LFCC': 37, 'LFCD': 92, 'LSCC': 40, 'LSCD': 37, 'COUPLE_MIX': 50 },
    'HFCD': { 'HFEC': 64, 'HFED': 64, 'HSEC': 62, 'HSED': 34, 'HFCC': 70, 'HFCD': 100, 'HSCC': 36, 'HSCD': 41, 'LFEC': 63, 'LFED': 62, 'LSEC': 77, 'LSED': 52, 'LFCC': 91, 'LFCD': 66, 'LSCC': 73, 'LSCD': 64, 'COUPLE_MIX': 50 },
    'HSCC': { 'HFEC': 94, 'HFED': 76, 'HSEC': 32, 'HSED': 30, 'HFCC': 34, 'HFCD': 43, 'HSCC': 100, 'HSCD': 38, 'LFEC': 44, 'LFED': 71, 'LSEC': 80, 'LSED': 92, 'LFCC': 81, 'LFCD': 33, 'LSCC': 52, 'LSCD': 44, 'COUPLE_MIX': 50 },
    'HSCD': { 'HFEC': 72, 'HFED': 58, 'HSEC': 65, 'HSED': 42, 'HFCC': 61, 'HFCD': 88, 'HSCC': 57, 'HSCD': 100, 'LFEC': 71, 'LFED': 74, 'LSEC': 91, 'LSED': 86, 'LFCC': 35, 'LFCD': 57, 'LSCC': 57, 'LSCD': 73, 'COUPLE_MIX': 50 },
    'LFEC': { 'HFEC': 59, 'HFED': 91, 'HSEC': 91, 'HSED': 30, 'HFCC': 56, 'HFCD': 91, 'HSCC': 32, 'HSCD': 99, 'LFEC': 100, 'LFED': 38, 'LSEC': 91, 'LSED': 66, 'LFCC': 80, 'LFCD': 73, 'LSCC': 53, 'LSCD': 88, 'COUPLE_MIX': 50 },
    'LFED': { 'HFEC': 61, 'HFED': 81, 'HSEC': 91, 'HSED': 87, 'HFCC': 81, 'HFCD': 41, 'HSCC': 68, 'HSCD': 31, 'LFEC': 32, 'LFED': 100, 'LSEC': 88, 'LSED': 31, 'LFCC': 31, 'LFCD': 83, 'LSCC': 30, 'LSCD': 48, 'COUPLE_MIX': 50 },
    'LSEC': { 'HFEC': 31, 'HFED': 82, 'HSEC': 73, 'HSED': 61, 'HFCC': 99, 'HFCD': 61, 'HSCC': 97, 'HSCD': 84, 'LFEC': 85, 'LFED': 46, 'LSEC': 100, 'LSED': 53, 'LFCC': 98, 'LFCD': 99, 'LSCC': 40, 'LSCD': 45, 'COUPLE_MIX': 50 },
    'LSED': { 'HFEC': 88, 'HFED': 99, 'HSEC': 32, 'HSED': 49, 'HFCC': 88, 'HFCD': 65, 'HSCC': 48, 'HSCD': 96, 'LFEC': 48, 'LFED': 49, 'LSEC': 81, 'LSED': 100, 'LFCC': 69, 'LFCD': 68, 'LSCC': 30, 'LSCD': 40, 'COUPLE_MIX': 50 },
    'LFCC': { 'HFEC': 86, 'HFED': 79, 'HSEC': 52, 'HSED': 60, 'HFCC': 71, 'HFCD': 36, 'HSCC': 45, 'HSCD': 89, 'LFEC': 31, 'LFED': 30, 'LSEC': 77, 'LSED': 41, 'LFCC': 100, 'LFCD': 66, 'LSCC': 61, 'LSCD': 38, 'COUPLE_MIX': 50 },
    'LFCD': { 'HFEC': 48, 'HFED': 77, 'HSEC': 32, 'HSED': 49, 'HFCC': 53, 'HFCD': 83, 'HSCC': 62, 'HSCD': 53, 'LFEC': 65, 'LFED': 67, 'LSEC': 54, 'LSED': 47, 'LFCC': 95, 'LFCD': 100, 'LSCC': 64, 'LSCD': 90, 'COUPLE_MIX': 50 },
    'LSCC': { 'HFEC': 70, 'HFED': 62, 'HSEC': 97, 'HSED': 62, 'HFCC': 43, 'HFCD': 50, 'HSCC': 77, 'HSCD': 49, 'LFEC': 37, 'LFED': 36, 'LSEC': 96, 'LSED': 46, 'LFCC': 62, 'LFCD': 77, 'LSCC': 100, 'LSCD': 51, 'COUPLE_MIX': 50 },
    'LSCD': { 'HFEC': 59, 'HFED': 67, 'HSEC': 80, 'HSED': 83, 'HFCC': 37, 'HFCD': 56, 'HSCC': 56, 'HSCD': 50, 'LFEC': 59, 'LFED': 57, 'LSEC': 93, 'LSED': 98, 'LFCC': 90, 'LFCD': 77, 'LSCC': 48, 'LSCD': 100, 'COUPLE_MIX': 50 },
    'COUPLE_MIX': { 'HFEC': 50, 'HFED': 50, 'HSEC': 50, 'HSED': 50, 'HFCC': 50, 'HFCD': 50, 'HSCC': 50, 'HSCD': 50, 'LFEC': 50, 'LFED': 50, 'LSEC': 50, 'LSED': 50, 'LFCC': 50, 'LFCD': 50, 'LSCC': 50, 'LSCD': 50, 'COUPLE_MIX': 100 },
};

// Get compatibility score between two types
export function getCompatibilityScore(typeA: TypeCode, typeB: TypeCode): number {
    return compatibilityMatrix[typeA]?.[typeB] ?? 50;
}

// Get top 3 best matches for a type
export function getBestMatches(typeCode: TypeCode): Array<{ type: TypeCode; score: number }> {
    const scores = compatibilityMatrix[typeCode];
    if (!scores) return [];

    return Object.entries(scores)
        .filter(([type]) => type !== typeCode) // Exclude self
        .map(([type, score]) => ({ type: type as TypeCode, score }))
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);
}

// Get top 3 worst matches for a type
export function getWorstMatches(typeCode: TypeCode): Array<{ type: TypeCode; score: number }> {
    const scores = compatibilityMatrix[typeCode];
    if (!scores) return [];

    return Object.entries(scores)
        .filter(([type]) => type !== typeCode) // Exclude self
        .map(([type, score]) => ({ type: type as TypeCode, score }))
        .sort((a, b) => a.score - b.score)
        .slice(0, 3);
}

// Get compatibility tier
export function getCompatibilityTier(score: number): {
    tier: string;
    tierJa: string;
    color: string;
    emoji: string;
} {
    if (score >= 90) return { tier: 'Soulmates', tierJa: 'ソウルメイト', color: '#FFD700', emoji: '💫' };
    if (score >= 75) return { tier: 'Best Friends', tierJa: '親友', color: '#FF00FF', emoji: '🤝' };
    if (score >= 60) return { tier: 'Good Match', tierJa: '良い相性', color: '#00F0FF', emoji: '✨' };
    if (score >= 45) return { tier: 'Neutral', tierJa: '普通', color: '#808080', emoji: '➖' };
    if (score >= 30) return { tier: 'Friction', tierJa: '摩擦', color: '#FFA500', emoji: '⚡' };
    return { tier: 'Oil & Water', tierJa: '水と油', color: '#FF0000', emoji: '🔥' };
}

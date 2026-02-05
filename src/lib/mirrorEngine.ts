// Z-Score Deviation Engine for Voice Mirror
// Calculates statistical deviations from user's baseline

import type { VoiceResult } from './storage';

export interface VoiceLog {
    timestamp: Date;
    calibrationVector: number[]; // 30D vector from "Hello world"
    readingVector: number[];    // 30D vector from dynamic reading
    context: {
        timeCategory: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
        dayCategory: 'Weekday' | 'Weekend';
        genre?: string;
        mood?: string;
        dayIndex?: number;
    };
    annotationTag?: string; // User's subjective label after oracle feedback
}

export interface ZScoreResult {
    vector: number[]; // Current 30D vector
    zScores: number[]; // Z-scores for each dimension
    anomalies: AnomalyAlert[];
    baselineStats: {
        mean: number[];
        std: number[];
    };
}

export interface AnomalyAlert {
    dimension: number;
    dimensionName: string;
    zScore: number;
    severity: 'low' | 'medium' | 'high';
    direction: 'above' | 'below';
}

// Dimension names for the 30D vector
const DIMENSION_NAMES = [
    // 0-4: Pitch Dynamics
    'F0_Mean', 'F0_Std', 'F0_Min', 'F0_Max', 'F0_Range',
    // 5-9: Quality
    'Jitter_Local', 'Jitter_Abs', 'Shimmer_Local', 'Shimmer_dB', 'HNR',
    // 10-24: Resonance
    'F1_Center', 'F1_Bandwidth', 'F2_Center', 'F2_Bandwidth', 'F3_Center', 'F3_Bandwidth',
    'Spectral_Centroid', 'Spectral_Rolloff', 'Spectral_Flux', 'Spectral_Entropy',
    'ZCR', 'MFCC_1', 'MFCC_2', 'MFCC_3', 'MFCC_4',
    // 25-29: Temporal
    'Speech_Rate', 'Pause_Duration', 'Voiced_Ratio', 'Volume_Stability', 'Pitch_Stability'
];

/**
 * Get time category from a Date object
 */
export function getTimeCategory(date: Date): 'Morning' | 'Afternoon' | 'Evening' | 'Night' {
    const hour = date.getHours();
    if (hour >= 5 && hour < 11) return 'Morning';
    if (hour >= 11 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 23) return 'Evening';
    return 'Night';
}

/**
 * Get day category from a Date object
 */
export function getDayCategory(date: Date): 'Weekday' | 'Weekend' {
    const day = date.getDay();
    return (day === 0 || day === 6) ? 'Weekend' : 'Weekday';
}

/**
 * Calculate Z-scores for current vector against historical baseline
 */
export function calculateZScores(
    currentVector: number[],
    history: VoiceLog[],
    lookbackDays: number = 30
): ZScoreResult {
    if (currentVector.length !== 30) {
        throw new Error('Vector must be 30-dimensional');
    }

    // Filter history to lookback period
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - lookbackDays);
    const recentHistory = history.filter(log => log.timestamp >= cutoffDate);

    if (recentHistory.length < 3) {
        // Not enough data for statistical analysis
        return {
            vector: currentVector,
            zScores: new Array(30).fill(0),
            anomalies: [],
            baselineStats: {
                mean: currentVector,
                std: new Array(30).fill(0)
            }
        };
    }

    // Calculate mean and std for each dimension
    const mean = new Array(30).fill(0);
    const std = new Array(30).fill(0);

    for (let dim = 0; dim < 30; dim++) {
        const values = recentHistory.map(log =>
            log.calibrationVector ? log.calibrationVector[dim] : (log as any).vector[dim]
        );

        // Mean
        mean[dim] = values.reduce((a, b) => a + b, 0) / values.length;

        // Standard Deviation
        const squaredDiffs = values.map(v => Math.pow(v - mean[dim], 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
        std[dim] = Math.sqrt(variance);
    }

    // Calculate Z-scores
    const zScores = currentVector.map((value, dim) => {
        if (std[dim] === 0) return 0; // Avoid division by zero
        return (value - mean[dim]) / std[dim];
    });

    // Detect anomalies (|Z| > 1.5)
    const anomalies: AnomalyAlert[] = [];
    zScores.forEach((z, dim) => {
        const absZ = Math.abs(z);
        if (absZ > 1.5) {
            let severity: 'low' | 'medium' | 'high' = 'low';
            if (absZ > 2.5) severity = 'high';
            else if (absZ > 2.0) severity = 'medium';

            anomalies.push({
                dimension: dim,
                dimensionName: DIMENSION_NAMES[dim],
                zScore: z,
                severity,
                direction: z > 0 ? 'above' : 'below'
            });
        }
    });

    // Sort anomalies by severity (high first)
    anomalies.sort((a, b) => {
        const severityOrder = { high: 3, medium: 2, low: 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
    });

    return {
        vector: currentVector,
        zScores,
        anomalies,
        baselineStats: {
            mean,
            std
        }
    };
}

/**
 * Save voice log to localStorage (for client-side history)
 */
export function saveVoiceLog(log: VoiceLog): void {
    if (typeof window === 'undefined') return;

    try {
        const historyKey = 'etchvox_voice_mirror_history';
        const existing = localStorage.getItem(historyKey);
        const history: VoiceLog[] = existing ? JSON.parse(existing) : [];

        // Add new log
        history.push({
            ...log,
            timestamp: log.timestamp instanceof Date ? log.timestamp.toISOString() : log.timestamp
        } as any);

        // Keep only last 60 days of data
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - 60);
        const filtered = history.filter((l: any) => {
            const ts = typeof l.timestamp === 'string' ? new Date(l.timestamp) : l.timestamp;
            return ts >= cutoff;
        });

        localStorage.setItem(historyKey, JSON.stringify(filtered));
        console.log(`✓ Voice log saved. Total logs: ${filtered.length}`);
    } catch (e) {
        console.error('Failed to save voice log:', e);
    }
}

/**
 * Load voice log history from localStorage
 */
export function loadVoiceLogHistory(): VoiceLog[] {
    if (typeof window === 'undefined') return [];

    try {
        const historyKey = 'etchvox_voice_mirror_history';
        const existing = localStorage.getItem(historyKey);
        if (!existing) return [];

        const history: any[] = JSON.parse(existing);

        // Convert timestamp strings back to Date objects
        return history.map(log => ({
            ...log,
            timestamp: new Date(log.timestamp)
        }));
    } catch (e) {
        console.error('Failed to load voice log history:', e);
        return [];
    }
}

/**
 * Clear all voice mirror history
 */
export function clearVoiceLogHistory(): void {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem('etchvox_voice_mirror_history');
        console.log('✓ Voice mirror history cleared');
    } catch (e) {
        console.error('Failed to clear history:', e);
    }
}

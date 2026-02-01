import { AnalysisMetrics, DriftAnalysis } from './types';

/**
 * Calculates the drift (change) between a baseline (past) recording
 * and the current (latest) recording.
 */
export function calculateDrift(
    baseline: AnalysisMetrics,
    current: AnalysisMetrics,
    baselineDate: string
): DriftAnalysis {
    // 1. Calculate individual metric drifts (%)
    const calculateChange = (b: number, c: number) => {
        if (b === 0) return 0;
        return ((c - b) / b) * 100;
    };

    const pitchDrift = calculateChange(baseline.pitch, current.pitch);
    const speedDrift = calculateChange(baseline.speed, current.speed);
    const volumeDrift = calculateChange(baseline.vibe, current.vibe);
    const toneDrift = calculateChange(baseline.tone, current.tone);

    // 2. Calculate aggregate drift rate
    // We weight tone and pitch higher as they are more indicative of physical aging/fatigue
    const avgDrift = (pitchDrift * 0.4 + toneDrift * 0.4 + speedDrift * 0.1 + volumeDrift * 0.1);

    // 3. Determine Status
    // STABLE: < 5% change
    // UPGRADE: Positive shift in clarity/resonance (> 5% avg, > 5% tone)
    // DEGRADING: Significant negative shift (> 5% avg, negative pitch/tone shift)
    let status: 'STABLE' | 'UPGRADE' | 'DEGRADING' = 'STABLE';

    if (Math.abs(avgDrift) < 5) {
        status = 'STABLE';
    } else if (avgDrift > 0 && toneDrift > 0) {
        status = 'UPGRADE';
    } else {
        status = 'DEGRADING';
    }

    // 4. Calculate time elapsed
    const start = new Date(baselineDate);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - start.getTime());
    const daysSince = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return {
        driftRate: Math.round(avgDrift * 10) / 10,
        status,
        baselineDate,
        daysSince,
        changes: {
            pitch: Math.round(pitchDrift * 10) / 10,
            speed: Math.round(speedDrift * 10) / 10,
            volume: Math.round(volumeDrift * 10) / 10,
            tone: Math.round(toneDrift * 10) / 10,
        },
    };
}

/**
 * Generates a human-friendly narrative about the voice drift.
 */
export function getDriftNarrative(analysis: DriftAnalysis): string {
    const { status, driftRate, daysSince } = analysis;

    if (status === 'STABLE') {
        return `Your vocal identity has remained remarkably stable over the last ${daysSince} days. Minimal decay detected.`;
    }

    if (status === 'UPGRADE') {
        return `Vocal resonance has improved by ${driftRate}%. Your voice sounds more energetic and clear than it did ${daysSince} days ago.`;
    }

    return `Warning: ${Math.abs(driftRate)}% vocal degradation detected. Stress or environmental factors may be impacting your vocal clarity compared to ${daysSince} days ago.`;
}

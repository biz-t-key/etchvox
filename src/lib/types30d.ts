/**
 * 30-Dimensional Voice Analysis System (V2.0)
 * 
 * Comprehensive type definitions for research-grade acoustic biomarker extraction.
 * Designed for GDPR compliance with anonymization and differential privacy.
 */

// ==========================================
// F-Series: Physiological Features (F01-F05)
// ==========================================

export interface PhysiologicalFeatures {
    /** F01: Mean fundamental frequency (Hz) - YIN/PYIN algorithm */
    f0_mean: number;

    /** F02: Standard deviation of fundamental frequency (Hz) */
    f0_sd: number;

    /** F03: Local period-to-period frequency variation (%) */
    jitter_local: number;

    /** F04: Local period-to-period amplitude variation (dB) */
    shimmer_local: number;

    /** F05: Harmonics-to-Noise Ratio (dB) - Autocorrelation method */
    hnr: number;
}

// ==========================================
// T-Series: Temporal Features (T01-T05)
// ==========================================

export interface TemporalFeatures {
    /** T01: Total recording duration (seconds) */
    total_duration: number;

    /** T02: Active phonation time after VAD (seconds) */
    phonation_time: number;

    /** T03: Speech rate (syllables per second) */
    speech_rate: number;

    /** T04: Ratio of silence to total duration (0.0-1.0) */
    pause_ratio: number;

    /** T05: Count of pauses exceeding 500ms threshold */
    long_pause_count: number;
}

// ==========================================
// S-Series: Spectral Features (S01-S05)
// ==========================================

export interface SpectralFeatures {
    /** S01: Mean spectral centroid (Hz) - "brightness" of voice */
    spectral_centroid: number;

    /** S02: Mean spectral rolloff (Hz) - 85% energy cutoff frequency */
    spectral_rolloff: number;

    /** S03: Mel-Frequency Cepstral Coefficients mean vector (13-dim) */
    mfcc_mean: number[];

    /** S04: MFCC variance vector (13-dim) */
    mfcc_var: number[];

    /** S05: Dynamic Time Warping distance from reference template (normalized cost) */
    dtw_score: number;
}

// ==========================================
// Environment Metadata
// ==========================================

export type NoiseCategory = 'Silence' | 'Traffic' | 'Cafe' | 'Nature' | 'Machinery';
export type DeviceTier = 'High-End' | 'Mid-Range' | 'Low-End';

export interface EnvironmentMetadata {
    /** Signal-to-Noise Ratio via WADA-SNR algorithm (dB) */
    snr_db: number;

    /** Classified background noise type */
    noise_category: NoiseCategory;

    /** Device quality tier (inferred from UserAgent) */
    device_tier: DeviceTier;

    /** Operating system family (iOS, Android, Windows, macOS, Linux) */
    os_family: string;
}

// ==========================================
// Context Time (Anonymized Temporal Bucketing)
// ==========================================

export type TimeSlot = 'EARLY_MORNING' | 'DAYTIME_WORK' | 'EVENING_RELAX' | 'LATE_NIGHT';
export type DayType = 'WEEKDAY' | 'WEEKEND';
export type Season = 'Q1_WINTER' | 'Q2_SPRING' | 'Q3_SUMMER' | 'Q4_AUTUMN';

export interface ContextTime {
    /** Time of day bucket (GDPR-compliant, no exact timestamp) */
    slot: TimeSlot;

    /** Weekday vs Weekend */
    day_type: DayType;

    /** Quarterly season identifier */
    season: Season;
}

// ==========================================
// Complete 30D Analysis Result
// ==========================================

export interface AnalysisMetricsV2 {
    /** Schema version for backward compatibility */
    schema_version: '2.0.0';

    /** Recording script identifier */
    script_id: string;

    /** Physiological voice characteristics (5 features) */
    physiological: PhysiologicalFeatures;

    /** Temporal/rhythmic characteristics (5 features) */
    temporal: TemporalFeatures;

    /** Spectral/timbral characteristics (20 features: 2 + 13 + 13 + 2) */
    spectral: SpectralFeatures;

    /** Environmental and device metadata */
    environment: EnvironmentMetadata;

    /** Anonymized temporal context */
    context_time?: ContextTime;
}

// ==========================================
// Privacy Guard Results
// ==========================================

export interface PrivacyGuardResult {
    /** Whether recording contains speech from multiple speakers */
    has_external_speech: boolean;

    /** Confidence score for speech detection (0.0-1.0) */
    speech_confidence: number;

    /** Whether recording should be rejected */
    should_reject: boolean;

    /** Reason for rejection (if applicable) */
    rejection_reason?: string;
}

// ==========================================
// Research Submission Payload
// ==========================================

export interface ResearchSubmissionPayload {
    /** Random UUID v4 (not linked to user account) */
    record_id: string;

    /** Script identifier used for this recording */
    script_id: string;

    /** 30-dimensional feature vector */
    features: AnalysisMetricsV2;

    /** Anonymized temporal context */
    context_time: ContextTime;

    /** Optional user-provided metadata (with consent) */
    user_meta?: {
        mbti_reported?: string;
        age_range?: string; // "20s", "30s", etc.
        gender?: string;
    };
}

// ==========================================
// Legacy Compatibility (v1.0.0)
// ==========================================

/** Legacy 4D analysis metrics */
export interface AnalysisMetricsV1 {
    pitch: number;  // Hz
    speed: number;  // 0-1 normalized
    vibe: number;   // variance
    tone: number;   // Hz
}

/** Union type for backward compatibility */
export type AnalysisMetrics = AnalysisMetricsV1 | AnalysisMetricsV2;

/** Type guard for v2 metrics */
export function isV2Metrics(metrics: AnalysisMetrics): metrics is AnalysisMetricsV2 {
    return 'schema_version' in metrics && metrics.schema_version === '2.0.0';
}

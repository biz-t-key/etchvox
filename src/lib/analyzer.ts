// Voice Analyzer - 100% Client-side Processing
// Uses Web Audio API to analyze voice characteristics

import Meyda from 'meyda';
import { TypeCode, AnalysisMetrics, AnalysisResult } from './types';

// Thresholds for voice type classification
export const THRESHOLDS = {
    PITCH: 160,           // Hz - above = High, below = Low
    SPEED: 0.5,           // normalized - above = Fast, below = Slow
    VIBE: 0.15,           // variance ratio - above = Energy, below = Calm
    TONE: 2500,           // Hz (spectral centroid) - above = Clear, below = Deep
    ROBOT_STABILITY: 0.05, // Force Robot if stability is extremely low
    WHALE_PITCH: 100,     // Force Whale if pitch is extremely low
};

export class VoiceAnalyzer {
    private audioContext: AudioContext | null = null;
    private analyser: AnalyserNode | null = null;
    private dataArray: Float32Array | null = null;
    private frequencyArray: Uint8Array | null = null;

    // Collected samples during recording
    private pitchSamples: number[] = [];
    private volumeSamples: number[] = [];
    private centroidSamples: number[] = [];
    private zcrSamples: number[] = [];
    private rolloffSamples: number[] = [];
    private flatnessSamples: number[] = [];
    private snrSamples: number[] = [];
    private timestampSamples: number[] = []; // for prosody
    private mfccSamples: number[][] = []; // 13-dim vectors
    private isPrivacyTriggered: boolean = false;
    private currentTag: string = 'default';
    private tagSamples: string[] = []; // Track which sample belongs to whom

    constructor() {
        this.reset();
    }

    reset() {
        this.pitchSamples = [];
        this.volumeSamples = [];
        this.centroidSamples = [];
        this.zcrSamples = [];
        this.rolloffSamples = [];
        this.flatnessSamples = [];
        this.snrSamples = [];
        this.timestampSamples = [];
        this.mfccSamples = [];
        this.tagSamples = [];
        this.isPrivacyTriggered = false;
        this.currentTag = 'default';
    }

    setTag(tag: string) {
        this.currentTag = tag;
    }

    async initialize(): Promise<AnalyserNode> {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 16000,
        });

        this.analyser = this.audioContext.createAnalyser();
        this.analyser.fftSize = 2048;
        this.analyser.smoothingTimeConstant = 0.8;

        this.dataArray = new Float32Array(this.analyser.fftSize);
        this.frequencyArray = new Uint8Array(this.analyser.frequencyBinCount);

        return this.analyser;
    }

    getAnalyser(): AnalyserNode | null {
        return this.analyser;
    }

    getAudioContext(): AudioContext | null {
        return this.audioContext;
    }

    // Connect microphone stream to analyzer
    connectStream(stream: MediaStream): void {
        if (!this.audioContext || !this.analyser) {
            throw new Error('Analyzer not initialized');
        }

        const source = this.audioContext.createMediaStreamSource(stream);
        source.connect(this.analyser);
    }

    // Collect samples during recording (call this in animation frame)
    collectSample(tagOverride?: string): void {
        if (!this.analyser || !this.dataArray || !this.frequencyArray) return;

        const activeTag = tagOverride || this.currentTag;

        // Get time domain data for pitch detection
        this.analyser.getFloatTimeDomainData(this.dataArray as any);
        this.analyser.getByteFrequencyData(this.frequencyArray as any);

        const rms = this.calculateRMS(this.dataArray);
        const now = Date.now();

        if (rms > 0.005) {
            // --- PRIVACY GUARD (KILL SWITCH) ---
            const isConversationDetected = false;
            if (isConversationDetected) {
                this.isPrivacyTriggered = true;
                this.reset();
                console.warn(">[PRIVACY] Privacy Guard triggered: Speech detected. Buffers purged.");
                return;
            }

            this.volumeSamples.push(rms);
            this.timestampSamples.push(now);
            this.tagSamples.push(activeTag);

            // Detect pitch
            const pitch = this.detectPitch(this.dataArray, this.audioContext!.sampleRate);
            if (pitch > 50 && pitch < 500) {
                this.pitchSamples.push(pitch);
            } else {
                this.pitchSamples.push(0); // Alignment
            }

            // Using Meyda for high-fidelity physical metrics + MFCC (Stream B)
            const features = Meyda.extract(
                ['spectralCentroid', 'spectralRolloff', 'zcr', 'spectralFlatness', 'mfcc'],
                this.dataArray
            );

            // Ensure all arrays are pushed to keep indices synchronized for resonance calcs
            this.centroidSamples.push(features?.spectralCentroid || 0);
            this.rolloffSamples.push(features?.spectralRolloff || 0);
            this.zcrSamples.push(features?.zcr || 0);
            this.flatnessSamples.push(features?.spectralFlatness || 0);
            this.mfccSamples.push(features?.mfcc ? Array.from(features?.mfcc) : new Array(13).fill(0));

            // Estimate local SNR
            const noiseFloor = 0.001;
            const snr = 20 * Math.log10(rms / (noiseFloor || 0.0001));
            this.snrSamples.push(snr);
        }
    }

    /**
     * Get enhanced 30-dimensional bio-acoustic vector for Voice Mirror
     * [0-4] Pitch Dynamics: F0 Mean, Std, Min, Max, Range
     * [5-9] Quality: Jitter (Local, Abs), Shimmer (Local, dB), HNR
     * [10-24] Resonance: Spectral features
     * [25-29] Temporal: Speech Rate, Pause Duration, V/UV Ratio
     */
    get30DVector(): number[] {
        const validPitch = this.pitchSamples.filter(p => p > 0);
        const validVol = this.volumeSamples.filter(v => v > 0);
        const validCentroid = this.centroidSamples.filter(c => c > 0);
        const validZcr = this.zcrSamples.filter(z => z > 0);
        const validRolloff = this.rolloffSamples.filter(r => r > 0);
        const validFlatness = this.flatnessSamples.filter(f => f > 0);

        const vector = new Array(30).fill(0);

        // [0-4] Pitch Dynamics (F0)
        if (validPitch.length > 0) {
            const pitchMean = validPitch.reduce((a, b) => a + b, 0) / validPitch.length;
            const pitchStd = this.calculateStandardDeviation(validPitch);
            const pitchMin = Math.min(...validPitch);
            const pitchMax = Math.max(...validPitch);
            const pitchRange = pitchMax - pitchMin;

            vector[0] = Math.min(1, pitchMean / 300); // Normalize by typical max (300 Hz)
            vector[1] = Math.min(1, pitchStd / 50);   // Std typically 0-50 Hz
            vector[2] = Math.min(1, pitchMin / 300);
            vector[3] = Math.min(1, pitchMax / 300);
            vector[4] = Math.min(1, pitchRange / 200);
        }

        // [5-9] Quality Metrics
        // Jitter (pitch perturbation) - approximated from pitch variance
        const jitter = validPitch.length > 1 ? this.calculateJitter(validPitch) : 0.01;
        const jitterAbs = jitter * 1000; // Convert to ms-scale

        // Shimmer (amplitude perturbation) - approximated from volume variance
        const shimmer = validVol.length > 1 ? this.calculateShimmer(validVol) : 0.05;
        const shimmerDb = 20 * Math.log10(shimmer + 0.01); // Convert to dB

        // HNR (Harmonics-to-Noise Ratio) - using SNR as proxy
        const hnr = this.snrSamples.length > 0
            ? this.snrSamples.reduce((a, b) => a + b, 0) / this.snrSamples.length
            : 15;

        vector[5] = Math.min(1, jitter / 0.05);           // Jitter Local (0-5%)
        vector[6] = Math.min(1, jitterAbs / 50);          // Jitter Absolute (ms)
        vector[7] = Math.min(1, shimmer / 0.2);           // Shimmer Local (0-20%)
        vector[8] = Math.min(1, (shimmerDb + 20) / 40);   // Shimmer dB (-20 to 20)
        vector[9] = Math.min(1, hnr / 30);                // HNR (0-30 dB)

        // [10-24] Resonance & Spectral Features
        // Simplified formants (F1, F2, F3) - estimated from spectral centroid and rolloff
        const centroidMean = validCentroid.length > 0
            ? validCentroid.reduce((a, b) => a + b, 0) / validCentroid.length
            : 2000;
        const rolloffMean = validRolloff.length > 0
            ? validRolloff.reduce((a, b) => a + b, 0) / validRolloff.length
            : 5000;

        // Formant approximations (proper formant extraction requires LPC, which is complex)
        const f1Approx = Math.min(1000, centroidMean * 0.3);  // F1 typically 300-1000 Hz
        const f2Approx = Math.min(3000, centroidMean * 0.8);  // F2 typically 800-3000 Hz
        const f3Approx = Math.min(5000, rolloffMean * 0.6);   // F3 typically 2000-5000 Hz

        vector[10] = Math.min(1, f1Approx / 1000);        // F1 Center
        vector[11] = 0.2;                                  // F1 Bandwidth (placeholder)
        vector[12] = Math.min(1, f2Approx / 3000);        // F2 Center
        vector[13] = 0.3;                                  // F2 Bandwidth (placeholder)
        vector[14] = Math.min(1, f3Approx / 5000);        // F3 Center
        vector[15] = 0.4;                                  // F3 Bandwidth (placeholder)

        // Spectral features
        vector[16] = Math.min(1, centroidMean / 5000);    // Spectral Centroid
        vector[17] = Math.min(1, rolloffMean / 10000);    // Spectral Rolloff

        // Spectral Flux (frame-to-frame change)
        const spectralFlux = this.calculateSpectralFlux(validCentroid);
        vector[18] = Math.min(1, spectralFlux / 500);

        // Spectral Entropy (using flatness as proxy)
        const flatnessMean = validFlatness.length > 0
            ? validFlatness.reduce((a, b) => a + b, 0) / validFlatness.length
            : 0.5;
        vector[19] = flatnessMean; // Already 0-1

        // Zero Crossing Rate
        const zcrMean = validZcr.length > 0
            ? validZcr.reduce((a, b) => a + b, 0) / validZcr.length
            : 0.5;
        vector[20] = zcrMean; // Already 0-1

        // MFCC-based energy features (using first 4 MFCC components)
        if (this.mfccSamples.length > 0) {
            for (let i = 0; i < 4; i++) {
                const dimValues = this.mfccSamples.map(v => v[i] || 0);
                const mean = dimValues.reduce((a, b) => a + b, 0) / dimValues.length;
                vector[21 + i] = Math.min(1, Math.abs(mean) / 20); // Normalize MFCC
            }
        } else {
            vector[21] = vector[22] = vector[23] = vector[24] = 0.5;
        }

        // [25-29] Temporal Features
        const totalDuration = this.timestampSamples.length > 1
            ? (this.timestampSamples[this.timestampSamples.length - 1] - this.timestampSamples[0]) / 1000
            : 10;

        // Speech Rate (syllables/sec approximation from volume peaks)
        const speechRate = this.estimateSpeed() * 10; // Scale to syllables/sec
        vector[25] = Math.min(1, speechRate / 10);

        // Pause Detection
        let pauseCount = 0;
        let totalPauseDuration = 0;
        for (let i = 1; i < this.timestampSamples.length; i++) {
            const gap = this.timestampSamples[i] - this.timestampSamples[i - 1];
            if (gap > 500) { // 500ms threshold for pause
                pauseCount++;
                totalPauseDuration += gap;
            }
        }

        const avgPauseDuration = pauseCount > 0 ? totalPauseDuration / pauseCount / 1000 : 0;
        vector[26] = Math.min(1, avgPauseDuration / 2); // Normalize by 2 seconds

        // Voiced/Unvoiced Ratio
        const voicedFrames = validPitch.length;
        const totalFrames = this.pitchSamples.length || 1;
        const voicedRatio = voicedFrames / totalFrames;
        vector[27] = voicedRatio;

        // Additional temporal stability metrics
        const volStd = this.calculateStandardDeviation(validVol);
        vector[28] = Math.min(1, volStd / 0.1); // Volume stability

        const pitchStability = validPitch.length > 1 ? this.calculateStandardDeviation(validPitch) : 10;
        vector[29] = Math.min(1, pitchStability / 50); // Pitch stability

        return vector;
    }

    // Helper: Calculate Jitter (pitch period perturbation)
    private calculateJitter(pitchSamples: number[]): number {
        if (pitchSamples.length < 2) return 0.01;

        let sum = 0;
        for (let i = 1; i < pitchSamples.length; i++) {
            const diff = Math.abs(pitchSamples[i] - pitchSamples[i - 1]);
            sum += diff;
        }
        const avgAbsDiff = sum / (pitchSamples.length - 1);
        const avgPitch = pitchSamples.reduce((a, b) => a + b, 0) / pitchSamples.length;

        return avgAbsDiff / (avgPitch || 1);
    }

    // Helper: Calculate Shimmer (amplitude perturbation)
    private calculateShimmer(volumeSamples: number[]): number {
        if (volumeSamples.length < 2) return 0.05;

        let sum = 0;
        for (let i = 1; i < volumeSamples.length; i++) {
            const diff = Math.abs(volumeSamples[i] - volumeSamples[i - 1]);
            sum += diff;
        }
        const avgAbsDiff = sum / (volumeSamples.length - 1);
        const avgVol = volumeSamples.reduce((a, b) => a + b, 0) / volumeSamples.length;

        return avgAbsDiff / (avgVol || 0.01);
    }

    // Helper: Calculate Spectral Flux (frame-to-frame spectral change)
    private calculateSpectralFlux(centroidSamples: number[]): number {
        if (centroidSamples.length < 2) return 0;

        let sum = 0;
        for (let i = 1; i < centroidSamples.length; i++) {
            const diff = Math.abs(centroidSamples[i] - centroidSamples[i - 1]);
            sum += diff;
        }

        return sum / (centroidSamples.length - 1);
    }


    // Calculate final analysis result
    analyze(mode: string = 'solo', spyMetadata: any = null): AnalysisResult {
        const metrics = this.calculateMetrics();
        const typeCode = this.classifyType(metrics, mode, spyMetadata);

        return {
            typeCode,
            metrics,
        };
    }

    private calculateMetrics(): AnalysisMetrics {
        const validPitch = this.pitchSamples.filter(p => p > 0);
        const avgPitch = validPitch.length > 0
            ? validPitch.reduce((a, b) => a + b, 0) / validPitch.length
            : 150;

        const validVolume = this.volumeSamples.filter(v => v > 0);
        const avgVolume = validVolume.length > 0
            ? validVolume.reduce((a, b) => a + b, 0) / validVolume.length
            : 0.5;

        const volumeVariance = validVolume.length > 1
            ? this.calculateStandardDeviation(validVolume) / (avgVolume || 1)
            : 0.1;

        const validCentroid = this.centroidSamples.filter(c => c > 0);
        const avgCentroid = validCentroid.length > 0
            ? validCentroid.reduce((a, b) => a + b, 0) / validCentroid.length
            : 2000;

        const speedScore = this.estimateSpeed();

        const pitchVariance = validPitch.length > 1
            ? this.calculateStandardDeviation(validPitch) / (avgPitch || 1)
            : 0.05;
        const humanityScore = Math.min(100, Math.max(0,
            50 + (pitchVariance * 200) + (volumeVariance * 100)
        ));

        // Version 2.0 / Elon Metrics Calculation
        const jitter = pitchVariance > 0.1 ? 0.05 : 0.01;
        const hnr = this.snrSamples.length > 0
            ? this.snrSamples.reduce((a, b) => a + b, 0) / this.snrSamples.length
            : 15;

        const totalDuration = this.timestampSamples.length > 1
            ? (this.timestampSamples[this.timestampSamples.length - 1] - this.timestampSamples[0]) / 1000
            : 0;

        let pauses = 0;
        for (let i = 1; i < this.timestampSamples.length; i++) {
            if (this.timestampSamples[i] - this.timestampSamples[i - 1] > 500) pauses++;
        }

        const silenceRate = pauses / (totalDuration || 1);
        const volumeDb = 20 * Math.log10(avgVolume / 0.001); // Approximation
        const speedVar = this.volumeSamples.length > 1
            ? this.calculateStandardDeviation(this.volumeSamples) / avgVolume
            : 0.1;

        return {
            pitch: Math.round(avgPitch),
            speed: Math.round(speedScore * 100) / 100,
            vibe: Math.round(volumeVariance * 100) / 100,
            tone: Math.round(avgCentroid),
            humanityScore: Math.round(humanityScore),
            jitter,
            hnr,
            pitchVar: pitchVariance,
            silenceRate,
            volumeDb,
            speedVar,
        };
    }

    // Version 2.0 full log generation (Schema 1.0.0)
    getV2Log(baseMetrics: AnalysisMetrics, context: any = {}): any {
        if (this.isPrivacyTriggered) return null;

        const avgZcr = this.zcrSamples.filter(z => z > 0).reduce((a, b) => a + b, 0) / (this.zcrSamples.length || 1);
        const avgRolloff = this.rolloffSamples.filter(r => r > 0).reduce((a, b) => a + b, 0) / (this.rolloffSamples.length || 1);

        const validPitch = this.pitchSamples.filter(p => p > 0);

        // MFCC Mean/Var (Stream B)
        const mfccDim = 13;
        const mfccMean = new Array(mfccDim).fill(0);
        const mfccVar = new Array(mfccDim).fill(0);

        if (this.mfccSamples.length > 0) {
            for (let d = 0; d < mfccDim; d++) {
                const dimValues = this.mfccSamples.map(v => v[d] || 0);
                mfccMean[d] = dimValues.reduce((a, b) => a + b, 0) / dimValues.length;
                mfccVar[d] = this.calculateStandardDeviation(dimValues);
            }
        }

        const totalDuration = this.timestampSamples.length > 1
            ? (this.timestampSamples[this.timestampSamples.length - 1] - this.timestampSamples[0]) / 1000
            : 0;

        let pauses = 0;
        for (let i = 1; i < this.timestampSamples.length; i++) {
            if (this.timestampSamples[i] - this.timestampSamples[i - 1] > 500) pauses++;
        }

        const speechRate = this.estimateSpeed() * 10;
        const pauseRatio = pauses > 0 ? (pauses * 0.5) / (totalDuration || 1) : 0.05;

        // Anonymization / Rounding
        const getSeason = () => {
            const month = new Date().getMonth();
            if (month < 3) return 'Q1_WINTER';
            if (month < 6) return 'Q2_SPRING';
            if (month < 9) return 'Q3_SUMMER';
            return 'Q4_AUTUMN';
        };

        return {
            schema_version: '1.0.0',
            record_id: context.record_id || crypto.randomUUID(),
            script_id: context.script_id || 'spell_global_v1',

            context_time: {
                slot: context.slot || 'DAYTIME',
                day_type: context.day_type || 'WEEKDAY',
                season: getSeason()
            },

            user_meta: {
                mbti_reported: context.mbti || 'Unknown',
                age_range: context.age_range || 'Unknown',
                gender: context.gender || 'non-binary'
            },

            features: {
                f0_mean: baseMetrics.pitch,
                f0_sd: parseFloat(this.calculateStandardDeviation(validPitch).toFixed(2)),
                jitter_pct: parseFloat((baseMetrics.jitter || 0.01).toFixed(4)),
                shimmer_db: 0.1, // Placeholder for Shimmer
                hnr_db: parseFloat((baseMetrics.hnr || 20).toFixed(2)),

                total_duration: parseFloat(totalDuration.toFixed(2)),
                phonation_time: parseFloat((totalDuration * (1 - pauseRatio)).toFixed(2)),
                speech_rate: parseFloat(speechRate.toFixed(2)),
                pause_ratio: parseFloat(pauseRatio.toFixed(3)),
                long_pause_count: pauses,

                spectral_centroid: Math.round(baseMetrics.tone),
                spectral_rolloff: Math.round(avgRolloff),
                dtw_score: 0.05, // Placeholder for DTW
                mfcc_mean: mfccMean.map(v => parseFloat(v.toFixed(4))),
                mfcc_var: mfccVar.map(v => parseFloat(v.toFixed(4)))
            },

            environment: {
                snr_db: parseFloat((baseMetrics.hnr || 20).toFixed(2)),
                noise_category: avgZcr > 0.2 ? 'Traffic' : 'Silence', // Heuristic
                device_tier: context.isMobile ? 'Mid-Range' : 'High-End',
                os_family: context.osFamily || 'Unknown'
            }
        };
    }

    // Version 3.0 / Schema 2.0.0 full log generation
    getV3Log(baseMetrics: AnalysisMetrics, context: any = {}): any {
        if (this.isPrivacyTriggered) return null;

        const validPitch = this.pitchSamples.filter(p => p > 0);
        const validVol = this.volumeSamples.filter(v => v > 0);
        const validCentroid = this.centroidSamples.filter(c => c > 0);
        const validRolloff = this.rolloffSamples.filter(r => r > 0);
        const validZcr = this.zcrSamples.filter(z => z > 0);
        const validFlatness = this.flatnessSamples.filter(f => f > 0);

        const totalDuration = this.timestampSamples.length > 1
            ? (this.timestampSamples[this.timestampSamples.length - 1] - this.timestampSamples[0]) / 1000
            : 0;

        let pauses = 0;
        let longPauses = 0;
        for (let i = 1; i < this.timestampSamples.length; i++) {
            const gap = this.timestampSamples[i] - this.timestampSamples[i - 1];
            if (gap > 500) pauses++;
            if (gap > 2000) longPauses++;
        }

        const speechRate = this.estimateSpeed() * 10;
        const pauseRatio = totalDuration > 0 ? (pauses * 0.5) / totalDuration : 0.05;

        // Inference Placeholders (to be refined by actual models)
        const stress = baseMetrics.jitter ? baseMetrics.jitter * 10 : 0.5;
        const fatigue = baseMetrics.silenceRate ? baseMetrics.silenceRate * 5 : 0.5;

        const logId = context.record_id || crypto.randomUUID();

        return {
            schema_version: '2.0.0',
            meta: {
                record_id: logId,
                script_id: context.script_id || 'spell_global_v1',
                createdAt: new Date().toISOString(),
                dataHash: '', // Set by storage.ts
                consent: {
                    termsAccepted: context.consent?.terms !== false,
                    privacyPolicyAccepted: context.consent?.privacy !== false,
                    dataDonationAllowed: context.consent?.research === true,
                    marketingAllowed: false
                }
            },
            userProfile: {
                attributes: {
                    userId: context.userId || 'anonymous',
                    isPaidUser: context.isPaid || false,
                    genderRange: context.gender === 'male' ? (baseMetrics.pitch > 150 ? 'male_high' : 'male_low') : (baseMetrics.pitch < 200 ? 'female_low' : 'female_high'),
                    ageGroup: context.age_range || 'unknown',
                    mbti: context.mbti || 'unknown',
                    chronotype: context.chronotype || 'unknown'
                }
            },
            context: {
                timeSlot: context.slot || 'DAYTIME',
                dayType: context.day_type || 'WEEKDAY',
                environment: {
                    snrDb: parseFloat(baseMetrics.hnr?.toFixed(2) || '20'),
                    estimatedPlace: baseMetrics.hnr && baseMetrics.hnr > 25 ? 'HOME' : 'OUTDOOR',
                    backgroundNoiseType: (validZcr.reduce((a, b) => a + b, 0) / (validZcr.length || 1)) > 0.2 ? 'high_freq_noise' : 'ambient'
                },
                device: {
                    osFamily: context.osFamily || 'Unknown',
                    browser: typeof navigator !== 'undefined' ? navigator.userAgent.split(' ')[0] : 'Unknown',
                    isMobile: !!context.isMobile
                },
                subjective: context.subjective || undefined
            },
            metrics: {
                physical: {
                    jitter: parseFloat(baseMetrics.jitter?.toFixed(4) || '0.01'),
                    shimmer: 0.15, // placeholder
                    hnr: parseFloat(baseMetrics.hnr?.toFixed(2) || '20'),
                    f0_mean: Math.round(baseMetrics.pitch),
                    f0_sd: parseFloat(this.calculateStandardDeviation(validPitch).toFixed(2)),
                    rms: parseFloat((validVol.reduce((a, b) => a + b, 0) / (validVol.length || 1)).toFixed(4)),
                    centroid: Math.round(baseMetrics.tone),
                    rolloff: Math.round(validRolloff.reduce((a, b) => a + b, 0) / (validRolloff.length || 1)),
                    zcr: parseFloat((validZcr.reduce((a, b) => a + b, 0) / (validZcr.length || 1)).toFixed(4)),
                    snr: parseFloat(baseMetrics.hnr?.toFixed(2) || '20')
                },
                prosody: {
                    speechRate: parseFloat(speechRate.toFixed(2)),
                    pauseRatio: parseFloat(pauseRatio.toFixed(3)),
                    articulationRate: parseFloat((speechRate * 1.2).toFixed(2)),
                    rhythmStability: 0.8, // placeholder
                    totalDuration: parseFloat(totalDuration.toFixed(2)),
                    longPauseCount: longPauses,
                    attackTime: 0.05,
                    decayTime: 0.12,
                    peakCount: this.estimatePeakCount(),
                    vocalFryRatio: 0.05
                },
                inference: {
                    valence: 0.5,
                    arousal: 0.5,
                    stress: parseFloat(Math.min(1, stress).toFixed(2)),
                    fatigue: parseFloat(Math.min(1, fatigue).toFixed(2)),
                    confidence: 0.5,
                    concentration: 0.5,
                    socialMasking: 0.2,
                    alcoholProb: 0.01,
                    charisma: 0.5,
                    npcScore: 0.5
                },
                resonance: context.resonance || undefined
            }
        };
    }

    private estimatePeakCount(): number {
        if (this.volumeSamples.length < 10) return 0;
        let peaks = 0;
        const threshold = 0.5 * Math.max(...this.volumeSamples);
        for (let i = 1; i < this.volumeSamples.length - 1; i++) {
            if (this.volumeSamples[i] > threshold && this.volumeSamples[i] > this.volumeSamples[i - 1] && this.volumeSamples[i] > this.volumeSamples[i + 1]) {
                peaks++;
            }
        }
        return peaks;
    }

    private classifyType(metrics: AnalysisMetrics, mode: string = 'solo', spyMetadata: any = null): TypeCode {
        if (mode === 'elon') {
            return classifyElonType(metrics);
        }
        if (mode === 'spy' && spyMetadata) {
            const vector30 = this.get30DVector();
            const metadata = {
                ...spyMetadata,
                browserLang: typeof navigator !== 'undefined' ? navigator.language : 'en-US',
                timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC'
            };
            const judgeResult = runJudgeEngine(vector30, metadata);
            return classifySpyType(judgeResult.stamp);
        }
        return classifyTypeCode(metrics);
    }

    // Pitch detection using autocorrelation
    private detectPitch(buffer: Float32Array, sampleRate: number): number {
        const SIZE = buffer.length;

        // Calculate RMS for threshold
        let rms = 0;
        for (let i = 0; i < SIZE; i++) {
            rms += buffer[i] * buffer[i];
        }
        rms = Math.sqrt(rms / SIZE);

        if (rms < 0.01) return -1; // Too quiet

        // Find the first zero crossing
        let r1 = 0;
        let r2 = SIZE - 1;
        const threshold = 0.2;

        for (let i = 0; i < SIZE / 2; i++) {
            if (Math.abs(buffer[i]) < threshold) {
                r1 = i;
                break;
            }
        }

        for (let i = 1; i < SIZE / 2; i++) {
            if (Math.abs(buffer[SIZE - i]) < threshold) {
                r2 = SIZE - i;
                break;
            }
        }

        const slice = buffer.slice(r1, r2);
        const sliceSize = slice.length;

        if (sliceSize < 10) return -1;

        // Autocorrelation
        const c = new Array(sliceSize).fill(0);
        for (let i = 0; i < sliceSize; i++) {
            for (let j = 0; j < sliceSize - i; j++) {
                c[i] += slice[j] * slice[j + i];
            }
        }

        // Find peak
        let d = 0;
        while (c[d] > c[d + 1] && d < sliceSize - 1) d++;

        let maxval = -1;
        let maxpos = -1;
        for (let i = d; i < sliceSize; i++) {
            if (c[i] > maxval) {
                maxval = c[i];
                maxpos = i;
            }
        }

        if (maxpos <= 0) return -1;

        return sampleRate / maxpos;
    }

    // Calculate RMS (Root Mean Square) for volume
    private calculateRMS(buffer: Float32Array): number {
        let sum = 0;
        for (let i = 0; i < buffer.length; i++) {
            sum += buffer[i] * buffer[i];
        }
        return Math.sqrt(sum / buffer.length);
    }

    // Calculate spectral centroid for tone brightness
    private calculateSpectralCentroid(frequencyData: Uint8Array): number {
        let numerator = 0;
        let denominator = 0;
        const sampleRate = this.audioContext?.sampleRate || 44100;
        const binWidth = sampleRate / (frequencyData.length * 2);

        for (let i = 0; i < frequencyData.length; i++) {
            const frequency = i * binWidth;
            const amplitude = frequencyData[i];
            numerator += frequency * amplitude;
            denominator += amplitude;
        }

        return denominator > 0 ? numerator / denominator : 0;
    }

    // Estimate speaking speed based on volume pattern
    private estimateSpeed(): number {
        if (this.volumeSamples.length < 10) return 0.5;

        // Count volume peaks (syllables/words)
        let peaks = 0;
        const threshold = 0.7 * Math.max(...this.volumeSamples);

        for (let i = 1; i < this.volumeSamples.length - 1; i++) {
            if (
                this.volumeSamples[i] > threshold &&
                this.volumeSamples[i] > this.volumeSamples[i - 1] &&
                this.volumeSamples[i] > this.volumeSamples[i + 1]
            ) {
                peaks++;
            }
        }

        // Normalize to 0-1 (assume 5-15 peaks is normal range for 30 seconds)
        return Math.min(1, Math.max(0, (peaks - 5) / 10));
    }

    // Calculate standard deviation
    private calculateStandardDeviation(values: number[]): number {
        if (values.length < 2) return 0;

        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
        const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;

        return Math.sqrt(avgSquaredDiff);
    }

    // Calculate Resonance Metrics for Couples (C01-C10)
    calculateCoupleResonance(): import('./types').CoupleResonanceV1 {
        // Filter samples by tags
        const indicesA = this.tagSamples.map((t, i) => t === 'A' ? i : -1).filter(i => i !== -1);
        const indicesB = this.tagSamples.map((t, i) => t === 'B' ? i : -1).filter(i => i !== -1);
        const indicesBoth = this.tagSamples.map((t, i) => t === 'Both' ? i : -1).filter(i => i !== -1);

        const pitchA = indicesA.map(i => this.pitchSamples[i]).filter(p => p > 0);
        const pitchB = indicesB.map(i => this.pitchSamples[i]).filter(p => p > 0);

        const volA = indicesA.map(i => this.volumeSamples[i]);
        const volB = indicesB.map(i => this.volumeSamples[i]);

        const meanA = pitchA.length > 0 ? pitchA.reduce((a, b) => a + b, 0) / pitchA.length : 150;
        const meanB = pitchB.length > 0 ? pitchB.reduce((a, b) => a + b, 0) / pitchB.length : 150;

        // C01: F0 Distance
        const f0_distance = Math.abs(meanA - meanB);

        // C02: Speech Rate Delta
        // Simple peak-based rate estimate for each
        const estimateRateForIndices = (indices: number[]) => {
            const vols = indices.map(i => this.volumeSamples[i]);
            if (vols.length < 5) return 0.5;
            let peaks = 0;
            const threshold = 0.5 * Math.max(...vols);
            for (let i = 1; i < vols.length - 1; i++) {
                if (vols[i] > threshold && vols[i] > vols[i - 1] && vols[i] > vols[i + 1]) peaks++;
            }
            return peaks / (vols.length / 50 || 1); // 50 samples/s roughly
        };
        const speech_rate_delta = Math.abs(estimateRateForIndices(indicesA) - estimateRateForIndices(indicesB));

        // C03: Turn-taking Latency
        let totalLatency = 0;
        let turnCount = 0;
        for (let i = 1; i < this.tagSamples.length; i++) {
            if (this.tagSamples[i - 1] === 'A' && this.tagSamples[i] === 'B') {
                // Approximate time based on 50 samples/s loop
                totalLatency += 20; // ms per sample gap? Very crude.
                turnCount++;
            }
        }
        const turn_taking_latency = turnCount > 0 ? totalLatency / turnCount : 0;

        // C04: Cross-talk Ratio
        const cross_talk_ratio = this.tagSamples.length > 0 ? indicesBoth.length / this.tagSamples.length : 0;

        // C05: Spectral Convergence (Centroid similarity)
        const activeCentroidsA = indicesA.map(i => this.centroidSamples[i]).filter(c => c > 0);
        const activeCentroidsB = indicesB.map(i => this.centroidSamples[i]).filter(c => c > 0);
        const centroidA = activeCentroidsA.length > 0 ? activeCentroidsA.reduce((a, b) => a + b, 0) / activeCentroidsA.length : 2000;
        const centroidB = activeCentroidsB.length > 0 ? activeCentroidsB.reduce((a, b) => a + b, 0) / activeCentroidsB.length : 2000;
        const spectral_convergence = 1 - Math.min(1, Math.abs(centroidA - centroidB) / 2000);

        // C06: Amplitude Sync (Envelop Correlation - simplified)
        const amplitude_sync = 0.5 + (indicesBoth.length > 0 ? 0.3 : 0); // Placeholder until windowed correlation

        // C07: Stress Covariance
        const stress_covariance = 0.5; // Placeholder

        // C08: Vocal Quality Sync
        const vocal_quality_sync = 0.6; // Placeholder

        // C09: Pause Entropy
        const pause_entropy = 0.4; // Placeholder

        // C10: Pitch Range Overlap
        const minA = pitchA.length > 0 ? Math.min(...pitchA) : 100;
        const maxA = pitchA.length > 0 ? Math.max(...pitchA) : 200;
        const minB = pitchB.length > 0 ? Math.min(...pitchB) : 100;
        const maxB = pitchB.length > 0 ? Math.max(...pitchB) : 200;
        const overlap = Math.max(0, Math.min(maxA, maxB) - Math.max(minA, minB));
        const combinedRange = Math.max(maxA, maxB) - Math.min(minA, minB);
        const pitch_overlap = combinedRange > 0 ? overlap / combinedRange : 0;

        return {
            f0_distance: parseFloat(f0_distance.toFixed(2)),
            speech_rate_delta: parseFloat(speech_rate_delta.toFixed(2)),
            turn_taking_latency: Math.round(turn_taking_latency),
            cross_talk_ratio: parseFloat(cross_talk_ratio.toFixed(2)),
            spectral_convergence: parseFloat(spectral_convergence.toFixed(2)),
            amplitude_sync,
            stress_covariance,
            vocal_quality_sync,
            pause_entropy,
            pitch_overlap: parseFloat(pitch_overlap.toFixed(2))
        };
    }

    destroy(): void {
        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }
        this.analyser = null;
        this.dataArray = null;
        this.frequencyArray = null;
        this.reset();
    }
}

export function classifyTypeCode(metrics: AnalysisMetrics): TypeCode {
    // Special cases: Force Robot or Whale
    if (metrics.vibe < THRESHOLDS.ROBOT_STABILITY && metrics.pitch > THRESHOLDS.PITCH) {
        return 'HFCC'; // The Bored Robot
    }

    if (metrics.pitch < THRESHOLDS.WHALE_PITCH && metrics.vibe < THRESHOLDS.VIBE) {
        return 'LSCD'; // The Deep Whale
    }

    // Normal classification
    const p = metrics.pitch > THRESHOLDS.PITCH ? 'H' : 'L';
    const s = metrics.speed > THRESHOLDS.SPEED ? 'F' : 'S';
    const v = metrics.vibe > THRESHOLDS.VIBE ? 'E' : 'C';
    const t = metrics.tone > THRESHOLDS.TONE ? 'C' : 'D';

    return `${p}${s}${v}${t}` as TypeCode;
}

export function classifyElonType(a: AnalysisMetrics): TypeCode {
    const pitchVar = (a.pitchVar || 0) * 100;
    const axis1 = pitchVar < 20 ? "E" : "N";
    const axis2 = (a.silenceRate || 0) > 0.15 ? "L" : "P";
    const axis3 = (a.volumeDb || -20) > -10 ? "O" : "C";
    const axis4 = (a.speedVar || 0) > 0.3 ? "N" : "S";

    const code = axis1 + axis2 + axis3 + axis4;

    const specialMappings: Record<string, TypeCode> = {
        'EPCN': 'EPCN',
        'NPON': 'NPON',
        'ELSN': 'ELSN',
    };

    return (specialMappings[code] || code) as TypeCode;
}

const JUDGE_CONFIG = {
    WEIGHTS_NORMAL: { stability: 0.4, consistency: 0.3, performance: 0.3 },
    WEIGHTS_GHOST: { stability: 0.8, consistency: 0.0, performance: 0.2 },
    THRESHOLDS: { HIRED: 85, SUSPECTED: 50, BURN_RATE: 0.05 }
};

const CULTURAL_DISTANCE_MATRIX: Record<string, Record<string, number>> = {
    'EAST_ASIA': { 'MI6_LONDON': 80, 'CIA_FBI_DC': 70, 'KGB_FSB_RU': 60, 'PUBLIC_SEC_JP': 10 },
    'NORTH_AMERICA': { 'MI6_LONDON': 40, 'CIA_FBI_DC': 10, 'KGB_FSB_RU': 80, 'PUBLIC_SEC_JP': 90 },
    'EUROPEAN_MIX': { 'MI6_LONDON': 20, 'CIA_FBI_DC': 30, 'KGB_FSB_RU': 50, 'PUBLIC_SEC_JP': 85 },
    'UNKNOWN': { 'MI6_LONDON': 50, 'CIA_FBI_DC': 50, 'KGB_FSB_RU': 50, 'PUBLIC_SEC_JP': 50 }
};

export const REPORT_MESSAGES: Record<string, Record<string, string>> = {
    'MI6_LONDON': {
        'HIRED': "The Director is impressed. Your cover is seamless. Report to Vauxhall Cross for briefing.",
        'SUSPECTED': "Your skills are notable, but your background remains 'cloudy'. Surveillance will continue.",
        'REJECTED': "Back to the basics, amateur. You lack the necessary 'finesse' for London."
    },
    'CIA_FBI_DC': {
        'HIRED': "Target confirmed. You've got the guts we need for the field. Don't make us regret this.",
        'SUSPECTED': "Good performance, but something doesn't add up. We'll be watching you, 'Agent'.",
        'REJECTED': "Nice try, kid. But we need professionals, not actors. Get out of our sight."
    },
    'PUBLIC_SEC_JP': {
        'HIRED': "適正を確認。貴殿をSランク協力者として登録する。直ちに任務に就け。私情は不要だ。",
        'SUSPECTED': "技術は評価するが、身辺に不審な点が多い。当面は監視対象（カテゴリーB）とする。",
        'REJECTED': "実力不足だ。一般市民として静かに暮らし、二度と我々に接触するな。"
    },
    'KGB_FSB_RU': {
        'HIRED': "Impressive. You have the iron nerves of a true Comrade. Mother Russia welcomes you.",
        'SUSPECTED': "We see potential, but we also see... secrets. Do not think you can hide from the Kremlin.",
        'REJECTED': "Weak. You lack the discipline for our cause. Go home before you get hurt."
    },
    'UNKNOWN': {
        'HIRED': "Identity: UNKNOWN. Skill: S-CLASS. You are the ghost we've been looking for.",
        'SUSPECTED': "Identity hidden. Motive unclear. We will keep your file open... just in case.",
        'REJECTED': "No ID, no skill. You are just a shadow with no substance. Disappear."
    },
    'SYSTEM': {
        'BURN': "CRITICAL ERROR: BIOMETRIC FRAUD DETECTED. TERMINATION PROTOCOL INITIATED.",
        'MISMATCH_WARNING': "Warning: Vocal profile indicates a discrepancy. Origin likely: "
    }
};

function calculateVarianceAcross(arr: number[]): number {
    if (arr.length === 0) return 0;
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / arr.length;
}

export function runJudgeEngine(vector30: number[], metadata: any) {
    const isGhost = !metadata.origin || metadata.origin === 'UNKNOWN';
    const originKey = isGhost ? 'UNKNOWN' : metadata.origin;
    const targetKey = metadata.target || 'UNKNOWN';
    const weights = isGhost ? JUDGE_CONFIG.WEIGHTS_GHOST : JUDGE_CONFIG.WEIGHTS_NORMAL;

    const highFreqVector = vector30.slice(15);
    const variance = calculateVarianceAcross(highFreqVector);

    let s_stability = Math.max(0, 100 - (variance * 500));

    let s_consistency = 100;
    if (!isGhost) {
        const lang = (metadata.browserLang || '').toLowerCase();
        if (originKey === 'EAST_ASIA' && !lang.includes('ja') && !lang.includes('zh') && !lang.includes('ko')) {
            s_consistency -= 40;
        } else if (originKey === 'NORTH_AMERICA' && !lang.includes('en')) {
            s_consistency -= 40;
        }
        const tz = metadata.timezone || '';
        if (originKey === 'EAST_ASIA' && !tz.includes('Asia') && !tz.includes('Tokyo')) {
            s_consistency -= 20;
        } else if (originKey === 'NORTH_AMERICA' && !tz.includes('America')) {
            s_consistency -= 20;
        }
    } else {
        s_consistency = 50;
    }
    s_consistency = Math.max(0, s_consistency);

    let s_performance = 50;
    if (!isGhost) {
        const matrixRow = CULTURAL_DISTANCE_MATRIX[originKey] || CULTURAL_DISTANCE_MATRIX['UNKNOWN'];
        const difficulty = matrixRow[targetKey] || 50;
        if (s_stability > 80) {
            s_performance += difficulty * 0.5;
        } else {
            s_performance -= difficulty * 0.2;
        }
    } else {
        if (s_stability > 95) s_performance = 90;
        else if (s_stability > 80) s_performance = 70;
        else s_performance = 40;
    }
    s_performance = Math.min(100, Math.max(0, s_performance));

    const totalScore = Math.floor(
        (s_stability * weights.stability) +
        (s_consistency * weights.consistency) +
        (s_performance * weights.performance)
    );

    const isAnomaly = (variance === 0);
    const isFatalLie = (!isGhost && originKey === 'NORTH_AMERICA' && metadata.browserLang && metadata.browserLang.includes('ja'));
    const isRandomBurn = (Math.random() < JUDGE_CONFIG.THRESHOLDS.BURN_RATE);

    if (isAnomaly || isFatalLie || isRandomBurn) {
        let reason = 'UNAUTHORIZED_SIGNAL';
        if (isFatalLie) reason = 'FATAL_LOCALE_MISMATCH';
        if (isAnomaly) reason = 'VOID_DATA_DETECTED';
        if (isRandomBurn) reason = 'AGENCY_CLEANUP_PROTOCOL';

        return {
            stamp: 'BURN',
            score: totalScore,
            reason: reason,
            isGhost: isGhost,
            debug: { s_st: s_stability, s_co: s_consistency, s_pe: s_performance }
        };
    }

    if (isGhost) {
        if (totalScore >= 95) return { stamp: 'HIRED', score: totalScore, reason: 'PHANTOM_ACE_CONFIRMED', isGhost: true };
        if (totalScore >= 60) return { stamp: 'SUSPECTED', score: totalScore, reason: 'UNIDENTIFIED_SKILL', isGhost: true };
        return { stamp: 'REJECTED', score: totalScore, reason: 'INSUFFICIENT_DATA', isGhost: true };
    }

    if (totalScore >= JUDGE_CONFIG.THRESHOLDS.HIRED && s_consistency === 100) {
        return { stamp: 'HIRED', score: totalScore, reason: 'PERFECT_ALIGNMENT', isGhost: false };
    }

    if (totalScore >= JUDGE_CONFIG.THRESHOLDS.SUSPECTED) {
        let reason = 'SKILL_VERIFIED_BUT_DOUBTFUL';
        if (s_consistency < 80) reason = 'LOCALE_DISCREPANCY_DETECTED';
        return { stamp: 'SUSPECTED', score: totalScore, reason: reason, isGhost: false };
    }

    return { stamp: 'REJECTED', score: totalScore, reason: 'UNSTABLE_VOICE_PATTERN', isGhost: false };
}

export function generateFinalReport(result: any, metadata: any) {
    if (result.stamp === 'BURN' || result.typeCode === 'BURN') return REPORT_MESSAGES.SYSTEM.BURN;
    const targetKey = (metadata.target && REPORT_MESSAGES[metadata.target]) ? metadata.target : 'UNKNOWN';
    let message = REPORT_MESSAGES[targetKey]?.[result.stamp || result.typeCode] || ("Outcome: " + (result.stamp || result.typeCode));

    if (!result.isGhost) {
        const lang = (metadata.browserLang || '').toLowerCase();
        const isAsiaMismatch = (metadata.origin === 'EAST_ASIA' && !lang.includes('ja') && !lang.includes('zh') && !lang.includes('ko'));
        const isWesternMismatch = (metadata.origin !== 'EAST_ASIA' && !lang.includes('en'));
        if (isAsiaMismatch || isWesternMismatch) {
            const detectedLocale = (metadata.browserLang || 'UNKNOWN').toUpperCase();
            message += `\n\n[SYSTEM ADVISORY]: ${REPORT_MESSAGES.SYSTEM.MISMATCH_WARNING} [${detectedLocale}]. Stop lying.`;
        }
    }
    return message;
}

export function classifySpyType(stamp: string): TypeCode {
    const mapping: Record<string, TypeCode> = {
        'HIRED': 'HIRED',
        'SUSPECTED': 'SUSP',
        'REJECTED': 'REJT',
        'BURN': 'BURN'
    };
    return mapping[stamp] || 'REJT';
}

// Singleton instance
let analyzerInstance: VoiceAnalyzer | null = null;

export function getAnalyzer(): VoiceAnalyzer {
    if (!analyzerInstance) {
        analyzerInstance = new VoiceAnalyzer();
    }
    return analyzerInstance;
}

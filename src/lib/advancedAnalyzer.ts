/**
 * Advanced Voice Analyzer (Stream B - Asset Pipeline)
 * 
 * Extracts 30-dimensional acoustic features for research-grade analysis.
 * This runs in parallel with the lightweight analyzer (Stream A) but processes
 * the audio more thoroughly for dataset creation.
 * 
 * Dependencies:
 * - meyda: MFCC and spectral feature extraction
 * - Custom algorithms: Jitter, Shimmer, HNR, VAD
 */

import Meyda, { MeydaFeaturesObject } from 'meyda';
import {
    AnalysisMetricsV2,
    PhysiologicalFeatures,
    TemporalFeatures,
    SpectralFeatures,
    EnvironmentMetadata,
    NoiseCategory,
    DeviceTier,
} from './types30d';

interface VoiceSegment {
    start: number;
    end: number;
    samples: Float32Array;
}

export class AdvancedAnalyzer {
    private audioContext: AudioContext;
    private sampleRate: number = 16000; // Target sample rate for analysis

    constructor() {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }

    /**
     * Main entry point: Extract all 30 dimensions from an AudioBuffer
     */
    async extractFeatures(audioBuffer: AudioBuffer): Promise<AnalysisMetricsV2> {
        console.log('[AdvancedAnalyzer] Starting 30D feature extraction...');

        // Resample to 16kHz if needed
        const resampledBuffer = await this.resampleTo16kHz(audioBuffer);
        const audioData = resampledBuffer.getChannelData(0); // Mono

        // Step 1: Voice Activity Detection (VAD)
        const voiceSegments = this.detectVoiceActivity(audioData, this.sampleRate);
        console.log(`[AdvancedAnalyzer] Detected ${voiceSegments.length} voice segments`);

        // Step 2: Extract features from each category
        const physiological = this.extractPhysiological(voiceSegments, this.sampleRate);
        const temporal = this.extractTemporal(voiceSegments, audioData.length, this.sampleRate);
        const spectral = this.extractSpectral(audioData, this.sampleRate);
        const environment = this.analyzeEnvironment(audioData, this.sampleRate);

        return {
            schema_version: '2.0.0',
            script_id: 'spell_global_v1', // Will be passed from caller in future
            physiological,
            temporal,
            spectral,
            environment,
        };
    }

    /**
     * Resample audio to 16kHz for consistent analysis
     */
    private async resampleTo16kHz(buffer: AudioBuffer): Promise<AudioBuffer> {
        if (buffer.sampleRate === 16000) {
            return buffer;
        }

        const offlineContext = new OfflineAudioContext(1, buffer.duration * 16000, 16000);
        const source = offlineContext.createBufferSource();
        source.buffer = buffer;
        source.connect(offlineContext.destination);
        source.start();

        return await offlineContext.startRendering();
    }

    /**
     * VAD: Detect voice activity regions using energy-based threshold
     */
    private detectVoiceActivity(
        audioData: Float32Array,
        sampleRate: number
    ): VoiceSegment[] {
        const frameSize = Math.floor(sampleRate * 0.025); // 25ms frames
        const hopSize = Math.floor(sampleRate * 0.010); // 10ms hop
        const energyThreshold = 0.01; // Minimum energy for voice

        const segments: VoiceSegment[] = [];
        let inVoice = false;
        let segmentStart = 0;

        for (let i = 0; i < audioData.length - frameSize; i += hopSize) {
            const frame = audioData.slice(i, i + frameSize);
            const energy = this.calculateEnergy(frame);

            if (energy > energyThreshold && !inVoice) {
                // Voice started
                segmentStart = i;
                inVoice = true;
            } else if (energy <= energyThreshold && inVoice) {
                // Voice ended
                segments.push({
                    start: segmentStart,
                    end: i,
                    samples: audioData.slice(segmentStart, i),
                });
                inVoice = false;
            }
        }

        // Handle final segment
        if (inVoice) {
            segments.push({
                start: segmentStart,
                end: audioData.length,
                samples: audioData.slice(segmentStart),
            });
        }

        return segments.filter(s => s.end - s.start > sampleRate * 0.1); // Min 100ms
    }

    /**
     * Calculate energy of a frame
     */
    private calculateEnergy(frame: Float32Array): number {
        let sum = 0;
        for (let i = 0; i < frame.length; i++) {
            sum += frame[i] * frame[i];
        }
        return sum / frame.length;
    }

    /**
     * F-Series: Physiological Features (F01-F05)
     */
    private extractPhysiological(
        segments: VoiceSegment[],
        sampleRate: number
    ): PhysiologicalFeatures {
        // Concatenate all voice segments for analysis
        const allVoiceSamples = this.concatenateSegments(segments);

        // F01-F02: Fundamental frequency (F0) using autocorrelation
        const f0Contour = this.extractF0Contour(allVoiceSamples, sampleRate);
        const f0_mean = this.mean(f0Contour);
        const f0_sd = this.standardDeviation(f0Contour);

        // F03: Jitter (period-to-period frequency variation)
        const jitter_local = this.calculateJitter(f0Contour);

        // F04: Shimmer (amplitude variation)
        const shimmer_local = this.calculateShimmer(allVoiceSamples);

        // F05: Harmonics-to-Noise Ratio
        const hnr = this.calculateHNR(allVoiceSamples, sampleRate, f0_mean);

        return {
            f0_mean,
            f0_sd,
            jitter_local,
            shimmer_local,
            hnr,
        };
    }

    /**
     * Extract F0 contour using autocorrelation method
     */
    private extractF0Contour(samples: Float32Array, sampleRate: number): number[] {
        const frameSize = Math.floor(sampleRate * 0.025); // 25ms
        const hopSize = Math.floor(sampleRate * 0.010); // 10ms
        const minF0 = 75; // Hz
        const maxF0 = 500; // Hz

        const f0Values: number[] = [];

        for (let i = 0; i < samples.length - frameSize; i += hopSize) {
            const frame = samples.slice(i, i + frameSize);
            const f0 = this.autocorrelationF0(frame, sampleRate, minF0, maxF0);
            if (f0 > 0) {
                f0Values.push(f0);
            }
        }

        return f0Values;
    }

    /**
     * Autocorrelation-based F0 estimation
     */
    private autocorrelationF0(
        frame: Float32Array,
        sampleRate: number,
        minF0: number,
        maxF0: number
    ): number {
        const minLag = Math.floor(sampleRate / maxF0);
        const maxLag = Math.floor(sampleRate / minF0);

        let maxCorr = -Infinity;
        let bestLag = 0;

        for (let lag = minLag; lag <= maxLag; lag++) {
            let corr = 0;
            for (let i = 0; i < frame.length - lag; i++) {
                corr += frame[i] * frame[i + lag];
            }
            if (corr > maxCorr) {
                maxCorr = corr;
                bestLag = lag;
            }
        }

        return bestLag > 0 ? sampleRate / bestLag : 0;
    }

    /**
     * F03: Calculate Jitter (local period variation)
     */
    private calculateJitter(f0Contour: number[]): number {
        if (f0Contour.length < 2) return 0;

        const periods = f0Contour.map(f => (f > 0 ? 1 / f : 0));
        let sumDiff = 0;

        for (let i = 1; i < periods.length; i++) {
            sumDiff += Math.abs(periods[i] - periods[i - 1]);
        }

        const avgPeriod = this.mean(periods);
        return avgPeriod > 0 ? (sumDiff / (periods.length - 1) / avgPeriod) * 100 : 0;
    }

    /**
     * F04: Calculate Shimmer (amplitude variation)
     */
    private calculateShimmer(samples: Float32Array): number {
        // Simplified: Peak amplitude variation
        const frameSize = 512;
        const peaks: number[] = [];

        for (let i = 0; i < samples.length - frameSize; i += frameSize) {
            const frame = samples.slice(i, i + frameSize);
            const peak = Math.max(...Array.from(frame).map(Math.abs));
            peaks.push(peak);
        }

        if (peaks.length < 2) return 0;

        let sumDiff = 0;
        for (let i = 1; i < peaks.length; i++) {
            sumDiff += Math.abs(peaks[i] - peaks[i - 1]);
        }

        const avgPeak = this.mean(peaks);
        return avgPeak > 0 ? (sumDiff / (peaks.length - 1) / avgPeak) * 100 : 0;
    }

    /**
     * F05: Calculate HNR (Harmonics-to-Noise Ratio)
     */
    private calculateHNR(samples: Float32Array, sampleRate: number, f0: number): number {
        if (f0 <= 0) return 0;

        const period = Math.floor(sampleRate / f0);
        let harmonicEnergy = 0;
        let totalEnergy = 0;

        for (let i = 0; i < samples.length - period; i++) {
            const harmonicComponent = samples[i] * samples[i + period];
            harmonicEnergy += Math.abs(harmonicComponent);
            totalEnergy += samples[i] * samples[i];
        }

        const noiseEnergy = totalEnergy - harmonicEnergy;
        return noiseEnergy > 0 ? 10 * Math.log10(harmonicEnergy / noiseEnergy) : 0;
    }

    /**
     * T-Series: Temporal Features (T01-T05)
     */
    private extractTemporal(
        segments: VoiceSegment[],
        totalSamples: number,
        sampleRate: number
    ): TemporalFeatures {
        const total_duration = totalSamples / sampleRate;
        const phonation_time = segments.reduce((sum, s) => sum + (s.end - s.start) / sampleRate, 0);
        const pause_ratio = (total_duration - phonation_time) / total_duration;

        // Count long pauses (>500ms)
        let long_pause_count = 0;
        for (let i = 0; i < segments.length - 1; i++) {
            const gap = (segments[i + 1].start - segments[i].end) / sampleRate;
            if (gap > 0.5) {
                long_pause_count++;
            }
        }

        // Speech rate (assuming Global Spell has 8 syllables)
        const speech_rate = phonation_time > 0 ? 8 / phonation_time : 0;

        return {
            total_duration,
            phonation_time,
            speech_rate,
            pause_ratio,
            long_pause_count,
        };
    }

    /**
     * S-Series: Spectral Features (S01-S05)
     */
    private extractSpectral(audioData: Float32Array, sampleRate: number): SpectralFeatures {
        // Use Meyda for MFCC and spectral features
        const bufferSize = 2048;
        const hopSize = 512;

        const centroids: number[] = [];
        const rolloffs: number[] = [];
        const mfccFrames: number[][] = [];

        Meyda.sampleRate = sampleRate;
        Meyda.bufferSize = bufferSize;

        for (let i = 0; i < audioData.length - bufferSize; i += hopSize) {
            const frame = Array.from(audioData.slice(i, i + bufferSize));

            const features = Meyda.extract(['spectralCentroid', 'spectralRolloff', 'mfcc'], frame);

            if (features.spectralCentroid) centroids.push(features.spectralCentroid);
            if (features.spectralRolloff) rolloffs.push(features.spectralRolloff);
            if (features.mfcc) mfccFrames.push(features.mfcc);
        }

        // S01: Mean spectral centroid
        const spectral_centroid = this.mean(centroids);

        // S02: Mean spectral rolloff
        const spectral_rolloff = this.mean(rolloffs);

        // S03-S04: MFCC mean and variance (13 coefficients)
        const mfcc_mean = this.meanVector(mfccFrames);
        const mfcc_var = this.varianceVector(mfccFrames, mfcc_mean);

        // S05: DTW score (placeholder - needs reference template)
        const dtw_score = 0; // TODO: Implement DTW against reference

        return {
            spectral_centroid,
            spectral_rolloff,
            mfcc_mean,
            mfcc_var,
            dtw_score,
        };
    }

    /**
     * Environment Metadata
     */
    private analyzeEnvironment(audioData: Float32Array, sampleRate: number): EnvironmentMetadata {
        // Calculate SNR (simplified)
        const snr_db = this.calculateSNR(audioData);

        // Noise classification (placeholder)
        const noise_category: NoiseCategory = 'Silence'; // TODO: Use ML model

        // Device tier (from UserAgent - placeholder)
        const device_tier: DeviceTier = 'High-End';

        // OS family
        const os_family = this.detectOS();

        return {
            snr_db,
            noise_category,
            device_tier,
            os_family,
        };
    }

    /**
     * Calculate Signal-to-Noise Ratio
     */
    private calculateSNR(audioData: Float32Array): number {
        // Simplified: Assume first/last 10% is noise, middle is signal
        const noiseRegion1 = audioData.slice(0, Math.floor(audioData.length * 0.1));
        const noiseRegion2 = audioData.slice(Math.floor(audioData.length * 0.9));
        const signalRegion = audioData.slice(
            Math.floor(audioData.length * 0.2),
            Math.floor(audioData.length * 0.8)
        );

        const noiseEnergy =
            (this.calculateEnergy(noiseRegion1) + this.calculateEnergy(noiseRegion2)) / 2;
        const signalEnergy = this.calculateEnergy(signalRegion);

        return noiseEnergy > 0 ? 10 * Math.log10(signalEnergy / noiseEnergy) : 0;
    }

    /**
     * Detect OS from UserAgent
     */
    private detectOS(): string {
        const ua = navigator.userAgent.toLowerCase();
        if (ua.includes('iphone') || ua.includes('ipad')) return 'iOS';
        if (ua.includes('android')) return 'Android';
        if (ua.includes('win')) return 'Windows';
        if (ua.includes('mac')) return 'macOS';
        if (ua.includes('linux')) return 'Linux';
        return 'Unknown';
    }

    // ==================== Helper Functions ====================

    private concatenateSegments(segments: VoiceSegment[]): Float32Array {
        const totalLength = segments.reduce((sum, s) => sum + s.samples.length, 0);
        const result = new Float32Array(totalLength);
        let offset = 0;
        for (const seg of segments) {
            result.set(seg.samples, offset);
            offset += seg.samples.length;
        }
        return result;
    }

    private mean(values: number[]): number {
        return values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
    }

    private standardDeviation(values: number[]): number {
        const avg = this.mean(values);
        const squareDiffs = values.map(v => Math.pow(v - avg, 2));
        return Math.sqrt(this.mean(squareDiffs));
    }

    private meanVector(vectors: number[][]): number[] {
        if (vectors.length === 0) return [];
        const dim = vectors[0].length;
        const sums = new Array(dim).fill(0);

        for (const vec of vectors) {
            for (let i = 0; i < dim; i++) {
                sums[i] += vec[i];
            }
        }

        return sums.map(s => s / vectors.length);
    }

    private varianceVector(vectors: number[][], mean: number[]): number[] {
        if (vectors.length === 0) return [];
        const dim = mean.length;
        const variances = new Array(dim).fill(0);

        for (const vec of vectors) {
            for (let i = 0; i < dim; i++) {
                variances[i] += Math.pow(vec[i] - mean[i], 2);
            }
        }

        return variances.map(v => v / vectors.length);
    }

    destroy() {
        // Cleanup if needed
    }
}

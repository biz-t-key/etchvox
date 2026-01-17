// Voice Analyzer - 100% Client-side Processing
// Uses Web Audio API to analyze voice characteristics

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

    constructor() {
        this.reset();
    }

    reset() {
        this.pitchSamples = [];
        this.volumeSamples = [];
        this.centroidSamples = [];
    }

    async initialize(): Promise<AnalyserNode> {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
            sampleRate: 44100,
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
    collectSample(): void {
        if (!this.analyser || !this.dataArray || !this.frequencyArray) return;

        // Get time domain data for pitch detection
        this.analyser.getFloatTimeDomainData(this.dataArray as any);

        // Get frequency data for spectral analysis
        this.analyser.getByteFrequencyData(this.frequencyArray as any);

        // Calculate RMS (volume)
        const rms = this.calculateRMS(this.dataArray);

        // Only process if there's actual audio (not silence)
        if (rms > 0.01) {
            this.volumeSamples.push(rms);

            // Detect pitch using autocorrelation
            const pitch = this.detectPitch(this.dataArray, this.audioContext!.sampleRate);
            if (pitch > 50 && pitch < 500) { // Valid human voice range
                this.pitchSamples.push(pitch);
            }

            // Calculate spectral centroid
            const centroid = this.calculateSpectralCentroid(this.frequencyArray);
            if (centroid > 0) {
                this.centroidSamples.push(centroid);
            }
        }
    }

    // Calculate final analysis result
    analyze(): AnalysisResult {
        const metrics = this.calculateMetrics();
        const typeCode = this.classifyType(metrics);

        return {
            typeCode,
            metrics,
        };
    }

    private calculateMetrics(): AnalysisMetrics {
        // Average pitch
        const avgPitch = this.pitchSamples.length > 0
            ? this.pitchSamples.reduce((a, b) => a + b, 0) / this.pitchSamples.length
            : 150;

        // Average volume (normalized to 0-1)
        const avgVolume = this.volumeSamples.length > 0
            ? this.volumeSamples.reduce((a, b) => a + b, 0) / this.volumeSamples.length
            : 0.5;

        // Volume variance (vibe/energy)
        const volumeVariance = this.volumeSamples.length > 1
            ? this.calculateStandardDeviation(this.volumeSamples) / avgVolume
            : 0.1;

        // Spectral centroid (tone brightness)
        const avgCentroid = this.centroidSamples.length > 0
            ? this.centroidSamples.reduce((a, b) => a + b, 0) / this.centroidSamples.length
            : 2000;

        // Speed estimation based on volume peaks
        const speedScore = this.estimateSpeed();

        // Humanity score (higher variance = more human)
        const pitchVariance = this.pitchSamples.length > 1
            ? this.calculateStandardDeviation(this.pitchSamples) / avgPitch
            : 0.05;
        const humanityScore = Math.min(100, Math.max(0,
            50 + (pitchVariance * 200) + (volumeVariance * 100)
        ));

        return {
            pitch: Math.round(avgPitch),
            speed: Math.round(speedScore * 100) / 100,
            vibe: Math.round(volumeVariance * 100) / 100,
            tone: Math.round(avgCentroid),
            humanityScore: Math.round(humanityScore),
        };
    }

    private classifyType(metrics: AnalysisMetrics): TypeCode {
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

    // Cleanup
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

// Singleton instance
let analyzerInstance: VoiceAnalyzer | null = null;

export function getAnalyzer(): VoiceAnalyzer {
    if (!analyzerInstance) {
        analyzerInstance = new VoiceAnalyzer();
    }
    return analyzerInstance;
}

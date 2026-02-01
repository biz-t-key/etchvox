'use client';

import { VoiceLogV2 } from '@/lib/types';

interface Props {
    log: VoiceLogV2;
}

export default function HighFidelityMetrics({ log }: Props) {
    const { features, environment, context_time, resonance } = log;

    return (
        <div className="space-y-12 animate-fade-in">
            <div className="text-center space-y-2 mb-12">
                <h3 className="text-xl font-black text-cyan-400 uppercase tracking-[0.2em] italic">Dual-Stream Data Audit</h3>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">High-Fidelity Biometric Extraction · Schema 1.0.0</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* 1. Physical Layer */}
                <div className="glass rounded-2xl p-6 border border-cyan-500/20 space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <span className="text-xl">🧬</span>
                        <h4 className="font-black text-sm text-white uppercase tracking-widest">Physical Layer</h4>
                    </div>
                    <div className="space-y-4">
                        <MetricItem label="Jitter (Tremor)" value={features.jitter_pct.toFixed(3)} unit="%" percent={features.jitter_pct * 100} />
                        <MetricItem label="Shimmer" value={features.shimmer_db.toFixed(3)} unit="dB" percent={features.shimmer_db * 50} />
                        <MetricItem label="HNR (Harmonics)" value={features.hnr_db.toFixed(1)} unit="dB" percent={(features.hnr_db / 30) * 100} />
                        <MetricItem label="Brightness" value={Math.round(features.spectral_centroid)} unit="Hz" percent={(features.spectral_centroid / 5000) * 100} />
                        <MetricItem label="F0 (Mean)" value={Math.round(features.f0_mean)} unit="Hz" percent={(features.f0_mean / 500) * 100} />
                    </div>
                </div>

                {/* 2. Temporal Layer */}
                <div className="glass rounded-2xl p-6 border border-magenta-500/20 space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <span className="text-xl">⏱️</span>
                        <h4 className="font-black text-sm text-white uppercase tracking-widest">Temporal Layer</h4>
                    </div>
                    <div className="space-y-4">
                        <MetricItem label="Speech Rate" value={features.speech_rate.toFixed(1)} unit="syll/s" percent={(features.speech_rate / 8) * 100} color="bg-magenta-500" />
                        <MetricItem label="Pause Ratio" value={(features.pause_ratio * 100).toFixed(0)} unit="%" percent={features.pause_ratio * 100} color="bg-magenta-500" />
                        <MetricItem label="Phonation" value={features.phonation_time.toFixed(1)} unit="s" percent={(features.phonation_time / features.total_duration) * 100} color="bg-magenta-500" />
                        <MetricItem label="Duration" value={features.total_duration.toFixed(1)} unit="s" percent={(features.total_duration / 20) * 100} color="bg-magenta-500" />
                        <MetricItem label="Gaps Count" value={features.long_pause_count} unit="" percent={(features.long_pause_count / 10) * 100} color="bg-magenta-500" />
                    </div>
                </div>

                {/* 3. Environment & Metadata */}
                <div className="glass rounded-2xl p-6 border border-yellow-500/20 space-y-6">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <span className="text-xl">🌍</span>
                        <h4 className="font-black text-sm text-white uppercase tracking-widest">Environment</h4>
                    </div>
                    <div className="space-y-4">
                        <MetricItem label="SNR" value={environment.snr_db.toFixed(1)} unit="dB" percent={(environment.snr_db / 40) * 100} color="bg-yellow-500" />
                        <MetricItem label="Noise Category" value={environment.noise_category} unit="" percent={50} color="bg-yellow-500" />
                        <MetricItem label="Device Tier" value={environment.device_tier} unit="" percent={80} color="bg-yellow-500" />
                        <MetricItem label="MFCC Consistency" value={(features.mfcc_var[0] || 0).toFixed(2)} unit="" percent={100 - (features.mfcc_var[0] * 10)} color="bg-yellow-500" />
                        <MetricItem label="DTW Dist" value={features.dtw_score.toFixed(3)} unit="" percent={100 - (features.dtw_score * 1000)} color="bg-yellow-500" />
                    </div>
                </div>
            </div>

            {/* 4. Relational Layer (Couples Only) */}
            {resonance && (
                <div className="glass rounded-[2rem] p-8 md:p-12 border border-pink-500/30 bg-pink-500/5 space-y-10">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                        <span className="text-3xl">💞</span>
                        <div>
                            <h4 className="font-black text-lg text-white uppercase tracking-[0.2em]">Relational Layer</h4>
                            <p className="text-[10px] text-pink-400 font-bold uppercase tracking-widest">Acoustic Resonance & Mimicry</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-8">
                        <div className="space-y-4">
                            <MetricItem label="F0 Distance" value={resonance.f0_distance} unit="Hz" percent={(resonance.f0_distance / 100) * 100} color="bg-pink-500" />
                            <MetricItem label="Pitch Overlap" value={(resonance.pitch_overlap * 100).toFixed(0)} unit="%" percent={resonance.pitch_overlap * 100} color="bg-pink-500" />
                        </div>
                        <div className="space-y-4">
                            <MetricItem label="Speech Rate Δ" value={resonance.speech_rate_delta.toFixed(1)} unit="syll/s" percent={(resonance.speech_rate_delta / 4) * 100} color="bg-pink-500" />
                            <MetricItem label="Pause Entropy" value={resonance.pause_entropy.toFixed(2)} unit="" percent={resonance.pause_entropy * 100} color="bg-pink-500" />
                        </div>
                        <div className="space-y-4">
                            <MetricItem label="Turn Latency" value={resonance.turn_taking_latency} unit="ms" percent={(resonance.turn_taking_latency / 500) * 100} color="bg-pink-500" />
                            <MetricItem label="Cross-talk" value={(resonance.cross_talk_ratio * 100).toFixed(0)} unit="%" percent={resonance.cross_talk_ratio * 100} color="bg-pink-500" />
                        </div>
                        <div className="space-y-4">
                            <MetricItem label="Spectral Conv" value={(resonance.spectral_convergence * 100).toFixed(0)} unit="%" percent={resonance.spectral_convergence * 100} color="bg-pink-500" />
                            <MetricItem label="Vocal Quality" value={(resonance.vocal_quality_sync * 100).toFixed(0)} unit="%" percent={resonance.vocal_quality_sync * 100} color="bg-pink-500" />
                        </div>
                        <div className="space-y-4">
                            <MetricItem label="Envelope Sync" value={(resonance.amplitude_sync * 100).toFixed(0)} unit="%" percent={resonance.amplitude_sync * 100} color="bg-pink-500" />
                            <MetricItem label="Stress Covar" value={(resonance.stress_covariance * 100).toFixed(0)} unit="%" percent={resonance.stress_covariance * 100} color="bg-pink-500" />
                        </div>
                    </div>
                </div>
            )}

            {/* Meta Footer */}
            <div className="flex flex-wrap justify-center gap-10 pt-8 border-t border-white/5 opacity-50">
                <MetaItem label="OS" value={environment.os_family} />
                <MetaItem label="SCHEMA" value={log.schema_version} />
                <MetaItem label="TIME SLOT" value={context_time.slot} />
                <MetaItem label="SEASON" value={context_time.season} />
            </div>
        </div>
    );
}

function MetricItem({ label, value, unit, percent, color = "bg-cyan-500" }: { label: string, value: string | number, unit: string, percent: number, color?: string }) {
    const safePercent = Math.min(100, Math.max(0, percent));
    return (
        <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                <span className="text-gray-400">{label}</span>
                <span className="text-white">{value}<span className="text-[8px] ml-0.5 text-gray-600">{unit}</span></span>
            </div>
            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${safePercent}%` }} />
            </div>
        </div>
    );
}

function MetaItem({ label, value }: { label: string, value: string }) {
    return (
        <div className="text-center">
            <p className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1">{label}</p>
            <p className="text-xs font-mono text-white/80">{value}</p>
        </div>
    );
}

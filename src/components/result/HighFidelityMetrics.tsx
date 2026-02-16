'use client';

import { VoiceLogV2 } from '@/lib/types';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer
} from 'recharts';

interface Props {
    log: VoiceLogV2;
}

export default function HighFidelityMetrics({ log }: Props) {
    const { features, resonance } = log;

    // Mapping 30 technical metrics to 5 conceptual domains (English)
    const data = [
        {
            subject: 'Presence',
            fullMark: 100,
            value: Math.min(100, (
                (features.f0_mean / 400 * 40) +    // F0 base
                (20 - (features.f0_sd || 0) / 2) + // Stability
                (features.hnr_db || 20)           // Purity proxy
            ) / 0.8)
        },
        {
            subject: 'Clarity',
            fullMark: 100,
            value: Math.min(100, (
                (features.spectral_centroid / 5000 * 40) +
                (features.speech_rate / 8 * 30) +
                (30 - (features.spectral_rolloff / 10000 * 10))
            ) / 0.7)
        },
        {
            subject: 'Resonance',
            fullMark: 100,
            value: Math.min(100, (
                (features.hnr_db / 30 * 50) +
                (1 - features.pause_ratio) * 50
            ))
        },
        {
            subject: 'Dynamics',
            fullMark: 100,
            value: Math.min(100, (
                (features.total_duration / 20 * 30) +
                (features.long_pause_count * 5) +
                (features.jitter_pct * 1000)
            ) * 1.5)
        },
        {
            subject: 'Texture',
            fullMark: 100,
            value: Math.min(100, (
                (features.jitter_pct * 2000) +
                (features.shimmer_db * 40) +
                (50 - (features.f0_sd || 0))
            ) * 1.2)
        }
    ];

    return (
        <div className="space-y-12 animate-fade-in py-12">
            <div className="text-center space-y-2 mb-8">
                <h3 className="text-2xl font-black text-cyan-400 uppercase tracking-[0.2em] italic">Vocal Core Analysis</h3>
                <p className="text-gray-500 text-[10px] uppercase font-bold tracking-widest">High-Fidelity Biometric Extraction</p>
            </div>

            <div className="relative mx-auto w-full max-w-[500px] aspect-square rounded-[3rem] bg-white/5 border border-white/10 p-8 flex items-center justify-center overflow-hidden">
                {/* Background Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-magenta-500/10 pointer-events-none" />

                <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                        <PolarGrid stroke="rgba(255,255,255,0.1)" />
                        <PolarAngleAxis
                            dataKey="subject"
                            tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12, fontWeight: 900 }}
                        />
                        <Radar
                            name="Vocal Signature"
                            dataKey="value"
                            stroke="#22d3ee"
                            fill="#22d3ee"
                            fillOpacity={0.3}
                        />
                    </RadarChart>
                </ResponsiveContainer>
            </div>

            {/* Relational Layer (Couples Only) */}
            {resonance && (
                <div className="glass rounded-[2rem] p-8 md:p-12 border border-pink-500/30 bg-pink-500/5 space-y-10">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                        <span className="text-3xl">💞</span>
                        <div>
                            <h4 className="font-black text-lg text-white uppercase tracking-[0.2em]">Relational Resonance</h4>
                            <p className="text-[10px] text-pink-400 font-bold uppercase tracking-widest">Mimicry & Acoustic Harmony</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        <MetricItem label="Sync" value={(resonance.pitch_overlap * 100).toFixed(0)} unit="%" percent={resonance.pitch_overlap * 100} color="bg-pink-500" />
                        <MetricItem label="Rhythm" value={resonance.pause_entropy.toFixed(2)} unit="" percent={resonance.pause_entropy * 100} color="bg-pink-500" />
                        <MetricItem label="Latency" value={resonance.turn_taking_latency} unit="ms" percent={(resonance.turn_taking_latency / 500) * 100} color="bg-pink-500" />
                        <MetricItem label="Harmony" value={(resonance.spectral_convergence * 100).toFixed(0)} unit="%" percent={resonance.spectral_convergence * 100} color="bg-pink-500" />
                        <MetricItem label="Stress" value={(resonance.stress_covariance * 100).toFixed(0)} unit="%" percent={resonance.stress_covariance * 100} color="bg-pink-500" />
                    </div>
                </div>
            )}
        </div>
    );
}

function MetricItem({ label, value, unit, percent, color = "bg-cyan-500" }: { label: string, value: string | number, unit: string, percent: number, color?: string }) {
    const safePercent = Math.min(100, Math.max(0, percent));
    return (
        <div className="space-y-2 text-center">
            <div className="text-[9px] font-black uppercase text-pink-400/50 mb-1">{label}</div>
            <div className="text-lg font-black text-white">{value}<span className="text-[8px] ml-0.5 text-gray-600">{unit}</span></div>
            <div className="h-1 w-12 mx-auto bg-white/5 rounded-full overflow-hidden">
                <div className={`h-full ${color} transition-all duration-1000`} style={{ width: `${safePercent}%` }} />
            </div>
        </div>
    );
}

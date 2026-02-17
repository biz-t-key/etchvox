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
    log?: VoiceLogV2;
    logA?: VoiceLogV2;
    logB?: VoiceLogV2;
    relationshipType?: string;
}

function calculateDomainMetrics(features: any) {
    return {
        presence: Math.min(100, (
            (features.f0_mean / 400 * 40) +
            (20 - (features.f0_sd || 0) / 2) +
            (features.hnr_db || 20)
        ) / 0.8),
        clarity: Math.min(100, (
            (features.spectral_centroid / 5000 * 40) +
            (features.speech_rate / 8 * 30) +
            (30 - (features.spectral_rolloff / 10000 * 10))
        ) / 0.7),
        resonance: Math.min(100, (
            (features.hnr_db / 30 * 50) +
            (1 - features.pause_ratio) * 50
        )),
        dynamics: Math.min(100, (
            (features.total_duration / 20 * 30) +
            (features.long_pause_count * 5) +
            (features.jitter_pct * 1000)
        ) * 1.5),
        texture: Math.min(100, (
            (features.jitter_pct * 2000) +
            (features.shimmer_db * 40) +
            (50 - (features.f0_sd || 0))
        ) * 1.2)
    };
}

import AcousticNebula from './AcousticNebula';

export default function HighFidelityMetrics({ log, logA, logB, relationshipType = 'romantic' }: Props) {
    const isCouple = !!(logA && logB);
    const mainLog = log || logA;
    if (!mainLog) return null;

    const metricsA = logA ? calculateDomainMetrics(logA.features) : calculateDomainMetrics(mainLog.features);
    const metricsB = logB ? calculateDomainMetrics(logB.features) : null;

    const radarData = [
        { subject: 'Presence', A: metricsA.presence, B: metricsB?.presence },
        { subject: 'Clarity', A: metricsA.clarity, B: metricsB?.clarity },
        { subject: 'Resonance', A: metricsA.resonance, B: metricsB?.resonance },
        { subject: 'Dynamics', A: metricsA.dynamics, B: metricsB?.dynamics },
        { subject: 'Texture', A: metricsA.texture, B: metricsB?.texture },
    ];

    const resonance = log?.resonance || logA?.resonance;

    return (
        <div className="space-y-16 animate-fade-in py-12">
            <div className="flex items-center gap-4 mb-12">
                <div className="h-px flex-grow bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
                <h3 className="text-xl font-black text-cyan-400 uppercase tracking-[0.5em] italic">Metric Analysis</h3>
                <div className="h-px flex-grow bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
            </div>
            <div className="text-center space-y-2 mb-8">
                <p className="text-gray-500 text-[9px] uppercase font-bold tracking-[0.3em]">{isCouple ? 'Biometric Signature Comparison' : 'Biometric Extraction'}</p>
            </div>

            <div className="space-y-8">
                <h4 className="text-xs font-black text-white/40 uppercase tracking-[0.4em] text-center">Neural Resonance Map</h4>
                <AcousticNebula
                    dataA={logA?.features?.biometric_vector || Object.values(metricsA).flatMap(v => Array(6).fill(v / 100))}
                    dataB={logB?.features?.biometric_vector || (metricsB ? Object.values(metricsB).flatMap(v => Array(6).fill(v / 100)) : undefined)}
                    isCouple={isCouple}
                    relationshipType={relationshipType}
                />
            </div>

            <div className="space-y-12 border-t border-white/5 pt-16">

                {/* 1. Comparison Chart (Large) */}
                <div className="relative mx-auto w-full max-w-[500px] aspect-square rounded-[3rem] bg-white/5 border border-white/10 p-8 flex flex-col items-center justify-center overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-magenta-500/10 pointer-events-none" />
                    <div className="absolute bottom-6 text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">Direct Overlay</div>

                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                            <PolarAngleAxis
                                dataKey="subject"
                                tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 900 }}
                            />
                            <Radar
                                name="Partner A"
                                dataKey="A"
                                stroke="#22d3ee"
                                fill="#22d3ee"
                                fillOpacity={0.3}
                            />
                            {isCouple && (
                                <Radar
                                    name="Partner B"
                                    dataKey="B"
                                    stroke="#ec4899"
                                    fill="#ec4899"
                                    fillOpacity={0.3}
                                />
                            )}
                        </RadarChart>
                    </ResponsiveContainer>
                </div>

                {/* 2. Individual Charts (Side by Side) */}
                {isCouple && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Partner A */}
                        <div className="relative aspect-square rounded-[2rem] bg-cyan-500/5 border border-cyan-500/10 p-6 flex flex-col items-center justify-center">
                            <div className="absolute top-4 text-[10px] font-black text-cyan-400/50 uppercase tracking-[0.2em]">Alpha Profile</div>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData.map(d => ({ subject: d.subject, value: d.A }))}>
                                    <PolarGrid stroke="rgba(34,211,238,0.1)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} />
                                    <Radar dataKey="value" stroke="#22d3ee" fill="#22d3ee" fillOpacity={0.4} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Partner B */}
                        <div className="relative aspect-square rounded-[2rem] bg-magenta-500/5 border border-magenta-500/10 p-6 flex flex-col items-center justify-center">
                            <div className="absolute top-4 text-[10px] font-black text-magenta-400/50 uppercase tracking-[0.2em]">Beta Profile</div>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData.map(d => ({ subject: d.subject, value: d.B }))}>
                                    <PolarGrid stroke="rgba(236,72,153,0.1)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 8 }} />
                                    <Radar dataKey="value" stroke="#ec4899" fill="#ec4899" fillOpacity={0.4} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            {/* Relational Layer (Existing) */}
            {resonance && (
                <div className="glass rounded-[2rem] p-8 md:p-12 border border-pink-500/30 bg-pink-500/5 space-y-10">
                    <div className="flex items-center gap-4 border-b border-white/5 pb-6">
                        <span className="text-3xl">💞</span>
                        <div>
                            <h4 className="font-black text-lg text-white uppercase tracking-[0.2em]">Interpersonal Sync</h4>
                            <p className="text-[10px] text-pink-400 font-bold uppercase tracking-widest">Mimicry & Signal Harmony</p>
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

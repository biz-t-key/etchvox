'use client';

import { VoiceResult } from '@/lib/storage';

interface Props {
    history: VoiceResult[];
}

export default function VoiceTimelineGraph({ history }: Props) {
    if (history.length < 2) return null;

    // Sort by date ascending for the graph
    const sortedHistory = [...history].sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    // Normalize data points (0-100 range for SVG)
    const points = sortedHistory.map((item, index) => {
        const x = (index / (sortedHistory.length - 1)) * 100;

        // Pitch mapping (assume 80Hz - 300Hz range)
        const pitchVal = Math.min(100, Math.max(0, ((item.metrics.pitch - 80) / 220) * 100));

        // Stress Index (Schema 1.0.0 uses jitter_pct as proxy)
        const stressVal = item.logV2 ? Math.min(100, item.logV2.features.jitter_pct * 1000) : 50;

        // Identity Gap (Schema 1.0.0 uses dtw_score)
        const gapVal = item.logV2 ? Math.min(100, item.logV2.features.dtw_score * 1000) : 0;

        return { x, pitch: 100 - pitchVal, stress: 100 - stressVal, gap: 100 - gapVal };
    });

    const createPath = (key: 'pitch' | 'stress' | 'gap') => {
        return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p[key]}`).join(' ');
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-end gap-4">
                <div>
                    <h3 className="text-xl font-black text-magenta-500 uppercase tracking-tighter italic">Vocal Identity Timeline</h3>
                    <p className="text-[10px] text-gray-500 uppercase font-bold tracking-[0.2em]">Longitudinal Biometric Tracking · {sortedHistory.length} Samples</p>
                </div>
                <div className="flex gap-4 text-[9px] font-black uppercase tracking-widest">
                    <LegendItem color="bg-cyan-400" label="Pitch/Resonance" />
                    <LegendItem color="bg-magenta-500" label="Stress Index" />
                    <LegendItem color="bg-yellow-500" label="Identity Gap" />
                </div>
            </div>

            <div className="relative glass rounded-2xl p-8 border border-white/5 h-64 w-full">
                {/* Grid Lines */}
                <div className="absolute inset-0 p-8 flex flex-col justify-between pointer-events-none opacity-10">
                    {[1, 2, 3, 4].map(i => <div key={i} className="border-b border-white border-dashed w-full" />)}
                </div>

                <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                    {/* Pitch Line */}
                    <path d={createPath('pitch')} fill="none" stroke="#00f0ff" strokeWidth="2" className="drop-shadow-[0_0_5px_rgba(0,240,255,0.5)]" />
                    {/* Stress Line */}
                    <path d={createPath('stress')} fill="none" stroke="#ff00ff" strokeWidth="1.5" strokeDasharray="2 2" />
                    {/* Gap Line */}
                    <path d={createPath('gap')} fill="none" stroke="#ffd700" strokeWidth="2" opacity="0.6" />

                    {/* Data Points */}
                    {points.map((p, i) => (
                        <g key={i}>
                            <circle cx={p.x} cy={p.pitch} r="1.5" fill="#00f0ff" />
                            <circle cx={p.x} cy={p.stress} r="1" fill="#ff00ff" />
                        </g>
                    ))}
                </svg>

                {/* X-Axis labels */}
                <div className="absolute bottom-2 left-8 right-8 flex justify-between">
                    <span className="text-[8px] text-gray-600 font-mono">
                        {new Date(sortedHistory[0].createdAt).toLocaleDateString()}
                    </span>
                    <span className="text-[8px] text-gray-600 font-mono">
                        {new Date(sortedHistory[sortedHistory.length - 1].createdAt).toLocaleDateString()}
                    </span>
                </div>
            </div>

            <div className="bg-black/40 border border-white/5 p-4 rounded-xl">
                <p className="text-[10px] text-gray-400 leading-relaxed font-mono uppercase tracking-wider">
                    <span className="text-magenta-500 font-black">SYSTEM INSIGHT:</span> Your vocal pitch has {points[points.length - 1].pitch < points[0].pitch ? 'ascended' : 'descended'} by {Math.abs(points[points.length - 1].pitch - points[0].pitch).toFixed(1)}% from baseline. Stress patterns indicate high activity during {sortedHistory[sortedHistory.length - 1].logV2?.context_time.slot || 'detected'} sessions.
                </p>
            </div>
        </div>
    );
}

function LegendItem({ color, label }: { color: string, label: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className={`w-2 h-2 ${color} rounded-full shadow-[0_0_5px_currentColor]`} />
            <span className="text-gray-400">{label}</span>
        </div>
    );
}

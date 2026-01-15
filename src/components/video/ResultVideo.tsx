import { AbsoluteFill, useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { VoiceType, groupColors } from '@/lib/types';
import { getSilhouettePath } from '@/lib/silhouettes';

export interface ResultVideoProps {
    voiceType: VoiceType;
    metrics: {
        pitch: number;
        speed: number;
        vibe: number;
        humanityScore: number;
    };
    audioUrl?: string; // Future implementation
}

export const ResultVideo: React.FC<ResultVideoProps> = ({ voiceType, metrics }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Group Colors
    const colors = groupColors[voiceType.group];
    const isGlitch = voiceType.group === 'special';

    // Animations
    const opacity = interpolate(frame, [0, 30], [0, 1]);
    const scale = spring({ frame, fps, from: 0.8, to: 1 });

    // Background Gradient Animation
    const gradientPos = interpolate(frame, [0, 900], [0, 100]);

    return (
        <AbsoluteFill style={{ backgroundColor: 'black', fontFamily: 'sans-serif' }}>
            {/* Background */}
            <AbsoluteFill
                style={{
                    background: `linear-gradient(135deg, ${colors.primary}20, ${colors.secondary}20)`,
                    backgroundSize: '200% 200%',
                    backgroundPosition: `${gradientPos}% 50%`,
                }}
            />

            {/* Grid Overlay */}
            <AbsoluteFill style={{
                backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)',
                backgroundSize: '40px 40px'
            }} />

            {/* Zone A: Header */}
            <div className="absolute top-10 left-8 right-8 flex justify-between items-center text-white/70 mono text-xs font-bold tracking-widest z-10">
                <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    VOICE GLOW // SYSTEM CHECK
                </div>
                <div>SUBJECT ID: {Math.random().toString(36).substr(2, 6).toUpperCase()}</div>
            </div>

            {/* Main Content Container */}
            <div className="absolute inset-0 flex flex-col p-8 pt-24 pb-20 justify-between">

                {/* Zone B: Identity (Visual Evidence) */}
                <div className="flex flex-col items-center justify-center space-y-6 flex-1">
                    <div
                        className="relative w-64 h-64 rounded-full border-4 shadow-[0_0_50px_currentColor]"
                        style={{
                            borderColor: colors.primary,
                            color: colors.primary,
                            transform: `scale(${scale})`,
                            opacity
                        }}
                    >
                        {/* Silhouette Placeholder */}
                        <div className="absolute inset-4 rounded-full bg-black/50 overflow-hidden flex items-center justify-center">
                            <span className="text-8xl filter blur-sm grayscale opacity-80">{voiceType.icon}</span>
                        </div>

                        {/* Spinning Ring */}
                        <div className="absolute inset-[-10px] rounded-full border border-dashed border-white/30 animate-spin-slow"
                            style={{ animationDuration: '10s' }} />
                    </div>

                    {/* Type Name */}
                    <div className="text-center space-y-2">
                        <div
                            className="text-xs font-bold uppercase tracking-[0.3em]"
                            style={{ color: colors.secondary }}
                        >
                            Analysis Result
                        </div>
                        <h1
                            className="text-5xl font-black uppercase tracking-tighter leading-none"
                            style={{
                                color: 'white',
                                textShadow: `0 0 20px ${colors.primary}`,
                                fontFamily: 'Montserrat, sans-serif'
                            }}
                        >
                            {voiceType.name}
                        </h1>
                        <div className="mono text-gray-400 text-sm">TYPE CODE: {voiceType.code}</div>
                    </div>
                </div>

                {/* Zone C: Diagnosis (The Roast Box) */}
                <div
                    className="relative border-l-4 bg-black/40 p-6 backdrop-blur-sm my-8"
                    style={{
                        borderColor: isGlitch ? 'red' : colors.primary,
                        boxShadow: `0 0 30px ${colors.primary}10`
                    }}
                >
                    <div className="absolute -top-3 left-4 bg-black px-2 text-[10px] text-cyan-400 mono border border-cyan-900">
                        SYSTEM_LOG_OUTPUT
                    </div>
                    <p
                        className="text-lg md:text-xl text-white font-mono leading-relaxed"
                        style={{ fontFamily: 'Courier New, monospace' }}
                    >
                        &gt; "{voiceType.roast}"
                    </p>
                </div>

                {/* Zone D: Metrics */}
                <div className="grid grid-cols-3 gap-4 border-t border-white/10 pt-6">
                    <div className="text-center">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Humanity</div>
                        <div className="text-xl font-bold text-white">{metrics.humanityScore}%</div>
                    </div>
                    <div className="text-center border-l border-white/10">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Pitch</div>
                        <div className="text-xl font-bold text-white">{Math.round(metrics.pitch)} Hz</div>
                    </div>
                    <div className="text-center border-l border-white/10">
                        <div className="text-[10px] text-gray-500 uppercase tracking-wider mb-1">Vibe</div>
                        <div className="text-xl font-bold text-white" style={{ color: colors.secondary }}>
                            {colors.vibe.split(',')[0]}
                        </div>
                    </div>
                </div>
            </div>

            {/* Zone E: Footer */}
            <div className="absolute bottom-6 left-0 right-0 text-center">
                <div className="text-[10px] text-gray-600 uppercase tracking-[0.2em] mb-1">Generated by EtchVox</div>
                <div className="text-[8px] text-gray-700">Developed by a husband who was told he sounds like a robot.</div>
            </div>
        </AbsoluteFill>
    );
};

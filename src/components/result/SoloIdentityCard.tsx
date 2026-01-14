'use client';

import { MBTIType, mbtiTypes, mbtiGroups } from '@/lib/mbti';
import { voiceTypes, TypeCode } from '@/lib/types';
import { getSoloIdentity } from '@/lib/soloIdentityMatrix';

interface SoloIdentityCardProps {
    mbti: MBTIType;
    voiceTypeCode: TypeCode;
    userName?: string;
}

export default function SoloIdentityCard({ mbti, voiceTypeCode, userName }: SoloIdentityCardProps) {
    const mbtiInfo = mbtiTypes[mbti];
    const voiceInfo = voiceTypes[voiceTypeCode];
    const identity = getSoloIdentity(mbti, voiceTypeCode);
    const groupInfo = mbtiGroups[mbtiInfo.group];

    if (!identity) return null;

    return (
        <div className="relative w-full max-w-xl mx-auto aspect-[1.91/1] overflow-hidden rounded-3xl border border-white/20 shadow-2xl flex">

            {/* LEFT: MBTI Section (Perceived Self) */}
            <div
                className="w-1/2 h-full flex flex-col items-center justify-center p-6 text-white relative"
                style={{ backgroundColor: groupInfo.color }}
            >
                <div className="absolute top-4 left-4 text-[10px] uppercase tracking-[0.2em] opacity-60 font-black">
                    Self Perception
                </div>
                <div className="text-6xl md:text-8xl font-black tracking-tighter mb-1 drop-shadow-lg">
                    {mbti}
                </div>
                <div className="text-[10px] md:text-sm font-bold uppercase tracking-[0.1em] opacity-80 text-center px-4">
                    {mbtiInfo.nickname}
                </div>

                {/* Decorative mask element */}
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/10 rounded-full blur-3xl" />
            </div>

            {/* RIGHT: VoiceGlow Section (Actual Signature) */}
            <div className="w-1/2 h-full bg-[#030303] flex flex-col items-center justify-center p-6 text-white relative border-l border-white/10">
                <div className="absolute top-4 right-4 text-[10px] opacity-60 font-black text-right tracking-[0.2em] uppercase">
                    Bio-Data Voice
                </div>

                {/* Glowing Waveform */}
                <div className="flex items-end justify-center gap-1 h-16 mb-6 px-2">
                    {[...Array(14)].map((_, i) => (
                        <div
                            key={i}
                            className="w-1 bg-cyan-400 rounded-full animate-wave"
                            style={{
                                height: `${20 + (i % 5) * 15 + Math.random() * 20}%`,
                                animationDelay: `${i * 0.08}s`,
                                boxShadow: '0 0 12px rgba(34, 211, 238, 0.5)'
                            }}
                        />
                    ))}
                </div>

                <div className="text-4xl md:text-5xl font-black uppercase text-center tracking-tighter mb-1 text-cyan-400 drop-shadow-[0_0_15px_rgba(34,211,238,0.3)]">
                    {voiceInfo.name}
                </div>
                <div className="text-[9px] font-mono text-gray-600 uppercase tracking-[0.3em]">
                    Sig_ID: EV_{voiceTypeCode}
                </div>

                {/* Decorative glow */}
                <div className="absolute -top-10 -right-10 w-40 h-40 bg-cyan-500/10 rounded-full blur-3xl opacity-50" />
            </div>

            {/* CENTER: Solo Identity Badge & Roast */}
            <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
                <div className="bg-black/85 backdrop-blur-2xl border border-white/30 rounded-2xl px-8 py-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] transform -rotate-1 max-w-[85%] text-center pointer-events-auto">
                    <div className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.4em] mb-2 opacity-80">
                        Duo Identity Result
                    </div>
                    <div className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter mb-4 leading-none">
                        "{identity.brandName}"
                    </div>

                    <div className="h-[2px] w-12 bg-gradient-to-r from-transparent via-white/40 to-transparent mx-auto mb-4" />

                    <div className="text-[11px] md:text-xs text-gray-300 font-medium italic leading-relaxed max-w-sm mx-auto mb-2 opacity-90">
                        {identity.roast || "Bio-analysis complete. Persona mismatch detected."}
                    </div>

                    <div className="text-[8px] text-gray-500 font-mono tracking-widest mt-4 uppercase">
                        EtchVox // AI_Persona_Audit
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between z-10">
                <div className="text-[10px] font-bold tracking-tighter text-white opacity-40 uppercase">
                    EtchVox
                </div>
                <div className="text-[10px] font-bold tracking-tighter text-white opacity-40 uppercase">
                    Verification: {new Date().toLocaleDateString()}
                </div>
            </div>

            {/* Film grain / Noise overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
        </div>
    );
}

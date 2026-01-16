'use client';

import { useRef, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';

import { MBTIType, mbtiTypes, mbtiGroups } from '@/lib/mbti';
import { voiceTypes, TypeCode } from '@/lib/types';
import { getSoloIdentity } from '@/lib/soloIdentityMatrix';

interface SoloIdentityCardProps {
    mbti: MBTIType;
    voiceTypeCode: TypeCode;
    userName?: string;
}

export default function SoloIdentityCard({ mbti, voiceTypeCode, userName }: SoloIdentityCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const mbtiInfo = mbtiTypes[mbti];
    const voiceInfo = voiceTypes[voiceTypeCode];

    // Attempt to get identity, provide fallback if null
    const rawIdentity = getSoloIdentity(mbti, voiceTypeCode);
    const displayIdentity = rawIdentity || {
        brandName: "THE ENIGMA",
        roast: "Your combination is so rare, even our AI is trying to figure you out. You are the anomaly in the system.",
    };

    const groupInfo = mbtiGroups[mbtiInfo.group];

    useEffect(() => {
        if (!mbtiInfo || !voiceInfo || !cardRef.current) return;

        // Reset image on prop change
        setImageUrl(null);

        // Wait a moment for fonts/styles to settle
        const timer = setTimeout(async () => {
            try {
                if (cardRef.current) {
                    const canvas = await html2canvas(cardRef.current, {
                        backgroundColor: null,
                        scale: 2, // Retina quality
                        useCORS: true,
                        logging: false
                    });
                    const imgData = canvas.toDataURL('image/png');
                    setImageUrl(imgData);
                }
            } catch (err) {
                console.error("Image generation failed:", err);
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [mbti, voiceTypeCode, mbtiInfo, voiceInfo]);

    if (!mbtiInfo || !voiceInfo) return null;

    return (
        <div
            ref={cardRef}
            className="relative mx-auto w-[88vw] h-[140vw] max-w-[340px] max-h-[580px] sm:w-[350px] sm:h-[580px] md:w-[400px] md:h-[650px] lg:w-[450px] lg:h-[700px] bg-gradient-to-br from-gray-900 to-black rounded-3xl shadow-2xl overflow-hidden flex flex-col justify-between p-4 sm:p-6 border border-white/10 font-sans group"
        >
            {/* HEADER */}
            <div className="relative z-10 flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-cyan-500 rounded-full flex items-center justify-center text-xs sm:text-sm font-black text-black">
                        EV
                    </div>
                    <div className="text-sm sm:text-base font-black uppercase text-white tracking-wider">
                        EtchVox
                    </div>
                </div>
                <div className="text-[8px] sm:text-[10px] font-mono text-gray-400 uppercase tracking-widest">
                    USER ID: {userName?.substring(0, 8) || 'GUEST'}
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="relative flex-grow flex flex-col items-center justify-center text-center z-10 space-y-8">

                {/* MBTI SECTION - GROUP COLOR */}
                <div className="relative w-full">
                    <div
                        className="absolute -top-2 left-2 text-[8px] font-bold uppercase tracking-[0.3em] opacity-70"
                        style={{ color: mbtiInfo.color }}
                    >
                        Self Perception
                    </div>
                    <div className="space-y-2 mt-4">
                        {/* MBTI Code - Large with Group Color */}
                        <div
                            className="text-5xl sm:text-6xl md:text-7xl font-black uppercase tracking-tighter leading-none"
                            style={{
                                color: mbtiInfo.color,
                                textShadow: `0 0 40px ${mbtiInfo.color}40`
                            }}
                        >
                            {mbti}
                        </div>
                        {/* Nickname - Below */}
                        <div
                            className="text-base sm:text-lg md:text-xl font-bold uppercase tracking-wider"
                            style={{ color: mbtiInfo.color }}
                        >
                            {mbtiInfo.nickname}
                        </div>
                        <div
                            className="text-[8px] md:text-[9px] font-mono uppercase tracking-[0.2em] opacity-50"
                            style={{ color: mbtiInfo.color }}
                        >
                            SIG: MB_{mbti}
                        </div>
                    </div>
                </div>

                {/* Separator - Gradient from MBTI color to Cyan */}
                <div
                    className="w-32 h-0.5"
                    style={{
                        background: `linear-gradient(to right, ${mbtiInfo.color}, #06b6d4)`
                    }}
                />

                {/* VOICE TYPE SECTION - CYAN */}
                <div className="relative w-full">
                    <div className="absolute -top-2 right-2 text-[8px] text-cyan-400/70 font-bold uppercase tracking-[0.3em]">
                        Bio-Data
                    </div>
                    <div className="space-y-2 mt-4">
                        {/* Glowing Waveform - Compact */}
                        <div className="flex items-end justify-center gap-0.5 h-6 md:h-8 mb-2 opacity-60">
                            {[...Array(8)].map((_, i) => (
                                <div
                                    key={i}
                                    className="w-0.5 bg-cyan-400 rounded-full animate-wave"
                                    style={{
                                        height: `${30 + (i % 4) * 20}%`,
                                        animationDelay: `${i * 0.1}s`,
                                        boxShadow: '0 0 8px rgba(34, 211, 238, 0.4)'
                                    }}
                                />
                            ))}
                        </div>
                        {/* Voice Type Code - Large */}
                        <div className="text-5xl sm:text-6xl md:text-7xl font-black uppercase text-cyan-400 tracking-tighter leading-none drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                            {voiceTypeCode}
                        </div>
                        {/* Voice Type Name - Below */}
                        <div className="text-base sm:text-lg md:text-xl font-bold text-cyan-300 uppercase tracking-wider">
                            {voiceInfo.name}
                        </div>
                        <div className="text-[8px] md:text-[9px] font-mono text-cyan-500/50 uppercase tracking-[0.2em]">
                            SIG: EV_{voiceTypeCode}
                        </div>
                    </div>
                </div>

                {/* Decorative glow */}
                <div className="absolute -top-10 -right-10 w-32 h-32 md:w-40 md:h-40 bg-cyan-500/10 rounded-full blur-3xl opacity-50" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 md:w-40 md:h-40 bg-pink-500/10 rounded-full blur-3xl opacity-50" />
            </div>

            {/* RESULT OVERLAY (Bottom Positioned) */}
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6 pointer-events-none flex items-end justify-center h-full">
                <div className="bg-black/60 backdrop-blur-md border-[0.5px] border-white/20 rounded-2xl p-4 sm:p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.5)] w-full max-w-[95%] text-center pointer-events-auto mt-auto mb-16">
                    <div className="flex items-center justify-center gap-2 mb-2 opacity-70">
                        <div className="text-[8px] md:text-[10px] text-cyan-400 font-bold uppercase tracking-[0.3em]">
                            Duo Identity Result
                        </div>
                    </div>

                    <div className="text-2xl sm:text-3xl md:text-5xl font-black text-white uppercase italic tracking-tighter mb-3 leading-none drop-shadow-md">
                        "{displayIdentity.brandName}"
                    </div>

                    <div className="text-xs sm:text-sm md:text-base text-gray-200 font-medium italic leading-relaxed max-w-lg mx-auto line-clamp-3 md:line-clamp-none px-2 opacity-90">
                        {displayIdentity.roast || "Bio-analysis complete. Persona mismatch detected."}
                    </div>
                </div>
            </div>

            {/* FOOTER */}
            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-10 pointer-events-none">
                <div className="text-[8px] sm:text-[9px] font-mono text-gray-500 uppercase tracking-wider">
                    Verification: {new Date().toLocaleDateString('en-CA')}
                </div>
                <div className="text-[8px] sm:text-[9px] font-mono text-gray-500 uppercase tracking-wider">
                    etchvox.com
                </div>
            </div>

            {/* OVERLAY IMAGE FOR SAVING */}
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt="Identity Card"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-50 hover:opacity-10 transition-opacity duration-300"
                    title="Long press or Right Click to Save"
                />
            )}

            {/* Loading / Saving Hint */}
            {!imageUrl && (
                <div className="absolute top-2 right-2 z-40">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                </div>
            )}

            {/* Film grain / Noise overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
        </div>
    );
}

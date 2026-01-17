'use client';

import { useRef, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';

import { voiceTypes, TypeCode } from '@/lib/types';
import { getDuoIdentity } from '@/lib/duoIdentityMatrix';
import { AnalysisMetrics } from '@/lib/types';

const NOISE_DATA_URL = "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E";

interface DuoIdentityCardProps {
    userA: { name: string; job: string; metrics: AnalysisMetrics; typeCode: TypeCode };
    userB: { name: string; job: string; metrics: AnalysisMetrics; typeCode: TypeCode };
    resultId: string;
}

export default function DuoIdentityCard({ userA, userB, resultId }: DuoIdentityCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const duoIdentity = getDuoIdentity(userA.typeCode, userB.typeCode);
    const voiceA = voiceTypes[userA.typeCode] || voiceTypes['HFCC']; // Fallback
    const voiceB = voiceTypes[userB.typeCode] || voiceTypes['LSCD']; // Fallback

    useEffect(() => {
        if (!cardRef.current) return;

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
                        logging: false,
                        allowTaint: true
                    });
                    const imgData = canvas.toDataURL('image/png');
                    setImageUrl(imgData);
                }
            } catch (err) {
                console.error("Duo Image generation failed:", err);
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [userA.typeCode, userB.typeCode, resultId]);

    return (
        <div className="relative mx-auto w-full max-w-[450px]">
            <div
                ref={cardRef}
                className="relative w-full aspect-[4/5] bg-[#050505] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col justify-between p-8 border border-white/10 font-sans"
            >
                {/* BACKGROUND DECORATION */}
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-pink-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

                {/* NOISE OVERLAY */}
                <div
                    className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
                    style={{ backgroundImage: `url("${NOISE_DATA_URL}")`, backgroundRepeat: 'repeat' }}
                />

                {/* HEADER */}
                <div className="relative z-10 flex items-center justify-between mb-8">
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">
                        Duo Matrix Analysis
                    </div>
                    <div className="text-[10px] font-mono text-white/30 tracking-tighter">
                        ID: {resultId.substring(0, 8).toUpperCase()}
                    </div>
                </div>

                {/* TWO USERS SECTION */}
                <div className="relative z-10 flex justify-between items-center px-4 mb-4">
                    {/* User A */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500/20 to-black border border-pink-500/30 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(236,72,153,0.2)]">
                            {voiceA.icon}
                        </div>
                        <div className="text-center">
                            <div className="text-[10px] font-black text-pink-400 uppercase tracking-widest">{userA.name}</div>
                            <div className="text-[8px] text-white/40 uppercase font-bold tracking-tighter">{userA.typeCode}</div>
                        </div>
                    </div>

                    {/* VS / PLUS */}
                    <div className="h-0.5 w-12 bg-gradient-to-r from-pink-500/50 to-cyan-500/50 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black border border-white/10 text-[10px] p-1 rounded-full font-black text-white/80">
                            +
                        </div>
                    </div>

                    {/* User B */}
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-black border border-cyan-500/30 flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(6,182,212,0.2)]">
                            {voiceB.icon}
                        </div>
                        <div className="text-center">
                            <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest">{userB.name}</div>
                            <div className="text-[8px] text-white/40 uppercase font-bold tracking-tighter">{userB.typeCode}</div>
                        </div>
                    </div>
                </div>

                {/* MAIN LABEL / BRAND NAME */}
                <div className="relative z-10 flex-grow flex flex-col items-center justify-center py-6">
                    <div className="text-[10px] text-white/40 uppercase tracking-[0.3em] mb-4">The Pairing</div>
                    <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40 uppercase italic tracking-tighter text-center leading-[0.9] mb-4 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
                        "{duoIdentity.label}"
                    </div>
                    <div className="h-1 w-24 bg-gradient-to-r from-transparent via-pink-500 to-transparent opacity-50" />
                </div>

                {/* ROAST BOX */}
                <div className="relative z-10 bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/5 shadow-inner">
                    <div className="text-[10px] font-bold text-pink-400 uppercase tracking-[0.2em] mb-3 text-center opacity-80">
                        Cynical Analysis
                    </div>
                    <p className="text-sm md:text-base text-gray-200 leading-relaxed text-center font-medium italic">
                        {duoIdentity.roast}
                    </p>
                </div>

                {/* FOOTER */}
                <div className="relative z-10 mt-8 flex justify-between items-center opacity-30">
                    <div className="text-[9px] font-black tracking-widest uppercase">EtchVox Intelligence</div>
                    <div className="text-[9px] font-mono">v1.0.256</div>
                </div>

                {/* FILM GRAIN */}
                <div className="absolute inset-0 pointer-events-none opacity-20 mix-blend-overlay bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat" />
            </div>

            {/* ACTION UI (Outside Ref) */}
            <div className="mt-6 flex flex-col items-center gap-4">
                <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest border border-white/5 px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-pink-500 animate-pulse" />
                    Bio-Sync Complete
                </div>

                {imageUrl && (
                    <button
                        onClick={() => {
                            const link = document.createElement('a');
                            link.download = `etchvox-duo-${resultId}.png`;
                            link.href = imageUrl;
                            link.click();
                        }}
                        className="group relative flex items-center gap-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-cyan-500/20 translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
                        <span className="relative">📥 Download Duo Identity</span>
                    </button>
                )}

                {/* SAVABLE IMAGE OVERLAY */}
                {imageUrl && (
                    <img
                        src={imageUrl}
                        alt="Duo Identity Card"
                        className="absolute inset-0 w-full h-[calc(100%-80px)] opacity-0 cursor-pointer z-50 pointer-events-auto"
                        title="Save Image"
                    />
                )}
            </div>
        </div>
    );
}

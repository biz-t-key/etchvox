'use client';

import { useRef, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';

import { voiceTypes, TypeCode } from '@/lib/types';
import { getDuoIdentity } from '@/lib/duoIdentityMatrix';
import { AnalysisMetrics } from '@/lib/types';

// Inlined noise SVG to avoid CORS issues with html2canvas
const NOISE_DATA_URL = "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E";

interface DuoIdentityCardProps {
    userA: { name: string; job: string; metrics: AnalysisMetrics; typeCode: TypeCode };
    userB: { name: string; job: string; metrics: AnalysisMetrics; typeCode: TypeCode };
    resultId: string;
}

export default function DuoIdentityCard({ userA, userB, resultId }: DuoIdentityCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);

    const duoIdentity = getDuoIdentity(userA.typeCode, userB.typeCode);
    const voiceA = voiceTypes[userA.typeCode] || voiceTypes['HFCC']; // Fallback
    const voiceB = voiceTypes[userB.typeCode] || voiceTypes['LSCD']; // Fallback

    useEffect(() => {
        if (!cardRef.current) return;

        // Reset image on prop change
        setImageUrl(null);
        setGenerating(true);

        // Wait a moment for fonts/styles to settle
        const timer = setTimeout(async () => {
            try {
                if (cardRef.current) {
                    const canvas = await html2canvas(cardRef.current, {
                        backgroundColor: '#050505',
                        scale: 2,
                        useCORS: true,
                        logging: false,
                        allowTaint: false,
                    });
                    const imgData = canvas.toDataURL('image/png');
                    setImageUrl(imgData);
                }
            } catch (err) {
                console.error("Duo Identity Card capture failed:", err);
            } finally {
                setGenerating(false);
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [userA.typeCode, userB.typeCode, resultId]);

    return (
        <div className="relative mx-auto w-full max-w-[450px]">
            {/* 1. VISUAL CARD (The one being captured) */}
            <div
                ref={cardRef}
                className="relative w-full aspect-[4/5] bg-[#050505] rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col justify-between p-12 border border-white/10 font-sans"
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
                <div className="relative z-10 flex items-center justify-between">
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">
                        Duo Matrix Analysis
                    </div>
                    <div className="text-[10px] font-mono text-white/30 tracking-widest">
                        #{resultId.substring(0, 8).toUpperCase()}
                    </div>
                </div>

                {/* TWO USERS SECTION */}
                <div className="relative z-10 flex justify-between items-center px-2">
                    {/* User A */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500/20 to-black border border-pink-500/30 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(236,72,153,0.3)]">
                            {voiceA.icon}
                        </div>
                        <div className="text-center">
                            <div className="text-[11px] font-black text-pink-400 uppercase tracking-widest max-w-[100px] truncate">{userA.name}</div>
                            <div className="text-[9px] text-white/40 uppercase font-black tracking-widest">{userA.typeCode}</div>
                        </div>
                    </div>

                    {/* VS / PLUS */}
                    <div className="flex flex-col items-center gap-1">
                        <div className="h-px w-8 bg-gradient-to-r from-pink-500/50 to-cyan-500/50" />
                        <div className="text-[10px] font-black text-white/30 italic">BOND</div>
                        <div className="h-px w-8 bg-gradient-to-r from-pink-500/50 to-cyan-500/50" />
                    </div>

                    {/* User B */}
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-black border border-cyan-500/30 flex items-center justify-center text-4xl shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                            {voiceB.icon}
                        </div>
                        <div className="text-center">
                            <div className="text-[11px] font-black text-cyan-400 uppercase tracking-widest max-w-[100px] truncate">{userB.name}</div>
                            <div className="text-[9px] text-white/40 uppercase font-black tracking-widest">{userB.typeCode}</div>
                        </div>
                    </div>
                </div>

                {/* MAIN LABEL / BRAND NAME */}
                <div className="relative z-10 py-4 text-center">
                    <div className="text-[10px] text-white/30 uppercase tracking-[0.5em] mb-3">Sync Result</div>
                    <div className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-[0.9] mb-4 drop-shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                        "{duoIdentity.label}"
                    </div>
                    <div className="h-0.5 w-16 mx-auto bg-gradient-to-r from-transparent via-white/40 to-transparent" />
                </div>

                {/* ROAST BOX */}
                <div className="relative z-10 bg-white/5 backdrop-blur-3xl rounded-[1.5rem] p-6 border border-white/10 shadow-2xl">
                    <div className="text-[9px] font-black text-pink-400/60 uppercase tracking-[0.3em] mb-3 text-center">
                        Cynical Resonance
                    </div>
                    <p className="text-xs md:text-sm text-gray-200 leading-relaxed text-center font-medium italic opacity-90 px-2 line-clamp-4">
                        {duoIdentity.roast}
                    </p>
                </div>

                {/* FOOTER */}
                <div className="relative z-10 flex justify-between items-center opacity-30 mt-4 px-2">
                    <div className="text-[9px] font-black tracking-widest uppercase">Bio-Auth Matrix</div>
                    <div className="text-[9px] font-mono">etchvox.com</div>
                </div>
            </div>

            {/* 2. INTERACTION AREA */}
            <div className="mt-8 flex flex-col items-center gap-6">

                {/* STATUS INDICATOR */}
                <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest border border-white/5 px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm">
                    <span className={`w-1.5 h-1.5 rounded-full ${imageUrl ? 'bg-pink-500' : generating ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
                    {generating ? 'Capturing Duo Identity...' : imageUrl ? 'Matrix Synced' : 'Capture Failed'}
                </div>

                {/* DOWNLOAD BUTTON */}
                <button
                    onClick={() => {
                        if (!imageUrl) return;
                        const link = document.createElement('a');
                        link.download = `etchvox-duo-card-${resultId}.png`;
                        link.href = imageUrl;
                        link.click();
                    }}
                    disabled={!imageUrl}
                    className="group relative w-full flex items-center justify-center gap-3 bg-white text-black px-8 py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                >
                    <span className="relative z-10">
                        {imageUrl ? '📥 Download Duo Identity Card' : generating ? 'Generating Image...' : 'Retry Capture'}
                    </span>
                    {imageUrl && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-black/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                    )}
                </button>

                {/* SCREENSHOT HINT */}
                <div className="flex items-center gap-2 text-[10px] text-red-500/70 uppercase tracking-widest font-black animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Screenshot to Save
                </div>
            </div>

            {/* 3. INVISIBLE OVERLAY FOR MOBILE SAVE */}
            {imageUrl && (
                <img
                    src={imageUrl}
                    alt="Duo Identity Card Overlay"
                    className="absolute inset-0 w-full h-[calc(100%-140px)] opacity-0 cursor-pointer z-50 select-none touch-none"
                />
            )}
        </div>
    );
}

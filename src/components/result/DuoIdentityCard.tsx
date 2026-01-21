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
                        onclone: (clonedDoc) => {
                            const blurs = clonedDoc.querySelectorAll('*');
                            blurs.forEach((el: any) => {
                                if (el.style) {
                                    el.style.backdropFilter = 'none';
                                    el.style.webkitBackdropFilter = 'none';
                                }
                            });
                        }
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
                className="relative w-full aspect-[4/5] bg-[#050505] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col p-10 border border-white/10 font-sans"
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
                <div className="relative z-10 flex items-center justify-between px-2">
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">
                        Duo Matrix Analysis
                    </div>
                    <div className="text-[10px] font-mono text-white/30 tracking-widest">
                        #{resultId.substring(0, 8).toUpperCase()}
                    </div>
                </div>

                {/* TWO USERS SECTION - SPLIT UI */}
                <div className="relative z-10 flex flex-col gap-6 mt-4">
                    <div className="flex justify-between items-start gap-4">
                        {/* User A */}
                        <div className="flex-1 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-3xl mb-3">
                                {voiceA.icon}
                            </div>
                            <div className="text-[10px] font-black text-pink-400 uppercase tracking-widest text-center truncate w-full mb-1">{userA.name}</div>
                            <div className="text-[14px] text-white font-black uppercase tracking-tighter">{userA.typeCode}</div>
                        </div>

                        {/* SYNC CENTER */}
                        <div className="flex flex-col items-center justify-center pt-2">
                            <div className="relative w-16 h-16 flex items-center justify-center">
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                                    <circle cx="32" cy="32" r="28" fill="none" stroke="url(#syncGradient)" strokeWidth="4" strokeDasharray="175" strokeDashoffset={175 - (175 * userA.metrics.humanityScore / 100)} strokeLinecap="round" />
                                    <defs>
                                        <linearGradient id="syncGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#EC4899" />
                                            <stop offset="100%" stopColor="#06B2D2" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="text-[14px] font-black text-white italic">{userA.metrics.humanityScore}%</div>
                            </div>
                            <div className="text-[8px] font-black text-white/30 uppercase tracking-[0.2em] mt-2">Sync</div>
                        </div>

                        {/* User B */}
                        <div className="flex-1 flex flex-col items-center">
                            <div className="w-16 h-16 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-3xl mb-3">
                                {voiceB.icon}
                            </div>
                            <div className="text-[10px] font-black text-cyan-400 uppercase tracking-widest text-center truncate w-full mb-1">{userB.name}</div>
                            <div className="text-[14px] text-white font-black uppercase tracking-tighter">{userB.typeCode}</div>
                        </div>
                    </div>

                    {/* COMPARISON CHART */}
                    <div className="bg-white/5 rounded-2xl p-5 border border-white/5 space-y-4">
                        <div className="space-y-2">
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/30 px-1">
                                <span>Frequency</span>
                                <span>A vs B</span>
                                <span>Tempo</span>
                            </div>
                            {/* Pitch Bar */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden flex justify-end">
                                    <div className="h-full bg-pink-500/50" style={{ width: `${Math.min(userA.metrics.pitch / 400 * 100, 100)}%` }} />
                                </div>
                                <div className="text-[8px] font-mono text-white/40">Hz</div>
                                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500/50" style={{ width: `${Math.min(userB.metrics.pitch / 400 * 100, 100)}%` }} />
                                </div>
                            </div>
                            {/* Speed Bar */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden flex justify-end">
                                    <div className="h-full bg-pink-500/30" style={{ width: `${userA.metrics.speed * 100}%` }} />
                                </div>
                                <div className="text-[8px] font-mono text-white/40">BPM</div>
                                <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-500/30" style={{ width: `${userB.metrics.speed * 100}%` }} />
                                </div>
                            </div>
                        </div>

                        {/* DOMINANCE SCALE */}
                        <div className="relative pt-2">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-[8px] font-black text-pink-400/50 uppercase tracking-widest">Active</span>
                                <span className="text-[8px] font-black text-white/20 uppercase tracking-widest italic">Dominance Scale</span>
                                <span className="text-[8px] font-black text-cyan-400/50 uppercase tracking-widest">Passive</span>
                            </div>
                            <div className="h-1 w-full bg-white/10 rounded-full relative">
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-black rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)] transition-all duration-1000"
                                    style={{ left: `calc(${50 + ((userA.metrics.pitch - userB.metrics.pitch) / 10)}% - 8px)` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* DYNAMIC LABEL */}
                    <div className="text-center py-2">
                        <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.5em] mb-2 font-mono">Resonance ID</div>
                        <div className="text-3xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">
                            "{duoIdentity.label}"
                        </div>
                    </div>
                </div>

                {/* ROAST BOX - COMPACT */}
                <div className="bg-black/40 backdrop-blur-3xl rounded-[1.5rem] p-5 border border-white/10 mt-auto">
                    <p className="text-[10px] text-gray-400 leading-relaxed text-center font-medium italic opacity-90 px-2 line-clamp-3">
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

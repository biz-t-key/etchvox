'use client';

import { useRef, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';

import { voiceTypes, TypeCode } from '@/lib/types';
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
    const [identityData, setIdentityData] = useState<{ label: string, roast: string } | null>(null);

    const voiceA = voiceTypes[userA.typeCode] || voiceTypes['HFCC'];
    const voiceB = voiceTypes[userB.typeCode] || voiceTypes['LSCD'];

    // ✅ STEP 1: Fetch Duo Roast from API
    useEffect(() => {
        async function fetchDuoIdentity() {
            try {
                const res = await fetch('/api/identity/duo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ typeCodeA: userA.typeCode, typeCodeB: userB.typeCode })
                });
                const data = await res.json();
                setIdentityData(data);
            } catch (err) {
                console.error("Failed to fetch duo roast:", err);
                setIdentityData({ label: "ASYMMETRIC SYNC", roast: "Analyzing the complex interference pattern..." });
            }
        }
        fetchDuoIdentity();
    }, [userA.typeCode, userB.typeCode]);

    // ✅ STEP 2: Capture Engine
    useEffect(() => {
        if (!cardRef.current || !identityData) return;

        // Reset image on prop change
        setImageUrl(null);
        setGenerating(true);

        // Wait a moment for fonts/styles to settle
        const timer = setTimeout(async () => {
            try {
                if (cardRef.current) {
                    const canvas = await html2canvas(cardRef.current, {
                        backgroundColor: '#050505',
                        scale: 3, // High quality
                        useCORS: true,
                        logging: false,
                        allowTaint: false,
                        width: cardRef.current.offsetWidth,
                        height: cardRef.current.offsetHeight,
                        scrollX: -window.scrollX,
                        scrollY: -window.scrollY,
                        windowWidth: document.documentElement.offsetWidth,
                        windowHeight: document.documentElement.offsetHeight,
                        onclone: (clonedDoc) => {
                            const clonedCard = clonedDoc.querySelector('[data-capture-target="duo-card"]') as HTMLElement;
                            if (clonedCard) {
                                // 1. Fix potential oklch/oklab color leakage from Tailwind 4
                                // html2canvas crashes on these modern color functions.
                                try {
                                    for (let i = 0; i < clonedDoc.styleSheets.length; i++) {
                                        const sheet = clonedDoc.styleSheets[i] as any;
                                        try {
                                            const rules = sheet.cssRules || sheet.rules;
                                            if (rules) {
                                                for (let j = rules.length - 1; j >= 0; j--) {
                                                    const rule = rules[j];
                                                    if (rule.cssText.includes('oklch') || rule.cssText.includes('oklab') || rule.cssText.includes('color-mix')) {
                                                        sheet.deleteRule(j);
                                                    }
                                                }
                                            }
                                        } catch (e) {
                                            // Ignore cross-origin stylesheet errors
                                        }
                                    }
                                } catch (e) {
                                    console.warn("Failed to sanitize stylesheets for capture:", e);
                                }

                                // 2. Remove backdrop-filter
                                const allElements = clonedDoc.querySelectorAll('*');
                                allElements.forEach((el: any) => {
                                    if (el.style) {
                                        (el.style as any).backdropFilter = 'none';
                                        (el.style as any).webkitBackdropFilter = 'none';
                                    }
                                });
                            }
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
        <div className="relative mx-auto w-full max-w-[450px] md:max-w-[550px]">
            {/* 1. VISUAL CARD (The one being captured) */}
            <div
                ref={cardRef}
                data-capture-target="duo-card"
                className="relative w-full aspect-[4/5] rounded-[3rem] shadow-2xl overflow-hidden flex flex-col p-12 md:p-16 border border-white/10 font-sans"
                style={{
                    backgroundColor: '#050505',
                    color: '#ffffff',
                    position: 'relative',
                    width: '100%',
                    maxWidth: '550px',
                    margin: '0 auto'
                }}
            >
                {/* SAFE BACKGROUND FOR CAPTURE */}
                <div className="absolute inset-0 z-0" style={{ backgroundColor: '#050505' }} />

                {/* BACKGROUND DECORATION - Using explicit RGBA colors for html2canvas */}
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full pointer-events-none z-0"
                    style={{ background: 'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, rgba(236, 72, 153, 0) 70%)' }} />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full pointer-events-none z-0"
                    style={{ background: 'radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0) 70%)' }} />


                {/* NOISE OVERLAY */}
                <div
                    className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay z-0"
                    style={{ backgroundImage: `url("${NOISE_DATA_URL}")`, backgroundRepeat: 'repeat', backgroundSize: '200px' }}
                />

                {/* HEADER - Increased horizontal padding for safe zone (Fixed clipping) */}
                <div className="relative z-10 flex items-center justify-between px-10 pt-8">
                    <div className="text-[10px] md:text-[12px] font-black text-white/40 uppercase tracking-[0.4em]">
                        Duo Matrix Analysis
                    </div>
                    <div className="text-[10px] md:text-[12px] font-mono text-white/30 tracking-widest">
                        #{resultId.substring(0, 8).toUpperCase()}
                    </div>
                </div>

                {/* TWO USERS SECTION - SPLIT UI */}
                <div className="relative z-10 flex flex-col gap-8 md:gap-12 mt-8 md:mt-12 px-6">
                    <div className="flex justify-between items-start gap-4">
                        {/* User A */}
                        <div className="flex-1 flex flex-col items-center">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border flex items-center justify-center text-3xl md:text-4xl mb-3"
                                style={{ backgroundColor: 'rgba(236, 72, 153, 0.1)', borderColor: 'rgba(236, 72, 153, 0.3)' }}>
                                {voiceA.icon}
                            </div>
                            <div className="text-[10px] md:text-[12px] font-black text-pink-400 uppercase tracking-widest text-center truncate w-full mb-1">{userA.name}</div>
                            <div className="text-[14px] md:text-[16px] text-white font-black uppercase tracking-tighter">{userA.typeCode}</div>
                        </div>

                        {/* SYNC CENTER */}
                        <div className="flex flex-col items-center justify-center pt-2">
                            <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle cx="50%" cy="50%" r="40%" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                                    <circle cx="50%" cy="50%" r="40%" fill="none" stroke="url(#syncGradient)" strokeWidth="4" strokeDasharray="100%" strokeDashoffset={`${100 - userA.metrics.humanityScore}%`} strokeLinecap="round" />
                                    <defs>
                                        <linearGradient id="syncGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#EC4899" />
                                            <stop offset="100%" stopColor="#06B2D2" />
                                        </linearGradient>
                                    </defs>
                                </svg>
                                <div className="text-[14px] md:text-[18px] font-black text-white italic">{userA.metrics.humanityScore}%</div>
                            </div>
                            <div className="text-[8px] md:text-[10px] font-black text-white/30 uppercase tracking-[0.2em] mt-2">Sync</div>
                        </div>

                        {/* User B */}
                        <div className="flex-1 flex flex-col items-center">
                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl border flex items-center justify-center text-3xl md:text-4xl mb-3"
                                style={{ backgroundColor: 'rgba(6, 182, 212, 0.1)', borderColor: 'rgba(6, 182, 212, 0.3)' }}>
                                {voiceB.icon}
                            </div>
                            <div className="text-[10px] md:text-[12px] font-black text-cyan-400 uppercase tracking-widest text-center truncate w-full mb-1">{userB.name}</div>
                            <div className="text-[14px] md:text-[16px] text-white font-black uppercase tracking-tighter">{userB.typeCode}</div>
                        </div>
                    </div>

                    {/* COMPARISON CHART */}
                    <div className="rounded-3xl p-6 md:p-8 border space-y-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', borderColor: 'rgba(255, 255, 255, 0.05)' }}>
                        <div className="space-y-3">
                            <div className="flex justify-between text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/30 px-1">
                                <span>Frequency</span>
                                <span>A vs B</span>
                                <span>Tempo</span>
                            </div>
                            {/* Pitch Bar */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden flex justify-end">
                                    <div className="h-full" style={{ width: `${Math.min(userA.metrics.pitch / 400 * 100, 100)}%`, backgroundColor: 'rgba(236, 72, 153, 0.5)' }} />
                                </div>
                                <div className="text-[9px] font-mono text-white/40">Hz</div>
                                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full" style={{ width: `${Math.min(userB.metrics.pitch / 400 * 100, 100)}%`, backgroundColor: 'rgba(6, 182, 212, 0.5)' }} />
                                </div>
                            </div>
                            {/* Speed Bar */}
                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden flex justify-end">
                                    <div className="h-full" style={{ width: `${userA.metrics.speed * 100}%`, backgroundColor: 'rgba(236, 72, 153, 0.3)' }} />
                                </div>
                                <div className="text-[9px] font-mono text-white/40">BPM</div>
                                <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full" style={{ width: `${userB.metrics.speed * 100}%`, backgroundColor: 'rgba(6, 182, 212, 0.3)' }} />
                                </div>
                            </div>
                        </div>

                        {/* DOMINANCE SCALE */}
                        <div className="relative pt-4 px-4">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-[8px] md:text-[10px] font-black text-pink-400/50 uppercase tracking-widest">Active</span>
                                <span className="text-[8px] md:text-[10px] font-black text-white/20 uppercase tracking-widest italic">Dominance Scale</span>
                                <span className="text-[8px] md:text-[10px] font-black text-cyan-400/50 uppercase tracking-widest">Passive</span>
                            </div>
                            <div className="h-1.5 md:h-2 w-full bg-white/10 rounded-full relative">
                                <div
                                    className="absolute top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 bg-white border-2 border-black rounded-full shadow-[0_0_15px_rgba(255,255,255,0.4)] transition-all duration-1000"
                                    style={{ left: `calc(${50 + ((userA.metrics.pitch - userB.metrics.pitch) / 10)}% - 10px)` }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* DYNAMIC LABEL */}
                    <div className="text-center py-4">
                        <div className="text-[10px] md:text-[12px] font-black text-white/40 uppercase tracking-[0.5em] mb-4 font-mono">Resonance ID</div>
                        <div className="text-4xl md:text-5xl font-black text-white uppercase italic tracking-tighter leading-none mb-2">
                            "{identityData?.label || 'SYNCING...'}"
                        </div>
                    </div>
                </div>

                {/* ROAST BOX (Fixed clipping by increasing internal margins) */}
                <div className="rounded-[2rem] p-8 border mt-auto mx-6 mb-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.4)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <p className="text-[11px] md:text-[13px] text-gray-400 leading-relaxed text-center font-medium italic opacity-90 px-4 line-clamp-3">
                        {identityData?.roast || 'Calculating resonance dynamics...'}
                    </p>
                </div>

                {/* FOOTER - Increased items spacing and bounds (Fixed clipping) */}
                <div className="relative z-10 flex justify-between items-center opacity-30 mt-auto px-10 pb-10">
                    <div className="text-[9px] font-black tracking-widest uppercase">Bio-Auth Matrix</div>
                    <div className="text-[9px] font-mono text-white">etchvox.com</div>
                </div>
            </div>

            {/* 2. INTERACTION AREA */}
            <div className="mt-10 flex flex-col items-center gap-6">

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

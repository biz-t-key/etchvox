'use client';

import { useRef, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';

import { MBTIType, mbtiTypes, calculateGapLevel } from '@/lib/mbti';
import { voiceTypes, TypeCode, AnalysisMetrics } from '@/lib/types';

interface SoloIdentityCardProps {
    mbti: MBTIType;
    voiceTypeCode: TypeCode;
    userName?: string;
    metrics: AnalysisMetrics;
}

// Inlined noise SVG to avoid CORS issues with html2canvas
const NOISE_DATA_URL = "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E";

export default function SoloIdentityCard({ mbti, voiceTypeCode, userName, metrics }: SoloIdentityCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);
    const [identityData, setIdentityData] = useState<{ brandName: string, roast: string } | null>(null);

    const mbtiInfo = mbtiTypes[mbti];
    const voiceInfo = voiceTypes[voiceTypeCode];
    const gapLevel = calculateGapLevel(mbti, metrics);

    // ✅ STEP 1: Fetch ROAST from Server-side API (Hide from client-side bundle)
    useEffect(() => {
        async function fetchIdentity() {
            try {
                const res = await fetch('/api/identity/solo', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mbti, voiceTypeCode })
                });
                const data = await res.json();
                setIdentityData(data);
            } catch (err) {
                console.error("Failed to fetch server-side roast:", err);
                setIdentityData({
                    brandName: "THE ENIGMA",
                    roast: "Your combination is so rare, even our AI is trying to figure you out."
                });
            }
        }
        fetchIdentity();
    }, [mbti, voiceTypeCode]);

    // ✅ STEP 2: Update Image Capture Engine
    useEffect(() => {
        if (!mbtiInfo || !voiceInfo || !cardRef.current || !identityData) return;

        // Start generation process
        setGenerating(true);
        setImageUrl(null);

        const timer = setTimeout(async () => {
            try {
                if (cardRef.current) {
                    const canvas = await html2canvas(cardRef.current, {
                        backgroundColor: '#050505',
                        scale: 3, // Increased scale for even higher print quality
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
                            const clonedCard = clonedDoc.querySelector('[data-capture-target="solo-card"]') as HTMLElement;
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

                                // 2. Remove backdrop-filter as html2canvas doesn't support it
                                const allElements = clonedDoc.querySelectorAll('*');
                                allElements.forEach((el: any) => {
                                    if (el instanceof HTMLElement && el.style) {
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
                console.error("Solo Identity Card capture failed:", err);
            } finally {
                setGenerating(false);
            }
        }, 2000);

        return () => clearTimeout(timer);
    }, [mbti, voiceTypeCode, userName]);

    if (!mbtiInfo || !voiceInfo) return null;

    const handleDownload = () => {
        if (!imageUrl) return;
        const link = document.createElement('a');
        link.download = `etchvox-truth-card-${mbti}-${voiceTypeCode}.png`;
        link.href = imageUrl;
        link.click();
    };

    return (
        <div className="relative mx-auto w-full max-w-[400px] md:max-w-[480px]">
            {/* 1. VISUAL CARD (The one being captured) */}
            <div
                ref={cardRef}
                data-capture-target="solo-card"
                className="relative w-full aspect-[4/5] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col p-10 md:p-14 border border-white/10 font-sans select-none"
                style={{
                    width: '100%',
                    backgroundColor: '#050505',
                    color: '#ffffff',
                    position: 'relative'
                }}
            >
                {/* SAFE BACKGROUND FOR CAPTURE */}
                <div className="absolute inset-0 z-0" style={{ backgroundColor: '#050505' }} />

                {/* BACKGROUND DECORATION - Use absolute positioning and explicit colors */}
                <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full pointer-events-none z-0"
                    style={{ background: 'radial-gradient(circle, #06b6d433 0%, rgba(6, 182, 212, 0) 70%)' }} />
                <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full pointer-events-none z-0"
                    style={{ background: `radial-gradient(circle, ${mbtiInfo.color}33 0%, rgba(0, 0, 0, 0) 70%)` }} />

                {/* NOISE OVERLAY */}
                <div
                    className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay z-0"
                    style={{ backgroundImage: `url("${NOISE_DATA_URL}")`, backgroundRepeat: 'repeat' }}
                />

                {/* HEADER */}
                <div className="relative z-10 flex items-center justify-between mb-2 md:mb-4 px-2">
                    <div className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em]" style={{ color: '#ffffff99' }}>
                        Truth Card
                    </div>
                    <div className="text-[10px] md:text-[12px] font-mono tracking-widest uppercase" style={{ color: '#ffffff33' }}>
                        #{userName?.substring(0, 8).toUpperCase() || 'GUEST-VOX'}
                    </div>
                </div>

                {/* MAIN PROFILE AREA */}
                <div className="relative flex-grow flex flex-col justify-center space-y-6 md:space-y-10 z-10 px-4">

                    {/* PSYCHOLOGICAL BLUEPRINT */}
                    <div className="text-center relative">
                        <div className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.6em] opacity-40 mb-1" style={{ color: mbtiInfo.color || '#ffffff' }}>
                            Personality Code
                        </div>
                        <div className="text-7xl md:text-8xl font-black uppercase tracking-tighter leading-none"
                            style={{ color: mbtiInfo.color || '#ffffff' }}>
                            {mbti}
                        </div>
                        <div className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] mt-2 opacity-90" style={{ color: mbtiInfo.color || '#ffffff' }}>
                            {mbtiInfo.nickname}
                        </div>
                    </div>

                    {/* GAP INDICATOR */}
                    <div className="relative py-2 px-6 md:px-12">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]" style={{ color: 'rgba(255, 255, 255, 0.3)' }}>Identity Gap</span>
                            <span className="text-[10px] md:text-[12px] font-mono font-bold" style={{ color: '#22d3ee' }}>{gapLevel}%</span>
                        </div>
                        <div className="h-[2px] md:h-[4px] w-full rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                            <div
                                className="h-full transition-all duration-1000"
                                style={{ width: `${gapLevel}%`, background: 'linear-gradient(to right, #0891b2, #ffffff)' }}
                            />
                        </div>
                    </div>

                    {/* ACOUSTIC DATA */}
                    <div className="text-center">
                        <div className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.6em] mb-1" style={{ color: 'rgba(34, 211, 238, 0.4)' }}>
                            Acoustic Signal
                        </div>
                        <div className="text-7xl md:text-8xl font-black uppercase tracking-tighter leading-none" style={{ color: '#22d3ee' }}>
                            {voiceTypeCode}
                        </div>
                        <div className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] mt-2" style={{ color: 'rgba(34, 211, 238, 0.6)' }}>
                            {voiceInfo.name}
                        </div>
                    </div>
                </div>

                {/* IDENTITY ARCHETYPE BOX */}
                <div className="relative z-10 rounded-[1.5rem] p-6 md:p-8 border shadow-2xl mt-6 mx-2 md:mx-4"
                    style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', borderColor: 'rgba(255, 255, 255, 0.1)' }}>
                    <div className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] mb-3 text-center" style={{ color: '#22d3ee' }}>
                        Identity Result
                    </div>
                    <div className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tighter text-center leading-[1] mb-4">
                        "{identityData?.brandName || 'PROCESSING...'}"
                    </div>
                    <p className="text-[11px] md:text-[13px] font-medium italic leading-relaxed text-center px-4" style={{ color: '#9ca3af' }}>
                        {identityData?.roast || 'Decoding vocal signature...'}
                    </p>
                    <div className="mt-8 text-[8px] uppercase tracking-[0.4em] text-center" style={{ color: 'rgba(255, 255, 255, 0.4)' }}>
                        etchvox.com fingerprint
                    </div>
                </div>

                {/* FOOTER */}
                <div className="relative z-10 mt-8 flex justify-between items-center px-4 pb-0" style={{ opacity: 0.5 }}>
                    <div className="text-[8px] font-black tracking-[0.2em] uppercase" style={{ color: '#ffffff' }}>Auth: Bio-Metric</div>
                    <div className="text-[8px] font-mono text-white">v1.1.0.SOLO</div>
                </div>
            </div>

            {/* 2. INTERACTION AREA */}
            <div className="mt-10 flex flex-col items-center gap-6">

                {/* STATUS INDICATOR */}
                <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest border border-white/5 px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm">
                    <span className={`w-1.5 h-1.5 rounded-full ${imageUrl ? 'bg-cyan-500' : generating ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
                    {generating ? 'Capturing Truth Card...' : imageUrl ? 'Identity Decrypted' : 'Capture Failed'}
                </div>

                {/* DOWNLOAD BUTTON */}
                <button
                    onClick={handleDownload}
                    disabled={!imageUrl}
                    className="group relative w-full flex items-center justify-center gap-3 bg-white text-black px-8 py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                >
                    <span className="relative z-10">
                        {imageUrl ? '📥 Download Identity Card' : generating ? 'Generating Image...' : 'Retry Capture'}
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
                    alt="Truth Card Overlay"
                    className="absolute inset-0 w-full h-[calc(100%-140px)] opacity-0 cursor-pointer z-50 select-none touch-none"
                    onContextMenu={(e) => e.stopPropagation()}
                />
            )}
        </div>
    );
}

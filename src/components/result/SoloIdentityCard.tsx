'use client';

import { useRef, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';

import { MBTIType, mbtiTypes, calculateGapLevel } from '@/lib/mbti';
import { voiceTypes, TypeCode, AnalysisMetrics } from '@/lib/types';
import { getSoloIdentity } from '@/lib/soloIdentityMatrix';

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

    const mbtiInfo = mbtiTypes[mbti];
    const voiceInfo = voiceTypes[voiceTypeCode];

    const rawIdentity = getSoloIdentity(mbti, voiceTypeCode);
    const gapLevel = calculateGapLevel(mbti, metrics);

    const displayIdentity = rawIdentity || {
        brandName: "THE ENIGMA",
        roast: "Your combination is so rare, even our AI is trying to figure you out. You are the anomaly in the system.",
    };

    useEffect(() => {
        if (!mbtiInfo || !voiceInfo || !cardRef.current) return;

        // Start generation process
        setGenerating(true);
        setImageUrl(null);

        const timer = setTimeout(async () => {
            try {
                if (cardRef.current) {
                    const canvas = await html2canvas(cardRef.current, {
                        backgroundColor: '#050505',
                        scale: 2,
                        useCORS: true,
                        logging: false,
                        allowTaint: false,
                        // Fix for oklab/oklch error: force standard color space
                        imageTimeout: 0,
                        onclone: (clonedDoc) => {
                            const clonedCard = clonedDoc.querySelector('[data-capture-target="solo-card"]') as HTMLElement;
                            if (clonedCard) {
                                // 1. Fix clipping by adding a tiny bit of "outer padding" in the clone
                                clonedCard.style.padding = '48px'; // Ensure internal p-12 isn't the absolute edge

                                // 2. Remove any oklab/oklch styles that might have leaked from Tailwind 4
                                // html2canvas 1.4.1 doesn't support them.
                                const allElements = clonedDoc.querySelectorAll('*');
                                allElements.forEach((el: any) => {
                                    if (el.style) {
                                        el.style.backdropFilter = 'none';
                                        el.style.webkitBackdropFilter = 'none';

                                        // Manual override for some common oklab-prone classes if needed
                                        // But we'll try to use HEX in the component directly.
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
        <div className="relative mx-auto w-full max-w-[400px]">
            {/* 1. VISUAL CARD (The one being captured) */}
            <div
                ref={cardRef}
                data-capture-target="solo-card"
                className="relative w-full aspect-[4/5] bg-[#050505] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col p-12 border border-white/10 font-sans select-none"
                style={{ width: '100%', maxWidth: '400px', backgroundColor: '#050505' }}
            >
                {/* BACKGROUND DECORATION */}
                <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full blur-[120px] pointer-events-none"
                    style={{ backgroundColor: '#06b6d41a' }} />
                <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full blur-[120px] pointer-events-none"
                    style={{ backgroundColor: `${mbtiInfo.color}15` }} />

                {/* NOISE OVERLAY */}
                <div
                    className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
                    style={{ backgroundImage: `url("${NOISE_DATA_URL}")`, backgroundRepeat: 'repeat' }}
                />

                {/* HEADER */}
                <div className="relative z-10 flex items-center justify-between mb-2 px-6">
                    <div className="text-[10px] font-black uppercase tracking-[0.4em]" style={{ color: '#ffffff66' }}>
                        Truth Card
                    </div>
                    <div className="text-[10px] font-mono tracking-widest uppercase" style={{ color: '#ffffff33' }}>
                        #{userName?.substring(0, 8).toUpperCase() || 'GUEST-VOX'}
                    </div>
                </div>

                {/* MAIN PROFILE AREA */}
                <div className="relative flex-grow flex flex-col justify-center space-y-4 z-10 px-4">

                    {/* PSYCHOLOGICAL BLUEPRINT */}
                    <div className="text-center relative">
                        <div className="text-[10px] font-black uppercase tracking-[0.6em] opacity-40 mb-1" style={{ color: mbtiInfo.color }}>
                            Personality Code
                        </div>
                        <div className="text-7xl font-black uppercase tracking-tighter leading-none"
                            style={{ color: mbtiInfo.color, textShadow: `0 0 50px ${mbtiInfo.color}60` }}>
                            {mbti}
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] mt-2 opacity-90" style={{ color: mbtiInfo.color }}>
                            {mbtiInfo.nickname}
                        </div>
                    </div>

                    {/* GAP INDICATOR */}
                    <div className="relative py-2 px-10">
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-[8px] font-black uppercase tracking-[0.3em]" style={{ color: '#ffffff4d' }}>Identity Gap</span>
                            <span className="text-[9px] font-mono font-bold" style={{ color: '#22d3ee' }}>{gapLevel}%</span>
                        </div>
                        <div className="h-[2px] w-full rounded-full overflow-hidden" style={{ backgroundColor: '#ffffff0d' }}>
                            <div
                                className="h-full transition-all duration-1000"
                                style={{ width: `${gapLevel}%`, background: 'linear-gradient(to right, #0891b2, #ffffff)' }}
                            />
                        </div>
                    </div>

                    {/* ACOUSTIC DATA */}
                    <div className="text-center">
                        <div className="text-[10px] font-black uppercase tracking-[0.6em] mb-1" style={{ color: '#22d3ee66' }}>
                            Acoustic Signal
                        </div>
                        <div className="text-7xl font-black uppercase tracking-tighter leading-none" style={{ color: '#22d3ee' }}>
                            {voiceTypeCode}
                        </div>
                        <div className="text-[10px] font-black uppercase tracking-[0.4em] mt-2" style={{ color: '#22d3ee99' }}>
                            {voiceInfo.name}
                        </div>
                    </div>
                </div>

                {/* IDENTITY ARCHETYPE BOX */}
                <div className="relative z-10 rounded-[1.5rem] p-6 border shadow-2xl mt-4 mx-4"
                    style={{ backgroundColor: '#00000099', borderColor: '#ffffff1a' }}>
                    <div className="text-[9px] font-black uppercase tracking-[0.3em] mb-3 text-center" style={{ color: '#22d3ee99' }}>
                        Identity Result
                    </div>
                    <div className="text-3xl font-black text-white uppercase italic tracking-tighter text-center leading-[1] mb-4">
                        "{displayIdentity.brandName}"
                    </div>
                    <p className="text-[11px] font-medium italic leading-relaxed text-center px-4" style={{ color: '#9ca3af' }}>
                        {displayIdentity.roast}
                    </p>
                    {/* Logo/URL marker inside capture */}
                    <div className="mt-4 text-[7px] uppercase tracking-[0.4em] text-center" style={{ color: '#ffffff0d' }}>
                        etchvox.com fingerprint
                    </div>
                </div>

                {/* FOOTER */}
                <div className="relative z-10 mt-6 flex justify-between items-center px-8" style={{ opacity: 0.2 }}>
                    <div className="text-[8px] font-black tracking-[0.2em] uppercase" style={{ color: '#ffffff' }}>Auth: Bio-Metric</div>
                    <div className="text-[8px] font-mono" style={{ color: '#ffffff' }}>v1.0.4.SOLO</div>
                </div>
            </div>

            {/* 2. INTERACTION AREA */}
            <div className="mt-8 flex flex-col items-center gap-6">

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

                {/* SCREENSHOT HINT (MATCHING USER SCREENSHOT REQ) */}
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

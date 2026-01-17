'use client';

import { useRef, useEffect, useState } from 'react';
import html2canvas from 'html2canvas';

import { MBTIType, mbtiTypes } from '@/lib/mbti';
import { voiceTypes, TypeCode } from '@/lib/types';
import { getSoloIdentity } from '@/lib/soloIdentityMatrix';

interface SoloIdentityCardProps {
    mbti: MBTIType;
    voiceTypeCode: TypeCode;
    userName?: string;
}

// Inlined noise SVG to avoid CORS issues with html2canvas
const NOISE_DATA_URL = "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E";

export default function SoloIdentityCard({ mbti, voiceTypeCode, userName }: SoloIdentityCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [generating, setGenerating] = useState(false);

    const mbtiInfo = mbtiTypes[mbti];
    const voiceInfo = voiceTypes[voiceTypeCode];

    const rawIdentity = getSoloIdentity(mbti, voiceTypeCode);
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
                        // Removed windowWidth/Height for better compatibility
                    });
                    const imgData = canvas.toDataURL('image/png');
                    setImageUrl(imgData);
                }
            } catch (err) {
                console.error("Solo Identity Card capture failed:", err);
            } finally {
                setGenerating(false);
            }
        }, 2000); // 2s is safer for fonts

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
                className="relative w-full aspect-[4/5] bg-[#050505] rounded-[2rem] shadow-2xl overflow-hidden flex flex-col p-12 border border-white/10 font-sans select-none"
                style={{ width: '100%', maxWidth: '400px' }}
            >
                {/* BACKGROUND DECORATION */}
                <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full blur-[120px] pointer-events-none"
                    style={{ backgroundColor: `${mbtiInfo.color}15` }} />

                {/* NOISE OVERLAY */}
                <div
                    className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
                    style={{ backgroundImage: `url("${NOISE_DATA_URL}")`, backgroundRepeat: 'repeat' }}
                />

                {/* HEADER */}
                <div className="relative z-10 flex items-center justify-between mb-2">
                    <div className="text-[10px] font-black text-white/40 uppercase tracking-[0.4em]">
                        Truth Card
                    </div>
                    <div className="text-[10px] font-mono text-white/20 tracking-widest uppercase">
                        #{userName?.substring(0, 8).toUpperCase() || 'GUEST-VOX'}
                    </div>
                </div>

                {/* MAIN PROFILE AREA */}
                <div className="relative flex-grow flex flex-col justify-center space-y-8 z-10">

                    {/* PSYCHOLOGICAL BLUEPRINT */}
                    <div className="text-center">
                        <div className="text-[8px] font-bold uppercase tracking-[0.6em] opacity-40 mb-3" style={{ color: mbtiInfo.color }}>
                            Self Perception
                        </div>
                        <div className="text-6xl font-black uppercase tracking-tighter leading-none"
                            style={{ color: mbtiInfo.color, textShadow: `0 0 40px ${mbtiInfo.color}40` }}>
                            {mbti}
                        </div>
                        <div className="text-sm font-bold uppercase tracking-[0.3em] mt-3 opacity-80" style={{ color: mbtiInfo.color }}>
                            {mbtiInfo.nickname}
                        </div>
                    </div>

                    {/* DIVIDER */}
                    <div className="w-12 h-[1px] mx-auto opacity-20 bg-gradient-to-r from-transparent via-white to-transparent" />

                    {/* ACOUSTIC DATA */}
                    <div className="text-center">
                        <div className="text-[8px] font-bold uppercase tracking-[0.6em] text-cyan-400/50 mb-3">
                            Bio-Data
                        </div>
                        <div className="text-6xl font-black uppercase tracking-tighter text-cyan-400 leading-none drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]">
                            {voiceTypeCode}
                        </div>
                        <div className="text-sm font-bold text-cyan-300/80 uppercase tracking-[0.3em] mt-3">
                            {voiceInfo.name}
                        </div>
                    </div>
                </div>

                {/* IDENTITY ARCHETYPE BOX */}
                <div className="relative z-10 bg-black/60 backdrop-blur-3xl rounded-[1.5rem] p-6 border border-white/10 shadow-2xl mt-4">
                    <div className="text-[9px] font-black text-cyan-500/60 uppercase tracking-[0.3em] mb-3 text-center">
                        Identity Result
                    </div>
                    <div className="text-3xl font-black text-white uppercase italic tracking-tighter text-center leading-[1] mb-4">
                        "{displayIdentity.brandName}"
                    </div>
                    <p className="text-[11px] text-gray-400 font-medium italic leading-relaxed text-center px-2">
                        {displayIdentity.roast}
                    </p>
                    {/* Logo/URL marker inside capture */}
                    <div className="mt-4 text-[7px] text-white/5 uppercase tracking-[0.4em] text-center">
                        etchvox.com fingerprint
                    </div>
                </div>

                {/* FOOTER */}
                <div className="relative z-10 mt-6 flex justify-between items-center opacity-20">
                    <div className="text-[8px] font-black tracking-[0.2em] uppercase">Auth: Bio-Metric</div>
                    <div className="text-[8px] font-mono">v1.0.4.SOLO</div>
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

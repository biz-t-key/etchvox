'use client';

import { useRef, useEffect, useState } from 'react';
import { toPng } from 'html-to-image';
import { trackEv } from '@/lib/analytics';

import { MBTIType, mbtiTypes, calculateGapLevel } from '@/lib/mbti';
import { voiceTypes, TypeCode, AnalysisMetrics } from '@/lib/types';

interface SoloIdentityCardProps {
    mbti: MBTIType;
    voiceTypeCode: TypeCode;
    userName?: string;
    metrics: AnalysisMetrics;
    onImageGenerated?: (url: string) => void;
}

// Inlined noise SVG to avoid CORS issues with html2canvas
const NOISE_DATA_URL = "data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E";

export default function SoloIdentityCard({ mbti, voiceTypeCode, userName, metrics, onImageGenerated }: SoloIdentityCardProps) {
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
                    // Use html-to-image toPng for more reliable client-side capture
                    const dataUrl = await toPng(cardRef.current, {
                        cacheBust: true,
                        pixelRatio: 3, // High quality
                        backgroundColor: '#050505',
                        style: {
                            borderRadius: '0', // Force square corners for capture
                        }
                    });
                    setImageUrl(dataUrl);
                    if (onImageGenerated) onImageGenerated(dataUrl);
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
        trackEv('3.0', 'card_download', { type: 'solo', code: voiceTypeCode });
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
                className="relative w-full aspect-[4/5] rounded-none shadow-2xl overflow-hidden flex flex-col p-12 md:p-16 border border-white/10 font-sans select-none"
                style={{
                    width: '100%',
                    maxWidth: '480px',
                    backgroundColor: '#050505',
                    color: '#ffffff',
                    position: 'relative',
                    margin: '0 auto'
                }}
            >
                {/* SAFE BACKGROUND FOR CAPTURE */}
                <div className="absolute inset-0 z-0" style={{ backgroundColor: '#050505' }} />

                {/* BACKGROUND DECORATION - Deep Crimson Base */}
                <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[80%] rounded-full pointer-events-none z-0"
                    style={{
                        background: voiceTypeCode === 'ELON'
                            ? 'radial-gradient(circle, rgba(153, 27, 27, 0.4) 0%, rgba(153, 27, 27, 0) 70%)'
                            : 'radial-gradient(circle, #06b6d433 0%, rgba(6, 182, 212, 0) 70%)'
                    }} />
                <div className="absolute bottom-[-20%] left-[-20%] w-[80%] h-[80%] rounded-full pointer-events-none z-0"
                    style={{
                        background: voiceTypeCode === 'ELON'
                            ? 'radial-gradient(circle, rgba(76, 5, 10, 0.7) 0%, rgba(0, 0, 0, 0) 70%)'
                            : `radial-gradient(circle, ${mbtiInfo.color}33 0%, rgba(0, 0, 0, 0) 70%)`
                    }} />


                {/* RAW NOISE OVERLAY (REPLACES EXTERNAL SANDPAPER FOR CORS/DOWNLOAD SAFETY) */}
                <div
                    className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay z-0"
                    style={{ backgroundImage: `url("${NOISE_DATA_URL}")`, backgroundRepeat: 'repeat', backgroundSize: '200px' }}
                />

                {/* HEADER - Increased padding to clear rounded corners (Fixed clipping) */}
                <div className="relative z-10 flex items-center justify-between mb-6 md:mb-8 px-8 md:px-12">
                    <div className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em]"
                        style={{ color: voiceTypeCode === 'ELON' ? '#cbd5e1' : '#ffffff99' }}>
                        Truth Card
                    </div>
                    <div className="text-[10px] md:text-[12px] font-mono tracking-widest uppercase"
                        style={{ color: voiceTypeCode === 'ELON' ? 'rgba(203, 213, 225, 0.3)' : '#ffffff33' }}>
                        #{userName?.substring(0, 8).toUpperCase() || 'GUEST-VOX'}
                    </div>
                </div>

                {/* MAIN PROFILE AREA */}
                <div className="relative flex-grow flex flex-col justify-center space-y-6 md:space-y-10 z-10 px-6">

                    {/* PSYCHOLOGICAL BLUEPRINT - Skip for special modes like ELON */}
                    {voiceInfo.group !== 'special' && (
                        <div className="text-center relative">
                            <div className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.6em] opacity-40 mb-1"
                                style={{ color: voiceTypeCode === 'ELON' ? '#94a3b8' : mbtiInfo.color || '#ffffff' }}>
                                Personality Code
                            </div>
                            <div className="text-7xl md:text-8xl font-black uppercase tracking-tighter leading-none"
                                style={{ color: voiceTypeCode === 'ELON' ? '#e2e8f0' : mbtiInfo.color || '#ffffff' }}>
                                {mbti}
                            </div>
                            <div className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] mt-2 opacity-90"
                                style={{ color: voiceTypeCode === 'ELON' ? '#cbd5e1' : mbtiInfo.color || '#ffffff' }}>
                                {mbtiInfo.nickname}
                            </div>
                        </div>
                    )}

                    {/* GAP INDICATOR */}
                    <div className="relative py-2 px-8 md:px-16">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.3em]"
                                style={{ color: voiceTypeCode === 'ELON' ? 'rgba(148, 163, 184, 0.5)' : 'rgba(255, 255, 255, 0.3)' }}>Identity Gap</span>
                            <span className="text-[10px] md:text-[12px] font-mono font-bold"
                                style={{ color: voiceTypeCode === 'ELON' ? '#e2e8f0' : '#22d3ee' }}>{gapLevel}%</span>
                        </div>
                        <div className="h-[2px] md:h-[4px] w-full rounded-full overflow-hidden" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                            <div
                                className="h-full transition-all duration-1000"
                                style={{
                                    width: `${gapLevel}%`,
                                    background: voiceTypeCode === 'ELON'
                                        ? 'linear-gradient(to right, #475569, #e2e8f0)'
                                        : 'linear-gradient(to right, #0891b2, #ffffff)'
                                }}
                            />
                        </div>
                    </div>

                    {/* ACOUSTIC DATA */}
                    <div className="text-center">
                        <div className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.6em] mb-1"
                            style={{
                                color: voiceTypeCode === 'ELON' ? '#94a3b8' : 'rgba(34, 211, 238, 0.4)',
                                textShadow: voiceTypeCode === 'ELON' ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
                            }}>
                            Acoustic Signal
                        </div>
                        <div className="text-7xl md:text-8xl font-black uppercase tracking-tighter leading-none relative"
                            style={{
                                color: voiceTypeCode === 'ELON' ? '#e2e8f0' : '#22d3ee',
                                // Metallic Gradient for ELON
                                background: voiceTypeCode === 'ELON'
                                    ? 'linear-gradient(to bottom, #ffffff 0%, #cbd5e1 45%, #94a3b8 50%, #cbd5e1 55%, #ffffff 100%)'
                                    : 'none',
                                WebkitBackgroundClip: voiceTypeCode === 'ELON' ? 'text' : 'border-box',
                                WebkitTextFillColor: voiceTypeCode === 'ELON' ? 'transparent' : 'currentColor',
                                filter: voiceTypeCode === 'ELON' ? 'drop-shadow(0 4px 8px rgba(0,0,0,0.8))' : 'none'
                            }}>
                            {voiceTypeCode}
                        </div>
                        <div className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.4em] mt-2"
                            style={{
                                color: voiceTypeCode === 'ELON' ? '#cbd5e1' : 'rgba(34, 211, 238, 0.6)',
                                textShadow: voiceTypeCode === 'ELON' ? '0 2px 4px rgba(0,0,0,0.5)' : 'none'
                            }}>
                            {voiceInfo.name}
                        </div>
                    </div>
                </div>

                {/* IDENTITY ARCHETYPE BOX */}
                <div className="relative z-10 rounded-[2rem] p-8 md:p-10 border shadow-2xl mt-6 mx-4 md:mx-6"
                    style={{
                        backgroundColor: voiceTypeCode === 'ELON' ? 'rgba(127, 29, 29, 0.4)' : 'rgba(0, 0, 0, 0.6)',
                        borderColor: voiceTypeCode === 'ELON' ? 'rgba(226, 232, 240, 0.3)' : 'rgba(255, 255, 255, 0.1)',
                        boxShadow: voiceTypeCode === 'ELON' ? '0 10px 30px rgba(0,0,0,0.5)' : 'none'
                    }}>
                    <div className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.3em] mb-4 text-center"
                        style={{ color: voiceTypeCode === 'ELON' ? '#cbd5e1' : '#22d3ee' }}>
                        Identity Result
                    </div>
                    <div className="text-3xl md:text-4xl font-black uppercase italic tracking-tighter text-center leading-[1] mb-5"
                        style={{
                            color: voiceTypeCode === 'ELON' ? '#f8fafc' : '#ffffff',
                            background: voiceTypeCode === 'ELON'
                                ? 'linear-gradient(to bottom, #ffffff 0%, #cbd5e1 45%, #94a3b8 50%, #cbd5e1 55%, #ffffff 100%)'
                                : 'none',
                            WebkitBackgroundClip: voiceTypeCode === 'ELON' ? 'text' : 'border-box',
                            WebkitTextFillColor: voiceTypeCode === 'ELON' ? 'transparent' : 'currentColor',
                            filter: voiceTypeCode === 'ELON' ? 'drop-shadow(0 2px 4px rgba(0,0,0,0.6))' : 'none'
                        }}>
                        "{identityData?.brandName || 'PROCESSING...'}"
                    </div>
                    <p className="text-[11px] md:text-[13px] font-medium italic leading-relaxed text-center px-6"
                        style={{ color: voiceTypeCode === 'ELON' ? '#cbd5e1' : '#9ca3af' }}>
                        {identityData?.roast || 'Decoding vocal signature...'}
                    </p>
                    <div className="mt-8 text-[8px] uppercase tracking-[0.4em] text-center"
                        style={{ color: voiceTypeCode === 'ELON' ? 'rgba(226, 232, 240, 0.4)' : 'rgba(255, 255, 255, 0.4)' }}>
                        etchvox.com fingerprint
                    </div>
                </div>

                {/* FOOTER - Increased items spacing and bounds (Fixed clipping) */}
                <div className="relative z-10 mt-auto flex justify-between items-center px-10 pb-6"
                    style={{ opacity: voiceTypeCode === 'ELON' ? 0.7 : 0.5 }}>
                    <div className="text-[8px] font-black tracking-[0.2em] uppercase"
                        style={{ color: voiceTypeCode === 'ELON' ? '#cbd5e1' : '#ffffff' }}></div>
                    <div className="text-[8px] font-mono"
                        style={{ color: voiceTypeCode === 'ELON' ? '#94a3b8' : '#ffffff' }}></div>
                </div>
            </div>

            {/* 2. INTERACTION AREA */}
            <div className="mt-10 flex flex-col items-center gap-6">

                {/* STATUS INDICATOR */}
                <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest border border-white/5 px-4 py-2 rounded-full bg-black/40 backdrop-blur-sm">
                    <span className={`w-1.5 h-1.5 rounded-full ${imageUrl ? 'bg-cyan-500' : generating ? 'bg-yellow-500 animate-pulse' : 'bg-red-500'}`} />
                    {generating ? 'Capturing Truth Card...' : imageUrl ? 'Identity Decrypted' : 'Analysis Pattern Lost'}
                </div>

                {/* DOWNLOAD BUTTON */}
                <button
                    onClick={handleDownload}
                    disabled={!imageUrl}
                    className="group relative w-full flex items-center justify-center gap-3 bg-white text-black px-8 py-5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100 shadow-[0_20px_40px_rgba(255,255,255,0.1)]"
                >
                    <span className="relative z-10">
                        {imageUrl ? '📥 Download Identity Card' : generating ? 'Encoding Signal...' : 'Retry Capture'}
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
                    alt="Truth Card Overlay"
                    className="absolute inset-0 w-full h-[calc(100%-140px)] opacity-0 cursor-pointer z-50 select-none touch-none"
                    onContextMenu={(e) => e.stopPropagation()}
                />
            )}
        </div>
    );
}

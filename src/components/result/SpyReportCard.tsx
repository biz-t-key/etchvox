'use client';

import React, { useEffect, useState } from 'react';
import { TypeCode } from '@/lib/types';

interface SpyReportCardProps {
    typeCode: TypeCode;
    spyMetadata: {
        origin: string;
        target: string;
    };
    reportMessage: string;
    score: number;
    onBurn?: () => void;
    autoBurn?: boolean;
}

const RESULT_CONFIG: Record<string, { color: string, count: number }> = {
    HIRED: { color: '#ef4444', count: 30 }, // Cinematic Red
    REJT: { color: '#000000', count: 15 }, // Cold Black
    BURN: { color: '#f97316', count: 45 }, // Fire/Orange
    SUSP: { color: '#eab308', count: 20 }  // Warning Yellow
};

interface InkDrop {
    id: number;
    x: number;
    y: number;
    size: number;
    duration: number;
    delay: number;
}

const SpyReportCard: React.FC<SpyReportCardProps> = ({ typeCode, spyMetadata, reportMessage, score, onBurn, autoBurn }) => {
    const [displayedMessage, setDisplayedMessage] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const [shouldSlam, setShouldSlam] = useState(false);
    const [inkDrops, setInkDrops] = useState<InkDrop[]>([]);
    const [isShaking, setIsShaking] = useState(false);

    // Self-Destruct States
    const [isBurning, setIsBurning] = useState(false);
    const [countdown, setCountdown] = useState(5.00);
    const [isGlitching, setIsGlitching] = useState(false);
    const [isScrambling, setIsScrambling] = useState(false);
    const [isPurged, setIsPurged] = useState(false);

    const config = RESULT_CONFIG[typeCode] || RESULT_CONFIG.REJT;

    useEffect(() => {
        let i = 0;
        const timer = setInterval(() => {
            setDisplayedMessage(reportMessage.slice(0, i));
            i++;
            if (i > reportMessage.length) {
                clearInterval(timer);
                setIsTyping(false);
                triggerSlam();
            }
        }, 25);
        return () => clearInterval(timer);
    }, [reportMessage]);

    // Handle Countdown and Glitch logic
    useEffect(() => {
        if (!isBurning) return;

        const interval = setInterval(() => {
            setCountdown(prev => {
                const next = Math.max(0, prev - 0.05);

                // Reveal Glitch at < 3s
                if (next < 3.00 && !isGlitching) setIsGlitching(true);
                // Reveal Scrambling at < 1.5s
                if (next < 1.50 && !isScrambling) setIsScrambling(true);

                if (next <= 0) {
                    clearInterval(interval);
                    triggerPurge();
                }
                return next;
            });
        }, 50);

        return () => clearInterval(interval);
    }, [isBurning, isGlitching, isScrambling]);

    const triggerSlam = () => {
        const drops: InkDrop[] = [];
        for (let i = 0; i < config.count; i++) {
            const angle = Math.random() * Math.PI * 2;
            const velocity = 40 + Math.random() * 180;
            drops.push({
                id: i,
                x: Math.cos(angle) * velocity,
                y: Math.sin(angle) * velocity,
                size: 2 + Math.random() * 14,
                duration: 400 + Math.random() * 300,
                delay: 100 + Math.random() * 50
            });
        }
        setInkDrops(drops);

        setTimeout(() => {
            setShouldSlam(true);
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 200);

            // AUTO-BURN Logic: Trigger destruction after slam completes
            if (autoBurn) {
                setTimeout(() => {
                    startDestruction();
                }, 1000);
            }
        }, 150);
    };

    const triggerPurge = () => {
        setIsPurged(true);
        if (onBurn) onBurn();
    };

    const startDestruction = () => {
        setIsBurning(true);
    };

    const scrambleText = (text: string) => {
        if (!isScrambling) return text;
        const chars = "█▓▒░$#@%&?!<>";
        return text.split('').map(() => chars[Math.floor(Math.random() * chars.length)]).join('');
    };

    const getStampUrl = () => {
        switch (typeCode) {
            case 'HIRED': return '/stamps/spy/hired.png';
            case 'SUSP': return '/stamps/spy/suspect.png';
            case 'BURN': return '/stamps/spy/burn.png';
            case 'REJT': return '/stamps/spy/rejected.png';
            default: return '/stamps/spy/rejected.png';
        }
    };

    if (isPurged) return null;

    return (
        <div className={`report-card font-mono text-left max-w-md mx-auto relative overflow-hidden bg-white p-8 border-2 border-zinc-900 shadow-2xl ${isShaking ? 'shake' : ''} ${isGlitching ? 'glitch-active' : ''}`}>
            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cardboard-flat.png')]" />

            {/* SILHOUETTE - Dossier Style */}
            <div className={`absolute right-0 bottom-0 w-64 h-64 opacity-[0.05] pointer-events-none z-0 transform translate-x-10 translate-y-10 ${isGlitching ? 'glitch-active' : ''}`}>
                <img src="/assets/silhouettes/silhouette_hat_man.png" alt="" className="w-full h-full object-contain" />
            </div>

            <div className="header flex justify-between text-[10px] text-zinc-500 mb-6 border-b border-zinc-200 pb-2 relative z-10">
                <span>INTEL_AGENCY // TOP_SECRET</span>
                <span className="header-alert text-red-700 animate-pulse font-black">DO_NOT_DISTRIBUTE</span>
            </div>

            <div className="meta-grid grid grid-cols-[80px_1fr] gap-2 text-xs mb-8 relative z-10">
                <span className="label text-zinc-500 uppercase">STATUS:</span>
                <span className="value text-red-700 font-bold uppercase">
                    {isScrambling ? scrambleText('CLASSIFIED') : (isTyping ? 'DECRYPTING...' : 'CLASSIFIED')}
                </span>

                <span className="label text-zinc-500 uppercase">SUBJECT:</span>
                <span className="value text-zinc-900 uppercase font-bold">
                    {isScrambling ? scrambleText(spyMetadata.origin) : spyMetadata.origin.replace('_', ' ')}
                </span>

                <span className="label text-zinc-500 uppercase">SECTOR:</span>
                <span className="value text-zinc-900 uppercase font-bold">
                    {isScrambling ? scrambleText(spyMetadata.target) : spyMetadata.target.replace('_', ' ')}
                </span>

                <span className="label text-zinc-500 uppercase">AUDIT:</span>
                <span className="value text-zinc-700 uppercase">
                    {isScrambling ? scrambleText(score.toString()) : `${score}% MATCH`}
                </span>
            </div>

            <div className={`stamp-layer absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden ${isGlitching ? 'glitch-active' : ''}`}>
                {shouldSlam && (
                    <img
                        src={getStampUrl()}
                        alt={typeCode}
                        className="stamp-img w-64 h-auto object-contain z-30 select-none"
                    />
                )}

                {inkDrops.map(drop => (
                    <div
                        key={drop.id}
                        className="ink-drop absolute rounded-full z-20"
                        style={{
                            backgroundColor: config.color,
                            width: drop.size,
                            height: drop.size,
                            left: '50%',
                            top: '50%',
                            mixBlendMode: 'multiply',
                            filter: 'blur(0.5px)',
                            '--x': `${drop.x}px`,
                            '--y': `${drop.y}px`,
                            '--duration': `${drop.duration}ms`,
                            '--delay': `${drop.delay}ms`
                        } as any}
                    />
                ))}
            </div>

            <div className="message-box border-t border-dashed border-zinc-300 pt-6 min-h-[140px] text-sm leading-relaxed text-zinc-800 relative z-10">
                <span className="whitespace-pre-wrap">{isScrambling ? scrambleText(displayedMessage) : displayedMessage}</span>
                {isTyping && <span className="cursor inline-block w-2 h-4 bg-zinc-800 ml-1 animate-pulse" />}
            </div>

            {/* BURN CONTROL */}
            {!isBurning ? (
                <div className="mt-8 flex justify-end relative z-20">
                    <button
                        onClick={startDestruction}
                        className="bg-black text-white text-[10px] font-black px-4 py-2 rounded uppercase tracking-[0.2em] hover:bg-red-700 transition-colors shadow-lg"
                    >
                        [ BURN RECORD ]
                    </button>
                </div>
            ) : (
                <div className="mt-8 text-right text-red-700 font-black text-xs animate-pulse tracking-widest z-20 relative">
                    AUTO-PURGE IN: {countdown.toFixed(2)}s
                </div>
            )}

            <style jsx>{`
                .report-card {
                    background-color: #f4f4f5;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.3), inset 0 0 100px rgba(0,0,0,0.05);
                    transition: transform 0.2s ease-out;
                }
                .shake {
                    animation: shake 0.2s cubic-bezier(.36,.07,.19,.97) both;
                }
                .stamp-img {
                    animation: slam 0.25s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
                    mix-blend-mode: multiply;
                    opacity: 0.9;
                }
                .ink-drop {
                    opacity: 0;
                    animation: splash var(--duration) ease-out var(--delay) forwards;
                }
                .glitch-active {
                    animation: rgb-split 0.1s infinite linear;
                }
                @keyframes slam {
                    0% { transform: scale(4) rotate(20deg); opacity: 0; }
                    100% { transform: scale(1) rotate(-15deg); opacity: 0.85; }
                }
                @keyframes splash {
                    0% { transform: translate(-50%, -50%) scale(0); opacity: 0.9; }
                    100% { transform: translate(calc(-50% + var(--x)), calc(-50% + var(--y))) scale(1); opacity: 0; }
                }
                @keyframes shake {
                    10%, 90% { transform: translate3d(-2px, 2px, 0); }
                    20%, 80% { transform: translate3d(4px, -4px, 0); }
                    30%, 50%, 70% { transform: translate3d(-6px, 6px, 0); }
                    40%, 60% { transform: translate3d(6px, -6px, 0); }
                }
                @keyframes rgb-split {
                    0% { text-shadow: 2px 0 #ef4444, -2px 0 #3b82f6; transform: translate(1px, 1px); }
                    25% { text-shadow: -2px 0 #ef4444, 2px 0 #3b82f6; transform: translate(-1px, -1px); }
                    50% { text-shadow: 1px 0 #ef4444, -1px 0 #3b82f6; transform: translate(-2px, 1px); }
                    75% { text-shadow: -1px 0 #ef4444, 1px 0 #3b82f6; transform: translate(2px, -1px); }
                    100% { text-shadow: 2px 0 #ef4444, -2px 0 #3b82f6; transform: translate(0, 0); }
                }
            `}</style>
        </div>
    );
};

export default SpyReportCard;

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

const SpyReportCard: React.FC<SpyReportCardProps> = ({ typeCode, spyMetadata, reportMessage, score }) => {
    const [displayedMessage, setDisplayedMessage] = useState('');
    const [isTyping, setIsTyping] = useState(true);
    const [shouldSlam, setShouldSlam] = useState(false);
    const [inkDrops, setInkDrops] = useState<InkDrop[]>([]);
    const [isShaking, setIsShaking] = useState(false);

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

    const triggerSlam = () => {
        // Generate ink drops
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

        //slam timing
        setTimeout(() => {
            setShouldSlam(true);
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 200);
        }, 150);
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

    return (
        <div className={`report-card font-mono text-left max-w-md mx-auto relative overflow-hidden bg-white p-8 border-2 border-zinc-900 shadow-2xl ${isShaking ? 'shake' : ''}`}>
            {/* Paper Texture Overlay */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/cardboard-flat.png')]" />

            {/* SILHOUETTE - Dossier Style */}
            <div className="absolute right-0 bottom-0 w-64 h-64 opacity-[0.05] pointer-events-none z-0 transform translate-x-10 translate-y-10">
                <img src="/assets/silhouettes/silhouette_hat_man.png" alt="" className="w-full h-full object-contain" />
            </div>

            <div className="header flex justify-between text-[10px] text-zinc-500 mb-6 border-b border-zinc-200 pb-2 relative z-10">
                <span>INTEL_AGENCY // TOP_SECRET</span>
                <span className="header-alert text-red-700 animate-pulse font-black">DO_NOT_DISTRIBUTE</span>
            </div>

            <div className="meta-grid grid grid-cols-[80px_1fr] gap-2 text-xs mb-8 relative z-10">
                <span className="label text-zinc-500 uppercase">STATUS:</span>
                <span className="value text-red-700 font-bold uppercase">{isTyping ? 'DECRYPTING...' : 'CLASSIFIED'}</span>

                <span className="label text-zinc-500 uppercase">ORIGIN:</span>
                <span className="value text-zinc-900 uppercase font-bold">{spyMetadata.origin.replace('_', ' ')}</span>

                <span className="label text-zinc-500 uppercase">SECTOR:</span>
                <span className="value text-zinc-900 uppercase font-bold">{spyMetadata.target.replace('_', ' ')}</span>

                <span className="label text-zinc-500 uppercase">AUDIT:</span>
                <span className="value text-zinc-700 uppercase">{score}% MATCH</span>
            </div>

            <div className="stamp-layer absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
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
                <span className="whitespace-pre-wrap">{displayedMessage}</span>
                {isTyping && <span className="cursor inline-block w-2 h-4 bg-zinc-800 ml-1 animate-pulse" />}
            </div>

            <style jsx>{`
                .report-card {
                    background-color: #f4f4f5; /* Off-white paper */
                    box-shadow: 0 20px 50px rgba(0,0,0,0.3), inset 0 0 100px rgba(0,0,0,0.05);
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
            `}</style>
        </div>
    );
};

export default SpyReportCard;

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { collection, getCountFromServer } from 'firebase/firestore';
import { getDb } from '@/lib/firebase';
import ShareButtons from './ShareButtons';

const AccessCounter = ({ count }: { count: number }) => {
    const digits = String(count).padStart(6, '0').split('');
    return (
        <div className="retro-counter-container">
            {digits.map((d, i) => (
                <span key={i} className="retro-counter-digit">{d}</span>
            ))}
        </div>
    );
};

interface RetroPortalProps {
    resultId: string;
    onDelete: () => void;
    onDownloadCard: () => void;
    voiceType: { name: string; icon: string; catchphrase: string };
    typeCode: string;
    cardImageUrl?: string | null;
}

export const RetroPortal = ({ resultId, onDelete, onDownloadCard, voiceType, typeCode, cardImageUrl }: RetroPortalProps) => {
    const [accessCount, setAccessCount] = useState(1234);

    useEffect(() => {
        const fetchCount = async () => {
            try {
                const db = getDb();
                const coll = collection(db, 'results');
                const snapshot = await getCountFromServer(coll);
                const realCount = snapshot.data().count;
                // Use real count without the huge "legacy" offset
                setAccessCount(realCount);
            } catch (e) {
                console.warn("Failed to fetch official count, using local seed", e);
                setAccessCount(prev => prev + Math.floor(Math.random() * 5));
            }
        };
        fetchCount();
    }, []);

    return (
        <div className="retro-portal-root">
            <style jsx>{`
                .retro-portal-root {
                    background-color: #000080; /* Classic Navy */
                    color: #00ff00; /* Matrix Green */
                    font-family: "MS PMincho", "MS Mincho", serif;
                    width: 100%;
                    padding: 0;
                    min-height: 100vh;
                    border: 10px ridge #ccc;
                    position: relative;
                    overflow-x: hidden;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                }

                .retro-header {
                   padding: 20px;
                   border-bottom: 2px solid #ccc;
                   background: #000040;
                }

                .retro-marquee {
                    background: #ff00ff;
                    color: #fff;
                    padding: 5px 0;
                    white-space: nowrap;
                    overflow: hidden;
                    border-bottom: 2px solid #fff;
                    font-weight: bold;
                    font-size: 14px;
                }

                .marquee-inner {
                    display: inline-block;
                    padding-left: 100%;
                    animation: marquee-retro 20s linear infinite;
                }

                @keyframes marquee-retro {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(-100%, 0); }
                }

                .retro-main {
                    flex-grow: 1;
                    padding: 60px 20px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 40px;
                }

                .wordart-rainbow {
                    font-size: 3rem;
                    font-weight: bold;
                    line-height: 1.2;
                    background: linear-gradient(to right, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #9400d3);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    filter: drop-shadow(4px 4px 0px rgba(0,0,0,0.8));
                    display: inline-block;
                    transform: scaleY(1.4) skewX(-10deg);
                    animation: wordart-float 3s ease-in-out infinite;
                }

                @keyframes wordart-float {
                    0%, 100% { transform: scaleY(1.4) skewX(-10deg) translateY(0); }
                    50% { transform: scaleY(1.4) skewX(-10deg) translateY(-10px); }
                }

                .retro-counter-container {
                    background: #333;
                    padding: 8px;
                    border: 3px double #ccc;
                    display: inline-flex;
                    gap: 2px;
                }

                .retro-counter-digit {
                    background: #000;
                    color: #ff0000;
                    font-family: 'Courier New', Courier, monospace;
                    font-size: 2rem;
                    padding: 0 4px;
                    border: 1px solid #444;
                    font-weight: bold;
                }

                .retro-controls-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                    width: 100%;
                    max-w: 600px;
                    margin-top: 40px;
                }

                .retro-btn {
                    padding: 15px;
                    font-weight: bold;
                    cursor: pointer;
                    font-size: 14px;
                    border: 4px outset #ccc;
                    background: #c0c0c0;
                    color: #000;
                    text-transform: uppercase;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 5px;
                }

                .retro-btn:active {
                    border-style: inset;
                }

                .btn-yellow { background: #ffff00; color: #ff0000; border-color: #ff00ff; }
                .btn-cyan { background: #00ffff; color: #000; }
                .btn-red { background: #ff0000; color: #fff; border-color: #800000; }
                .btn-green { background: #00ff00; color: #000; }

                .retro-blink {
                    animation: retro-blink 0.6s step-end infinite;
                }

                @keyframes retro-blink {
                    50% { opacity: 0.4; }
                }

                .retro-footer {
                    padding: 40px;
                    background: #000040;
                    border-top: 2px solid #ccc;
                    font-size: 11px;
                    color: #ccc;
                }

                .sparkles-layer {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                }
                
                /* Override ShareButtons styles to match retro theme */
                :global(.retro-share-container .glass) {
                    background: #000080 !important;
                    border: 4px inset #ccc !important;
                    border-radius: 0 !important;
                }
            `}</style>

            <div className="retro-marquee">
                <div className="marquee-inner">
                    ☆ Welcome to Elon's Diagnosis Portal! ☆ 火星に行く前に、まずは自分の声を聞け... ☆ 100万人目のキリ番踏んだらテスラ無料（嘘） ☆ IE6 推奨 ☆
                </div>
            </div>

            <div className="retro-header">
                <h1 className="text-2xl font-black italic tracking-widest text-yellow-400">
                    ETCHVOX MIRACLE SYSTEM v1.0
                </h1>
            </div>

            <main className="retro-main relative z-10">
                <div className="retro-wordart-title">
                    <span className="wordart-rainbow">
                        {voiceType.name}<br />
                        あなたは<br />
                        {accessCount}人目の<br />
                        迷い子です☆
                    </span>
                    <div className="text-white mt-4 font-bold text-xl bg-magenta-500 px-4 py-1 italic">
                        CODE: {typeCode}
                    </div>
                </div>

                <AccessCounter count={accessCount} />

                <div className="retro-controls-grid">
                    {/* 1. CARD */}
                    <button className="retro-btn btn-yellow retro-blink" onClick={onDownloadCard}>
                        <span className="text-2xl">📋</span>
                        <span>現像 / CARD</span>
                    </button>

                    {/* 4. HOME */}
                    <Link href="/" className="retro-btn btn-green">
                        <span className="text-2xl">🏠</span>
                        <span>帰還 / HOME</span>
                    </Link>

                    {/* 3. PURGE */}
                    <button className="retro-btn btn-red" onClick={() => {
                        if (confirm('この診断結果を抹消しますか？\n(消去されたデータは宇宙の塵になります)')) {
                            onDelete();
                        }
                    }}>
                        <span className="text-2xl">💣</span>
                        <span>抹消 / PURGE</span>
                    </button>

                    {/* Dummy/Decoration */}
                    <div className="retro-btn bg-black text-cyan-400 flex items-center justify-center border-dashed">
                        <span className="text-xs">STATUS: ONLINE</span>
                    </div>
                </div>

                {/* 2. SHARE */}
                <div className="w-full max-w-md retro-share-container mt-12">
                    <div className="text-xs text-yellow-400 font-bold mb-4 uppercase tracking-[0.3em]">
                        -- 電波を送受信 (SHARE) --
                    </div>
                    <ShareButtons
                        resultId={resultId}
                        typeName={voiceType.name}
                        typeIcon={voiceType.icon}
                        catchphrase={voiceType.catchphrase}
                        typeCode={typeCode}
                        cardImageUrl={cardImageUrl}
                    />
                </div>

                <div className="space-y-4">
                    <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">
                        ※ このサイトは 1999 年の未来から送信されています
                    </p>
                </div>
            </main>

            <footer className="retro-footer">
                (C) 2026 VOICETEK RESEARCH LAB / MARS COLONY
                <div className="mt-2 opacity-50">Recommended Resolution: 800x600</div>
            </footer>

            {/* Sparkles */}
            <div className="sparkles-layer">
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{
                            opacity: [0, 1, 0],
                            scale: [0, 1.2, 0],
                            x: [Math.random() * 800 - 400, Math.random() * 800 - 400],
                            y: [Math.random() * 800 - 400, Math.random() * 800 - 400]
                        }}
                        transition={{
                            duration: 2 + Math.random() * 2,
                            repeat: Infinity,
                            delay: Math.random() * 5
                        }}
                        className="absolute text-yellow-400 text-xl"
                        style={{
                            left: `${Math.random() * 80 + 10}%`,
                            top: `${Math.random() * 80 + 10}%`
                        }}
                    >
                        ✦
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

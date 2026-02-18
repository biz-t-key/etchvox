'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * UTILS: Text wrapping for Canvas 2D
 */
const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
        let testLine = line + words[n] + ' ';
        let metrics = ctx.measureText(testLine);
        if (metrics.width > maxWidth && n > 0) {
            ctx.fillText(line, x, y);
            line = words[n] + ' ';
            y += lineHeight;
        } else {
            line = testLine;
        }
    }
    ctx.fillText(line, x, y);
};

const waitForFonts = async () => {
    // Attempt to load premium fonts if they exist, otherwise fallback to system
    try {
        await document.fonts.load('italic 700 70px "Playfair Display"');
        await document.fonts.load('500 32px "Inter"');
        await document.fonts.load('500 24px "Space Mono"');
    } catch (e) {
        console.warn('Premium fonts failed to load, using system fallbacks.');
    }
    return document.fonts.ready;
};

interface ExportMetadata {
    archetypeCode: string;
    mbti: string;
    roast: string;
    isCouple?: boolean;
    isPaid?: boolean;
    price: number;
    partnerA?: string;
    partnerB?: string;
    relationshipLabel?: string;
}

export default function PremiumExporter({
    metadata,
    onCheckout,
    onUpgrade
}: {
    metadata: ExportMetadata;
    onCheckout: () => void;
    onUpgrade: () => void;
}) {
    const [phase, setPhase] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'UPSELL'>('IDLE');
    const [status, setStatus] = useState('');

    const generateGlobalCard = async (sourceCanvas: HTMLCanvasElement) => {
        // ... (rest of generateGlobalCard)
    };

    const generateGlobalVideo = async (sourceCanvas: HTMLCanvasElement) => {
        // ... (rest of generateGlobalVideo)
    };

    const handleExportFlow = async () => {
        if (!metadata.isPaid) {
            onCheckout();
            return;
        }

        const renderer = (window as any).etchvoxRenderer;
        if (!renderer || !renderer.domElement) {
            alert('Acoustic Nebula not ready for capture.');
            return;
        }

        setPhase('PROCESSING');
        setStatus('DISTILLING YOUR RESONANCE...');

        try {
            await new Promise(r => setTimeout(r, 500));
            await generateGlobalCard(renderer.domElement);
            setStatus('ENCODING CINEMATIC LOOP...');
            await generateGlobalVideo(renderer.domElement);
            setPhase('SUCCESS');
            setTimeout(() => {
                setPhase('UPSELL');
            }, 2500);
        } catch (err) {
            console.error(err);
            setPhase('IDLE');
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto relative px-4">
            <AnimatePresence>
                {/* Main Action Button */}
                {phase === 'IDLE' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="text-center">
                            <div className="inline-block px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-2">
                                <span className="text-cyan-400 font-mono text-xs">${metadata.price}</span>
                                <span className="text-white/30 text-[9px] ml-2 uppercase tracking-[0.2em] font-black">Authorized Export</span>
                            </div>
                        </div>

                        <button
                            onClick={handleExportFlow}
                            className="group relative w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-black py-8 px-8 rounded-[2.5rem] transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_25px_60px_-12px_rgba(6,182,212,0.5)] flex flex-col items-center gap-2"
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-lg">✨</span>
                                <span className="text-[10px] uppercase tracking-[0.4em] text-white/70">Master Distribution Kit</span>
                            </div>
                            <span className="text-2xl md:text-3xl uppercase tracking-tighter">Download Identity Kit</span>
                            <div className="text-xs opacity-80 font-medium">
                                Ultra-HD Assets • PNG + MP4
                            </div>
                        </button>

                    </motion.div>
                )}

                {/* Distilling Overlay */}
                {phase === 'PROCESSING' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="w-20 h-20 mb-10 border-t-2 border-cyan-500 rounded-full"
                        />
                        <p className="font-serif italic text-2xl tracking-[0.2em] text-cyan-400 animate-pulse">
                            {status}
                        </p>
                        <p className="text-[10px] text-white/30 uppercase tracking-[0.4em] mt-8 font-mono">
                            Bio-Signal Conversion in Progress
                        </p>
                    </motion.div>
                )}

                {/* Success Message */}
                {phase === 'SUCCESS' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center"
                    >
                        <div className="text-center">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="text-6xl mb-4"
                            >
                                💎
                            </motion.div>
                            <h2 className="text-white text-4xl font-black tracking-tighter mb-2 uppercase italic">Engraved.</h2>
                            <p className="text-white/50 text-xs uppercase tracking-widest font-bold">Identity Souvenirs saved to device.</p>
                        </div>
                    </motion.div>
                )}

                {/* Upsell Drawer */}
                {phase === 'UPSELL' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[110] bg-black/40 flex flex-col justify-end backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            className="bg-[#0a0a0a] border-t border-white/10 p-10 pt-6 rounded-t-[40px] shadow-[0_-20px_80px_rgba(0,0,0,0.8)]"
                        >
                            <div className="max-w-md mx-auto text-center flex flex-col items-center">
                                <div className="w-12 h-1 bg-white/10 rounded-full mb-8" />

                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-magenta-500 flex items-center justify-center mb-6 text-3xl shadow-lg ring-4 ring-white/5">
                                    👁️
                                </div>

                                <h3 className="text-2xl font-serif italic mb-4 text-white">The Mirror reveals more...</h3>
                                <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                                    Your visual card is just the surface. <br />
                                    We detected an <span className="text-cyan-400 font-bold italic">unusual frequency pattern</span> in your voice. Unlock the Deep Insight Report to decode your hidden traits.
                                </p>

                                <button
                                    onClick={onUpgrade}
                                    className="w-full py-5 bg-cyan-500 text-black font-black rounded-2xl hover:bg-cyan-400 transition-colors mb-6 text-lg shadow-[0_10px_30px_rgba(6,182,212,0.4)] active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest"
                                >
                                    <span>Unlock Deep Report</span>
                                    <span className="text-xs opacity-60">Complete Audit</span>
                                </button>

                                <button
                                    onClick={() => setPhase('IDLE')}
                                    className="text-gray-600 text-[10px] uppercase tracking-widest hover:text-white transition-colors py-2"
                                >
                                    Return to results
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

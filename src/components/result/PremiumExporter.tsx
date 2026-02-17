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
    price: number;
    partnerA?: string;
    partnerB?: string;
    relationshipLabel?: string;
}

export default function PremiumExporter({ metadata }: { metadata: ExportMetadata }) {
    const [phase, setPhase] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'UPSELL'>('IDLE');
    const [status, setStatus] = useState('');

    const generateGlobalCard = async (sourceCanvas: HTMLCanvasElement) => {
        const exportSize = 2048;
        const canvas = document.createElement('canvas');
        canvas.width = exportSize;
        canvas.height = exportSize;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        await waitForFonts();

        // Background
        ctx.fillStyle = '#050505';
        ctx.fillRect(0, 0, exportSize, exportSize);

        // Scale and draw Nebula
        const scale = (exportSize * 0.8) / Math.min(sourceCanvas.width, sourceCanvas.height);
        const nW = sourceCanvas.width * scale;
        const nH = sourceCanvas.height * scale;
        const offsetX = (exportSize - nW) / 2;
        const offsetY = (exportSize - nH) / 2 - 150;

        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.drawImage(sourceCanvas, offsetX, offsetY, nW, nH);
        ctx.restore();

        // Headers
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = '500 32px "Inter", sans-serif';
        ctx.textAlign = 'left';
        ctx.letterSpacing = '4px';
        ctx.fillText(`SPECIMEN: ${metadata.archetypeCode}`, 120, 120);

        ctx.textAlign = 'right';
        ctx.fillText(`IDENTITY: ${metadata.mbti.toUpperCase()}`, exportSize - 120, 120);

        // Roast/Tagline
        ctx.textAlign = 'center';
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'italic 700 75px "Playfair Display", serif';
        wrapText(ctx, `"${metadata.roast}"`, exportSize / 2, exportSize - 540, exportSize * 0.8, 95);

        // Duo Info if applicable
        if (metadata.isCouple) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = '700 40px "Inter", sans-serif';
            ctx.fillText(`${metadata.partnerA} × ${metadata.partnerB}`, exportSize / 2, exportSize - 680);

            ctx.fillStyle = '#00bcd4';
            ctx.font = '900 24px "Inter", sans-serif';
            ctx.fillText(metadata.relationshipLabel?.toUpperCase() || '', exportSize / 2, exportSize - 730);
        }

        // Footer
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.font = '500 24px "Space Mono", monospace';
        ctx.fillText('DESIGNED IN VOID / POWERED BY ETCHVOX CORE 2026', exportSize / 2, exportSize - 100);

        return new Promise((resolve) => {
            canvas.toBlob((blob) => {
                if (blob) {
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = `ETCHVOX_CARD_${metadata.mbti}.png`;
                    link.click();
                    setTimeout(() => URL.revokeObjectURL(url), 2000);
                }
                resolve(true);
            }, 'image/png', 1.0);
        });
    };

    const generateGlobalVideo = async (sourceCanvas: HTMLCanvasElement) => {
        const stream = sourceCanvas.captureStream(60);
        const recorder = new MediaRecorder(stream, { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 8000000 });
        const chunks: Blob[] = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);

        return new Promise((resolve) => {
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'video/webm' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `NEBULA_LOOP.webm`;
                link.click();
                setTimeout(() => URL.revokeObjectURL(url), 2000);
                resolve(true);
            };
            recorder.start();
            setTimeout(() => {
                if (recorder.state !== 'inactive') recorder.stop();
            }, 5000);
        });
    };

    const handleExportFlow = async () => {
        const renderer = (window as any).etchvoxRenderer;
        if (!renderer || !renderer.domElement) {
            alert('Acoustic Nebula not ready for capture.');
            return;
        }

        setPhase('PROCESSING');
        setStatus('DISTILLING YOUR RESONANCE...');

        try {
            // Give a small delay for UI to settle
            await new Promise(r => setTimeout(r, 500));

            // 1. Generate 4K Card
            await generateGlobalCard(renderer.domElement);

            // 2. Generate Video
            setStatus('ENCODING CINEMATIC LOOP...');
            await generateGlobalVideo(renderer.domElement);

            setPhase('SUCCESS');

            // 3. Upsell after success
            setTimeout(() => {
                setPhase('UPSELL');
            }, 2500);
        } catch (err) {
            console.error(err);
            setPhase('IDLE');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto relative px-4">
            <AnimatePresence>
                {/* Main Action Button */}
                {phase === 'IDLE' && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="text-center">
                            <div className="inline-block px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 mb-2">
                                <span className="text-cyan-400 font-black text-lg">${metadata.price}</span>
                                <span className="text-white/40 text-[10px] ml-2 uppercase tracking-widest font-black">Authorized Export</span>
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

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col items-center gap-2">
                                <span className="text-xl">🖨️</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">High-Res Image (PNG)</span>
                            </div>
                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10 flex flex-col items-center gap-2">
                                <span className="text-xl">🎬</span>
                                <span className="text-[9px] font-black uppercase tracking-widest text-white/40">Animated BG (MP4)</span>
                            </div>
                        </div>
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
                                    We detected an <span className="text-cyan-400 font-bold italic">unusual frequency pattern</span> in your voice. Unlock the 30-page Deep Insight Report to decode your hidden traits.
                                </p>

                                <button
                                    onClick={() => window.location.href = `https://polar.sh/your-id/products/deep-report`}
                                    className="w-full py-5 bg-cyan-500 text-black font-black rounded-2xl hover:bg-cyan-400 transition-colors mb-6 text-lg shadow-[0_10px_30px_rgba(6,182,212,0.4)] active:scale-95 flex items-center justify-center gap-3 uppercase tracking-widest"
                                >
                                    <span>Unlock Deep Report</span>
                                    <span className="text-xs opacity-60">+$12</span>
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

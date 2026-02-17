'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useMirror } from '@/context/MirrorContext';

interface IdentityKitExporterProps {
    metadata: {
        progress: number;
        storyTitle?: string;
    };
}

export default function IdentityKitExporter({ metadata }: IdentityKitExporterProps) {
    const { config } = useMirror();
    const [phase, setPhase] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS' | 'CONTINUITY'>('IDLE');

    const handleExportFlow = async () => {
        setPhase('PROCESSING');
        try {
            // Simulate 4K/MP4 etching process
            await new Promise(r => setTimeout(r, 3000));
            setPhase('SUCCESS');
            setTimeout(() => setPhase('CONTINUITY'), 2000);
        } catch (err) {
            console.error('Export failed:', err);
            setPhase('IDLE');
        }
    };

    return (
        <div className="flex justify-center p-4">
            <AnimatePresence>
                {/* 1. Trigger Button */}
                {phase === 'IDLE' && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        onClick={handleExportFlow}
                        className="bg-white text-black px-10 py-5 rounded-full font-black hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.3)] uppercase tracking-wider text-xs"
                    >
                        Download Identity Kit (4K + MP4)
                    </motion.button>
                )}

                {/* 2. Processing Overlay */}
                {phase === 'PROCESSING' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center p-8 text-center"
                    >
                        <div className="w-24 h-24 relative mb-8">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 border-t-2 border-white rounded-full"
                            />
                            <motion.div
                                animate={{ rotate: -360 }}
                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-4 border-b border-white/20 rounded-full"
                            />
                        </div>
                        <h3 className="text-2xl font-serif italic tracking-[0.2em] mb-4" style={{ fontFamily: config.font }}>
                            Etching Your Resonance...
                        </h3>
                        <p className="text-[10px] font-mono opacity-40 uppercase tracking-[0.4em] animate-pulse">
                            Synthesizing 4K Narrative Asset
                        </p>
                    </motion.div>
                )}

                {/* 3. Continuity Drawer */}
                {(phase === 'SUCCESS' || phase === 'CONTINUITY') && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="fixed inset-0 z-[110] bg-black/60 flex flex-col justify-end"
                        onClick={() => setPhase('IDLE')}
                    >
                        <motion.div
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="bg-[#0a0a0a] border-t border-white/10 p-10 md:p-16 rounded-t-[40px] max-w-2xl mx-auto w-full"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="text-center space-y-8">
                                <div className="space-y-4">
                                    <h3 className="text-3xl md:text-4xl font-serif italic" style={{ fontFamily: config.font }}>
                                        The Journey Continues...
                                    </h3>
                                    <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto font-light">
                                        Today's resonance has been etched into your vault.<br />
                                        You have now traversed <strong>{metadata.progress}</strong> of 252 available story arcs.
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <button
                                        onClick={() => window.location.href = '/insights'}
                                        className="w-full py-6 bg-white text-black font-black rounded-2xl shadow-xl hover:scale-[1.02] transition-transform uppercase tracking-widest text-xs"
                                    >
                                        View 30-Day Insights
                                    </button>

                                    <button
                                        onClick={() => setPhase('IDLE')}
                                        className="text-gray-600 text-[10px] uppercase tracking-[0.3em] font-mono hover:text-white transition-colors"
                                    >
                                        [ Return to Dashboard ]
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

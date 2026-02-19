import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TextureOverlay } from '../ui/TextureOverlay';

const ResonanceTestV2 = ({ onComplete }: { onComplete: (result: string) => void }) => {
    // 関係性によって挙動を変えるためのState
    const [relation, setRelation] = useState('COUPLE'); // COUPLE | RIVAL | BFF

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative p-10 min-h-screen flex flex-col items-center justify-between overflow-hidden"
            style={{
                backgroundImage: `radial-gradient(circle at center, #020617 0%, #000 100%)`,
                fontFamily: "'Inter', sans-serif"
            }}
        >
            <TextureOverlay />

            {/* --- HEADER: RELATIONSHIP SELECTOR --- */}
            <div className="relative z-20 flex gap-4 bg-zinc-900/50 p-1 border border-zinc-800 rounded-full mt-10">
                {['COUPLE', 'RIVAL', 'BFF'].map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setRelation(mode)}
                        className={`px-4 py-1 text-[9px] tracking-widest transition-all ${relation === mode ? 'text-white bg-zinc-700' : 'text-zinc-500 hover:text-zinc-300'} rounded-full`}
                    >
                        {mode}
                    </button>
                ))}
            </div>

            {/* --- THE COLLISION (二つの魂の衝突) --- */}
            <div className="relative w-full h-64 flex items-center justify-center">
                {/* User A: Indigo Pulse */}
                <motion.div
                    animate={relation === 'RIVAL' ? { x: [-10, 10, -10] } : { x: [0, 5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute left-1/4 w-48 h-48 rounded-full border border-blue-500/30 bg-blue-500/5 blur-xl"
                />

                {/* User B: Violet Pulse */}
                <motion.div
                    animate={relation === 'RIVAL' ? { x: [10, -10, 10] } : { x: [0, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    className="absolute right-1/4 w-48 h-48 rounded-full border border-purple-500/30 bg-purple-500/5 blur-xl"
                />

                {/* Interference Layer (中央の干渉) */}
                <div className="relative z-10 flex flex-col items-center">
                    <motion.div
                        animate={{
                            scale: relation === 'COUPLE' ? [1, 1.2, 1] : 1,
                            rotate: 360
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                        className="w-32 h-32 border-2 border-dashed border-white/20 rounded-full flex items-center justify-center"
                    >
                        {/* 中央の星：関係性の激しさを表す */}
                        <div className={`w-4 h-4 rotate-45 ${relation === 'RIVAL' ? 'bg-red-500 animate-ping' : 'bg-white animate-pulse'}`} />
                    </motion.div>
                </div>
            </div>

            {/* --- THE JOINT ROAST (二人への審判) --- */}
            <div className="relative z-20 text-center max-w-md">
                <span className="text-[10px] text-blue-400 font-mono tracking-[0.5em] mb-2 block uppercase">
                    Resonance_Sync: {relation === 'COUPLE' ? '82.4%' : relation === 'BFF' ? '94.1%' : '12.8%'}
                </span>

                <h2 className="text-2xl font-black italic tracking-tighter text-white mb-4">
                    BINARY_STAR_REPORT
                </h2>

                {/* モード別のRoastメッセージ */}
                <p className="text-[11px] leading-relaxed text-zinc-400 font-mono italic">
                    {relation === 'COUPLE' && '"A beautiful collapse. You don’t love each other; you just find it easier to dissolve than to exist separately."'}
                    {relation === 'RIVAL' && '"A nuclear stalemate. You only sharpen each other so you have something worth cutting."'}
                    {relation === 'BFF' && '"Synchronized stagnation. You are the same person in different fonts, repeating the same mistakes in perfect harmony."'}
                </p>

                {/* START BUTTON (Temporary) */}
                <button
                    onClick={() => onComplete(JSON.stringify({ type: 'DUO', mode: 'duo', label: 'BINARY_COLLAPSE', timestamp: new Date().toISOString() }))}
                    className="mt-6 px-6 py-2 border border-blue-900 text-blue-500 text-[8px] tracking-widest hover:text-white hover:bg-blue-900/30 transition-all font-bold"
                >
                    START_SYNC
                </button>
            </div>

            {/* --- FOOTER: DATA AXIS --- */}
            <div className="absolute bottom-6 flex justify-between w-full px-10 items-center">
                <div className="text-[7px] text-zinc-600 font-mono tracking-widest">
                    AXIS_01: {relation === 'COUPLE' ? 'MELT' : 'STRIKE'} <br />
                    AXIS_02: RESONANCE_SHIFT
                </div>
                <div className="text-right text-[10px] font-black text-white/50 italic">
                    ETCHVOX // DUO_v1
                </div>
            </div>
        </motion.div>
    );
};

export default ResonanceTestV2;

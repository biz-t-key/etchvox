import React from 'react';
import { motion } from 'framer-motion';
import { TextureOverlay } from '../ui/TextureOverlay';

const SoloAnalysisV2 = ({ onComplete }: { onComplete: (result: string) => void }) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative p-10 overflow-hidden min-h-screen flex flex-col items-center justify-center bg-black"
            style={{
                backgroundImage: `radial-gradient(circle at center, rgba(120, 53, 15, 0.15) 0%, black 80%)`,
                fontFamily: "'Lora', serif"
            }}
        >
            <TextureOverlay />

            {/* --- BACKGROUND GRID (高精細な座標軸) --- */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ backgroundImage: `linear-gradient(#451a03 1px, transparent 1px), linear-gradient(90deg, #451a03 1px, transparent 1px)`, backgroundSize: '40px 40px' }} />

            {/* --- THE NEBULA (中央の星雲) --- */}
            <div className="relative w-64 h-64 flex items-center justify-center">
                {/* 幾何学的な回転リング */}
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        animate={{ rotate: i % 2 === 0 ? 360 : -360 }}
                        transition={{ duration: 20 + i * 10, repeat: Infinity, ease: "linear" }}
                        className="absolute border border-amber-900/30 rounded-full"
                        style={{ width: `${100 + i * 20}%`, height: `${100 + i * 20}%` }}
                    />
                ))}

                {/* 生体発光するコア */}
                <motion.div
                    animate={{
                        scale: [1, 1.1, 1],
                        boxShadow: ["0 0 20px #78350f", "0 0 60px #d97706", "0 0 20px #78350f"]
                    }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="w-32 h-32 rounded-full bg-gradient-to-tr from-amber-900 via-amber-600 to-amber-200 opacity-80 blur-[2px]"
                />

                {/* 浮遊するデータチップ */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] text-amber-200/50 font-mono tracking-[1em] translate-x-2">SCANNING_SOUL</span>
                </div>
            </div>

            {/* --- THE ROAST DISPLAY (解析結果の表示) --- */}
            <div className="relative z-10 mt-12 text-center max-w-sm">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <span className="text-amber-600 text-[9px] tracking-[0.5em] font-bold uppercase mb-2 block">Archive_Record: #016_INFJ</span>
                    <h2 className="text-3xl font-light tracking-[0.2em] text-white mb-4 italic">THE_ETHEREAL_GHOST</h2>

                    {/* Roast: 美しいが痛い一文 */}
                    <p className="text-[11px] leading-relaxed text-amber-200/70 font-serif italic border-l border-amber-900 pl-4 py-2">
                        "Your voice carries the resonance of a thousand unread books.
                        A masterpiece of complexity, yet entirely lacking a single relatable chapter."
                    </p>
                </motion.div>
            </div>

            {/* --- FOOTER UI (座標データ) --- */}
            <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end border-t border-amber-900/30 pt-4">
                <div className="text-[8px] font-mono text-amber-900 leading-none">
                    LAT: 35.6895 <br />
                    LNG: 139.6917 <br />
                    Z-SCORE: 1.422
                </div>
                <div className="w-12 h-12 flex items-center justify-center border border-amber-900/50 rounded-full">
                    <div className="text-[10px] text-amber-500 font-bold">16</div>
                </div>
            </div>

            {/* START BUTTON (Temporary) */}
            <div className="absolute top-6 right-6">
                <button
                    onClick={() => onComplete(JSON.stringify({ type: 'SOLO', mode: 'solo', label: 'THE_GHOST', timestamp: new Date().toISOString() }))}
                    className="px-4 py-2 border border-amber-900 text-amber-700 text-[8px] tracking-widest hover:text-amber-500 hover:border-amber-500 transition-colors"
                >
                    INITIATE_SCAN
                </button>
            </div>
        </motion.div>
    );
};

export default SoloAnalysisV2;

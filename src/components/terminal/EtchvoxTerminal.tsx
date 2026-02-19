import React, { useState, useEffect } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { TextureOverlay } from '../ui/TextureOverlay';

// --- データ定義 ---
const DIAGNOSTICS = [
    { id: 'solo', title: 'SOLO ANALYSIS', tag: 'CLASSIC ARCHIVE' },
    { id: 'duo', title: 'RESONANCE TEST', tag: 'RESONANCE AXIS' },
    { id: 'elon', title: 'ELON MODE', tag: 'X-CALIBRATION' },
    { id: 'spy', title: 'SPY AUDITION', tag: 'AGENCY ACCESS' },
];

interface EtchvoxTerminalProps {
    lastResult: string | null;
    onSelectMode: (mode: string) => void;
}

const EtchvoxTerminal: React.FC<EtchvoxTerminalProps> = ({ lastResult, onSelectMode }) => {
    const [isPressing, setIsPressing] = useState(false);

    return (
        <div className="min-h-screen bg-black text-white font-mono flex flex-col overflow-x-hidden relative">
            <TextureOverlay />

            {/* --- UPPER WORLD --- */}
            <section className="relative h-[60vh] w-full flex flex-col items-center justify-center bg-gradient-to-b from-amber-900/20 to-black p-6">
                <div className="absolute top-10 text-[8px] tracking-[0.5em] text-amber-500/50 uppercase">
                    {lastResult ? "IDENTITY_DETECTED // SYSTEM_AWARE" : "Initial Calibration Phase"}
                </div>

                <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
                    {DIAGNOSTICS.map((item, index) => {
                        const angle = (index * 90) * (Math.PI / 180);
                        const radius = 140;
                        const x = Math.cos(angle) * radius;
                        const y = Math.sin(angle) * radius;

                        return (
                            <motion.button
                                key={item.id}
                                onClick={() => onSelectMode(item.id)}
                                whileHover={{ scale: 1.05, filter: "brightness(1.5)" }}
                                className="absolute flex flex-col items-center text-center w-32 p-2 bg-black/40 border border-zinc-800 backdrop-blur-sm rounded-sm group z-10"
                                style={{ left: `calc(50% + ${x}px - 64px)`, top: `calc(50% + ${y}px - 40px)` }}
                            >
                                <span className="text-[7px] text-zinc-500 mb-1 group-hover:text-amber-400 uppercase">{item.tag}</span>
                                <span className="text-[10px] font-bold leading-none tracking-tighter">{item.title}</span>
                            </motion.button>
                        );
                    })}

                    {/* 中央の装飾：診断結果によって変化 */}
                    <div className="w-24 h-24 rounded-full border border-amber-500/20 flex items-center justify-center relative">
                        <AnimatePresence mode="wait">
                            {lastResult ? (
                                <motion.div
                                    key="result"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex flex-col items-center"
                                >
                                    <span className="text-[7px] text-amber-600 mb-1 uppercase tracking-widest">Archive</span>
                                    <span className="text-xl font-black italic text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.5)]">
                                        {/* Parsing result if it's JSON, otherwise display as is */}
                                        {(() => {
                                            try {
                                                const parsed = JSON.parse(lastResult);
                                                return parsed.label || parsed.type || "UNKNOWN";
                                            } catch {
                                                return "ARCHIVED";
                                            }
                                        })()}
                                    </span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="ready"
                                    exit={{ opacity: 0, scale: 1.5 }}
                                    className="w-16 h-16 rounded-full border border-amber-500/40 animate-pulse flex items-center justify-center"
                                >
                                    <span className="text-[8px] text-amber-500">READY</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {/* 背景の波紋エフェクト（診断済みなら激しく） */}
                        <div className={`absolute inset-0 rounded-full border border-amber-500/10 ${lastResult ? 'animate-ping' : ''}`} />
                    </div>
                </div>
            </section>

            {/* --- THE BOUNDARY (OR / MORE DEEP?) --- */}
            <div className="relative z-10 w-full h-px bg-zinc-800 flex items-center justify-center">
                <motion.div
                    animate={{
                        scale: isPressing ? 1.5 : 1,
                        borderColor: lastResult ? "#f59e0b" : "#3f3f46",
                        color: lastResult ? "#f59e0b" : "#a1a1aa"
                    }}
                    className="bg-black border px-6 py-1 text-[10px] font-black tracking-[0.3em] uppercase transition-colors duration-500"
                >
                    {lastResult ? "MORE DEEP?" : "OR"}
                </motion.div>

                {/* 背景の波：診断済みなら不穏に */}
                <div className={`absolute w-full h-20 opacity-20 pointer-events-none overflow-hidden`}>
                    <div className={`w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat-x ${lastResult ? 'animate-[wave_1s_infinite_linear]' : 'animate-[wave_3s_infinite_linear]'}`} />
                </div>
            </div>

            {/* --- LOWER WORLD --- */}
            <section id="lower-mirror" className="relative h-[60vh] w-full flex flex-col items-center justify-center bg-gradient-to-t from-blue-900/20 to-black p-8 text-center overflow-hidden">
                {/* ベルベットのような質感のオーバーレイ */}
                <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-900/10 via-black to-black pointer-events-none" />

                <motion.div
                    animate={isPressing ? { y: -10, filter: "contrast(1.5) brightness(1.2)" } : {}}
                    className="max-w-md relative z-10"
                >
                    <span className="text-[8px] text-blue-400 mb-2 block tracking-[0.5em] uppercase font-light">The Sanctuary Protocol</span>
                    <h2 className="text-3xl font-black italic tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-800">
                        VOICE MIRROR
                    </h2>
                    <p className="text-[10px] text-zinc-500 leading-relaxed mb-10 tracking-widest uppercase">
                        {lastResult
                            ? `System detects resonance. Calibration is required for optimal output.`
                            : "Active Mindfulness. Etch your soul into the digital grid."}
                    </p>

                    <motion.div
                        onClick={() => onSelectMode('mirror')}
                        onMouseDown={() => setIsPressing(true)}
                        onMouseUp={() => setIsPressing(false)}
                        onTouchStart={() => setIsPressing(true)}
                        onTouchStartCapture={() => setIsPressing(true)}
                        onTouchEnd={() => setIsPressing(false)}
                        whileTap={{ scale: 0.98 }}
                        className="relative cursor-pointer select-none group"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    >
                        <div className="text-blue-100 text-[10px] font-bold tracking-[0.4em] uppercase py-5 px-10 border border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 transition-all duration-700 backdrop-blur-md">
                            {lastResult ? "UNVEIL YOUR TRUE RESONANCE" : "Meet the Unfiltered You"}
                        </div>

                        {/* プログレスバー */}
                        {isPressing && (
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: "100%" }}
                                transition={{ duration: 1.5, ease: "linear" }}
                                className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-blue-500 to-amber-500 shadow-[0_0_10px_#3b82f6]"
                            />
                        )}
                    </motion.div>
                </motion.div>
            </section>

            {/* --- FOOTER --- */}
            <footer className="p-6 flex justify-between text-[7px] text-zinc-700 font-mono tracking-widest uppercase mt-auto">
                <div className="flex gap-6">
                    <a href="#" className="hover:text-amber-500 transition-colors">Constraints</a>
                    <a href="#" className="hover:text-amber-500 transition-colors">Retention_Protocol</a>
                </div>
                <div>ETCHVOX // ALL SOULS RESERVED.</div>
            </footer>
        </div>
    );
};

export default EtchvoxTerminal;

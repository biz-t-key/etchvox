import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TextureOverlay } from '../ui/TextureOverlay';

const SpyAuditionV2 = ({ onComplete }: { onComplete: (result: string) => void }) => {
    // グリッチ演出用のステート
    const [glitch, setGlitch] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setGlitch(true);
            setTimeout(() => setGlitch(false), 150);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative p-8 overflow-hidden rounded-sm min-h-screen flex flex-col justify-center"
            style={{
                backgroundColor: '#050a05',
                backgroundImage: `radial-gradient(circle at center, #0a2010 0%, #050a05 100%)`,
                fontFamily: "'Courier Prime', monospace"
            }}
        >
            <TextureOverlay />

            {/* --- Rich Matrix Code Rain (奥行きのあるコードの雨) --- */}
            <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden select-none">
                {[...Array(15)].map((_, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: -100 }}
                        animate={{ y: ['0%', '100%'] }}
                        transition={{ duration: Math.random() * 5 + 5, repeat: Infinity, ease: "linear", delay: Math.random() * 2 }}
                        className="absolute text-[8px] font-mono whitespace-nowrap"
                        style={{
                            left: `${i * 7}%`,
                            color: i % 3 === 0 ? '#10b981' : '#064e3b',
                            writingMode: 'vertical-rl',
                            filter: `blur(${i % 2 === 0 ? '1px' : '0px'})`
                        }}
                    >
                        {Array(20).fill(0).map(() => Math.random().toString(36).substring(2, 3)).join('')}
                    </motion.div>
                ))}
            </div>

            <div className="relative z-10 w-full max-w-4xl mx-auto">
                {/* --- Header: Agency Protocol --- */}
                <div className="flex justify-between items-start mb-12">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
                            <span className="text-[9px] tracking-[0.4em] text-emerald-500 font-bold">AGENCY_ACCESS_PROTOCOL</span>
                        </div>
                        <span className="text-[7px] text-emerald-800 font-mono">ENCRYPTION: AES-256-BIT_QUALIFIED</span>
                    </div>
                    <div className="text-right">
                        <span className="text-[8px] text-emerald-600 block leading-none">SECURITY_LEVEL</span>
                        <span className="text-xs font-black text-emerald-500 italic uppercase tracking-tighter">Top Secret</span>
                    </div>
                </div>

                {/* --- Main Display: Biometric Integrity (中央のバイオメトリクス) --- */}
                <div className="my-6">
                    <motion.div
                        animate={glitch ? { x: [-2, 2, -1, 0], filter: "hue-rotate(90deg)" } : {}}
                        className="relative group cursor-crosshair"
                    >
                        {/* 伏せ字が解除されるような演出のタイトル */}
                        <h2 className="text-5xl md:text-6xl font-black tracking-tighter text-emerald-500/90 italic flex gap-4 items-center">
                            SPY_AUDITION
                            <span className="text-emerald-950 bg-emerald-500/10 px-1 border border-emerald-500/20 text-xs flex items-center h-4 font-mono not-italic tracking-normal">
                                v.7.2
                            </span>
                        </h2>

                        <div className="mt-8 flex flex-col gap-3 max-w-md">
                            {/* 解析中のプログレスバー群 */}
                            {[
                                { label: 'FIDELITY', val: '88%', w: 'w-[88%]' },
                                { label: 'PRESSURE', val: 'LO', w: 'w-[20%]' }
                            ].map((stat) => (
                                <div key={stat.label} className="w-full bg-emerald-950/30 border border-emerald-900/50 h-6 flex items-center px-3 relative overflow-hidden">
                                    <div className={`absolute left-0 top-0 h-full bg-emerald-500/20 ${stat.w} animate-pulse`} />
                                    <div className="relative z-10 flex justify-between w-full text-[8px] font-bold tracking-widest uppercase">
                                        <span>{stat.label}</span>
                                        <span className="text-emerald-400">{stat.val}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* --- Footer: Mission Context --- */}
                <div className="border-t border-emerald-900/40 pt-4 flex justify-between items-end mt-12">
                    <div className="max-w-[70%]">
                        <p className="text-[9px] text-emerald-700 leading-relaxed font-mono uppercase italic">
                            "Verify your cover under biometric scrutiny. No traces.
                            <span className="text-emerald-500 ml-1">Automatic data purge active upon failure.</span>"
                        </p>
                    </div>
                    {/* 指紋認証イメージのアイコン（CSSのみ） */}
                    <div className="w-8 h-10 border-2 border-emerald-500/30 rounded-full flex flex-col items-center justify-center gap-1 opacity-50">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="w-4 h-[1px] bg-emerald-500/60" style={{ width: `${100 - i * 15}%` }} />
                        ))}
                    </div>
                </div>

                {/* START BUTTON (Temporary for mock) */}
                <button
                    onClick={() => onComplete(JSON.stringify({ type: 'SPY', mode: 'spy', label: 'DOUBLE_AGENT', timestamp: new Date().toISOString() }))}
                    className="mt-8 px-8 py-4 bg-emerald-600/20 border border-emerald-500/50 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all text-xs font-bold tracking-[0.3em] uppercase"
                >
                    VERIFY_IDENTITY
                </button>
            </div>

            {/* --- Scanning Effect (スキャン線) --- */}
            <motion.div
                animate={{ top: ['-10%', '110%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="absolute left-0 right-0 h-10 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent pointer-events-none z-20"
            />
        </motion.div>
    );
};

export default SpyAuditionV2;

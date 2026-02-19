import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TextureOverlay } from '../ui/TextureOverlay';

const VoiceMirrorPricing = () => {
    const [selectedArchetype, setSelectedArchetype] = useState('philosophy');

    const archetypes = [
        { id: 'philosophy', name: 'PHILOSOPHY', color: 'border-amber-500/50', bg: 'bg-amber-950/10' },
        { id: 'thriller', name: 'THRILLER', color: 'border-emerald-500/50', bg: 'bg-emerald-950/10' },
        { id: 'poetic', name: 'POETIC', color: 'border-purple-500/50', bg: 'bg-purple-950/10' },
        { id: 'cinematic', name: 'CINEMATIC', color: 'border-orange-500/50', bg: 'bg-orange-950/10' },
    ];

    return (
        <div className="relative min-h-screen w-full bg-[#020617] text-white font-sans overflow-hidden p-6 md:p-20">
            {/* 深淵の背景グラデーション */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(15,23,42,0.5)_0%,#000_100%)]" />
            <TextureOverlay />

            {/* --- HEADER --- */}
            <header className="relative z-10 text-center mb-16">
                <motion.h1
                    animate={{ opacity: [0.8, 1, 0.8] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="text-5xl md:text-7xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-blue-100 to-blue-900 mb-2"
                >
                    VOICE MIRROR
                </motion.h1>
                <p className="text-[10px] tracking-[0.8em] text-blue-400 uppercase opacity-60">Daily Bio-Acoustic Self-Tracking</p>
            </header>

            <div className="relative z-10 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">

                {/* --- LEFT: STEP BY STEP --- */}
                <section className="space-y-12">
                    <div>
                        <span className="text-blue-500 font-mono text-xs tracking-widest block mb-4 underline decoration-blue-500/30 underline-offset-8 uppercase">01. Select Archetype</span>
                        <h2 className="text-3xl font-serif italic mb-4">Choose Your Mirror</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {archetypes.map((a) => (
                                <button
                                    key={a.id}
                                    onClick={() => setSelectedArchetype(a.id)}
                                    className={`p-4 border ${selectedArchetype === a.id ? a.color : 'border-zinc-800'} ${a.bg} backdrop-blur-md transition-all duration-500 text-left group`}
                                >
                                    <span className={`text-[9px] tracking-widest ${selectedArchetype === a.id ? 'text-white' : 'text-zinc-600'} transition-colors`}>{a.name}</span>
                                    <div className={`h-px w-full mt-2 ${selectedArchetype === a.id ? 'bg-current' : 'bg-transparent'} opacity-30`} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="opacity-40">
                        <span className="text-zinc-500 font-mono text-xs tracking-widest block mb-2 uppercase">02. Daily Etching</span>
                        <p className="text-xs text-zinc-400 font-light leading-relaxed">Capture deep exhales and intentional pauses as high-fidelity biometric data.</p>
                    </div>

                    <div className="opacity-40">
                        <span className="text-zinc-500 font-mono text-xs tracking-widest block mb-2 uppercase">03. Final Synthesis</span>
                        <p className="text-xs text-zinc-400 font-light leading-relaxed">Every tremor and shift is visually mapped into a cinematic dossier.</p>
                    </div>
                </section>

                {/* --- RIGHT: PRICING (THE KEYS) --- */}
                <section className="flex flex-col gap-6">
                    {/* 7-DAY PASS (VELVET MATERIAL) */}
                    <div className="relative group p-8 border border-zinc-800 bg-zinc-950/40 backdrop-blur-xl rounded-sm hover:border-zinc-600 transition-all duration-700 overflow-hidden">
                        <div className="relative z-10 flex justify-between items-end mb-10">
                            <div>
                                <h3 className="text-xl font-bold tracking-[0.2em] italic mb-1">7-DAY RESONANCE KEY</h3>
                                <span className="text-[8px] text-zinc-500 tracking-widest uppercase">Standard Identity Access</span>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-mono font-black">$7</span>
                                <span className="block text-[7px] text-zinc-500 uppercase tracking-tighter">One-Time-Key</span>
                            </div>
                        </div>
                        <ul className="relative z-10 space-y-3 mb-10">
                            {['1 Reading Session / Day', 'AI Oracle Analysis', '7-Day Biometric Record'].map(item => (
                                <li key={item} className="text-[10px] text-zinc-400 flex items-center gap-2 tracking-wide uppercase">
                                    <div className="w-1 h-1 bg-blue-500 rounded-full" /> {item}
                                </li>
                            ))}
                        </ul>
                        <button className="relative z-10 w-full py-4 border border-zinc-700 bg-white text-black text-[10px] font-black tracking-[0.4em] uppercase hover:bg-zinc-200 transition-all">
                            Acquire Access
                        </button>
                        {/* ベルベットの光沢エフェクト */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-900/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
                    </div>

                    {/* 30-DAY PASS (MACHINED GOLD) */}
                    <div className="relative group p-8 border-2 border-blue-500/50 bg-[#0a1a2f]/40 backdrop-blur-xl rounded-sm shadow-[0_0_30px_rgba(59,130,246,0.1)] overflow-hidden">
                        {/* 最適化ラベル（ステッカー風） */}
                        <div className="absolute top-4 right-[-30px] bg-blue-500 text-[#000] text-[7px] font-black px-10 py-1 rotate-45 tracking-tighter uppercase shadow-lg">
                            Optimized Value
                        </div>

                        <div className="relative z-10 flex justify-between items-end mb-10">
                            <div>
                                <h3 className="text-xl font-bold tracking-[0.2em] italic mb-1 text-blue-100">30-DAY TOTAL CALIBRATION</h3>
                                <span className="text-[8px] text-blue-400 tracking-widest uppercase font-bold">Full Deep-Dive Sequence</span>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-mono font-black text-white">$15</span>
                                <span className="block text-[7px] text-blue-500 uppercase tracking-tighter font-bold">Save 46% vs 7-Day</span>
                            </div>
                        </div>
                        <ul className="relative z-10 space-y-3 mb-10">
                            {['Full Extended Trends', 'Priority Biometric Analysis', '30-Day Permanent Record'].map(item => (
                                <li key={item} className="text-[10px] text-blue-200/70 flex items-center gap-2 tracking-wide uppercase font-medium">
                                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(96,165,250,0.5)]" /> {item}
                                </li>
                            ))}
                        </ul>
                        <button className="relative z-10 w-full py-5 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-[10px] font-black tracking-[0.5em] uppercase shadow-[0_4px_15px_rgba(30,64,175,0.4)] hover:brightness-110 transition-all overflow-hidden group">
                            <span className="relative z-10">Initiate Full Sequence</span>
                            {/* ボタン内のハイライト光 */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        </button>
                    </div>
                </section>
            </div>

            {/* --- FOOTER: RESTORE LINKS --- */}
            <footer className="relative z-10 mt-20 text-center space-y-4">
                <button className="text-[9px] text-zinc-600 tracking-[0.3em] uppercase hover:text-zinc-400 transition-colors">
                    Already purchased? Refresh session
                </button>
                <div className="h-px w-20 bg-zinc-800 mx-auto" />
                <p className="text-[8px] text-zinc-700 tracking-widest uppercase">Multi-device? Restore from encrypted email</p>
            </footer>
        </div>
    );
};

export default VoiceMirrorPricing;

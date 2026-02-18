'use client';

import { motion } from 'framer-motion';

interface DuoResonanceHookProps {
    resonance: {
        pitch_overlap: number;
        pause_entropy: number;
        turn_taking_latency: number;
        spectral_convergence: number;
        stress_covariance: number;
    };
}

export default function DuoResonanceHook({ resonance }: DuoResonanceHookProps) {
    if (!resonance) return null;

    const syncScore = Math.floor(resonance.pitch_overlap * 100);
    const latency = Math.floor(resonance.turn_taking_latency);
    const harmony = Math.floor(resonance.spectral_convergence * 100);

    let tier: 'high' | 'tension' | 'neutral' = 'neutral';
    if (resonance.pitch_overlap > 0.7) tier = 'high';
    else if (resonance.pitch_overlap < 0.45) tier = 'tension';

    const getContent = () => {
        switch (tier) {
            case 'high':
                return {
                    label: 'Anomalous Phase Sync Detected',
                    hook: `二人の声は、生物学的な限界を超えて ${syncScore}% 重なり合っています。特に ${latency}ms という呼吸のような合間（レイテンシ）に潜む「非言語の合意」が極めて異常です。`,
                    sub: 'この共宇宙の全貌を解読しますか？'
                };
            case 'tension':
                return {
                    label: 'Vocal Interference Pattern',
                    hook: `これは不協和音ではなく、計算された主導権争いです。波形の乱れが、どちらかが ${(100 - harmony)}% のエネルギーを無意識に抑制していることを示唆しています。`,
                    sub: '均衡を破っているのは誰か、暴きましょう。'
                };
            default:
                return {
                    label: 'Dynamic Equilibrium identified',
                    hook: `表面上のリズムは ${syncScore}% の一致を見せていますが、深層テクスチャには明確な境界線が引かれています。礼儀正しさの裏に隠された「真の距離感」が検出されました。`,
                    sub: 'AIによる深層監査を開示しますか？'
                };
        }
    };

    const content = getContent();

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full max-w-2xl mx-auto px-4 py-16"
        >
            <div className="relative glass rounded-[3rem] p-8 md:p-12 border border-pink-500/20 bg-gradient-to-br from-pink-500/5 to-cyan-500/5 overflow-hidden">
                {/* Decorative scanning line */}
                <motion.div
                    animate={{ y: ['0%', '400%', '0%'] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                    className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-pink-500/40 to-transparent z-0 opacity-30"
                />

                <div className="relative z-10 space-y-6">
                    <div className="flex items-center gap-3">
                        <span className="flex h-2 w-2 rounded-full bg-pink-500 animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-400 opacity-60">
                            {content.label}
                        </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-serif italic text-white leading-relaxed">
                        {content.hook}
                    </h3>

                    <p className="text-xs font-black uppercase tracking-widest text-cyan-400 opacity-80">
                        {content.sub}
                    </p>
                </div>
            </div>
        </motion.div>
    );
}

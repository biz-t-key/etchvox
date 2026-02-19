import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { TextureOverlay } from '../ui/TextureOverlay';

// 浮遊する光の粒子コンポーネント
const Particle = ({ delay, x, y }: { delay: number, x?: string | number, y?: string | number }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{
            opacity: [0, 0.8, 0],
            scale: [0.5, 1, 0.5],
            y: typeof y === 'number' ? [y, y - 50] : y ? undefined : [-50, 0, -50],
            x: typeof x === 'number' ? [x, x + 20, x] : 0
        }}
        transition={{
            duration: Math.random() * 5 + 8, // 8〜13秒かけてゆっくり動く
            repeat: Infinity,
            delay: delay,
            ease: "easeInOut"
        }}
        className="absolute w-1 h-1 bg-blue-200 rounded-full blur-[1px] pointer-events-none shadow-[0_0_5px_2px_rgba(191,219,254,0.3)]"
        style={{ left: x || '50%', top: y || '50%' }}
    />
);

interface VoiceMirrorVelvetProps {
    onEnter: () => void;
}

const VoiceMirrorVelvet: React.FC<VoiceMirrorVelvetProps> = ({ onEnter }) => {
    const [isPressing, setIsPressing] = React.useState(false);

    return (
        <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">

            {/* --- LAYER 1: 複雑なベースグラデーション (墨・紺・深緑) --- */}
            <div
                className="absolute inset-0 w-full h-full"
                style={{
                    background: `
            radial-gradient(circle at 50% 30%, rgba(2, 48, 32, 0.4) 0%, transparent 60%), /* 深緑の光 */
            radial-gradient(circle at 80% 80%, rgba(25, 25, 112, 0.5) 0%, transparent 50%), /* 深い紺 */
            linear-gradient(to bottom, #0a0a0a, #020617, #011627) /* 墨から深い青へのベース */
          `,
                    backgroundBlendMode: 'screen, screen, normal' // レイヤーを柔らかく重ねる
                }}
            />

            {/* --- LAYER 2: ベルベットの質感（ノイズフィルター） --- */}
            <TextureOverlay />

            {/* --- LAYER 3: 柔らかいライティング（ヴィネット効果） --- */}
            <div className="absolute inset-0 w-full h-full bg-[radial-gradient(circle_at_center,transparent_10%,rgba(0,0,0,0.8)_90%)] pointer-events-none" />

            {/* --- LAYER 4: 上品なキラキラ（浮遊する粒子） --- */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {[...Array(15)].map((_, i) => (
                    <Particle
                        key={i}
                        delay={i * 0.7}
                        x={`${Math.random() * 100}%`}
                        y={`${Math.random() * 100}%`}
                    />
                ))}
            </div>

            {/* --- LAYER 5: コンテンツ（テキストとボタン） --- */}
            <div className="relative z-10 text-center p-8 max-w-md">
                {/* ボタンを押した時の反応（全体が少し明るくなる） */}
                <motion.div
                    animate={isPressing ? { filter: "brightness(1.2) contrast(1.1)" } : {}}
                    className="transition-all duration-500"
                >
                    <span className="text-[9px] text-blue-300/70 tracking-[0.6em] uppercase mb-4 block font-light">The Sanctuary Protocol</span>
                    <h2 className="text-4xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-blue-100 to-blue-900 mb-6 drop-shadow-sm">
                        VOICE MIRROR
                    </h2>
                    <p className="text-xs text-blue-200/60 leading-relaxed font-light tracking-wider mb-10">
                        Dive into the velvet silence. Etch your soul into the digital grid through a 7-day resonance program.
                    </p>

                    {/* 長押しボタン（デザイン調整） */}
                    <motion.div
                        onMouseDown={() => setIsPressing(true)}
                        onMouseUp={() => { setIsPressing(false); onEnter(); }}
                        onTouchStart={() => setIsPressing(true)}
                        onTouchEnd={() => { setIsPressing(false); onEnter(); }}
                        whileTap={{ scale: 0.98 }}
                        className="relative cursor-pointer select-none group inline-block"
                    >
                        <div className="relative z-10 text-blue-100 text-sm font-bold tracking-[0.3em] uppercase py-4 px-10 border border-blue-400/30 bg-blue-950/30 rounded-sm backdrop-blur-md group-hover:bg-blue-900/40 group-hover:border-blue-400/50 transition-all duration-500 shadow-[0_0_15px_rgba(30,64,175,0.1)]">
                            Meet the Unfiltered You
                        </div>
                        {/* ボタンの背後で光るエフェクト */}
                        <div className="absolute inset-0 bg-blue-400/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-sm" />

                        {/* プログレスバー */}
                        {isPressing && (
                            <motion.div
                                initial={{ width: 0, opacity: 0.5 }}
                                animate={{ width: "100%", opacity: 1 }}
                                transition={{ duration: 1.5, ease: "linear" }}
                                className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-blue-400 to-emerald-400 shadow-[0_0_10px_#3b82f6]"
                            />
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
};

export default VoiceMirrorVelvet;

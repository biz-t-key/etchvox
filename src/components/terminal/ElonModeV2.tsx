import React from 'react';
import { motion } from 'framer-motion';
import { TextureOverlay } from '../ui/TextureOverlay';

const ElonModeV2 = ({ onComplete }: { onComplete: (result: string) => void }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        // コンテナ全体：火星の地表と金属的な反射
        className="relative p-8 overflow-hidden rounded-sm font-black group min-h-screen flex flex-col justify-center"
        style={{
            // 背景：火星の赤茶から深宇宙へのグラデーション
            backgroundImage: `
        radial-gradient(circle at top right, rgba(180, 83, 9, 0.4), transparent 70%),
        linear-gradient(to bottom, #1c1917, #0c0a09)
      `,
            fontFamily: "'JetBrains Mono', monospace"
        }}
    >
        <TextureOverlay />

        {/* 金属的なボーダー（水銀のような反射光） */}
        <div className="absolute inset-0 border-2 border-transparent rounded-sm pointer-events-none"
            style={{
                background: `linear-gradient(135deg, #d1d5db 0%, #6b7280 50%, #1f2937 100%) border-box`,
                WebkitMask: `linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0)`,
                WebkitMaskComposite: 'xor',
                maskComposite: 'exclude'
            }}
        />

        {/* ヘッダー部分 */}
        <div className="flex justify-between items-start mb-10 relative z-10 w-full max-w-4xl mx-auto">
            {/* タグ：ステンレスのプレートに刻印されたような質感 */}
            <span className="px-3 py-1 text-[8px] tracking-widest text-zinc-300 bg-gradient-to-r from-zinc-800 to-zinc-900 border border-zinc-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                X-CALIBRATION // MARS_LINK
            </span>
            {/* ステータス：冷たい青白い光（スターシップのエンジン光イメージ） */}
            <motion.span
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-blue-200 drop-shadow-[0_0_5px_rgba(147,197,253,0.5)] tracking-tight text-xs"
            >
                STATUS: ORBITAL_ENTRY
            </motion.span>
        </div>

        {/* メインコンテンツ */}
        <div className="relative z-10 w-full max-w-4xl mx-auto">
            {/* タイトル：金属的な光沢と立体感 */}
            <h2 className="text-5xl md:text-7xl italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-300 to-zinc-500 drop-shadow-sm mb-6">
                ELON_AUDIT<span className="text-zinc-600">_v2</span>
            </h2>

            {/* ビジュアライザー：水銀が波打つような表現 */}
            <div className="h-32 border-b border-zinc-800 flex items-end gap-[2px] overflow-hidden p-2 bg-zinc-950/50 backdrop-blur-sm relative">
                {[...Array(24)].map((_, i) => (
                    <motion.div
                        key={i}
                        // 高さだけでなく、色も変化させて液体金属感を出す
                        animate={{
                            height: ['10%', '70%', '20%', '90%', '10%'],
                            backgroundColor: ['#3f3f46', '#d1d5db', '#9ca3af', '#e5e7eb', '#3f3f46']
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.08,
                            ease: "easeInOut"
                        }}
                        // 水銀のような質感のグラデーション
                        className="flex-1 rounded-t-sm bg-gradient-to-t from-zinc-700 via-zinc-400 to-white opacity-80 shadow-[0_-2px_10px_rgba(255,255,255,0.2)]"
                    />
                ))}
                {/* 走査線のエフェクト */}
                <motion.div
                    animate={{ top: ['0%', '100%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-0 w-full h-[2px] bg-blue-400/50 blur-sm drop-shadow-[0_0_5px_rgba(59,130,246,1)]"
                />
            </div>

            {/* フッターテキスト */}
            <p className="mt-6 text-xs text-zinc-400 font-mono tracking-widest leading-relaxed uppercase">
                <span className="text-amber-700/80 mr-2">[MARS_SURFACE_DATA]</span>
                Analyze through first principles. Purge all inefficient vocal signals.
            </p>

            {/* START BUTTON (Temporary for mock) */}
            <button
                onClick={() => onComplete(JSON.stringify({ type: 'ELON', mode: 'elon', label: 'MARS_ARCHITECT', timestamp: new Date().toISOString() }))}
                className="mt-12 px-8 py-4 bg-orange-600/20 border border-orange-500/50 text-orange-500 hover:bg-orange-500 hover:text-white transition-all text-xs font-bold tracking-[0.3em] uppercase"
            >
                INITIATE_PROTOCOL
            </button>
        </div>

        {/* 背景のインタラクティブなエフェクト */}
        <div className="absolute inset-0 bg-amber-900/10 mix-blend-color-dodge opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
    </motion.div>
);

export default ElonModeV2;

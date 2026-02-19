import React from 'react';
import { TextureOverlay } from '../ui/TextureOverlay';

interface MobileOptimizedResultProps {
    mode: string;
    resultData: any;
    onClose: () => void;
}

const MobileOptimizedResult: React.FC<MobileOptimizedResultProps> = ({ mode, resultData, onClose }) => {
    return (
        <div className="relative min-h-screen bg-black text-white font-mono flex flex-col overflow-x-hidden">
            <TextureOverlay />

            {/* --- 1. FIXED HEADER (常に位置を把握させる) --- */}
            <div className="sticky top-0 z-50 w-full bg-black/80 backdrop-blur-md p-4 border-b border-zinc-900 flex justify-between items-center">
                <span className="text-[10px] text-zinc-500 tracking-widest uppercase">Result_Dossier</span>
                <button
                    onClick={onClose}
                    className="text-[10px] text-amber-500 font-bold tracking-tighter uppercase"
                >
                    Close
                </button>
            </div>

            {/* --- 2. HERO SECTION (星雲) --- */}
            {/* スマホでは「最初のインパクト」として使い、スクロールすると消す設定 */}
            <section className="h-[50vh] flex flex-col items-center justify-center p-6 bg-gradient-to-b from-zinc-900/20 to-black relative">
                <div className="relative w-40 h-40 flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full blur-2xl opacity-40 animate-pulse" style={{ backgroundColor: mode === 'solo' ? '#D97706' : '#6366F1' }} />
                    <span className="relative z-10 text-3xl font-black italic">{resultData?.type || "ANALYZING..."}</span>
                </div>
                <p className="mt-4 text-[9px] text-zinc-500 tracking-[0.4em] uppercase">Neural Signal Captured</p>
            </section>

            {/* --- 3. THE VERDICT (Roastカード) --- */}
            {/* ここは「ベタ打ち」で、背景が透けないようにして読みやすさを最優先 */}
            <section className="px-6 py-10 bg-black relative z-20">
                <div className="border-l-2 border-zinc-700 pl-4 py-2 mb-8">
                    <p className="text-xl font-serif italic text-zinc-100 leading-snug">
                        "{resultData?.roast || "Your voice signal was too complex for standard deciphering. Or perhaps just too boring."}"
                    </p>
                </div>

                {/* --- 4. DATA PLOT (チャート) --- */}
                {/* スマホではカードの下に配置して「証拠」として見せる */}
                <div className="w-full h-48 border border-zinc-900 rounded-sm mb-12 flex items-center justify-center text-[8px] text-zinc-700">
                    [ NEURAL_CHART_VISUALIZATION_ACTIVE ]
                </div>
            </section>

            {/* --- 5. MONETIZATION & ACTIONS (購入と戻る) --- */}
            {/* 押しやすさを重視。ボタンの間隔（余白）を広く取る */}
            <section className="px-6 pb-20 space-y-4 relative z-20 bg-black">
                <div className="grid grid-cols-1 gap-3">
                    <button className="w-full py-5 bg-zinc-100 text-black text-[10px] font-black tracking-[0.5em] uppercase shadow-lg">
                        Share_Resonance
                    </button>

                    <div className="grid grid-cols-2 gap-3">
                        <button className="py-4 border border-amber-900 bg-amber-950/20 text-amber-500 text-[8px] font-bold">EXPAND_REPORT</button>
                        <button className="py-4 border border-zinc-800 text-zinc-500 text-[8px] font-bold uppercase" onClick={onClose}>
                            Return_to_Top
                        </button>
                    </div>
                </div>

                {/* 最下部の危険地帯 */}
                <div className="pt-10 flex justify-center">
                    <button className="text-[7px] text-zinc-800 uppercase tracking-widest border-b border-zinc-900">
                        Destroy_Dossier_Permanently
                    </button>
                </div>
            </section>

            {/* スマホ特有の「戻れない」を防ぐための最下部余白 */}
            <div className="h-20 w-full" />
        </div>
    );
};

export default MobileOptimizedResult;

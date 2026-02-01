'use client';

import React from 'react';

// エラー発生時に表示するコンポーネント
const MarsMigrationError = ({ onDismiss }: { onDismiss: () => void }) => {
    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black overflow-hidden font-sans">

            {/* 1. 背景：火星っぽい赤黒いグラデーション */}
            <div className="absolute inset-0 bg-gradient-to-tr from-red-900 via-black to-black opacity-90 animate-pulse" />

            {/* 2. メインコンテンツ（前面） */}
            <div className="relative z-10 text-center px-4 max-w-lg border-2 border-red-500 p-8 bg-black/80 backdrop-blur-sm shadow-[0_0_50px_rgba(220,38,38,0.5)]">
                <h2 className="text-5xl font-black text-red-500 tracking-tighter mb-4 glitch-text">
                    SYSTEM MELTDOWN
                </h2>

                <p className="text-gray-300 text-lg mb-6 font-mono leading-relaxed">
                    Too much traffic. <br />
                    Our database grabbed some <span className="text-yellow-400 font-bold">$DOGE</span> and took a Starship to Mars. 🚀
                </p>

                <div className="bg-red-900/30 border border-red-500/50 p-4 rounded mb-8 text-sm text-red-300 font-mono">
                    STATUS: <span className="animate-blink">MIGRATING TO MARS...</span><br />
                    DATA SAVED: FALSE<br />
                    ROAST SERVED: TRUE
                </div>

                <button
                    onClick={onDismiss}
                    className="group relative px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95"
                >
                    Wave Goodbye 👋
                </button>
            </div>

            {/* 3. アニメーション要素（ロケット・犬・DODGE文字） */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {/* ロケット */}
                <div className="absolute text-6xl animate-fly-to-mars left-[-10%] bottom-[-10%]" style={{ animationDelay: '0s' }}>
                    🚀
                </div>

                {/* DOGE (犬) */}
                <div className="absolute text-6xl animate-fly-to-mars left-[-10%] bottom-[-10%]" style={{ animationDelay: '0.5s' }}>
                    🐕
                </div>

                {/* 文字列 DODGE - 回転しながら飛ぶ */}
                <div className="absolute text-4xl font-bold text-yellow-500 animate-spin-fly left-[-10%] bottom-[-10%]" style={{ animationDelay: '0.8s' }}>
                    DODGE
                </div>

                {/* DBアイコン */}
                <div className="absolute text-5xl animate-fly-to-mars left-[-10%] bottom-[-10%]" style={{ animationDelay: '0.2s' }}>
                    🗄️
                </div>
            </div>

            <style jsx>{`
        .glitch-text {
          text-shadow: 2px 0 #fff, -2px 0 #ff00c1;
        }
        .animate-blink {
          animation: blink 1s step-end infinite;
        }
        
        @keyframes flyToMars {
          0% {
            transform: translate(0, 0) scale(1) rotate(45deg);
            opacity: 1;
          }
          100% {
            transform: translate(120vw, -120vh) scale(0.5) rotate(45deg);
            opacity: 0;
          }
        }
        
        @keyframes spinFly {
          0% {
            transform: translate(0, 0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translate(120vw, -120vh) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-fly-to-mars {
          animation: flyToMars 4s cubic-bezier(0.25, 1, 0.5, 1) forwards;
        }
        .animate-spin-fly {
          animation: spinFly 5s linear forwards;
        }
        
        @keyframes blink {
          50% { opacity: 0; }
        }
      `}</style>
        </div>
    );
};

export default MarsMigrationError;

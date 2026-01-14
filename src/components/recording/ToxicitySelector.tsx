'use client';

import { useState } from 'react';
import { ToxicityProfile, toxicityLabels, NicotineLevel, EthanolLevel, SleepEfficiency } from '@/lib/toxicity';

interface ToxicitySelectorProps {
    onComplete: (profile: ToxicityProfile) => void;
}

export default function ToxicitySelector({ onComplete }: ToxicitySelectorProps) {
    const [nicotine, setNicotine] = useState<NicotineLevel>('none');
    const [ethanol, setEthanol] = useState<EthanolLevel>('none');
    const [sleep, setSleep] = useState<SleepEfficiency>('human');

    const handleSubmit = () => {
        onComplete({ nicotine, ethanol, sleep });
    };

    return (
        <div className="fade-in max-w-md mx-auto">
            <div className="glass rounded-xl p-6 mb-6">
                <h2 className="text-xl font-bold text-center mb-2">
                    <span className="neon-text-cyan">Input Toxicity Levels</span>
                </h2>
                <p className="text-gray-400 text-sm text-center mb-6">
                    For accurate roast calibration
                </p>

                {/* Nicotine */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-3 text-gray-300">
                        🚬 Nicotine Intake
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {(Object.keys(toxicityLabels.nicotine) as NicotineLevel[]).map((level) => {
                            const label = toxicityLabels.nicotine[level];
                            return (
                                <button
                                    key={level}
                                    onClick={() => setNicotine(level)}
                                    className={`p-3 rounded-lg border transition-all ${nicotine === level
                                        ? 'border-cyan-500 bg-cyan-500/20 scale-105'
                                        : 'border-white/10 hover:border-white/30'
                                        }`}
                                >
                                    <div className="text-2xl mb-1">{label.emoji}</div>
                                    <div className="text-xs">{label.en}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Ethanol */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-3 text-gray-300">
                        🍺 Ethanol Level
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {(Object.keys(toxicityLabels.ethanol) as EthanolLevel[]).map((level) => {
                            const label = toxicityLabels.ethanol[level];
                            return (
                                <button
                                    key={level}
                                    onClick={() => setEthanol(level)}
                                    className={`p-3 rounded-lg border transition-all ${ethanol === level
                                        ? 'border-magenta-500 bg-magenta-500/20 scale-105'
                                        : 'border-white/10 hover:border-white/30'
                                        }`}
                                >
                                    <div className="text-2xl mb-1">{label.emoji}</div>
                                    <div className="text-xs">{label.en}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Sleep */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold mb-3 text-gray-300">
                        😴 Sleep Efficiency
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                        {(Object.keys(toxicityLabels.sleep) as SleepEfficiency[]).map((level) => {
                            const label = toxicityLabels.sleep[level];
                            return (
                                <button
                                    key={level}
                                    onClick={() => setSleep(level)}
                                    className={`p-3 rounded-lg border transition-all ${sleep === level
                                        ? 'border-yellow-500 bg-yellow-500/20 scale-105'
                                        : 'border-white/10 hover:border-white/30'
                                        }`}
                                >
                                    <div className="text-2xl mb-1">{label.emoji}</div>
                                    <div className="text-xs">{label.en}</div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <button
                onClick={handleSubmit}
                className="w-full btn-primary py-4 rounded-full text-lg"
            >
                Continue →
            </button>

            <p className="text-center text-gray-600 text-xs mt-4">
                "Human memory is buggy. Data is eternal."
            </p>
        </div>
    );
}

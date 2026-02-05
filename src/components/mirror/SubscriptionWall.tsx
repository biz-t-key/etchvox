'use client';

import { useState } from 'react';
import { LEMONSQUEEZY_CONFIG } from '@/config/features';

interface SubscriptionWallProps {
    userHash: string;
}

export default function SubscriptionWall({ userHash }: SubscriptionWallProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleCheckout(plan: 'weekly' | 'monthly') {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/checkout/lemonsqueezy', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userHash, plan })
            });

            if (!response.ok) {
                throw new Error('Failed to create checkout');
            }

            const data = await response.json();

            // Redirect to Lemon Squeezy checkout
            window.location.href = data.checkoutUrl;

        } catch (err) {
            console.error('Checkout error:', err);
            setError('Failed to start checkout. Please try again.');
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-6">
            <div className="max-w-2xl w-full space-y-8">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="text-6xl mb-4">🎭</div>
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        Voice Mirror
                    </h1>
                    <p className="text-gray-400 text-lg">
                        Daily Bio-Acoustic Self-Tracking
                    </p>
                    <p className="text-gray-500 text-sm font-mono">
                        Premium Feature - Subscription Required
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Pricing Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Weekly Plan */}
                    <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 space-y-6 hover:border-cyan-500/50 transition-all">
                        <div className="text-center">
                            <h3 className="text-xl font-bold text-white mb-2">Weekly</h3>
                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                                ${LEMONSQUEEZY_CONFIG.WEEKLY_PRICE}
                            </div>
                            <p className="text-gray-500 text-sm mt-1">per week</p>
                        </div>

                        <ul className="space-y-3 text-sm text-gray-300">
                            <li className="flex items-center gap-2">
                                <span className="text-cyan-400">✓</span>
                                Daily voice calibration
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-cyan-400">✓</span>
                                Z-Score anomaly detection
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-cyan-400">✓</span>
                                Oracle predictions
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-cyan-400">✓</span>
                                7-day recap montage
                            </li>
                        </ul>

                        <button
                            onClick={() => handleCheckout('weekly')}
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Processing...' : 'Start Weekly'}
                        </button>
                    </div>

                    {/* Monthly Plan */}
                    <div className="bg-white/5 backdrop-blur-sm border-2 border-cyan-500/50 rounded-2xl p-8 space-y-6 relative hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] transition-all">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-cyan-500 text-black text-xs font-bold px-4 py-1 rounded-full">
                            BEST VALUE
                        </div>

                        <div className="text-center">
                            <h3 className="text-xl font-bold text-white mb-2">Monthly</h3>
                            <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                                ${LEMONSQUEEZY_CONFIG.MONTHLY_PRICE}
                            </div>
                            <p className="text-gray-500 text-sm mt-1">per month</p>
                            <p className="text-cyan-400 text-xs mt-2 font-bold">Save 16%</p>
                        </div>

                        <ul className="space-y-3 text-sm text-gray-300">
                            <li className="flex items-center gap-2">
                                <span className="text-cyan-400">✓</span>
                                Everything in Weekly
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-cyan-400">✓</span>
                                30-day trend analysis
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-cyan-400">✓</span>
                                Advanced insights
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="text-cyan-400">✓</span>
                                Priority support
                            </li>
                        </ul>

                        <button
                            onClick={() => handleCheckout('monthly')}
                            disabled={isLoading}
                            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Processing...' : 'Start Monthly'}
                        </button>
                    </div>
                </div>

                {/* Features List */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                    <h4 className="text-sm font-black uppercase tracking-widest text-cyan-400 mb-4">
                        What You Get
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-300">
                        <div>🎯 Daily calibration readings</div>
                        <div>📊 Statistical deviation tracking</div>
                        <div>🔮 AI Oracle analysis</div>
                        <div>🎬 Weekly voice montage</div>
                        <div>🏷️ Custom mood tagging</div>
                        <div>📈 Long-term trend insights</div>
                    </div>
                </div>

                {/* Back Link */}
                <div className="text-center">
                    <a href="/" className="text-gray-500 hover:text-gray-300 text-sm transition">
                        ← Back to Home
                    </a>
                </div>
            </div>
        </div>
    );
}

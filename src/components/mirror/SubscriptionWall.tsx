import { useState } from 'react';
import Link from 'next/link';
import { POLAR_CONFIG } from '@/config/features';
import { checkSubscription } from '@/lib/subscription';

interface SubscriptionWallProps {
    userHash: string;
    setHasSubscription: (val: boolean | null) => void;
}

export default function SubscriptionWall({ userHash, setHasSubscription }: SubscriptionWallProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeStep, setActiveStep] = useState(0);

    const onboardingSteps = [
        {
            title: "1. Choose Your Story",
            subtitle: "Lock in your resonance path for 7 days",
            desc: "Select a Narrative Genre: Philosophy, Thriller, Poet, or Cinematic Grit. This choice anchors your 7-day focus and determines the visual archetype of your final record.",
            img: "/images/mirror_step1_genre.png"
        },
        {
            title: "2. Record Daily Guided Reads",
            subtitle: "Active Mindfulness through Voice",
            desc: "Anchor your state with a 30-second guided narrative. Capture deep exhales, intentional pauses, and your authentic vocal pulse as high-fidelity biometric data.",
            img: "/images/mirror_step2_reading_v2.png"
        },
        {
            title: "3. Export Your Resonance Film",
            subtitle: "Synchronized 7-Day Journey",
            desc: "Synthesize your week into a cinematic dossier. Every tremor and shift is visually mapped using your chosen archetype's unique textures, cinematic filters, and biometric markers.",
            img: "/images/mirror_step3_dossier.png"
        }
    ];

    async function handleCheckout(plan: 'weekly' | 'monthly') {
        setIsLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/checkout/polar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userHash, plan, resultId: 'mirror' })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.details || errorData.error || 'Failed to create checkout');
            }

            const data = await response.json();
            const checkoutUrl = data.checkoutUrl;

            // Direct redirect to Polar.sh checkout
            window.location.href = checkoutUrl;

        } catch (err) {
            console.error('Checkout error:', err);
            setError('Failed to start checkout. Please try again.');
            setIsLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center py-12 px-6">
            <div className="max-w-4xl w-full space-y-12">
                {/* Header */}
                <div className="text-center space-y-4">
                    <div className="text-6xl mb-4 grayscale opacity-50">🎭</div>
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase tracking-tighter">
                        Voice Mirror
                    </h1>
                    <p className="text-gray-400 text-lg uppercase tracking-widest text-sm font-mono">
                        Daily Bio-Acoustic Self-Tracking
                    </p>
                </div>

                {/* Onboarding Carousel (Top) */}
                <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10 relative overflow-hidden group">
                    <div className="absolute top-4 right-8 flex gap-2">
                        {onboardingSteps.map((_, idx) => (
                            <div
                                key={idx}
                                className={`w-2 h-2 rounded-full transition-all ${idx === activeStep ? 'w-8 bg-cyan-400' : 'bg-white/20'}`}
                            />
                        ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-black text-white italic">
                                    {onboardingSteps[activeStep].title}
                                </h2>
                                <p className="text-cyan-400 font-bold uppercase tracking-wider text-sm">
                                    {onboardingSteps[activeStep].subtitle}
                                </p>
                            </div>
                            <p className="text-gray-400 leading-relaxed">
                                {onboardingSteps[activeStep].desc}
                            </p>

                            <div className="flex gap-4 pt-4">
                                <button
                                    onClick={() => setActiveStep((prev) => (prev === 0 ? onboardingSteps.length - 1 : prev - 1))}
                                    className="p-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all"
                                >
                                    ←
                                </button>
                                <button
                                    onClick={() => setActiveStep((prev) => (prev === onboardingSteps.length - 1 ? 0 : prev + 1))}
                                    className="flex-1 py-4 px-6 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold transition-all flex items-center justify-between"
                                >
                                    Next Phase
                                    <span>→</span>
                                </button>
                            </div>
                        </div>

                        <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 bg-black/40 shadow-2xl">
                            <img
                                key={activeStep}
                                src={onboardingSteps[activeStep].img}
                                alt={onboardingSteps[activeStep].title}
                                className="w-full h-full object-contain p-4 animate-in fade-in zoom-in duration-500"
                                onError={(e) => {
                                    console.error('Image failed to load:', onboardingSteps[activeStep].img);
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/800x450?text=Module+Preview';
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                        <p className="text-red-400 text-sm">{error}</p>
                    </div>
                )}

                {/* Pricing Cards (Bottom) */}
                <div className="space-y-8">
                    <div className="text-center space-y-2">
                        <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest">Digital Access Pass</h3>
                        <p className="text-gray-500 text-[10px] italic">Unlock the 7-day resonance protocol. All sessions limited to 1 recording per day.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* 7-Day Pass */}
                        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 space-y-6 hover:border-cyan-500/50 transition-all">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase italic">7-Day Pass</h3>
                                    <p className="text-gray-500 text-[10px] uppercase tracking-widest">Standard Access</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-white">
                                        ${POLAR_CONFIG.WEEKLY_PRICE}
                                    </div>
                                    <p className="text-gray-600 text-[10px] mt-1 font-bold">ONE-TIME</p>
                                </div>
                            </div>

                            <ul className="space-y-3 text-sm text-gray-400 border-t border-white/5 pt-6">
                                <li className="flex items-center gap-2">
                                    <span className="text-cyan-400">✓</span>
                                    1 Reading Session / Day
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-cyan-400">✓</span>
                                    AI Oracle Analysis
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-cyan-400">✓</span>
                                    7-Day Biometric Record
                                </li>
                            </ul>

                            <button
                                onClick={() => handleCheckout('weekly')}
                                disabled={isLoading}
                                className="w-full py-4 bg-white text-black font-black uppercase text-xs rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                            >
                                {isLoading ? 'INITIALIZING...' : 'Acquire 7-Day Pass'}
                            </button>
                        </div>

                        {/* 30-Day Pass */}
                        <div className="bg-white/10 backdrop-blur-sm border-2 border-cyan-500/50 rounded-2xl p-8 space-y-6 relative hover:shadow-[0_0_40px_rgba(34,211,238,0.2)] transition-all">
                            <div className="absolute -top-3 right-8 bg-cyan-500 text-black text-[9px] font-black px-4 py-1 rounded-full uppercase italic">
                                Optimized Value
                            </div>

                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-black text-white uppercase italic">30-Day Pass</h3>
                                    <p className="text-cyan-400 text-[10px] font-black uppercase tracking-widest">Full Sequence</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-3xl font-black text-white">
                                        ${POLAR_CONFIG.MONTHLY_PRICE}
                                    </div>
                                    <p className="text-cyan-600 text-[10px] mt-1 font-black">ONE-TIME</p>
                                </div>
                            </div>

                            <ul className="space-y-3 text-sm text-gray-300 border-t border-white/10 pt-6">
                                <li className="flex items-center gap-2">
                                    <span className="text-cyan-400">✓</span>
                                    1 Reading Session / Day
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-cyan-400">✓</span>
                                    Extended Trend Comparison
                                </li>
                                <li className="flex items-center gap-2">
                                    <span className="text-cyan-400">✓</span>
                                    Priority Biometric Analysis
                                </li>
                                <li className="flex items-center gap-2 font-black text-cyan-400 uppercase text-[10px] tracking-wider">
                                    <span className="text-cyan-400">✓</span>
                                    Save 46% vs 7-Day
                                </li>
                            </ul>

                            <button
                                onClick={() => handleCheckout('monthly')}
                                disabled={isLoading}
                                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black uppercase text-xs rounded-xl hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95"
                            >
                                {isLoading ? 'INITIALIZING...' : 'Acquire 30-Day Pass'}
                            </button>
                        </div>
                    </div>

                    <div className="text-center">
                        <button
                            onClick={async () => {
                                setIsLoading(true);
                                const subStatus = await checkSubscription(userHash);
                                setHasSubscription(subStatus.isActive);
                                setIsLoading(false);
                            }}
                            className="mt-6 py-3 px-4 text-xs text-gray-400 hover:text-white underline uppercase tracking-widest font-black transition-colors touch-manipulation relative z-50"
                        >
                            Already purchased? Refresh status
                        </button>
                        <div className="mt-4 flex flex-col items-center gap-3">
                            <Link
                                href="/?restore=true"
                                className="text-[10px] text-gray-500 hover:text-cyan-400 underline uppercase tracking-widest font-bold transition-colors"
                            >
                                Multi-device? Restore from Email
                            </Link>
                            <a
                                href="mailto:support@etchvox.com"
                                className="text-[9px] text-gray-600 hover:text-white uppercase tracking-[0.2em] font-bold transition-colors"
                            >
                                Contact Support
                            </a>
                        </div>
                    </div>
                </div>

                {/* Footer Info */}
                <div className="text-center space-y-4 pt-8 opacity-50">
                    <div className="flex items-center justify-center gap-6 text-[10px] uppercase tracking-widest text-gray-400">
                        <span>Zero-Knowledge Data</span>
                        <span className="w-1 h-1 bg-gray-600 rounded-full" />
                        <span>Biometric Vault</span>
                        <span className="w-1 h-1 bg-gray-600 rounded-full" />
                        <span>7-Day Cycle</span>
                    </div>
                    <a href="/" className="inline-block text-gray-500 hover:text-white text-xs uppercase tracking-tighter transition-all">
                        ← RETURN TO SYSTEM HOME
                    </a>
                </div>
            </div>
        </div>
    );
}


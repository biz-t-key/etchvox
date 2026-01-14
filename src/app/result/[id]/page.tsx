'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { voiceTypes, TypeCode, groupColors } from '@/lib/types';
import { getSilhouettePath } from '@/lib/silhouettes';
import { getResult, VoiceResult } from '@/lib/storage';
import { getBestMatches, getWorstMatches, getCompatibilityTier } from '@/lib/compatibilityMatrix';
import ShareButtons from '@/components/result/ShareButtons';
import VaultDownloadSection from '@/components/result/VaultDownloadSection';
import MBTISelector from '@/components/result/MBTISelector';
import SoloIdentityCard from '@/components/result/SoloIdentityCard';
import { MBTIType } from '@/lib/mbti';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

type DisplayStage = 'label' | 'metrics' | 'full';

export default function ResultPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const resultId = params.id as string;

    const [result, setResult] = useState<VoiceResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showOTO, setShowOTO] = useState(false);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [displayStage, setDisplayStage] = useState<DisplayStage>('label');
    const [selectedMBTI, setSelectedMBTI] = useState<MBTIType | null>(null);

    // Check for payment success
    useEffect(() => {
        const paymentStatus = searchParams.get('payment');
        const paymentType = searchParams.get('type');

        if (paymentStatus === 'success' && paymentType !== 'vault') {
            // Just unlocked $4.99, show OTO for Vault
            setTimeout(() => setShowOTO(true), 1000);
        }
    }, [searchParams]);

    useEffect(() => {
        async function loadResult() {
            try {
                const data = await getResult(resultId);
                if (data) {
                    setResult(data);
                    // Start staged display sequence
                    setTimeout(() => setDisplayStage('metrics'), 2500);
                    setTimeout(() => setDisplayStage('full'), 4500);
                } else {
                    setError('Result not found');
                }
            } catch (e) {
                setError('Failed to load result');
            } finally {
                setLoading(false);
            }
        }
        loadResult();
    }, [resultId]);

    const handleCheckout = async (type: 'unlock' | 'vault') => {
        setProcessingPayment(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resultId, type }),
            });

            const { sessionId, url } = await res.json();

            if (url) {
                window.location.href = url;
            }
        } catch (err) {
            console.error('Checkout error:', err);
            alert('Payment failed. Please try again.');
        } finally {
            setProcessingPayment(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-black px-4">
                <div className="text-red-400 mb-4">❌ {error || 'Result not found'}</div>
                <Link href="/" className="btn-primary px-6 py-3 rounded-lg">
                    Go Home
                </Link>
            </div>
        );
    }

    const voiceType = voiceTypes[result.typeCode];
    const colors = groupColors[voiceType.group];
    const bestMatches = getBestMatches(result.typeCode);
    const worstMatches = getWorstMatches(result.typeCode);

    // Check if premium
    const isPremium = result.isPremium || searchParams.get('payment') === 'success';

    return (
        <div className="min-h-screen bg-black py-8 px-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 opacity-20 pointer-events-none">
                <div className="absolute top-0 -right-20 w-96 h-96 rounded-full blur-[120px]"
                    style={{ background: colors.primary }} />
                <div className="absolute bottom-0 -left-20 w-96 h-96 rounded-full blur-[120px]"
                    style={{ background: colors.secondary }} />
            </div>

            <div className="max-w-2xl mx-auto relative z-10">

                {/* STAGE 1: THE REVEAL (Instant Hook) */}
                {displayStage === 'label' && (
                    <div className="min-h-[80vh] flex flex-col items-center justify-center animate-fade-in text-center p-6 bg-black/40 backdrop-blur-md rounded-3xl border border-white/5 shadow-2xl">
                        <div className="text-8xl md:text-9xl mb-8 animate-bounce-slow">{voiceType.icon}</div>
                        <h1
                            className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 animate-scale-in"
                            style={{ color: colors.primary, textShadow: `0 0 30px ${colors.primary}50` }}
                        >
                            {voiceType.name}
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-300 italic mb-8 animate-slide-up bg-white/5 px-6 py-2 rounded-full border border-white/10">
                            "{voiceType.catchphrase}"
                        </p>
                        <div className="mono text-cyan-400 animate-pulse tracking-[0.2em] text-sm">
                            INITIALIZING PARAMETERS...
                        </div>
                    </div>
                )}

                {/* STAGE 2 & 3 CONTENT */}
                {(displayStage === 'metrics' || displayStage === 'full') && (
                    <div className="animate-fade-in">
                        {/* Header */}
                        <div className="text-center mb-8">
                            <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm">
                                ← New Analysis
                            </Link>
                            <h1 className="text-2xl font-bold mt-4 neon-text-cyan">
                                Analysis Summary
                            </h1>
                        </div>

                        {/* Metrics Card (Display in Metrics Stage onwards) */}
                        <div
                            className="glass rounded-2xl p-6 md:p-8 mb-6 relative overflow-hidden border border-white/10"
                            style={{
                                background: `linear-gradient(135deg, ${colors.primary}15, ${colors.secondary}10)`,
                            }}
                        >
                            <div className="text-center mb-6">
                                <div className="text-6xl mb-4">{voiceType.icon}</div>
                                <h2
                                    className="text-3xl font-black uppercase tracking-tight mb-2"
                                    style={{ color: colors.primary }}
                                >
                                    {voiceType.name}
                                </h2>
                                <div className="mono text-gray-500 text-sm">{result.typeCode}</div>
                            </div>

                            {/* Metrics Grid */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-2">
                                <div className="text-center bg-black/40 p-4 rounded-xl border border-white/5">
                                    <div className="text-xs text-gray-500 mb-1 uppercase tracking-widest">Pitch</div>
                                    <div className="text-xl font-bold text-cyan-400">{Math.round(result.metrics.pitch)} Hz</div>
                                </div>
                                <div className="text-center bg-black/40 p-4 rounded-xl border border-white/5">
                                    <div className="text-xs text-gray-500 mb-1 uppercase tracking-widest">Speed</div>
                                    <div className="text-xl font-bold text-magenta-400">{(result.metrics.speed * 100).toFixed(0)}%</div>
                                </div>
                                <div className="text-center bg-black/40 p-4 rounded-xl border border-white/5">
                                    <div className="text-xs text-gray-500 mb-1 uppercase tracking-widest">Vibe</div>
                                    <div className="text-xl font-bold text-yellow-400">{(result.metrics.vibe * 100).toFixed(0)}%</div>
                                </div>
                                <div className="text-center bg-black/40 p-4 rounded-xl border border-white/5">
                                    <div className="text-xs text-gray-500 mb-1 uppercase tracking-widest">Sync</div>
                                    <div className="text-xl font-bold text-green-400">{result.metrics.humanityScore}%</div>
                                </div>
                            </div>

                            {displayStage === 'metrics' && (
                                <div className="mt-8 text-center animate-bounce">
                                    <div className="text-gray-400 text-sm mb-2 uppercase tracking-[0.2em]">Processing Detailed Report...</div>
                                    <div className="text-2xl">⬇️</div>
                                </div>
                            )}
                        </div>

                        {/* STAGE 3: FULL CONTENT */}
                        {displayStage === 'full' && (
                            <div className="animate-slide-up space-y-16 pb-20">

                                {/* 📸 NEW: Share Card Section */}
                                <div className="space-y-6">
                                    {!selectedMBTI ? (
                                        <MBTISelector onSelect={(mbti) => setSelectedMBTI(mbti)} />
                                    ) : (
                                        <div className="space-y-6 animate-scale-in">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-lg font-bold text-white uppercase tracking-widest">
                                                    Your Truth Card
                                                </h3>
                                                <button
                                                    onClick={() => setSelectedMBTI(null)}
                                                    className="text-xs text-gray-500 hover:text-white transition-colors"
                                                >
                                                    [ Change MBTI ]
                                                </button>
                                            </div>

                                            <SoloIdentityCard mbti={selectedMBTI} voiceTypeCode={result.typeCode} />

                                            <div className="text-center p-4 bg-white/5 rounded-xl border border-white/10">
                                                <p className="text-sm text-gray-300 font-medium">
                                                    📸 Screenshot & Share on Stories
                                                </p>
                                                <p className="text-[10px] text-gray-500 mt-1 uppercase tracking-widest">
                                                    etchvox // generated_by_etchvox
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* The Roast */}
                                <div className="bg-black/50 rounded-2xl p-6 md:p-8 border border-white/10 shadow-xl overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-4 text-[100px] opacity-5 pointer-events-none select-none">🔥</div>
                                    <h3 className="mono text-cyan-400 text-sm mb-6 tracking-widest uppercase flex items-center gap-2">
                                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                                        Behavioral_Profile_Analysis
                                    </h3>
                                    {isPremium ? (
                                        <p className="text-gray-200 leading-relaxed text-lg font-medium">
                                            {voiceType.roast}
                                        </p>
                                    ) : (
                                        <div className="relative min-h-[200px] flex items-center justify-center">
                                            <p className="text-gray-200 leading-relaxed blur-lg select-none text-lg absolute inset-0 p-4">
                                                {voiceType.roast}
                                            </p>
                                            <div className="relative z-10 text-center p-8 glass rounded-2xl border border-white/10 max-w-sm mx-auto">
                                                <div className="text-6xl mb-4">🔒</div>
                                                <h4 className="text-2xl font-bold mb-2">UNLOCK</h4>
                                                <p className="text-sm text-gray-400 mb-6">Full personality analysis</p>
                                                <button
                                                    onClick={() => handleCheckout('unlock')}
                                                    disabled={processingPayment}
                                                    className="w-full bg-gradient-to-r from-cyan-500 to-magenta-500 hover:from-cyan-400 hover:to-magenta-400 text-white font-bold py-4 px-8 rounded-full shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {processingPayment ? 'Processing...' : '$4.99'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Compatibility */}
                                <div className="glass rounded-2xl p-6 border border-white/10">
                                    <h3 className="font-semibold mb-6 flex items-center gap-2 text-xl">
                                        <span className="text-cyan-400">🧬</span>
                                        <span>Genetic Voice Matches</span>
                                    </h3>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Best Matches */}
                                        <div>
                                            <div className="text-xs font-bold text-green-400 mb-4 uppercase tracking-[0.2em]">Highest Compatibility</div>
                                            <div className="space-y-3">
                                                {bestMatches.slice(0, 3).map(({ type, score }) => {
                                                    const matchType = voiceTypes[type];
                                                    const tier = getCompatibilityTier(score);
                                                    return (
                                                        <div key={type} className="flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors border border-white/5 rounded-xl p-3">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-2xl">{matchType.icon}</span>
                                                                <span className="font-medium">{matchType.name}</span>
                                                            </div>
                                                            <span className="mono text-xs font-bold px-2 py-1 rounded-full bg-black/40" style={{ color: tier.color }}>{tier.emoji} {score}%</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>

                                        {/* Worst Matches */}
                                        <div>
                                            <div className="text-xs font-bold text-red-400 mb-4 uppercase tracking-[0.2em]">Immediate Conflict</div>
                                            <div className="space-y-3">
                                                {worstMatches.slice(0, 3).map(({ type, score }) => {
                                                    const matchType = voiceTypes[type];
                                                    const tier = getCompatibilityTier(score);
                                                    return (
                                                        <div key={type} className="flex items-center justify-between bg-white/5 hover:bg-white/10 transition-colors border border-white/5 rounded-xl p-3">
                                                            <div className="flex items-center gap-3">
                                                                <span className="text-2xl">{matchType.icon}</span>
                                                                <span className="font-medium">{matchType.name}</span>
                                                            </div>
                                                            <span className="mono text-xs font-bold px-2 py-1 rounded-full bg-black/40" style={{ color: tier.color }}>{tier.emoji} {score}%</span>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Vault Promotion / Download */}
                                {result.vaultEnabled ? (
                                    <VaultDownloadSection
                                        audioUrl={result.audioUrl || ''}
                                        resultId={result.id}
                                        createdAt={result.createdAt}
                                    />
                                ) : (
                                    <div className="bg-gradient-to-br from-cyan-900/40 via-black to-magenta-900/40 border border-white/10 rounded-3xl p-10 md:p-12 text-center relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <div className="relative z-10">
                                            <div className="text-5xl mb-4">⏳</div>
                                            <h3 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">
                                                You Will Never Sound Like "Today" Again.
                                            </h3>
                                            <p className="text-gray-300 text-base mb-6 leading-relaxed max-w-lg mx-auto italic">
                                                "Freeze your vibe. Before life changes it."
                                            </p>
                                            <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-md mx-auto">
                                                Your voice decays by <strong className="text-cyan-400">0.5%</strong> every year.
                                                Stress, aging, and environmental damage are permanent.
                                                Lock this moment in <strong className="text-magenta-400">digital amber</strong> before it's too late.
                                            </p>

                                            <div className="bg-white/5 rounded-2xl p-5 mb-8 max-w-md mx-auto border border-white/10">
                                                <div className="text-xs font-bold text-green-400 mb-3 uppercase tracking-[0.2em]">What's Preserved:</div>
                                                <div className="space-y-2 text-[11px] text-gray-300 text-left">
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-green-400 font-bold">✓</span>
                                                        <span><strong>48kHz studio quality</strong> — Beyond CD standard</span>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-green-400 font-bold">✓</span>
                                                        <span><strong>Raw background ambience</strong> — Coffee shop noise, wind, breath</span>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-green-400 font-bold">✓</span>
                                                        <span><strong>Zero post-processing</strong> — No noise reduction, no auto-gain</span>
                                                    </div>
                                                    <div className="flex items-start gap-2">
                                                        <span className="text-green-400 font-bold">✓</span>
                                                        <span><strong>Lifetime cloud backup</strong> — Access forever, download anytime</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => handleCheckout('vault')}
                                                disabled={processingPayment}
                                                className="w-full max-w-sm mx-auto bg-white text-black hover:bg-gray-200 font-black py-5 rounded-full text-xl uppercase tracking-tighter transition-all transform hover:scale-105 disabled:opacity-50 shadow-[0_0_30px_rgba(0,240,255,0.3)]"
                                            >
                                                {processingPayment ? 'PRESERVING...' : '💎 FREEZE MY VIBE — $10'}
                                            </button>

                                            <p className="text-gray-600 text-[10px] mono mt-4 italic">
                                                "A digital amber for your voice. You can't rewind time."
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Share & Footer */}
                                <div className="space-y-8 pt-8 border-t border-white/5">
                                    <ShareButtons
                                        resultId={resultId}
                                        typeName={voiceType.name}
                                        typeIcon={voiceType.icon}
                                        catchphrase={voiceType.catchphrase}
                                        typeCode={result.typeCode}
                                    />

                                    <div className="text-center">
                                        <p className="text-gray-600 text-[10px] mono mb-4">SYSTEM_ID: {result.id} // SESSION: {result.sessionId}</p>
                                        <Link href="/" className="text-cyan-500/50 hover:text-cyan-400 text-xs uppercase tracking-[0.3em] font-bold transition-colors">
                                            Repeat Process →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* OTO Modal */}
            {showOTO && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-[100] p-4 animate-fade-in">
                    <div className="glass max-w-md w-full p-8 rounded-[32px] relative border border-white/10 shadow-[0_0_100px_rgba(255,0,255,0.2)]">
                        <div className="text-center mb-8">
                            <div className="text-6xl mb-4">🧠</div>
                            <h2 className="text-3xl font-black text-white mb-2 leading-none">
                                DON'T LET THEM <br /> <span className="text-magenta-500">FORGET YOU.</span>
                            </h2>
                            <p className="text-gray-400 text-sm">
                                Profiles expire. The Vault is forever.
                            </p>
                        </div>

                        <div className="space-y-4 mb-8">
                            <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <span className="text-green-400 text-xl font-bold">✓</span>
                                <p className="text-xs text-gray-300">
                                    <strong>Permanent Audio Backup:</strong> Every breath, every hesitation preserved in high fidelity.
                                </p>
                            </div>
                            <div className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/5">
                                <span className="text-green-400 text-xl font-bold">✓</span>
                                <p className="text-xs text-gray-300">
                                    <strong>Vocal Timeline:</strong> Compare how your voice ages every year. Monitor your biological decay.
                                </p>
                            </div>
                        </div>

                        <div className="text-center mb-8">
                            <div className="text-gray-500 text-[10px] mono mb-1 uppercase tracking-widest">ONE-TIME-UPGRADE</div>
                            <div className="text-4xl font-black text-white">+$10.00</div>
                        </div>

                        <button
                            onClick={() => {
                                setShowOTO(false);
                                handleCheckout('vault');
                            }}
                            disabled={processingPayment}
                            className="w-full bg-magenta-600 hover:bg-magenta-500 text-white font-black py-5 rounded-full text-lg uppercase tracking-tight transition-all shadow-[0_10px_30px_rgba(236,72,153,0.3)] hover:scale-[1.02]"
                        >
                            ✅ UPGRADE TO VAULT
                        </button>

                        <button
                            onClick={() => setShowOTO(false)}
                            className="text-gray-600 text-[10px] mono hover:text-gray-400 py-4 uppercase tracking-widest mt-2"
                        >
                            [ DECLINE_ETERNAL_MEMORY ]
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

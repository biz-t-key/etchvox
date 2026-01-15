'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import { voiceTypes, TypeCode, groupColors } from '@/lib/types';
import { getResult, VoiceResult } from '@/lib/storage';
import { getBestMatches, getWorstMatches, getCompatibilityTier } from '@/lib/compatibilityMatrix';
import ShareButtons from '@/components/result/ShareButtons';
import MBTISelector from '@/components/result/MBTISelector';
import SoloIdentityCard from '@/components/result/SoloIdentityCard';
import { VideoPlayerSection } from '@/components/video/VideoPlayerSection';
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
    const [processingPayment, setProcessingPayment] = useState(false);
    const [displayStage, setDisplayStage] = useState<DisplayStage>('label');
    const [selectedMBTI, setSelectedMBTI] = useState<MBTIType | null>(null);
    const [mbtiSkipped, setMbtiSkipped] = useState(false);

    // Initial Load
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

    // Check if premium (either from stored result or just successful payment)
    const isPremium = result.vaultEnabled === true || searchParams.get('payment') === 'success';
    // Note: If payment=success just happened, we might need to reload or update state manually if getResult is cached.
    // For now we assume standard reload flow or rely on isPremium check logic.
    // Actually, let's trust the 'result' object from getResult which should be updated if we navigated back.
    // However, if we didn't wait for webhook, simple param check is useful for instant feedback UI.
    const showVideo = result.vaultEnabled || (searchParams.get('payment') === 'success');

    return (
        <main className="min-h-screen bg-black text-white selection:bg-cyan-500/30 font-sans flex flex-col items-center overflow-x-hidden w-full">
            {/* Background Decoration */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] opacity-20 animate-pulse-slow" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-magenta-500/10 rounded-full blur-[100px] opacity-20 animate-pulse-slow delay-1000" />
            </div>

            <div className="relative z-10 w-full max-w-xl mx-auto px-4 py-8 md:py-12 space-y-12 flex flex-col items-center text-center">
                {/* Header */}
                <header className="flex flex-col items-center justify-center space-y-4 w-full">
                    <Link
                        href="/"
                        className="text-xs font-bold tracking-widest text-gray-500 hover:text-white transition-colors duration-300 uppercase"
                    >
                        ← New Analysis
                    </Link>
                    <div className="relative">
                        <h1 className="text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-cyan-200 drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]">
                            Analysis Summary
                        </h1>
                        <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-1 bg-cyan-500 rounded-full blur-[2px]" />
                    </div>
                </header>

                {/* STAGE 1: THE REVEAL (Instant Hook) */}
                {displayStage === 'label' && (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in text-center">
                        <div className="text-8xl mb-6 animate-bounce-slow filter drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                            {voiceType.icon}
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white mb-4 tracking-tighter">
                            {voiceType.name}
                        </h2>
                        <div className="text-sm md:text-base font-mono text-cyan-500 tracking-[0.3em] uppercase opacity-80">
                            Subject ID: {result.typeCode}
                        </div>
                    </div>
                )}

                {/* STAGE 2 & 3 CONTENT */}
                {(displayStage === 'metrics' || displayStage === 'full') && (
                    <div className="animate-fade-in w-full space-y-12">
                        {/* Metrics Card */}
                        <div
                            className="glass rounded-2xl p-6 md:p-8 relative overflow-hidden border border-white/10"
                            style={{ boxShadow: `0 0 50px ${colors.primary}20` }}
                        >
                            <div className="flex flex-col items-center border-b border-white/10 pb-6 mb-6">
                                <span className="text-6xl mb-4 filter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                                    {voiceType.icon}
                                </span>
                                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2 text-transparent bg-clip-text bg-gradient-to-br from-white to-gray-400">
                                    {voiceType.name}
                                </h1>
                                <div className="text-xs font-mono text-gray-500 uppercase tracking-[0.2em]">
                                    {result.typeCode}
                                </div>
                            </div>

                            {/* Meters */}
                            <div className="grid grid-cols-4 gap-4 text-center">
                                {[
                                    { label: 'Pitch', val: `${Math.round(result.metrics.pitch)} Hz`, color: 'text-cyan-400' },
                                    { label: 'Speed', val: `${Math.round(result.metrics.speed * 100)}%`, color: 'text-white' },
                                    { label: 'Vibe', val: `${Math.round(result.metrics.vibe * 100)}%`, color: 'text-yellow-400' },
                                    { label: 'Sync', val: `${result.metrics.humanityScore}%`, color: colors.primary === '#00FF66' ? 'text-green-400' : 'text-green-500' },
                                ].map((m) => (
                                    <div key={m.label} className="bg-black/20 rounded-lg p-2 md:p-3">
                                        <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1 font-bold">{m.label}</div>
                                        <div className={`text-sm md:text-lg font-bold ${m.color} font-mono leading-none`}>{m.val}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Processing Indicator */}
                            {displayStage === 'metrics' && (
                                <div className="mt-8 text-center animate-bounce">
                                    <div className="text-gray-400 text-xs mb-2 uppercase tracking-[0.2em]">Processing Detailed Report...</div>
                                    <div className="text-xl">⬇️</div>
                                </div>
                            )}
                        </div>

                        {displayStage === 'full' && (
                            <div className="animate-slide-up space-y-12">
                                {/* MBTI / Truth Card Section */}
                                <div className="w-full">
                                    <div className="flex items-center justify-between mb-4 px-2">
                                        <h2 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                                            <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full" />
                                            YOUR TRUTH CARD
                                        </h2>
                                        {selectedMBTI && !isPremium && (
                                            <button
                                                onClick={() => setSelectedMBTI(null)}
                                                className="text-[10px] text-gray-500 hover:text-white transition-colors"
                                            >
                                                [ CHANGE MBTI ]
                                            </button>
                                        )}
                                    </div>
                                    {!selectedMBTI && !mbtiSkipped ? (
                                        <MBTISelector
                                            onSelect={(mbti) => {
                                                setSelectedMBTI(mbti);
                                                setMbtiSkipped(false);
                                                setTimeout(() => {
                                                    document.getElementById('identity-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                                }, 100);
                                            }}
                                            onSkip={() => setMbtiSkipped(true)}
                                        />
                                    ) : selectedMBTI ? (
                                        <div id="identity-card" className="w-full">
                                            <SoloIdentityCard mbti={selectedMBTI} voiceTypeCode={result.typeCode} />
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setMbtiSkipped(false)}
                                            className="w-full py-8 border border-dashed border-white/10 rounded-xl text-gray-500 hover:text-white hover:border-white/30 transition-all text-xs uppercase tracking-widest"
                                        >
                                            + Add MBTI for Identity Card
                                        </button>
                                    )}
                                </div>

                                {/* Screenshot Callout */}
                                {selectedMBTI && (
                                    <div className="text-center">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-widest animate-pulse">
                                            📸 Screenshot & Share on Stories
                                        </p>
                                        <div className="text-[8px] text-gray-600 font-mono mt-1">
                                            ETCHVOX // GENERATED_BY_ETCHVOX
                                        </div>
                                    </div>
                                )}

                                {/* THE ROAST (Free) */}
                                <div className="bg-black/50 rounded-2xl p-6 border border-white/10 relative overflow-hidden group hover:border-cyan-500/30 transition-colors">
                                    <div className="absolute top-0 right-0 p-4 text-[80px] opacity-5 pointer-events-none select-none group-hover:opacity-10 transition-opacity">🔥</div>
                                    <h3 className="mono text-cyan-400 text-[10px] mb-3 tracking-widest uppercase flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                                        BEHAVIORAL_PROFILE_ANALYSIS
                                    </h3>
                                    <p className="text-gray-200 leading-relaxed text-sm font-medium text-left">
                                        {voiceType.roast}
                                    </p>
                                </div>

                                {/* Genetic Matches */}
                                <div className="w-full">
                                    <div className="text-center mb-4 text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] flex justify-center items-center gap-2">
                                        <span className="text-base">🧬</span> Genetic Voice Matches
                                    </div>
                                    <div className="grid gap-3">
                                        <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex items-center justify-between">
                                            <span className="text-[10px] text-green-400 font-bold uppercase tracking-wider">Highest Compatibility</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{voiceTypes[bestMatches[0].type].icon}</span>
                                                <span className="text-xs font-bold">{voiceTypes[bestMatches[0].type].name}</span>
                                                <span className="text-[10px] bg-green-900/40 text-green-400 px-1.5 py-0.5 rounded ml-2">{bestMatches[0].score}%</span>
                                            </div>
                                        </div>
                                        <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex items-center justify-between">
                                            <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider">Immediate Conflict</span>
                                            <div className="flex items-center gap-2">
                                                <span className="text-lg">{voiceTypes[worstMatches[0].type].icon}</span>
                                                <span className="text-xs font-bold">{voiceTypes[worstMatches[0].type].name}</span>
                                                <span className="text-[10px] bg-red-900/40 text-red-400 px-1.5 py-0.5 rounded ml-2">{worstMatches[0].score}%</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* VIDEO EXPORT (Paid) */}
                                {showVideo ? (
                                    <div className="space-y-4">
                                        <div className="text-center">
                                            <div className="inline-block bg-green-500/10 border border-green-500 text-green-400 px-3 py-1 rounded-full text-[10px] font-bold mb-2 uppercase tracking-wider">
                                                Video Export Unlocked
                                            </div>
                                        </div>
                                        <VideoPlayerSection voiceType={voiceType} metrics={result.metrics} />
                                    </div>
                                ) : (
                                    <div className="bg-gradient-to-b from-gray-900 to-black border border-white/10 rounded-2xl p-6 text-center relative overflow-hidden">
                                        <div className="text-4xl mb-3">🎥</div>
                                        <h3 className="text-lg font-black text-white mb-1 uppercase tracking-tight">EXPORT YOUR RESULT VIDEO</h3>
                                        <p className="text-gray-400 text-xs mb-4 leading-relaxed max-w-xs mx-auto">
                                            Get a high-quality, watermark-free video of your analysis to share on Reels & TikTok. Save this moment forever.
                                        </p>
                                        <button
                                            onClick={() => handleCheckout('unlock')} // Using 'unlock' as per current setup for $4.99
                                            disabled={processingPayment}
                                            className="w-full btn-primary py-3 rounded-full text-sm font-bold uppercase tracking-widest shadow-lg shadow-cyan-500/20"
                                        >
                                            {processingPayment ? 'PROCESSING...' : '📥 DOWNLOAD VIDEO — $4.99'}
                                        </button>
                                        <div className="text-[8px] text-gray-600 mt-2 uppercase tracking-wide">
                                            INSTANT DOWNLOAD • HIGH QUALITY • NO WATERMARK
                                        </div>
                                    </div>
                                )}

                                {/* Footer & Share */}
                                <div className="pt-8 border-t border-white/5 space-y-8">
                                    <div className="text-center">
                                        <div className="text-[10px] text-cyan-500 font-bold mb-2 blink">✨ Perfect for your Bio, Slack status, or just to warn people.</div>
                                        <div className="bg-white/5 p-3 rounded-lg border border-white/5 font-mono text-[10px] text-left text-gray-300 relative group">
                                            <div className="absolute top-2 right-2 text-[8px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer hover:text-white">COPY</div>
                                            <div>{voiceType.icon} {voiceType.name}</div>
                                            <div className="text-gray-500">"{voiceType.catchphrase}"</div>
                                        </div>
                                    </div>

                                    <ShareButtons
                                        resultId={resultId}
                                        typeName={voiceType.name}
                                        typeIcon={voiceType.icon}
                                        catchphrase={voiceType.catchphrase}
                                        typeCode={result.typeCode}
                                    />

                                    <div className="text-center pb-12">
                                        <Link href="/" className="inline-block border border-cyan-500/50 text-cyan-400 px-8 py-3 rounded-full text-xs font-bold hover:bg-cyan-500/10 transition-colors uppercase tracking-widest">
                                            Start New Analysis
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </main>
    );
}

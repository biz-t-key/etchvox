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
                    <div className="animate-fade-in w-full space-y-20 section-spacing">
                        {/* Metrics Card */}
                        <div
                            className="glass rounded-3xl p-8 relative overflow-hidden border border-white/10"
                            style={{ boxShadow: `0 0 60px ${colors.primary}10` }}
                        >
                            <div className="flex flex-col items-center border-b border-white/5 pb-8 mb-8">
                                <span className="text-6xl mb-4 filter drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]">
                                    {voiceType.icon}
                                </span>
                                <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2 text-white">
                                    {voiceType.name}
                                </h1>
                                <div className="flex items-center gap-3 text-xs font-mono text-gray-500 uppercase tracking-widest">
                                    <span>ID: {result.typeCode}</span>
                                    <span className="w-1 h-1 rounded-full bg-gray-700" />
                                    <span>SESSION_{result.sessionId.slice(-4)}</span>
                                </div>
                            </div>

                            {/* Meters - Clean & Minimal */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                {[
                                    { label: 'Pitch', val: `${Math.round(result.metrics.pitch)} Hz`, color: 'text-cyan-400' },
                                    { label: 'Speed', val: `${Math.round(result.metrics.speed * 100)}%`, color: 'text-white' },
                                    { label: 'Vibe', val: `${Math.round(result.metrics.vibe * 100)}%`, color: 'text-yellow-400' },
                                    { label: 'Sync', val: `${result.metrics.humanityScore}%`, color: colors.primary === '#00FF66' ? 'text-green-400' : 'text-green-500' },
                                ].map((m) => (
                                    <div key={m.label} className="bg-black/40 rounded-xl p-4 border border-white/5 flex flex-col items-center justify-center h-24">
                                        <div className="text-[9px] text-gray-500 uppercase tracking-[0.2em] mb-2">{m.label}</div>
                                        <div className={`text-xl font-bold ${m.color} font-mono`}>{m.val}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Processing Indicator */}
                            {displayStage === 'metrics' && (
                                <div className="mt-8 text-center animate-bounce">
                                    <div className="text-gray-500 text-[10px] uppercase tracking-widest">Generating Report</div>
                                </div>
                            )}
                        </div>

                        {displayStage === 'full' && (
                            <div className="animate-slide-up space-y-20">
                                {/* MBTI / Truth Card Section */}
                                <div className="w-full">
                                    <div className="flex items-end justify-between mb-6 px-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1 h-6 bg-cyan-500" />
                                            <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em]">
                                                Truth Card
                                            </h2>
                                        </div>
                                        {selectedMBTI && !isPremium && (
                                            <button
                                                onClick={() => setSelectedMBTI(null)}
                                                className="text-[10px] text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
                                            >
                                                Edit
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
                                            <div className="flex justify-center mt-4">
                                                <div className="flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest border border-white/5 px-4 py-2 rounded-full bg-black/40">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                                    Screenshot to Save
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setMbtiSkipped(false)}
                                            className="w-full py-12 border border-dashed border-white/10 rounded-2xl text-gray-500 hover:text-white hover:border-white/30 transition-all text-xs uppercase tracking-[0.2em]"
                                        >
                                            + Add Behavioral Data
                                        </button>
                                    )}
                                </div>

                                {/* THE ROAST (Free) */}
                                <div>
                                    <div className="flex items-center gap-3 mb-6 px-1">
                                        <div className="w-1 h-6 bg-white/20" />
                                        <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em]">
                                            Analysis
                                        </h2>
                                    </div>
                                    <div className="bg-black/40 rounded-2xl p-8 border border-white/5 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10 grayscale text-6xl select-none">🔥</div>
                                        <p className="text-gray-300 leading-relaxed text-sm md:text-base font-medium relative z-10 w-[90%]">
                                            {voiceType.roast}
                                        </p>
                                    </div>
                                </div>

                                {/* Genetic Matches */}
                                <div className="w-full">
                                    <div className="flex items-center gap-3 mb-6 px-1">
                                        <div className="w-1 h-6 bg-purple-500" />
                                        <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em]">
                                            Matches
                                        </h2>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6">
                                        {/* Good Matches */}
                                        <div className="space-y-4">
                                            <div className="text-[10px] font-bold text-green-500 uppercase tracking-widest pl-1">Compatible Patterns</div>
                                            <div className="space-y-2">
                                                {bestMatches.slice(0, 3).map(({ type, score }) => (
                                                    <div key={type} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xl opacity-80">{voiceTypes[type].icon}</span>
                                                            <span className="text-xs font-bold text-gray-300 tracking-wide">{voiceTypes[type].name}</span>
                                                        </div>
                                                        <span className="font-mono text-xs text-green-400">{score}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Bad Matches */}
                                        <div className="space-y-4">
                                            <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest pl-1">Conflict Patterns</div>
                                            <div className="space-y-2">
                                                {worstMatches.slice(0, 3).map(({ type, score }) => (
                                                    <div key={type} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xl opacity-80">{voiceTypes[type].icon}</span>
                                                            <span className="text-xs font-bold text-gray-300 tracking-wide">{voiceTypes[type].name}</span>
                                                        </div>
                                                        <span className="font-mono text-xs text-red-500">{score}%</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* VIDEO EXPORT */}
                                <div className="w-full">
                                    <div className="flex items-center gap-3 mb-6 px-1">
                                        <div className="w-1 h-6 bg-pink-500" />
                                        <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em]">
                                            Export
                                        </h2>
                                    </div>

                                    {showVideo ? (
                                        <div className="space-y-4">
                                            <div className="text-center">
                                                <div className="inline-block border border-green-500/50 text-green-400 px-3 py-1 rounded text-[10px] font-bold mb-4 uppercase tracking-widest">
                                                    PREVIEW READY
                                                </div>
                                            </div>
                                            <VideoPlayerSection voiceType={voiceType} metrics={result.metrics} />
                                        </div>
                                    ) : (
                                        <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/10 rounded-2xl p-8 text-center relative overflow-hidden group">
                                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />

                                            <h3 className="text-xl font-bold text-white mb-2 uppercase tracking-wide">Video Export</h3>
                                            <p className="text-gray-400 text-xs mb-8 leading-relaxed max-w-sm mx-auto">
                                                Generate a high-definition, loopable video card for your social profiles.
                                            </p>

                                            <button
                                                onClick={() => handleCheckout('unlock')}
                                                disabled={processingPayment}
                                                className="w-full max-w-xs mx-auto bg-white text-black hover:bg-gray-200 py-3 rounded text-xs font-bold uppercase tracking-[0.2em] transition-all"
                                            >
                                                {processingPayment ? 'Processing...' : 'Download — $4.99'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {/* Footer & Share */}
                                <div className="pt-20 pb-20 border-t border-white/5 space-y-12">
                                    <div className="w-full">
                                        <div className="text-center mb-10">
                                            <div className="inline-block px-3 py-1 rounded bg-white/5 border border-white/10 text-[10px] text-gray-400 mb-6 uppercase tracking-widest">
                                                Copy for Bio
                                            </div>

                                            <div className="text-left bg-black border border-white/10 p-6 rounded-xl max-w-md mx-auto relative group hover:border-cyan-500/50 transition-colors cursor-pointer">
                                                <div className="flex items-center gap-4 mb-3">
                                                    <span className="text-2xl filter grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all">{voiceType.icon}</span>
                                                    <div>
                                                        <div className="text-white font-bold uppercase text-sm tracking-wide">{voiceType.name}</div>
                                                        <div className="text-cyan-600 font-mono text-[10px] tracking-widest">TYPE: {result.typeCode}</div>
                                                    </div>
                                                </div>
                                                <div className="text-gray-500 text-xs leading-relaxed pl-1 border-l border-white/10">
                                                    {voiceType.catchphrase}
                                                </div>
                                                <div className="absolute top-4 right-4 text-[9px] text-gray-600 font-bold uppercase tracking-widest group-hover:text-cyan-500">COPY</div>
                                            </div>
                                        </div>

                                        <ShareButtons
                                            resultId={resultId}
                                            typeName={voiceType.name}
                                            typeIcon={voiceType.icon}
                                            catchphrase={voiceType.catchphrase}
                                            typeCode={result.typeCode}
                                        />

                                        <div className="text-center mt-16">
                                            <Link href="/" className="text-[10px] text-gray-600 hover:text-white transition-colors uppercase tracking-[0.2em] border-b border-transparent hover:border-gray-500 pb-1">
                                                Start New Analysis
                                            </Link>
                                        </div>
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

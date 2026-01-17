'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';
import ReactMarkdown from 'react-markdown'; // ✅ Markdown Renderer
import { voiceTypes, TypeCode, groupColors } from '@/lib/types';
import { getResult, VoiceResult } from '@/lib/storage';
import { getBestMatches, getWorstMatches, getCompatibilityTier } from '@/lib/compatibilityMatrix';
import ShareButtons from '@/components/result/ShareButtons';
import MBTISelector from '@/components/result/MBTISelector';
import SoloIdentityCard from '@/components/result/SoloIdentityCard';
import DuoIdentityCard from '@/components/result/DuoIdentityCard';
import { VideoPlayerSection } from '@/components/video/VideoPlayerSection';
import { MBTIType } from '@/lib/mbti';
import { isFirebaseConfigured, getDb } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';

// Stripe is loaded on-demand when payment is triggered, not on page load
// This prevents console errors when NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set
const getStripe = () => {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key || key.trim() === '') {
        console.warn('Stripe publishable key not configured or empty');
        return null;
    }
    return loadStripe(key);
};

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

    const [showOTO, setShowOTO] = useState(false);

    // Initial Load
    useEffect(() => {
        async function loadResult() {
            try {
                const data = await getResult(resultId);
                if (data) {
                    setResult(data);
                    if (data.mbti) {
                        setSelectedMBTI(data.mbti as MBTIType); // Sync MBTI from saved data
                    }
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

    // ✅ Real-time updates: Listen for AI analysis completion
    useEffect(() => {
        if (!isFirebaseConfigured() || !resultId) return;

        const db = getDb();
        const resultRef = doc(db, 'results', resultId);

        const unsubscribe = onSnapshot(resultRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                setResult((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        aiAnalysis: data.aiAnalysis,
                        aiAnalysisError: data.aiAnalysisError,
                        isPremium: data.isPremium,
                        vaultEnabled: data.vaultEnabled,
                        mbti: data.mbti,
                        metrics: data.metrics || prev.metrics, // Keep previous or fallback
                    } as VoiceResult;
                });
                if (data.mbti && !selectedMBTI) {
                    setSelectedMBTI(data.mbti as MBTIType);
                }
            }
        }, (error) => {
            console.error('Firestore listener error:', error);
            // Optionally set error state here if result is lost
        });

        return () => unsubscribe();
    }, [resultId, selectedMBTI]);

    // ✅ Save MBTI to Firestore when selected
    const handleMBTISelect = async (mbti: MBTIType | null) => {
        if (!mbti) return; // Guard against null

        setSelectedMBTI(mbti);
        setMbtiSkipped(false);

        // Save to Firestore
        if (isFirebaseConfigured()) {
            try {
                const db = getDb();
                const resultRef = doc(db, 'results', resultId);
                await updateDoc(resultRef, { mbti });
                console.log('MBTI saved:', mbti);
            } catch (err) {
                console.error('Failed to save MBTI:', err);
            }
        }

        // Scroll to card
        setTimeout(() => {
            document.getElementById('identity-card')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
    };

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

    const isCouple = result.typeCode === 'COUPLE_MIX' || !!result.coupleData;
    const voiceType = voiceTypes[result.typeCode] || voiceTypes['HFCC']; // Robust fallback

    // Re-check after possible fallback
    const colors = groupColors[voiceType.group] || groupColors['special']; // Final safety
    const bestMatches = getBestMatches(result.typeCode);
    const worstMatches = getWorstMatches(result.typeCode);

    // Guaranteed metrics to prevent crashes
    const safeMetrics = result.metrics || { pitch: 0, speed: 0.5, vibe: 0.5, tone: 0, humanityScore: 0 };


    // Debugging logs to help identify why the crash happened in production
    if (!voiceTypes[result.typeCode]) {
        console.warn(`[ResultPage] Missing voice type data for code: ${result.typeCode}`);
    }

    // Check if premium (either from stored result or just successful payment)
    const isPremium = result.vaultEnabled === true || searchParams.get('payment') === 'success';
    // Note: If payment=success just happened, we might need to reload or update state manually if getResult is cached.
    // For now we assume standard reload flow or rely on isPremium check logic.
    // Actually, let's trust the 'result' object from getResult which should be updated if we navigated back.
    // However, if we didn't wait for webhook, simple param check is useful for instant feedback UI.
    const showVideo = result.vaultEnabled || (searchParams.get('payment') === 'success');

    return (
        <main className="min-h-screen bg-black text-white selection:bg-cyan-500/30 font-sans flex flex-col items-center overflow-x-hidden w-full relative">
            {/* OTO Modal Overlay */}
            {showOTO && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
                    <div className="bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/20 rounded-3xl p-6 md:p-10 max-w-lg w-full text-center relative shadow-[0_0_50px_rgba(236,72,153,0.3)]">
                        <div className="absolute top-4 right-4 text-gray-500 cursor-pointer hover:text-white" onClick={() => setShowOTO(false)}>✕</div>

                        <div className="text-[10px] text-cyan-400 font-bold uppercase tracking-[0.3em] mb-4 animate-pulse">
                            Wait! One-Time Offer
                        </div>

                        <h3 className="text-2xl md:text-3xl font-black text-white uppercase mb-2 tracking-tight">
                            Upgrade to Vault
                        </h3>
                        <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-violet-500 mb-6">
                            +$10.00
                        </div>

                        <ul className="text-left text-sm text-gray-300 space-y-3 mb-8 bg-white/5 p-6 rounded-xl border border-white/5">
                            <li className="flex items-center gap-3">
                                <span className="text-green-400">✓</span>
                                <span><strong>Permanent Video Storage:</strong> Never lose your analysis video.</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-green-400">✓</span>
                                <span><strong>Detailed PDF Report:</strong> Deep dive into your vocal psychology.</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-green-400">✓</span>
                                <span><strong>Priority Generation:</strong> Skip the queue for future updates.</span>
                            </li>
                        </ul>

                        <button
                            onClick={() => {
                                setShowOTO(false);
                                handleCheckout('vault');
                            }}
                            disabled={processingPayment}
                            className="w-full bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white font-black py-4 rounded-xl text-lg uppercase tracking-widest shadow-lg transform hover:scale-[1.02] transition-all mb-4"
                        >
                            Yes, Upgrade Me ($10.00)
                        </button>

                        <button
                            onClick={() => {
                                setShowOTO(false);
                                handleCheckout('unlock');
                            }}
                            disabled={processingPayment}
                            className="text-xs text-gray-500 hover:text-white underline decoration-gray-700 underline-offset-4 uppercase tracking-widest transition-colors"
                        >
                            No thanks, I'll take the video only ($4.99)
                        </button>
                    </div>
                </div>
            )}

            {/* Background Decoration */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[100px] opacity-20 animate-pulse-slow" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-pink-500/10 rounded-full blur-[100px] opacity-20 animate-pulse-slow delay-1000" />
            </div>

            <div className="relative z-10 w-full px-4 py-8 md:py-12 space-y-12 flex flex-col items-center text-center">
                {/* Header */}
                <header className="flex flex-col items-center justify-center space-y-4 w-full max-w-2xl">
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

                {/* STAGE 1: THE REVEAL */}
                {displayStage === 'label' && (
                    <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in text-center w-full max-w-2xl">
                        <div className="text-8xl mb-6 animate-bounce-slow filter drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
                            {voiceType.icon}
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white mb-4 tracking-tighter">
                            {voiceType.name}
                        </h2>
                        <div className="text-sm md:text-base font-mono text-cyan-500 tracking-[0.3em] uppercase opacity-80">
                            {result.typeCode}
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
                                {/* Voice Type Code - Large */}
                                <div className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-3 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white">
                                    {result.typeCode}
                                </div>
                                {/* Voice Type Name - Secondary */}
                                <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-tight mb-6 text-white/90">
                                    {voiceType.name}
                                </h1>
                                {/* Analysis - Below Name */}
                                <div className="max-w-lg text-center">
                                    <p className="text-gray-400 leading-relaxed text-sm md:text-base font-medium italic">
                                        {voiceType.roast}
                                    </p>
                                </div>
                            </div>

                            {/* Meters - Clean & Minimal */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                                {[
                                    { label: 'Pitch', val: `${Math.round(safeMetrics.pitch)} Hz`, color: 'text-cyan-400' },
                                    { label: 'Speed', val: `${Math.round(safeMetrics.speed * 100)}%`, color: 'text-white' },
                                    { label: 'Vibe', val: `${Math.round(safeMetrics.vibe * 100)}%`, color: 'text-yellow-400' },
                                    { label: 'Sync', val: `${safeMetrics.humanityScore}%`, color: colors.primary === '#00FF66' ? 'text-green-400' : 'text-green-500' },
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
                            <div className="animate-slide-up space-y-20 w-full max-w-2xl">
                                {/* MBTI / Truth Card Section */}
                                <div className="w-full">
                                    <div className="flex items-end justify-between mb-6 px-1">
                                        <div className="flex items-center gap-3">
                                            <div className="w-1 h-6 bg-cyan-500" />
                                            <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em]">
                                                {isCouple ? 'Duo Identity' : 'Truth Card'}
                                            </h2>
                                        </div>
                                        {selectedMBTI && !isPremium && !isCouple && (
                                            <button
                                                onClick={() => setSelectedMBTI(null)}
                                                className="text-[10px] text-gray-500 hover:text-white transition-colors uppercase tracking-widest"
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </div>

                                    {/* Duo/Solo Identity Card */}
                                    {isCouple && result.coupleData ? (
                                        <div id="identity-card" className="w-full">
                                            <DuoIdentityCard
                                                userA={result.coupleData.userA as any}
                                                userB={result.coupleData.userB as any}
                                                resultId={result.id}
                                            />
                                        </div>
                                    ) : (!selectedMBTI && !mbtiSkipped) ? (
                                        <MBTISelector
                                            onSelect={handleMBTISelect}
                                            onSkip={() => setMbtiSkipped(true)}
                                        />
                                    ) : (
                                        <div id="identity-card" className="w-full">
                                            <SoloIdentityCard
                                                mbti={(selectedMBTI || 'INTJ') as MBTIType}
                                                voiceTypeCode={result.typeCode}
                                                userName={result.id}
                                            />
                                        </div>
                                    )}
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

                                {/* AI AUDIT REPORT (PREMIUM) */}
                                {/* AI AUDIT REPORT (PREMIUM) */}
                                {(result.isPremium || result.aiAnalysis) && (
                                    <div className="w-full mb-12">
                                        <div className="flex items-center gap-3 mb-6 px-1">
                                            <div className="w-1 h-6 bg-cyan-500" />
                                            <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em]">
                                                AI Identity Audit
                                            </h2>
                                        </div>

                                        {result.aiAnalysis ? (
                                            <div className="bg-black/50 border border-cyan-500/30 rounded-2xl p-6 md:p-8 text-left space-y-4 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
                                                <div className="prose prose-invert prose-sm max-w-none">
                                                    <ReactMarkdown
                                                        components={{
                                                            h1: ({ node, ...props }) => <h1 className="text-2xl font-bold text-cyan-400 uppercase tracking-widest mb-4" {...props} />,
                                                            h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-white uppercase tracking-wide mt-6 mb-3" {...props} />,
                                                            h3: ({ node, ...props }) => <h3 className="text-lg font-semibold text-gray-200 mt-4 mb-2" {...props} />,
                                                            p: ({ node, ...props }) => <p className="text-gray-300 leading-relaxed mb-3" {...props} />,
                                                            ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-2 text-gray-300 ml-2" {...props} />,
                                                            ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-2 text-gray-300 ml-2" {...props} />,
                                                            li: ({ node, ...props }) => <li className="text-gray-300" {...props} />,
                                                            strong: ({ node, ...props }) => <strong className="text-cyan-400 font-bold" {...props} />,
                                                            em: ({ node, ...props }) => <em className="text-pink-400 italic" {...props} />,
                                                            code: ({ node, ...props }) => <code className="bg-white/10 px-2 py-1 rounded text-cyan-300 text-xs font-mono" {...props} />,
                                                        }}
                                                    >
                                                        {result.aiAnalysis}
                                                    </ReactMarkdown>
                                                </div>
                                                <div className="pt-4 border-t border-white/5 text-right">
                                                    <span className="text-[10px] text-cyan-500/70 uppercase tracking-widest font-bold">Generated by Gemini AI</span>
                                                </div>
                                            </div>
                                        ) : (result as any).aiAnalysisError ? (
                                            <div className="text-center p-12 border border-dashed border-red-500/30 rounded-xl bg-gradient-to-br from-red-500/5 to-transparent">
                                                <div className="text-4xl mb-4">⚠️</div>
                                                <div className="text-sm font-bold text-red-400 uppercase tracking-widest mb-3">Analysis Error</div>
                                                <div className="text-gray-400 text-xs max-w-md mx-auto leading-relaxed mb-4">
                                                    {(result as any).aiAnalysisError}
                                                </div>
                                                <a href="mailto:info@etchvox.com" className="text-cyan-400 text-xs underline hover:text-cyan-300">
                                                    Contact Support
                                                </a>
                                            </div>
                                        ) : (
                                            <div className="text-center p-12 border border-dashed border-cyan-500/30 rounded-xl bg-gradient-to-br from-cyan-500/5 to-transparent">
                                                <div className="w-16 h-16 mx-auto mb-4 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                                                <div className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-3">🧬 Neural Analysis In Progress</div>
                                                <div className="text-gray-400 text-xs max-w-xs mx-auto leading-relaxed">
                                                    Your vocal DNA is being decoded by the AI engine. This typically takes 10-20 seconds. The report will appear automatically—no need to reload.
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

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
                                            <VideoPlayerSection voiceType={voiceType} metrics={safeMetrics} />
                                        </div>
                                    ) : (
                                        <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/10 rounded-2xl overflow-hidden">
                                            {/* Blurred Preview */}
                                            <div className="blur-md opacity-30 pointer-events-none">
                                                <VideoPlayerSection voiceType={voiceType} metrics={safeMetrics} />
                                            </div>

                                            {/* Lock Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                                <div className="text-center p-8 max-w-md">
                                                    <div className="text-4xl mb-4">🔒</div>
                                                    <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">Unlock Video</h3>
                                                    <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                                                        Get your personalized voice × waveform visualization. High-quality, shareable video for your social profiles.
                                                    </p>

                                                    {/* Premium Option - $10 Vault */}
                                                    <div className="bg-gradient-to-br from-pink-500/10 to-violet-500/10 border-2 border-pink-500/30 rounded-xl p-6 mb-4">
                                                        <div className="text-[10px] text-pink-400 font-bold uppercase tracking-[0.3em] mb-2">
                                                            💎 Lifetime Access
                                                        </div>
                                                        <h4 className="text-xl font-black text-white uppercase mb-3">EtchVox Vault</h4>
                                                        <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-violet-400 mb-4">
                                                            $10.00
                                                        </div>

                                                        {/* THE SELL - Simplified Copy */}
                                                        <div className="text-center text-xs text-gray-400 mb-6">
                                                            <p className="mb-2">Human voices change <span className="text-yellow-400 font-bold">0.5%/year</span> due to stress and aging.</p>
                                                            <p className="text-pink-400">This is the youngest voice you have left.</p>
                                                        </div>

                                                        <ul className="text-left text-xs text-gray-300 space-y-2 mb-6">
                                                            <li className="flex items-center gap-2">
                                                                <span className="text-green-400">✓</span>
                                                                <span><strong>AI Identity Audit Report</strong></span>
                                                            </li>
                                                            <li className="flex items-center gap-2">
                                                                <span className="text-green-400">✓</span>
                                                                <span><strong>Permanent Raw Audio Storage</strong></span>
                                                            </li>
                                                            <li className="flex items-center gap-2">
                                                                <span className="text-green-400">✓</span>
                                                                <span>High-quality downloadable video</span>
                                                            </li>
                                                            <li className="flex items-center gap-2">
                                                                <span className="text-green-400">✓</span>
                                                                <span>Track your voice evolution over time</span>
                                                            </li>
                                                        </ul>
                                                        <button
                                                            onClick={() => handleCheckout('vault')}
                                                            disabled={processingPayment}
                                                            className="w-full bg-gradient-to-r from-pink-600 to-violet-600 hover:from-pink-500 hover:to-violet-500 text-white font-bold py-4 rounded-xl text-sm uppercase tracking-widest shadow-lg transform hover:scale-[1.02] transition-all"
                                                        >
                                                            {processingPayment ? 'Processing...' : 'Preserve My Voice — $10.00'}
                                                        </button>
                                                    </div>

                                                    {/* Basic Option - $5 Video Only */}
                                                    <div className="border border-white/10 rounded-xl p-4">
                                                        <h4 className="text-sm font-bold text-gray-300 uppercase mb-1">Video Only</h4>
                                                        <div className="text-xl font-black text-cyan-400 mb-3">
                                                            $5.00
                                                        </div>
                                                        <button
                                                            onClick={() => handleCheckout('unlock')}
                                                            disabled={processingPayment}
                                                            className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all"
                                                        >
                                                            {processingPayment ? 'Processing...' : 'Video Only — $5.00'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* COPY FOR BIO - Independent Section */}
                                <div className="w-full">
                                    <div className="flex items-center gap-3 mb-6 px-1">
                                        <div className="w-1 h-6 bg-cyan-500" />
                                        <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em]">
                                            Copy for Bio
                                        </h2>
                                    </div>
                                    <div className="bg-black border border-white/10 p-6 rounded-xl relative group hover:border-cyan-500/50 transition-colors cursor-pointer" onClick={() => {
                                        navigator.clipboard.writeText(`${voiceType.icon} ${voiceType.name} | ${result.typeCode}\n${voiceType.catchphrase}`);
                                        // Ideally add a toast here
                                    }}>
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

                                {/* Footer & Share */}
                                <div className="pt-20 pb-20 border-t border-white/5 space-y-12">
                                    <div className="w-full">
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
        </main >
    );
}

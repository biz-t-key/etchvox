'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown'; // ✅ Markdown Renderer
import { voiceTypes, TypeCode, groupColors } from '@/lib/types';
import { getResult, VoiceResult } from '@/lib/storage';
import { getBestMatches, getWorstMatches, getCompatibilityTier } from '@/lib/compatibilityMatrix';
import ShareButtons from '@/components/result/ShareButtons';
import HighFidelityMetrics from '@/components/result/HighFidelityMetrics';
import ToxicitySelector from '@/components/recording/ToxicitySelector';
import SoloIdentityCard from '@/components/result/SoloIdentityCard';
import DuoIdentityCard from '@/components/result/DuoIdentityCard';
import { VideoPlayerSection } from '@/components/video/VideoPlayerSection';
import { MBTIType } from '@/lib/mbti';
import { isFirebaseConfigured, getDb } from '@/lib/firebase';
import { doc, onSnapshot, updateDoc, getDoc } from 'firebase/firestore';
import { FEATURE_FLAGS } from '@/config/features';
import { getUnlockedFeatures, FeatureState } from '@/config/milestones';
import { calculateDrift, getDriftNarrative } from '@/lib/drift';
import { DriftAnalysis } from '@/lib/types';
import VoiceTimelineGraph from '@/components/result/VoiceTimelineGraph';
import SpyReportCard from '@/components/result/SpyReportCard';
import { generateFinalReport } from '@/lib/analyzer';


type DisplayStage = 'label' | 'metrics' | 'full';

export default function ResultPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const resultId = params.id as string;

    const [result, setResult] = useState<VoiceResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [drift, setDrift] = useState<DriftAnalysis | null>(null);
    const [fullHistory, setFullHistory] = useState<VoiceResult[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [processingPayment, setProcessingPayment] = useState(false);
    const [verifyingPayment, setVerifyingPayment] = useState(false); // New state for post-redirect
    const [displayStage, setDisplayStage] = useState<DisplayStage>('label');
    const [selectedMBTI, setSelectedMBTI] = useState<MBTIType | null>(null);
    const [mbtiSkipped, setMbtiSkipped] = useState(false);
    const [features, setFeatures] = useState<FeatureState>({
        isSoloPurchaseUnlocked: false,
        isCoupleModeUnlocked: false,
        isCouplePurchaseUnlocked: false,
        currentAmount: 0
    });

    const [showOTO, setShowOTO] = useState(false);
    const [isPurged, setIsPurged] = useState(false);

    const isSpyMode = result?.typeCode === 'HIRED' || result?.typeCode === 'SUSP' || result?.typeCode === 'REJT' || result?.typeCode === 'BURN' || !!result?.spyMetadata;

    function executeHardPurge() {
        if (typeof window === 'undefined') return;
        console.warn("INITIATING HARD PURGE PROTOCOL...");

        // 1. Clear memory (explicit direction to GC)
        (window as any).analysisResult = null;
        (window as any).vocalVector = null;
        (window as any).recordedBlob = null;

        // 2. Clear persistence
        localStorage.clear();
        sessionStorage.clear();

        // 3. Prevent going back
        window.history.replaceState(null, '', window.location.origin);

        // 4. Delete IndexedDB caches
        const DB_NAME = 'EtchVoxCache';
        indexedDB.deleteDatabase(DB_NAME);

        // 5. Hard redirect
        setTimeout(() => {
            window.location.replace(window.location.origin + '?status=purged');
        }, 500);
    }

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

                    // Calculate Drift if multiple records exist
                    const historyIds = JSON.parse(localStorage.getItem('etchvox_history') || '[]');
                    if (historyIds.length > 1) {
                        // Find baseline (the oldest in tracked history)
                        // historyIds are stored with newest first, so the last element is the oldest.
                        const baselineId = historyIds[historyIds.length - 1];
                        if (baselineId !== data.id) { // Ensure we're not comparing to itself
                            const baselineData = localStorage.getItem(`etchvox_result_${baselineId}`);
                            if (baselineData) {
                                const baseline = JSON.parse(baselineData) as VoiceResult;
                                const driftResult = calculateDrift(baseline.metrics, data.metrics, baseline.createdAt);
                                setDrift(driftResult);
                            }
                        }

                        // Fetch Full History context for Timeline
                        const loadedHistory: VoiceResult[] = [];
                        for (const id of historyIds) {
                            const stored = localStorage.getItem(`etchvox_result_${id}`);
                            if (stored) loadedHistory.push(JSON.parse(stored));
                        }
                        setFullHistory(loadedHistory);
                    }
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

        // Check query params for payment success
        if (searchParams.get('payment') === 'success') {
            setVerifyingPayment(true);
            // Remove param from URL to clean up without refresh
            window.history.replaceState({}, '', `/result/${resultId}`);
        }
    }, [resultId]); // Removed searchParams to avoid loop, it's read once on mount

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
                        metrics: data.metrics || prev.metrics,
                    } as VoiceResult;
                });

                if (data.isPremium) {
                    setVerifyingPayment(false);
                }

                if (data.mbti && !selectedMBTI) {
                    setSelectedMBTI(data.mbti as MBTIType);
                }
            }
        }, (error) => {
            console.error('Firestore listener error:', error);
        });

        // Track Community Goals
        const statsRef = doc(db, 'stats', 'global');
        const unsubStats = onSnapshot(statsRef, (snapshot) => {
            if (snapshot.exists()) {
                const amount = snapshot.data().totalAmount || 0;
                setFeatures(getUnlockedFeatures(amount));
            }
        });

        return () => {
            unsubscribe();
            unsubStats();
        };
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

    const handleCheckout = async (type: 'unlock' | 'vault' | 'couple') => {
        setProcessingPayment(true);

        const bmacHandle = FEATURE_FLAGS.BMAC_HANDLE;
        let bmacUrl = "";

        if (type === 'vault') {
            // Solo Vault - Use fixed product URL
            bmacUrl = `https://buymeacoffee.com/${bmacHandle}/e/502513`;
        } else if (type === 'couple') {
            // Couple Resonance - Use fixed product URL
            bmacUrl = `https://buymeacoffee.com/${bmacHandle}/e/502517`;
        } else {
            // Fallback for Unlock ($5) until Extras URL is provided
            const amount = 5;
            const message = encodeURIComponent(`ID: ${resultId}`);
            bmacUrl = `https://buymeacoffee.com/${bmacHandle}/?amount=${amount}&message=${message}`;
        }

        window.open(bmacUrl, '_blank');
        setVerifyingPayment(true);
        setProcessingPayment(false);
    };

    const handleSpyBurn = async () => {
        try {
            await fetch('/api/results/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resultId })
            });
            setIsPurged(true);
        } catch (err) {
            console.error("Failed to purge spy data:", err);
            setIsPurged(true);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (isPurged) {
        return (
            <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 font-mono">
                <div className="max-w-md w-full">
                    <div className="text-white text-sm md:text-base mb-12 border-l-4 border-red-600 pl-6 space-y-2 opacity-80">
                        <p className="tracking-widest animate-pulse">&gt; DATA PURGED.</p>
                        <p className="tracking-widest animate-pulse delay-75">&gt; EVIDENCE DESTROYED.</p>
                        <p className="tracking-widest animate-pulse delay-150">&gt; CONNECTION TERMINATED.</p>
                    </div>
                    <button
                        onClick={() => window.location.href = '/'}
                        className="w-full border border-zinc-800 text-zinc-600 hover:border-cyan-500 hover:text-cyan-500 py-4 rounded transition-all uppercase text-xs tracking-[0.3em]"
                    >
                        START NEW MISSION
                    </button>
                </div>
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
    const isPremium = result.isPremium === true || result.vaultEnabled === true || searchParams.get('payment') === 'success';

    // Logic for specific features
    const showAIReport = result.vaultEnabled === true ||
        (searchParams.get('payment') === 'success' && searchParams.get('type') !== 'unlock');

    const showVideo = isPremium; // Any payment unlocks video

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
                                <span><strong>Deep AI Identity Audit:</strong> Gap analysis of your voice vs MBTI.</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-green-400">✓</span>
                                <span><strong>Permanent Voice Storage:</strong> Track your vocal evolution over time.</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <span className="text-green-400">✓</span>
                                <span><strong>High-Quality Video:</strong> Unlock your shareable visualization.</span>
                            </li>
                        </ul>

                        <button
                            onClick={() => {
                                setShowOTO(false);
                                handleCheckout('vault');
                            }}
                            disabled={processingPayment}
                            className="w-full btn-amber py-6 mb-4 text-xl"
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
                            No thanks, I'll take the video only ($5.00)
                        </button>
                    </div>
                </div>
            )}

            {/* Background Decoration */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className={`absolute top-[-20%] left-[-10%] w-[600px] h-[600px] ${isCouple ? 'bg-pink-500/10' : 'bg-cyan-500/10'} rounded-full blur-[100px] opacity-20 animate-pulse-slow`} />
                <div className={`absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] ${isCouple ? 'bg-cyan-500/10' : 'bg-pink-500/10'} rounded-full blur-[100px] opacity-20 animate-pulse-slow delay-1000`} />
            </div>

            <div className="relative z-10 w-full px-4 py-20 md:py-48 space-y-32 flex flex-col items-center text-center">
                {/* Header */}
                <header className="flex flex-col items-center justify-center space-y-4 w-full max-w-2xl px-4">
                    <Link
                        href="/"
                        className="text-[10px] font-black tracking-[0.4em] text-gray-600 hover:text-white transition-colors duration-300 uppercase"
                    >
                        ← [ NEW_ANALYSIS_PROTOCOL ]
                    </Link>
                    <div className="relative pt-4">
                        <h1 className={`text-2xl md:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${isCouple ? 'from-pink-400 to-pink-200' : 'from-cyan-400 to-cyan-200'} drop-shadow-[0_0_15px_${isCouple ? 'rgba(236,72,153,0.5)' : 'rgba(34,211,238,0.5)'}] uppercase tracking-widest`}>
                            {isCouple ? 'Resonance Report' : 'Identity Audit'}
                        </h1>
                        <div className={`absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-0.5 ${isCouple ? 'bg-pink-500' : 'bg-cyan-500'} rounded-full blur-[1px]`} />
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
                    <div className="animate-fade-in w-full space-y-24 md:space-y-40 pt-12 flex flex-col items-center">
                        {isSpyMode ? (
                            <div className="w-full max-w-lg mx-auto">
                                <SpyReportCard
                                    typeCode={result.typeCode}
                                    spyMetadata={result.spyMetadata!}
                                    score={result.spyAnalysis?.score || 0}
                                    reportMessage={generateFinalReport(
                                        result.spyAnalysis ? { stamp: result.typeCode, ...result.spyAnalysis } : { stamp: result.typeCode },
                                        result.spyMetadata!
                                    )}
                                    onBurn={handleSpyBurn}
                                    autoBurn={!result.researchConsentAgreed}
                                />
                                <div className="mt-12 flex justify-center">
                                    <button
                                        onClick={executeHardPurge}
                                        className="text-[10px] font-black uppercase tracking-[0.4em] text-red-600/60 hover:text-red-500 transition-colors border border-red-500/20 px-6 py-2 rounded hover:bg-red-500/5"
                                    >
                                        [ Execute Hard Purge ]
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Metrics Card - Balanced & Cinematic */
                            <div
                                className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden border border-white/10 w-full max-w-4xl mx-auto"
                                style={{ boxShadow: `0 0 60px ${colors.primary}10` }}
                            >
                                <div className="flex flex-col items-center border-b border-white/5 pb-8 mb-8 text-center">
                                    <span className="text-6xl mb-6 filter drop-shadow-[0_0_25px_rgba(255,255,255,0.15)]">
                                        {voiceType.icon}
                                    </span>
                                    <div className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-white">
                                        {result.typeCode}
                                    </div>
                                    <h1 className="text-2xl md:text-4xl font-bold uppercase tracking-tight mb-8 text-white/90">
                                        {voiceType.name}
                                    </h1>
                                    <div className="max-w-2xl">
                                        <p className="text-gray-400 leading-relaxed text-base md:text-lg font-medium italic">
                                            "{voiceType.roast}"
                                        </p>
                                    </div>
                                </div>

                                {/* Meters - Responsive Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                                    {[
                                        { label: 'Pitch', val: `${Math.round(safeMetrics.pitch)} Hz`, color: 'text-cyan-400' },
                                        { label: 'Speed', val: `${Math.round(safeMetrics.speed * 100)}%`, color: 'text-white' },
                                        { label: 'Vibe', val: `${Math.round(safeMetrics.vibe * 100)}%`, color: 'text-yellow-400' },
                                        { label: 'Sync', val: `${safeMetrics.humanityScore}%`, color: colors.primary === '#00FF66' ? 'text-green-400' : 'text-green-500' },
                                    ].map((m) => (
                                        <div key={m.label} className="bg-black/40 rounded-2xl p-6 border border-white/5 flex flex-col items-center justify-center transition-all hover:border-white/10 hover:bg-black/60 group/meter">
                                            <div className="text-[10px] text-gray-500 uppercase tracking-[0.2em] mb-2 group-hover/meter:text-gray-400 transition-colors">{m.label}</div>
                                            <div className={`text-2xl font-bold ${m.color} font-mono`}>{m.val}</div>
                                        </div>
                                    ))}
                                </div>

                                {displayStage === 'metrics' && (
                                    <div className="mt-12 text-center animate-pulse">
                                        <div className="text-gray-500 text-[10px] uppercase tracking-[0.3em] font-black">Decrypting Neural Signal...</div>
                                    </div>
                                )}
                            </div>
                        )}

                        {displayStage === 'full' && !isSpyMode && (
                            <div className="animate-slide-up space-y-32 md:space-y-48 w-full flex flex-col items-center">

                                {/* Main Layout Grid for PC */}
                                <div className="grid lg:grid-cols-12 gap-12 md:gap-20 w-full max-w-6xl items-start">

                                    {/* LEFT: TRUTH CARD (Larger on PC) */}
                                    <div className="lg:col-span-7 space-y-12">
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="w-1 h-6 bg-cyan-500" />
                                            <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em]">
                                                {isCouple ? 'Duo Identity' : 'Truth Card'}
                                            </h2>
                                        </div>

                                        <div id="identity-card" className="w-full">
                                            {isCouple && result.coupleData ? (
                                                <DuoIdentityCard
                                                    userA={result.coupleData.userA as any}
                                                    userB={result.coupleData.userB as any}
                                                    resultId={result.id}
                                                />
                                            ) : (
                                                <SoloIdentityCard
                                                    mbti={(result.mbti || 'INTJ') as MBTIType}
                                                    voiceTypeCode={result.typeCode}
                                                    userName={result.id}
                                                    metrics={safeMetrics}
                                                />
                                            )}
                                        </div>
                                    </div>

                                    {/* RIGHT: MATCHES & BIO */}
                                    <div className="lg:col-span-5 space-y-20">
                                        {/* Genetic Matches */}
                                        <div className="w-full">
                                            <div className="flex items-center gap-3 mb-10">
                                                <div className="w-1 h-6 bg-purple-500" />
                                                <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em]">
                                                    Matches
                                                </h2>
                                            </div>

                                            <div className="grid gap-4">
                                                {/* Good Matches */}
                                                <div className="space-y-4">
                                                    <div className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Compatible Patterns</div>
                                                    <div className="space-y-2">
                                                        {bestMatches.slice(0, 3).map(({ type, score }) => (
                                                            <div key={type} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-xl opacity-80">{voiceTypes[type].icon}</span>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-bold text-white tracking-wide">{voiceTypes[type].name}</span>
                                                                        <span className="text-[9px] font-mono text-cyan-600 uppercase tracking-widest">{type}</span>
                                                                    </div>
                                                                </div>
                                                                <span className="font-mono text-sm text-green-400">{score}%</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Bad Matches */}
                                                <div className="space-y-4 mt-6">
                                                    <div className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Conflict Patterns</div>
                                                    <div className="space-y-2">
                                                        {worstMatches.slice(0, 3).map(({ type, score }) => (
                                                            <div key={type} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/10 transition-colors">
                                                                <div className="flex items-center gap-3">
                                                                    <span className="text-xl opacity-80">{voiceTypes[type].icon}</span>
                                                                    <div className="flex flex-col">
                                                                        <span className="text-sm font-bold text-white tracking-wide">{voiceTypes[type].name}</span>
                                                                        <span className="text-[9px] font-mono text-red-700 uppercase tracking-widest">{type}</span>
                                                                    </div>
                                                                </div>
                                                                <span className="font-mono text-sm text-red-500">{score}%</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* COPY FOR BIO - Integrated into side column */}
                                        <div className="w-full">
                                            <div className="flex items-center gap-3 mb-10">
                                                <div className="w-1 h-6 bg-cyan-500" />
                                                <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em]">
                                                    Social Bio
                                                </h2>
                                            </div>
                                            <div className="bg-black/40 border border-white/10 p-6 rounded-2xl relative group hover:border-cyan-500/50 transition-all cursor-pointer glass" onClick={() => {
                                                navigator.clipboard.writeText(`${voiceType.icon} ${voiceType.name} | ${result.typeCode}\n${voiceType.catchphrase}`);
                                            }}>
                                                <div className="flex items-center gap-4 mb-4">
                                                    <span className="text-2xl filter grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100 transition-all">{voiceType.icon}</span>
                                                    <div>
                                                        <div className="text-white font-bold uppercase text-sm tracking-wide">{voiceType.name}</div>
                                                        <div className="text-cyan-600 font-mono text-[9px] tracking-widest uppercase">TYPE: {result.typeCode}</div>
                                                    </div>
                                                </div>
                                                <p className="text-gray-300 text-sm leading-relaxed italic border-l-2 border-cyan-500/50 pl-4 mb-4">
                                                    "{voiceType.catchphrase}"
                                                </p>
                                                <div className="text-[10px] text-gray-500 font-medium">
                                                    ✨ Perfect for your Bio or Slack status.
                                                </div>
                                                <div className="absolute top-4 right-4 text-[8px] text-gray-600 font-bold uppercase tracking-widest group-hover:text-cyan-500">COPY</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* AI AUDIT REPORT (PREMIUM) */}
                                {showAIReport && (
                                    <div className="w-full mb-12">
                                        <div className="flex items-center gap-3 mb-12 px-1">
                                            <div className={`w-1 h-6 ${isCouple ? 'bg-pink-500' : 'bg-cyan-500'}`} />
                                            <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em]">
                                                {isCouple ? 'Acoustic Dynamic Analysis' : 'Full Identity Audit'}
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

                                        {/* Phase 2: High Fidelity Audit log */}
                                        {isPremium && result.logV2 && (
                                            <div className="space-y-20">
                                                <section className="mt-20">
                                                    <HighFidelityMetrics log={result.logV2} />
                                                </section>

                                                {fullHistory.length >= 2 && (
                                                    <section className="mt-20">
                                                        <VoiceTimelineGraph history={fullHistory} />
                                                    </section>
                                                )}
                                            </div>
                                        )}

                                        {/* Phase 2: Voice Drift Analysis */}
                                        {drift && (
                                            <section className="mt-20 glass rounded-3xl p-8 border border-magenta-500/30 relative overflow-hidden group">
                                                <div className="absolute top-0 right-0 p-4 opacity-20">
                                                    <span className="text-4xl">📊</span>
                                                </div>

                                                <div className="relative z-10 space-y-6 text-center md:text-left">
                                                    <div>
                                                        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 italic">
                                                            Voice Drift Detected
                                                        </h3>
                                                        <p className="text-gray-400 text-sm font-mono uppercase tracking-[0.2em]">
                                                            Status: <span className={
                                                                drift.status === 'STABLE' ? 'text-green-400' :
                                                                    drift.status === 'UPGRADE' ? 'text-cyan-400' :
                                                                        'text-red-400'
                                                            }>{drift.status}</span>
                                                        </p>
                                                    </div>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                                        <DriftStat label="Drift Rate" value={`${drift.driftRate > 0 ? '+' : ''}${drift.driftRate}%`} color={drift.driftRate > 0 ? 'text-cyan-400' : 'text-red-400'} />
                                                        <DriftStat label="Pitch Shift" value={`${drift.changes.pitch > 0 ? '+' : ''}${drift.changes.pitch}%`} />
                                                        <DriftStat label="Tone Shift" value={`${drift.changes.tone > 0 ? '+' : ''}${drift.changes.tone}%`} />
                                                        <DriftStat label="Days Elapsed" value={drift.daysSince} />
                                                    </div>

                                                    <div className="bg-black/40 border border-white/5 p-4 rounded-xl">
                                                        <p className="text-gray-300 text-sm leading-relaxed italic">
                                                            "{getDriftNarrative(drift)}"
                                                        </p>
                                                    </div>

                                                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest pt-4">
                                                        Baseline: {new Date(drift.baselineDate).toLocaleDateString()} · Comparison: Latest vs Original
                                                    </p>
                                                </div>
                                            </section>
                                        )}
                                    </div>
                                )}

                                {/* EXPORT / UNLOCK SECTION */}
                                <div className="w-full max-w-4xl mt-32 md:mt-48">
                                    <div className="flex items-center gap-3 mb-12 px-1 justify-center">
                                        <div className="w-1 h-6 bg-pink-500" />
                                        <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em]">
                                            Export Vault
                                        </h2>
                                    </div>

                                    {/* Video / Lock Section */}
                                    {(showVideo || verifyingPayment) ? (
                                        <div className="space-y-4">
                                            {verifyingPayment && !showVideo ? (
                                                <div className="relative bg-black/50 border border-cyan-500/50 rounded-2xl p-12 text-center animate-pulse">
                                                    <div className="text-4xl mb-4 animate-spin">💠</div>
                                                    <h3 className="text-xl font-bold text-cyan-400 mb-2">FINALIZING DECRYPTION</h3>
                                                    <div className="text-gray-400 text-xs">Verifying blockchain signature & generating audit...</div>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="text-center">
                                                        <div className={`inline-block border ${isCouple ? 'border-pink-500/50 text-pink-400' : 'border-green-500/50 text-green-400'} px-3 py-1 rounded text-[10px] font-bold mb-4 uppercase tracking-widest`}>
                                                            {isCouple ? 'SYMMETRY FOUND' : 'PREVIEW READY'}
                                                        </div>
                                                    </div>
                                                    <VideoPlayerSection voiceType={voiceType} metrics={safeMetrics} />
                                                </>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 border border-white/10 rounded-2xl overflow-hidden">
                                            {/* Video Preview */}
                                            <div className="blur-md opacity-30 pointer-events-none">
                                                <VideoPlayerSection voiceType={voiceType} metrics={safeMetrics} />
                                            </div>

                                            {/* Lock Overlay */}
                                            <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                                                <div className="text-center p-8 max-w-md">
                                                    <div className="text-4xl mb-4">🔒</div>
                                                    <h3 className="text-2xl font-bold text-white mb-2 uppercase tracking-wide">
                                                        {isCouple ? 'Decode Resonance' : 'Unlock Video'}
                                                    </h3>
                                                    <p className="text-gray-400 text-sm mb-8 leading-relaxed">
                                                        {isCouple
                                                            ? 'Get your synchronized relationship visualization. A breakdown of your vocal symmetry.'
                                                            : 'Get your personalized voice × waveform visualization. High-quality, shareable video for your social profiles.'}
                                                    </p>

                                                    {/* Goal Management / Kill-Switch logic */}
                                                    {FEATURE_FLAGS.DISABLE_PAYMENTS ? (
                                                        <div className="bg-white/5 border border-white/10 rounded-xl p-8 text-center">
                                                            <div className="text-3xl mb-4">✨</div>
                                                            <p className="text-gray-300 text-sm leading-relaxed italic">
                                                                {FEATURE_FLAGS.PAYMENT_DISABLED_MESSAGE}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            {/* Premium Option - $10 / $15 Vault (Community Unlocked) */}
                                                            <div className={`bg-gradient-to-br ${isCouple ? 'from-pink-500/10 to-cyan-500/10 border-pink-500/30' : 'from-pink-500/10 to-violet-500/10 border-pink-500/30'} border-2 rounded-xl p-6 mb-4`}>
                                                                <div className={`text-[10px] ${isCouple ? 'text-cyan-400' : 'text-pink-400'} font-bold uppercase tracking-[0.3em] mb-2`}>
                                                                    💎 {isCouple ? 'RESONANCE DECRYPTED' : 'LIFETIME ACCESS'}
                                                                </div>
                                                                <h4 className="text-xl font-black text-white uppercase mb-3">
                                                                    {isCouple ? 'Couple Vault' : 'EtchVox Vault'}
                                                                </h4>
                                                                <div className={`text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r ${isCouple ? 'from-pink-400 to-cyan-400' : 'from-pink-400 to-violet-400'} mb-4`}>
                                                                    {isCouple ? '$15.00' : '$10.00'}
                                                                </div>

                                                                {/* THE SELL - Simplified Copy */}
                                                                <div className="text-center text-xs text-gray-400 mb-6">
                                                                    {isCouple ? (
                                                                        <>
                                                                            <p className="mb-2">Relationships thrive on <span className="text-cyan-400 font-bold">Resonance</span>, not just words.</p>
                                                                            <p className="text-pink-400">Decode your hidden dynamic.</p>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <p className="mb-2">Human voices change <span className="text-yellow-400 font-bold">0.5%/year</span> due to stress and aging.</p>
                                                                            <p className="text-pink-400">This is the youngest voice you have left.</p>
                                                                        </>
                                                                    )}
                                                                </div>

                                                                <ul className="text-left text-xs text-gray-300 space-y-3 mb-8">
                                                                    <li className="flex items-start gap-2">
                                                                        <span className="text-green-400 mt-1">✓</span>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-bold">{isCouple ? 'Deep Compatibility Audit' : 'AI Identity Audit Report'}</span>
                                                                            <span className="text-[10px] text-gray-500">Exhaustive personality analysis & vocal fingerprint.</span>
                                                                        </div>
                                                                    </li>
                                                                    <li className="flex items-start gap-2">
                                                                        <span className="text-green-400 mt-1">✓</span>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-bold">{isCouple ? 'Permanent Vaulting' : 'Lifetime Audio Storage'}</span>
                                                                            <span className="text-[10px] text-gray-500">Prevent automatic deletion after 30 days. Your voice is archived forever.</span>
                                                                        </div>
                                                                    </li>
                                                                    <li className="flex items-start gap-2">
                                                                        <span className="text-green-400 mt-1">✓</span>
                                                                        <div className="flex flex-col">
                                                                            <span className="font-bold">Social Video Master</span>
                                                                            <span className="text-[10px] text-gray-500">High-fidelity 4K visualizer export for sharing.</span>
                                                                        </div>
                                                                    </li>
                                                                </ul>

                                                                <div className="text-[9px] text-center text-gray-500 uppercase tracking-widest mb-4 font-mono">
                                                                    🔒 One-Time Purchase · Permanent Access
                                                                </div>

                                                                <button
                                                                    onClick={() => handleCheckout(isCouple ? 'couple' : 'vault')}
                                                                    disabled={processingPayment}
                                                                    className={`w-full bg-gradient-to-r ${isCouple ? 'from-pink-600 to-cyan-600' : 'from-pink-600 to-violet-600'} hover:opacity-90 text-white font-bold py-4 rounded-xl text-sm uppercase tracking-widest shadow-lg transform hover:scale-[1.02] transition-all`}
                                                                >
                                                                    {processingPayment ? 'Processing...' : isCouple ? 'Unlock Compatibility — $15.00' : 'Secure Vault Access — $10.00'}
                                                                </button>

                                                                <p className="mt-4 text-[10px] text-gray-500 italic">
                                                                    *Non-vault audio data is automatically purged from our servers after 30 days for your privacy.
                                                                </p>
                                                            </div>

                                                            {/* Basic Option - Controlled by Flag */}
                                                            {FEATURE_FLAGS.ENABLE_BASIC_UNLOCK && (
                                                                <div className="mt-8 border border-white/10 rounded-xl p-4">
                                                                    <h4 className="text-sm font-bold text-gray-300 uppercase mb-1">Standard Export</h4>
                                                                    <p className="text-[10px] text-gray-500 mb-3 italic">Waveform Visualizer • MP4 Format</p>
                                                                    <div className={`text-xl font-black ${isCouple ? 'text-pink-400' : 'text-cyan-400'} mb-3`}>
                                                                        $5.00
                                                                    </div>
                                                                    <button
                                                                        onClick={() => handleCheckout('vault')}
                                                                        disabled={processingPayment}
                                                                        className="w-full btn-metallic py-8 rounded-sm mb-4 text-lg"
                                                                    >
                                                                        {processingPayment ? 'SECURE_TUNNEL_ESTABLISHED...' : '🔓 SECURE MY LEGACY'}
                                                                    </button>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* SHARE SECTION */}
                                <div className="w-full max-w-2xl mx-auto pt-32 pb-48 space-y-20 border-t border-white/5">
                                    <ShareButtons
                                        resultId={resultId}
                                        typeName={voiceType.name}
                                        typeIcon={voiceType.icon}
                                        catchphrase={voiceType.catchphrase}
                                        typeCode={result.typeCode}
                                    />

                                    <div className="text-center space-y-6">
                                        <div className="flex justify-center gap-8 uppercase tracking-[0.2em] font-mono text-[10px] text-gray-500">
                                            <Link href="/terms" className="hover:text-cyan-400 transition-colors">Terms</Link>
                                            <Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy</Link>
                                            <a
                                                href={`https://buymeacoffee.com/${FEATURE_FLAGS.BMAC_HANDLE}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-amber-500 hover:text-amber-400 transition-colors"
                                            >
                                                Support
                                            </a>
                                        </div>
                                        <Link href="/" className="inline-block text-[11px] text-gray-600 hover:text-white transition-colors uppercase tracking-[0.3em] border-b border-transparent hover:border-gray-500 pb-1 font-black">
                                            [ START NEW ANALYSIS ]
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

function DriftStat({ label, value, color = "text-white" }: { label: string, value: string | number, color?: string }) {
    return (
        <div className="space-y-1">
            <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">{label}</p>
            <p className={`text-xl font-mono font-black ${color}`}>{value}</p>
        </div>
    );
}

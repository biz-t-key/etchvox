'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown'; // ✅ Markdown Renderer
import { voiceTypes, TypeCode, groupColors } from '@/lib/types';
import { getResult, VoiceResult, removeFromHistory } from '@/lib/storage';
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
import { POLAR_CONFIG } from '@/config/features';
import { checkSubscription } from '@/lib/subscription';


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
    const [displayStage, setDisplayStage] = useState<DisplayStage>('label');
    const [cardImageUrl, setCardImageUrl] = useState<string | null>(null);
    const [selectedMBTI, setSelectedMBTI] = useState<MBTIType | null>(null);
    const [mbtiSkipped, setMbtiSkipped] = useState(false);
    const [showOTO, setShowOTO] = useState(false);
    const [isPurged, setIsPurged] = useState(false);
    const [isHoldingPurge, setIsHoldingPurge] = useState(false);
    const [copied, setCopied] = useState(false);

    // Lemon Squeezy integration
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    const isSpyMode = result?.typeCode === 'HIRED' ||
        result?.typeCode === 'SUSP' ||
        result?.typeCode === 'REJT' ||
        result?.typeCode === 'BURN' ||
        !!result?.spyMetadata ||
        result?.mode === 'spy' ||
        result?.mode === 'elon';

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
                        setSelectedMBTI(data.mbti as MBTIType);
                    }

                    // Check subscription status
                    const historyIds = JSON.parse(localStorage.getItem('etchvox_history') || '[]');
                    const userHash = localStorage.getItem('etchvox_user_hash');
                    if (userHash) {
                        const subStatus = await checkSubscription(userHash);
                        setIsSubscribed(subStatus.isActive);
                    }

                    // Immediate display sequence (Removed artificial delays)
                    setTimeout(() => setDisplayStage('metrics'), 100);
                    setTimeout(() => setDisplayStage('full'), 200);

                    // Calculate Drift if multiple records exist
                    if (historyIds.length > 1) {
                        const baselineId = historyIds[historyIds.length - 1];
                        if (baselineId !== data.id) {
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

                    // Only trigger free analysis if it was already unlocked/paid OR if user is subscribed
                    // (Actually we should trigger it if it's unlocked, but we'll gate it in the UI)
                    if (!data.aiAnalysis) {
                        // We still trigger it, but only show it if unlocked
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
    }, [resultId]);

    // ✅ Real-time updates: Listen for AI analysis completion & Payment Unlocks
    useEffect(() => {
        if (!isFirebaseConfigured() || !resultId) return;

        const db = getDb();
        const resultRef = doc(db, 'results', resultId);
        const userHash = typeof window !== 'undefined' ? localStorage.getItem('etchvox_user_hash') : null;

        // 1. Listen to the Specific Result (for Single Purchase Unlocks)
        const unsubscribeResult = onSnapshot(resultRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();

                // Track if premium status just flipped
                setResult((prev) => {
                    if (!prev) return prev;

                    const updated = {
                        ...prev,
                        aiAnalysis: data.aiAnalysis,
                        aiAnalysisError: data.aiAnalysisError,
                        vaultEnabled: true,
                        mbti: data.mbti,
                        metrics: data.metrics || prev.metrics,
                        isPremium: data.isPremium || prev.isPremium,
                        purchasedAt: data.purchasedAt || prev.purchasedAt
                    } as VoiceResult;

                    // SYNC TO LOCAL STORAGE: Prevent stale data on refresh
                    if (typeof window !== 'undefined') {
                        localStorage.setItem(`etchvox_result_${resultId}`, JSON.stringify(updated));
                    }

                    return updated;
                });

                if (data.mbti && !selectedMBTI) {
                    setSelectedMBTI(data.mbti as MBTIType);
                }
            }
        }, (error) => {
            console.error('Firestore Result listener error:', error);
        });

        // 2. Listen to User's Subscription (for Monthly/Weekly Unlocks)
        let unsubscribeSub = () => { };
        if (userHash) {
            const subRef = doc(db, 'subscriptions', userHash);
            unsubscribeSub = onSnapshot(subRef, (snapshot) => {
                if (snapshot.exists()) {
                    const subData = snapshot.data();
                    const now = new Date();
                    const expiresAt = subData.expiresAt?.toDate ? subData.expiresAt.toDate() : new Date(subData.expiresAt);
                    const isActive = subData.status === 'active' && expiresAt > now;

                    setIsSubscribed(isActive);

                    // SYNC TO LOCAL STORAGE
                    if (typeof window !== 'undefined') {
                        localStorage.setItem('etchvox_subscription', JSON.stringify({
                            isActive,
                            expiresAt: expiresAt.toISOString(),
                            plan: subData.plan
                        }));
                    }

                    console.log(`[Sync] Subscription state updated: ${isActive ? 'ACTIVE' : 'INACTIVE'}`);
                }
            }, (error) => {
                console.error('Firestore Subscription listener error:', error);
            });
        }

        return () => {
            unsubscribeResult();
            unsubscribeSub();
        };
    }, [resultId, selectedMBTI]);

    const handleCheckout = async (type: 'solo' | 'couple' | 'spy') => {
        setCheckoutLoading(true);

        try {
            const plan = type;
            const userHash = localStorage.getItem('etchvox_user_hash') || '';

            const response = await fetch('/api/checkout/polar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userHash, resultId, plan })
            });

            if (!response.ok) {
                throw new Error('Failed to create checkout');
            }

            const data = await response.json();
            const checkoutUrl = data.checkoutUrl;
            window.location.href = checkoutUrl;

        } catch (err) {
            console.error('Checkout error:', err);
            setError('Failed to start checkout. Please try again.');
            setCheckoutLoading(false);
        }
    };


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

    const handleSpyBurn = async () => {
        try {
            await fetch('/api/results/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resultId })
            });
            // If it's a self-destruct (no consent), do a hard purge and redirect
            if (!result?.researchConsentAgreed) {
                executeHardPurge();
            } else {
                setIsPurged(true);
            }
        } catch (err) {
            console.error("Failed to purge spy data:", err);
            setIsPurged(true);
        }
    };

    const handleManualPurge = async () => {
        if (!confirm("Are you sure? This will permanently delete this record from our servers and your device history. This action cannot be undone.")) return;

        try {
            await removeFromHistory(resultId, true);
            setIsPurged(true);
        } catch (err) {
            console.error("Manual purge failed:", err);
            alert("Failed to delete record. Please try again.");
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

    // Gating Logic: Standalone diagnostics always require purchase
    const isPremium = result.isPremium === true;
    const showAIReport = isPremium;
    const showVideo = false; // Video visualization removed from Solo/Couple diagnostic results
    const showSpyReport = true; // Always show the card, gating handled inside

    const diagnosticType = result.mode === 'spy' ? 'spy' : (isCouple ? 'couple' : 'solo');
    const diagnosticPrice = diagnosticType === 'spy' ? POLAR_CONFIG.SPY_PRICE : (diagnosticType === 'couple' ? POLAR_CONFIG.COUPLE_PRICE : POLAR_CONFIG.SOLO_PRICE);

    return (
        <main className="min-h-screen bg-black text-white selection:bg-cyan-500/30 font-sans flex flex-col items-center overflow-x-hidden w-full relative">

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
                                    isHoldingPurge={isHoldingPurge}
                                    isPremium={isPremium}
                                    onUnlock={() => handleCheckout('spy')}
                                />
                            </div>
                        ) : (
                            displayStage === 'full' && !isSpyMode && (
                                <div className="animate-slide-up space-y-24 md:space-y-40 w-full flex flex-col items-center">

                                    {/* 1. IDENTITY CARD (The "Reward") */}
                                    <div id="identity-card" className="w-full max-w-lg mx-auto">
                                        <div className="flex items-center gap-3 mb-8 px-4 md:px-0">
                                            <div className="w-1 h-6 bg-cyan-500" />
                                            <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em]">
                                                {isCouple ? 'Duo Identity' : 'Truth Card'}
                                            </h2>
                                        </div>
                                        {isCouple && result.coupleData ? (
                                            <DuoIdentityCard
                                                userA={result.coupleData.userA as any}
                                                userB={result.coupleData.userB as any}
                                                resultId={result.id}
                                                onImageGenerated={setCardImageUrl}
                                            />
                                        ) : (
                                            <SoloIdentityCard
                                                mbti={(result.mbti || 'INTJ') as MBTIType}
                                                voiceTypeCode={result.typeCode}
                                                userName={result.id}
                                                metrics={safeMetrics}
                                                onImageGenerated={setCardImageUrl}
                                            />
                                        )}
                                    </div>

                                    {/* 2. INVISIBLE ARTIFACT (The "Surprise") */}
                                    {result.postReading && result.postReading.category !== 'Statue' && (
                                        <div className="w-full max-w-lg mx-auto px-4 md:px-0">
                                            <div className="flex items-center gap-3 mb-6 justify-center">
                                                <div className="w-1 h-4 bg-pink-500 rounded-full animate-pulse" />
                                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-pink-400">
                                                    Invisible Artifact Detected
                                                </h3>
                                            </div>
                                            <div className="bg-pink-500/5 rounded-2xl p-6 border border-pink-500/10 transition-all hover:bg-pink-500/10">
                                                <div className="flex items-center gap-4 mb-3">
                                                    <div className="w-10 h-10 bg-pink-500/20 rounded-lg flex items-center justify-center text-xl">
                                                        {result.postReading.category === 'Sigh' ? '💨' :
                                                            result.postReading.category === 'Laughter' ? '✨' :
                                                                result.postReading.category === 'Mumble' ? '🌫️' :
                                                                    result.postReading.category === 'Fidget' ? '🫨' : '🗿'}
                                                    </div>
                                                    <div className="text-left">
                                                        <div className="text-pink-400 font-bold text-sm uppercase tracking-widest">
                                                            {result.postReading.category}
                                                        </div>
                                                        <div className="text-[10px] font-mono text-gray-500 uppercase">
                                                            Intensity: {Math.round(result.postReading.score * 100)}%
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-xs text-gray-400 leading-relaxed text-left italic">
                                                    "{result.postReading.description}"
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    {/* 3. PREMIUM CTA (The "Conversion Trigger") */}
                                    {!isPremium && (
                                        <div className="w-full max-w-md mx-auto px-4 text-center">
                                            <button
                                                onClick={() => handleCheckout(diagnosticType)}
                                                disabled={checkoutLoading}
                                                className="group relative w-full bg-white text-black font-black text-sm px-8 py-6 rounded-2xl uppercase tracking-widest hover:bg-cyan-400 hover:shadow-[0_20px_40px_rgba(34,211,238,0.3)] transition-all transform active:scale-95 disabled:opacity-50"
                                            >
                                                <div className="flex flex-col items-center">
                                                    <span className="text-[10px] opacity-40 mb-1">Deep Intelligence Access</span>
                                                    <span className="flex items-center gap-2">
                                                        Unlock Full Neural Audit
                                                        <span className="text-lg">🔓</span>
                                                    </span>
                                                </div>
                                                <div className="absolute inset-x-0 bottom-[-40px] text-[8px] text-gray-600 font-bold uppercase tracking-[0.5em] opacity-0 group-hover:opacity-100 transition-opacity">
                                                    Authorized Personnel Only
                                                </div>
                                            </button>

                                            {/* Report Clarity Section */}
                                            <div className="mt-12 mb-2 glass rounded-2xl p-6 border border-white/5 text-left max-w-sm mx-auto">
                                                <h4 className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.3em] mb-4">Included in this Audit:</h4>
                                                <ul className="space-y-3">
                                                    {diagnosticType === 'couple' ? (
                                                        <>
                                                            <li className="flex items-center gap-3 text-[11px] text-gray-300 font-bold">
                                                                <span className="text-cyan-500">◈</span> Neural Sync & Resonance Matrix
                                                            </li>
                                                            <li className="flex items-center gap-3 text-[11px] text-gray-300 font-bold">
                                                                <span className="text-cyan-500">◈</span> Dominance vs Passive Interaction Scale
                                                            </li>
                                                            <li className="flex items-center gap-3 text-[11px] text-gray-300 font-bold">
                                                                <span className="text-cyan-500">◈</span> AI-Synthesized Relationship Roast
                                                            </li>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <li className="flex items-center gap-3 text-[11px] text-gray-300 font-bold">
                                                                <span className="text-cyan-500">◈</span> Identity Gap Analysis (Vocal vs Psych)
                                                            </li>
                                                            <li className="flex items-center gap-3 text-[11px] text-gray-300 font-bold">
                                                                <span className="text-cyan-500">◈</span> Deep Psychological Archetype Report
                                                            </li>
                                                            <li className="flex items-center gap-3 text-[11px] text-gray-300 font-bold">
                                                                <span className="text-cyan-500">◈</span> Acoustic Biometric Calibration Data
                                                            </li>
                                                        </>
                                                    )}
                                                </ul>
                                            </div>

                                            <button
                                                onClick={async () => {
                                                    setCheckoutLoading(true);
                                                    const data = await getResult(resultId);
                                                    if (data?.isPremium) {
                                                        setResult(data);
                                                    }
                                                    setCheckoutLoading(false);
                                                }}
                                                className="mt-6 py-3 px-4 text-xs text-gray-400 hover:text-white underline uppercase tracking-widest font-black transition-colors block mx-auto z-50 relative touch-manipulation"
                                            >
                                                Already purchased? Refresh status
                                            </button>

                                            <div className="mt-8 flex flex-col items-center gap-4">
                                                <Link
                                                    href="/?restore=true"
                                                    className="text-[10px] text-gray-500 hover:text-cyan-400 underline uppercase tracking-widest font-bold transition-colors"
                                                >
                                                    Lost access? Restore via Email
                                                </Link>
                                                <a
                                                    href="mailto:info@etchvox.com"
                                                    className="text-[9px] text-gray-600 hover:text-white uppercase tracking-[0.2em] font-bold transition-colors"
                                                >
                                                    Questions? Contact Support
                                                </a>
                                            </div>

                                            <div className="mt-12 text-[9px] text-gray-500 uppercase tracking-widest font-black">
                                                Scroll for Acoustic Metrics
                                            </div>
                                        </div>
                                    )}

                                    {/* 4. METRICS & BIO (The "Evidence") */}
                                    <div className="space-y-32 md:space-y-48 w-full flex flex-col items-center">
                                        {/* Summary & Meters Card */}
                                        <div
                                            className="animate-fade-in glass rounded-3xl p-8 md:p-12 relative overflow-hidden border border-white/10 w-full max-w-4xl mx-auto"
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

                                            {/* Meters Grid */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12 w-full text-left">
                                                {/* Left Column: Meters */}
                                                <div className="space-y-12">
                                                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-cyan-400 mb-8 border-l-2 border-cyan-400 pl-4">Acoustic Calibration</h3>
                                                    {result.logV2 ? (
                                                        <HighFidelityMetrics log={result.logV2} />
                                                    ) : (
                                                        <div className="text-gray-500 text-xs italic">High-fidelity metrics unavailable for this legacy record.</div>
                                                    )}
                                                </div>

                                                {/* Right Column: Comparative Data */}
                                                <div className="space-y-12">
                                                    <h3 className="text-xs font-black uppercase tracking-[0.4em] text-pink-400 mb-8 border-l-2 border-pink-400 pl-4">Biological Variance</h3>
                                                    <div className="grid grid-cols-2 gap-8">
                                                        <DriftStat label="Neural Latency" value="2.4ms" />
                                                        <DriftStat label="Variance" value={(safeMetrics.pitchVar || 0).toFixed(1)} />
                                                        <DriftStat label="HNR Ratio" value={(safeMetrics.hnr || 0).toFixed(1)} />
                                                        <DriftStat label="Noise Floor" value="-72dB" />
                                                    </div>

                                                    <div className="pt-8">
                                                        <VoiceTimelineGraph history={fullHistory} />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Compatibility Matrix (Solo Only) */}
                                        {!isCouple && !isSpyMode && (
                                            <div className="w-full max-w-4xl px-4 pb-20">
                                                <div className="flex flex-col md:flex-row items-start justify-between mb-12 gap-8">
                                                    <div>
                                                        <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">Social Signal Matrix</h2>
                                                        <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Cross-Reference Compatibility Index</p>
                                                    </div>
                                                    <div className="flex items-center gap-4 bg-white/5 rounded-2xl p-4 border border-white/10 backdrop-blur-sm">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Tier:</span>
                                                        <span className={`text-xl font-black uppercase italic ${getCompatibilityTier(75).tier === 'Soulmates' ? 'text-yellow-400' :
                                                            getCompatibilityTier(75).tier === 'Best Friends' ? 'text-pink-400' :
                                                                'text-white'
                                                            }`}>
                                                            {getCompatibilityTier(75).tier}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                                    <div className="glass rounded-3xl p-8 border border-cyan-500/20">
                                                        <h3 className="text-xs font-black text-cyan-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                                                            Best Signal Match
                                                        </h3>
                                                        <div className="flex flex-wrap gap-3">
                                                            {bestMatches.map(match => (
                                                                <div key={match.type} className="bg-black/40 border border-white/5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-300">
                                                                    {match.type}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>

                                                    <div className="glass rounded-3xl p-8 border border-red-500/20">
                                                        <h3 className="text-xs font-black text-red-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                                            Interference Risk
                                                        </h3>
                                                        <div className="flex flex-wrap gap-3">
                                                            {worstMatches.map(match => (
                                                                <div key={match.type} className="bg-black/40 border border-white/5 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest text-gray-400">
                                                                    {match.type}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Neural Drift Analysis Segment (Show if history exists) */}
                                                {drift && (
                                                    <div className="mb-32">
                                                        <div className="flex items-center gap-4 mb-8">
                                                            <div className="h-px flex-grow bg-white/10" />
                                                            <h2 className="text-xs font-black uppercase tracking-[0.5em] text-gray-500">Neural Drift Analysis</h2>
                                                            <div className="h-px flex-grow bg-white/10" />
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                                                            <div className="glass rounded-3xl p-8 border border-white/5">
                                                                <div className="text-xs font-black text-gray-500 uppercase tracking-widest mb-2">Drift Score</div>
                                                                <div className="text-4xl font-black text-white italic">{drift.driftRate}%</div>
                                                            </div>
                                                            <div className="md:col-span-2 glass rounded-3xl p-8 border border-white/5 relative overflow-hidden group">
                                                                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                                                    <span className="text-8xl">📊</span>
                                                                </div>
                                                                <p className="text-sm font-medium leading-relaxed text-gray-300 italic relative z-10 text-left">
                                                                    "{getDriftNarrative(drift)}"
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                <ShareButtons
                                                    resultId={resultId}
                                                    typeName={voiceType.name}
                                                    typeIcon={voiceType.icon}
                                                    catchphrase={voiceType.catchphrase}
                                                    typeCode={result.typeCode}
                                                    cardImageUrl={cardImageUrl}
                                                />
                                            </div>
                                        )}

                                        {/* 5. AI AUDIT REPORT (PREMIUM GATING) */}
                                        {isPremium && (
                                            <div className="w-full mb-32 max-w-4xl px-4">
                                                <div className="flex items-center gap-3 mb-12">
                                                    <div className={`w-1 h-6 ${isCouple ? 'bg-pink-500' : isSpyMode ? 'bg-red-500' : 'bg-cyan-500'}`} />
                                                    <h2 className="text-lg font-bold text-white uppercase tracking-[0.2em]">
                                                        {isCouple ? 'Resonance Map' : isSpyMode ? 'Intel Dossier' : 'Identity Archive'}
                                                    </h2>
                                                </div>

                                                {result.aiAnalysis ? (
                                                    <div className={`bg-black/50 border ${isCouple ? 'border-pink-500/30' : isSpyMode ? 'border-red-500/30 font-mono' : 'border-cyan-500/30'} rounded-2xl p-6 md:p-10 text-left space-y-6 shadow-[0_0_30px_rgba(6,182,212,0.15)]`}>
                                                        <div className="prose prose-invert prose-sm max-w-none">
                                                            <ReactMarkdown
                                                                components={{
                                                                    h1: ({ node, ...props }) => <h1 className={`text-2xl font-bold ${isSpyMode ? 'text-red-500 font-mono' : 'text-cyan-400'} uppercase tracking-widest mb-4`} {...props} />,
                                                                    h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-white uppercase tracking-wide mt-8 mb-4" {...props} />,
                                                                    p: ({ node, ...props }) => <p className="text-gray-300 leading-relaxed mb-4" {...props} />,
                                                                    ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-3 text-gray-300 ml-2" {...props} />,
                                                                    li: ({ node, ...props }) => <li className="text-gray-300 leading-relaxed" {...props} />,
                                                                    strong: ({ node, ...props }) => <strong className={`${isSpyMode ? 'text-red-400' : 'text-cyan-400'} font-bold`} {...props} />,
                                                                }}
                                                            >
                                                                {result.aiAnalysis}
                                                            </ReactMarkdown>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-center p-12 border border-dashed border-cyan-500/30 rounded-xl bg-gradient-to-br from-cyan-500/5 to-transparent">
                                                        <div className="w-16 h-16 mx-auto mb-4 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                                                        <div className="text-sm font-bold text-cyan-400 uppercase tracking-widest mb-3">🧬 Neural Analysis In Progress</div>
                                                        <div className="text-gray-400 text-xs max-w-xs mx-auto leading-relaxed">
                                                            Your vocal DNA is being decoded by the AI engine. This typically takes 10-20 seconds.
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* 6. PURGE PROTOCOL (The "End") */}
                                        <div className="w-full max-w-2xl px-4 py-32 md:py-48 flex flex-col items-center gap-12 border-t border-white/5">
                                            <div className="text-center space-y-8">
                                                <div className="inline-block px-4 py-1 rounded-full border border-red-900/50 bg-red-950/20 text-[10px] text-red-500 font-black uppercase tracking-widest mb-4">
                                                    Danger Zone // Privacy Protocol
                                                </div>
                                                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter">Hard Purge</h2>
                                                <p className="text-gray-500 text-sm max-w-sm mx-auto leading-relaxed italic">
                                                    Permanently delete this vocal fingerprint and all associated neural data. This action is irreversible.
                                                </p>
                                                <div className="flex flex-col items-center gap-6">
                                                    <div className="relative group">
                                                        <div className="absolute -inset-1 bg-red-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200" />
                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm("ARE YOU SURE? This will permanently delete your biometric data and redirect you to the home page.")) {
                                                                    setIsHoldingPurge(true);
                                                                    setTimeout(() => {
                                                                        removeFromHistory(resultId);
                                                                        window.location.href = '/';
                                                                    }, 2000);
                                                                }
                                                            }}
                                                            disabled={isHoldingPurge}
                                                            className="relative btn-metallic border-red-500/50 bg-black px-12 py-5 rounded-2xl text-[10px] text-red-500 hover:text-white transition-all disabled:opacity-50"
                                                        >
                                                            {isHoldingPurge ? 'INITIATING SCRUB...' : '[ EXECUTE DATA PURGE ]'}
                                                        </button>
                                                    </div>
                                                    <p className="text-[9px] text-zinc-600 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                                                        You have the right to be forgotten. Purging removes all traces of this analysis from both your device and our secure cloud.
                                                    </p>
                                                </div>
                                                <Link href="/" className="inline-block text-[11px] text-gray-600 hover:text-white transition-colors uppercase tracking-[0.3em] border-b border-transparent hover:border-gray-500 pb-1 font-black">
                                                    [ START NEW ANALYSIS ]
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
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

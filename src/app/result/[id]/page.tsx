'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown'; // ✅ Markdown Renderer
import { voiceTypes, TypeCode, groupColors } from '@/lib/types';
import { getResult, VoiceResult, removeFromHistory } from '@/lib/storage';
import { getBestMatches, getWorstMatches, getCompatibilityTier } from '@/lib/compatibilityMatrix';
import ShareButtons from '@/components/result/ShareButtons';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import HighFidelityMetrics from '@/components/result/HighFidelityMetrics';
import ToxicitySelector from '@/components/recording/ToxicitySelector';
import SoloIdentityCard from '@/components/result/SoloIdentityCard';
import DuoIdentityCard from '@/components/result/DuoIdentityCard';
import PremiumExporter from '@/components/result/PremiumExporter';
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
import DuoResonanceHook from '@/components/result/DuoResonanceHook';
import { generateFinalReport } from '@/lib/analyzer';
import { POLAR_CONFIG } from '@/config/features';
import { checkSubscription } from '@/lib/subscription';
import { trackEv } from '@/lib/analytics';


type DisplayStage = 'label' | 'metrics' | 'full';

// relationship types for background coloring
const RELATIONSHIP_COLORS = {
    romantic: { a: '#00bcd4', b: '#ff5722' },
    friend: { a: '#50c878', b: '#ffd700' },
    rival: { a: '#8a2be2', b: '#cddc39' },
    unknown: { a: '#4b0082', b: '#c0c0c0' },
};

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
    const [isPurged, setIsPurged] = useState(false);
    const [isHoldingPurge, setIsHoldingPurge] = useState(false);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    const isCouple = result ? (result.typeCode === 'COUPLE_MIX' || !!result.coupleData) : false;
    const isElonMode = result?.mode === 'elon';
    const isSpyMode = result?.typeCode === 'HIRED' ||
        result?.typeCode === 'SUSP' ||
        result?.typeCode === 'REJT' ||
        result?.typeCode === 'BURN' ||
        !!result?.spyMetadata ||
        result?.mode === 'spy' ||
        isElonMode;

    const isDevMode = searchParams.get('dev') === 'true';

    // 1. SCROLL DETECTION
    const { scrollYProgress } = useScroll();

    // 2. NEBULA PHASE TRANSFORMS (0% - 20%)
    const nebulaScale = useTransform(scrollYProgress, [0, 0.25], [1, 0.4]);
    const nebulaOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const nebulaY = useTransform(scrollYProgress, [0, 0.25], [0, -200]);

    // 3. TRUTH CARD PHASE TRANSFORMS (25% - 65%)
    const cardY = useTransform(scrollYProgress, [0.25, 0.5, 0.65, 0.75], [150, 0, 0, -100]);
    const cardOpacity = useTransform(scrollYProgress, [0.3, 0.5, 0.65, 0.75], [0, 1, 1, 0]);
    const cardBlur = useTransform(scrollYProgress, [0.3, 0.5, 0.65, 0.75], ["blur(20px)", "blur(0px)", "blur(0px)", "blur(10px)"]);
    const cardScale = useTransform(scrollYProgress, [0.3, 0.55, 0.65, 0.75], [0.95, 1, 1, 0.9]);


    function executeHardPurge() {
        if (typeof window === 'undefined') return;
        console.warn("INITIATING HARD PURGE PROTOCOL...");
        (window as any).analysisResult = null;
        (window as any).vocalVector = null;
        (window as any).recordedBlob = null;
        localStorage.clear();
        sessionStorage.clear();
        window.history.replaceState(null, '', window.location.origin);
        const DB_NAME = 'EtchVoxCache';
        indexedDB.deleteDatabase(DB_NAME);
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
                    const userHash = localStorage.getItem('etchvox_user_hash');
                    if (userHash) {
                        const subStatus = await checkSubscription(userHash);
                        setIsSubscribed(subStatus.isActive);
                    }
                    setTimeout(() => setDisplayStage('metrics'), 100);
                    setTimeout(() => setDisplayStage('full'), 200);
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

        // Analytics: Purchase Complete Detection
        if (typeof window !== 'undefined' && searchParams.get('thanks') === 'true') {
            trackEv('2.1', 'purchase_complete', {
                result_id: resultId,
                context: searchParams.get('mode') || 'diagnostic'
            });
        }
    }, [resultId, searchParams]);

    // Analytics: Offer Impression (if not premium)
    useEffect(() => {
        if (displayStage === 'full' && result && !result.isPremium) {
            trackEv('1.1', 'offer_impression', {
                context: 'result_page_unlocked',
                type: isCouple ? 'couple' : 'solo'
            });
        }
    }, [displayStage, result, isCouple]);

    // Real-time updates
    useEffect(() => {
        if (!isFirebaseConfigured() || !resultId) return;
        const db = getDb();
        const resultRef = doc(db, 'results', resultId);
        const userHash = typeof window !== 'undefined' ? localStorage.getItem('etchvox_user_hash') : null;

        const unsubscribeResult = onSnapshot(resultRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.data();
                setResult((prev) => {
                    if (!prev) return prev;
                    const updated = {
                        ...prev,
                        aiAnalysis: data.aiAnalysis,
                        isPremium: data.isPremium || prev.isPremium,
                    } as VoiceResult;
                    if (typeof window !== 'undefined') {
                        localStorage.setItem(`etchvox_result_${resultId}`, JSON.stringify(updated));
                    }
                    return updated;
                });
            }
        });

        return () => unsubscribeResult();
    }, [resultId]);

    const handleCheckout = async (type: 'solo' | 'couple' | 'spy' | 'identity_solo' | 'identity_duo') => {
        setCheckoutLoading(true);

        const priceMap = {
            solo: POLAR_CONFIG.SOLO_PRICE,
            couple: POLAR_CONFIG.COUPLE_PRICE,
            spy: POLAR_CONFIG.SPY_PRICE,
            identity_solo: POLAR_CONFIG.IDENTITY_SOLO_PRICE,
            identity_duo: POLAR_CONFIG.IDENTITY_DUO_PRICE
        };

        // Analytics: Checkout Intent
        trackEv('2.0', 'checkout_intent', {
            plan_type: type,
            price: priceMap[type as keyof typeof priceMap]
        });

        try {
            const plan = type;
            const userHash = localStorage.getItem('etchvox_user_hash') || '';
            const response = await fetch('/api/checkout/polar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userHash, resultId, plan })
            });
            if (!response.ok) throw new Error('Failed to create checkout');
            const data = await response.json();
            window.location.href = data.checkoutUrl;
        } catch (err) {
            console.error('Checkout error:', err);
            setError('Failed to start checkout. Please try again.');
            setCheckoutLoading(false);
        }
    };


    // ✅ Save MBTI to Firestore when selected
    const handleMBTISelect = async (mbti: MBTIType | null) => {
        if (!mbti || isSpyMode) return; // Skip for Spy Mode

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
    const isPremium = result.isPremium === true || isDevMode;
    const showAIReport = isPremium;
    const showVideo = false; // Video visualization removed from Solo/Couple diagnostic results
    const showSpyReport = true; // Always show the card, gating handled inside

    const diagnosticType = result.mode === 'spy' ? 'spy' : (isCouple ? 'couple' : 'solo');
    const diagnosticPrice = diagnosticType === 'spy' ? POLAR_CONFIG.SPY_PRICE : (diagnosticType === 'couple' ? POLAR_CONFIG.COUPLE_PRICE : POLAR_CONFIG.SOLO_PRICE);

    return (
        <main className="relative bg-black text-white selection:bg-cyan-500/30 font-sans overflow-x-hidden w-full">
            {/* 400vh Scroll Length for Storytelling */}
            <div className="h-[400vh] w-full">

                {/* BACKGROUND: CINEMATIC NOISE & BLOBS */}
                <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                    <div className="grain-overlay" />
                    <motion.div
                        className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-[0.05] animate-pulse-slow"
                        style={{
                            backgroundColor: isCouple
                                ? (RELATIONSHIP_COLORS[result.coupleData?.relationshipType as keyof typeof RELATIONSHIP_COLORS]?.a || RELATIONSHIP_COLORS.romantic.a)
                                : '#ffffff'
                        }}
                    />
                    <motion.div
                        className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.05] animate-pulse-slow delay-1000"
                        style={{
                            backgroundColor: isCouple
                                ? (RELATIONSHIP_COLORS[result.coupleData?.relationshipType as keyof typeof RELATIONSHIP_COLORS]?.b || RELATIONSHIP_COLORS.romantic.b)
                                : '#444444'
                        }}
                    />
                </div>

                {/* CHAPTER 1: THE SOUL REVEAL (Fixed 0% - 35%) */}
                <motion.section
                    style={{ scale: nebulaScale, opacity: nebulaOpacity, y: nebulaY }}
                    className="fixed inset-0 flex flex-col items-center justify-center z-10 pointer-events-none"
                >
                    <div className="text-[120px] mb-12 animate-pulse-slow grayscale opacity-40">
                        {voiceType.icon}
                    </div>
                    <h2 className="text-3xl md:text-9xl font-black uppercase text-white mb-6 tracking-[-0.05em] leading-none opacity-20 md:opacity-80 px-8 text-center">
                        {voiceType.name}
                    </h2>
                    <div className="text-[10px] md:text-[11px] font-black text-white tracking-[1.2em] uppercase opacity-10 md:opacity-30 pl-[1.2em]">
                        {result.typeCode}
                    </div>
                    <div className="absolute bottom-20 flex flex-col items-center gap-4 opacity-20">
                        <div className="text-[10px] font-black tracking-[0.5em] uppercase pl-[0.5em]">Scroll to Decode</div>
                        <motion.div
                            animate={{ y: [0, 8, 0] }}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-px h-12 bg-white"
                        />
                    </div>
                </motion.section>

                <motion.section
                    style={{
                        opacity: cardOpacity,
                        y: cardY,
                        filter: cardBlur,
                        scale: cardScale,
                        pointerEvents: scrollYProgress.get() > 0.3 && scrollYProgress.get() < 0.65 ? 'auto' : 'none'
                    }}
                    className="fixed inset-0 flex items-center justify-center z-20 px-4"
                >
                    <div className="w-full max-w-2xl mx-auto relative group">
                        {/* Film Grain Jitter Overlay on Card */}
                        <motion.div
                            animate={{ x: [0, -1, 1, -1], y: [0, 1, -1, 1] }}
                            transition={{ repeat: Infinity, duration: 0.1 }}
                            className="absolute inset-0 z-30 pointer-events-none opacity-20"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
                        />

                        <div className="transform transition-transform duration-1000 group-hover:scale-[1.02]">
                            {isCouple && result.coupleData ? (
                                <DuoIdentityCard
                                    userA={result.coupleData.userA as any}
                                    userB={result.coupleData.userB as any}
                                    relationshipType={result.coupleData.relationshipType}
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
                    </div>
                </motion.section>

                {/* CHAPTER 3: ANALYSIS & EXPORT (Scrollable 60% - 100%) */}
                <div className="relative z-30 pt-[250vh] pb-32 flex flex-col items-center bg-transparent">
                    <div className="w-full max-w-2xl px-4 flex flex-col items-center">

                        {/* 1. BIOMETRIC RESONANCE MAP (Logical Analysis) */}
                        <section className="w-full flex flex-col items-center py-64">
                            <div className="w-full">
                                {result.logV2 ? (
                                    <HighFidelityMetrics
                                        log={result.logV2}
                                        logA={isCouple ? result.coupleData?.userA?.logV2 : undefined}
                                        logB={isCouple ? result.coupleData?.userB?.logV2 : undefined}
                                        relationshipType={isCouple ? result.coupleData?.relationshipType : undefined}
                                    />
                                ) : (
                                    <div className="text-gray-500 text-xs italic text-center">Biometric trace successfully encrypted.</div>
                                )}
                            </div>
                        </section>

                        {/* 2. SOCIAL SIGNAL MATRIX (Hidden for Spy Mode) */}
                        {!isCouple && !isSpyMode && (
                            <section className="w-full flex flex-col items-center py-64 border-t border-white/5">
                                <div className="text-center mb-32 space-y-6">
                                    <h2 className="text-xl font-black text-white uppercase tracking-[0.6em] italic opacity-80">Social Signal Matrix</h2>
                                    <p className="text-cyan-400 font-mono text-[10px] uppercase tracking-[0.4em] font-black">Global Compatibility Index</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 w-full">
                                    <div className="space-y-8">
                                        <h3 className="text-[10px] font-black text-cyan-400/50 uppercase tracking-[0.3em] text-center mb-8">Best Signal Match</h3>
                                        {bestMatches.map(match => (
                                            <div key={match.type} className="glass rounded-3xl p-6 border border-white/5 hover:border-cyan-500/20 transition-all group flex items-center gap-4">
                                                <span className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-500">{voiceTypes[match.type].icon}</span>
                                                <div className="flex-1 text-left">
                                                    <div className="text-sm font-black text-white uppercase tracking-wider">{voiceTypes[match.type].name}</div>
                                                    <div className="text-[10px] text-cyan-500 font-mono italic opacity-50">{match.type}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="space-y-8">
                                        <h3 className="text-[10px] font-black text-red-500/50 uppercase tracking-[0.3em] text-center mb-8">Interference Risk</h3>
                                        {worstMatches.map(match => (
                                            <div key={match.type} className="glass rounded-3xl p-6 border border-white/5 hover:border-red-500/20 transition-all group flex items-center gap-4 opacity-50">
                                                <span className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-500">{voiceTypes[match.type].icon}</span>
                                                <div className="flex-1 text-left">
                                                    <div className="text-sm font-black text-white uppercase tracking-wider">{voiceTypes[match.type].name}</div>
                                                    <div className="text-[10px] text-red-500 font-mono italic opacity-50">{match.type}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* 2.5 DUO RESONANCE HOOK */}
                        {isCouple && result.logV2?.resonance && (
                            <DuoResonanceHook resonance={result.logV2.resonance} />
                        )}

                        {/* 3. IDENTITY KIT (Physical Assets) */}
                        {!isElonMode && (
                            <section className="w-full flex flex-col items-center py-64 border-t border-white/5">
                                <div className="text-center mb-32">
                                    <h2 className="text-xl font-black text-white uppercase tracking-[0.6em] italic">Identity Kit</h2>
                                    <p className="text-gray-500 text-[10px] uppercase font-black tracking-[0.4em] mt-6 opacity-50">Authorized Metadata Distribution</p>
                                </div>
                                <PremiumExporter
                                    metadata={{
                                        archetypeCode: result.typeCode || 'UNKNOWN',
                                        mbti: result.mbti || 'Void',
                                        roast: voiceType.roast || voiceType.catchphrase || 'Echo in the void',
                                        isCouple: isCouple,
                                        price: isCouple ? POLAR_CONFIG.IDENTITY_DUO_PRICE : POLAR_CONFIG.IDENTITY_SOLO_PRICE,
                                        partnerA: isCouple ? result.coupleData?.userA?.name : undefined,
                                        partnerB: isCouple ? result.coupleData?.userB?.name : undefined,
                                        relationshipLabel: isCouple ? result.coupleData?.relationshipType : undefined,
                                        isPaid: result.isPremium
                                    }}
                                    onCheckout={() => handleCheckout(isCouple ? 'identity_duo' : 'identity_solo')}
                                    onUpgrade={() => handleCheckout(isCouple ? 'couple' : 'solo')}
                                />
                            </section>
                        )}

                        {/* 4. AI REPORT (The Core Audit) */}
                        {!isElonMode && (
                            <section className="w-full flex flex-col items-center py-64 border-t border-white/5">
                                {result.isPremium && result.aiAnalysis ? (
                                    <div className="w-full max-w-2xl">
                                        <div className="text-center mb-32 opacity-80">
                                            <h2 className="text-xl font-black text-white uppercase tracking-[0.6em] italic">Full Intelligence Audit</h2>
                                        </div>
                                        <div className="prose prose-invert prose-sm max-w-none text-left leading-loose opacity-80">
                                            <ReactMarkdown
                                                components={{
                                                    h1: ({ node, ...props }) => <h1 className="text-2xl font-black text-white uppercase tracking-widest mb-12 border-b border-white/10 pb-4" {...props} />,
                                                    h2: ({ node, ...props }) => <h2 className="text-xl font-black text-white uppercase tracking-wide mt-16 mb-6" {...props} />,
                                                    p: ({ node, ...props }) => <p className="text-gray-400 leading-relaxed mb-8" {...props} />,
                                                    strong: ({ node, ...props }) => <strong className="text-cyan-400 font-black" {...props} />,
                                                }}
                                            >
                                                {result.aiAnalysis}
                                            </ReactMarkdown>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-full max-w-md text-center space-y-12">
                                        <div className="text-center mb-12">
                                            <h3 className="text-xl font-black text-cyan-400 uppercase tracking-[0.5em] italic">The Full Archive</h3>
                                            <p className="text-cyan-400 font-mono text-[10px] uppercase tracking-widest mt-2 font-black">Deeper Context Hidden</p>
                                        </div>
                                        <div className="glass rounded-[3rem] p-12 border border-white/5 space-y-12">
                                            <div className="flex flex-col items-center gap-4">
                                                <div className="text-5xl opacity-40">🧬</div>
                                                <div className="px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30">
                                                    <span className="text-cyan-400 font-black text-xs">${diagnosticPrice} Authorized Unlock</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-400 leading-relaxed italic">
                                                Unlock your complete neural blueprint including detailed personality traits, cognitive patterns, and resonance analysis.
                                            </p>
                                            <button
                                                onClick={() => handleCheckout(diagnosticType)}
                                                className="w-full bg-white text-black font-black py-6 rounded-3xl uppercase tracking-widest hover:bg-cyan-400 transition-all transform active:scale-95 flex items-center justify-center gap-3"
                                            >
                                                <span>Reveal Intelligence Report</span>
                                                <span className="text-xs opacity-40 font-mono">→</span>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </section>
                        )}

                        {/* 5. BROADCAST (Moved to bottom of content) */}
                        <section className="w-full py-64 flex flex-col items-center border-t border-white/5">
                            <div className="text-center mb-16 opacity-30">
                                <h2 className="text-[11px] font-black text-white uppercase tracking-[1.2em] pl-[1.2em]">Broadcast</h2>
                            </div>
                            <ShareButtons
                                resultId={resultId}
                                typeName={voiceType.name}
                                typeIcon={voiceType.icon}
                                catchphrase={voiceType.catchphrase}
                                typeCode={result.typeCode}
                                cardImageUrl={cardImageUrl}
                            />
                        </section>

                        {/* 6. NEW MISSION / HOME */}
                        <div className="w-full py-32 flex flex-col items-center">
                            <Link
                                href="/"
                                className="px-12 py-5 rounded-full border border-white/20 text-white font-black uppercase tracking-[0.4em] text-[10px] hover:bg-white hover:text-black transition-all active:scale-95"
                            >
                                {isSpyMode ? 'NEW MISSION' : 'NEW ANALYSIS'}
                            </Link>
                        </div>

                        {/* 7. PURGE PROTOCOL */}
                        <div className="w-full py-32 flex flex-col items-center gap-12 opacity-30 hover:opacity-100 transition-opacity duration-1000">
                            <button
                                onClick={() => {
                                    if (window.confirm("ARE YOU SURE?")) {
                                        setIsHoldingPurge(true);
                                        setTimeout(() => {
                                            removeFromHistory(resultId);
                                            window.location.href = '/';
                                        }, 2000);
                                    }
                                }}
                                className="text-[9px] font-black text-gray-600 uppercase tracking-[0.5em] hover:text-red-500 transition-colors"
                            >
                                [ EXECUTE HARD PURGE ]
                            </button>
                        </div>
                    </div>
                </div>
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

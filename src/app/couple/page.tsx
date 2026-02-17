'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { VoiceAnalyzer, classifyTypeCode } from '@/lib/analyzer';
import { generateResultId } from '@/lib/permalink';
import { saveResult, getSessionId, VoiceResult } from '@/lib/storage';
import ParticleVisualizer from '@/components/recording/ParticleVisualizer';

type Phase = 'intro' | 'relation' | 'names' | 'step1' | 'step2' | 'step3' | 'step4' | 'details' | 'analyzing';

const JOBS = [
    'Lawyer', 'Executive', 'Engineer', 'Doctor', 'Founder',
    'Consultant', 'Artist', 'Teacher', 'Designer', 'Nurse',
    'Writer', 'Musician', 'Student', 'Sales', 'Other'
];

const ACCENTS = [
    'Standard English', 'British (RP)', 'American (General)', 'NYC', 'Southern US',
    'Australian', 'Indian', 'East Asian', 'European', 'African', 'Other'
];

type StepConfig = {
    id: 'step1' | 'step2' | 'step3' | 'step4';
    title: string;
    subtitle: string;
    instruction: string;
    duration: number; // seconds
    color: string;
    script: React.ReactNode;
};

export default function CouplePage() {
    const router = useRouter();
    const [phase, setPhase] = useState<Phase>('intro');
    const [timeLeft, setTimeLeft] = useState(10);
    const [isRecording, setIsRecording] = useState(false);

    // Consent Partner A (Alpha)
    const [isOver13A, setIsOver13A] = useState(false);
    const [termsA, setTermsA] = useState(false);
    const [privacyA, setPrivacyA] = useState(false);
    const [wellnessA, setWellnessA] = useState(false);
    const [researchA, setResearchA] = useState(false);

    // Consent Partner B (Beta)
    const [isOver13B, setIsOver13B] = useState(false);
    const [termsB, setTermsB] = useState(false);
    const [privacyB, setPrivacyB] = useState(false);
    const [wellnessB, setWellnessB] = useState(false);
    const [researchB, setResearchB] = useState(false);

    // Data Store
    const [relationshipType, setRelationshipType] = useState<'romantic' | 'friend' | 'rival'>('romantic');
    const [names, setNames] = useState({ A: '', B: '' });
    const [profiles, setProfiles] = useState({
        A: { gender: 'non-binary', birthYear: new Date().getFullYear() - 25, job: 'Other', accent: 'Standard English' },
        B: { gender: 'non-binary', birthYear: new Date().getFullYear() - 25, job: 'Other', accent: 'Standard English' }
    });
    // We only store the "Main" recording (Step 1) for analysis to keep backend simple for now
    // In a future update, we could merge all 3 blobs
    const [mainAudioBlob, setMainAudioBlob] = useState<Blob | null>(null);
    const [mainMetrics, setMainMetrics] = useState<any>(null);
    const [stepVectors, setStepVectors] = useState<Record<string, number[]>>({});

    // Hardware Refs
    const analyzerRef = useRef<VoiceAnalyzer | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const lastSpeakingTimeRef = useRef<number>(0);

    // Cleanup
    useEffect(() => {
        return () => {
            if (analyzerRef.current) analyzerRef.current.destroy();
            if (timerRef.current) clearInterval(timerRef.current);
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        };
    }, []);

    const STEPS: Record<string, StepConfig> = {
        step1: {
            id: 'step1',
            title: "Step 1: Identity Sync",
            subtitle: "The Binary Check",
            instruction: "Call and response. Verify your Presence.",
            duration: 6,
            color: 'text-cyan-400',
            script: (
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center">
                            <span className="text-[10px] font-black text-cyan-500 uppercase block mb-1">Alpha (A)</span>
                            <p className="text-xl font-bold italic">"I'm {names.A || 'Person A'}."</p>
                        </div>
                        <div className="p-4 rounded-xl bg-magenta-500/10 border border-magenta-500/30 text-center">
                            <span className="text-[10px] font-black text-magenta-500 uppercase block mb-1">Beta (B)</span>
                            <p className="text-xl font-bold italic">"And I'm {names.B || 'Person B'}."</p>
                        </div>
                    </div>
                </div>
            )
        },
        step2: {
            id: 'step2',
            title: "Step 2: Team Calibration",
            subtitle: "Structural Integrity",
            instruction: "Test your collective stability.",
            duration: 6,
            color: 'text-cyan-400',
            script: (
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center">
                            <span className="text-[10px] font-black text-cyan-500 uppercase block mb-1">Alpha (A)</span>
                            <p className="text-xl font-bold italic">"We’re a perfect team."</p>
                        </div>
                        <div className="p-4 rounded-xl bg-magenta-500/10 border border-magenta-500/30 text-center">
                            <span className="text-[10px] font-black text-magenta-500 uppercase block mb-1">Beta (B)</span>
                            <p className="text-xl font-bold italic">"Most of the time."</p>
                        </div>
                    </div>
                </div>
            )
        },
        step3: {
            id: 'step3',
            title: "Step 3: Transparency Audit",
            subtitle: "Internal Flow",
            instruction: "Voice your hidden signals.",
            duration: 6,
            color: 'text-cyan-400',
            script: (
                <div className="space-y-4">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-8">
                        <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center">
                            <span className="text-[10px] font-black text-cyan-500 uppercase block mb-1">Alpha (A)</span>
                            <p className="text-xl font-bold italic">"I have no secrets."</p>
                        </div>
                        <div className="p-4 rounded-xl bg-magenta-500/10 border border-magenta-500/30 text-center">
                            <span className="text-[10px] font-black text-magenta-500 uppercase block mb-1">Beta (B)</span>
                            <p className="text-xl font-bold italic">"I totally believe you."</p>
                        </div>
                    </div>
                </div>
            )
        },
        step4: {
            id: 'step4',
            title: "Step 4: Final Truth Signal",
            subtitle: "The Oracle Threshold",
            instruction: "Speak the command in unison.",
            duration: 7,
            color: 'text-amber-400',
            script: (
                <div className="space-y-4">
                    <div className="flex justify-center">
                        <span className="px-4 py-1 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] border border-white/20">
                            Both Read Together
                        </span>
                    </div>
                    <p className="text-2xl md:text-4xl font-black leading-tight italic text-white drop-shadow-sm">
                        "Now, tell us the truth."
                    </p>
                </div>
            )
        }
    };

    const startRecording = async (currentStep: 'step1' | 'step2' | 'step3' | 'step4') => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
            });

            if (!analyzerRef.current) {
                analyzerRef.current = new VoiceAnalyzer();
                await analyzerRef.current.initialize();
                analyzerRef.current.connectStream(stream);
            }

            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.start(100);
            setIsRecording(true);
            setTimeLeft(STEPS[currentStep].duration);

            const collectLoop = () => {
                if (analyzerRef.current && isRecording) {
                    // Logic to switch tags during recording for resonance
                    let tag = 'Both';
                    if (currentStep === 'step1') {
                        // Stage 1 is 5 seconds. Split 2.5s / 2.5s
                        tag = timeLeft > 2.5 ? 'A' : 'B';
                    } else if (currentStep === 'step2' || currentStep === 'step3') {
                        tag = 'Both'; // Mixed signals
                    } else {
                        tag = 'Both';
                    }

                    analyzerRef.current.collectSample(tag);

                    // VAD for 'Magical 5 Seconds'
                    const latestRMS = analyzerRef.current.getLatestRMS();
                    if (latestRMS > 0.01) {
                        lastSpeakingTimeRef.current = Date.now();
                    }
                }
                animationFrameRef.current = requestAnimationFrame(collectLoop);
            };
            collectLoop();

            // Timer
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        finishRecording(currentStep);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (err) {
            console.error('Mic Error', err);
            alert('Microphone access required.');
        }
    };

    const finishRecording = async (currentStep: 'step1' | 'step2' | 'step3' | 'step4') => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (mediaRecorderRef.current) mediaRecorderRef.current.stop();

        // Get Analysis & Vector
        if (analyzerRef.current) {
            const vector = analyzerRef.current.get30DVector();
            setStepVectors(prev => ({ ...prev, [currentStep]: vector }));
        }

        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

        if (currentStep === 'step1') {
            setMainAudioBlob(audioBlob);
            const analysis = analyzerRef.current?.analyze('couple');
            setMainMetrics(analysis?.metrics);
            setTimeout(() => setPhase('step2'), 1500);
        } else if (currentStep === 'step2') {
            setTimeout(() => setPhase('step3'), 1500);
        } else if (currentStep === 'step3') {
            setTimeout(() => setPhase('step4'), 1500);
        } else {
            // Final Step (Step 4)
            setTimeout(() => setPhase('details'), 1500);
        }

        setIsRecording(false);
    };

    const handleNamesSubmit = (nameA: string, nameB: string) => {
        setNames({ A: nameA, B: nameB });
        setPhase('step1');
    };

    const handleDetailsSubmit = (pA: any, pB: any) => {
        setProfiles({ A: pA, B: pB });
        processCoupleResult(pA.job, pB.job, pA, pB);
    };

    const processCoupleResult = async (jobA: string, jobB: string, pA?: any, pB?: any) => {
        setPhase('analyzing');
        const coupleResultId = generateResultId();

        const recordingEndMs = Date.now();
        const mainMetricsProcessed = mainMetrics || (analyzerRef.current?.analyze('couple').metrics);
        const unionTypeCode = classifyTypeCode(mainMetricsProcessed);

        // Magical 5 Seconds Analysis
        const postReading = analyzerRef.current?.classifyPostReading(
            lastSpeakingTimeRef.current || (recordingEndMs - 25000),
            recordingEndMs,
            'couple'
        );

        // Calculate Resonance (Stream B)
        const resonance = analyzerRef.current?.calculateCoupleResonance();

        // Individual Analysis
        const metricsA = analyzerRef.current?.calculateMetrics('A');
        const metricsB = analyzerRef.current?.calculateMetrics('B');
        const typeA = classifyTypeCode(metricsA || mainMetricsProcessed);
        const typeB = classifyTypeCode(metricsB || mainMetricsProcessed);

        const coupleData: VoiceResult = {
            id: coupleResultId,
            sessionId: getSessionId(),
            typeCode: 'COUPLE_MIX' as any,
            metrics: mainMetricsProcessed, // Using Step 1 metrics
            postReading,
            accentOrigin: 'Couple',
            createdAt: new Date().toISOString(),
            isPremium: false,
            mode: 'solo', // Using solo for now to avoid breaking existing logic, or 'duo' if added
            coupleData: {
                relationshipType,
                userA: {
                    name: names.A,
                    job: jobA,
                    metrics: metricsA || mainMetricsProcessed,
                    typeCode: typeA,
                    gender: pA?.gender || profiles.A.gender,
                    birthYear: pA?.birthYear || profiles.A.birthYear,
                    consentAgreed: termsA && privacyA,
                    researchConsentAgreed: researchA,
                    logV2: analyzerRef.current?.getV2Log(metricsA || mainMetricsProcessed, { record_id: `${coupleResultId}_A` }, 'A')
                },
                userB: {
                    name: names.B,
                    job: jobB,
                    metrics: metricsB || mainMetricsProcessed,
                    typeCode: typeB,
                    gender: pB?.gender || profiles.B.gender,
                    birthYear: pB?.birthYear || profiles.B.birthYear,
                    consentAgreed: termsB && privacyB,
                    researchConsentAgreed: researchB,
                    logV2: analyzerRef.current?.getV2Log(metricsB || mainMetricsProcessed, { record_id: `${coupleResultId}_B` }, 'B')
                }
            },
            logV2: analyzerRef.current?.getV2Log(mainMetricsProcessed, {
                record_id: coupleResultId,
                script_id: 'couple_sync_v1',
                mbti: 'Unknown',
                gender: 'non-binary',
                isMobile: false
            }),
            logV3: analyzerRef.current?.getV3Log(mainMetricsProcessed, {
                record_id: coupleResultId,
                script_id: 'couple_sync_v1',
                mbti: 'Unknown',
                gender: 'non-binary',
                isMobile: false,
                consent: {
                    terms: termsA && termsB,
                    privacy: privacyA && privacyB,
                    research: researchA && researchB
                },
                resonance
            }),
            consentAgreed: (termsA && privacyA) && (termsB && privacyB),
            researchConsentAgreed: researchA && researchB,
            wellnessConsentAgreed: wellnessA && wellnessB,
            consentVersion: '2.0.0_DUAL',
            consentAt: new Date().toISOString(),
        } as any;

        // Add resonance to logV2
        if (coupleData.logV2) {
            coupleData.logV2.resonance = resonance;
        }

        // Save with blobs
        if (mainAudioBlob) {
            await saveResult(coupleData, undefined, {
                userA: mainAudioBlob,
                userB: mainAudioBlob
            });
        }

        // Vault Session (Only if both agree to research)
        if (researchA && researchB) {
            const { secureVault } = await import('@/lib/vault');
            const vaultVectors = {
                step1: stepVectors['step1'] || [],
                step2: stepVectors['step2'] || [],
                step3: stepVectors['step3'] || []
            };
            const vaultMetrics = { latency: 0, pitchVar: mainMetrics.pitchVar || 0, hnr: mainMetrics.hnr || 20, noiseFloor: 0.001 };
            const vaultContext = {
                mode: 'couple',
                result: 'PAIRING_AUDIT',
                metadata: { partnerA: names.A, partnerB: names.B },
                aiScore: mainMetrics.humanityScore ? (100 - mainMetrics.humanityScore) / 100 : 0.0
            };
            await secureVault(vaultVectors, vaultMetrics, vaultContext, true, wellnessA && wellnessB);
        }

        setTimeout(() => {
            router.push(`/result/${coupleResultId}`);
        }, 2000);
    };

    // --- UI RENDERING ---

    // 1. INTRO
    if (phase === 'intro') return (
        <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-12 md:p-24 text-center max-w-2xl mx-auto py-32 md:py-48">
            <h1 className="text-3xl md:text-5xl font-bold uppercase tracking-widest mb-10">
                <span className="text-pink-500">Duo</span> Resonance
            </h1>
            <p className="text-gray-400 mb-16 text-lg leading-relaxed">
                Step 1: Bio-Sync (Unison)<br />
                Step 2: Stress Conflict (Roleplay)<br />
                Step 3: Neural Flow (Speed)
            </p>

            <div className="glass rounded-2xl p-8 md:p-12 border-2 border-pink-500/20 bg-white/5 w-full mb-16 text-left space-y-12 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <span className="text-4xl">🔐</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    {/* Partner A Consent */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 border-b border-cyan-500/20 pb-2">Partner Alpha Consent</h3>
                        <div className="space-y-4">
                            {/* Mandatory Legal Group */}
                            <div className="space-y-2 p-4 rounded-xl border border-white/5 bg-black/20">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={isOver13A && termsA && privacyA && wellnessA}
                                        onChange={e => {
                                            const val = e.target.checked;
                                            setIsOver13A(val);
                                            setTermsA(val);
                                            setPrivacyA(val);
                                            setWellnessA(val);
                                        }}
                                        className="mt-1 w-5 h-5 rounded border-gray-600 bg-black/50 cursor-pointer flex-shrink-0 accent-cyan-500"
                                    />
                                    <span className="text-[10px] text-gray-400 leading-relaxed select-none block font-bold transition-colors group-hover:text-white uppercase tracking-wider">
                                        Accept Terms, Privacy, & Wellness Audit (Alpha).
                                        <span className="block text-[9px] opacity-70 mt-1">I confirm I am 13+.</span>
                                    </span>
                                </label>
                            </div>

                            {/* Optional Cinematic Research Consent */}
                            <div className="bg-cyan-500/5 backdrop-blur-sm rounded-xl p-4 border border-cyan-500/10 hover:bg-cyan-500/10 transition-colors">
                                <label className="flex items-start gap-4 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={researchA}
                                        onChange={e => setResearchA(e.target.checked)}
                                        className="mt-1 w-5 h-5 rounded border-cyan-500/30 bg-black/50 cursor-pointer flex-shrink-0 accent-cyan-500"
                                    />
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-cyan-400 font-black uppercase tracking-[0.2em] block mb-1">
                                            Optional: Archive My Soul
                                        </span>
                                        <span className="text-[9px] text-gray-500 leading-tight block italic transition-colors group-hover:text-gray-200">
                                            Authorize capture of resonance for neutral statistical modeling. Data is unidentified.
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Partner B Consent */}
                    <div className="space-y-6">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500 border-b border-pink-500/20 pb-2">Partner Beta Consent</h3>
                        <div className="space-y-4">
                            {/* Mandatory Legal Group */}
                            <div className="space-y-2 p-4 rounded-xl border border-white/5 bg-black/20">
                                <label className="flex items-start gap-3 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={isOver13B && termsB && privacyB && wellnessB}
                                        onChange={e => {
                                            const val = e.target.checked;
                                            setIsOver13B(val);
                                            setTermsB(val);
                                            setPrivacyB(val);
                                            setWellnessB(val);
                                        }}
                                        className="mt-1 w-5 h-5 rounded border-gray-600 bg-black/50 cursor-pointer flex-shrink-0 accent-pink-500"
                                    />
                                    <span className="text-[10px] text-gray-400 leading-relaxed select-none block font-bold transition-colors group-hover:text-white uppercase tracking-wider">
                                        Accept Terms, Privacy, & Wellness Audit (Beta).
                                        <span className="block text-[9px] opacity-70 mt-1">I confirm I am 13+.</span>
                                    </span>
                                </label>
                            </div>

                            {/* Optional Cinematic Research Consent */}
                            <div className="bg-pink-500/5 backdrop-blur-sm rounded-xl p-4 border border-pink-500/10 hover:bg-pink-500/10 transition-colors">
                                <label className="flex items-start gap-4 cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={researchB}
                                        onChange={e => setResearchB(e.target.checked)}
                                        className="mt-1 w-5 h-5 rounded border-pink-500/30 bg-black/50 cursor-pointer flex-shrink-0 accent-pink-500"
                                    />
                                    <div className="space-y-1">
                                        <span className="text-[10px] text-pink-500 font-black uppercase tracking-[0.2em] block mb-1">
                                            Optional: Archive My Soul
                                        </span>
                                        <span className="text-[9px] text-gray-500 leading-tight block italic transition-colors group-hover:text-gray-200">
                                            Authorize capture of resonance for neutral statistical modeling. Data is unidentified.
                                        </span>
                                    </div>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-[10px] text-gray-600 uppercase tracking-widest font-mono text-center pt-8 border-t border-white/5">
                    Read our <Link href="/privacy" className="text-pink-500 hover:underline">Privacy Policy</Link> for details.
                </div>
            </div>

            <button
                onClick={() => setPhase('relation')}
                disabled={!termsA || !privacyA || !termsB || !privacyB || !isOver13A || !isOver13B || !wellnessA || !wellnessB}
                className="w-full bg-white text-black font-black py-5 rounded-full uppercase tracking-[0.2em] hover:bg-pink-500 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.2)] text-lg"
            >
                Start Sequence
            </button>

            <div className="mt-8 text-[10px] text-gray-700 font-mono">
                Support: <a href="mailto:info@etchvox.com" className="hover:text-gray-500">info@etchvox.com</a>
            </div>
        </main>
    );

    // 1.5 RELATION
    if (phase === 'relation') return (
        <main className="min-h-screen bg-black text-white p-12 flex flex-col items-center justify-center text-center max-w-2xl mx-auto">
            <h2 className="text-2xl font-black uppercase tracking-[0.2em] mb-12 italic">Define the Dynamic</h2>
            <div className="grid grid-cols-1 gap-4 w-full">
                {[
                    { id: 'romantic', label: 'Romantic Partner', icon: '💍', tagline: 'Decoding the heat of intimacy.' },
                    { id: 'friend', label: 'Best Friend / Partner', icon: '🤝', tagline: 'Mapping the rhythm of shared trust.' },
                    { id: 'rival', label: 'Creative Rival', icon: '⚔️', tagline: 'Measuring the sparks of creative friction.' }
                ].map(r => (
                    <button
                        key={r.id}
                        onClick={() => {
                            setRelationshipType(r.id as any);
                            setPhase('names');
                        }}
                        className="glass p-6 md:p-8 rounded-2xl border border-white/10 bg-white/5 hover:border-pink-500 hover:bg-pink-500/10 transition-all flex items-center justify-between group text-left"
                    >
                        <div className="flex items-center gap-6">
                            <span className="text-2xl">{r.icon}</span>
                            <div>
                                <span className="font-black uppercase tracking-widest group-hover:text-pink-400 block">{r.label}</span>
                                <span className="text-[10px] text-gray-500 font-medium group-hover:text-white/60 block mt-1 tracking-wider uppercase italic">{r.tagline}</span>
                            </div>
                        </div>
                        <span className="text-gray-500 group-hover:text-white">→</span>
                    </button>
                ))}
            </div>
            <button onClick={() => setPhase('intro')} className="mt-12 text-gray-500 hover:text-white text-[10px] uppercase font-bold tracking-widest">← Back to Consent</button>
        </main>
    );

    // 2. NAMES
    if (phase === 'names') return (
        <NamesForm
            onBack={() => setPhase('intro')}
            onSubmit={handleNamesSubmit}
        />
    );

    // 3. RECORDING STEPS
    if (phase === 'step1' || phase === 'step2' || phase === 'step3' || phase === 'step4') {
        const step = STEPS[phase];

        return (
            <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden px-4">
                {/* Visualizer Background */}
                <ParticleVisualizer analyser={analyzerRef.current?.getAnalyser() || null} isActive={isRecording} />

                <div className="z-10 w-full max-w-2xl mx-auto text-center space-y-8">
                    {/* Header */}
                    <div className="space-y-4">
                        <div className="flex justify-center gap-3 mb-8">
                            {['step1', 'step2', 'step3', 'step4'].map((s) => (
                                <div
                                    key={s}
                                    className={`w-3 h-3 rounded-full transition-colors ${phase === s ? 'bg-cyan-400' : 'bg-gray-700'
                                        }`}
                                />
                            ))}
                        </div>
                        <div className={`text-xs font-bold uppercase tracking-[0.3em] ${step.color} animate-pulse`}>
                            {isRecording ? step.title : `Preparing: ${step.subtitle}`}
                        </div>
                        <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">
                            {step.subtitle}
                        </h2>
                    </div>

                    {!isRecording ? (
                        <div className="space-y-8 animate-fade-in-up">
                            {/* Instruction Card */}
                            <div className="glass rounded-2xl p-8 border border-white/10 bg-black/50 backdrop-blur-xl">
                                <p className="text-gray-400 text-sm uppercase tracking-widest mb-6 border-b border-white/10 pb-4">
                                    Mission Objective
                                </p>
                                <p className="text-xl font-bold text-white mb-2">
                                    {step.instruction}
                                </p>
                            </div>

                            <button
                                onClick={() => startRecording(phase)}
                                className="w-24 h-24 rounded-full border border-white/30 flex items-center justify-center hover:bg-white/10 hover:border-white transition-all mx-auto group relative"
                            >
                                <div className={`absolute inset-0 rounded-full border-2 ${step.color.replace('text-', 'border-')} opacity-30 animate-ping`} />
                                <div className={`w-8 h-8 ${step.color.replace('text-', 'bg-')} rounded-full shadow-[0_0_20px_currentColor]`} />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-12 animate-fade-in">
                            {/* Script Display */}
                            <div className={`glass rounded-2xl p-8 md:p-12 border border-white/10 bg-black/60 backdrop-blur-xl transform transition-all duration-500 ${phase === 'step2' ? 'border-red-500/30' : ''}`}>
                                {step.script}
                            </div>

                            {/* Timer */}
                            <div className="text-8xl font-black font-mono tracking-tighter mix-blend-difference tabular-nums">
                                {timeLeft}
                            </div>
                        </div>
                    )}
                </div>

            </main>
        );
    }

    // 4. DETAILS
    if (phase === 'details') return (
        <DetailsForm
            names={names}
            onSubmit={handleDetailsSubmit}
        />
    );

    // 5. ANALYZING
    return (
        <main className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center space-y-6">
                <div className="w-20 h-20 relative mx-auto">
                    <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-ping" />
                    <div className="absolute inset-0 border-4 border-t-cyan-500 border-r-pink-500 rounded-full animate-spin" />
                </div>
                <div className="space-y-2">
                    <div className="text-xl font-bold uppercase tracking-widest">Processing Data</div>
                    <div className="text-xs text-gray-500">Compiling 4-Stage Analysis...</div>
                </div>
            </div>
        </main>
    );
}

// --- Sub Components ---

function NamesForm({ onBack, onSubmit }: { onBack: () => void, onSubmit: (a: string, b: string) => void }) {
    const [nameA, setNameA] = useState('');
    const [nameB, setNameB] = useState('');

    return (
        <main className="min-h-screen bg-black text-white p-6 md:p-12 flex flex-col justify-center max-w-2xl mx-auto fade-in scrollbar-hide py-20 md:py-32">
            <button onClick={onBack} className="absolute top-8 left-6 text-gray-500 hover:text-white transition-colors">← Back</button>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-widest mb-20 text-center neon-text-pink italic tracking-tighter">
                Acoustic Pairing
            </h2>
            <div className="space-y-8">
                {/* Partner 1 */}
                <div className="glass rounded-2xl p-8 border border-white/10 bg-white/5 space-y-4 shadow-xl">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-cyan-400 mb-2 block font-bold">Partner Alpha: ID</label>
                    <input
                        autoFocus
                        value={nameA}
                        onChange={e => setNameA(e.target.value)}
                        placeholder="Name or Nickname"
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-lg outline-none focus:border-cyan-500 transition-all font-bold placeholder:text-gray-700"
                    />
                </div>

                {/* Partner 2 */}
                <div className="glass rounded-2xl p-8 border border-white/10 bg-white/5 space-y-4 shadow-xl">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-pink-500 mb-2 block font-bold">Partner Beta: ID</label>
                    <input
                        value={nameB}
                        onChange={e => setNameB(e.target.value)}
                        placeholder="Name or Nickname"
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-lg outline-none focus:border-pink-500 transition-all font-bold placeholder:text-gray-700"
                    />
                </div>

                <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6 text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 mb-2">Security Clearance Active</p>
                    <p className="text-xs text-gray-500">Biometric consent verified for both participants.</p>
                </div>

                <div className="pt-16">
                    <button
                        disabled={!nameA.trim() || !nameB.trim()}
                        onClick={() => onSubmit(nameA, nameB)}
                        className="w-full bg-gradient-to-r from-cyan-600 to-pink-600 text-white font-black py-5 rounded-2xl uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_10px_40px_rgba(236,72,153,0.3)] transition-all text-xl"
                    >
                        Initialize Scan
                    </button>
                    <p className="text-center text-[10px] text-gray-600 mt-6 uppercase tracking-widest font-mono italic">
                        Read our <Link href="/privacy" className="text-cyan-500 hover:underline">Privacy Policy</Link> for details.
                    </p>
                </div>
            </div>
        </main>
    );
}

function DetailsForm({ names, onSubmit }: { names: { A: string, B: string }, onSubmit: (pA: any, pB: any) => void }) {
    const [pA, setPA] = useState({ gender: 'non-binary', birthYear: new Date().getFullYear() - 25, job: 'Other', accent: 'Standard English' });
    const [pB, setPB] = useState({ gender: 'non-binary', birthYear: new Date().getFullYear() - 25, job: 'Other', accent: 'Standard English' });

    const years = Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 13 - i);

    return (
        <main className="min-h-screen bg-black text-white p-6 flex flex-col justify-center max-w-2xl mx-auto fade-in scrollbar-hide py-32 md:py-48">
            <h2 className="text-3xl font-black uppercase tracking-[0.1em] mb-4 text-center neon-text-cyan italic">Final Calibration</h2>
            <p className="text-center text-gray-500 text-[10px] uppercase tracking-[0.3em] mb-20">Fine-tuning pairing resonance markers</p>

            <div className="space-y-20">
                {/* Partner A */}
                <div className="p-8 rounded-2xl bg-white/5 border-l-4 border-cyan-500 shadow-2xl space-y-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-400 mb-6">{names.A} Profile</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">Gender Baseline</label>
                            <div className="flex gap-2">
                                {['male', 'female', 'non-binary'].map(g => (
                                    <button
                                        key={g}
                                        onClick={() => setPA({ ...pA, gender: g })}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${pA.gender === g ? 'bg-cyan-500 text-black border-cyan-400' : 'bg-black/40 border-white/5 text-gray-500 hover:border-white/20'}`}
                                    >
                                        {g === 'non-binary' ? 'Fluid' : g}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">Birth Year</label>
                            <select value={pA.birthYear} onChange={e => setPA({ ...pA, birthYear: parseInt(e.target.value) })} className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm font-bold outline-none focus:border-cyan-500 transition-all">
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
                        <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-widest text-gray-600 font-bold block mb-2">Professional Orientation</label>
                            <select value={pA.job} onChange={e => setPA({ ...pA, job: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-medium outline-none focus:border-cyan-500 transition-all">
                                {JOBS.map(j => <option key={j} value={j}>{j}</option>)}
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-widest text-gray-600 font-bold block mb-2">Acoustic Accent</label>
                            <select value={pA.accent} onChange={e => setPA({ ...pA, accent: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-medium outline-none focus:border-cyan-500 transition-all">
                                {ACCENTS.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Partner B */}
                <div className="p-8 rounded-2xl bg-white/5 border-l-4 border-pink-500 shadow-2xl space-y-8">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-pink-500 mb-6">{names.B} Profile</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">Gender Baseline</label>
                            <div className="flex gap-2">
                                {['male', 'female', 'non-binary'].map(g => (
                                    <button
                                        key={g}
                                        onClick={() => setPB({ ...pB, gender: g })}
                                        className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${pB.gender === g ? 'bg-pink-500 text-black border-pink-400' : 'bg-black/40 border-white/5 text-gray-500 hover:border-white/20'}`}
                                    >
                                        {g === 'non-binary' ? 'Fluid' : g}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-widest text-gray-600 font-bold">Birth Year</label>
                            <select value={pB.birthYear} onChange={e => setPB({ ...pB, birthYear: parseInt(e.target.value) })} className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm font-bold outline-none focus:border-pink-500 transition-all">
                                {years.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4 border-t border-white/5">
                        <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-widest text-gray-600 font-bold block mb-2">Professional Orientation</label>
                            <select value={pB.job} onChange={e => setPB({ ...pB, job: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-medium outline-none focus:border-pink-500 transition-all">
                                {JOBS.map(j => <option key={j} value={j}>{j}</option>)}
                            </select>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] uppercase tracking-widest text-gray-600 font-bold block mb-2">Acoustic Accent</label>
                            <select value={pB.accent} onChange={e => setPB({ ...pB, accent: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-medium outline-none focus:border-pink-500 transition-all">
                                {ACCENTS.map(a => <option key={a} value={a}>{a}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => onSubmit(pA, pB)}
                    className="w-full bg-white text-black font-black py-6 rounded-2xl uppercase tracking-[0.5em] hover:bg-cyan-500 hover:text-white transition-all mt-8 text-xl shadow-[0_0_40px_rgba(255,255,255,0.1)] mb-12"
                >
                    Generate Report →
                </button>
            </div>
        </main>
    );
}

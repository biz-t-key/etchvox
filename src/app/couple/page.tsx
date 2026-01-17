'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { VoiceAnalyzer } from '@/lib/analyzer';
import { generateResultId } from '@/lib/permalink';
import { saveResult, getSessionId, VoiceResult } from '@/lib/storage';
import ParticleVisualizer from '@/components/recording/ParticleVisualizer';

type Phase = 'intro' | 'names' | 'step1' | 'step2' | 'step3' | 'details' | 'analyzing';

const JOBS = [
    'Lawyer', 'Executive', 'Engineer', 'Doctor', 'Founder',
    'Consultant', 'Artist', 'Teacher', 'Designer', 'Nurse',
    'Writer', 'Musician', 'Student', 'Sales', 'Other'
];

type StepConfig = {
    id: 'step1' | 'step2' | 'step3';
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

    // Consent
    const [consentGiven, setConsentGiven] = useState(false);

    // Data Store
    const [names, setNames] = useState({ A: '', B: '' });
    // We only store the "Main" recording (Step 1) for analysis to keep backend simple for now
    // In a future update, we could merge all 3 blobs
    const [mainAudioBlob, setMainAudioBlob] = useState<Blob | null>(null);
    const [mainMetrics, setMainMetrics] = useState<any>(null);

    // Hardware Refs
    const analyzerRef = useRef<VoiceAnalyzer | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const animationFrameRef = useRef<number | null>(null);

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
            title: "Synchronizing Biometric Resonance...",
            subtitle: "The Bio-Sync",
            instruction: "Read together in unison. One single take.",
            duration: 10,
            color: 'text-cyan-400',
            script: (
                <p className="text-xl md:text-2xl font-medium leading-relaxed font-serif italic text-white/90">
                    "We parked our car in the garage to share a bottle of water. We are certainly not robots."
                </p>
            )
        },
        step2: {
            id: 'step2',
            title: "Simulating Relational Stress Levels...",
            subtitle: "The Stress Conflict",
            instruction: "Act out the conflict! A: Warn, B: Panic.",
            duration: 8,
            color: 'text-red-500',
            script: (
                <div className="space-y-4 text-left max-w-md mx-auto">
                    <div>
                        <span className="text-red-500 font-bold uppercase text-xs tracking-widest block mb-1">{names.A || 'Partner A'}</span>
                        <p className="text-xl font-bold">"System failure! It's going down!"</p>
                    </div>
                    <div className="text-right">
                        <span className="text-red-400 font-bold uppercase text-xs tracking-widest block mb-1">{names.B || 'Partner B'}</span>
                        <p className="text-2xl font-black">"No! Shut it down! SHUT IT DOWN NOW!"</p>
                    </div>
                </div>
            )
        },
        step3: {
            id: 'step3',
            title: "Analyzing Neural Processing Speed...",
            subtitle: "The Neural Flow",
            instruction: "Alternate words FAST. Don't stumble.",
            duration: 8,
            color: 'text-green-400',
            script: (
                <div className="flex flex-wrap justify-center gap-3 text-xl md:text-3xl font-mono font-bold leading-relaxed max-w-lg mx-auto">
                    <span className="text-white bg-white/10 px-2 rounded">
                        <span className="text-[10px] text-gray-500 block -mb-1">{names.A}</span>Six
                    </span>
                    <span className="text-white bg-white/10 px-2 rounded">
                        <span className="text-[10px] text-gray-500 block -mb-1">{names.B}</span>systems
                    </span>
                    <span className="text-white bg-white/10 px-2 rounded">
                        <span className="text-[10px] text-gray-500 block -mb-1">{names.A}</span>synthesized
                    </span>
                    <span className="text-white bg-white/10 px-2 rounded">
                        <span className="text-[10px] text-gray-500 block -mb-1">{names.B}</span>sixty-six
                    </span>
                    <span className="text-white bg-cyan-500/20 px-2 rounded border border-cyan-500/50">
                        <span className="text-[10px] text-cyan-500 block -mb-1">TOGETHER</span>signals simultaneously!
                    </span>
                </div>
            )
        }
    };

    const startRecording = async (currentStep: 'step1' | 'step2' | 'step3') => {
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

            // Visualizer Loop
            const collectLoop = () => {
                if (analyzerRef.current && isRecording) {
                    analyzerRef.current.collectSample();
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

    const finishRecording = async (currentStep: 'step1' | 'step2' | 'step3') => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (mediaRecorderRef.current) mediaRecorderRef.current.stop();

        // Get Analysis
        const analysis = analyzerRef.current?.analyze();
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

        // Logic:
        // - Save Step 1 as "Main Blob" for persistent storage/analysis (it's the clean union)
        // - Steps 2 & 3 are currently for "Experience" (or we could merge them later)
        if (currentStep === 'step1') {
            setMainAudioBlob(audioBlob);
            setMainMetrics(analysis?.metrics);
            setTimeout(() => setPhase('step2'), 1500);
        } else if (currentStep === 'step2') {
            setTimeout(() => setPhase('step3'), 1500);
        } else {
            setTimeout(() => setPhase('details'), 1500);
        }

        setIsRecording(false);
    };

    const handleNamesSubmit = (nameA: string, nameB: string) => {
        setNames({ A: nameA, B: nameB });
        setPhase('step1');
    };

    const handleDetailsSubmit = (jobA: string, jobB: string) => {
        processCoupleResult(jobA, jobB);
    };

    const processCoupleResult = async (jobA: string, jobB: string) => {
        setPhase('analyzing');
        const coupleResultId = generateResultId();

        const coupleData: VoiceResult = {
            id: coupleResultId,
            sessionId: getSessionId(),
            typeCode: 'COUPLE_MIX' as any,
            metrics: mainMetrics, // Using Step 1 metrics
            accentOrigin: 'Couple',
            createdAt: new Date().toISOString(),
            locale: 'en-US',
            isPremium: false,
            coupleData: {
                userA: { name: names.A, job: jobA, metrics: mainMetrics }, // Flattened metrics for now
                userB: { name: names.B, job: jobB, metrics: mainMetrics }
            }
        } as any;

        // Save with blobs
        if (mainAudioBlob) {
            await saveResult(coupleData, undefined, {
                userA: mainAudioBlob, // Saving same blob for both slots for now, or just A
                userB: mainAudioBlob  // Ideally we merge all steps, but Step 1 is the most representative "Voice Print"
            });
        }

        setTimeout(() => {
            router.push(`/result/${coupleResultId}`);
        }, 2000);
    };

    // --- UI RENDERING ---

    // 1. INTRO
    if (phase === 'intro') return (
        <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
            <h1 className="text-3xl font-bold uppercase tracking-widest mb-4">
                <span className="text-pink-500">Couple</span> Analysis
            </h1>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                Step 1: Bio-Sync (Unison)<br />
                Step 2: Stress Conflict (Roleplay)<br />
                Step 3: Neural Flow (Speed)
            </p>

            <div className="glass rounded-xl p-6 border border-white/10 bg-white/5 w-full mb-8 text-left">
                <div className="flex items-start gap-4">
                    <input
                        type="checkbox"
                        id="consent"
                        checked={consentGiven}
                        onChange={(e) => setConsentGiven(e.target.checked)}
                        className="mt-1 w-5 h-5 rounded border-gray-600 bg-black/50 cursor-pointer flex-shrink-0 accent-pink-500"
                    />
                    <label htmlFor="consent" className="text-sm text-gray-400 leading-relaxed cursor-pointer select-none block">
                        We consent to our voices being <strong className="text-gray-200">recorded and analyzed</strong>.
                        {' '}<Link href="/privacy" className="text-pink-500 hover:text-pink-400 underline decoration-1 underline-offset-4">Privacy Policy</Link>
                    </label>
                </div>
            </div>

            <button
                onClick={() => setPhase('names')}
                disabled={!consentGiven}
                className="w-full bg-white text-black font-bold py-4 rounded-full uppercase tracking-[0.2em] hover:bg-pink-500 hover:text-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
                Start Sequence
            </button>
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
    if (phase === 'step1' || phase === 'step2' || phase === 'step3') {
        const step = STEPS[phase];

        return (
            <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden px-4">
                {/* Visualizer Background */}
                <ParticleVisualizer analyser={analyzerRef.current?.getAnalyser() || null} isActive={isRecording} />

                <div className="z-10 w-full max-w-2xl mx-auto text-center space-y-8">
                    {/* Header */}
                    <div className="space-y-2">
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
                    <div className="text-xs text-gray-500">Compiling 3-Stage Analysis...</div>
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
        <main className="min-h-screen bg-black text-white p-6 flex flex-col justify-center max-w-md mx-auto fade-in">
            <button onClick={onBack} className="absolute top-8 left-6 text-gray-500 hover:text-white transition-colors">← Back</button>
            <h2 className="text-2xl font-bold uppercase tracking-widest mb-8 text-center">
                Who are you?
            </h2>
            <div className="space-y-6">
                <div>
                    <label className="text-xs uppercase tracking-wider text-cyan-400 mb-2 block">Partner 1</label>
                    <input
                        autoFocus
                        value={nameA}
                        onChange={e => setNameA(e.target.value)}
                        placeholder="Name or Nickname"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-lg outline-none focus:border-cyan-500 transition-colors"
                    />
                </div>
                <div>
                    <label className="text-xs uppercase tracking-wider text-pink-500 mb-2 block">Partner 2</label>
                    <input
                        value={nameB}
                        onChange={e => setNameB(e.target.value)}
                        placeholder="Name or Nickname"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-lg outline-none focus:border-pink-500 transition-colors"
                    />
                </div>
                <button
                    disabled={!nameA.trim() || !nameB.trim()}
                    onClick={() => onSubmit(nameA, nameB)}
                    className="w-full bg-gradient-to-r from-cyan-600 to-pink-600 text-white font-bold py-4 rounded-xl uppercase tracking-widest hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed mt-4 transition-all"
                >
                    Start Step 1
                </button>
            </div>
        </main>
    );
}

function DetailsForm({ names, onSubmit }: { names: { A: string, B: string }, onSubmit: (jA: string, jB: string) => void }) {
    const [jobA, setJobA] = useState(JOBS[0]);
    const [jobB, setJobB] = useState(JOBS[0]);

    return (
        <main className="min-h-screen bg-black text-white p-6 flex flex-col justify-center max-w-md mx-auto fade-in">
            <h2 className="text-xl font-bold uppercase tracking-widest mb-2 text-center">Final Calibration</h2>
            <p className="text-center text-gray-500 text-xs mb-8">Select Role for SCM Analysis</p>

            <div className="space-y-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <label className="text-xs uppercase tracking-wider text-cyan-400 mb-2 block">{names.A}</label>
                    <select
                        value={jobA}
                        onChange={(e) => setJobA(e.target.value)}
                        className="w-full bg-black border border-white/20 rounded-lg p-3 text-white outline-none appearance-none"
                    >
                        {JOBS.map(j => <option key={j} value={j}>{j}</option>)}
                    </select>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <label className="text-xs uppercase tracking-wider text-pink-500 mb-2 block">{names.B}</label>
                    <select
                        value={jobB}
                        onChange={(e) => setJobB(e.target.value)}
                        className="w-full bg-black border border-white/20 rounded-lg p-3 text-white outline-none appearance-none"
                    >
                        {JOBS.map(j => <option key={j} value={j}>{j}</option>)}
                    </select>
                </div>

                <button
                    onClick={() => onSubmit(jobA, jobB)}
                    className="w-full bg-white text-black font-bold py-4 rounded-full uppercase tracking-widest hover:scale-105 transition-all mt-4"
                >
                    View Analysis
                </button>
            </div>
        </main>
    );
}

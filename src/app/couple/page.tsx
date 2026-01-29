'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { VoiceAnalyzer, classifyTypeCode } from '@/lib/analyzer';
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
    const [researchConsentAgreed, setResearchConsentAgreed] = useState(false);
    const [isOver13, setIsOver13] = useState(false);

    // Data Store
    const [names, setNames] = useState({ A: '', B: '' });
    const [profiles, setProfiles] = useState({
        A: { gender: 'non-binary', birthYear: new Date().getFullYear() - 25, job: 'Other' },
        B: { gender: 'non-binary', birthYear: new Date().getFullYear() - 25, job: 'Other' }
    });
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
            duration: 12,
            color: 'text-cyan-400',
            script: (
                <div className="space-y-8">
                    <div className="flex justify-center">
                        <span className="px-4 py-1 rounded-full bg-white/10 text-white text-[10px] font-black uppercase tracking-[0.3em] border border-white/20">
                            Both Read Together
                        </span>
                    </div>
                    <p className="text-2xl md:text-4xl font-black leading-tight italic text-white drop-shadow-sm">
                        "We parked our car in the garage to share a bottle of water. We are certainly not robots."
                    </p>
                </div>
            )
        },
        step2: {
            id: 'step2',
            title: "Simulating Relational Stress Levels...",
            subtitle: "The Stress Conflict",
            instruction: "Act out the conflict! A: Warn, B: Panic.",
            duration: 10,
            color: 'text-red-500',
            script: (
                <div className="space-y-10 text-left max-w-xl mx-auto">
                    <div className="space-y-2 group">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-cyan-500 flex items-center justify-center text-black font-black text-xs">A</span>
                            <span className="text-cyan-400 font-black uppercase text-xs tracking-widest">{names.A || 'Partner A'}</span>
                        </div>
                        <div className="pl-11">
                            <p className="text-2xl md:text-3xl font-bold text-white leading-tight">"System failure! It's going down!"</p>
                        </div>
                    </div>

                    <div className="space-y-2 group">
                        <div className="flex items-center gap-3 justify-end">
                            <span className="text-pink-500 font-black uppercase text-xs tracking-widest">{names.B || 'Partner B'}</span>
                            <span className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-black font-black text-xs">B</span>
                        </div>
                        <div className="pr-11 text-right">
                            <p className="text-3xl md:text-4xl font-black text-pink-400 leading-tight">"No! Shut it down! SHUT IT DOWN NOW!"</p>
                        </div>
                    </div>
                </div>
            )
        },
        step3: {
            id: 'step3',
            title: "Analyzing Neural Processing Speed...",
            subtitle: "The Neural Flow",
            instruction: "Alternate words FAST. Don't stumble.",
            duration: 10,
            color: 'text-green-400',
            script: (
                <div className="flex flex-wrap justify-center gap-4 text-2xl md:text-4xl font-bold leading-relaxed max-w-2xl mx-auto">
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-cyan-500 font-black mb-1">{names.A}</span>
                        <span className="bg-cyan-500/20 text-white px-4 py-2 rounded-xl border border-cyan-500/30">Six</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-pink-500 font-black mb-1">{names.B}</span>
                        <span className="bg-pink-500/20 text-white px-4 py-2 rounded-xl border border-pink-500/30">systems</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-cyan-500 font-black mb-1">{names.A}</span>
                        <span className="bg-cyan-500/20 text-white px-4 py-2 rounded-xl border border-cyan-500/30">synthesized</span>
                    </div>
                    <div className="flex flex-col items-center">
                        <span className="text-[10px] text-pink-500 font-black mb-1">{names.B}</span>
                        <span className="bg-pink-500/20 text-white px-4 py-2 rounded-xl border border-pink-500/30">sixty-six</span>
                    </div>
                    <div className="flex flex-col items-center w-full mt-4">
                        <span className="text-[10px] text-white font-black mb-1 opacity-60">TOGETHER</span>
                        <span className="bg-white/10 text-white px-8 py-3 rounded-2xl border border-white/20 italic">signals simultaneously!</span>
                    </div>
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

    const handleDetailsSubmit = (pA: any, pB: any) => {
        setProfiles({ A: pA, B: pB });
        processCoupleResult(pA.job, pB.job, pA, pB);
    };

    const processCoupleResult = async (jobA: string, jobB: string, pA?: any, pB?: any) => {
        setPhase('analyzing');
        const coupleResultId = generateResultId();

        const unionTypeCode = classifyTypeCode(mainMetrics);

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
                userA: { name: names.A, job: jobA, metrics: mainMetrics, typeCode: unionTypeCode, gender: pA?.gender || profiles.A.gender, birthYear: pA?.birthYear || profiles.A.birthYear },
                userB: { name: names.B, job: jobB, metrics: mainMetrics, typeCode: unionTypeCode, gender: pB?.gender || profiles.B.gender, birthYear: pB?.birthYear || profiles.B.birthYear }
            },
            consentAgreed: true,
            researchConsentAgreed: researchConsentAgreed,
            consentVersion: '2.0.0',
            consentAt: new Date().toISOString(),
        } as any;

        // Save with blobs
        if (mainAudioBlob) {
            await saveResult(coupleData, undefined, {
                userA: mainAudioBlob,
                userB: mainAudioBlob
            });
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
                <span className="text-pink-500">Couple</span> Analysis
            </h1>
            <p className="text-gray-400 mb-16 text-lg leading-relaxed">
                Step 1: Bio-Sync (Unison)<br />
                Step 2: Stress Conflict (Roleplay)<br />
                Step 3: Neural Flow (Speed)
            </p>

            <div className="glass rounded-2xl p-8 md:p-12 border-2 border-pink-500/20 bg-white/5 w-full mb-16 text-left space-y-10 shadow-2xl">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-500">Security Clearance</h3>
                <div className="space-y-4">
                    <label className="flex items-start gap-4 p-4 rounded-lg bg-black/40 hover:bg-black/60 transition-colors cursor-pointer group text-left">
                        <input
                            type="checkbox"
                            checked={isOver13}
                            onChange={(e) => setIsOver13(e.target.checked)}
                            className="mt-1 w-6 h-6 rounded border-gray-600 bg-black/50 cursor-pointer flex-shrink-0 accent-pink-500"
                        />
                        <span className="text-sm text-gray-400 leading-relaxed select-none block text-left font-bold transition-colors group-hover:text-white">
                            Both participants confirm they are at least 13 years of age.
                        </span>
                    </label>

                    <label className="flex items-start gap-4 p-4 rounded-lg bg-black/40 hover:bg-black/60 transition-colors cursor-pointer group text-left">
                        <input
                            type="checkbox"
                            checked={consentGiven}
                            onChange={(e) => setConsentGiven(e.target.checked)}
                            className="mt-1 w-6 h-6 rounded border-gray-600 bg-black/50 cursor-pointer flex-shrink-0 accent-pink-500"
                        />
                        <span className="text-sm text-gray-400 leading-relaxed select-none block text-left font-bold transition-colors group-hover:text-white">
                            We consent to our voices being recorded and analyzed for our diagnostic report.
                        </span>
                    </label>

                    <label className="flex items-start gap-4 p-4 rounded-lg bg-black/40 hover:bg-black/60 transition-colors cursor-pointer group text-left">
                        <input
                            type="checkbox"
                            checked={researchConsentAgreed}
                            onChange={(e) => setResearchConsentAgreed(e.target.checked)}
                            className="mt-1 w-6 h-6 rounded border-gray-600 bg-black/50 cursor-pointer flex-shrink-0 accent-pink-500"
                        />
                        <div className="space-y-1">
                            <span className="text-sm text-gray-400 leading-relaxed select-none block text-left font-bold transition-colors group-hover:text-white">
                                (Optional) We consent to anonymized research/AI improvement.
                            </span>
                            <span className="text-[10px] text-gray-500 block">Uses Differential Privacy for biometric vectors.</span>
                        </div>
                    </label>
                </div>
                <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono text-center">
                    Read our <Link href="/privacy" className="text-pink-500 hover:underline">Privacy Policy</Link> for details.
                </div>
            </div>

            <button
                onClick={() => setPhase('names')}
                disabled={!consentGiven || !isOver13}
                className="w-full bg-white text-black font-black py-4 rounded-full uppercase tracking-[0.2em] hover:bg-pink-500 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.2)]"
            >
                Start Sequence
            </button>

            <div className="mt-8 text-[10px] text-gray-700 font-mono">
                Support: <a href="mailto:info@etchvox.com" className="hover:text-gray-500">info@etchvox.com</a>
            </div>
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
    const [isOver13, setIsOver13] = useState(false);
    const [consentGiven, setConsentGiven] = useState(false);

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

                <div className="glass rounded-xl p-8 border-2 border-cyan-500/20 bg-white/5 space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">Security Clearance</h3>
                    <div className="space-y-4">
                        <label className="flex items-start gap-4 p-4 rounded-lg bg-black/40 hover:bg-black/60 transition-colors cursor-pointer group text-left">
                            <input
                                type="checkbox"
                                checked={isOver13}
                                onChange={(e) => setIsOver13(e.target.checked)}
                                className="mt-1 w-6 h-6 rounded border-gray-600 bg-black/50 cursor-pointer flex-shrink-0 accent-cyan-500"
                            />
                            <span className="text-sm text-gray-300 leading-relaxed select-none block font-bold transition-colors group-hover:text-white">
                                Both participants confirm they are at least 13 years of age.
                            </span>
                        </label>

                        <label className="flex items-start gap-4 p-4 rounded-lg bg-black/40 hover:bg-black/60 transition-colors cursor-pointer group text-left">
                            <input
                                type="checkbox"
                                checked={consentGiven}
                                onChange={(e) => setConsentGiven(e.target.checked)}
                                className="mt-1 w-6 h-6 rounded border-gray-600 bg-black/50 cursor-pointer flex-shrink-0 accent-cyan-500"
                            />
                            <span className="text-sm text-gray-300 leading-relaxed select-none block font-bold transition-colors group-hover:text-white">
                                Both participants consent to voice analysis by EtchVox.
                            </span>
                        </label>
                    </div>
                </div>

                <div className="pt-16">
                    <button
                        disabled={!nameA.trim() || !nameB.trim() || !isOver13 || !consentGiven}
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
    const [pA, setPA] = useState({ gender: 'non-binary', birthYear: new Date().getFullYear() - 25, job: 'Other' });
    const [pB, setPB] = useState({ gender: 'non-binary', birthYear: new Date().getFullYear() - 25, job: 'Other' });

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
                    <div className="pt-4 border-t border-white/5">
                        <label className="text-[10px] uppercase tracking-widest text-gray-600 font-bold block mb-4">Professional Orientation</label>
                        <select value={pA.job} onChange={e => setPA({ ...pA, job: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-medium outline-none focus:border-cyan-500 transition-all">
                            {JOBS.map(j => <option key={j} value={j}>{j}</option>)}
                        </select>
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
                    <div className="pt-4 border-t border-white/5">
                        <label className="text-[10px] uppercase tracking-widest text-gray-600 font-bold block mb-4">Professional Orientation</label>
                        <select value={pB.job} onChange={e => setPB({ ...pB, job: e.target.value })} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-xs font-medium outline-none focus:border-pink-500 transition-all">
                            {JOBS.map(j => <option key={j} value={j}>{j}</option>)}
                        </select>
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

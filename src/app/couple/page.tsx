'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { VoiceAnalyzer } from '@/lib/analyzer';
import { generateResultId } from '@/lib/permalink';
import { saveResult, getSessionId, VoiceResult } from '@/lib/storage';
import ParticleVisualizer from '@/components/recording/ParticleVisualizer';

type Phase = 'intro' | 'names' | 'recordA' | 'handoff' | 'recordB' | 'details' | 'analyzing';

const JOBS = [
    'Lawyer', 'Executive', 'Engineer', 'Doctor', 'Founder',
    'Consultant', 'Artist', 'Teacher', 'Designer', 'Nurse',
    'Writer', 'Musician', 'Student', 'Sales', 'Other'
];

export default function CouplePage() {
    const router = useRouter();
    const [phase, setPhase] = useState<Phase>('intro');
    const [timeLeft, setTimeLeft] = useState(10);
    const [isRecording, setIsRecording] = useState(false);

    // Consent
    const [consentGiven, setConsentGiven] = useState(false);

    // Data Store
    const [userA, setUserA] = useState({ name: '', job: JOBS[0], metrics: null as any, audioBlob: null as Blob | null });
    const [userB, setUserB] = useState({ name: '', job: JOBS[0], metrics: null as any, audioBlob: null as Blob | null });

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

    const startRecording = async (currentUser: 'A' | 'B') => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }
            });

            analyzerRef.current = new VoiceAnalyzer();
            await analyzerRef.current.initialize();
            analyzerRef.current.connectStream(stream);

            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'audio/webm;codecs=opus' });
            chunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorderRef.current.start(100);
            setIsRecording(true);
            setTimeLeft(8); // Short snappy recording

            // Start Visualizer Loop
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
                        finishRecording(currentUser);
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

    const finishRecording = async (currentUser: 'A' | 'B') => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (mediaRecorderRef.current) mediaRecorderRef.current.stop();

        // Get Analysis
        const analysis = analyzerRef.current?.analyze();
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

        if (currentUser === 'A') {
            setUserA(prev => ({ ...prev, metrics: analysis?.metrics, audioBlob }));
            setPhase('handoff');
        } else {
            setUserB(prev => ({ ...prev, metrics: analysis?.metrics, audioBlob }));
            setPhase('details');
        }

        setIsRecording(false);
    };

    const handleNamesSubmit = (nameA: string, nameB: string) => {
        setUserA(prev => ({ ...prev, name: nameA }));
        setUserB(prev => ({ ...prev, name: nameB }));
        setPhase('recordA');
    };

    const handleDetailsSubmit = (jobA: string, jobB: string) => {
        const finalUserA = { ...userA, job: jobA };
        const finalUserB = { ...userB, job: jobB };
        setUserA(finalUserA);
        setUserB(finalUserB);

        processCoupleResult(finalUserA, finalUserB);
    };

    const processCoupleResult = async (finalA: typeof userA, finalB: typeof userB) => {
        setPhase('analyzing');
        const coupleResultId = generateResultId();

        const coupleData: VoiceResult = {
            id: coupleResultId,
            sessionId: getSessionId(),
            typeCode: 'COUPLE_MIX' as any,
            metrics: finalA.metrics, // Store A's metrics as primary for indexing
            accentOrigin: 'Couple',
            createdAt: new Date().toISOString(),
            locale: 'en-US',
            isPremium: false,
            coupleData: {
                userA: { name: finalA.name, job: finalA.job, metrics: finalA.metrics },
                userB: { name: finalB.name, job: finalB.job, metrics: finalB.metrics }
            }
        } as any;

        // Save with blobs (R2 upload enabled)
        await saveResult(coupleData, undefined, {
            userA: finalA.audioBlob!,
            userB: finalB.audioBlob!
        });

        // Redirect directly to result page
        setTimeout(() => {
            router.push(`/result/${coupleResultId}`);
        }, 1500);
    };

    // --- UI COMPONENTS ---

    // 1. Intro (Consent)
    if (phase === 'intro') return (
        <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
            <h1 className="text-3xl font-bold uppercase tracking-widest mb-4">
                <span className="text-pink-500">Couple</span> Resonance
            </h1>
            <p className="text-gray-400 mb-8 text-sm leading-relaxed">
                Analyze your vocal chemistry and hidden dynamics.
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
                Start Analysis
            </button>
        </main>
    );

    // 2. Names Input
    if (phase === 'names') return (
        <NamesForm
            onBack={() => setPhase('intro')}
            onSubmit={handleNamesSubmit}
        />
    );

    // 3. Recording Stages
    if (phase === 'recordA' || phase === 'recordB') {
        const isA = phase === 'recordA';
        const name = isA ? userA.name : userB.name;

        return (
            <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
                <ParticleVisualizer analyser={analyzerRef.current?.getAnalyser() || null} isActive={isRecording} />
                <div className="z-10 text-center space-y-8 max-w-lg px-4">
                    <div className="uppercase tracking-[0.2em] text-pink-500 text-xs font-bold bg-pink-500/10 px-4 py-2 rounded-full inline-block">
                        REC: <span className="text-white ml-2 text-sm">{name}</span>
                    </div>

                    {!isRecording ? (
                        <div className="space-y-8 animate-fade-in">
                            <div className="glass rounded-xl p-8 border border-white/20 bg-black/40 backdrop-blur-md">
                                <p className="text-2xl md:text-3xl font-medium leading-relaxed font-serif italic text-gray-200">
                                    "I parked my car in the garage to drink a bottle of water. I am definitely not a robot."
                                </p>
                            </div>
                            <p className="text-sm text-gray-500 uppercase tracking-widest">
                                Read the above script
                            </p>
                            <button onClick={() => startRecording(isA ? 'A' : 'B')} className="w-20 h-20 rounded-full border-2 border-white/50 flex items-center justify-center hover:bg-white/10 hover:scale-110 transition-all mx-auto group">
                                <div className="w-5 h-5 bg-red-500 rounded-full animate-pulse group-hover:scale-125 transition-transform" />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-8">
                            <div className="glass rounded-xl p-8 border border-pink-500/30 bg-pink-500/5">
                                <p className="text-2xl md:text-3xl font-medium leading-relaxed font-serif italic text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">
                                    "I parked my car in the garage to drink a bottle of water. I am definitely not a robot."
                                </p>
                            </div>
                            <div className="text-6xl font-black font-mono tracking-tighter mix-blend-difference">{timeLeft}</div>
                        </div>
                    )}
                </div>
            </main>
        );
    }

    // 4. Handoff
    if (phase === 'handoff') return (
        <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center p-6">
            <div className="text-6xl mb-6 animate-bounce">📱</div>
            <h2 className="text-xl font-bold uppercase tracking-widest mb-2">Next: {userB.name}</h2>
            <p className="text-gray-400 text-sm mb-12">Pass the device to your partner.</p>
            <button onClick={() => setPhase('recordB')} className="bg-pink-500 hover:bg-pink-400 text-white w-full max-w-xs py-4 rounded-full font-bold uppercase tracking-widest transition-all">
                I'm Ready
            </button>
        </main>
    );

    // 5. Details (Job Selection)
    if (phase === 'details') return (
        <DetailsForm
            nameA={userA.name}
            nameB={userB.name}
            onSubmit={handleDetailsSubmit}
        />
    );

    // 6. Analyzing
    return (
        <main className="min-h-screen bg-black flex items-center justify-center">
            <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-t-pink-500 border-white/10 rounded-full animate-spin mx-auto" />
                <div className="text-pink-500 text-xs uppercase tracking-widest animate-pulse">Calculating Compatibility...</div>
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
                        placeholder="Name"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-lg outline-none focus:border-cyan-500 transition-colors"
                    />
                </div>
                <div>
                    <label className="text-xs uppercase tracking-wider text-pink-500 mb-2 block">Partner 2</label>
                    <input
                        value={nameB}
                        onChange={e => setNameB(e.target.value)}
                        placeholder="Name"
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-lg outline-none focus:border-pink-500 transition-colors"
                    />
                </div>
                <button
                    disabled={!nameA.trim() || !nameB.trim()}
                    onClick={() => onSubmit(nameA, nameB)}
                    className="w-full bg-gradient-to-r from-cyan-600 to-pink-600 text-white font-bold py-4 rounded-xl uppercase tracking-widest hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed mt-4 transition-all"
                >
                    Next Step
                </button>
            </div>
        </main>
    );
}

function DetailsForm({ nameA, nameB, onSubmit }: { nameA: string, nameB: string, onSubmit: (jA: string, jB: string) => void }) {
    const [jobA, setJobA] = useState(JOBS[0]);
    const [jobB, setJobB] = useState(JOBS[0]);

    return (
        <main className="min-h-screen bg-black text-white p-6 flex flex-col justify-center max-w-md mx-auto fade-in">
            <h2 className="text-xl font-bold uppercase tracking-widest mb-2 text-center">Final Details</h2>
            <p className="text-center text-gray-500 text-xs mb-8">Role info helps improve accuracy</p>

            <div className="space-y-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <label className="text-xs uppercase tracking-wider text-cyan-400 mb-2 block">{nameA}</label>
                    <select
                        value={jobA}
                        onChange={(e) => setJobA(e.target.value)}
                        className="w-full bg-black border border-white/20 rounded-lg p-3 text-white outline-none appearance-none"
                    >
                        {JOBS.map(j => <option key={j} value={j}>{j}</option>)}
                    </select>
                </div>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <label className="text-xs uppercase tracking-wider text-pink-500 mb-2 block">{nameB}</label>
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
                    Reveal Compatibility
                </button>
            </div>
        </main>
    );
}

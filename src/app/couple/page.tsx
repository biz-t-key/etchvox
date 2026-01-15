'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { VoiceAnalyzer } from '@/lib/analyzer';
import { generateResultId } from '@/lib/permalink';
import { saveResult, getSessionId, VoiceResult } from '@/lib/storage';
import ParticleVisualizer from '@/components/recording/ParticleVisualizer';

type Phase = 'intro' | 'recordA' | 'profileA' | 'handoff' | 'recordB' | 'profileB' | 'analyzing' | 'payment';

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

    // Data Store
    const [userA, setUserA] = useState<any>({});
    const [userB, setUserB] = useState<any>({});

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
            setTimeLeft(8); // Short snappy recording for couples

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

        const userData = {
            metrics: analysis?.metrics,
            audioBlob: audioBlob,
            tempId: generateResultId()
        };

        if (currentUser === 'A') {
            setUserA((prev: any) => ({ ...prev, ...userData }));
            setPhase('profileA');
        } else {
            setUserB((prev: any) => ({ ...prev, ...userData }));
            setPhase('profileB');
        }

        setIsRecording(false);
    };

    const handleProfileSubmit = (user: 'A' | 'B', name: string, job: string) => {
        if (user === 'A') {
            setUserA((prev: any) => ({ ...prev, name, job }));
            setPhase('handoff');
        } else {
            // ✅ Create final object before state update to avoid race condition
            const finalUserB = { ...userB, name, job };
            setUserB(finalUserB);
            // Pass final data directly instead of relying on state
            processCoupleResult(finalUserB);
        }
    };

    const processCoupleResult = async (finalUserB: any) => {
        setPhase('analyzing');

        // Ensure state is up to date (React batching might delay userB update)
        // const finalUserB = { ...userB, name: finalNameB, job: finalJobB }; // This line is removed

        // Save Result (Placeholder for couple logic)
        // Ideally we save a single "Couple Result" containing both metrics
        // For MVP, we save it as a result with specific metadata
        const coupleResultId = generateResultId();

        const coupleData: VoiceResult = {
            id: coupleResultId,
            sessionId: getSessionId(),
            typeCode: 'COUPLE_MIX' as any, // Placeholder type
            metrics: userA.metrics, // Main metrics (A) - we'll store B in custom fields
            accentOrigin: 'Couple',
            createdAt: new Date().toISOString(),
            locale: 'en-US',
            isPremium: false,
            // Custom fields for couple (will be saved to Firestore)
            coupleData: {
                userA: { name: userA.name, job: userA.job, metrics: userA.metrics },
                userB: { name: finalUserB.name, job: finalUserB.job, metrics: finalUserB.metrics }
            }
        } as any; // Cast as any to bypass strict type check for now

        // ✅ Save with COUPLE AUDIO BLOBS
        await saveResult(coupleData, undefined, {
            userA: userA.audioBlob,
            userB: finalUserB.audioBlob
        });

        // ✅ Redirect to Stripe Checkout for $15 payment
        try {
            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    resultId: coupleResultId,
                    type: 'couple', // Important: tells webhook this is couple analysis
                    successUrl: `${window.location.origin}/result/${coupleResultId}?payment=success`,
                    cancelUrl: `${window.location.origin}/couple?canceled=true`
                })
            });

            if (!response.ok) throw new Error('Checkout failed');

            const { url } = await response.json();
            window.location.href = url; // Redirect to Stripe
        } catch (error) {
            console.error('Payment error:', error);
            alert('Payment initialization failed. Please try again.');
            setPhase('profileB'); // Go back to allow retry
        }
    };

    // --- UI COMPONENTS ---

    // 1. Intro Screen
    if (phase === 'intro') return (
        <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
            <h1 className="text-3xl font-bold uppercase tracking-widest mb-4">
                <span className="text-pink-500">Couple</span> Resonance
            </h1>
            <p className="text-gray-400 max-w-md mb-8 text-sm leading-relaxed">
                Discover the acoustic physics of your relationship.<br />
                We analyze voice frequency, cadence, and tone to decode your hidden dynamics.
            </p>
            <div className="bg-white/5 border border-white/10 p-6 rounded-xl mb-8 w-full max-w-sm">
                <div className="flex justify-between text-xs text-gray-500 uppercase tracking-widest mb-4">
                    <span>Includes</span>
                    <span>$15.00</span>
                </div>
                <ul className="text-left space-y-3 text-sm text-gray-300">
                    <li className="flex gap-2"><span>🔬</span> Compatibility Score</li>
                    <li className="flex gap-2"><span>🎭</span> Vocal Archetype SCM</li>
                    <li className="flex gap-2"><span>🔥</span> Friction & Flow Analysis</li>
                </ul>
            </div>
            <button onClick={() => setPhase('recordA')} className="w-full max-w-xs bg-white text-black font-bold py-4 rounded-full uppercase tracking-[0.2em] hover:bg-pink-500 hover:text-white transition-colors">
                Start Analysis
            </button>
        </main>
    );

    // 2. Recording Screen (Shared)
    if (phase === 'recordA' || phase === 'recordB') {
        const currentUser = phase === 'recordA' ? 'Partner A' : 'Partner B';
        return (
            <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center relative overflow-hidden">
                <ParticleVisualizer analyser={analyzerRef.current?.getAnalyser() || null} isActive={isRecording} />

                <div className="z-10 text-center space-y-8">
                    <div className="uppercase tracking-[0.2em] text-pink-500 text-xs font-bold">
                        Recording: {currentUser}
                    </div>

                    {!isRecording ? (
                        <div className="space-y-6">
                            <p className="text-2xl font-light">"Tell us about your day in one sentence."</p>
                            <button onClick={() => startRecording(phase === 'recordA' ? 'A' : 'B')} className="w-20 h-20 rounded-full border-2 border-white flex items-center justify-center hover:bg-white/10 transition-all">
                                <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                            </button>
                        </div>
                    ) : (
                        <div className="text-6xl font-mono font-bold">{timeLeft}</div>
                    )}
                </div>
            </main>
        );
    }

    // 3. Profile Input (Shared)
    if (phase === 'profileA' || phase === 'profileB') {
        const currentUser = phase === 'profileA' ? 'A' : 'B';
        return <ProfileForm user={currentUser} onSubmit={(n, j) => handleProfileSubmit(currentUser, n, j)} />;
    }

    // 4. Handoff
    if (phase === 'handoff') return (
        <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center text-center p-6">
            <div className="text-4xl mb-6">🔄</div>
            <h2 className="text-xl font-bold uppercase tracking-widest mb-2">Next: Partner B</h2>
            <p className="text-gray-400 text-sm mb-8">Pass the device to your partner.</p>
            <button onClick={() => setPhase('recordB')} className="bg-pink-500 text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest">
                Ready
            </button>
        </main>
    );

    return (
        <main className="min-h-screen bg-black flex items-center justify-center">
            <div className="animate-spin text-4xl">⏳</div>
        </main>
    );
}

// Sub-component for Profile Form
function ProfileForm({ user, onSubmit }: { user: 'A' | 'B', onSubmit: (name: string, job: string) => void }) {
    const [name, setName] = useState('');
    const [job, setJob] = useState(JOBS[0]);

    return (
        <main className="min-h-screen bg-black text-white p-6 flex flex-col justify-center max-w-md mx-auto">
            <h2 className="text-xl font-bold uppercase tracking-widest mb-8 text-center text-gray-500">
                Partner {user} Profile
            </h2>

            <div className="space-y-6">
                <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Name / Nickname</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white placeholder-gray-700 focus:border-pink-500 outline-none transition-colors"
                        placeholder="e.g. Alex"
                    />
                </div>

                <div>
                    <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2">Profession (For SCM)</label>
                    <select
                        value={job}
                        onChange={(e) => setJob(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-lg p-4 text-white outline-none appearance-none"
                    >
                        {JOBS.map(j => <option key={j} value={j} className="bg-black">{j}</option>)}
                    </select>
                </div>

                <button
                    disabled={!name}
                    onClick={() => onSubmit(name, job)}
                    className="w-full bg-white text-black font-bold py-4 rounded-lg uppercase tracking-widest hover:bg-gray-200 disabled:opacity-50 mt-8"
                >
                    Continue
                </button>
            </div>
        </main>
    );
}

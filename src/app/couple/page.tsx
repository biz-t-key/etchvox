'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { coupleSteps, totalDuration, getStepByTime, getAlternatingWordIndex, CoupleStep } from '@/lib/coupleScripts';
import ParticleVisualizer from '@/components/recording/ParticleVisualizer';

type Phase = 'intro' | 'input' | 'recording' | 'processing' | 'complete';

interface UserInfo {
    name: string;
    job: string;
    accent: string;
}

export default function CoupleRecordPage() {
    const router = useRouter();
    const [phase, setPhase] = useState<Phase>('intro');
    const [userA, setUserA] = useState<UserInfo>({ name: '', job: '', accent: 'us' });
    const [userB, setUserB] = useState<UserInfo>({ name: '', job: '', accent: 'us' });
    const [currentStep, setCurrentStep] = useState<CoupleStep | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [stepElapsed, setStepElapsed] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [consentGiven, setConsentGiven] = useState(false);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const analyserRef = useRef<AnalyserNode | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // Cleanup
    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            if (audioContextRef.current) audioContextRef.current.close();
        };
    }, []);

    const startRecording = async () => {
        try {
            setError(null);

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false, // Keep natural audio for couple analysis
                    noiseSuppression: false,
                    sampleRate: 44100,
                },
            });

            // Setup AudioContext for visualization
            audioContextRef.current = new AudioContext({ sampleRate: 44100 });
            analyserRef.current = audioContextRef.current.createAnalyser();
            analyserRef.current.fftSize = 2048;

            const source = audioContextRef.current.createMediaStreamSource(stream);
            source.connect(analyserRef.current);

            // Setup MediaRecorder
            mediaRecorderRef.current = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus',
            });

            chunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            // Start recording
            mediaRecorderRef.current.start(100);
            setPhase('recording');
            setElapsedTime(0);
            setStepElapsed(0);

            // Timer
            let elapsed = 0;
            let stepStart = 0;
            timerRef.current = setInterval(() => {
                elapsed += 0.1;
                setElapsedTime(elapsed);

                const step = getStepByTime(elapsed);
                if (step) {
                    setCurrentStep(step);

                    // Calculate step-local elapsed time
                    let accumulatedTime = 0;
                    for (const s of coupleSteps) {
                        if (s.id === step.id) break;
                        accumulatedTime += s.duration;
                    }
                    setStepElapsed(elapsed - accumulatedTime);
                }

                if (elapsed >= totalDuration) {
                    finishRecording();
                }
            }, 100);

        } catch (err) {
            console.error('Microphone access denied:', err);
            setError('Microphone access required. Please allow access and try again.');
        }
    };

    const finishRecording = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }

        setPhase('processing');

        // In production, you would upload the audio and process with Python
        // For MVP, we simulate processing
        setTimeout(() => {
            // Generate a fake result ID
            const resultId = `CPL-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

            // Store user info
            const coupleData = {
                id: resultId,
                userA,
                userB,
                createdAt: new Date().toISOString(),
                // In production, these would come from Python processor
                matrixScore: Math.floor(Math.random() * 30) + 65, // 65-95
                status: 'demo', // Flag that this is demo data
            };

            localStorage.setItem(`etchvox_couple_${resultId}`, JSON.stringify(coupleData));

            setPhase('complete');
            router.push(`/couple/result/${resultId}`);
        }, 3000);
    }, [router, userA, userB]);

    // Render alternating words with highlights
    const renderAlternatingScript = () => {
        if (!currentStep || currentStep.phase !== 'alternating') return null;

        const words = currentStep.script.en.split(' | ');
        const pattern = currentStep.highlightPattern || [];
        const currentWordIndex = getAlternatingWordIndex(stepElapsed, currentStep);

        return (
            <div className="flex flex-wrap justify-center gap-2 text-2xl">
                {words.map((word, i) => {
                    const speaker = pattern[i];
                    const isActive = i === currentWordIndex;
                    const isPast = i < currentWordIndex;

                    let colorClass = 'text-gray-600';
                    if (isActive) {
                        colorClass = speaker === 'A' ? 'text-cyan-400 animate-pulse scale-125'
                            : speaker === 'B' ? 'text-magenta-400 animate-pulse scale-125'
                                : 'text-yellow-400 animate-pulse scale-125';
                    } else if (isPast) {
                        colorClass = 'text-gray-500';
                    }

                    return (
                        <span
                            key={i}
                            className={`transition-all duration-200 ${colorClass} ${isActive ? 'font-bold' : ''}`}
                        >
                            {speaker === 'BOTH' && isActive && <span className="text-xs block">TOGETHER!</span>}
                            {word}
                        </span>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-black py-8 px-4">
            <div className="max-w-lg mx-auto">

                {/* Intro Phase */}
                {phase === 'intro' && (
                    <div className="text-center fade-in">
                        <h1 className="text-3xl font-bold mb-4">
                            <span className="neon-text-cyan">Couple</span>{' '}
                            <span className="neon-text-magenta">Mode</span>
                        </h1>
                        <p className="text-gray-400 mb-8">
                            Discover your vocal compatibility. Record together on the same device.
                        </p>

                        <div className="glass rounded-xl p-6 mb-8 text-left">
                            <h2 className="font-semibold mb-4">How it works:</h2>
                            <ol className="text-gray-300 space-y-3 text-sm">
                                <li>1️⃣ Each person introduces themselves (5 sec each)</li>
                                <li>2️⃣ Read a sentence TOGETHER in sync (10 sec)</li>
                                <li>3️⃣ Act out a dramatic scene (4 sec each)</li>
                                <li>4️⃣ Speed challenge - alternate words! (8 sec)</li>
                            </ol>
                            <p className="text-gray-500 text-xs mt-4">
                                Total recording time: ~36 seconds
                            </p>
                        </div>

                        <button
                            onClick={() => setPhase('input')}
                            className="btn-primary px-8 py-4 rounded-full text-lg"
                        >
                            Let's Start 💕
                        </button>
                    </div>
                )}

                {/* Input Phase */}
                {phase === 'input' && (
                    <div className="fade-in">
                        <h2 className="text-2xl font-bold text-center mb-6">Tell us about yourselves</h2>

                        {/* User A */}
                        <div className="glass rounded-xl p-4 mb-4">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="w-8 h-8 rounded-full bg-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold">A</span>
                                <span className="font-semibold">Person A</span>
                            </div>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={userA.name}
                                    onChange={(e) => setUserA({ ...userA, name: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-cyan-500 outline-none"
                                />
                                <select
                                    value={userA.job}
                                    onChange={(e) => setUserA({ ...userA, job: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-cyan-500 outline-none"
                                >
                                    <option value="">Select Job...</option>
                                    <option value="engineer">Engineer</option>
                                    <option value="artist">Artist</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="doctor">Doctor</option>
                                    <option value="lawyer">Lawyer</option>
                                    <option value="founder">Founder</option>
                                    <option value="student">Student</option>
                                    <option value="freelancer">Freelancer</option>
                                    <option value="other">Other</option>
                                </select>
                                <select
                                    value={userA.accent}
                                    onChange={(e) => setUserA({ ...userA, accent: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-cyan-500 outline-none"
                                >
                                    <option value="us">🇺🇸 American</option>
                                    <option value="uk">🇬🇧 British</option>
                                    <option value="au">🇦🇺 Australian</option>
                                    <option value="asia">🌏 Asian</option>
                                    <option value="eu">🇪🇺 European</option>
                                    <option value="latam">🌎 Latin American</option>
                                </select>
                            </div>
                        </div>

                        {/* User B */}
                        <div className="glass rounded-xl p-4 mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="w-8 h-8 rounded-full bg-magenta-500/30 flex items-center justify-center text-magenta-400 font-bold">B</span>
                                <span className="font-semibold">Person B</span>
                            </div>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Name"
                                    value={userB.name}
                                    onChange={(e) => setUserB({ ...userB, name: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-magenta-500 outline-none"
                                />
                                <select
                                    value={userB.job}
                                    onChange={(e) => setUserB({ ...userB, job: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-magenta-500 outline-none"
                                >
                                    <option value="">Select Job...</option>
                                    <option value="engineer">Engineer</option>
                                    <option value="artist">Artist</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="doctor">Doctor</option>
                                    <option value="lawyer">Lawyer</option>
                                    <option value="founder">Founder</option>
                                    <option value="student">Student</option>
                                    <option value="freelancer">Freelancer</option>
                                    <option value="other">Other</option>
                                </select>
                                <select
                                    value={userB.accent}
                                    onChange={(e) => setUserB({ ...userB, accent: e.target.value })}
                                    className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-2 focus:border-magenta-500 outline-none"
                                >
                                    <option value="us">🇺🇸 American</option>
                                    <option value="uk">🇬🇧 British</option>
                                    <option value="au">🇦🇺 Australian</option>
                                    <option value="asia">🌏 Asian</option>
                                    <option value="eu">🇪🇺 European</option>
                                    <option value="latam">🌎 Latin American</option>
                                </select>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500 rounded-lg p-3 mb-4 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {/* Privacy Consent */}
                        <div className="glass rounded-xl p-6 mb-4 space-y-4 text-left">
                            <div className="flex items-start gap-3">
                                <input
                                    type="checkbox"
                                    id="couple-consent"
                                    checked={consentGiven}
                                    onChange={(e) => setConsentGiven(e.target.checked)}
                                    className="mt-1 w-5 h-5 rounded border-gray-600 bg-black cursor-pointer"
                                />
                                <label htmlFor="couple-consent" className="text-sm text-gray-300 leading-relaxed cursor-pointer">
                                    We consent to our voices being recorded and analyzed together. Voice data will be stored for 30 days, then deleted.
                                    {' '}<a href="/privacy" target="_blank" className="text-cyan-400 underline hover:text-cyan-300">Privacy Policy</a>
                                </label>
                            </div>
                        </div>

                        <button
                            onClick={startRecording}
                            disabled={!userA.name || !userB.name || !consentGiven}
                            className="w-full btn-metallic py-5 rounded-full text-lg font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                        >
                            <span className="mr-2">🎤</span> START RECORDING TOGETHER
                        </button>
                    </div>
                )}

                {/* Recording Phase */}
                {phase === 'recording' && currentStep && (
                    <div className="fade-in text-center">
                        {/* Progress */}
                        <div className="mb-4">
                            <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-cyan-500 to-magenta-500 transition-all duration-100"
                                    style={{ width: `${(elapsedTime / totalDuration) * 100}%` }}
                                />
                            </div>
                            <div className="text-gray-500 text-sm mt-1 mono">
                                {Math.floor(elapsedTime)}s / {totalDuration}s
                            </div>
                        </div>

                        {/* Speaker Indicator */}
                        <div className="flex justify-center gap-4 mb-4">
                            <div className={`px-4 py-2 rounded-full transition-all ${currentStep.speaker === 'A' || currentStep.speaker === 'BOTH' || currentStep.speaker === 'ALTERNATE'
                                ? 'bg-cyan-500/30 text-cyan-400 scale-110'
                                : 'bg-gray-800 text-gray-600'
                                }`}>
                                {userA.name || 'A'}
                            </div>
                            <div className={`px-4 py-2 rounded-full transition-all ${currentStep.speaker === 'B' || currentStep.speaker === 'BOTH' || currentStep.speaker === 'ALTERNATE'
                                ? 'bg-magenta-500/30 text-magenta-400 scale-110'
                                : 'bg-gray-800 text-gray-600'
                                }`}>
                                {userB.name || 'B'}
                            </div>
                        </div>

                        {/* UI Text */}
                        <div className="mono text-sm text-cyan-400 mb-4 animate-pulse">
                            {currentStep.ui.en}
                        </div>

                        {/* Visualizer */}
                        <div className="mb-4">
                            <ParticleVisualizer
                                analyser={analyserRef.current}
                                isActive={true}
                            />
                        </div>

                        {/* Instruction */}
                        <p className="text-gray-400 text-sm mb-4">
                            {currentStep.instruction.en}
                        </p>

                        {/* Script */}
                        {currentStep.phase === 'alternating' ? (
                            renderAlternatingScript()
                        ) : (
                            <div className="glass rounded-xl p-6">
                                <p className="text-xl font-medium leading-relaxed">
                                    "{currentStep.script.en}"
                                </p>
                            </div>
                        )}

                        {/* Timer */}
                        <div className="mt-6 flex items-center justify-center gap-2">
                            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-red-400 mono">REC</span>
                        </div>
                    </div>
                )}

                {/* Processing Phase */}
                {phase === 'processing' && (
                    <div className="text-center fade-in">
                        <div className="w-20 h-20 mx-auto mb-6 border-4 border-cyan-500 border-t-magenta-500 rounded-full animate-spin" />
                        <p className="mono text-cyan-400 animate-pulse mb-2">
                            Analyzing vocal compatibility...
                        </p>
                        <p className="text-gray-500 text-sm">
                            Calculating Matrix Score...
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

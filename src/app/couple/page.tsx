'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { coupleSteps, totalDuration, getStepByTime, getAlternatingWordIndex, CoupleStep } from '@/lib/coupleScripts';
import ParticleVisualizer from '@/components/recording/ParticleVisualizer';

type Phase = 'input' | 'recording' | 'processing' | 'complete';

interface UserInfo {
    name: string;
    job: string;
    accent: string;
}

export default function CoupleRecordPage() {
    const router = useRouter();
    const [phase, setPhase] = useState<Phase>('input');
    const [userA, setUserA] = useState<UserInfo>({ name: '', job: '', accent: 'us' });
    const [userB, setUserB] = useState<UserInfo>({ name: '', job: '', accent: 'us' });
    const [currentStep, setCurrentStep] = useState<CoupleStep | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [stepElapsed, setStepElapsed] = useState(0);
    const [error, setError] = useState<string | null>(null);
    const [consentGiven, setConsentGiven] = useState(false);
    const [countdown, setCountdown] = useState<number | null>(null);

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
                    // Check if transitioning TO unison phase - show countdown
                    const prevStep = getStepByTime(elapsed - 0.1);
                    if (step.phase === 'unison' && prevStep?.phase !== 'unison' && countdown === null) {
                        // Start countdown
                        setCountdown(3);
                        setTimeout(() => setCountdown(2), 1000);
                        setTimeout(() => setCountdown(1), 2000);
                        setTimeout(() => setCountdown(0), 3000); // 0 = GO!
                        setTimeout(() => setCountdown(null), 3500);
                    }

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
        <div className="min-h-screen bg-black py-12 px-6">
            <div className="max-w-2xl mx-auto">

                {/* Input Phase - Now includes intro info */}
                {phase === 'input' && (
                    <div className="fade-in space-y-10">
                        {/* Header */}
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl md:text-5xl font-bold">
                                <span className="neon-text-cyan">Couple</span>{' '}
                                <span className="neon-text-magenta">Mode</span>
                            </h1>
                            <p className="text-gray-400 text-lg">
                                Discover your vocal compatibility together
                            </p>
                        </div>

                        {/* Compact How it works */}
                        <div className="glass rounded-2xl p-6 text-center">
                            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-300">
                                <span>🎤 Intro (5s each)</span>
                                <span>→</span>
                                <span>🎵 Read Together (10s)</span>
                                <span>→</span>
                                <span>🎭 Drama (4s each)</span>
                                <span>→</span>
                                <span>⚡ Speed Round (8s)</span>
                            </div>
                            <p className="text-gray-500 text-xs mt-3">Total: ~36 seconds</p>
                        </div>

                        {/* Name Input Cards */}
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-6">Who's playing?</h2>
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Person A Card */}
                            <div className="rounded-2xl p-8 border-2 border-cyan-500/40 bg-cyan-500/5">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="w-12 h-12 rounded-full bg-cyan-500/30 flex items-center justify-center text-cyan-400 font-black text-xl">A</span>
                                    <span className="text-xl font-bold neon-text-cyan">Person A</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter name..."
                                    value={userA.name}
                                    onChange={(e) => setUserA({ ...userA, name: e.target.value })}
                                    className="w-full bg-black/50 border-2 border-cyan-500/30 rounded-xl px-5 py-4 text-lg focus:border-cyan-500 outline-none placeholder:text-gray-600"
                                    autoFocus
                                />
                            </div>

                            {/* Person B Card */}
                            <div className="rounded-2xl p-8 border-2 border-magenta-500/40 bg-magenta-500/5">
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="w-12 h-12 rounded-full bg-magenta-500/30 flex items-center justify-center text-magenta-400 font-black text-xl">B</span>
                                    <span className="text-xl font-bold neon-text-magenta">Person B</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Enter name..."
                                    value={userB.name}
                                    onChange={(e) => setUserB({ ...userB, name: e.target.value })}
                                    className="w-full bg-black/50 border-2 border-magenta-500/30 rounded-xl px-5 py-4 text-lg focus:border-magenta-500 outline-none placeholder:text-gray-600"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500 rounded-xl p-5 mb-6 text-red-400 text-base">
                                {error}
                            </div>
                        )}

                        {/* Privacy Consent - Required */}
                        <div className="glass rounded-2xl p-8 mb-6 border-2 border-white/10">
                            <div className="flex items-start gap-4">
                                <input
                                    type="checkbox"
                                    id="couple-consent"
                                    checked={consentGiven}
                                    onChange={(e) => setConsentGiven(e.target.checked)}
                                    className="mt-1 w-6 h-6 rounded border-gray-600 bg-black/50 cursor-pointer flex-shrink-0"
                                />
                                <label htmlFor="couple-consent" className="text-base text-gray-200 leading-relaxed cursor-pointer select-none">
                                    We consent to our voices being <strong className="text-white">recorded, analyzed, and stored</strong> together on EtchVox servers.
                                    Our voice data and compatibility results will be kept unless we request deletion.
                                    {' '}<a href="/privacy" target="_blank" className="text-cyan-400 underline hover:text-cyan-300 font-semibold">Privacy Policy</a>
                                </label>
                            </div>
                        </div>

                        <button
                            onClick={startRecording}
                            disabled={!userA.name || !userB.name || !consentGiven}
                            className="w-full btn-metallic py-6 rounded-full text-xl font-bold disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                            <span className="mr-3">🎤</span> START RECORDING TOGETHER
                        </button>

                        {(!userA.name || !userB.name || !consentGiven) && (
                            <p className="text-amber-400 text-sm font-semibold text-center">
                                {!userA.name || !userB.name ? '↑ Enter both names' : '↑ Please accept the consent to continue'}
                            </p>
                        )}
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

                        {/* Speaker Indicator - Larger and clearer */}
                        <div className="flex justify-center gap-6 mb-8">
                            <div className={`px-6 py-3 rounded-full transition-all font-bold text-lg ${currentStep.speaker === 'A' || currentStep.speaker === 'BOTH' || currentStep.speaker === 'ALTERNATE'
                                ? 'bg-cyan-500/40 text-cyan-300 scale-110 border-2 border-cyan-500 shadow-[0_0_20px_rgba(0,240,255,0.3)]'
                                : 'bg-gray-800 text-gray-600 border-2 border-transparent'
                                }`}>
                                <span className="mr-2">🎤</span>{userA.name || 'A'}
                            </div>
                            <div className={`px-6 py-3 rounded-full transition-all font-bold text-lg ${currentStep.speaker === 'B' || currentStep.speaker === 'BOTH' || currentStep.speaker === 'ALTERNATE'
                                ? 'bg-magenta-500/40 text-magenta-300 scale-110 border-2 border-magenta-500 shadow-[0_0_20px_rgba(255,0,255,0.3)]'
                                : 'bg-gray-800 text-gray-600 border-2 border-transparent'
                                }`}>
                                <span className="mr-2">🎤</span>{userB.name || 'B'}
                            </div>
                        </div>

                        {/* Countdown Overlay for Unison */}
                        {countdown !== null && (
                            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
                                <div className="text-center">
                                    <div className="text-9xl font-black animate-pulse">
                                        {countdown === 0 ? (
                                            <span className="bg-gradient-to-r from-cyan-400 to-magenta-400 bg-clip-text text-transparent">GO!</span>
                                        ) : (
                                            <span className="text-white">{countdown}</span>
                                        )}
                                    </div>
                                    <p className="text-gray-400 text-xl mt-4">Read TOGETHER!</p>
                                </div>
                            </div>
                        )}

                        {/* UI Text - Larger */}
                        <div className="mono text-base text-cyan-400 mb-6 animate-pulse">
                            {currentStep.ui.en}
                        </div>

                        {/* Visualizer - More space */}
                        <div className="mb-8">
                            <ParticleVisualizer
                                analyser={analyserRef.current}
                                isActive={true}
                            />
                        </div>

                        {/* Instruction - Larger */}
                        <p className="text-gray-300 text-lg mb-8 font-medium">
                            {currentStep.instruction.en}
                        </p>

                        {/* Script */}
                        {currentStep.phase === 'alternating' ? (
                            renderAlternatingScript()
                        ) : (
                            <div className="glass rounded-2xl p-10 border border-white/10">
                                <p className="text-2xl font-semibold leading-relaxed">
                                    "{currentStep.script.en}"
                                </p>
                            </div>
                        )}

                        {/* Timer - Larger */}
                        <div className="mt-10 flex items-center justify-center gap-3">
                            <span className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-red-400 mono text-lg font-bold">RECORDING</span>
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

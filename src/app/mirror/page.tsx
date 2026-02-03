'use client';

import { useState, useRef, useEffect } from 'react';
import { VoiceAnalyzer } from '@/lib/analyzer';
import { initializeAuth, loadUserHash } from '@/lib/authService';
import MirrorDashboard from '@/components/mirror/MirrorDashboard';
import Link from 'next/link';

type Phase = 'auth' | 'ready' | 'recording' | 'analyzing' | 'result';

export default function MirrorPage() {
    const [phase, setPhase] = useState<Phase>('auth');
    const [userHash, setUserHash] = useState<string | null>(null);
    const [mnemonic, setMnemonic] = useState<string | null>(null);
    const [isNewUser, setIsNewUser] = useState(false);
    const [showMnemonic, setShowMnemonic] = useState(false);

    const [timeLeft, setTimeLeft] = useState(5);
    const [vector, setVector] = useState<number[] | null>(null);

    const analyzerRef = useRef<VoiceAnalyzer | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        checkAuth();
    }, []);

    async function checkAuth() {
        try {
            const auth = await initializeAuth();
            setUserHash(auth.userHash);
            setMnemonic(auth.mnemonic);
            setIsNewUser(auth.isNew);

            if (auth.isNew) {
                setShowMnemonic(true);
            } else {
                setPhase('ready');
            }
        } catch (error) {
            console.error('Auth initialization failed:', error);
        }
    }

    async function startRecording() {
        try {
            setPhase('recording');

            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,
                    noiseSuppression: false,
                    autoGainControl: false,
                    sampleRate: 48000,
                },
            });

            analyzerRef.current = new VoiceAnalyzer();
            await analyzerRef.current.initialize();
            analyzerRef.current.connectStream(stream);

            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.start(100);

            // Start collecting samples
            const collectLoop = () => {
                if (analyzerRef.current && phase === 'recording') {
                    analyzerRef.current.collectSample();
                }
                animationFrameRef.current = requestAnimationFrame(collectLoop);
            };
            collectLoop();

            // Start timer
            setTimeLeft(5);
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        finishRecording();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err) {
            console.error('Microphone access denied:', err);
        }
    }

    function finishRecording() {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }

        setPhase('analyzing');

        // Extract 30D vector
        setTimeout(() => {
            if (analyzerRef.current) {
                const v = analyzerRef.current.get30DVector();
                setVector(v);
                setPhase('result');
            }
        }, 1500);
    }

    function handleDone() {
        setPhase('ready');
        setVector(null);

        // Reset analyzer
        if (analyzerRef.current) {
            analyzerRef.current.reset();
        }
    }

    // Auth phase
    if (phase === 'auth' || (isNewUser && showMnemonic)) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-6">
                <div className="max-w-lg w-full space-y-8 bg-white/5 backdrop-blur-sm p-10 rounded-2xl border border-white/10">
                    <div className="text-center space-y-2">
                        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            Voice Mirror
                        </h1>
                        <p className="text-gray-400 text-sm">Zero-Knowledge Authentication</p>
                    </div>

                    {isNewUser && showMnemonic ? (
                        <div className="space-y-6">
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 space-y-3">
                                <h2 className="text-red-400 font-bold text-sm uppercase tracking-wider">⚠️ Critical: Save Your Recovery Phrase</h2>
                                <p className="text-gray-300 text-sm leading-relaxed">
                                    This 12-word phrase is your ONLY way to access your data on a new device.
                                    Take a screenshot or write it down. We cannot recover it for you.
                                </p>
                            </div>

                            <div className="bg-black/40 rounded-xl p-6 border border-cyan-500/20">
                                <div className="grid grid-cols-3 gap-3">
                                    {mnemonic?.split(' ').map((word, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <span className="text-gray-500 text-xs font-mono">{idx + 1}.</span>
                                            <span className="text-cyan-400 font-mono font-bold">{word}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => {
                                    setShowMnemonic(false);
                                    setPhase('ready');
                                }}
                                className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-[0_0_20px_rgba(34,211,238,0.5)] transition-all"
                            >
                                I've Saved It Securely →
                            </button>
                        </div>
                    ) : (
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-gray-400 text-sm mt-4">Initializing secure session...</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Result phase
    if (phase === 'result' && vector) {
        return <MirrorDashboard vector={vector} onClose={handleDone} />;
    }

    // Analyzing phase
    if (phase === 'analyzing') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 mx-auto border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-cyan-400 font-mono text-lg animate-pulse">Extracting bio-acoustic signature...</p>
                </div>
            </div>
        );
    }

    // Recording phase
    if (phase === 'recording') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-6">
                <div className="text-center space-y-12">
                    <h2 className="text-2xl font-bold text-white">Speak naturally for 5 seconds</h2>

                    <div className="flex items-center justify-center">
                        <div className="relative w-32 h-32">
                            <div className="absolute inset-0 rounded-full border-4 border-cyan-500/30" />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-5xl font-black text-cyan-400">{timeLeft}</span>
                            </div>
                            <div className="absolute inset-0 rounded-full border-4 border-cyan-500 animate-ping" />
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-3">
                        <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                        <span className="text-red-400 font-mono text-sm">RECORDING</span>
                    </div>
                </div>
            </div>
        );
    }

    // Ready phase
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-6">
            <div className="max-w-2xl w-full space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        Voice Mirror
                    </h1>
                    <p className="text-gray-400 text-lg">Daily Bio-Acoustic Check-In</p>
                    {userHash && (
                        <p className="text-gray-600 text-xs font-mono">ID: {userHash.slice(0, 8)}...{userHash.slice(-8)}</p>
                    )}
                </div>

                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 space-y-6">
                    <h2 className="text-sm font-black uppercase tracking-widest text-cyan-400">How It Works</h2>
                    <ul className="space-y-3 text-gray-300">
                        <li className="flex items-start gap-3">
                            <span className="text-cyan-400 font-bold">1.</span>
                            <span>Record a 5-second voice sample</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-cyan-400 font-bold">2.</span>
                            <span>Receive a bio-acoustic analysis from the Voice Oracle</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <span className="text-cyan-400 font-bold">3.</span>
                            <span>Tag your state to build your personalized baseline</span>
                        </li>
                    </ul>
                </div>

                <button
                    onClick={startRecording}
                    className="w-full py-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xl font-bold rounded-2xl hover:shadow-[0_0_30px_rgba(34,211,238,0.5)] transition-all"
                >
                    <span className="mr-3">🎤</span>
                    Start Mirror Session
                </button>

                <div className="text-center">
                    <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm transition">
                        ← Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

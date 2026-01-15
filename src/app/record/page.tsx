'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { VoiceAnalyzer } from '@/lib/analyzer';
import { generateResultId } from '@/lib/permalink';
import { saveResult, getSessionId, VoiceResult } from '@/lib/storage';
import { ToxicityProfile } from '@/lib/toxicity';
import ParticleVisualizer from '@/components/recording/ParticleVisualizer';
import AccentSelector from '@/components/recording/AccentSelector';
import ToxicitySelector from '@/components/recording/ToxicitySelector';

type RecordingStep = 1 | 2 | 3;
type Phase = 'ready' | 'recording' | 'analyzing' | 'toxicity' | 'accent' | 'complete';

const SCRIPTS = {
    1: {
        ui: 'Calibrating Location Data...',
        script: 'I parked my car in the garage to drink a bottle of water. I am definitely not a robot.',
        duration: 10,
    },
    2: {
        ui: 'Testing Vocal Stress Levels...',
        script: 'Warning! System failure! Shut it down NOW!',
        duration: 8,
    },
    3: {
        ui: 'Analyzing Processing Speed...',
        script: 'Six systems synthesized sixty-six signals simultaneously.',
        duration: 8,
    },
};

export default function RecordPage() {
    const router = useRouter();
    const [phase, setPhase] = useState<Phase>('ready');
    const [step, setStep] = useState<RecordingStep>(1);
    const [timeLeft, setTimeLeft] = useState(SCRIPTS[1].duration);
    const [error, setError] = useState<string | null>(null);
    const [selectedAccent, setSelectedAccent] = useState<string | null>(null);
    const [toxicity, setToxicity] = useState<ToxicityProfile | null>(null);
    const [consentGiven, setConsentGiven] = useState(false);

    const analyzerRef = useRef<VoiceAnalyzer | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const chunksRef = useRef<Blob[]>([]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (analyzerRef.current) {
                analyzerRef.current.destroy();
            }
        };
    }, []);

    const finishRecording = useCallback(() => {
        // Stop timer
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        // Stop animation
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        // Stop recording
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
        }

        setPhase('analyzing');

        // Show toxicity selector after brief delay
        setTimeout(() => {
            setPhase('toxicity');
        }, 1500);
    }, []);

    const startRecording = async () => {
        try {
            setError(null);

            // Request microphone access - RAW AUDIO for "Digital Amber"
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: false,      // ✅ 生のエコー保持
                    noiseSuppression: false,      // ✅ 環境音保持（カフェ、風、etc）
                    autoGainControl: false,       // ✅ 自動音量調整なし
                    sampleRate: 48000,            // ✅ CD品質（44.1kHz）を超える高品質
                },
            });

            // Initialize analyzer
            analyzerRef.current = new VoiceAnalyzer();
            await analyzerRef.current.initialize();
            analyzerRef.current.connectStream(stream);

            // Setup MediaRecorder
            mediaRecorderRef.current = new MediaRecorder(stream, {
                mimeType: 'audio/webm;codecs=opus',
            });

            chunksRef.current = [];
            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorderRef.current.start(100);
            setPhase('recording');
            setStep(1);
            setTimeLeft(SCRIPTS[1].duration);

            // Start collecting samples
            const collectLoop = () => {
                if (analyzerRef.current && phase === 'recording') {
                    analyzerRef.current.collectSample();
                }
                const frameId = requestAnimationFrame(collectLoop);
                animationFrameRef.current = frameId;
            };
            collectLoop();

            // Start timer
            startTimer();
        } catch (err) {
            console.error('Microphone access denied:', err);
            setError('Microphone access denied. Please allow microphone access and try again.');
        }
    };

    const startTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    // Move to next step or finish
                    setStep((currentStep) => {
                        if (currentStep < 3) {
                            const nextStep = (currentStep + 1) as RecordingStep;
                            setTimeLeft(SCRIPTS[nextStep].duration);
                            return nextStep;
                        } else {
                            // Recording complete
                            finishRecording();
                            return currentStep;
                        }
                    });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [finishRecording]);

    const handleToxicitySelect = (profile: ToxicityProfile) => {
        setToxicity(profile);
        setPhase('accent');
    };

    const handleAccentSelect = async (accent: string) => {
        setSelectedAccent(accent);
        setPhase('analyzing');

        // Analyze the recording
        if (analyzerRef.current) {
            const analysisResult = analyzerRef.current.analyze();

            // Generate result ID
            const resultId = generateResultId();
            const sessionId = getSessionId();

            // ✅ Create audio blob from recorded chunks
            const audioBlob = chunksRef.current.length > 0
                ? new Blob(chunksRef.current, { type: 'audio/webm' })
                : undefined;

            // Create result object
            const result: VoiceResult = {
                id: resultId,
                sessionId,
                typeCode: analysisResult.typeCode,
                metrics: analysisResult.metrics,
                accentOrigin: accent,
                createdAt: new Date().toISOString(),
                locale: 'en',
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
                vaultEnabled: false, // Will be updated after Vault purchase
                toxicityProfile: toxicity || undefined,
            };

            // ✅ Save result with audio blob (will only save audio if vaultEnabled: true)
            await saveResult(result, audioBlob);

            // Navigate to result page
            setTimeout(() => {
                router.push(`/result/${resultId}`);
            }, 500);
        }
    };

    const skipToResult = () => {
        // Skip even if recording isn't complete
        finishRecording();
    };

    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center px-6 md:px-8 py-12 bg-black">
            {/* Background */}
            <div className="absolute inset-0">
                <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-magenta-500/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-2xl mx-auto text-center">
                {/* Ready Phase */}
                {phase === 'ready' && (
                    <div className="fade-in space-y-12">
                        <div className="space-y-6">
                            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                                <span className="neon-text-cyan">Voice Analysis</span>
                            </h1>
                            <p className="text-gray-300 text-xl md:text-2xl leading-relaxed max-w-xl mx-auto">
                                Read the prompts aloud. Takes about 30 seconds.
                            </p>
                        </div>

                        <div className="glass rounded-2xl p-10 md:p-12 space-y-6">
                            <h2 className="text-2xl font-semibold">Instructions</h2>
                            <ul className="text-left text-gray-300 space-y-4 text-lg max-w-md mx-auto">
                                <li>• Find a quiet place</li>
                                <li>• Hold device 30cm from mouth</li>
                                <li>• Read naturally (don't act)</li>
                                <li>• 3 different prompts</li>
                            </ul>
                        </div>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500 rounded-xl p-6 text-red-400 text-base">
                                {error}
                            </div>
                        )}

                        {/* Privacy Consent - Required */}
                        <div className="glass rounded-2xl p-8 border-2 border-white/10">
                            <div className="flex items-start gap-4">
                                <input
                                    type="checkbox"
                                    id="consent"
                                    checked={consentGiven}
                                    onChange={(e) => setConsentGiven(e.target.checked)}
                                    className="mt-1 w-6 h-6 rounded border-gray-600 bg-black/50 cursor-pointer flex-shrink-0"
                                />
                                <label htmlFor="consent" className="text-base text-gray-200 leading-relaxed cursor-pointer select-none">
                                    I consent to my voice being <strong className="text-white">recorded, analyzed, and stored</strong> on EtchVox servers.
                                    My voice data and analysis results will be kept unless I request deletion.
                                    {' '}<Link href="/privacy" className="text-cyan-400 underline hover:text-cyan-300 font-semibold">Privacy Policy</Link>
                                </label>
                            </div>
                        </div>

                        <button
                            onClick={startRecording}
                            disabled={!consentGiven}
                            className="btn-metallic text-2xl px-16 py-7 rounded-full font-bold transition-all hover:scale-105 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            <span className="mr-3">🎤</span>
                            START RECORDING
                        </button>

                        {!consentGiven && (
                            <p className="text-amber-400 text-sm font-semibold animate-pulse">
                                ↑ Please accept the consent to continue
                            </p>
                        )}
                    </div>
                )}

                {/* Recording Phase */}
                {phase === 'recording' && (
                    <div className="fade-in space-y-8">
                        {/* Step Indicator */}
                        <div className="flex justify-center gap-3">
                            {[1, 2, 3].map((s) => (
                                <div
                                    key={s}
                                    className={`w-3 h-3 rounded-full transition-colors ${s === step ? 'bg-cyan-400' : s < step ? 'bg-cyan-600' : 'bg-gray-700'
                                        }`}
                                />
                            ))}
                        </div>

                        {/* UI Text */}
                        <div className="mono text-base text-cyan-400 animate-pulse">
                            {SCRIPTS[step].ui}
                        </div>

                        {/* Visualizer */}
                        <div className="my-8">
                            <ParticleVisualizer
                                analyser={analyzerRef.current?.getAnalyser() || null}
                                isActive={phase === 'recording'}
                            />
                        </div>

                        {/* Script to read */}
                        <div className="glass rounded-xl p-8">
                            <p className="text-xl md:text-2xl font-medium leading-relaxed">
                                "{SCRIPTS[step].script}"
                            </p>
                        </div>

                        {/* Timer */}
                        <div className="flex items-center justify-center gap-6 pt-4">
                            <div className="w-20 h-20 rounded-full border-4 border-cyan-500 flex items-center justify-center">
                                <span className="mono text-3xl font-bold">{timeLeft}</span>
                            </div>
                            <button
                                onClick={skipToResult}
                                className="text-gray-500 hover:text-gray-300 text-base transition-colors"
                            >
                                Skip →
                            </button>
                        </div>

                        {/* Recording Indicator */}
                        <div className="flex items-center justify-center gap-3 pt-6">
                            <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                            <span className="text-red-400 mono text-base">REC</span>
                        </div>
                    </div>
                )}

                {/* Analyzing Phase */}
                {phase === 'analyzing' && (
                    <div className="fade-in space-y-6">
                        <div>
                            <div className="w-20 h-20 mx-auto border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                        <p className="mono text-cyan-400 animate-pulse text-lg">
                            Analyzing voice patterns...
                        </p>
                        <p className="text-gray-400 text-base leading-relaxed">
                            Detecting humanity levels...
                        </p>
                    </div>
                )}

                {/* Toxicity Selection Phase */}
                {phase === 'toxicity' && (
                    <ToxicitySelector onComplete={handleToxicitySelect} />
                )}

                {/* Accent Selection Phase */}
                {phase === 'accent' && (
                    <AccentSelector onSelect={handleAccentSelect} />
                )}
            </div>
        </div>
    );
}

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
import MBTISelector from '@/components/result/MBTISelector';
import { MBTIType } from '@/lib/mbti';

type RecordingStep = 1 | 2 | 3;
type Phase = 'ready' | 'recording' | 'analyzing' | 'calibration' | 'mbti' | 'toxicity' | 'accent' | 'complete';

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
    const [isOver13, setIsOver13] = useState(false);
    const [gender, setGender] = useState<string>('non-binary');
    const [birthYear, setBirthYear] = useState<number>(new Date().getFullYear() - 25);
    const [mbti, setMbti] = useState<MBTIType | null>(null);

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

        // Show calibration after brief delay
        setTimeout(() => {
            setPhase('calibration');
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

    const handleCalibrationSubmit = (g: string, y: number) => {
        setGender(g);
        setBirthYear(y);
        setPhase('mbti');
    };

    const handleMBTISelect = (selectedMbti: MBTIType | null) => {
        setMbti(selectedMbti);
        setPhase('toxicity');
    };

    const handleToxicitySelect = (profile: ToxicityProfile) => {
        setToxicity(profile);
        setPhase('accent'); // Go directly to Accent
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
                gender: gender,
                birthYear: birthYear,
                mbti: mbti || undefined,
                createdAt: new Date().toISOString(),
                locale: 'en',
                userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
                vaultEnabled: false, // Will be updated after Vault purchase
                toxicityProfile: toxicity || undefined,
                consentAgreed: true,
                consentVersion: '1.0.0', // Current Terms version
                consentAt: new Date().toISOString(),
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
        <div className="relative min-h-screen flex flex-col items-center justify-center px-6 md:px-8 py-32 md:py-48 bg-black">
            {/* Background */}
            <div className="absolute inset-0">
                <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-cyan-500/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-1/3 right-1/3 w-64 h-64 bg-magenta-500/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 w-full max-w-2xl mx-auto text-center">
                {/* Ready Phase */}
                {phase === 'ready' && (
                    <div className="fade-in space-y-20">
                        <div className="space-y-10">
                            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
                                <span className="neon-text-cyan">Voice Analysis</span>
                            </h1>
                            <p className="text-gray-300 text-xl md:text-2xl leading-relaxed max-w-xl mx-auto">
                                Read the prompts aloud. Takes about 30 seconds.
                            </p>
                        </div>

                        <div className="glass rounded-2xl p-8 space-y-4 max-w-lg mx-auto">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-gray-500">Instructions</h2>
                            <ul className="text-left text-gray-300 space-y-3 text-base font-medium max-w-sm mx-auto pl-4 list-disc marker:text-cyan-500">
                                <li className="pl-2">Find a quiet place</li>
                                <li className="pl-2">Hold device 30cm from mouth</li>
                                <li className="pl-2">Read naturally (don't act)</li>
                                <li className="pl-2">3 different prompts</li>
                            </ul>
                        </div>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500 rounded-xl p-6 text-red-400 text-base">
                                {error}
                            </div>
                        )}

                        <div className="glass rounded-xl p-8 border-2 border-cyan-500/20 bg-white/5 max-w-xl mx-auto space-y-6">
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
                                        I confirm that I am at least 13 years of age.
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
                                        I consent to my voice being recorded and analyzed by EtchVox.
                                    </span>
                                </label>
                            </div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                                Read our <Link href="/privacy" className="text-cyan-500 hover:underline">Privacy Policy</Link> for details.
                            </div>
                        </div>

                        <button
                            onClick={startRecording}
                            disabled={!consentGiven || !isOver13}
                            className="btn-metallic text-lg md:text-xl px-12 py-5 rounded-full font-bold transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 min-w-[280px]"
                        >
                            <span className="mr-3 text-2xl">🎤</span>
                            START RECORDING
                        </button>

                        {(!consentGiven || !isOver13) && (
                            <p className="text-amber-400 text-sm font-semibold animate-pulse">
                                ↑ Please complete the requirements to continue
                            </p>
                        )}
                    </div>
                )}

                {/* Recording Phase */}
                {phase === 'recording' && (
                    <div className="fade-in space-y-16">
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
                        <div className="my-16">
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

                {/* Calibration Phase */}
                {phase === 'calibration' && (
                    <CalibrationForm
                        currentGender={gender}
                        currentYear={birthYear}
                        onComplete={handleCalibrationSubmit}
                    />
                )}

                {/* MBTI Selection Phase */}
                {phase === 'mbti' && (
                    <div className="space-y-8">
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-black neon-text-magenta uppercase italic tracking-tighter">Psychological Baseline</h2>
                            <p className="text-gray-500 text-xs">Self-perception calibration for Identity Gap calculation.</p>
                        </div>
                        <MBTISelector onSelect={handleMBTISelect} onSkip={() => handleMBTISelect(null)} />
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

// --- Sub-components ---

function CalibrationForm({ onComplete, currentGender, currentYear }: { onComplete: (g: string, y: number) => void, currentGender: string, currentYear: number }) {
    const [gender, setGender] = useState(currentGender);
    const [year, setYear] = useState(currentYear);

    return (
        <div className="fade-in max-w-xl mx-auto space-y-12 pb-20">
            <div className="space-y-4">
                <h2 className="text-3xl font-black neon-text-cyan uppercase italic tracking-widest">Vocal Calibration</h2>
                <p className="text-gray-400 text-sm">Targeting demographic baseline to adjust resonance markers.</p>
            </div>

            <div className="glass rounded-2xl p-10 border border-white/10 bg-white/5 space-y-12 shadow-2xl">
                <div className="space-y-6">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold block text-left">Gender Identity</label>
                    <div className="grid grid-cols-3 gap-4">
                        {['male', 'female', 'non-binary'].map((g) => (
                            <button
                                key={g}
                                onClick={() => setGender(g)}
                                className={`px-2 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${gender === g
                                    ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.5)]'
                                    : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
                                    }`}
                            >
                                {g === 'non-binary' ? 'Fluid' : g}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold block text-left">Year of Origin (Birth)</label>
                    <select
                        value={year}
                        onChange={(e) => setYear(parseInt(e.target.value))}
                        className="w-full bg-black border-2 border-white/10 rounded-xl p-5 text-white font-bold text-lg outline-none focus:border-cyan-500 transition-all appearance-none text-center"
                    >
                        {Array.from({ length: 80 }, (_, i) => new Date().getFullYear() - 13 - i).map((y) => (
                            <option key={y} value={y}>{y}</option>
                        ))}
                    </select>
                </div>
            </div>

            <button
                onClick={() => onComplete(gender, year)}
                className="btn-metallic w-full py-5 rounded-2xl font-black text-xl uppercase tracking-[0.2em]"
            >
                Confirm Baseline →
            </button>
        </div>
    );
}

'use client';

import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { VoiceAnalyzer, runJudgeEngine } from '@/lib/analyzer';
import { generateResultId } from '@/lib/permalink';
import { saveResult, getSessionId, VoiceResult } from '@/lib/storage';
import { ToxicityProfile } from '@/lib/toxicity';
import { MBTIType } from '@/lib/mbti';
import { secureVault } from '@/lib/vault';
import ParticleVisualizer from '@/components/recording/ParticleVisualizer';
import AccentSelector from '@/components/recording/AccentSelector';
import ToxicitySelector from '@/components/recording/ToxicitySelector';
import MBTISelector from '@/components/result/MBTISelector';

type RecordingStep = 1 | 2 | 3;
type Phase = 'ready' | 'recording' | 'analyzing' | 'calibration' | 'mbti' | 'toxicity' | 'accent' | 'complete';

const SCRIPTS: Record<string, Record<RecordingStep, { ui: string, script: string, duration: number, context?: string, direction?: string, icon?: string }>> = {
    solo: {
        1: { ui: 'Calibrating Location Data...', script: 'I parked my car in the garage to drink a bottle of water. I am definitely not a robot.', duration: 10 },
        2: { ui: 'Testing Vocal Stress Levels...', script: 'Warning! System failure! Shut it down NOW!', duration: 8 },
        3: { ui: 'Analyzing Processing Speed...', script: 'Six systems synthesized sixty-six signals simultaneously.', duration: 8 },
    },
    elon: {
        1: {
            ui: 'Level 1: The Exploding Visionary',
            script: 'I think it is... [pause] ...very important that we... [stutter] ...become a multi-planetary species. Otherwise... consciousness as we know it... might just disappear.',
            duration: 12,
            context: 'You are on stage. Your [REDACTED] rocket just turned into $400 million worth of fireworks 4 seconds after launch. The shareholders of [CENSORED CORP] are screaming. Convince them this is actually a victory.',
            direction: 'Look at the horizon, not the audience. Stutter confidently. You are not making excuses; you are seeing a future on M***s.',
            icon: '💥'
        },
        2: {
            ui: 'Level 2: The Advertiser War',
            script: 'If somebody is going to try to blackmail me with advertising... blackmail me with money? ...Go. F**k. Yourself. ...Go. F**k. Yourself. Is that clear?',
            duration: 10,
            context: "You bought a certain 'Bird App' for $[REDACTED] Billion. Now, the CEO of [MOUSE COMPANY] is blackmailing you with money. You don't care about revenue. You care about sending a message.",
            direction: 'Dead eyes. No blinking. Do not shout; whisper the insult like it\'s a fact of nature. Treat the interviewer like a buggy line of code.',
            icon: '🖕'
        },
        3: {
            ui: 'Level 3: The 3AM Physicist',
            script: 'Well, I operate on the physics approach to analysis. You boil things down to the first principles or fundamental truths in a particular area and then you reason up from there.',
            duration: 12,
            context: 'It is 3:00 AM at the factory. Your lead engineer wants to go home to see his family. You want to explain why this [$5 SCREW] should cost $0.03 based on atomic weight.',
            direction: 'Speed up, then slow down. Mumble. You are not talking to a human; you are downloading the laws of the universe directly from the cloud.',
            icon: '🧪'
        },
    },
    spy: {
        1: { ui: 'Phase 1: Human Verification', script: 'I am a human', duration: 10, context: 'Prove you are not a logical construct.', direction: 'Maintain a flat, unbothered tone. Do not over-emote.', icon: '👤' },
        2: { ui: 'Phase 2: Abstract Logic', script: 'The cat is liquid', duration: 10, context: 'Testing cognitive flexibility and metaphor processing.', direction: 'Voice should be smooth, almost gliding. High stability required.', icon: '🐈' },
        3: { ui: 'Phase 3: Deep Cover', script: 'The earth is flat', duration: 10, context: 'Final loyalty and performance audit. Commitment to the narrative.', direction: 'Conviction is key. Any tremor in the voice will be flagged.', icon: '🌍' },
    }
}

export default function RecordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-cyan-500 font-mono animate-pulse">INITIATING SECURE SESSION...</div>}>
            <RecordPageContent />
        </Suspense>
    );
}

function RecordPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [phase, setPhase] = useState<Phase>('ready');
    const [step, setStep] = useState<RecordingStep>(1);

    // Safety check for mode and scripts
    const rawMode = searchParams.get('mode');
    const mode = (rawMode && SCRIPTS[rawMode]) ? rawMode : 'solo';
    const activeScripts = SCRIPTS[mode] || SCRIPTS.solo;

    const [timeLeft, setTimeLeft] = useState(() => activeScripts[1]?.duration || 10);
    const [error, setError] = useState<string | null>(null);
    const [selectedAccent, setSelectedAccent] = useState<string | null>(null);
    const [toxicity, setToxicity] = useState<ToxicityProfile | null>(null);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [researchConsentAgreed, setResearchConsentAgreed] = useState(false);
    const [isOver13, setIsOver13] = useState(false);
    const [gender, setGender] = useState<string>('non-binary');
    const [birthYear, setBirthYear] = useState<number>(new Date().getFullYear() - 25);
    const [mbti, setMbti] = useState<MBTIType | null>(null);
    const [spyOrigin, setSpyOrigin] = useState<string>('UNKNOWN');
    const [spyTarget, setSpyTarget] = useState<string>('MI6_LONDON');
    const [stepVectors, setStepVectors] = useState<Record<string, number[]>>({});

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
            setTimeLeft(activeScripts[1].duration);

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
                            if (analyzerRef.current) {
                                const vector = analyzerRef.current.get30DVector();
                                setStepVectors(prev => ({ ...prev, [currentStep]: vector }));
                                analyzerRef.current.reset();
                            }
                            const nextStep = (currentStep + 1) as RecordingStep;
                            setTimeLeft(activeScripts[nextStep].duration);
                            return nextStep;
                        } else {
                            // Recording complete
                            if (analyzerRef.current) {
                                const vector = analyzerRef.current.get30DVector();
                                setStepVectors(prev => ({ ...prev, [currentStep]: vector }));
                            }
                            finishRecording();
                            return currentStep;
                        }
                    });
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, [finishRecording, activeScripts]);

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

        if (analyzerRef.current) {
            const spyMd = mode === 'spy' ? { origin: spyOrigin, target: spyTarget } : null;
            const analysisResult = analyzerRef.current.analyze(mode, spyMd);

            let spyAnalysisResult = null;
            if (mode === 'spy') {
                const vector30 = analyzerRef.current.get30DVector();
                const metadata = {
                    ...spyMd,
                    browserLang: typeof navigator !== 'undefined' ? navigator.language : 'en',
                    timezone: typeof Intl !== 'undefined' ? Intl.DateTimeFormat().resolvedOptions().timeZone : 'UTC'
                };
                const jr = runJudgeEngine(vector30, metadata);
                spyAnalysisResult = {
                    score: jr.score,
                    reason: jr.reason,
                    isGhost: jr.isGhost,
                    stamp: jr.stamp
                };
            }

            const resultId = generateResultId();
            const sessionId = getSessionId();

            // Context Gathering
            const now = new Date();
            const osFamily = navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') ? 'iOS' :
                navigator.userAgent.includes('Android') ? 'Android' :
                    navigator.userAgent.includes('Windows') ? 'Windows' :
                        navigator.userAgent.includes('Mac') ? 'Mac' : 'Unknown';

            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

            const getTimeSlot = (): 'EARLY_MORNING' | 'DAYTIME' | 'EVENING' | 'LATE_NIGHT' => {
                const hour = now.getHours();
                if (hour >= 5 && hour < 10) return 'EARLY_MORNING';
                if (hour >= 10 && hour < 17) return 'DAYTIME';
                if (hour >= 17 && hour < 22) return 'EVENING';
                return 'LATE_NIGHT';
            };

            const getDayType = (): 'WEEKDAY' | 'WEEKEND' | 'HOLIDAY' => {
                const day = now.getDay();
                return (day === 0 || day === 6) ? 'WEEKEND' : 'WEEKDAY';
            };

            // Version 2.0 Enriched Log (Stream B - Asset Persistence)
            const logV2 = analyzerRef.current.getV2Log(analysisResult.metrics, {
                record_id: resultId,
                script_id: 'spell_global_v1',
                slot: getTimeSlot(),
                day_type: getDayType(),
                mbti: mbti || 'Unknown',
                age_range: String(Math.floor((new Date().getFullYear() - birthYear) / 10) * 10) + 's',
                gender: gender,
                isMobile,
                osFamily
            });

            const logV3 = analyzerRef.current.getV3Log(analysisResult.metrics, {
                record_id: resultId,
                script_id: 'spell_global_v1',
                slot: getTimeSlot(),
                day_type: getDayType(),
                mbti: mbti || 'Unknown',
                age_range: String(Math.floor((new Date().getFullYear() - birthYear) / 10) * 10) + 's',
                gender: gender,
                isMobile,
                osFamily,
                consent: {
                    terms: termsAccepted,
                    privacy: privacyAccepted,
                    research: researchConsentAgreed
                },
                isPaid: false,
                chronotype: 'unknown'
            });

            const audioBlob = chunksRef.current.length > 0
                ? new Blob(chunksRef.current, { type: 'audio/webm' })
                : undefined;

            const result: VoiceResult = {
                id: resultId,
                sessionId,
                typeCode: mode === 'elon' ? analysisResult.typeCode : mode === 'spy' ? analysisResult.typeCode : analysisResult.typeCode,
                spyMetadata: mode === 'spy' ? { origin: spyOrigin, target: spyTarget } : undefined,
                metrics: analysisResult.metrics,
                accentOrigin: accent,
                gender: gender,
                birthYear: birthYear,
                mbti: mbti || undefined,
                createdAt: now.toISOString(),
                locale: 'en',
                userAgent: navigator.userAgent,
                vaultEnabled: false,
                toxicityProfile: toxicity || undefined,
                consentAgreed: termsAccepted && privacyAccepted,
                researchConsentAgreed: researchConsentAgreed,
                consentVersion: '2.0.0',
                consentAt: now.toISOString(),
                logV2: logV2 as any,
                logV3: logV3 as any,
                spyAnalysis: spyAnalysisResult || undefined
            };

            await saveResult(result, audioBlob);

            // Universal Biometric Vaulting (GDPR Compliant)
            const vaultVectors = {
                step1: stepVectors[1] || [],
                step2: stepVectors[2] || [],
                step3: stepVectors[3] || []
            };
            const vaultContext = {
                mode,
                result: spyAnalysisResult?.stamp || result.typeCode,
                metadata: {
                    ...(mode === 'spy' ? { origin: spyOrigin, target: spyTarget } : {}),
                    selectedAccent: selectedAccent || 'unknown'
                },
                aiScore: analysisResult.metrics.humanityScore ? (100 - analysisResult.metrics.humanityScore) / 100 : 0.0
            };
            // Metrics mapping
            const vaultMetrics = {
                latency: 0,
                pitchVar: analysisResult.metrics.pitchVar || 0,
                hnr: analysisResult.metrics.hnr || 20,
                noiseFloor: 0.001
            };

            await secureVault(vaultVectors, vaultMetrics, vaultContext, researchConsentAgreed);

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

                        {mode === 'spy' && (
                            <div className="glass rounded-xl p-8 border-2 border-red-500/20 bg-white/5 max-w-xl mx-auto space-y-8 text-left">
                                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-red-500">Spy Audition Parameters</h3>
                                <div className="space-y-6">
                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-gray-400">YOUR ORIGIN (CURRENT SECTOR)</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['EAST_ASIA', 'NORTH_AMERICA', 'EUROPEAN_MIX', 'UNKNOWN'].map((o) => (
                                                <button
                                                    key={o}
                                                    onClick={() => setSpyOrigin(o)}
                                                    className={`p-3 rounded border text-[10px] font-black tracking-widest uppercase transition-all ${spyOrigin === o ? 'bg-red-500 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-black/40 border-gray-700 text-gray-500 hover:border-red-500/50'}`}
                                                >
                                                    {o.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-sm font-bold text-gray-400">TARGET ORGANIZATION (AUDITIONING FOR)</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {['MI6_LONDON', 'CIA_FBI_DC', 'KGB_FSB_RU', 'PUBLIC_SEC_JP'].map((t) => (
                                                <button
                                                    key={t}
                                                    onClick={() => setSpyTarget(t)}
                                                    className={`p-3 rounded border text-[10px] font-black tracking-widest uppercase transition-all ${spyTarget === t ? 'bg-red-500 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-black/40 border-gray-700 text-gray-500 hover:border-red-500/50'}`}
                                                >
                                                    {t.replace('_', ' ')}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-500/20 border border-red-500 rounded-xl p-6 text-red-400 text-base">
                                {error}
                            </div>
                        )}

                        <div className="glass rounded-xl p-8 border-2 border-cyan-500/20 bg-white/5 max-w-xl mx-auto space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-cyan-400">Security Clearance & Bio-Vault</h3>
                            <div className="space-y-4 text-left">
                                <label className="flex items-start gap-4 p-4 rounded-lg bg-black/40 hover:bg-black/60 transition-colors cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={termsAccepted}
                                        onChange={(e) => setTermsAccepted(e.target.checked)}
                                        className="mt-1 w-6 h-6 rounded border-gray-600 bg-black/50 cursor-pointer flex-shrink-0 accent-cyan-500"
                                    />
                                    <span className="text-sm text-gray-300 leading-relaxed select-none block font-bold transition-colors group-hover:text-white">
                                        I agree to the Terms of Service. (利用規約に同意)
                                    </span>
                                </label>

                                <label className="flex items-start gap-4 p-4 rounded-lg bg-black/40 hover:bg-black/60 transition-colors cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={privacyAccepted}
                                        onChange={(e) => setPrivacyAccepted(e.target.checked)}
                                        className="mt-1 w-6 h-6 rounded border-gray-600 bg-black/50 cursor-pointer flex-shrink-0 accent-cyan-500"
                                    />
                                    <span className="text-sm text-gray-300 leading-relaxed select-none block font-bold transition-colors group-hover:text-white">
                                        I agree to the Privacy Policy. (プライバシーポリシーに同意)
                                    </span>
                                </label>

                                <label className="flex items-start gap-4 p-4 rounded-lg bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors cursor-pointer group">
                                    <input
                                        type="checkbox"
                                        checked={researchConsentAgreed}
                                        onChange={(e) => setResearchConsentAgreed(e.target.checked)}
                                        className="mt-1 w-6 h-6 rounded border-gray-600 bg-black/50 cursor-pointer flex-shrink-0 accent-red-500"
                                    />
                                    <div className="space-y-1">
                                        <span className="text-sm text-red-500/90 leading-relaxed select-none block font-black transition-colors group-hover:text-red-400">
                                            [Optional] Allow use of anonymous voice vectors for AI safety research.
                                        </span>
                                        <span className="text-[11px] text-gray-500 block leading-normal">
                                            (匿名化された声の成分データを、AIセキュリティ向上のための研究・モデル開発に使用することを許可します。生音声は保存されません。)
                                        </span>
                                    </div>
                                </label>

                                <label className="flex items-start gap-4 p-4 rounded-lg bg-black/40 hover:bg-black/60 transition-colors cursor-pointer group opacity-60">
                                    <input
                                        type="checkbox"
                                        checked={isOver13}
                                        onChange={(e) => setIsOver13(e.target.checked)}
                                        className="mt-1 w-6 h-6 rounded border-gray-600 bg-black/50 cursor-pointer flex-shrink-0 accent-gray-500"
                                    />
                                    <span className="text-xs text-gray-400 leading-relaxed select-none block transition-colors group-hover:text-gray-300 font-medium">
                                        Confirm 13+ years of age (13歳以上であることを確認)
                                    </span>
                                </label>
                            </div>
                            <div className="text-[10px] text-gray-500 uppercase tracking-widest font-mono">
                                Read our <Link href="/privacy" className="text-cyan-500 hover:underline">Privacy Policy</Link> for details.
                            </div>
                        </div>

                        <button
                            onClick={startRecording}
                            disabled={!termsAccepted || !privacyAccepted || !isOver13}
                            className={`btn-metallic text-lg md:text-xl px-12 py-5 rounded-full font-bold transition-all hover:scale-105 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 min-w-[280px] ${mode === 'spy' ? 'border-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.2)] hover:shadow-[0_0_30px_rgba(239,68,68,0.4)]' : ''}`}
                        >
                            <span className="mr-3 text-2xl">{mode === 'spy' ? '🕵️‍♂️' : '🎤'}</span>
                            {mode === 'spy' ? 'INITIATE AUDITION' : 'START RECORDING'}
                        </button>

                        {(!termsAccepted || !privacyAccepted || !isOver13) && (
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
                            {activeScripts[step].ui}
                        </div>

                        {/* Visualizer */}
                        <div className="my-16">
                            <ParticleVisualizer
                                analyser={analyzerRef.current?.getAnalyser() || null}
                                isActive={phase === 'recording'}
                            />
                        </div>

                        {/* Script to read */}
                        <div className="space-y-6">
                            {(activeScripts[step] as any).context && (
                                <div className="bg-orange-500/10 border border-orange-500/20 rounded-xl p-4 text-left">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xl">{(activeScripts[step] as any).icon}</span>
                                        <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Mission Context</span>
                                    </div>
                                    <p className="text-xs text-gray-400 leading-relaxed italic">
                                        {(activeScripts[step] as any).context}
                                    </p>
                                </div>
                            )}

                            <div className="glass rounded-xl p-8 relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500" />
                                <p className="text-xl md:text-2xl font-medium leading-relaxed">
                                    "{activeScripts[step].script}"
                                </p>
                            </div>

                            {(activeScripts[step] as any).direction && (
                                <div className="text-left flex items-start gap-3 px-4">
                                    <span className="text-cyan-500 font-black text-xs mt-1">▶</span>
                                    <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wider leading-relaxed">
                                        <span className="text-cyan-400">Direction:</span> {(activeScripts[step] as any).direction}
                                    </p>
                                </div>
                            )}
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

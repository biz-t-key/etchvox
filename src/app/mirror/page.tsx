'use client';

import { useState, useRef, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { VoiceAnalyzer } from '@/lib/analyzer';
import { initializeAuth, loadUserHash } from '@/lib/authService';
import { getScenariosByGenre, getReadingText, getProgressLevel, getScenarioById, type Genre, type Mood, type Scenario, type Archetype, GENRE_THEMES } from '@/lib/mirrorContent';
import { saveVoiceLog, loadVoiceLogHistory } from '@/lib/mirrorEngine';
import { saveAudioBlob } from '@/lib/mirrorDb';
import { uploadMirrorBlob } from '@/lib/storage';
import { polishAudio } from '@/lib/audioPolisher';
import MirrorDashboard from '@/components/mirror/MirrorDashboard';
import StorySelector from '@/components/mirror/StorySelector';
import BackgroundLayer from '@/components/mirror/BackgroundLayer';
import { motion, AnimatePresence } from 'framer-motion';
import SubscriptionWall from '@/components/mirror/SubscriptionWall';
import { checkSubscription } from '@/lib/subscription';
import { isFirebaseConfigured, getDb } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import Link from 'next/link';

type Phase = 'auth' | 'calibration' | 'archetype' | 'genre' | 'scenario' | 'mood' | 'reading' | 'analyzing' | 'polishing' | 'result' | 'recap';

const CALIBRATION_TEXT = 'Hello, world.';
const GENRE_LOCK_DAYS = 7;

interface MirrorPreference {
    genre: Genre;
    scenarioId: string;
    timestamp: number;
}

import { MirrorProvider, useMirror, MirrorArchetype } from '@/context/MirrorContext';

function MirrorContent() {
    const { setMirror } = useMirror();
    const params = useSearchParams();
    const isDevMode = params.get('dev') === 'true';

    const [phase, setPhase] = useState<Phase>('auth');
    const [userHash, setUserHash] = useState<string | null>(null);
    const [mnemonic, setMnemonic] = useState<string | null>(null);
    const [isNewUser, setIsNewUser] = useState(false);
    const [showMnemonic, setShowMnemonic] = useState(false);

    // Genre & Scenario state
    const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
    const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
    const [lastPreferenceChange, setLastPreferenceChange] = useState<number | null>(null);
    const [canChangePreference, setCanChangePreference] = useState(true);

    // Mood & Reading state
    const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
    const [selectedArchetype, setSelectedArchetype] = useState<Archetype | null>(null);
    const [currentDayIndex, setCurrentDayIndex] = useState(1);
    const [readingText, setReadingText] = useState('');
    const [alreadyRecordedToday, setAlreadyRecordedToday] = useState(false);

    // Subscription state
    const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
    const [checkingSubscription, setCheckingSubscription] = useState(true);

    // Recording state
    const [timeLeft, setTimeLeft] = useState(5);
    const [calibrationVector, setCalibrationVector] = useState<number[] | null>(null);
    const [readingVector, setReadingVector] = useState<number[] | null>(null);
    const [progressLevel, setProgressLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
    const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
    const [legalAccepted, setLegalAccepted] = useState(false);
    const [researchAccepted, setResearchAccepted] = useState(false);
    const [analyserData, setAnalyserData] = useState<Uint8Array | null>(null);

    // Recorder refs
    const chunksRef = useRef<Blob[]>([]);

    const analyzerRef = useRef<VoiceAnalyzer | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioCtxRef = useRef<AudioContext | null>(null);
    const gainNodeRef = useRef<GainNode | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const lastSpeakingTimeRef = useRef<number>(0);

    useEffect(() => {
        checkAuth();
        loadMirrorPreference();
        calculateProgress();
    }, []);

    async function checkAuth() {
        try {
            const auth = await initializeAuth();
            setUserHash(auth.userHash);
            setMnemonic(auth.mnemonic);
            setIsNewUser(auth.isNew);
            setLegalAccepted(auth.isNew ? false : true); // Assume accepted if returning
            setResearchAccepted(auth.isNew ? false : true);

            // Check subscription status
            const subStatus = await checkSubscription(auth.userHash);
            setHasSubscription(isDevMode ? true : subStatus.isActive);
            setCheckingSubscription(false);

            if (auth.isNew) {
                setShowMnemonic(true);
            } else if (subStatus.isActive) {
                setPhase('calibration');
            }
        } catch (error) {
            console.error('Auth initialization failed:', error);
            setCheckingSubscription(false);
        }
    }

    // ✅ Real-time Subscription Listener for Mirror
    useEffect(() => {
        if (!isFirebaseConfigured() || !userHash) return;

        const db = getDb();
        const subRef = doc(db, 'subscriptions', userHash);

        const unsubscribe = onSnapshot(subRef, (snapshot) => {
            if (snapshot.exists()) {
                const subData = snapshot.data();
                const now = new Date();
                const expiresAt = subData.expiresAt?.toDate ? subData.expiresAt.toDate() : new Date(subData.expiresAt);
                const isActive = subData.status === 'active' && expiresAt > now;

                setHasSubscription(isActive);
                if (isActive && phase === 'auth') {
                    setPhase('calibration');
                }

                // Sync to localStorage
                localStorage.setItem('etchvox_subscription', JSON.stringify({
                    isActive,
                    expiresAt: expiresAt.toISOString(),
                    plan: subData.plan
                }));

                console.log(`[Mirror Sync] Subscription: ${isActive ? 'ACTIVE' : 'INACTIVE'}`);
            }
        }, (error) => {
            console.error('Firestore Mirror Sub listener error:', error);
        });

        return () => unsubscribe();
    }, [userHash, phase]);

    function loadMirrorPreference() {
        if (typeof window === 'undefined') return;

        try {
            const saved = localStorage.getItem('mirror_preference_v2');
            if (saved) {
                const data: MirrorPreference = JSON.parse(saved);
                const daysSinceChange = (Date.now() - data.timestamp) / (1000 * 60 * 60 * 24);

                if (daysSinceChange < GENRE_LOCK_DAYS) {
                    setSelectedGenre(data.genre);
                    const scenario = getScenarioById(data.scenarioId);
                    if (scenario) setSelectedScenario(scenario);

                    setLastPreferenceChange(data.timestamp);
                    setCanChangePreference(false);
                } else {
                    setCanChangePreference(true);
                }
            }
        } catch (e) {
            console.error('Failed to load mirror preference:', e);
        }
    }

    function calculateProgress() {
        const history = loadVoiceLogHistory();

        // Get unique calendar dates (YYYY-MM-DD)
        const uniqueDays = new Set(history.map(log =>
            new Date(log.timestamp).toISOString().split('T')[0]
        ));

        const level = getProgressLevel(uniqueDays.size);
        setProgressLevel(level);

        // Calculate current day in the 7-day cycle (1-indexed)
        const dayInCycle = (uniqueDays.size % 7) + 1;
        setCurrentDayIndex(dayInCycle);

        const today = new Date().toISOString().split('T')[0];
        setAlreadyRecordedToday(uniqueDays.has(today));
    }

    function saveMirrorPreference(genre: Genre, scenarioId: string) {
        if (typeof window === 'undefined') return;

        const data: MirrorPreference = {
            genre,
            scenarioId,
            timestamp: Date.now()
        };

        localStorage.setItem('mirror_preference_v2', JSON.stringify(data));
        setSelectedGenre(genre);
        const scenario = getScenarioById(scenarioId);
        if (scenario) setSelectedScenario(scenario);

        setLastPreferenceChange(data.timestamp);
        setCanChangePreference(false);
    }

    async function startRecording(isCalibration: boolean) {
        try {
            setPhase(isCalibration ? 'calibration' : 'reading');
            chunksRef.current = [];

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

            // Setup Audio Graph for Luxury Transitions
            const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
            audioCtxRef.current = new AudioContextClass();
            const source = audioCtxRef.current!.createMediaStreamSource(stream);
            gainNodeRef.current = audioCtxRef.current!.createGain();
            const destination = audioCtxRef.current!.createMediaStreamDestination();

            // Initial state: silent
            gainNodeRef.current.gain.setValueAtTime(0, audioCtxRef.current!.currentTime);
            // Start Fade: 0.5s ramp to 1.0
            gainNodeRef.current.gain.linearRampToValueAtTime(1.0, audioCtxRef.current!.currentTime + 0.5);

            source.connect(gainNodeRef.current);
            gainNodeRef.current.connect(destination);

            mediaRecorderRef.current = new MediaRecorder(destination.stream);
            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            mediaRecorderRef.current.start(100);

            // Start collecting samples
            const collectLoop = () => {
                if (analyzerRef.current) {
                    analyzerRef.current.collectSample();
                    const freqData = analyzerRef.current.getFrequencyData();
                    if (freqData) {
                        setAnalyserData(new Uint8Array(freqData));
                    }

                    // VAD End-point detection
                    const rms = analyzerRef.current.getLatestRMS();
                    if (rms > 0.01) { // Threshold for speech
                        lastSpeakingTimeRef.current = Date.now();
                    }
                }
                animationFrameRef.current = requestAnimationFrame(collectLoop);
            };
            collectLoop();

            // Start timer
            const duration = isCalibration ? 3 : 30; // 30s for reading
            setTimeLeft(duration);
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        finishRecording(isCalibration);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (err) {
            console.error('Microphone access denied:', err);
        }
    }

    async function finishRecording(isCalibration: boolean) {
        if (timerRef.current) {
            clearInterval(timerRef.current);
        }

        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }

        // Luxury Fade-out (1.0s)
        if (!isCalibration && gainNodeRef.current && audioCtxRef.current) {
            const now = audioCtxRef.current.currentTime;
            gainNodeRef.current.gain.cancelScheduledValues(now);
            gainNodeRef.current.gain.setValueAtTime(gainNodeRef.current.gain.value, now);
            gainNodeRef.current.gain.linearRampToValueAtTime(0, now + 1.0);

            // Wait for fade to complete before stopping recorder
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            // Ensure all tracks from original stream are stopped
            const tracks = mediaRecorderRef.current.stream.getTracks();
            tracks.forEach(track => track.stop());
        }

        if (audioCtxRef.current) {
            audioCtxRef.current.close().catch(console.error);
        }

        setPhase('analyzing');

        // Extract 30D vector
        setTimeout(async () => {
            if (analyzerRef.current) {
                const v = analyzerRef.current.get30DVector();

                if (isCalibration) {
                    setCalibrationVector(v);
                    setPhase('archetype');
                } else {
                    setReadingVector(v);
                    const rawBlob = new Blob(chunksRef.current, { type: 'audio/webm' });

                    // Stage 2: Polishing
                    setPhase('polishing');
                    try {
                        const polishedBlob = await polishAudio(rawBlob);
                        setCapturedBlob(polishedBlob);

                        if (userHash) {
                            await saveAudioBlob(`voice_blob_${userHash}_${currentDayIndex}`, polishedBlob);
                            uploadMirrorBlob(userHash, currentDayIndex, polishedBlob);
                        }
                    } catch (error) {
                        setCapturedBlob(rawBlob);
                        if (userHash) {
                            await saveAudioBlob(`voice_blob_${userHash}_${currentDayIndex}`, rawBlob);
                            uploadMirrorBlob(userHash, currentDayIndex, rawBlob);
                        }
                    }

                    // Magical 5 Seconds Analysis for Mirror
                    const recordingEndMs = Date.now();
                    const postReading = analyzerRef.current.classifyPostReading(
                        lastSpeakingTimeRef.current || (recordingEndMs - 30000),
                        recordingEndMs,
                        'mirror'
                    );

                    setPhase('result');
                    (window as any).__lastMirrorPostReading = postReading;
                }
            }
        }, 1500);
    }

    function handleGenreSelect(genre: Genre) {
        setSelectedGenre(genre);
        setPhase('scenario');
    }

    function handleScenarioSelect(scenario: Scenario) {
        if (selectedGenre) {
            saveMirrorPreference(selectedGenre, scenario.id);
            setPhase('mood');
        }
    }

    function handleArchetypeSelect(archetype: Archetype) {
        setSelectedArchetype(archetype);
        setMirror(archetype.toUpperCase() as MirrorArchetype);
        if (selectedGenre && selectedScenario && !canChangePreference) {
            setPhase('mood');
        } else {
            setPhase('genre');
        }
    }

    function handleMoodSelect(mood: Mood) {
        setSelectedMood(mood);

        if (selectedScenario) {
            const text = getReadingText(selectedScenario.id, currentDayIndex, mood);
            setReadingText(text);
        }

        if (analyzerRef.current) {
            analyzerRef.current.reset();
        }

        setTimeout(() => startRecording(false), 500);
    }

    function handleDone() {
        setPhase('calibration');
        setCalibrationVector(null);
        setReadingVector(null);
        setSelectedMood(null);
        setReadingText('');
        setCapturedBlob(null);

        if (analyzerRef.current) {
            analyzerRef.current.reset();
        }

        calculateProgress();
    }

    function renderContent() {
        if (checkingSubscription) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                        <p className="text-gray-400 text-sm">Checking subscription...</p>
                    </div>
                </div>
            );
        }

        if (!isDevMode && !checkingSubscription && hasSubscription === false && userHash) {
            return <SubscriptionWall userHash={userHash} setHasSubscription={setHasSubscription} />;
        }

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
                                        setPhase('calibration');
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

        if (phase === 'result' && calibrationVector && readingVector && selectedMood) {
            return (
                <MirrorDashboard
                    calibrationVector={calibrationVector}
                    readingVector={readingVector}
                    onClose={handleDone}
                    context={{
                        genre: selectedGenre || 'philosophy',
                        scenario: selectedScenario?.title || 'Unknown',
                        mood: selectedMood,
                        dayIndex: currentDayIndex,
                        progressLevel,
                        archetype: selectedArchetype || 'optimizer',
                        readingText,
                        sampleRate: 48000
                    }}
                    userHash={userHash || ''}
                    wellnessConsentAgreed={researchAccepted}
                    postReadingInsight={(window as any).__lastMirrorPostReading}
                />
            );
        }

        if (phase === 'polishing') {
            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <div className="relative w-24 h-24 mx-auto">
                            <div className="absolute inset-0 border-4 border-cyan-500/20 rounded-full" />
                            <div className="absolute inset-0 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-2">Refining Resonance...</h2>
                            <p className="text-cyan-400 font-mono text-xs animate-pulse uppercase tracking-widest">Applying Neural Filters • High-Pass • EQ • Comp</p>
                        </div>
                    </div>
                </div>
            );
        }

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

        if (phase === 'calibration' || phase === 'reading') {
            const isCalibration = phase === 'calibration';
            const displayText = isCalibration ? 'Establish your vocal baseline. Speak clearly into the void.' : readingText;
            const theme = isCalibration
                ? { color: 'text-zinc-400', font: "'Inter', sans-serif", tracking: 'tracking-normal', archetype: 'OPTIMIZER' }
                : (selectedGenre ? GENRE_THEMES[selectedGenre] : GENRE_THEMES.philosophy);

            // Calculate simple amplitude for reactive pulse
            const amplitude = analyserData ? Array.from(analyserData).reduce((a, b) => a + b, 0) / analyserData.length : 0;
            const pulseScale = 1 + (amplitude / 255) * 0.2;

            return (
                <div className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden bg-black">
                    {/* Atmospheric Background */}
                    <BackgroundLayer
                        readingVector={[0.5, 0.5, 0.5, 0.5, 0.5]}
                        showInsight={true}
                        themeOverride={theme.archetype}
                    />

                    <div className="relative z-20 max-w-4xl w-full flex flex-col items-center justify-center space-y-16">
                        <header className="text-center space-y-2 opacity-50">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex items-center justify-center gap-3"
                            >
                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60 font-mono">
                                    {isCalibration ? 'Identity Synchronization' : 'Resonance Reading'}
                                </h2>
                            </motion.div>
                            {!isCalibration && selectedScenario && (
                                <p className="text-[9px] uppercase tracking-widest text-cyan-400/80 font-mono">
                                    Direction: {selectedScenario.tone_instruction}
                                </p>
                            )}
                        </header>

                        <div className="relative w-full text-center py-12">
                            <motion.div
                                animate={{ scale: pulseScale }}
                                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none"
                            >
                                <div className="w-[120%] h-64 bg-white/20 blur-[100px] rounded-full" />
                            </motion.div>

                            <motion.p
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`text-3xl md:text-5xl lg:text-6xl text-white leading-[1.3] font-medium selection:bg-white/20`}
                                style={{
                                    fontFamily: theme.font,
                                    letterSpacing: theme.tracking === 'tracking-widest' ? '0.1em' : 'normal'
                                }}
                            >
                                {displayText}
                            </motion.p>
                        </div>

                        <div className="flex flex-col items-center space-y-8">
                            <div className="relative w-24 h-24 flex items-center justify-center">
                                <svg className="absolute inset-0 w-full h-full -rotate-90">
                                    <circle
                                        cx="48" cy="48" r="44"
                                        stroke="currentColor" strokeWidth="2"
                                        fill="transparent"
                                        className="text-white/10"
                                    />
                                    <motion.circle
                                        cx="48" cy="48" r="44"
                                        stroke="currentColor" strokeWidth="2"
                                        fill="transparent"
                                        strokeDasharray="276"
                                        animate={{ strokeDashoffset: 276 * (1 - timeLeft / (isCalibration ? 6 : 15)) }}
                                        className="text-white"
                                    />
                                </svg>
                                <span className="text-2xl font-light font-mono text-white/40">{timeLeft}</span>
                            </div>

                            {!isCalibration && (
                                <motion.button
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    onClick={() => finishRecording(false)}
                                    className="group flex flex-col items-center gap-3"
                                >
                                    <span className="px-8 py-4 bg-white/5 backdrop-blur-md border border-white/10 text-white text-[10px] font-black uppercase tracking-[0.5em] rounded-full hover:bg-white/10 hover:border-white/30 transition-all active:scale-95">
                                        End Reading
                                    </span>
                                    <span className="text-[8px] text-white/20 uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity">
                                        Analyze Arc →
                                    </span>
                                </motion.button>
                            )}
                        </div>
                    </div>
                </div>
            );
        }

        if (phase === 'archetype') {
            const archetypes: { id: Archetype; name: string; icon: string; lens: string; desc: string; bg: string; colors: string }[] = [
                { id: 'optimizer', name: 'The Optimizer', icon: '⚡', lens: 'Efficiency', desc: 'Maximizing resonance and cognitive output.', bg: '/images/bg_optimizer.png', colors: 'from-cyan-500/20 to-blue-500/20' },
                { id: 'stoic', name: 'The Stoic', icon: '🏛️', lens: 'Equilibrium', desc: 'Finding stillness amidst external turbulence.', bg: '/images/bg_stoic.jpg', colors: 'from-slate-500/20 to-zinc-500/20' },
                { id: 'alchemist', name: 'The Alchemist', icon: '🧪', lens: 'Flow', desc: 'Transmuting raw emotion into creative heat.', bg: '/images/bg_alchemist.png', colors: 'from-amber-500/20 to-orange-500/20' },
                { id: 'maverick', name: 'The Maverick', icon: '🔥', lens: 'Ambition', desc: 'Hard-won truth and power in the high-stakes void.', bg: '/images/bg_cinematic_grit.png', colors: 'from-orange-500/20 to-red-600/20' },
                { id: 'sanctuary', name: 'The Sanctuary', icon: '🌿', lens: 'Restoration', desc: 'Compassionate stillness and sacred fragility.', bg: '/images/bg_sanctuary.png', colors: 'from-emerald-500/20 to-teal-600/20' }
            ];

            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-6 py-12">
                    <div className="max-w-5xl w-full space-y-12">
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase tracking-tighter">
                                Select Your Mirror Lens
                            </h1>
                            <p className="text-gray-400 text-sm max-w-lg mx-auto leading-relaxed">
                                How should the Oracle interpret your voice today?
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {archetypes.map((arch) => (
                                <button
                                    key={arch.id}
                                    onClick={() => handleArchetypeSelect(arch.id)}
                                    className={`group relative h-[450px] bg-slate-900/40 border border-white/10 rounded-3xl p-8 transition-all overflow-hidden text-left flex flex-col justify-end ${arch.colors}`}
                                >
                                    <div className="absolute inset-0 z-0 opacity-40 group-hover:opacity-70 transition-opacity duration-500">
                                        <img src={arch.bg} alt="" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                                    </div>

                                    <div className="relative z-10 space-y-4">
                                        <div className="text-5xl drop-shadow-2xl">{arch.icon}</div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white mb-1">{arch.name}</h3>
                                            <div className="inline-block px-2 py-0.5 bg-white/10 rounded text-[9px] font-black uppercase tracking-widest text-white/70 border border-white/5 mb-3">
                                                {arch.lens}
                                            </div>
                                        </div>
                                        <div className="pt-4 border-t border-white/10">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-cyan-500 group-hover:translate-x-1 transition-transform inline-block">
                                                Select Archetype →
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="text-center">
                            <button onClick={() => setPhase('calibration')} className="text-gray-500 hover:text-white text-[10px] font-black uppercase tracking-[0.3em] transition">
                                ← Back to Calibration
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        if (phase === 'genre') {
            const genres: { id: Genre; name: string; icon: string; desc: string }[] = [
                { id: 'philosophy', name: 'Philosophy', icon: '🏛️', desc: 'Stoic wisdom and resilience' },
                { id: 'thriller', name: 'Thriller', icon: '🌊', desc: 'Survival and tension' },
                { id: 'poetic', name: 'Poetic', icon: '🌙', desc: 'Ethereal and introspective' },
                { id: 'maverick', name: 'The Maverick', icon: '🥃', desc: 'Hard-won truth and stillness' }
            ];

            return (
                <StorySelector
                    phase="genre"
                    genres={genres}
                    onGenreSelect={handleGenreSelect}
                    onScenarioSelect={() => { }}
                    onBack={() => setPhase('archetype')}
                />
            );
        }

        if (phase === 'scenario' && selectedGenre) {
            const scenarios = getScenariosByGenre(selectedGenre);

            return (
                <StorySelector
                    phase="scenario"
                    genres={[]}
                    scenarios={scenarios}
                    onGenreSelect={() => { }}
                    onScenarioSelect={handleScenarioSelect}
                    onBack={() => setPhase('genre')}
                />
            );
        }

        if (phase === 'mood') {
            const moods: { id: Mood; name: string; icon: string; desc: string }[] = [
                { id: 'high', name: 'High Energy', icon: '⚡', desc: 'Intense, provocative' },
                { id: 'mid', name: 'Balanced', icon: '⚖️', desc: 'Measured, steady' },
                { id: 'low', name: 'Reflective', icon: '🌊', desc: 'Somber, contemplative' }
            ];

            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-6">
                    <div className="max-w-2xl w-full space-y-12">
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                                How Are You Feeling?
                            </h1>
                            <p className="text-cyan-400 text-sm font-mono">Day {currentDayIndex}/7</p>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {moods.map((mood) => (
                                <button
                                    key={mood.id}
                                    onClick={() => handleMoodSelect(mood.id)}
                                    className="group relative bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 rounded-2xl p-6 transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] flex items-center gap-6"
                                >
                                    <div className="text-4xl">{mood.icon}</div>
                                    <div className="flex-1 text-left">
                                        <h3 className="text-xl font-bold text-white">{mood.name}</h3>
                                        <p className="text-gray-400 text-sm">{mood.desc}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            );
        }

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-6">
                <div className="max-w-md w-full space-y-8 bg-white/5 backdrop-blur-sm p-10 rounded-2xl border border-white/10 text-center">
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black text-white uppercase tracking-widest">Mirror</h1>
                        <div className="flex items-center justify-center gap-2">
                            <div className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/50 rounded text-cyan-400 text-[10px] font-black uppercase tracking-widest">
                                {progressLevel.toUpperCase()} LEVEL
                            </div>
                            <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/50 rounded text-blue-400 text-[10px] font-black uppercase tracking-widest">
                                DAY {currentDayIndex}/7
                            </div>
                        </div>
                        <p className="text-gray-400 text-sm leading-relaxed">
                            Authorized recording session for AI resonance training and tactical biometric feedback.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <button
                            onClick={() => startRecording(true)}
                            disabled={!legalAccepted || (alreadyRecordedToday && !isDevMode)}
                            className="w-full py-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xl font-black uppercase tracking-widest rounded-3xl hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed transform active:scale-95"
                        >
                            <span className="mr-3">🎤</span>
                            {(alreadyRecordedToday && !isDevMode) ? 'Session Locked' : 'INITIATE CALIBRATION'}
                        </button>

                        <div className="text-center">
                            <Link href="/" className="text-gray-500 hover:text-white text-[10px] uppercase tracking-[0.3em] font-black transition-all">
                                ← RETURN TO SYSTEM HOME
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative">
            {renderContent()}

            {/* DEV TOOLS PANEL - Rendered outside the main switch/content logic to ensure visibility */}
            {isDevMode && (
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/95 border-t border-red-500/50 z-[9999] flex flex-wrap items-center justify-center gap-4">
                    <div className="text-[10px] font-black text-red-500 uppercase tracking-widest mr-4">Dev Mode Active</div>

                    <button
                        onClick={() => {
                            setAlreadyRecordedToday(false);
                            alert("Unlocked.");
                        }}
                        className="px-4 py-2 bg-red-500/20 border border-red-500/50 text-red-500 text-[10px] font-bold rounded uppercase hover:bg-red-500/40"
                    >
                        Unlock Today
                    </button>

                    <button
                        onClick={async () => {
                            if (!userHash) return alert("Wait for auth...");
                            const now = Date.now();
                            const historyKey = 'etchvox_voice_mirror_history';
                            const mockHistory = [];

                            for (let i = 0; i < 7; i++) {
                                const timestamp = new Date(now - (7 - i) * 24 * 60 * 60 * 1000);
                                mockHistory.push({
                                    timestamp: timestamp.toISOString(),
                                    calibrationVector: Array.from({ length: 30 }, () => Math.random()),
                                    readingVector: Array.from({ length: 30 }, () => Math.random()),
                                    context: {
                                        timeCategory: 'Morning',
                                        dayCategory: 'Weekday',
                                        genre: selectedGenre || 'maverick',
                                        dayIndex: i + 1
                                    },
                                    annotationTag: 'Mock Data'
                                });
                                await saveAudioBlob(`voice_blob_${userHash}_${i + 1}`, new Blob(['mock'], { type: 'audio/wav' }));
                            }
                            localStorage.setItem(historyKey, JSON.stringify(mockHistory));
                            alert("History injected. Reloading...");
                            window.location.reload();
                        }}
                        className="px-4 py-2 bg-blue-500/20 border border-blue-500/50 text-blue-400 text-[10px] font-bold rounded uppercase hover:bg-blue-500/40"
                    >
                        Mock 7-Day History
                    </button>

                    <button
                        onClick={() => {
                            localStorage.removeItem('etchvox_voice_mirror_history');
                            localStorage.removeItem('mirror_preference_v2');
                            alert("Cleared.");
                            window.location.reload();
                        }}
                        className="px-4 py-2 bg-gray-500/20 border border-gray-500/50 text-gray-400 text-[10px] font-bold rounded uppercase hover:bg-gray-500/40"
                    >
                        Reset
                    </button>
                    <div className="text-[8px] text-gray-600 font-mono">Phase: {phase}</div>
                </div>
            )}
        </div>
    );
}

export default function MirrorPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-cyan-500 font-black tracking-widest animate-pulse">SYSTEM INITIALIZING...</div>}>
            <MirrorProvider>
                <MirrorContent />
            </MirrorProvider>
        </Suspense>
    );
}

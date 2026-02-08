'use client';

import { useState, useRef, useEffect } from 'react';
import { VoiceAnalyzer } from '@/lib/analyzer';
import { initializeAuth, loadUserHash } from '@/lib/authService';
import { getScenariosByGenre, getReadingText, getProgressLevel, getScenarioById, type Genre, type Mood, type Scenario, type Archetype } from '@/lib/mirrorContent';
import { saveVoiceLog, loadVoiceLogHistory } from '@/lib/mirrorEngine';
import { saveAudioBlob } from '@/lib/mirrorDb';
import { uploadMirrorBlob } from '@/lib/storage';
import { polishAudio } from '@/lib/audioPolisher';
import MirrorDashboard from '@/components/mirror/MirrorDashboard';
import SubscriptionWall from '@/components/mirror/SubscriptionWall';
import { checkSubscription } from '@/lib/subscription';
import Link from 'next/link';

type Phase = 'auth' | 'calibration' | 'archetype' | 'genre' | 'scenario' | 'mood' | 'reading' | 'analyzing' | 'polishing' | 'result' | 'recap';

const CALIBRATION_TEXT = 'Hello, world.';
const GENRE_LOCK_DAYS = 7;

interface MirrorPreference {
    genre: Genre;
    scenarioId: string;
    timestamp: number;
}

export default function MirrorPage() {
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

    // Subscription state
    const [hasSubscription, setHasSubscription] = useState<boolean | null>(null);
    const [checkingSubscription, setCheckingSubscription] = useState(true);

    // Recording state
    const [timeLeft, setTimeLeft] = useState(5);
    const [calibrationVector, setCalibrationVector] = useState<number[] | null>(null);
    const [readingVector, setReadingVector] = useState<number[] | null>(null);
    const [progressLevel, setProgressLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
    const [capturedBlob, setCapturedBlob] = useState<Blob | null>(null);
    const [wellnessAccepted, setWellnessAccepted] = useState(false);

    // Recorder refs
    const chunksRef = useRef<Blob[]>([]);

    const analyzerRef = useRef<VoiceAnalyzer | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

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
            setWellnessAccepted(auth.isNew ? false : true); // Assume accepted if returning

            // Check subscription status
            const subStatus = await checkSubscription(auth.userHash);
            setHasSubscription(subStatus.isActive);
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
        const level = getProgressLevel(history.length);
        setProgressLevel(level);

        // Calculate current day in the 7-day cycle
        const completedDays = history.length % 7;
        setCurrentDayIndex(completedDays + 1);
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

            mediaRecorderRef.current = new MediaRecorder(stream);
            mediaRecorderRef.current.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };
            mediaRecorderRef.current.start(100);

            // Start collecting samples
            const collectLoop = () => {
                if (analyzerRef.current) {
                    analyzerRef.current.collectSample();
                }
                animationFrameRef.current = requestAnimationFrame(collectLoop);
            };
            collectLoop();

            // Start timer
            const duration = isCalibration ? 3 : 6;
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

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
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

                    // Stage 1: Analyzing (UI state already set above)
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

                    setPhase('result');
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

        // Reset analyzer for main reading
        if (analyzerRef.current) {
            analyzerRef.current.reset();
        }

        setTimeout(() => startRecording(false), 500);
    }

    function handleDone() {
        if (currentDayIndex >= 7) {
            setPhase('result'); // To check if we should show recap?
            // Actually, let's just reset but we need a way to trigger recap
            // Let's add a 'recap' state to result view
        }

        setPhase('calibration');
        setCalibrationVector(null);
        setReadingVector(null);
        setSelectedMood(null);
        setReadingText('');
        setCapturedBlob(null);

        // Reset analyzer
        if (analyzerRef.current) {
            analyzerRef.current.reset();
        }

        // Recalculate progress
        calculateProgress();
    }

    // Checking subscription
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

    // Show subscription wall if not subscribed
    if (!checkingSubscription && hasSubscription === false && userHash) {
        return <SubscriptionWall userHash={userHash} />;
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
                                    Take a screenshot or write it down.
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

    // Result phase
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
                wellnessConsentAgreed={wellnessAccepted}
            />
        );
    }

    // Polishing phase
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

    // Recording phases (calibration or reading)
    if (phase === 'calibration' || phase === 'reading') {
        const isCalibration = phase === 'calibration';
        const displayText = isCalibration ? CALIBRATION_TEXT : readingText;

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-6">
                <div className="max-w-2xl w-full text-center space-y-12">
                    <div className="space-y-4">
                        <h2 className="text-sm font-black uppercase tracking-widest text-cyan-400">
                            {isCalibration ? '🎯 Calibration' : `📖 Day ${currentDayIndex} Reading`}
                        </h2>
                        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 space-y-4">
                            {!isCalibration && selectedScenario && (
                                <div className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] pb-4 border-b border-white/5">
                                    Direction: {selectedScenario.tone_instruction}
                                </div>
                            )}
                            <p className="text-2xl text-white leading-relaxed font-serif pt-2">
                                {displayText}
                            </p>
                        </div>
                    </div>

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

    // Archetype selection phase
    if (phase === 'archetype') {
        const archetypes: { id: Archetype; name: string; icon: string; desc: string; colors: string }[] = [
            { id: 'optimizer', name: 'The Optimizer', icon: '⚡', desc: 'Efficiency and High-Output. Reframes drift as system latency.', colors: 'hover:border-cyan-500/50 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]' },
            { id: 'stoic', name: 'The Stoic', icon: '🏛️', desc: 'Equilibrium and Stillness. Reframes drift as external turbulence.', colors: 'hover:border-slate-500/50 hover:shadow-[0_0_30px_rgba(100,116,139,0.3)]' },
            { id: 'alchemist', name: 'The Alchemist', icon: '🔮', desc: 'Creative Energy and Flow. Reframes drift as primal resonance.', colors: 'hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)]' }
        ];

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-6">
                <div className="max-w-3xl w-full space-y-12">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            Choose Your Mirror Archetype
                        </h1>
                        <p className="text-gray-400">How should the Oracle interpret your vocal signature today?</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {archetypes.map((arch) => (
                            <button
                                key={arch.id}
                                onClick={() => handleArchetypeSelect(arch.id)}
                                className={`group relative bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 rounded-2xl p-8 transition-all ${arch.colors}`}
                            >
                                <div className="text-6xl mb-4 grayscale group-hover:grayscale-0 transition-all">{arch.icon}</div>
                                <h3 className="text-xl font-bold text-white mb-2">{arch.name}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{arch.desc}</p>
                            </button>
                        ))}
                    </div>

                    <div className="text-center">
                        <button onClick={() => setPhase('calibration')} className="text-gray-500 hover:text-gray-300 text-sm transition">
                            ← Back to Calibration
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Genre selection phase
    if (phase === 'genre') {
        const genres: { id: Genre; name: string; icon: string; desc: string }[] = [
            { id: 'philosophy', name: 'Philosophy', icon: '🏛️', desc: 'Stoic wisdom and resilience' },
            { id: 'thriller', name: 'Thriller', icon: '🌊', desc: 'Survival and tension' },
            { id: 'poetic', name: 'Poetic', icon: '🌙', desc: 'Ethereal and introspective' },
            { id: 'cinematic_grit', name: 'Cinematic Grit', icon: '🥃', desc: 'Hard-won truth and stillness' }
        ];

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-6">
                <div className="max-w-4xl w-full space-y-12">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            Select Your Reading Genre
                        </h1>
                        <p className="text-gray-400">This choice will be locked for 7 days</p>
                        {progressLevel && (
                            <p className="text-cyan-400 text-sm font-mono">Progress Level: {progressLevel.toUpperCase()}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {genres.map((genre) => (
                            <button
                                key={genre.id}
                                onClick={() => handleGenreSelect(genre.id)}
                                className="group relative bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 rounded-2xl p-8 transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] text-left flex items-start gap-6"
                            >
                                <div className="text-5xl">{genre.icon}</div>
                                <div>
                                    <h3 className="text-xl font-bold text-white mb-2">{genre.name}</h3>
                                    <p className="text-gray-400 text-sm leading-relaxed">{genre.desc}</p>
                                </div>
                            </button>
                        ))}
                    </div>

                    <div className="text-center">
                        <Link href="/" className="text-gray-500 hover:text-gray-300 text-sm transition">
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Scenario selection phase
    if (phase === 'scenario' && selectedGenre) {
        const scenarios = getScenariosByGenre(selectedGenre);

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-6">
                <div className="max-w-4xl w-full space-y-12">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                            Select Your Story
                        </h1>
                        <p className="text-gray-400">Choose the narrative path for your 7-day resonance cycle</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {scenarios.map((scenario) => (
                            <button
                                key={scenario.id}
                                onClick={() => handleScenarioSelect(scenario)}
                                className="group relative bg-white/5 backdrop-blur-sm hover:bg-white/10 border border-white/10 hover:border-cyan-500/50 rounded-2xl p-8 transition-all hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] text-left flex flex-col gap-4"
                            >
                                <div className="text-xs font-black uppercase tracking-widest text-cyan-500/70">{scenario.tone_instruction}</div>
                                <h3 className="text-xl font-bold text-white mb-2">{scenario.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed flex-1">{scenario.description}</p>
                                <div className="mt-4 text-cyan-400 text-xs font-bold uppercase tracking-wider group-hover:translate-x-1 transition-transform">Select Story →</div>
                            </button>
                        ))}
                    </div>

                    <div className="text-center">
                        <button onClick={() => setPhase('genre')} className="text-gray-500 hover:text-gray-300 text-sm transition">
                            ← Back to Genres
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Mood selection phase
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
                        <p className="text-gray-400">Select your current energy level</p>
                        <p className="text-cyan-400 text-sm font-mono">Day {currentDayIndex}/7 • {selectedScenario?.title}</p>
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

    // Check if recording already done today
    const history = loadVoiceLogHistory();
    const today = new Date().toDateString();
    const alreadyRecordedToday = history.some(log => new Date(log.timestamp).toDateString() === today);

    const renderOnboarding = () => (
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 space-y-10 text-left">
            <div className="space-y-4 text-center">
                <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase tracking-tight">
                    Active Mindfulness through Voice
                </h2>
                <p className="text-gray-400 text-sm italic max-w-md mx-auto leading-relaxed">
                    A meditative 7-day journey to attune your mind and body. Experience Active Mindfulness through the power of narrative resonance.
                </p>
            </div>

            <div className="space-y-8">
                <div className="flex items-start gap-5">
                    <div className="text-cyan-400 font-black text-xs pt-1 tracking-tighter shrink-0">01 / FEEL</div>
                    <div className="space-y-1">
                        <p className="text-white font-bold uppercase tracking-wider text-sm">Attune to the Narrative</p>
                        <p className="text-gray-400 text-xs leading-relaxed">Immerse yourself in curated scenarios. Ground your emotions and connect deeply with the present moment.</p>
                    </div>
                </div>

                <div className="flex items-start gap-5">
                    <div className="text-cyan-400 font-black text-xs pt-1 tracking-tighter shrink-0">02 / ETCH</div>
                    <div className="space-y-1">
                        <p className="text-white font-bold uppercase tracking-wider text-sm">Inscribe Your Pulse</p>
                        <p className="text-gray-400 text-xs leading-relaxed">Every subtle nuance and tremor in your voice is captured as a high-fidelity biometric record of your inner state.</p>
                    </div>
                </div>

                <div className="flex items-start gap-5">
                    <div className="text-cyan-400 font-black text-xs pt-1 tracking-tighter shrink-0">03 / REFLECT</div>
                    <div className="space-y-1">
                        <p className="text-white font-bold uppercase tracking-wider text-sm">Witness Your Evolution</p>
                        <p className="text-gray-400 text-xs leading-relaxed">At the end of your 7-day cycle, receive a cinematic compilation that mirrors your emotional trajectory with total clarity.</p>
                    </div>
                </div>

                {alreadyRecordedToday && (
                    <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-2xl p-6 text-center space-y-2">
                        <p className="text-cyan-400 text-[10px] font-black uppercase tracking-[0.3em] leading-none">
                            ✨ Daily Pulse Secured
                        </p>
                        <p className="text-gray-400 text-[10px] leading-relaxed opacity-70 italic">
                            Biometric patterns cached. Return in 24 hours to proceed.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );

    // Calibration ready phase (default view)
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-6 py-12">
            <div className="max-w-2xl w-full space-y-12">
                <div className="text-center space-y-4">
                    <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500 uppercase tracking-tighter">
                        Voice Mirror
                    </h1>
                    <div className="inline-block px-4 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] font-mono font-bold tracking-[0.2em] uppercase">
                        STATUS: {progressLevel}
                    </div>
                </div>

                {renderOnboarding()}

                {!alreadyRecordedToday && (
                    <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                        <label className="flex items-start gap-4 cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={wellnessAccepted}
                                onChange={(e) => setWellnessAccepted(e.target.checked)}
                                className="mt-1 w-6 h-6 rounded border-gray-600 bg-black/50 cursor-pointer flex-shrink-0 accent-cyan-500"
                            />
                            <div className="space-y-1 text-left">
                                <span className="text-xs text-gray-400 leading-relaxed select-none block font-bold transition-colors group-hover:text-white uppercase tracking-wider">
                                    I consent to the anonymous processing of my acoustic features for wellness analysis. I understand this is not a medical diagnosis.
                                </span>
                            </div>
                        </label>
                    </div>
                )}

                <button
                    onClick={() => startRecording(true)}
                    disabled={!wellnessAccepted || alreadyRecordedToday}
                    className="w-full py-6 bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-xl font-black uppercase tracking-widest rounded-3xl hover:shadow-[0_0_40px_rgba(34,211,238,0.4)] transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed transform active:scale-95"
                >
                    <span className="mr-3">🎤</span>
                    {alreadyRecordedToday ? 'Session Locked' : 'INITIATE CALIBRATION'}
                </button>

                <div className="text-center">
                    <Link href="/" className="text-gray-500 hover:text-white text-[10px] uppercase tracking-[0.3em] font-black transition-all">
                        ← RETURN TO SYSTEM HOME
                    </Link>
                </div>
            </div>
        </div>
    );
}

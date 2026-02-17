'use client';

import { useState, useEffect } from 'react';
import { calculateZScores, getTimeCategory, getDayCategory, saveVoiceLog, loadVoiceLogHistory, clearVoiceLogHistory } from '@/lib/mirrorEngine';
import { getAllAudioBlobs } from '@/lib/mirrorDb';
import type { ZScoreResult, AnomalyAlert } from '@/lib/mirrorEngine';
import { generateContent } from '@/lib/gemini';
import { MIRROR_ORACLE_SYSTEM_PROMPT } from '@/lib/mirrorPrompt';
import { saveMirrorLog, getMirrorLogs, deleteMirrorLogs } from '@/lib/storage';
import MirrorRecap from './MirrorRecap';
import AcousticNebula from '../result/AcousticNebula';
import { motion, AnimatePresence } from 'framer-motion';
import { useMirror } from '@/context/MirrorContext';
import IdentityKitExporter from './IdentityKitExporter';
import BackgroundLayer from './BackgroundLayer';

interface MirrorDashboardProps {
    calibrationVector: number[];
    readingVector: number[];
    onClose: () => void;
    context?: {
        genre: string;
        scenario: string;
        mood: string;
        dayIndex: number;
        progressLevel: string;
        archetype: string;
        readingText: string;
        sampleRate?: number;
    };
    userHash: string;
    wellnessConsentAgreed: boolean;
    postReadingInsight?: import('@/lib/types').PostReadingInsight;
}

interface OracleResponse {
    mirror_analysis: {
        headline: string;
        scientific_observation: string;
        alignment_score: number;
    };
    oracle_prediction: {
        forecast: string;
        alert_level: 'Optimal' | 'Caution' | 'Critical';
    };
    actionable_guidance: string;
    suggested_tags: string[];
}

const Sparkline = ({ data, color }: { data: number[], color: string }) => {
    const points = data.map((v, i) => `${(i * 100) / (data.length - 1)},${100 - v * 100}`).join(' ');
    return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
            <polyline fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" points={points} opacity="0.8" />
        </svg>
    );
};

export default function MirrorDashboard({
    calibrationVector,
    readingVector,
    onClose,
    context,
    userHash,
    wellnessConsentAgreed,
    postReadingInsight
}: MirrorDashboardProps) {
    const [zScoreResult, setZScoreResult] = useState<ZScoreResult | null>(null);
    const [oracleResponse, setOracleResponse] = useState<OracleResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);
    const [showRecap, setShowRecap] = useState(false);
    const [savedDaysCount, setSavedDaysCount] = useState(0);
    const [showInsight, setShowInsight] = useState(false);
    const { config, type } = useMirror();

    useEffect(() => {
        analyzeVoice();
    }, [calibrationVector, readingVector]);

    const handleVaultReset = async () => {
        if (!confirm("DANGER: This will permanently delete your biometric baseline, all 30D vectors, and history from our secure cloud. This cannot be undone. Proceed?")) return;

        setIsLoading(true);
        try {
            // 1. Clear Local Storage
            clearVoiceLogHistory();

            // 2. Clear Cloud (Firestore)
            await deleteMirrorLogs(userHash);

            // 3. Final PURGE redirection
            alert("Vault Purged. Returning to start.");
            window.location.reload();
        } catch (error) {
            console.error("Vault reset failed:", error);
            alert("Reset failed. Please try again.");
            setIsLoading(false);
        }
    };

    async function analyzeVoice() {
        setIsLoading(true);

        // Fetch saved blobs count
        if (userHash) {
            const blobs = await getAllAudioBlobs(userHash);
            setSavedDaysCount(blobs.length);
        }

        // Load history (merge local and remote for cross-device consistency)
        let localHistory = loadVoiceLogHistory();
        let history = localHistory;

        if (userHash) {
            const remoteHistory = await getMirrorLogs(userHash);
            if (remoteHistory.length > 0) {
                // Merge mission: Use timestamp as the unique fingerprint
                const merged = [...localHistory];
                remoteHistory.forEach(remoteLog => {
                    const exists = localHistory.some(localLog =>
                        new Date(localLog.timestamp).getTime() === new Date(remoteLog.timestamp).getTime()
                    );
                    if (!exists) merged.push(remoteLog);
                });
                merged.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
                history = merged;
            }
        }

        // Calculate Z-Scores using CALIBRATION vector (consistent phonemes)
        const zScores = calculateZScores(calibrationVector, history, 30);
        setZScoreResult(zScores);

        // Prepare input for Voice Oracle using READING vector (expressive content)
        const now = new Date();
        const timeCategory = getTimeCategory(now);
        const dayCategory = getDayCategory(now);

        // Get last 5 tags for context
        const tagHistory = history.filter(h => h.annotationTag).map(h => h.annotationTag).slice(-5);

        // Context Calculation
        const userStatus = history.length === 0 ? 'new' : (history.length < 30 ? 'returning' : 'long_term');
        const identity = context?.archetype || 'Optimizer';

        // Delta Calculation (Yesterday)
        let deltaYesterday = null;
        if (history.length > 0) {
            const lastLog = history[history.length - 1];
            // Simple delta calculation for jitter if it exists in the 30 vectors
            // Note: In a full implementation, we'd compare all dimensions
            deltaYesterday = {
                jitter: (calibrationVector[0] - lastLog.calibrationVector[0]).toFixed(2)
            };
        }

        const oracleInput = {
            user_status: userStatus,
            identity: identity,
            current_metrics: calibrationVector,
            delta_yesterday: deltaYesterday,
            context: {
                time_category: timeCategory,
                day_category: dayCategory,
                genre: context?.genre,
                mood: context?.mood,
                day_index: context?.dayIndex,
                tag_history: tagHistory
            },
            anomalies: zScores.anomalies.map(a => ({
                metric: a.dimensionName,
                z_score: a.zScore.toFixed(2),
                severity: a.severity
            }))
        };

        try {
            // Call Gemini with Voice Oracle prompt
            const prompt = MIRROR_ORACLE_SYSTEM_PROMPT
                .replace('{{user_status}}', userStatus)
                .replace('{{identity}}', identity)
                .replace('{{time_cat}}', timeCategory)
                .replace('{{day_cat}}', dayCategory)
                .replace('{{JSON_INPUT}}', JSON.stringify(oracleInput, null, 2));

            const response = await generateContent(prompt, '');

            if (!response) {
                throw new Error('Empty response from Oracle');
            }

            // Parse JSON response
            const parsed = JSON.parse(response);
            setOracleResponse(parsed);
        } catch (error) {
            console.error('Failed to get Oracle analysis:', error);
        }

        setIsLoading(false);
    }

    function handleTagSelection(tag: string) {
        setSelectedTag(tag);

        // 1. Save locally for immediate feedback & recap
        const now = new Date();
        const log = {
            userHash, // Essential for cross-device recovery
            timestamp: now,
            calibrationVector,
            readingVector,
            context: {
                timeCategory: getTimeCategory(now),
                dayCategory: getDayCategory(now),
                genre: context?.genre,
                mood: context?.mood,
                dayIndex: context?.dayIndex,
                readingText: context?.readingText,
                deviceInfo: {
                    browser: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
                    os: typeof navigator !== 'undefined' ? navigator.platform : 'unknown',
                    sampleRate: context?.sampleRate || 48000
                }
            },
            annotationTag: tag,
            alignmentScore: oracleResponse?.mirror_analysis.alignment_score,
            wellnessConsentAgreed: wellnessConsentAgreed
        };
        saveVoiceLog(log);

        // 2. Asset-ization: Sync to Firestore (only if research consent given)
        if (oracleResponse && wellnessConsentAgreed) {
            saveMirrorLog(log, {
                mirror_analysis: oracleResponse.mirror_analysis,
                oracle_prediction: oracleResponse.oracle_prediction
            });
        }
    }


    if (isLoading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto border-4 border-white border-t-transparent rounded-full animate-spin" />
                    <p className="text-white font-mono text-sm animate-pulse tracking-widest">CONSULTING THE ORACLE...</p>
                </div>
            </div>
        );
    }

    if (!zScoreResult || !oracleResponse) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-red-400 font-mono">Failed to analyze voice data</p>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition uppercase text-xs tracking-widest">
                        [ Close ]
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-screen w-full overflow-hidden bg-black text-white selection:bg-white/30">
            {/* Unified Atmospheric Background Layer */}
            <BackgroundLayer readingVector={readingVector} showInsight={showInsight} />

            {/* Information Layer: UI Elements */}
            <div className="relative z-20 h-full p-8 md:p-16 flex flex-col justify-between">
                <AnimatePresence mode="wait">
                    {!showInsight ? (
                        /* --- Today's Oracle (Default View) --- */
                        <motion.div
                            key="today"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full flex flex-col justify-between"
                        >
                            <header className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <p className="text-[10px] tracking-[0.5em] opacity-40 uppercase font-mono">
                                            Mirror: {config.name}
                                        </p>
                                        <h1 className="text-5xl md:text-7xl italic leading-[1.1] max-w-2xl" style={{ fontFamily: config.font }}>
                                            {oracleResponse.mirror_analysis.headline}
                                        </h1>
                                        <p className="max-w-md text-sm leading-relaxed opacity-70 font-light">
                                            {oracleResponse.mirror_analysis.scientific_observation}
                                        </p>
                                    </div>

                                    {/* Top Right: Weekly Drift */}
                                    <div className="text-right">
                                        <p className="text-[8px] tracking-[0.2em] opacity-30 mb-2 font-mono uppercase">7-Day Drift</p>
                                        <div className="w-32 h-12 relative">
                                            <Sparkline data={[0.2, 0.4, 0.3, 0.5, 0.45, 0.6, 0.7]} color={config.colors.accent} />
                                            <div className="absolute inset-0 border-b border-white/10" />
                                        </div>
                                    </div>
                                </div>
                            </header>

                            <footer className="space-y-10">
                                <div className="flex justify-between items-end">
                                    <div className="space-y-6 flex-1">
                                        <div className="space-y-2">
                                            <p className="text-[8px] tracking-[0.3em] opacity-30 uppercase font-mono">Acoustic Oracle</p>
                                            <p className="text-xl md:text-3xl max-w-xl border-l border-white/20 pl-6 py-1 leading-snug">
                                                {oracleResponse.oracle_prediction.forecast}
                                            </p>
                                        </div>

                                        <div className="flex flex-col gap-4">
                                            <div className="flex gap-4">
                                                {oracleResponse.suggested_tags.map((tag) => (
                                                    <button
                                                        key={tag}
                                                        onClick={() => handleTagSelection(tag)}
                                                        className={`text-[10px] tracking-[0.2em] font-mono px-4 py-2 border transition-all ${selectedTag === tag ? 'bg-white text-black border-white' : 'border-white/20 text-white/40 hover:text-white hover:border-white'}`}
                                                    >
                                                        [{tag.toUpperCase()}]
                                                    </button>
                                                ))}
                                            </div>
                                            {/* Entry to Insights */}
                                            <button
                                                onClick={() => setShowInsight(true)}
                                                className="text-[10px] tracking-[0.2em] opacity-30 hover:opacity-100 transition-opacity uppercase font-mono text-left"
                                            >
                                                [ 30-Day Insight : Tap to Expand ]
                                            </button>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-10">
                                        {/* Actionable Guidance Card */}
                                        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-6 rounded-sm min-w-[300px] text-right">
                                            <span className="text-[9px] bg-white text-black px-2 py-0.5 mb-3 inline-block font-bold tracking-tighter uppercase">Actionable</span>
                                            <p className="text-lg font-medium leading-tight">{oracleResponse.actionable_guidance}</p>
                                        </div>

                                        {/* Day 7 Dossier Synthesis Trigger */}
                                        {context?.dayIndex === 7 && (
                                            <motion.button
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                onClick={() => setShowRecap(true)}
                                                className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-6 py-3 rounded-xl font-bold shadow-[0_0_20px_rgba(168,85,247,0.4)] animate-pulse uppercase text-[10px] tracking-widest"
                                            >
                                                ✨ Synthesize 7-Day Dossier
                                            </motion.button>
                                        )}

                                        {/* Progress Dots */}
                                        <div className="flex space-x-3 pb-2">
                                            {[...Array(7)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-1 h-1 rounded-full transition-all duration-700 ${i < (context?.dayIndex || 1) ? 'bg-white shadow-[0_0_8px_white]' : 'bg-white/10'}`}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-8 border-t border-white/5">
                                    <button onClick={onClose} className="text-[10px] tracking-[0.2em] opacity-30 hover:opacity-100 uppercase font-mono transition-opacity">
                                        [ Close Mirror ]
                                    </button>

                                    {/* Identity Kit Integration */}
                                    <IdentityKitExporter metadata={{
                                        progress: (context?.dayIndex || 1) + savedDaysCount - 1,
                                        storyTitle: oracleResponse.mirror_analysis.headline
                                    }} />

                                    <div className="text-[8px] text-white/20 font-mono uppercase tracking-[0.2em]">
                                        Voice Mirror System v2.0 // {type} Lens
                                    </div>
                                </div>
                            </footer>
                        </motion.div>
                    ) : (
                        /* --- 30-Day Insights (Insight View) --- */
                        <motion.div
                            key="insight"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="h-full flex flex-col justify-center space-y-20 p-12"
                        >
                            <section className="space-y-4">
                                <p className="text-[10px] tracking-[0.4em] opacity-40 uppercase font-mono">30-Day Dominant Archetype</p>
                                <h2 className="text-6xl md:text-8xl italic" style={{ fontFamily: config.font }}>
                                    THE {type} ({Math.round(oracleResponse.mirror_analysis.alignment_score)}%)
                                </h2>
                            </section>

                            <section className="flex gap-20">
                                <div className="space-y-2">
                                    <p className="text-[10px] tracking-[0.4em] opacity-40 uppercase font-mono">Narrative Progress</p>
                                    <p className="text-4xl font-light">{savedDaysCount} <span className="text-xl opacity-30">/ 252 STORIES</span></p>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-[10px] tracking-[0.4em] opacity-40 uppercase font-mono">Biometric Stability</p>
                                    <p className="text-4xl font-light">
                                        {(100 - (zScoreResult.anomalies.length * 5)).toFixed(1)}%
                                        <span className="text-xs text-green-400 font-mono ml-4 uppercase">↑ Optimal</span>
                                    </p>
                                </div>
                            </section>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowInsight(false)}
                                    className="w-fit text-[10px] border border-white/20 px-8 py-4 hover:bg-white hover:text-black transition-all font-mono uppercase tracking-[0.2em]"
                                >
                                    Return to Oracle
                                </button>
                                <button
                                    onClick={handleVaultReset}
                                    className="w-fit text-[10px] border border-red-500/20 px-8 py-4 text-red-500/40 hover:bg-red-500 hover:text-white transition-all font-mono uppercase tracking-[0.2em]"
                                >
                                    Reset Biometric Profile
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {showRecap && (
                <MirrorRecap
                    userHash={userHash}
                    archetype={context?.archetype}
                    onClose={() => {
                        setShowRecap(false);
                        onClose();
                    }}
                />
            )}
        </div>
    );
}

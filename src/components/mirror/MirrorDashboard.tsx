'use client';

import { useState, useEffect } from 'react';
import { calculateZScores, getTimeCategory, getDayCategory, saveVoiceLog, loadVoiceLogHistory, clearVoiceLogHistory } from '@/lib/mirrorEngine';
import { getAllAudioBlobs } from '@/lib/mirrorDb';
import type { ZScoreResult, AnomalyAlert } from '@/lib/mirrorEngine';
import { generateContent } from '@/lib/gemini';
import { MIRROR_ORACLE_SYSTEM_PROMPT } from '@/lib/mirrorPrompt';
import { saveMirrorLog, getMirrorLogs, deleteMirrorLogs } from '@/lib/storage';
import MirrorRecap from './MirrorRecap';

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
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 mx-auto border-4 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-cyan-400 font-mono text-sm animate-pulse">Consulting the Oracle...</p>
                </div>
            </div>
        );
    }

    if (!zScoreResult || !oracleResponse) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-red-400 font-mono">Failed to analyze voice data</p>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        Close
                    </button>
                </div>
            </div>
        );
    }

    const alertLevelColors = {
        'Optimal': 'from-green-500 to-emerald-600',
        'Caution': 'from-yellow-500 to-orange-600',
        'Critical': 'from-red-500 to-rose-600'
    };

    const alertLevelIcons = {
        'Optimal': '✓',
        'Caution': '⚠',
        'Critical': '🔴'
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-12">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">
                        Voice Mirror
                    </h1>
                    <p className="text-gray-400 text-sm font-mono">Bio-Acoustic Analysis • {new Date().toLocaleDateString()}</p>
                    {context && (
                        <div className="flex items-center justify-center gap-4 text-xs text-gray-500 font-mono">
                            <span>Genre: {context.genre}</span>
                            <span>•</span>
                            <span>Mood: {context.mood.toUpperCase()}</span>
                            <span>•</span>
                            <span>Day {context.dayIndex}/7</span>
                            <span>•</span>
                            <span>Level: {context.progressLevel}</span>
                        </div>
                    )}
                </div>

                {/* Alert Level Banner */}
                <div className={`rounded-2xl p-6 bg-gradient-to-r ${alertLevelColors[oracleResponse.oracle_prediction.alert_level]} shadow-2xl`}>
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">{alertLevelIcons[oracleResponse.oracle_prediction.alert_level]}</span>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-white">{oracleResponse.mirror_analysis.headline}</h2>
                            <p className="text-white/90 text-sm mt-1">Alert Level: {oracleResponse.oracle_prediction.alert_level}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-black text-white">{oracleResponse.mirror_analysis.alignment_score}%</div>
                            <div className="text-[10px] uppercase font-bold text-white/70 tracking-tighter">Archetype Alignment</div>
                        </div>
                    </div>
                </div>

                {/* Mirror Analysis */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 space-y-6">
                    <div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-3">Scientific Observation</h3>
                        <p className="text-gray-200 leading-relaxed">{oracleResponse.mirror_analysis.scientific_observation}</p>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-3">Oracle Prediction</h3>
                        <p className="text-gray-200 leading-relaxed">{oracleResponse.oracle_prediction.forecast}</p>
                    </div>

                    <div className="border-t border-white/10 pt-6">
                        <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400 mb-3">Actionable Guidance</h3>
                        <p className="text-gray-200 leading-relaxed font-medium">{oracleResponse.actionable_guidance}</p>
                    </div>

                    {postReadingInsight && postReadingInsight.category !== 'Statue' && (
                        <div className="border-t border-white/10 pt-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-pink-400 mb-4 flex items-center gap-2">
                                <span className="w-2 h-2 bg-pink-500 rounded-full animate-pulse" />
                                Invisible Artifact (5s Post-Reading)
                            </h3>
                            <div className="bg-pink-500/10 rounded-2xl p-6 border border-pink-500/20">
                                <div className="flex items-start gap-5">
                                    <div className="w-12 h-12 bg-pink-500/20 rounded-xl flex items-center justify-center text-2xl shrink-0">
                                        {postReadingInsight.category === 'Sigh' ? '💨' :
                                            postReadingInsight.category === 'Laughter' ? '✨' :
                                                postReadingInsight.category === 'Mumble' ? '🌫️' :
                                                    postReadingInsight.category === 'Fidget' ? '🫨' : '🗿'}
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-pink-400 font-bold uppercase tracking-widest text-sm">
                                            Detected: {postReadingInsight.category}
                                        </h4>
                                        <p className="text-gray-300 text-sm leading-relaxed">
                                            {postReadingInsight.description}
                                        </p>
                                        <div className="pt-2 flex items-center gap-4 text-[10px] font-mono text-gray-500 uppercase">
                                            <span>Intensity: {Math.round(postReadingInsight.score * 100)}%</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* ARCHETYPE PROGRESS & RESET */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6">
                        <h3 className="text-zinc-500 text-[10px] uppercase tracking-widest mb-4">Identity Integrity</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-cyan-500 transition-all duration-1000"
                                    style={{ width: `${Math.min(100, savedDaysCount * 14.3)}%` }}
                                />
                            </div>
                            <span className="text-xs font-mono text-cyan-400">{savedDaysCount}/7 DAYS</span>
                        </div>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-2xl p-6 flex flex-col justify-center">
                        <button
                            onClick={handleVaultReset}
                            className="text-[10px] font-black text-zinc-600 hover:text-red-500 transition-colors uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <span className="text-xs opacity-50 text-red-600">⚠</span> Reset Biometric Profile
                        </button>
                    </div>
                </div>

                {/* 7-Day Resonance Progress */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xs font-black uppercase tracking-widest text-purple-400">7-Day Resonance Progress</h3>
                        <span className="text-purple-400 font-mono text-xs">{savedDaysCount}/7 Days Etched</span>
                    </div>

                    <div className="grid grid-cols-7 gap-2">
                        {[1, 2, 3, 4, 5, 6, 7].map((day) => {
                            const isCurrent = day === (context?.dayIndex || 1);
                            const isPast = day < (context?.dayIndex || 1);
                            const isFuture = day > (context?.dayIndex || 1);

                            return (
                                <div key={day} className="flex flex-col items-center gap-2">
                                    <div className={`w-full h-12 rounded-lg flex items-center justify-center border transition-all ${isPast ? 'bg-purple-500/20 border-purple-500/50 text-purple-400 shadow-[0_0_10px_rgba(168,85,247,0.2)]' :
                                        isCurrent ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.3)] animate-pulse' :
                                            'bg-white/5 border-white/10 text-gray-600'
                                        }`}>
                                        <span className="text-xs font-bold">{day}</span>
                                    </div>
                                    <span className="text-[10px] font-mono uppercase tracking-tighter text-gray-500">
                                        {isCurrent ? 'Active' : isPast ? 'Etched' : 'Void'}
                                    </span>
                                </div>
                            );
                        })}
                    </div>

                    {savedDaysCount < 7 ? (
                        <p className="text-gray-400 text-xs italic leading-relaxed">
                            Each day, your refined voice is etched into the mirror. On Day 7, your **Resonance Dossier** will be synthesized into a permanent digital asset.
                        </p>
                    ) : (
                        <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl">
                            <p className="text-purple-400 text-sm font-bold">✨ Resonance Dossier Ready for Synthesis</p>
                        </div>
                    )}
                </div>

                {/* Resonance Path (Historical Log) */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400">Resonance Path (History)</h3>
                    <div className="space-y-4">
                        {loadVoiceLogHistory().slice(-5).reverse().map((log, idx) => (
                            <div key={idx} className="flex items-center gap-4 text-sm border-l-2 border-white/10 pl-4 py-1">
                                <span className="text-gray-500 font-mono text-xs w-20">
                                    {new Date(log.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                </span>
                                <span className="text-gray-300 flex-1">{log.annotationTag || 'No Tag'}</span>
                                {log.alignmentScore && (
                                    <span className="text-cyan-400 font-bold text-xs">
                                        {log.alignmentScore}%
                                    </span>
                                )}
                                <span className={`text-xs font-mono ${log.context.mood === 'high' ? 'text-orange-400' :
                                    log.context.mood === 'mid' ? 'text-green-400' : 'text-blue-400'
                                    }`}>
                                    {log.context.mood?.toUpperCase()}
                                </span>
                            </div>
                        ))}
                    </div>
                    {loadVoiceLogHistory().length === 0 && (
                        <p className="text-gray-500 text-xs italic">Your first echoes will appear here tomorrow.</p>
                    )}
                </div>

                {/* Anomalies (if any) */}
                {zScoreResult.anomalies.length > 0 && (
                    <div className="bg-red-500/10 backdrop-blur-sm rounded-2xl p-6 border border-red-500/20">
                        <h3 className="text-xs font-black uppercase tracking-widest text-red-400 mb-4">Detected Anomalies</h3>
                        <div className="space-y-3">
                            {zScoreResult.anomalies.slice(0, 5).map((anomaly, idx) => (
                                <div key={idx} className="flex items-center justify-between text-sm">
                                    <span className="text-gray-300 font-mono">{anomaly.dimensionName}</span>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${anomaly.severity === 'high' ? 'bg-red-500/20 text-red-300' :
                                            anomaly.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-300' :
                                                'bg-blue-500/20 text-blue-300'
                                            }`}>
                                            {anomaly.severity.toUpperCase()}
                                        </span>
                                        <span className="text-gray-400 font-mono text-xs">
                                            {anomaly.zScore > 0 ? '+' : ''}{anomaly.zScore.toFixed(2)}σ
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Annotation Loop */}
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-cyan-400">Tag This State</h3>
                    <p className="text-gray-400 text-sm">Select the tag that best describes your current state. This helps build your personalized baseline.</p>

                    <div className="grid grid-cols-2 gap-3">
                        {oracleResponse.suggested_tags.map((tag) => (
                            <button
                                key={tag}
                                onClick={() => handleTagSelection(tag)}
                                className={`px-6 py-4 rounded-xl text-sm font-bold transition-all ${selectedTag === tag
                                    ? 'bg-cyan-500 text-black shadow-[0_0_20px_rgba(34,211,238,0.5)]'
                                    : 'bg-white/10 text-gray-300 hover:bg-white/20 border border-white/10'
                                    }`}
                            >
                                {tag}
                            </button>
                        ))}
                    </div>

                    {selectedTag && (
                        <div className="mt-4 p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                            <p className="text-green-400 text-sm font-mono">✓ Tagged as "{selectedTag}" and saved to history</p>
                        </div>
                    )}
                </div>

                {/* Close Button & Recap Trigger */}
                <div className="text-center space-y-4">
                    {context?.dayIndex === 7 && selectedTag && (
                        <button
                            onClick={() => setShowRecap(true)}
                            className="w-full py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(34,211,238,0.4)] hover:shadow-[0_0_30px_rgba(34,211,238,0.6)] transition-all animate-pulse"
                        >
                            ✨ Reveal 7-Day Voice Recap
                        </button>
                    )}

                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-all border border-white/20"
                    >
                        Close Mirror
                    </button>
                </div>
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

'use client';

import { useState, useEffect } from 'react';
import { calculateZScores, getTimeCategory, getDayCategory, saveVoiceLog, loadVoiceLogHistory } from '@/lib/mirrorEngine';
import type { ZScoreResult, AnomalyAlert } from '@/lib/mirrorEngine';
import { generateContent } from '@/lib/gemini';
import { MIRROR_ORACLE_SYSTEM_PROMPT } from '@/lib/mirrorPrompt';

interface MirrorDashboardProps {
    vector: number[];
    onAnnotate?: (tag: string) => void;
    onClose?: () => void;
}

interface OracleResponse {
    mirror_analysis: {
        headline: string;
        scientific_observation: string;
    };
    oracle_prediction: {
        forecast: string;
        alert_level: 'Optimal' | 'Caution' | 'Critical';
    };
    actionable_guidance: string;
    suggested_tags: string[];
}

export default function MirrorDashboard({ vector, onAnnotate, onClose }: MirrorDashboardProps) {
    const [zScoreResult, setZScoreResult] = useState<ZScoreResult | null>(null);
    const [oracleResponse, setOracleResponse] = useState<OracleResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    useEffect(() => {
        analyzeVoice();
    }, [vector]);

    async function analyzeVoice() {
        setIsLoading(true);

        // Load history
        const history = loadVoiceLogHistory();

        // Calculate Z-Scores
        const zScores = calculateZScores(vector, history, 30);
        setZScoreResult(zScores);

        // Prepare input for Voice Oracle
        const now = new Date();
        const timeCategory = getTimeCategory(now);
        const dayCategory = getDayCategory(now);

        const oracleInput = {
            current_vector: vector,
            z_scores: zScores.zScores,
            context: {
                time_category: timeCategory,
                day_category: dayCategory
            },
            anomalies: zScores.anomalies.map(a => ({
                metric: a.dimensionName,
                z_score: a.zScore.toFixed(2),
                severity: a.severity
            })),
            baseline_stats: {
                mean: zScores.baselineStats.mean,
                std: zScores.baselineStats.std
            }
        };

        try {
            // Call Gemini with Voice Oracle prompt
            const prompt = MIRROR_ORACLE_SYSTEM_PROMPT.replace('{{time_cat}}', timeCategory)
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

        // Save voice log with annotation
        const now = new Date();
        saveVoiceLog({
            timestamp: now,
            vector: vector,
            context: {
                timeCategory: getTimeCategory(now),
                dayCategory: getDayCategory(now)
            },
            annotationTag: tag
        });

        if (onAnnotate) {
            onAnnotate(tag);
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
                </div>

                {/* Alert Level Banner */}
                <div className={`rounded-2xl p-6 bg-gradient-to-r ${alertLevelColors[oracleResponse.oracle_prediction.alert_level]} shadow-2xl`}>
                    <div className="flex items-center gap-4">
                        <span className="text-4xl">{alertLevelIcons[oracleResponse.oracle_prediction.alert_level]}</span>
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold text-white">{oracleResponse.mirror_analysis.headline}</h2>
                            <p className="text-white/90 text-sm mt-1">Alert Level: {oracleResponse.oracle_prediction.alert_level}</p>
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

                {/* Close Button */}
                <div className="text-center">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-bold transition-all border border-white/20"
                    >
                        Close Mirror
                    </button>
                </div>
            </div>
        </div>
    );
}

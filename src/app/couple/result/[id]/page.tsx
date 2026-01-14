'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { voiceTypes, TypeCode } from '@/lib/types';
import { getDuoIdentity } from '@/lib/duoIdentityMatrix';
import { getCompatibilityTier } from '@/lib/compatibilityMatrix';

interface CoupleResult {
    id: string;
    userA: { name: string; job: string; accent: string; typeCode?: string };
    userB: { name: string; job: string; accent: string; typeCode?: string };
    matrixScore: number;
    createdAt: string;
    status: string;
    analysis?: {
        userA: Record<string, unknown>;
        userB: Record<string, unknown>;
        together: {
            harmony_score: number;
            sync_rate: number;
            dominance_a: number;
            dominance_b: number;
            blend_quality: string;
        };
        delta: Record<string, number>;
    };
}

type DisplayStage = 'loading' | 'label' | 'metrics' | 'full';

export default function CoupleResultPage() {
    const params = useParams();
    const resultId = params.id as string;

    const [result, setResult] = useState<CoupleResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [stage, setStage] = useState<DisplayStage>('loading');

    useEffect(() => {
        const stored = localStorage.getItem(`etchvox_couple_${resultId}`);
        if (stored) {
            setResult(JSON.parse(stored));
            setLoading(false);

            // Staged reveal animation
            setTimeout(() => setStage('label'), 500);
            setTimeout(() => setStage('metrics'), 2500);
            setTimeout(() => setStage('full'), 4500);
        } else {
            setLoading(false);
        }
    }, [resultId]);

    if (loading || !result) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black">
                <div className="w-12 h-12 border-4 border-cyan-500 border-t-magenta-500 rounded-full animate-spin" />
            </div>
        );
    }

    // Mock type codes for demo (in production, these would come from actual analysis)
    const typeA = (result.userA.typeCode || 'HFEC') as TypeCode;
    const typeB = (result.userB.typeCode || 'HFED') as TypeCode;

    const duoIdentity = getDuoIdentity(typeA, typeB);
    const compatTier = getCompatibilityTier(result.matrixScore);

    const together = result.analysis?.together || {
        harmony_score: Math.floor(Math.random() * 20) + 65,
        sync_rate: 0.7 + Math.random() * 0.25,
        dominance_a: 0.45 + Math.random() * 0.15,
        dominance_b: 0.45 + Math.random() * 0.15,
        blend_quality: 'Jazz Duo - Complementary improvisation',
    };

    const voiceA = voiceTypes[typeA];
    const voiceB = voiceTypes[typeB];

    return (
        <div className="min-h-screen bg-black py-8 px-4">
            <div className="max-w-3xl mx-auto">

                {/* Stage 1: INSTANT LABEL (Big reveal) */}
                {stage === 'label' && (
                    <div className="min-h-screen flex items-center justify-center fade-in">
                        <div className="text-center space-y-8">
                            <div className="mono text-sm text-gray-500 tracking-wide">
                                ETCHVOX: COMPATIBILITY ANALYSIS
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-5xl md:text-7xl font-black leading-tight">
                                    <span className="bg-gradient-to-r from-cyan-400 to-magenta-400 bg-clip-text text-transparent">
                                        {duoIdentity.label}
                                    </span>
                                </h1>

                                <p className="text-xl md:text-2xl text-gray-300 italic max-w-2xl mx-auto leading-relaxed">
                                    "{duoIdentity.tagline}"
                                </p>
                            </div>

                            <div className="flex items-center justify-center gap-8 pt-8">
                                <div className="text-center">
                                    <div className="text-5xl mb-2">{voiceA.icon}</div>
                                    <div className="text-sm text-gray-400">{result.userA.name}</div>
                                    <div className="text-xs text-gray-600">{voiceA.name}</div>
                                </div>

                                <div className="text-4xl text-gray-600">×</div>

                                <div className="text-center">
                                    <div className="text-5xl mb-2">{voiceB.icon}</div>
                                    <div className="text-sm text-gray-400">{result.userB.name}</div>
                                    <div className="text-xs text-gray-600">{voiceB.name}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stage 2: METRICS DASHBOARD */}
                {stage === 'metrics' && (
                    <div className="min-h-screen flex items-center justify-center fade-in">
                        <div className="w-full max-w-2xl space-y-12">

                            {/* Duo Label (smaller) */}
                            <div className="text-center space-y-3">
                                <div className="text-3xl md:text-4xl font-bold text-cyan-400">
                                    {duoIdentity.label}
                                </div>
                                <p className="text-gray-400 italic text-lg">
                                    "{duoIdentity.tagline}"
                                </p>
                            </div>

                            {/* Matrix Score */}
                            <div className="glass rounded-2xl p-8 text-center relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-magenta-500/5" />
                                <div className="relative">
                                    <div className="mono text-gray-500 text-sm mb-3">COMPATIBILITY QUOTIENT</div>
                                    <div className="text-7xl md:text-8xl font-black mb-3">
                                        <span className="bg-gradient-to-r from-cyan-400 to-magenta-400 bg-clip-text text-transparent">
                                            {result.matrixScore}
                                        </span>
                                        <span className="text-3xl text-gray-600">/100</span>
                                    </div>
                                    <div className={`text-2xl font-bold`} style={{ color: compatTier.color }}>
                                        {compatTier.emoji} {compatTier.tier} {compatTier.emoji}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Metrics */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="glass rounded-xl p-6 text-center">
                                    <div className="text-4xl font-bold text-cyan-400 mb-2">
                                        {Math.round(together.harmony_score)}%
                                    </div>
                                    <div className="text-sm text-gray-500">Harmony Score</div>
                                    <p className="text-xs text-gray-600 mt-2">Pitch alignment</p>
                                </div>

                                <div className="glass rounded-xl p-6 text-center">
                                    <div className="text-4xl font-bold text-magenta-400 mb-2">
                                        {Math.round(together.sync_rate * 100)}%
                                    </div>
                                    <div className="text-sm text-gray-500">Sync Rate</div>
                                    <p className="text-xs text-gray-600 mt-2">Tempo match</p>
                                </div>
                            </div>

                            {/* Scroll hint */}
                            <div className="text-center">
                                <p className="text-gray-600 text-sm mb-3">Scroll for detailed analysis</p>
                                <div className="inline-block animate-bounce">
                                    <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Stage 3: FULL REPORT */}
                {stage === 'full' && (
                    <div className="fade-in space-y-8 pb-16">

                        {/* Header with Duo Label */}
                        <div className="text-center space-y-4 pt-8">
                            <div className="mono text-gray-500 text-xs">ETCHVOX</div>
                            <h1 className="text-4xl md:text-5xl font-black">
                                <span className="bg-gradient-to-r from-cyan-400 to-magenta-400 bg-clip-text text-transparent">
                                    {duoIdentity.label}
                                </span>
                            </h1>
                            <p className="text-gray-400 italic max-w-2xl mx-auto">
                                "{duoIdentity.tagline}"
                            </p>
                        </div>

                        {/* Matrix Score Card */}
                        <div className="glass rounded-2xl p-8 relative overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-magenta-500/5" />
                            <div className="relative text-center">
                                <div className="mono text-gray-500 text-sm mb-2">COMPATIBILITY QUOTIENT</div>
                                <div className="text-6xl md:text-7xl font-black mb-2">
                                    <span className="bg-gradient-to-r from-cyan-400 to-magenta-400 bg-clip-text text-transparent">
                                        {result.matrixScore}
                                    </span>
                                    <span className="text-2xl text-gray-600">/100</span>
                                </div>
                                <div className={`text-xl font-bold`} style={{ color: compatTier.color }}>
                                    {compatTier.emoji} {compatTier.tier}
                                </div>
                            </div>
                        </div>

                        {/* Voice Profiles */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="glass rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="text-4xl">{voiceA.icon}</div>
                                    <div>
                                        <div className="font-bold text-cyan-400">{result.userA.name}</div>
                                        <div className="text-sm text-gray-500">{voiceA.name}</div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 italic">"{voiceA.catchphrase}"</p>
                            </div>

                            <div className="glass rounded-xl p-6">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="text-4xl">{voiceB.icon}</div>
                                    <div>
                                        <div className="font-bold text-magenta-400">{result.userB.name}</div>
                                        <div className="text-sm text-gray-500">{voiceB.name}</div>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 italic">"{voiceB.catchphrase}"</p>
                            </div>
                        </div>

                        {/* Together Metrics */}
                        <div className="glass rounded-xl p-6">
                            <h3 className="font-semibold mb-6 text-lg">🎵 Unison Analysis</h3>

                            {/* Harmony Score */}
                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Harmony Score</span>
                                    <span className="text-cyan-400 font-bold">{Math.round(together.harmony_score)}%</span>
                                </div>
                                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-cyan-500 to-magenta-500 transition-all duration-1000"
                                        style={{ width: `${together.harmony_score}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-600 mt-1">How well your pitches aligned when speaking together</p>
                            </div>

                            {/* Sync Rate */}
                            <div className="mb-6">
                                <div className="flex justify-between text-sm mb-2">
                                    <span className="text-gray-400">Sync Rate</span>
                                    <span className="text-magenta-400 font-bold">{Math.round(together.sync_rate * 100)}%</span>
                                </div>
                                <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-cyan-500 transition-all duration-1000"
                                        style={{ width: `${together.sync_rate * 100}%` }}
                                    />
                                </div>
                                <p className="text-xs text-gray-600 mt-1">Tempo synchronization</p>
                            </div>

                            {/* Dominance */}
                            <div className="mb-6">
                                <div className="text-sm text-gray-400 mb-2">Volume Dominance</div>
                                <div className="h-6 bg-gray-800 rounded-full overflow-hidden flex">
                                    <div
                                        className="h-full bg-cyan-500 transition-all duration-1000"
                                        style={{ width: `${together.dominance_a * 100}%` }}
                                    />
                                    <div
                                        className="h-full bg-magenta-500 transition-all duration-1000"
                                        style={{ width: `${together.dominance_b * 100}%` }}
                                    />
                                </div>
                                <div className="flex justify-between text-xs text-gray-500 mt-2">
                                    <span>{result.userA.name}: {Math.round(together.dominance_a * 100)}%</span>
                                    <span>{result.userB.name}: {Math.round(together.dominance_b * 100)}%</span>
                                </div>
                                <p className="text-xs text-gray-600 mt-2">Who's louder when together</p>
                            </div>

                            {/* Blend Quality */}
                            <div className="text-center p-4 bg-black/50 rounded-lg">
                                <div className="text-xs text-gray-500 mb-1">BLEND QUALITY</div>
                                <div className="text-base text-yellow-400 font-medium">{together.blend_quality}</div>
                            </div>
                        </div>

                        {/* Demo Notice */}
                        {result.status === 'demo' && (
                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 text-center">
                                <p className="text-yellow-400 text-sm">
                                    🧪 Demo Mode - Full analysis with AI-powered insights coming soon
                                </p>
                            </div>
                        )}

                        {/* Share */}
                        <div className="text-center space-y-4">
                            <button
                                onClick={() => {
                                    const text = `Our voice compatibility: "${duoIdentity.label}" — ${duoIdentity.tagline}\n\nScore: ${result.matrixScore}/100 (${compatTier.tier})\n\nTest yours at EtchVox!`;
                                    navigator.clipboard.writeText(text);
                                    alert('Copied to clipboard!');
                                }}
                                className="btn-primary px-8 py-4 rounded-full"
                            >
                                📋 Copy Our Result
                            </button>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-4 pt-6">
                            <Link
                                href="/couple"
                                className="flex-1 text-center py-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                            >
                                Try Again
                            </Link>
                            <Link
                                href="/"
                                className="flex-1 text-center py-3 rounded-lg border border-white/10 hover:bg-white/5 transition-colors"
                            >
                                Home
                            </Link>
                        </div>

                        {/* Footer Note */}
                        <p className="text-center text-gray-600 text-xs pt-8">
                            Powered by EtchVox • 256 Duo-Identity Matrix
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

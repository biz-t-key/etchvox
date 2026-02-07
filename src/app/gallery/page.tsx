'use client';

import { useState } from 'react';
import { voiceTypes, TypeCode, AnalysisMetrics } from '@/lib/types';
import { mbtiTypes, MBTIType } from '@/lib/mbti';
import SoloIdentityCard from '@/components/result/SoloIdentityCard';
import DuoIdentityCard from '@/components/result/DuoIdentityCard';
import SpyReportCard from '@/components/result/SpyReportCard';
import MirrorRecap from '@/components/mirror/MirrorRecap';

// Mock Data Generators
const generateMockMetrics = (typeCode: TypeCode): AnalysisMetrics => {
    // Basic mock metrics that roughly align with the type (simplified)
    return {
        pitch: 200,
        volumeDb: -15,
        speed: 0.5,
        vibe: 0.5,
        tone: 2000,
        humanityScore: 85, // Default for mock
        hnr: 20,
        jitter: 0.01,
        shimmer: 0.1,
        pitchVar: 0.2,
        speedVar: 0.1,
        silenceRate: 0.1,
    };
};

const generateMockDuo = () => {
    return {
        userA: {
            name: "Partner Alpha",
            job: "CEO",
            metrics: { ...generateMockMetrics('ELON'), humanityScore: 88, pitch: 180, speed: 0.8 },
            typeCode: 'ELON' as TypeCode
        },
        userB: {
            name: "Partner Beta",
            job: "CTO",
            metrics: { ...generateMockMetrics('HFCC'), humanityScore: 92, pitch: 220, speed: 0.6 },
            typeCode: 'HFCC' as TypeCode
        }
    };
};

const SAMPLE_MBTIS: MBTIType[] = ['INTJ', 'ENFP', 'ISTP', 'ESFJ'];

const CATEGORIES = {
    STANDARD: ['HFEC', 'HFED', 'HSEC', 'HSED', 'HFCC', 'HFCD', 'HSCC', 'HSCD', 'LFEC', 'LFED', 'LSEC', 'LSED', 'LFCC', 'LFCD', 'LSCC', 'LSCD'],
    SPECIAL: ['ELON', 'NPCS', 'EPON', 'ELCS', 'NPOS', 'ELCN', 'NPCN', 'ELOS', 'EPCS', 'NLOS', 'EPOS', 'NLCN', 'EPCN', 'NLON', 'NPON', 'ELSN', 'EPCB'],
    SPY: ['HIRED', 'SUSP', 'REJT', 'BURN'],
    RECAP: ['optimizer', 'stoic', 'alchemist', 'cinematic_grit']
};

export default function GalleryPage() {
    const [mode, setMode] = useState<'solo' | 'couple'>('solo');
    const [category, setCategory] = useState<'STANDARD' | 'SPECIAL' | 'SPY' | 'RECAP'>('STANDARD');
    const [selectedArchetype, setSelectedArchetype] = useState<string | null>(null);

    const visibleTypes = CATEGORIES[category] as TypeCode[];
    const duoMock = generateMockDuo();

    return (
        <div className="min-h-screen bg-black text-white p-8 pt-24 text-center">
            <h1 className="text-4xl font-black mb-8 neon-text-cyan">
                DEBUG GALLERY
            </h1>

            {/* Controls */}
            <div className="flex flex-col gap-6 mb-12">
                {/* Mode Switcher */}
                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => setMode('solo')}
                        className={`px-6 py-2 rounded-full font-bold transition-all ${mode === 'solo' ? 'bg-cyan-500 text-black' : 'bg-gray-800 text-gray-400'}`}
                    >
                        SOLO MODE
                    </button>
                    <button
                        onClick={() => setMode('couple')}
                        className={`px-6 py-2 rounded-full font-bold transition-all ${mode === 'couple' ? 'bg-magenta-500 text-black' : 'bg-gray-800 text-gray-400'}`}
                    >
                        COUPLE MODE
                    </button>
                </div>

                {/* Category Switcher (Solo Only) */}
                {mode === 'solo' && (
                    <div className="flex justify-center gap-2">
                        {(['STANDARD', 'SPECIAL', 'SPY', 'RECAP'] as const).map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`px-4 py-1 rounded-lg text-sm font-bold tracking-widest transition-all ${category === cat ? 'bg-white/10 text-white border border-white/40' : 'text-gray-600 hover:text-gray-300'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                {mode === 'solo' && category === 'RECAP' && visibleTypes.map((code) => (
                    <div key={code} className="bg-zinc-900/50 p-6 rounded-2xl border border-white/5 space-y-6">
                        <h3 className="text-xl font-bold uppercase tracking-widest text-zinc-500">{code}</h3>
                        <div className="aspect-video bg-black rounded-lg overflow-hidden relative group">
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 z-10">
                                <button
                                    onClick={() => setSelectedArchetype(code)}
                                    className="bg-white text-black px-6 py-2 rounded-full font-black text-xs uppercase"
                                >
                                    Preview Style
                                </button>
                            </div>
                            <div className="w-full h-full flex items-center justify-center text-zinc-700 text-[10px] font-mono">
                                [ {code.toUpperCase()} PREVIEW ]
                            </div>
                        </div>
                    </div>
                ))}

                {mode === 'solo' && category !== 'RECAP' && visibleTypes.map((code) => (
                    <div key={code} className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-500">{code}</h3>
                        <div className="transform scale-90 origin-top">
                            {category === 'SPY' ? (
                                <SpyReportCard
                                    typeCode={code}
                                    spyMetadata={{
                                        origin: "Global_Agency_HQ",
                                        target: "Mars_Project_Sector_X"
                                    }}
                                    reportMessage={voiceTypes[code]?.roast || "Classified report message."}
                                    score={Math.floor(Math.random() * 30) + 70}
                                />
                            ) : (
                                <SoloIdentityCard
                                    mbti={SAMPLE_MBTIS[Math.floor(Math.random() * SAMPLE_MBTIS.length)]}
                                    voiceTypeCode={code}
                                    metrics={generateMockMetrics(code)}
                                    userName="Debug User"
                                />
                            )}
                        </div>
                    </div>
                ))}

                {mode === 'couple' && (
                    <div className="col-span-1 md:col-span-2 lg:col-span-3 space-y-8">
                        <h3 className="text-2xl font-bold text-gray-500">MOCK COUPLE PAIRING</h3>
                        <div className="flex justify-center transform scale-90 origin-top">
                            <DuoIdentityCard
                                userA={duoMock.userA}
                                userB={duoMock.userB}
                                resultId="DEBUG-COUPLE-XYZ"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* Overlay for Mirror Recap */}
            {selectedArchetype && (
                <MirrorRecap
                    userHash="DEBUG_HASH"
                    onClose={() => setSelectedArchetype(null)}
                    archetype={selectedArchetype}
                    demoMode={true}
                />
            )}
        </div>
    );
}

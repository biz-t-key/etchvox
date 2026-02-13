'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import SoloIdentityCard from '@/components/result/SoloIdentityCard';
import DuoIdentityCard from '@/components/result/DuoIdentityCard';
import SpyReportCard from '@/components/result/SpyReportCard';
import MirrorRecap from '@/components/mirror/MirrorRecap';
import { TypeCode, AnalysisMetrics } from '@/lib/types';

// Mock Data
const MOCK_SOLO_METRICS: AnalysisMetrics = {
    pitch: 215,
    speed: 0.65,
    vibe: 0.42,
    tone: 2800,
    humanityScore: 94,
    jitter: 0.012,
    shimmer: 0.08,
    hnr: 22
};

const MOCK_AI_ANALYSIS = `
# Identity Audit: INTJ × The Tech Lead (HFCD)

## 🏷️ Diagnosis: The Silicon Stoic
> *"A high-fidelity algorithm trapped in a human vocal cord. Precision is your primary currency."*

## 👁️ Signal vs. Reality (The Gap)
**The Internal You (INTJ)**: You likely identify as a strategic architect of logic, valuing efficiency above all.
**The External Signal**: However, your voice is broadcasting **"The Tech Lead"**.
**The Verdict**: Your acoustic signature (2800Hz centroid) confirms that your external signal is perfectly synced with your internal logic. There is no leakage of emotional "noise"—you sound as optimized as the systems you build. Socially, this makes you authoritative but potentially intimidating to those running on less efficient "operating systems."

## 🐛 The Social Glitch
**"The Documentation Gap"**
You sound so consistently correct that people are afraid to tell you when you're wrong. This creates a feedback vacuum where others simply nod while failing to keep up with your data-rate.

## 🎛️ Bio-Hack (Your Audio Patch)
- **Current Spec**: You are running at **Presto Speed**.
- **The Fix**: Add a 400ms "latency buffer" after your most critical points. This simulates human processing time and allows your audience to synchronize with your logic.
`;

const MOCK_COUPLE_ANALYSIS = `
# Resonance Report: Alpha & Beta

## 🎬 The Relationship Title: The Control Tower
**"A high-precision partnership built on strategic synchronization."**

## 🎭 The Cast (Vocal Personas)
- **Alpha as "The Efficient Strategist"**: Your voice exhibits high spectral stability and a targeted cadence. You provide the logical backbone of the duo.
- **Beta as "The Charismatic Ideal"**: You balance Alpha's precision with a resonant frequency that projects warmth and authority simultaneously.

## 🔬 The Acoustic Chemistry (Deep Dive)
- **Synchronization (88%)**: You possess a "Telepathic Rhythm." Your waveforms mirror each other with such precision (Sync: 88%) that you often finish each other's sentences via predictive vocal timing.
- **Power Dynamics**: Alpha holds the "Logical Floor" (high competence indicators), while Beta steers the "Emotional Direction" (high warmth/resonance). It is a perfectly balanced audit of authority and empathy.

## 🥂 Tonight's Conversation Menu (Date Night Kit)
1. **The "Volume" Check**: Alpha, ask Beta: "Do I sometimes drown out your ideas without realizing it?"
2. **The "Rhythm" Experiment**: Try swapping roles for 5 minutes. Alpha speaks slowly, Beta speaks fast. How does it feel?
3. **The "Feedback" Loop**: Discuss: Which part of this report made you laugh because it was too true?
`;

const MOCK_SPY_REPORT = `
[CLASSIFICATION: EYES ONLY // DIRECTORATE V7]

■ SUBJECT: ACE_ZERO
■ APPLICATION: HUMINT / Deep Cover
■ CLEARANCE STATUS: GRANTED

■ I. BIO-METRIC INTERROGATION
Subject displays 12% stress leakage. While slightly above baseline, the stability in long-form delivery suggests a high ceiling for physiological repression.

■ II. SYNAPTIC LATENCY CHECK
The 300ms latency profile indicates a heavy but controlled cognitive load. Subject is not reacting; they are selecting the optimal response.

■ III. DEPARTMENTAL FIT EVALUATION
-> Subject requested HUMINT / Deep Cover.
-> [ JUDGEMENT: Approved. Your sociopathic detachment is exemplary. You will be assigned to the Sector-X infiltration team. ]

■ IV. FINAL DISPOSITION
Issue Badge #009. Report to Training Site Gamma for immediate conditioning.
`;

export default function SamplePage() {
    const [showRecapDemo, setShowRecapDemo] = useState(false);

    return (
        <div className="min-h-screen bg-black text-white selection:bg-cyan-500/30">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <Link href="/" className="text-2xl font-black tracking-tighter">
                        <span className="neon-text-cyan">ETCH</span>
                        <span className="neon-text-magenta">VOX</span>
                        <span className="ml-2 text-[10px] text-zinc-500 uppercase tracking-widest italic font-bold">Samples</span>
                    </Link>
                    <Link href="/" className="btn-metallic px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest">
                        Test My Voice
                    </Link>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-6 py-32 space-y-40">
                {/* Intro */}
                <section className="text-center space-y-4 pt-10">
                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase neon-text-cyan">
                        Diagnostic Samples
                    </h1>
                    <p className="text-zinc-500 max-w-2xl mx-auto font-mono text-sm uppercase tracking-widest">
                        Preview the depth of Etchvox intelligence archives. Mocked data for demonstration.
                    </p>
                </section>

                {/* Solo Section */}
                <section className="space-y-12">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-8 bg-cyan-500 rounded-full" />
                        <h2 className="text-2xl font-black uppercase tracking-widest">01 // Solo Identity Report</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        <div className="sticky top-32">
                            <SoloIdentityCard
                                userName="SAMPLE_USER"
                                voiceTypeCode="HFCD"
                                metrics={MOCK_SOLO_METRICS}
                                mbti="INTJ"
                            />
                        </div>
                        <div className="prose prose-invert max-w-none glass p-8 rounded-3xl border border-white/5">
                            <div className="markdown-content">
                                <ReactMarkdown>{MOCK_AI_ANALYSIS}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Couple Section */}
                <section className="space-y-12">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-8 bg-magenta-500 rounded-full" />
                        <h2 className="text-2xl font-black uppercase tracking-widest">02 // Couple Resonance Report</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        <div className="sticky top-32">
                            <DuoIdentityCard
                                userA={{
                                    name: "Alpha",
                                    job: "Architect",
                                    typeCode: 'ELON' as TypeCode,
                                    metrics: MOCK_SOLO_METRICS
                                }}
                                userB={{
                                    name: "Beta",
                                    job: "Strategist",
                                    typeCode: 'HFCC' as TypeCode,
                                    metrics: { ...MOCK_SOLO_METRICS, pitch: 190 }
                                }}
                                resultId="SAMPLE-RESONANCE"
                            />
                        </div>
                        <div className="prose prose-invert max-w-none glass p-8 rounded-3xl border border-white/5">
                            <div className="markdown-content">
                                <ReactMarkdown>{MOCK_COUPLE_ANALYSIS}</ReactMarkdown>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Spy Section */}
                <section className="space-y-12">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-8 bg-red-600 rounded-full" />
                        <h2 className="text-2xl font-black uppercase tracking-widest">03 // Agency Spy Audit</h2>
                    </div>
                    <div className="max-w-md mx-auto transform hover:scale-105 transition-transform duration-500">
                        <SpyReportCard
                            typeCode="HIRED"
                            spyMetadata={{
                                origin: "London_Sector_Q",
                                target: "Global_Resource_Grid"
                            }}
                            reportMessage={MOCK_SPY_REPORT}
                            score={94}
                            isPremium={true}
                        />
                    </div>
                </section>

                {/* Mirror Section */}
                <section className="space-y-12">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-8 bg-yellow-500 rounded-full" />
                        <h2 className="text-2xl font-black uppercase tracking-widest">04 // Voice Mirror Resonance Dossier</h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                        <div className="space-y-8">
                            <div className="glass p-10 rounded-3xl border border-yellow-500/20 space-y-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🪞</div>
                                <div className="space-y-2">
                                    <h3 className="text-sm font-black text-yellow-500 uppercase tracking-widest">Neural Summary: Day 07</h3>
                                    <h2 className="text-3xl font-black italic text-white">The Harmonic Architect</h2>
                                </div>

                                <div className="space-y-6 text-zinc-400 text-sm leading-relaxed">
                                    <p>
                                        Your 7-day resonance cycle reveals a significant shift from <span className="text-white italic">"Static Turbulence"</span> to <span className="text-yellow-500 italic">"Architectural Clarity."</span> By Day 4, the jitter modulation in your lower frequencies stabilized by 18%, correlating with the "Maverick" protocol.
                                    </p>
                                    <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                        <p className="font-mono text-[10px] uppercase text-zinc-500 mb-2">Oracle Prediction:</p>
                                        <p className="text-white italic">"The clarity attained this week is not a fluke; it is a structural reinforcement. In high-stakes negotiation, this tone will be your primary shield."</p>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        onClick={() => setShowRecapDemo(true)}
                                        className="w-full py-4 bg-yellow-500 text-black font-black uppercase text-xs rounded-xl hover:bg-yellow-400 transition-all shadow-lg shadow-yellow-500/10"
                                    >
                                        Play 7-Day Cinematic Recap →
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex flex-col gap-4">
                                <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Biometric Trend (Sample)</h3>
                                <div className="h-48 glass rounded-2xl border border-white/5 flex items-end justify-between p-8 gap-2">
                                    {[65, 72, 68, 85, 82, 89, 94].map((v, i) => (
                                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                            <div
                                                className="w-full bg-gradient-to-t from-yellow-600 to-yellow-400 rounded-t-sm transition-all duration-1000"
                                                style={{ height: `${v}%` }}
                                            />
                                            <span className="text-[8px] font-mono text-zinc-600">D{i + 1}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Average Alignment</div>
                                    <div className="text-2xl font-black text-yellow-500 italic">82.4%</div>
                                </div>
                                <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                                    <div className="text-[10px] text-zinc-500 uppercase font-bold mb-1">Stability Gain</div>
                                    <div className="text-2xl font-black text-cyan-500 italic">+18.2%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {showRecapDemo && (
                <div className="fixed inset-0 z-[100] bg-black">
                    <MirrorRecap
                        userHash="DUMMY_USER"
                        onClose={() => setShowRecapDemo(false)}
                        demoMode={true}
                        archetype="maverick"
                    />
                </div>
            )}

            {/* Footer */}
            <footer className="border-t border-white/5 py-20 text-center">
                <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-black italic">
                    © 2026 Etchvox Archives // Authorized Demo Only
                </p>
            </footer>

            <style jsx global>{`
                .markdown-content h1 { font-size: 1.5rem; font-weight: 900; color: #00f0ff; text-transform: uppercase; margin-bottom: 1.5rem; font-style: italic; }
                .markdown-content h3 { font-size: 0.875rem; font-weight: 800; color: #fff; text-transform: uppercase; margin-top: 1.5rem; letter-spacing: 0.1em; }
                .markdown-content p { font-size: 0.875rem; color: #a1a1aa; line-height: 1.7; }
                .markdown-content strong { color: #fff; }
                .markdown-content blockquote { border-left: 4px solid #00f0ff; padding-left: 1rem; margin: 1.5rem 0; background: rgba(0, 240, 255, 0.05); padding: 1rem; border-radius: 0 0.5rem 0.5rem 0; }
            `}</style>
        </div>
    );
}

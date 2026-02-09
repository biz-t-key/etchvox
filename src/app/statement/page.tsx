'use client';

import Link from 'next/link';

export default function StatementPage() {
    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 selection:bg-cyan-500/30">
            <div className="max-w-4xl mx-auto space-y-24 py-20">

                {/* Hero Section */}
                <div className="space-y-6 text-center md:text-left">
                    <div className="inline-block px-4 py-1 rounded-full border border-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse">
                        🛠️ System Specifications: Etchvox v1.0
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter uppercase leading-[0.9]">
                        Over-Engineering <br />
                        <span className="text-cyan-400 font-black">for a Simple Joke.</span>
                    </h1>
                    <p className="text-gray-500 font-mono text-sm max-w-xl">
                        Because your digital dignity deserves the most unnecessary level of protection ever devised for an AI roast machine.
                    </p>
                </div>

                {/* Section 1 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-white/5">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black italic uppercase tracking-tight text-white">
                            01. Architecture: <br />
                            The "Paranoid" Protocol
                        </h2>
                        <div className="w-12 h-1 bg-cyan-500" />
                    </div>
                    <div className="md:col-span-2 space-y-8 text-gray-400 leading-relaxed font-medium">
                        <p>
                            We are more concerned about your privacy than your parents are. To achieve this, we have deployed a "Full Paranoia" configuration utilizing the pinnacle of modern web technology.
                        </p>
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-2 italic">Client-Side Edge Computing</h4>
                                <p>Every single acoustic analysis loop is executed exclusively within your browser (Edge/Chrome/Safari). It is physically impossible for your raw voice waveform to touch our servers.</p>
                            </div>
                            <div>
                                <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-2 italic">Dual-Stream Processing</h4>
                                <p>We separate the analysis stream from the recording stream. Raw samples used for neural feature extraction are vaporized in your device's RAM the moment the floating-point calculation is complete.</p>
                            </div>
                            <div>
                                <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-2 italic">Zero-Knowledge Architecture</h4>
                                <p>Even the developers cannot hear your voice. The only data we ever see is the "Mathematically Destroyed Vector"—a series of abstract numbers (30D) representing vocal signatures.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 2 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-white/5">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black italic uppercase tracking-tight text-white">
                            02. Audio Analysis: <br />
                            Military-Grade Nonsense
                        </h2>
                        <div className="w-12 h-1 bg-magenta-500" />
                    </div>
                    <div className="md:col-span-2 space-y-8 text-gray-400 leading-relaxed font-medium">
                        <p>
                            We have integrated serious acoustic engineering research just to tell you that you sound like an NPC.
                        </p>
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-2 italic">Spectral Jitter & Shimmer Analysis</h4>
                                <p>Detects micro-tremors in your vocal folds. We expose your lack of confidence and internal hesitations at a resolution of 1/1000th of a second.</p>
                            </div>
                            <div>
                                <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-2 italic">Signal-Gated Energy Classification</h4>
                                <p>Real-time RMS and Zero-Crossing Rate analysis. We distinguish between genuine emotional resonance and environmental background noise with ruthless precision.</p>
                            </div>
                            <div>
                                <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-2 italic">High-Fidelity Neural Downsampling</h4>
                                <p>Based on the Nyquist-Shannon sampling theorem, we strip away ultrasonic artifacts to extract 100% pure "Human Karma" from your acoustic input.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Section 3 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-12 border-t border-white/5">
                    <div className="space-y-4">
                        <h2 className="text-2xl font-black italic uppercase tracking-tight text-white">
                            03. Security: <br />
                            The "Fortress"
                        </h2>
                        <div className="w-12 h-1 bg-yellow-500" />
                    </div>
                    <div className="md:col-span-2 space-y-8 text-gray-400 leading-relaxed font-medium">
                        <p>
                            For the price of a single cup of coffee, we've implemented bank-level security.
                        </p>
                        <div className="space-y-6">
                            <div>
                                <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-2 italic">SHA-256 Hashing</h4>
                                <p>Your identity is irreversibly encrypted. It will not be broken until quantum computers become as common as smartphones.</p>
                            </div>
                            <div>
                                <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-2 italic">Neural Vector Quantization (NVQ)</h4>
                                <p>Vocal features are transformed into 512-dimensional codebook entries. Reconstructing your voice from these numbers is harder than reconstructing a tomato from a bottle of ketchup.</p>
                            </div>
                            <div>
                                <h4 className="text-white font-bold uppercase tracking-widest text-xs mb-2 italic">Ephemeral Passwordless Access</h4>
                                <p>Access keys are delivered via one-time magic links. We store zero bytes of persistent PII (Personal Identifiable Information) on our servers. Your email is an ephemeral ghost.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Closing */}
                <div className="text-center pt-24 space-y-8">
                    <p className="font-mono text-[10px] text-gray-600 uppercase tracking-[0.5em]">
            // No personal data was harmed during the development of this application.
                    </p>
                    <Link
                        href="/"
                        className="inline-block text-cyan-400 font-black text-sm uppercase tracking-widest hover:text-white transition-colors border-b border-cyan-400/30 pb-1"
                    >
                        ← Return to System Home
                    </Link>
                </div>

            </div>
        </div>
    );
}

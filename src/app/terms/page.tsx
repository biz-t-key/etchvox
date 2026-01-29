import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black py-12 px-4 selection:bg-cyan-500/30">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="text-cyan-400 hover:text-cyan-300 mb-8 inline-block transition-colors font-mono text-sm tracking-widest">
                    [ BACK_TO_HOME ]
                </Link>

                <h1 className="text-4xl font-black neon-text-cyan mb-2 uppercase tracking-tighter">Terms of Service</h1>
                <p className="text-gray-500 font-mono text-xs mb-12 uppercase tracking-[0.3em]">Last Protocol Update: January 2026</p>

                <div className="prose prose-invert max-w-none space-y-12">
                    <section>
                        <p className="text-gray-300 leading-relaxed italic border-l-2 border-cyan-500/30 pl-6">
                            Welcome to etchvox.com ("The Service"). By accessing or using The Service, you agree to be bound by these Terms. If you do not agree, please return to your default NPC life immediately. The Service is operated by the EtchVox Project ("The Operator"), based in Tokyo, Japan.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">1. Nature of the Service (Parody & Satire)</h2>
                        <div className="bg-amber-500/10 border-l-4 border-amber-500 p-6 space-y-4">
                            <p className="text-gray-300 text-sm leading-relaxed">
                                This Service uses AI technology to analyze vocal characteristics and generate a "Roast" (satirical critique) based on a fictional personality matrix.
                            </p>
                            <div className="grid gap-4 text-xs">
                                <div className="space-y-1">
                                    <strong className="text-amber-400">01 | PARODY</strong>
                                    <p className="text-gray-400">This Service is a work of satire and parody intended for entertainment purposes only. It is not affiliated with, endorsed by, or associated with any specific public figures, automotive companies, aerospace entities, or government efficiency departments.</p>
                                </div>
                                <div className="space-y-1">
                                    <strong className="text-amber-400">02 | NO LIABILITY FOR EMOTIONAL DAMAGE</strong>
                                    <p className="text-gray-400">The Operator is not liable for any psychological distress, ego collapse, or existential crisis caused by the AI's diagnosis (e.g., being labeled as an "NPC" or "Panic Intern").</p>
                                </div>
                                <div className="space-y-1">
                                    <strong className="text-amber-400">03 | SIMULATION THEORY</strong>
                                    <p className="text-gray-400">References to "Mars," "Simulations," or "Space Exile" are metaphorical. The Operator provides no actual space travel services.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">2. User Conduct</h2>
                        <ul className="text-gray-300 space-y-3 text-sm list-inside list-decimal marker:text-cyan-500 marker:font-bold">
                            <li>Not to use the Service for any illegal purpose.</li>
                            <li>Not to attempt to reverse engineer the "Identity Matrix" algorithms.</li>
                            <li>Not to sue The Operator because you didn't like your test result.</li>
                        </ul>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">3. Donations (Buy Me a Coffee)</h2>
                        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-6">
                            <p className="text-gray-300 text-sm leading-relaxed">
                                Any funds provided via "Buy Me a Coffee" or similar platforms are strictly <strong className="text-cyan-400">voluntary donations (gifts)</strong> to support server costs and coffee consumption.
                            </p>
                            <p className="text-gray-400 text-xs mt-4 leading-relaxed font-mono">
                                No goods, services, or exclusive privileges are purchased beyond the digital convenience of the session. This transaction is framed as community support and does not fall under the Specified Commercial Transactions Act of Japan.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">4. Governing Law & Jurisdiction</h2>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            These Terms are governed by the laws of Japan. Any disputes shall be subject to the exclusive jurisdiction of the Tokyo District Court.
                        </p>
                        <p className="text-gray-500 text-[10px] mt-4 italic">
                            (If you are a Mars resident, you agree to travel to Earth for litigation.)
                        </p>
                    </section>

                    <section className="space-y-4 pt-12 border-t border-white/10 text-center pb-20">
                        <p className="text-gray-500 text-xs uppercase tracking-widest">Questions? Transmission signal here:</p>
                        <a href="mailto:info@etchvox.com" className="text-cyan-500 font-bold hover:text-cyan-400 transition-colors underline decoration-cyan-500/30">
                            INFO@ETCHVOX.COM
                        </a>
                    </section>
                </div>
            </div>
        </div>
    );
}

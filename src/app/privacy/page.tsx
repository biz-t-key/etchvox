import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black py-12 px-4 selection:bg-cyan-500/30 font-sans">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="text-cyan-400 hover:text-cyan-300 mb-8 inline-block transition-colors font-mono text-xs tracking-[0.3em]">
                    [ GO_BACK.EXE ]
                </Link>

                <h1 className="text-4xl font-black neon-text-cyan mb-2 uppercase tracking-tighter">Privacy Policy</h1>
                <p className="text-gray-500 font-mono text-[10px] mb-12 uppercase tracking-[0.4em]">Last Protocol Update: January 2026 (Ref: Simulation v4.02)</p>

                <div className="prose prose-invert max-w-none space-y-12">
                    <section>
                        <p className="text-gray-300 leading-relaxed italic border-l-2 border-cyan-500/30 pl-6 text-sm">
                            We value your privacy more than Mars values oxygen. This policy outlines how we handle your vocal and personal data in the digital archive.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">1. Data Collection: The "Vectorized Soul"</h2>
                        <div className="space-y-4">
                            <ul className="text-gray-300 list-none space-y-4 text-sm">
                                <li className="flex items-start gap-4">
                                    <span className="text-cyan-500 font-mono text-xs mt-1">[01]</span>
                                    <div>
                                        <strong>Voice Data (Processed):</strong>
                                        <p className="text-gray-400 mt-1">We utilize processed vocal metrics for analysis. Raw audio files are temporarily processed to extract a 30-dimensional numerical vector (Pitch, Latency, Dynamic Range, etc.) and are purged within 30 days unless archived via "The Vault" service.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="text-cyan-500 font-mono text-xs mt-1">[02]</span>
                                    <div>
                                        <strong>Result Data:</strong>
                                        <p className="text-gray-400 mt-1">Calculated identity archetypes (e.g., ELON, NPC), MBTI estimates, and demographic markers provided during calibration.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="text-cyan-500 font-mono text-xs mt-1">[03]</span>
                                    <div>
                                        <strong>Metadata:</strong>
                                        <p className="text-gray-400 mt-1">Internal session IDs, device fingerprints (hashed), and timestamps of your last audit.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">2. No Biometric Identification</h2>
                        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-6">
                            <p className="text-gray-300 text-sm leading-relaxed mb-4">
                                The vectors we store are statistical features for entertainment analysis. They constitute **"Anonymized Statistical Data"** and are processed using **Differential Privacy** (mathematical noise) to ensure individual re-identification is technically infeasible.
                            </p>
                            <p className="text-gray-400 text-xs italic">
                                We do not use this data for biometric security verification or secondary identification purposes.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">3. Purpose of Use & Research</h2>
                        <ul className="text-gray-400 text-sm space-y-2 list-disc list-inside marker:text-cyan-500">
                            <li>To generate your roast and diagnostic identity report.</li>
                            <li>To improve the satirical accuracy of the AI models.</li>
                            <li>To research the correlation between vocal patterns and human ambition (R&D).</li>
                        </ul>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">4. Data Sharing & Business Transfer (The "Exit" Clause)</h2>
                        <div className="bg-magenta-500/5 border border-magenta-500/20 rounded-2xl p-6">
                            <p className="text-gray-300 text-sm leading-relaxed">
                                We do not sell your personal data to advertisers. However, **you agree that The Operator may assign or transfer the accumulated statistical database** (including your anonymous vectors and results) to a third party in the event of a merger, acquisition, business transfer, or sale of assets (including a sale to a Mars-based entity).
                            </p>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">5. Cross-Border Data Processing</h2>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Your data is processed and stored on secure infrastructure in the United States and Japan (Vercel, Cloudflare, AWS). By using the service, you consent to this global data residence.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">6. User Rights (Opt-Out)</h2>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            If you wish to delete your footprint from our database, please contact support. We will delete your specific archive row, though your vectors may remain in aggregated, non-identifiable models.
                        </p>
                    </section>

                    <section className="space-y-4 pt-12 border-t border-white/10 text-center pb-20">
                        <p className="text-gray-500 text-[10px] uppercase tracking-widest">Protocol Signal:</p>
                        <a href="mailto:info@etchvox.com" className="text-cyan-500 font-bold hover:text-cyan-400 transition-colors underline decoration-cyan-500/30 text-xs">
                            INFO@ETCHVOX.COM
                        </a>
                    </section>
                </div>
            </div>
        </div>
    );
}

import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black py-12 px-4 selection:bg-cyan-500/30">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="text-cyan-400 hover:text-cyan-300 mb-8 inline-block transition-colors font-mono text-sm tracking-widest">
                    [ BACK_TO_HOME ]
                </Link>

                <h1 className="text-4xl font-black neon-text-cyan mb-2 uppercase tracking-tighter">Privacy Policy</h1>
                <p className="text-gray-500 font-mono text-xs mb-12 uppercase tracking-[0.3em]">Last Protocol Update: January 18, 2026</p>

                <div className="prose prose-invert max-w-none space-y-12">
                    <section>
                        <p className="text-gray-300 leading-relaxed italic border-l-2 border-cyan-500/30 pl-6">
                            EtchVox ("we," "us," or "our") values your vocal identity. This policy outlines how we protect and manage your biometric and personal data in the digital archive.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">1. Information We Collect</h2>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-cyan-400 uppercase tracking-wide">1.1 Biometric & Vocal Data</h3>
                            <ul className="text-gray-300 list-disc list-inside space-y-2 marker:text-cyan-500">
                                <li><strong>Voice Recordings:</strong> High-fidelity audio captured via microphone for biometric resonance mapping.</li>
                                <li><strong>Acoustic Metrics:</strong> Raw data including pitch (Hz), speed, variance (vibe), and spectral centroid (tone).</li>
                                <li><strong>Vocal Fingerprint:</strong> Analyzed type codes (e.g., HFEC) representing your unique vocal identity.</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-cyan-400 uppercase tracking-wide">1.2 Identity & Calibration Attributes</h3>
                            <ul className="text-gray-300 list-disc list-inside space-y-2 marker:text-cyan-500">
                                <li><strong>Vocal Profile:</strong> Gender identity and birth year (used for demographic acoustic normalization).</li>
                                <li><strong>Lifestyle Toxicity:</strong> Self-reported data on nicotine intake, ethanol levels, and sleep efficiency (used for roast calibration).</li>
                                <li><strong>Regional Origin:</strong> Accent/region selection for dialect adjustment.</li>
                                <li><strong>Psychological Profile:</strong> User-provided MBTI types for gap analysis.</li>
                            </ul>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-cyan-400 uppercase tracking-wide">1.3 Digital Authenticity</h3>
                            <ul className="text-gray-300 list-disc list-inside space-y-2 marker:text-cyan-500">
                                <li>Email address (linked to Buy Me a Coffee support for vault synchronization).</li>
                                <li>Transaction IDs and payment metadata processed via Buy Me a Coffee.</li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">2. Data Usage & Research</h2>
                        <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-6">
                            <h4 className="text-cyan-400 font-bold uppercase tracking-widest text-xs mb-3">🔬 AI Optimization & Commercial Research</h4>
                            <p className="text-gray-400 text-sm leading-relaxed">
                                We utilize processed vocal metrics to improve our algorithms and create anonymized, aggregated insights for commercial and research purposes. All data used for these purposes is stripped of Personally Identifiable Information (PII) and cannot be traced back to an individual.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">3. Data Retention & The Vault</h2>
                        <ul className="text-gray-400 space-y-4 text-sm">
                            <li className="flex gap-4">
                                <span className="text-cyan-500 font-mono">[01]</span>
                                <span><strong>Temporary Recordings:</strong> Standard voice samples are purged from active cache after 30 days unless stored in a secure Vault.</span>
                            </li>
                            <li className="flex gap-4">
                                <span className="text-cyan-500 font-mono">[02]</span>
                                <span><strong>Vault Diagnostics:</strong> Premium diagnostic results and AI reports are retained to allow for cross-session evolution tracking.</span>
                            </li>
                            <li className="flex gap-4">
                                <span className="text-cyan-500 font-mono">[03]</span>
                                <span><strong>Anonymized Metrics:</strong> Mathematical vectors derived from voice analysis may be retained for algorithm optimization and research.</span>
                            </li>
                        </ul>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">4. Your Sovereignty (Archive & Deletion)</h2>
                        <p className="text-gray-300 leading-relaxed text-sm">
                            EtchVox is restricted to users 13 years of age or older. By using the service, you confirm you meet this requirement.
                        </p>
                        <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                            <p className="text-sm text-gray-300 underline underline-offset-4 decoration-cyan-500/50 mb-3">Archival Protocol:</p>
                            <p className="text-[11px] text-gray-500 leading-relaxed uppercase tracking-wider">
                                Users can archive diagnostic records from their "Vault" to hide them from view. For permanent account or record deletion requests compliant with GDPR/CCPA, please contact support at info@etchvox.com. Anonymized acoustic vectors may be retained for system optimization.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-4 pt-12 border-t border-white/10 text-center pb-20">
                        <p className="text-gray-500 text-xs uppercase tracking-widest">For deep-level privacy inquiries:</p>
                        <a href="mailto:info@etchvox.com" className="text-cyan-500 font-bold hover:text-cyan-400 transition-colors underline decoration-cyan-500/30">
                            INFO@ETCHVOX.COM
                        </a>
                    </section>
                </div>
            </div>
        </div>
    );
}

import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black py-12 px-4 selection:bg-cyan-500/30 font-sans">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="text-cyan-400 hover:text-cyan-300 mb-8 inline-block transition-colors font-mono text-xs tracking-[0.3em]">
                    [ GO_BACK.EXE ]
                </Link>

                <h1 className="text-4xl font-black neon-text-cyan mb-2 uppercase tracking-tighter">Privacy Policy</h1>
                <p className="text-gray-500 font-mono text-[10px] mb-12 uppercase tracking-[0.4em]">Last Protocol Update: February 2026 (Ref: Privacy v5.0)</p>

                <div className="prose prose-invert max-w-none space-y-12">
                    <section>
                        <p className="text-gray-300 leading-relaxed italic border-l-2 border-cyan-500/30 pl-6 text-sm">
                            We value your privacy. This policy outlines how we handle your vocal and personal data across all Etchvox services.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">1. Data Collection: What We Collect</h2>
                        <div className="space-y-4">
                            <ul className="text-gray-300 list-none space-y-4 text-sm">
                                <li className="flex items-start gap-4">
                                    <span className="text-cyan-500 font-mono text-xs mt-1">[01]</span>
                                    <div>
                                        <strong>Voice Data (Processed):</strong>
                                        <p className="text-gray-400 mt-1">We extract acoustic metrics (pitch, speed, volume, tone) from your voice recordings to generate personality analysis. For Solo/Couple modes, raw audio is processed client-side and discarded after analysis. For Voice Mirror, audio is stored locally in your browser's IndexedDB and never uploaded to our servers.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="text-cyan-500 font-mono text-xs mt-1">[02]</span>
                                    <div>
                                        <strong>Result Data:</strong>
                                        <p className="text-gray-400 mt-1">Calculated personality types, compatibility scores, Voice Mirror analysis logs (Alignment Scores, Oracle predictions, user-selected tags), and archetypal identity selections (Optimizer, Stoic, Alchemist, Cinematic Grit).</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="text-cyan-500 font-mono text-xs mt-1">[03]</span>
                                    <div>
                                        <strong>Payment & Subscription Data:</strong>
                                        <p className="text-gray-400 mt-1">Transaction records, subscription status, and billing information processed through Lemon Squeezy (our payment processor). We do not store credit card information on our servers.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-4">
                                    <span className="text-cyan-500 font-mono text-xs mt-1">[04]</span>
                                    <div>
                                        <strong>Metadata:</strong>
                                        <p className="text-gray-400 mt-1">Session IDs, anonymized device fingerprints (SHA-256 hashed), timestamps, browser type, and IP addresses (for security and fraud prevention only).</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">2. Voice Mirror: Browser-Only Storage</h2>
                        <div className="bg-cyan-500/10 border-l-4 border-cyan-500 p-6 space-y-4">
                            <p className="text-gray-300 text-sm leading-relaxed">
                                <strong className="text-cyan-400">All Voice Mirror data is stored exclusively in your browser.</strong> Audio recordings are saved to IndexedDB, and analysis logs are stored in localStorage. This data never leaves your device.
                            </p>
                            <div className="space-y-2 text-xs text-gray-400">
                                <p>• <strong className="text-cyan-300">Audio Storage:</strong> IndexedDB (voiceMirrorDB) - up to 7 days of recordings</p>
                                <p>• <strong className="text-cyan-300">Log Storage:</strong> localStorage (mirrorLogs) - Z-Scores, tags, Alignment Scores</p>
                                <p>• <strong className="text-cyan-300">Data Loss:</strong> Clearing browser data or switching devices will permanently delete your Voice Mirror history</p>
                                <p>• <strong className="text-cyan-300">No Server Sync:</strong> We intentionally do not backup or sync your voice data to any cloud server</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">3. No Biometric Identification</h2>
                        <div className="bg-amber-500/10 border-l-4 border-amber-500 p-6">
                            <p className="text-gray-300 text-sm leading-relaxed mb-4">
                                The acoustic features we extract are statistical metrics for entertainment and educational analysis. They constitute <strong className="text-amber-400">\"Anonymized Statistical Data\"</strong> and are processed using <strong className="text-amber-400">Differential Privacy</strong> (mathematical noise) to ensure individual re-identification is technically infeasible.
                            </p>
                            <p className="text-gray-400 text-xs italic">
                                We do not use this data for biometric security verification, facial recognition linkage, or secondary identification purposes.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">4. Purpose of Use</h2>
                        <ul className="text-gray-400 text-sm space-y-2 list-disc list-inside marker:text-cyan-500">
                            <li>To generate your personality analysis, compatibility reports, or Voice Mirror training feedback.</li>
                            <li>To improve the accuracy of AI models and archetypal frameworks.</li>
                            <li>To process payments and manage subscriptions through Lemon Squeezy.</li>
                            <li>To research correlations between vocal patterns and personality traits for R&D purposes (aggregated data only).</li>
                            <li>To prevent fraud and ensure service security.</li>
                        </ul>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">5. Data Sharing & Third Parties</h2>
                        <p className="text-gray-300 text-sm leading-relaxed mb-4">
                            We do not sell your personal data to advertisers or data brokers. However, we share limited data with the following third parties for operational purposes:
                        </p>
                        <ul className="text-gray-400 text-sm space-y-2 list-disc list-inside marker:text-cyan-500">
                            <li><strong className="text-white">Lemon Squeezy</strong> - Payment processing, subscription management</li>
                            <li><strong className="text-white">Firebase (Google)</strong> - Cloud database for Solo/Couple analysis results (optional fallback)</li>
                            <li><strong className="text-white">Vercel</strong> - Hosting infrastructure</li>
                        </ul>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">6. Business Transfer (\"Exit\" Clause)</h2>
                        <div className="bg-magenta-500/5 border border-magenta-500/20 rounded-2xl p-6">
                            <p className="text-gray-300 text-sm leading-relaxed">
                                You agree that The Operator may assign or transfer the accumulated statistical database (including anonymized acoustic vectors and aggregated results) to a third party in the event of a merger, acquisition, business transfer, or sale of assets. Your individually identifiable voice recordings (Voice Mirror audio in browser) will not be included in such transfers.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">7. Cross-Border Data Processing</h2>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            Your data is processed and stored on secure infrastructure in the United States and Japan (Vercel, Firebase, Lemon Squeezy). By using the service, you consent to this global data residence.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">8. User Rights (GDPR & CCPA Compliance)</h2>
                        <p className="text-gray-300 text-sm leading-relaxed mb-4">
                            You have the right to:
                        </p>
                        <ul className="text-gray-400 text-sm space-y-2 list-disc list-inside marker:text-cyan-500">
                            <li><strong className="text-white">Access:</strong> Request a copy of your stored data (Solo/Couple results in Firebase)</li>
                            <li><strong className="text-white">Deletion:</strong> Request deletion of your specific data records from our database</li>
                            <li><strong className="text-white">Correction:</strong> Request correction of inaccurate personally identifiable information</li>
                            <li><strong className="text-white">Opt-Out:</strong> Withdraw consent for data processing (note: this may disable certain features)</li>
                        </ul>
                        <p className="text-gray-500 text-xs mt-4 italic">
                            For Voice Mirror: Since all data is browser-local, you can delete it at any time via browser settings (Clear browsing data → Cookies and site data / Local storage).
                        </p>
                        <p className="text-gray-400 text-sm mt-4">
                            To exercise these rights, contact us at: <a href="mailto:info@etchvox.com" className="text-cyan-500 underline">info@etchvox.com</a>
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">9. Data Retention</h2>
                        <ul className="text-gray-400 text-sm space-y-2 list-disc list-inside marker:text-cyan-500">
                            <li><strong className="text-white">Voice Mirror:</strong> Indefinite (browser-local, user-controlled)</li>
                            <li><strong className="text-white">Solo/Couple Results:</strong> 2 years from last access (Firebase)</li>
                            <li><strong className="text-white">Payment Records:</strong> 7 years (legal compliance, Lemon Squeezy)</li>
                            <li><strong className="text-white">Aggregated Analytics:</strong> Indefinite (anonymized, research purposes)</li>
                        </ul>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">10. Security Measures</h2>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            We employ industry-standard security practices including HTTPS encryption, SHA-256 hashing for device identifiers, secure payment processing (PCI DSS compliant via Lemon Squeezy), and regular security audits. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">11. Children's Privacy</h2>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            The Service is not intended for users under the age of 18. We do not knowingly collect personal information from children. If you become aware that a child has provided us with personal information, please contact us immediately.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">12. Changes to This Policy</h2>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            We may update this Privacy Policy from time to time. Material changes will be communicated via the Service or email (if provided). Continued use after such changes constitutes acceptance of the updated policy.
                        </p>
                    </section>

                    <section className="space-y-4 pt-12 border-t border-white/10 text-center pb-20">
                        <p className="text-gray-500 text-[10px] uppercase tracking-widest">Privacy Inquiries:</p>
                        <a href="mailto:info@etchvox.com" className="text-cyan-500 font-bold hover:text-cyan-400 transition-colors underline decoration-cyan-500/30 text-xs">
                            INFO@ETCHVOX.COM
                        </a>
                    </section>
                </div>
            </div>
        </div>
    );
}

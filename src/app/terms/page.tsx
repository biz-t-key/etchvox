import Link from 'next/link';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-black py-12 px-4 selection:bg-cyan-500/30">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="text-cyan-400 hover:text-cyan-300 mb-8 inline-block transition-colors font-mono text-sm tracking-widest">
                    [ BACK_TO_HOME ]
                </Link>

                <h1 className="text-4xl font-black neon-text-cyan mb-2 uppercase tracking-tighter">Terms of Service</h1>
                <p className="text-gray-500 font-mono text-xs mb-12 uppercase tracking-[0.3em]">Last Protocol Update: February 2026</p>

                <div className="prose prose-invert max-w-none space-y-12">
                    <section>
                        <p className="text-gray-300 leading-relaxed italic border-l-2 border-cyan-500/30 pl-6">
                            Welcome to etchvox.com ("The Service"). By accessing or using The Service, you agree to be bound by these Terms. If you do not agree, please discontinue use immediately. The Service is operated by Etchvox ("The Operator"), based in Tokyo, Japan.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">1. Service Description</h2>
                        <div className="space-y-4 text-sm text-gray-300">
                            <p>Etchvox provides three distinct AI-powered voice analysis services:</p>
                            <ul className="space-y-3 list-none ml-4">
                                <li className="flex items-start gap-3">
                                    <span className="text-cyan-400 font-mono">01</span>
                                    <div>
                                        <strong className="text-white">Voice Mirror (Subscription):</strong> A 7-day voice training program with daily reading exercises, AI-guided analysis, and video export capabilities. Requires an active weekly or monthly subscription.
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-cyan-400 font-mono">02</span>
                                    <div>
                                        <strong className="text-white">Solo Analysis (Pay-per-Use):</strong> One-time voice personality analysis based on a 16-type classification system with AI-generated insights.
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <span className="text-cyan-400 font-mono">03</span>
                                    <div>
                                        <strong className="text-white">Couple Mode (Pay-per-Use):</strong> Voice compatibility analysis for two individuals with relationship dynamics insights.
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">2. Entertainment & Educational Purposes Only</h2>
                        <div className="bg-amber-500/10 border-l-4 border-amber-500 p-6 space-y-4">
                            <p className="text-gray-300 text-sm leading-relaxed">
                                This Service uses AI technology to analyze vocal characteristics and generate personality insights, compatibility reports, and training feedback. <strong className="text-amber-400">All results are for entertainment and educational purposes only.</strong>
                            </p>
                            <div className="grid gap-4 text-xs">
                                <div className="space-y-1">
                                    <strong className="text-amber-400">NOT MEDICAL ADVICE</strong>
                                    <p className="text-gray-400">The Service does not provide medical, psychological, or professional diagnostic services. Results should not be used as the basis for any medical, career, or relationship decisions.</p>
                                </div>
                                <div className="space-y-1">
                                    <strong className="text-amber-400">NO LIABILITY FOR EMOTIONAL IMPACT</strong>
                                    <p className="text-gray-400">The Operator is not liable for any psychological distress, ego-related concerns, or emotional reactions caused by AI-generated feedback (e.g., being assigned a particular personality type or receiving critical insights).</p>
                                </div>
                                <div className="space-y-1">
                                    <strong className="text-amber-400">SATIRE & PARODY ELEMENTS</strong>
                                    <p className="text-gray-400">Certain features (e.g., "Spy Mode," personality roasts) are satirical in nature and intended for comedic entertainment.</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">3. Subscription Terms (Voice Mirror)</h2>
                        <div className="space-y-4 text-sm text-gray-300">
                            <div className="space-y-2">
                                <strong className="text-white text-base">3.1 Subscription Plans</strong>
                                <ul className="list-disc list-inside marker:text-cyan-500 space-y-1 ml-4">
                                    <li>Weekly Plan: $10 USD per week, auto-renews every 7 days</li>
                                    <li>Monthly Plan: $30 USD per month, auto-renews every 30 days</li>
                                </ul>
                            </div>
                            <div className="space-y-2">
                                <strong className="text-white text-base">3.2 Auto-Renewal</strong>
                                <p>Subscriptions automatically renew unless canceled at least 24 hours before the end of the current billing period. You may cancel at any time through the Lemon Squeezy customer portal.</p>
                            </div>
                            <div className="space-y-2">
                                <strong className="text-white text-base">3.3 Refund Policy</strong>
                                <p>All subscription payments are non-refundable. If you cancel your subscription, you will retain access until the end of your current billing period.</p>
                            </div>
                            <div className="space-y-2">
                                <strong className="text-white text-base">3.4 Data Persistence</strong>
                                <p>Voice Mirror data (audio recordings, analysis logs) is stored locally in your browser (IndexedDB). If you clear your browser data or switch devices, your Voice Mirror history will be lost. The Operator does not maintain server-side backups of your voice data.</p>
                            </div>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">4. One-Time Purchase Terms (Solo / Couple / Spy)</h2>
                        <div className="space-y-4 text-sm text-gray-300">
                            <p>Solo Analysis ($10), Couple Analysis ($15), and Spy Mode ($10) are one-time purchases processed through Lemon Squeezy. Payments are non-refundable once the full analysis report is unlocked.</p>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">5. User Conduct</h2>
                        <p className="text-gray-300 text-sm">You agree:</p>
                        <ul className="text-gray-300 space-y-3 text-sm list-inside list-decimal marker:text-cyan-500 marker:font-bold">
                            <li>Not to use the Service for any illegal purpose.</li>
                            <li>Not to attempt to reverse engineer the AI analysis algorithms.</li>
                            <li>Not to share subscription access or analysis results in ways that violate intellectual property rights.</li>
                            <li>Not to upload audio that contains hate speech, threats, or unlawful content.</li>
                        </ul>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">6. Intellectual Property</h2>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            All content, including but not limited to AI-generated roasts, personality frameworks, visual designs, and archetypal themes, is the proprietary property of Etchvox. You may download your personal analysis results for private use, but may not redistribute, sell, or publicly display them without permission.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">7. Limitation of Liability</h2>
                        <div className="bg-magenta-500/10 border-l-4 border-magenta-500 p-6">
                            <p className="text-gray-300 text-sm leading-relaxed">
                                <strong className="text-magenta-400">DISCLAIMER:</strong> The Service is provided \"AS IS\" without warranties of any kind. The Operator shall not be liable for any direct, indirect, incidental, or consequential damages arising from the use or inability to use the Service, including but not limited to data loss, browser storage limitations, or subscription billing issues.
                            </p>
                        </div>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">8. Governing Law & Jurisdiction</h2>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            These Terms are governed by the laws of Japan. Any disputes shall be subject to the exclusive jurisdiction of the Tokyo District Court.
                        </p>
                    </section>

                    <section className="space-y-6">
                        <h2 className="text-2xl font-bold text-white uppercase tracking-wider border-b border-white/10 pb-2">9. Changes to Terms</h2>
                        <p className="text-gray-300 text-sm leading-relaxed">
                            The Operator reserves the right to modify these Terms at any time. Continued use of the Service after such changes constitutes acceptance of the new Terms. Material changes will be communicated via the Service or email (if provided).
                        </p>
                    </section>

                    <section className="space-y-4 pt-12 border-t border-white/10 text-center pb-20">
                        <p className="text-gray-500 text-xs uppercase tracking-widest">Questions? Contact us:</p>
                        <a href="mailto:info@etchvox.com" className="text-cyan-500 font-bold hover:text-cyan-400 transition-colors underline decoration-cyan-500/30">
                            INFO@ETCHVOX.COM
                        </a>
                    </section>
                </div>
            </div>
        </div>
    );
}

import Link from 'next/link';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-black py-12 px-4">
            <div className="max-w-3xl mx-auto">
                <Link href="/" className="text-cyan-400 hover:text-cyan-300 mb-8 inline-block">
                    ← Back to Home
                </Link>

                <h1 className="text-3xl font-bold neon-text-cyan mb-2">Privacy Policy</h1>
                <p className="text-gray-500 text-sm mb-8">Last Updated: January 14, 2026</p>

                <div className="prose prose-invert max-w-none space-y-6">
                    <p className="text-gray-300">
                        Your privacy is important to us. This Privacy Policy explains how EtchVox ("we," "us," or "our")
                        collects, uses, and protects your information.
                    </p>

                    <h2 className="text-xl font-bold text-cyan-400 mt-8 mb-4">1. Information We Collect</h2>

                    <h3 className="text-lg font-semibold text-white mt-6 mb-3">1.1 Audio Data</h3>
                    <ul className="text-gray-300 list-disc list-inside space-y-2">
                        <li><strong>Voice Recordings:</strong> Audio data captured through your device's microphone during the voice analysis test</li>
                        <li><strong>Analysis Results:</strong> Diagnostic results generated from processing your voice data</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-white mt-6 mb-3">1.2 Personal Information</h3>
                    <ul className="text-gray-300 list-disc list-inside space-y-2">
                        <li>Email address (for delivering results, if provided)</li>
                        <li>Payment information (processed securely by Stripe)</li>
                        <li>Accent/region selection (for analysis calibration)</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-white mt-6 mb-3">1.3 Usage Data</h3>
                    <ul className="text-gray-300 list-disc list-inside space-y-2">
                        <li>IP address and approximate location</li>
                        <li>Browser type and device information</li>
                        <li>Access timestamps and session data</li>
                    </ul>

                    <h2 className="text-xl font-bold text-cyan-400 mt-8 mb-4">2. How We Use Your Data</h2>
                    <div className="bg-cyan-500/10 border-l-4 border-cyan-500 p-4 my-4">
                        <strong className="text-cyan-400">🔬 RESEARCH & DEVELOPMENT NOTICE</strong>
                        <p className="text-gray-400 mt-2">
                            We may de-identify and anonymize your voice data to train our AI models, conduct long-term research
                            on voice characteristics, and improve the accuracy of our services. <strong>Anonymized data will not
                                be linked back to your personal identity.</strong>
                        </p>
                    </div>

                    <table className="w-full text-sm my-6 border border-gray-700 rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-gray-800">
                                <th className="text-left py-3 px-4 text-cyan-400 font-semibold">Purpose</th>
                                <th className="text-left py-3 px-4 text-cyan-400 font-semibold">Description</th>
                            </tr>
                        </thead>
                        <tbody className="text-gray-300">
                            <tr className="border-b border-gray-800">
                                <td className="py-3 px-4">Service Delivery</td>
                                <td className="py-3 px-4">To provide voice analysis and generate your results</td>
                            </tr>
                            <tr className="border-b border-gray-800">
                                <td className="py-3 px-4">Payment Processing</td>
                                <td className="py-3 px-4">To process premium feature purchases via Stripe</td>
                            </tr>
                            <tr className="border-b border-gray-800">
                                <td className="py-3 px-4">Machine Learning</td>
                                <td className="py-3 px-4">To train and enhance our algorithms using de-identified data</td>
                            </tr>
                            <tr>
                                <td className="py-3 px-4">Analytics</td>
                                <td className="py-3 px-4">To understand usage patterns and improve our service</td>
                            </tr>
                        </tbody>
                    </table>

                    <h2 className="text-xl font-bold text-cyan-400 mt-8 mb-4">3. Data Sharing</h2>
                    <p className="text-gray-300 mb-4">
                        We do not sell your personal data to third parties. We share data only with trusted service providers:
                    </p>
                    <ul className="text-gray-300 list-disc list-inside space-y-2">
                        <li><strong>Payment Processors:</strong> Stripe (for secure payment processing)</li>
                        <li><strong>Cloud Infrastructure:</strong> Google Cloud / Firebase (for data storage)</li>
                        <li><strong>Legal Compliance:</strong> We may disclose information if required by law</li>
                    </ul>

                    <h2 className="text-xl font-bold text-cyan-400 mt-8 mb-4">4. Data Retention</h2>
                    <ul className="text-gray-300 list-disc list-inside space-y-2">
                        <li><strong>Voice Recordings:</strong> Deleted after 30 days, or retained indefinitely if user consents for ML training</li>
                        <li><strong>Analysis Results:</strong> Retained as long as the permalink is active</li>
                        <li><strong>Technical Data:</strong> Up to 24 months</li>
                    </ul>

                    <h2 className="text-xl font-bold text-cyan-400 mt-8 mb-4">5. International Data Transfer</h2>
                    <p className="text-gray-300">
                        EtchVox is operated from Japan. By using our service, you acknowledge that your information may
                        be transferred to and processed in Japan or other countries where our servers are located.
                    </p>

                    <h2 className="text-xl font-bold text-cyan-400 mt-8 mb-4">6. Your Rights</h2>
                    <p className="text-gray-300">
                        Depending on your location (GDPR, CCPA), you may have rights to access, correct, or delete your
                        personal data. Note that de-identified data used for machine learning cannot be retrieved or deleted.
                        To exercise your rights, contact us.
                    </p>

                    <h2 className="text-xl font-bold text-cyan-400 mt-8 mb-4">7. Children's Privacy</h2>
                    <p className="text-gray-300">
                        The Service is not intended for children under 13 years of age. We do not knowingly collect personal
                        information from children.
                    </p>

                    <h2 className="text-xl font-bold text-cyan-400 mt-8 mb-4">8. Contact</h2>
                    <p className="text-gray-300">
                        Privacy inquiries: <a href="mailto:privacy@etchvox.ai" className="text-cyan-400 hover:underline">privacy@etchvox.ai</a>
                    </p>
                </div>
            </div>
        </div>
    );
}

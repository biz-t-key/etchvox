interface VaultDownloadSectionProps {
    audioUrl: string;
    resultId: string;
    createdAt: string;
}

export default function VaultDownloadSection({ audioUrl, resultId, createdAt }: VaultDownloadSectionProps) {
    return (
        <div className="bg-gradient-to-br from-green-500/10 to-cyan-500/10 border border-green-500/30 rounded-xl p-6 mb-6">
            <div className="text-center mb-4">
                <div className="text-4xl mb-2">✅</div>
                <h3 className="text-xl font-bold text-green-400 mb-2">
                    Vault Activated
                </h3>
                <p className="text-sm text-gray-300">
                    Your voice is preserved forever. A digital amber of "Today's You."
                </p>
            </div>

            <div className="glass rounded-lg p-4 mb-4 bg-black/50">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <div className="font-semibold text-white">Raw Audio File</div>
                        <div className="text-xs text-gray-500">Format: WebM • Quality: 48kHz Studio</div>
                    </div>
                    <div className="text-2xl">💎</div>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                    <div>• 🎙️ Captured at 48kHz (studio quality)</div>
                    <div>• 🌬️ Includes breath, echo, and room tone</div>
                    <div>• ☕ Even that coffee shop ambience in the background</div>
                    <div>• 💎 Zero post-processing. Your authentic voice, frozen in time.</div>
                </div>
            </div>

            <a
                href={audioUrl}
                download={`etchvox_${resultId}.webm`}
                className="block w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-full text-center transition-all transform hover:scale-105"
            >
                📥 Download Digital Amber
            </a>

            <p className="text-center text-gray-500 text-xs mt-3">
                Recorded: {new Date(createdAt).toLocaleDateString()} — You will never sound like this again.
            </p>
        </div>
    );
}

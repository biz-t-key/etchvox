'use client';

import { useState } from 'react';

interface ShareButtonsProps {
    resultId: string;
    typeName: string;
    typeIcon: string;
    catchphrase: string;
    typeCode: string;
}

export default function ShareButtons({ resultId, typeName, typeIcon, catchphrase, typeCode }: ShareButtonsProps) {
    const [copied, setCopied] = useState<'bio' | 'link' | null>(null);

    const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : 'https://etchvox.ai';

    const shareUrl = `${baseUrl}/result/${resultId}`;

    const bioText = `${typeIcon} ${typeName.toUpperCase()}\n"${catchphrase}"`;

    const fullShareText = `I just discovered I'm ${typeIcon} ${typeName.toUpperCase()}! "${catchphrase}" What's YOUR voice type? #EtchVox`;

    const copyToClipboard = async (text: string, type: 'bio' | 'link') => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
        } catch (err) {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            setCopied(type);
            setTimeout(() => setCopied(null), 2000);
        }
    };

    const shareToTwitter = () => {
        const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(fullShareText)}&url=${encodeURIComponent(shareUrl)}`;
        window.open(url, '_blank', 'width=550,height=420');
    };

    return (
        <div className="glass rounded-xl p-6">
            {/* Tagline */}
            <p className="text-center text-gray-400 text-sm mb-4 italic">
                ✨ Perfect for your Bio, Slack status, or just to warn people.
            </p>

            {/* Bio Copy Box */}
            <div className="bg-black/50 rounded-lg p-4 mb-4 relative">
                <pre className="text-sm whitespace-pre-wrap text-gray-300 mono">
                    {bioText}
                </pre>
                <button
                    onClick={() => copyToClipboard(bioText, 'bio')}
                    className="absolute top-2 right-2 px-3 py-1 text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded transition-colors"
                >
                    {copied === 'bio' ? '✓ Copied!' : '📋 Copy'}
                </button>
            </div>

            {/* Share Title */}
            <div className="text-center text-xs text-gray-500 mb-4 mono">
                ────── SHARE YOUR VOICE ID ──────
            </div>

            {/* Social Buttons */}
            <div className="flex justify-center gap-4 mb-4">
                <button
                    onClick={() => {
                        // Instagram: Can't directly share, open profile
                        alert('Save the result image and share it on Instagram Stories!');
                    }}
                    className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                    <span className="text-2xl">📸</span>
                    <span className="text-xs text-gray-400">Instagram</span>
                </button>

                <button
                    onClick={shareToTwitter}
                    className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                    <span className="text-2xl">𝕏</span>
                    <span className="text-xs text-gray-400">Twitter/X</span>
                </button>

                <button
                    onClick={() => {
                        // TikTok: Can't directly share
                        alert('Save the result video (Premium) and share it on TikTok!');
                    }}
                    className="flex flex-col items-center gap-1 p-3 rounded-lg hover:bg-white/5 transition-colors"
                >
                    <span className="text-2xl">🎵</span>
                    <span className="text-xs text-gray-400">TikTok</span>
                </button>
            </div>

            {/* Link Copy */}
            <div className="flex items-center gap-2 bg-black/50 rounded-lg p-3">
                <span className="text-gray-500">🔗</span>
                <span className="flex-1 text-sm mono text-gray-400 truncate">
                    {shareUrl.replace('https://', '')}
                </span>
                <button
                    onClick={() => copyToClipboard(shareUrl, 'link')}
                    className="px-3 py-1 text-xs bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded transition-colors whitespace-nowrap"
                >
                    {copied === 'link' ? '✓ Copied!' : 'Copy Link'}
                </button>
            </div>
        </div>
    );
}

'use client';

import { useState, useEffect } from 'react';

interface ShareButtonsProps {
    resultId: string;
    typeName: string;
    typeIcon: string;
    catchphrase: string;
    typeCode: string;
    cardImageUrl?: string | null; // Added for sharing
}

export default function ShareButtons({ resultId, typeName, typeIcon, catchphrase, typeCode, cardImageUrl }: ShareButtonsProps) {
    const [copied, setCopied] = useState<'bio' | 'link' | null>(null);
    const [canShare, setCanShare] = useState(false);

    // Check for Web Share API support on mount
    useEffect(() => {
        // Safe check for navigator.share existence
        if (typeof navigator !== 'undefined' && !!navigator.share) {
            setCanShare(true);
        }
    }, []);

    const baseUrl = typeof window !== 'undefined'
        ? window.location.origin
        : 'https://etchvox.ai';

    const shareUrl = `${baseUrl}/result/${resultId}`;

    const bioText = `${typeIcon} ${typeName.toUpperCase()}\n"${catchphrase}"\n#etchvox @etchvox`;

    const fullShareText = `I just discovered I'm ${typeIcon} ${typeName.toUpperCase()}! "${catchphrase}" What's YOUR voice type? #etchvox @etchvox`;

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
            {/* Bio Copy Section */}
            <div className="mb-10">
                <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-cyan-400">
                        📋 Copy To Bio
                    </span>
                    <span className="text-[9px] text-gray-500 italic opacity-80">
                        Perfect for Bio, Slack, or just to warn people
                    </span>
                </div>

                <div className="bg-black/50 rounded-2xl p-5 relative border border-white/5 group hover:border-cyan-500/20 transition-colors">
                    <pre className="text-xs whitespace-pre-wrap text-gray-300 mono leading-relaxed">
                        {bioText}
                    </pre>
                    <button
                        onClick={() => copyToClipboard(bioText, 'bio')}
                        className="absolute top-3 right-3 px-3 py-1.5 text-[9px] bg-cyan-500/10 hover:bg-cyan-500 text-cyan-400 hover:text-black rounded-lg transition-all uppercase font-black tracking-widest"
                    >
                        {copied === 'bio' ? '✓ Copied' : 'Copy'}
                    </button>
                </div>
            </div>

            {/* Share Title with lines */}
            <div className="flex items-center gap-4 mb-8 opacity-40">
                <div className="h-px flex-grow bg-white/10" />
                <span className="text-[8px] font-black uppercase tracking-[0.5em] whitespace-nowrap">Broadcast Protocol</span>
                <div className="h-px flex-grow bg-white/10" />
            </div>

            {/* Social Buttons - Enhanced Size */}
            <div className="flex justify-center gap-6 mb-6">
                <button
                    onClick={() => {
                        // Instagram: Can't directly share, open profile
                        alert('Save the result image and share it on Instagram Stories!');
                    }}
                    className="share-btn flex flex-col items-center justify-center text-center gap-2 p-4 rounded-xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 hover:from-purple-500/20 hover:to-pink-500/20 border border-pink-500/20 hover:border-pink-500/40 transition-all"
                >
                    <span className="text-4xl">📸</span>
                    <span className="text-sm font-bold text-gray-200">Instagram</span>
                </button>

                <button
                    onClick={shareToTwitter}
                    className="share-btn flex flex-col items-center justify-center text-center gap-2 p-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 hover:border-cyan-500/40 transition-all"
                >
                    <span className="text-4xl">𝕏</span>
                    <span className="text-sm font-bold text-gray-200">Twitter/X</span>
                </button>

                <button
                    onClick={() => {
                        // TikTok: Can't directly share
                        alert('Save the result video (Premium) and share it on TikTok!');
                    }}
                    className="share-btn flex flex-col items-center justify-center text-center gap-2 p-4 rounded-xl bg-gradient-to-br from-cyan-500/10 to-magenta-500/10 hover:from-cyan-500/20 hover:to-magenta-500/20 border border-magenta-500/20 hover:border-magenta-500/40 transition-all"
                >
                    <span className="text-4xl">🎵</span>
                    <span className="text-sm font-bold text-gray-200">TikTok</span>
                </button>

                {/* Web Share (if supported) */}
                {canShare && (
                    <button
                        onClick={async () => {
                            try {
                                const shareData: ShareData = {
                                    title: 'My EtchVox Voice ID',
                                    text: fullShareText,
                                    url: shareUrl,
                                };

                                // If we have an image, try to share it as a file
                                if (cardImageUrl) {
                                    try {
                                        const response = await fetch(cardImageUrl);
                                        const blob = await response.blob();
                                        const file = new File([blob], 'etchvox-report.png', { type: 'image/png' });

                                        if (navigator.canShare && navigator.canShare({ files: [file] })) {
                                            shareData.files = [file];
                                        }
                                    } catch (err) {
                                        console.error("Failed to prepare card file for sharing:", err);
                                    }
                                }

                                await navigator.share(shareData);
                            } catch (err) {
                                console.log('Share failed or cancelled', err);
                            }
                        }}
                        className="share-btn flex flex-col items-center justify-center text-center gap-2 p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 hover:from-cyan-500/30 hover:to-blue-600/30 border border-cyan-500/30 hover:border-cyan-500/50 transition-all group"
                    >
                        <span className="text-4xl group-hover:scale-110 transition-transform">📤</span>
                        <span className="text-sm font-black text-gray-200">Share ID</span>
                    </button>
                )}
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

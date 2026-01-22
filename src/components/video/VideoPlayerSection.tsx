import React from 'react';
import { Player } from '@remotion/player';
import { ResultVideo } from './ResultVideo';
import { VoiceType } from '@/lib/types';

interface VideoPlayerSectionProps {
    voiceType: VoiceType;
    metrics: {
        pitch: number;
        speed: number;
        vibe: number;
        humanityScore: number;
    };
}

export const VideoPlayerSection: React.FC<VideoPlayerSectionProps> = ({ voiceType, metrics }) => {
    return (
        <div className="w-full max-w-sm md:max-w-md mx-auto bg-black rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/10 relative group">
            <div className="aspect-[9/16] relative">
                <Player
                    component={ResultVideo}
                    inputProps={{
                        voiceType,
                        metrics,
                    }}
                    durationInFrames={900} // 30 seconds
                    fps={30}
                    compositionWidth={1080}
                    compositionHeight={1920}
                    style={{
                        width: '100%',
                        height: '100%',
                    }}
                    controls
                    loop
                    autoPlay
                />
            </div>

            {/* Download Overlay (Mock for now) */}
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <div className="text-white font-bold text-center">
                    <p className="text-3xl mb-2">🎥</p>
                    <p>Right click to save video</p>
                    <p className="text-xs text-gray-400 mt-2">(Coming in next update: One-click MP4)</p>
                </div>
            </div>
        </div>
    );
};

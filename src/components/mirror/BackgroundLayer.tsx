'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useMirror } from '@/context/MirrorContext';
import AcousticNebula from '../result/AcousticNebula';

interface BackgroundLayerProps {
    readingVector: number[];
    showInsight: boolean;
    themeOverride?: string;
}

const MIRROR_THEMES: Record<string, { color: string; blur: string }> = {
    OPTIMIZER: { color: 'rgba(0, 21, 64, 0.4)', blur: 'blur(10px)' },
    STOIC: { color: 'rgba(13, 13, 13, 0.3)', blur: 'blur(60px)' },
    ALCHEMIST: { color: 'rgba(26, 0, 51, 0.4)', blur: 'blur(30px)' },
    MAVERICK: { color: 'rgba(43, 0, 43, 0.4)', blur: 'blur(15px)' },
    SANCTUARY: { color: 'rgba(26, 15, 15, 0.4)', blur: 'blur(40px)' },
};

export default function BackgroundLayer({ readingVector, showInsight, themeOverride }: BackgroundLayerProps) {
    const { type, config } = useMirror();
    const activeType = themeOverride || type;
    const theme = MIRROR_THEMES[activeType.toUpperCase()] || MIRROR_THEMES.OPTIMIZER;

    return (
        <div className="fixed inset-0 z-0 bg-[#050505] overflow-hidden">

            {/* 1. Nebula Layer */}
            <div className={`absolute inset-0 z-0 transition-all duration-1000 ${showInsight ? 'blur-2xl opacity-30 scale-110' : 'opacity-60'}`}>
                <AcousticNebula dataA={readingVector} isCouple={false} />
            </div>

            {/* 2. Theme Color Overlay: Soft Transition */}
            <motion.div
                animate={{
                    backgroundColor: theme.color,
                    backdropFilter: showInsight ? 'blur(80px)' : theme.blur
                }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="absolute inset-0 z-10 pointer-events-none"
            />

            {/* 3. Film Grain Layer */}
            <div
                className="absolute inset-0 z-20 pointer-events-none opacity-[0.04] mix-blend-overlay animate-grain"
                style={{
                    backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")',
                    opacity: config.grain || 0.04
                }}
            />

            {/* 4. Vignette Layer */}
            <div className="absolute inset-0 z-30 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.8)_100%)]" />

        </div>
    );
}

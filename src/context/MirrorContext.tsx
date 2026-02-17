'use client';

import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';

export type MirrorArchetype = 'OPTIMIZER' | 'STOIC' | 'ALCHEMIST' | 'MAVERICK' | 'SANCTUARY';

export interface MirrorConfig {
    id: MirrorArchetype;
    name: string;
    font: string;
    grain: number;
    introSpeed: number;
    colors: { base: string; accent: string };
    shaderParams: { dynamics: number; texture: number; clarity: number; presence: number };
}

export const MIRROR_CONFIGS: Record<MirrorArchetype, MirrorConfig> = {
    OPTIMIZER: {
        id: 'OPTIMIZER',
        name: 'The Optimizer',
        font: "'JetBrains Mono', monospace",
        grain: 0.02,
        introSpeed: 0.2,
        colors: { base: '#001540', accent: '#ffffff' },
        shaderParams: { dynamics: 1.8, texture: 0.15, clarity: 1.0, presence: 1.2 }
    },
    STOIC: {
        id: 'STOIC',
        name: 'The Stoic',
        font: "'Newsreader', serif",
        grain: 0.05,
        introSpeed: 1.5,
        colors: { base: '#0d0d0d', accent: '#4a4a4a' },
        shaderParams: { dynamics: 0.1, texture: 0.05, clarity: 0.5, presence: 0.8 }
    },
    ALCHEMIST: {
        id: 'ALCHEMIST',
        name: 'The Alchemist',
        font: "'EB Garamond', serif",
        grain: 0.06,
        introSpeed: 2.0,
        colors: { base: '#1a0033', accent: '#9933ff' },
        shaderParams: { dynamics: 0.6, texture: 0.8, clarity: 0.7, presence: 1.1 }
    },
    MAVERICK: {
        id: 'MAVERICK',
        name: 'The Maverick',
        font: "'Inter', sans-serif",
        grain: 0.12,
        introSpeed: 0.1,
        colors: { base: '#2b002b', accent: '#ccff00' },
        shaderParams: { dynamics: 2.5, texture: 1.2, clarity: 1.2, presence: 1.0 }
    },
    SANCTUARY: {
        id: 'SANCTUARY',
        name: 'The Sanctuary',
        font: "'Playfair Display', serif",
        grain: 0.08,
        introSpeed: 3.0,
        colors: { base: '#1a0f0f', accent: '#f5e6ca' },
        shaderParams: { dynamics: 0.3, texture: 0.2, clarity: 0.2, presence: 0.9 }
    }
};

interface MirrorContextType {
    type: MirrorArchetype;
    config: MirrorConfig;
    setMirror: (type: MirrorArchetype) => void;
    allConfigs: typeof MIRROR_CONFIGS;
}

const MirrorContext = createContext<MirrorContextType | undefined>(undefined);

export const MirrorProvider = ({ children }: { children: React.ReactNode }) => {
    const [currentType, setCurrentType] = useState<MirrorArchetype>('SANCTUARY');

    const config = useMemo(() => MIRROR_CONFIGS[currentType], [currentType]);

    useEffect(() => {
        const root = document.documentElement;
        root.style.setProperty('--mirror-font', config.font);
        root.style.setProperty('--grain-opacity', config.grain.toString());
        root.style.setProperty('--mirror-base-color', config.colors.base);
        root.style.setProperty('--mirror-accent-color', config.colors.accent);
    }, [config]);

    const value = {
        type: currentType,
        config,
        setMirror: setCurrentType,
        allConfigs: MIRROR_CONFIGS
    };

    return (
        <MirrorContext.Provider value={value}>
            <div
                className="mirror-root"
                style={{
                    fontFamily: config.font,
                    backgroundColor: '#000',
                    minHeight: '100vh',
                    transition: 'all 0.5s ease',
                    color: '#fff'
                }}
            >
                {children}
            </div>
        </MirrorContext.Provider>
    );
};

export const useMirror = () => {
    const context = useContext(MirrorContext);
    // Default fallback if used outside provider
    if (context === undefined) {
        return {
            type: 'SANCTUARY' as MirrorArchetype,
            config: MIRROR_CONFIGS['SANCTUARY'],
            setMirror: () => { },
            allConfigs: MIRROR_CONFIGS,
            isFallback: true
        };
    }
    return { ...context, isFallback: false };
};

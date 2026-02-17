'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Genre, Scenario, GENRE_THEMES } from '@/lib/mirrorContent';
import BackgroundLayer from './BackgroundLayer';

interface StorySelectorProps {
    phase: 'genre' | 'scenario';
    genres: { id: Genre; name: string; icon: string; desc: string }[];
    scenarios?: Scenario[];
    onGenreSelect: (genre: Genre) => void;
    onScenarioSelect: (scenario: Scenario) => void;
    onBack?: () => void;
}

export default function StorySelector({
    phase,
    genres,
    scenarios = [],
    onGenreSelect,
    onScenarioSelect,
    onBack
}: StorySelectorProps) {
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    // Map hovered item to its "preview" archetype
    const activeArchetype = hoveredId ? (GENRE_THEMES[hoveredId as Genre]?.archetype || 'OPTIMIZER') : 'OPTIMIZER';

    return (
        <div className="relative min-h-screen w-full flex items-center justify-center p-6 overflow-hidden">
            {/* 1. Atmospheric Background Preview */}
            <BackgroundLayer
                readingVector={[0.5, 0.5, 0.5, 0.5, 0.5]} // Dummy vector for preview
                showInsight={hoveredId !== null}
                themeOverride={activeArchetype}
            />

            <div className="relative z-20 max-w-5xl w-full space-y-12">
                <header className="text-center space-y-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl font-black text-white uppercase tracking-tighter"
                    >
                        {phase === 'genre' ? 'Select Your Arc' : 'Choose Your Story'}
                    </motion.h1>
                    <p className="text-white/40 text-sm font-mono tracking-widest uppercase">
                        {phase === 'genre' ? 'A 7-Day commitment to resonance' : 'The narrative path for your next cycle'}
                    </p>
                </header>

                <AnimatePresence mode="wait">
                    <motion.div
                        key={phase}
                        initial={{ opacity: 0, filter: 'blur(20px)', scale: 1.1 }}
                        animate={{ opacity: 1, filter: 'blur(0px)', scale: 1 }}
                        exit={{ opacity: 0, filter: 'blur(20px)', scale: 0.95 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className={`grid gap-6 ${phase === 'genre' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}
                    >
                        {phase === 'genre' ? (
                            genres.map((genre) => {
                                const theme = GENRE_THEMES[genre.id];
                                return (
                                    <motion.button
                                        key={genre.id}
                                        onMouseEnter={() => setHoveredId(genre.id)}
                                        onMouseLeave={() => setHoveredId(null)}
                                        onClick={() => onGenreSelect(genre.id)}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ scale: 1.02 }}
                                        className="group relative h-[clamp(240px,30vh,320px)] bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 md:p-10 overflow-hidden text-left transition-all hover:border-white/30"
                                    >
                                        <div className="relative z-10 h-full flex flex-col justify-between">
                                            <div className="flex justify-between items-start">
                                                <span className="text-4xl md:text-5xl group-hover:scale-110 transition-transform duration-500">{genre.icon}</span>
                                                <div className="flex flex-col items-end">
                                                    <span className={`text-[8px] md:text-[10px] uppercase font-black ${theme.tracking} opacity-40`}>Commitment</span>
                                                    <span className="text-[7px] md:text-[8px] opacity-20 uppercase tracking-widest font-mono">7-Day Arc</span>
                                                </div>
                                            </div>
                                            <div>
                                                <h3 className={`text-2xl md:text-3xl font-bold mb-2 ${theme.color}`} style={{ fontFamily: theme.font }}>
                                                    {genre.name}
                                                </h3>
                                                <p className="text-white/60 text-xs md:text-sm font-light leading-relaxed max-w-xs line-clamp-2 md:line-clamp-none">
                                                    {genre.desc}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Hover Shine Effect */}
                                        <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </motion.button>
                                );
                            })
                        ) : (
                            scenarios.map((scenario) => {
                                const theme = GENRE_THEMES[scenario.genre];
                                return (
                                    <motion.button
                                        key={scenario.id}
                                        onMouseEnter={() => setHoveredId(scenario.genre)}
                                        onMouseLeave={() => setHoveredId(null)}
                                        onClick={() => onScenarioSelect(scenario)}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        whileHover={{ scale: 1.05 }}
                                        className="group relative h-[clamp(280px,40vh,380px)] bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 md:p-8 text-left transition-all hover:border-white/40"
                                    >
                                        <div className="h-full flex flex-col justify-between">
                                            <div>
                                                <div className="w-10 md:w-12 h-0.5 md:h-1 bg-white/20 mb-4 md:mb-6" />
                                                <h3 className={`text-xl md:text-2xl font-bold mb-3 md:mb-4 ${theme.color}`} style={{ fontFamily: theme.font }}>
                                                    {scenario.title}
                                                </h3>
                                                <p className="text-white/50 text-[10px] md:text-xs leading-relaxed font-light line-clamp-3 md:line-clamp-none">
                                                    {scenario.description}
                                                </p>
                                            </div>
                                            <div className="pt-4 md:pt-6 border-t border-white/5 flex justify-between items-center">
                                                <span className="text-[8px] md:text-[9px] font-black uppercase tracking-[0.3em] opacity-30 group-hover:opacity-100 transition-opacity">
                                                    Initiate Arc →
                                                </span>
                                                <span className="opacity-10 text-xs group-hover:opacity-30 transition-opacity">✧</span>
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })
                        )}
                    </motion.div>
                </AnimatePresence>

                {onBack && (
                    <div className="text-center pt-8">
                        <button
                            onClick={onBack}
                            className="text-white/30 hover:text-white text-[10px] font-black uppercase tracking-[0.5em] transition-all"
                        >
                            ← Back
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

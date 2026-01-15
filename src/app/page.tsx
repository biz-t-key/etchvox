'use client';

import { useState } from 'react';
import Link from 'next/link';

type Mode = 'solo' | 'couple' | null;

export default function HomePage() {
  const [selectedMode, setSelectedMode] = useState<Mode>(null);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 md:px-8 overflow-hidden py-20">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-black" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500 rounded-full blur-[128px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-magenta-500 rounded-full blur-[128px]" />
      </div>

      {/* Scan Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-5">
        <div className="w-full h-full" style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)',
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center max-w-4xl mx-auto space-y-16">
        {/* Logo */}
        <div className="space-y-8">
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-tight">
            <span className="neon-text-cyan">ETCH</span>
            <span className="neon-text-magenta">VOX</span>
          </h1>

          {/* Tagline */}
          <div className="space-y-6">
            <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 font-light leading-relaxed px-4">
              Your Face is 10/10.
            </p>
            <p className="text-2xl sm:text-3xl md:text-4xl font-bold leading-snug px-4">
              <span className="neon-text-cyan">What about your Voice?</span>
            </p>
          </div>
        </div>

        {/* Mode Selection */}
        {!selectedMode ? (
          <div className="space-y-12 animate-fade-in">
            <p className="text-gray-400 text-lg mb-8">Choose your analysis mode:</p>

            <div className="grid md:grid-cols-2 gap-8 px-4">
              {/* Solo Mode */}
              <button
                onClick={() => setSelectedMode('solo')}
                className="group glass rounded-3xl p-8 md:p-10 border-2 border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(0,240,255,0.3)] text-left"
              >
                <div className="text-6xl mb-6">🎤</div>
                <h2 className="text-3xl md:text-4xl font-black mb-4">
                  <span className="neon-text-cyan">SOLO MODE</span>
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  Discover your unique voice type
                </p>
                <p className="text-gray-500 text-sm">
                  30 seconds • 16 voice types • Instant analysis
                </p>
              </button>

              {/* Couple Mode */}
              <button
                onClick={() => setSelectedMode('couple')}
                className="group glass rounded-3xl p-8 md:p-10 border-2 border-magenta-500/30 hover:border-magenta-500/60 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,0,255,0.3)] text-left relative"
              >
                <span className="absolute top-4 right-4 text-sm bg-magenta-500/30 text-magenta-300 px-3 py-1 rounded-full font-bold animate-pulse">NEW</span>
                <div className="text-6xl mb-6">💕</div>
                <h2 className="text-3xl md:text-4xl font-black mb-4">
                  <span className="neon-text-magenta">COUPLE MODE</span>
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed mb-4">
                  Test your <span className="text-magenta-400 font-bold">vocal chemistry</span> together
                </p>
                <p className="text-gray-500 text-sm">
                  36 seconds • 2 voices • Compatibility score
                </p>
              </button>
            </div>
          </div>
        ) : (
          /* Confirmation Step */
          <div className="space-y-12 animate-fade-in">
            <div className="glass rounded-2xl p-8 md:p-12 max-w-2xl mx-auto space-y-8">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="mono">READY TO START</span>
              </div>

              <div className="text-center space-y-4">
                <div className="text-6xl mb-4">{selectedMode === 'solo' ? '🎤' : '💕'}</div>
                <h2 className="text-3xl md:text-4xl font-bold">
                  {selectedMode === 'solo' ? (
                    <span className="neon-text-cyan">Solo Voice Analysis</span>
                  ) : (
                    <span className="neon-text-magenta">Couple Voice Analysis</span>
                  )}
                </h2>
                <p className="text-gray-400 text-lg max-w-md mx-auto leading-relaxed">
                  {selectedMode === 'solo'
                    ? 'Read 3 prompts aloud. Takes about 30 seconds.'
                    : 'Record together on the same device. Takes about 36 seconds.'
                  }
                </p>
              </div>

              <div className="space-y-6">
                <Link
                  href={selectedMode === 'solo' ? '/record' : '/couple'}
                  className="block btn-metallic text-xl md:text-2xl px-12 py-6 rounded-full font-bold transition-all duration-300 hover:scale-105 w-full text-center"
                >
                  <span className="text-3xl mr-3">🎤</span>
                  <span className="relative z-10">START RECORDING</span>
                </Link>

                <button
                  onClick={() => setSelectedMode(null)}
                  className="text-gray-500 hover:text-gray-300 text-sm transition-colors"
                >
                  ← Change mode
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        {!selectedMode && (
          <div className="pt-8 flex justify-center gap-16 text-center">
            <div className="space-y-3">
              <div className="mono text-3xl md:text-4xl font-bold neon-text-cyan">14,028</div>
              <div className="text-sm text-gray-500">Voices Analyzed</div>
            </div>
            <div className="space-y-3">
              <div className="mono text-3xl md:text-4xl font-bold neon-text-magenta">482 TB</div>
              <div className="text-sm text-gray-500">Data Processed</div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="absolute bottom-8 left-0 right-0 text-center text-xs text-gray-600 space-y-4">
        <div className="flex justify-center gap-6">
          <Link href="/terms" className="hover:text-gray-400 transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-gray-400 transition-colors">
            Privacy
          </Link>
        </div>
        <p className="leading-relaxed">
          Built by a husband who was told he sounds like a robot.
        </p>
      </footer>
    </div>
  );
}

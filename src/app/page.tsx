'use client';

import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-6 md:px-8 overflow-hidden py-16">
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
      <div className="relative z-10 text-center max-w-3xl mx-auto space-y-8 md:space-y-12">
        {/* Logo */}
        <div>
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-tight">
            <span className="neon-text-cyan">ETCH</span>
            <span className="neon-text-magenta">VOX</span>
          </h1>
        </div>

        {/* Tagline */}
        <div className="space-y-4">
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-300 font-light leading-relaxed px-4">
            Your Face is 10/10.
          </p>
          <p className="text-2xl sm:text-3xl md:text-4xl font-bold leading-snug px-4">
            <span className="neon-text-cyan">What about your Voice?</span>
          </p>
        </div>

        {/* System Check */}
        <div className="glass rounded-xl p-6 sm:p-8 md:p-10 max-w-md mx-4 sm:mx-auto">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="mono text-sm sm:text-base text-green-400">SYSTEM CHECK</span>
          </div>
          <p className="text-xl sm:text-2xl md:text-3xl text-gray-200 mb-4 leading-relaxed">
            Are you <span className="text-cyan-400 font-bold">Human</span>?
          </p>
          <p className="text-base sm:text-lg md:text-xl text-gray-400 leading-relaxed">
            Or something more... interesting?
          </p>
        </div>

        {/* CTA Button - Solo Mode */}
        <div className="pt-2 px-4">
          <Link
            href="/record"
            className="inline-flex items-center gap-3 sm:gap-4 btn-metallic text-lg sm:text-xl md:text-2xl px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 rounded-full font-bold transition-all duration-300 hover:scale-105"
          >
            <span className="text-2xl sm:text-3xl md:text-4xl">🎤</span>
            <span className="relative z-10">START RECORDING</span>
          </Link>
        </div>

        {/* Couple Mode - Prominent Card */}
        <div className="px-4">
          <Link href="/couple" className="block group">
            <div className="glass rounded-2xl p-6 sm:p-8 border-2 border-magenta-500/30 hover:border-magenta-500/60 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,0,255,0.3)]">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-4xl sm:text-5xl">💕</span>
                <h3 className="text-2xl sm:text-3xl md:text-4xl font-black">
                  <span className="neon-text-magenta">COUPLE MODE</span>
                </h3>
                <span className="text-sm sm:text-base bg-magenta-500/30 text-magenta-300 px-3 py-1 rounded-full font-bold animate-pulse">NEW</span>
              </div>
              <p className="text-base sm:text-lg md:text-xl text-gray-300 leading-relaxed mb-3">
                Test your <span className="text-magenta-400 font-bold">vocal chemistry</span> together
              </p>
              <p className="text-sm sm:text-base text-gray-500">
                36 seconds • 2 voices • 1 compatibility score
              </p>
            </div>
          </Link>
        </div>

        {/* Subtitle */}
        <p className="text-gray-500 text-base leading-relaxed">
          16 voice types • 30 second test • Instant results
        </p>

        {/* Stats (Fake Dashboard) */}
        <div className="pt-8 flex justify-center gap-12 text-center">
          <div className="space-y-2">
            <div className="mono text-2xl md:text-3xl font-bold neon-text-cyan">14,028</div>
            <div className="text-sm text-gray-500">Voices Analyzed</div>
          </div>
          <div className="space-y-2">
            <div className="mono text-2xl md:text-3xl font-bold neon-text-magenta">482 TB</div>
            <div className="text-sm text-gray-500">Data Processed</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 left-0 right-0 text-center text-xs text-gray-600">
        <div className="flex justify-center gap-6 mb-3">
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

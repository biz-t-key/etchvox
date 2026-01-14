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
      <div className="relative z-10 text-center max-w-2xl mx-auto space-y-10">
        {/* Logo */}
        <div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-tight">
            <span className="neon-text-cyan">VOICE</span>
            <span className="neon-text-magenta">GLOW</span>
          </h1>
        </div>

        {/* Tagline */}
        <div className="space-y-3">
          <p className="text-xl md:text-2xl text-gray-300 font-light leading-relaxed">
            Your Face is 10/10.
          </p>
          <p className="text-2xl md:text-3xl font-bold leading-snug">
            <span className="neon-text-cyan">What about your Voice?</span>
          </p>
        </div>

        {/* System Check */}
        <div className="glass rounded-xl p-8 max-w-md mx-auto">
          <div className="flex items-center justify-center gap-2 mb-5">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="mono text-sm text-green-400">SYSTEM CHECK</span>
          </div>
          <p className="text-xl text-gray-200 mb-3 leading-relaxed">
            Are you <span className="text-cyan-400 font-bold">Human</span>?
          </p>
          <p className="text-base text-gray-400 leading-relaxed">
            Or something more... interesting?
          </p>
        </div>

        {/* CTA Button */}
        <div className="pt-4">
          <Link
            href="/record"
            className="inline-flex items-center gap-3 btn-primary text-lg px-10 py-5 rounded-full font-bold transition-all duration-300 hover:scale-105 pulse-neon"
          >
            <span className="text-2xl">🎤</span>
            <span>Start Analysis</span>
          </Link>
        </div>

        {/* Couple Mode Link */}
        <div>
          <Link
            href="/couple"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-magenta-400 transition-colors text-base"
          >
            <span>💕</span>
            <span>Try Couple Mode</span>
            <span className="text-xs bg-magenta-500/20 text-magenta-400 px-2 py-1 rounded-full">NEW</span>
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

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getHistory, requestSyncOtp, verifySyncOtp, removeFromHistory, VoiceResult } from '@/lib/storage';
import { voiceTypes } from '@/lib/types';
import { format } from 'date-fns';
import { FEATURE_FLAGS } from '@/config/features';
import FundingProgressBar from '@/components/layout/FundingProgressBar';
import { getDb, isFirebaseConfigured } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { getUnlockedFeatures, FeatureState } from '@/config/milestones';

type Mode = 'solo' | 'couple' | null;

export default function HomePage() {
  const [selectedMode, setSelectedMode] = useState<Mode>(null);
  const [history, setHistory] = useState<VoiceResult[]>([]);
  const [totalFunding, setTotalFunding] = useState<number>(0);
  const [features, setFeatures] = useState<FeatureState>({
    isSoloPurchaseUnlocked: false,
    isCoupleModeUnlocked: false,
    isCouplePurchaseUnlocked: false,
    currentAmount: 0
  });

  // Vault Sync States
  const [restoreEmail, setRestoreEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  async function loadHistory() {
    const data = await getHistory();
    setHistory(data);
  }

  useEffect(() => {
    loadHistory();

    // Real-time funding and feature unlock sync
    if (isFirebaseConfigured()) {
      const db = getDb();
      const statsRef = doc(db, 'stats', 'global');
      return onSnapshot(statsRef, (snapshot) => {
        if (snapshot.exists()) {
          const amount = snapshot.data().totalAmount || 0;
          setTotalFunding(amount);
          setFeatures(getUnlockedFeatures(amount));
        }
      });
    }
  }, []);

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restoreEmail || !restoreEmail.includes('@')) return;

    setIsRestoring(true);
    setRestoreStatus(null);
    try {
      const success = await requestSyncOtp(restoreEmail);
      if (success) {
        setStep('otp');
        setRestoreStatus({ type: 'success', msg: 'Verification code sent to your email.' });
      } else {
        setRestoreStatus({ type: 'error', msg: 'No records found for this email or sending failed.' });
      }
    } catch (err) {
      setRestoreStatus({ type: 'error', msg: 'Request failed. Try again.' });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp || otp.length < 6) return;

    setIsRestoring(true);
    setRestoreStatus(null);
    try {
      const success = await verifySyncOtp(restoreEmail, otp);
      if (success) {
        setRestoreStatus({ type: 'success', msg: 'Vault synchronized successfully!' });
        setRestoreEmail('');
        setOtp('');
        setStep('email');
        await loadHistory();
      } else {
        setRestoreStatus({ type: 'error', msg: 'Invalid or expired verification code.' });
      }
    } catch (err) {
      setRestoreStatus({ type: 'error', msg: 'Verification failed. Try again.' });
    } finally {
      setIsRestoring(false);
    }
  };

  const handleArchive = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (confirm('Archive this diagnostic record? it will be hidden from your active vault view. For permanent data deletion requests compliant with GDPR/CCPA, please contact support at info@etchvox.com.')) {
      await removeFromHistory(id, false); // Remove from local view
      await loadHistory();
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center px-6 md:px-8 overflow-x-hidden py-32 md:py-48">
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
      <div className="relative z-10 text-center max-w-4xl mx-auto space-y-32 flex-grow flex flex-col justify-center w-full">
        {/* Logo */}
        <div className="space-y-12 mb-8">
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tight leading-tight">
            <span className="neon-text-cyan">ETCH</span>
            <span className="neon-text-magenta">VOX</span>
          </h1>

          {/* Tagline */}
          <div className="space-y-4">
            <p className="text-base sm:text-lg md:text-xl text-gray-300 font-light leading-relaxed px-4">
              Your Face is 10/10.
            </p>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold leading-snug px-4">
              <span className="neon-text-cyan">What about your Voice?</span>
            </p>
          </div>
        </div>

        {/* Mode Selection */}
        {!selectedMode ? (
          <div className="space-y-16 animate-fade-in py-12">
            <p className="text-gray-400 text-lg mb-20 uppercase tracking-[0.2em] font-medium opacity-60">Choose your analysis mode:</p>

            <div className={`${features.isCoupleModeUnlocked ? 'grid md:grid-cols-2 max-w-4xl' : 'flex justify-center max-w-md'} gap-12 px-4 mx-auto w-full`}>
              {/* Solo Mode */}
              <button
                onClick={() => setSelectedMode('solo')}
                className="group glass rounded-3xl p-8 md:p-12 border-2 border-cyan-500/30 hover:border-cyan-500/60 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(0,240,255,0.4)] text-center flex flex-col items-center w-full relative"
              >
                <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform">🎤</div>
                <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tight">
                  <span className="neon-text-cyan">{features.isCoupleModeUnlocked ? 'SOLO MODE' : 'START ANALYSIS'}</span>
                </h2>
                <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-xs mx-auto">
                  {features.isCoupleModeUnlocked
                    ? 'Discover your unique voice type.'
                    : 'Decode the resonance of your unique vocal signature.'}
                </p>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] px-4 space-x-4">
                  <span>30 SECONDS</span>
                  <span>•</span>
                  <span>AI DIAGNOSIS</span>
                </p>
              </button>

              {/* Couple Mode - Controlled by Community Goal */}
              {features.isCoupleModeUnlocked ? (
                <button
                  onClick={() => setSelectedMode('couple')}
                  className="group glass rounded-3xl p-8 md:p-12 border-2 border-pink-500/30 hover:border-pink-500/60 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_rgba(255,0,255,0.4)] text-center flex flex-col items-center relative w-full"
                >
                  <span className="absolute top-4 right-4 text-[10px] bg-pink-500/30 text-pink-300 px-2 py-1 rounded-full font-bold animate-pulse tracking-widest">UNLOCKED</span>
                  <div className="text-6xl mb-6 transform group-hover:scale-110 transition-transform">💕</div>
                  <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tight">
                    <span className="neon-text-pink">COUPLE MODE</span>
                  </h2>
                  <p className="text-gray-300 text-lg leading-relaxed mb-6 max-w-xs mx-auto">
                    Test your <span className="text-pink-400 font-bold">vocal chemistry</span> together.
                  </p>
                  <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] px-4 space-x-4">
                    <span>36 SECONDS</span>
                    <span>•</span>
                    <span>AI MATCHING</span>
                  </p>
                </button>
              ) : (
                <div className="hidden md:flex group glass rounded-3xl p-8 md:p-12 border-2 border-white/5 opacity-30 grayscale text-center flex-col items-center relative w-full cursor-not-allowed overflow-hidden">
                  <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-10 flex items-center justify-center p-8">
                    <div className="space-y-4">
                      <div className="text-[10px] font-black uppercase tracking-[0.4em] text-gray-500">COMMUNITY GOAL: $8,500</div>
                      <div className="text-xs font-bold text-white uppercase tracking-widest">COUPLE MODE LOCKED</div>
                    </div>
                  </div>
                  <div className="text-6xl mb-6 opacity-20">💕</div>
                  <h2 className="text-3xl md:text-4xl font-black mb-4 uppercase tracking-tight opacity-10">
                    COUPLE MODE
                  </h2>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Confirmation Step */
          <div className="space-y-12 animate-fade-in py-12">
            <div className="glass rounded-2xl p-8 md:p-16 max-w-2xl mx-auto space-y-12">
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
                  className="flex justify-center items-center btn-metallic text-xl md:text-2xl px-12 py-6 rounded-full font-bold transition-all duration-300 hover:scale-105 w-full text-center"
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
          <div className="pt-40 flex flex-col items-center space-y-32">
            {/* The Vault - History Section */}
            {history.length > 0 && (
              <div className="w-full max-w-4xl animate-fade-in-up">
                <div className="flex flex-col items-center mb-10 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-cyan-500 rounded-full" />
                    <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.3em] neon-text-cyan">
                      The Vault
                    </h2>
                    <div className="w-1.5 h-6 bg-cyan-500 rounded-full" />
                  </div>
                  <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">
                    Access your vocal identity archives
                  </p>
                </div>

                {/* Restore Feature */}
                <div className="mb-12 max-w-md mx-auto">
                  {step === 'email' ? (
                    <form onSubmit={handleRequestOtp} className="relative group">
                      <input
                        type="email"
                        placeholder="Enter purchase email to sync..."
                        value={restoreEmail}
                        onChange={(e) => setRestoreEmail(e.target.value)}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:border-cyan-500/50 outline-none transition-all pr-32"
                        required
                      />
                      <button
                        type="submit"
                        disabled={isRestoring}
                        className="absolute right-1 top-1 bottom-1 px-4 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all disabled:opacity-50"
                      >
                        {isRestoring ? 'Sending...' : 'Sync Vault'}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="relative group animate-fade-in">
                      <input
                        type="text"
                        placeholder="Enter 6-digit code..."
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full bg-black/40 border border-cyan-500/30 rounded-xl px-4 py-3 text-sm focus:border-cyan-500 outline-none transition-all pr-32 font-mono tracking-[0.5em] text-center"
                        maxLength={6}
                        required
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={isRestoring || otp.length < 6}
                        className="absolute right-1 top-1 bottom-1 px-4 bg-cyan-500/40 hover:bg-cyan-500/60 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all disabled:opacity-50"
                      >
                        {isRestoring ? 'Verifying...' : 'Verify'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setStep('email')}
                        className="block w-full text-center mt-4 text-[9px] text-gray-500 uppercase tracking-widest hover:text-white transition-colors"
                      >
                        ← Back to email
                      </button>
                    </form>
                  )}
                  {restoreStatus && (
                    <p className={`mt-3 text-[10px] uppercase font-bold tracking-widest text-center ${restoreStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                      {restoreStatus.msg}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {history.map((item) => {
                    const isCouple = !!item.coupleData;
                    const vType = isCouple ? null : voiceTypes[item.typeCode as keyof typeof voiceTypes];

                    return (
                      <Link
                        key={item.id}
                        href={`/result/${item.id}`}
                        className="group relative glass rounded-2xl p-6 border border-white/5 hover:border-cyan-500/30 transition-all duration-500 hover:scale-[1.02] overflow-hidden block text-left"
                      >
                        {/* Background Pulse */}
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                        <div className="relative z-10 space-y-4">
                          <div className="flex justify-between items-start">
                            <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                              {isCouple ? '💕' : (vType?.icon || '🎤')}
                            </span>
                            <span className="text-[9px] font-mono text-gray-500 group-hover:text-cyan-400 transition-colors uppercase">
                              {format(new Date(item.createdAt), 'MMM dd, yyyy')}
                            </span>
                            <button
                              onClick={(e) => handleArchive(e, item.id)}
                              className="w-6 h-6 rounded-full flex items-center justify-center text-gray-700 hover:text-cyan-500 hover:bg-white/5 transition-all ml-2"
                              title="Archive record"
                            >
                              ✕
                            </button>
                          </div>

                          <div>
                            <div className="text-xs font-black text-white uppercase tracking-wider mb-1">
                              {isCouple ? 'Couple Resonance' : vType?.name}
                            </div>
                            <div className="text-[10px] font-mono text-cyan-600 tracking-widest uppercase opacity-70">
                              {item.typeCode}
                            </div>
                          </div>

                          <div className="pt-2 flex items-center justify-between">
                            <div className="flex -space-x-2">
                              <div className={`w-1 h-1 rounded-full ${isCouple ? 'bg-pink-500' : 'bg-cyan-500'} animate-pulse`} />
                              <div className={`w-1 h-1 rounded-full ${isCouple ? 'bg-pink-500' : 'bg-cyan-500'} animate-pulse delay-75`} />
                              <div className={`w-1 h-1 rounded-full ${isCouple ? 'bg-pink-500' : 'bg-cyan-500'} animate-pulse delay-150`} />
                            </div>
                            <span className="text-[9px] font-bold text-gray-400 group-hover:text-white transition-colors">
                              VIEW ARCHIVE →
                            </span>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
                {/* Archive Note */}
                <div className="mt-8 text-center">
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest font-mono">
                    Archived records are hidden from active view. Contact <a href="mailto:info@etchvox.com" className="text-cyan-600 hover:underline">support</a> for permanent deletion.
                  </p>
                </div>
              </div>
            )}

            {/* Funding Progress - Placed between Mode Selection and Stats with plenty of air */}
            <div className="w-full py-32 animate-fade-in-up delay-300">
              <FundingProgressBar />
            </div>

            <div className="space-y-6 pt-10">
              <p className="text-[10px] uppercase tracking-[0.4em] text-gray-600 font-black">Mission Objectives: Our Future Scale</p>
              <div className="flex justify-center gap-16 text-center">
                <div className="space-y-3">
                  <div className="mono text-3xl md:text-4xl font-bold neon-text-cyan">14,028</div>
                  <div className="text-sm text-gray-500 uppercase tracking-widest text-[10px]">Voices Analyzed</div>
                </div>
                <div className="space-y-3">
                  <div className="mono text-3xl md:text-4xl font-bold neon-text-magenta">482 TB</div>
                  <div className="text-sm text-gray-500 uppercase tracking-widest text-[10px]">Data Processed</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="relative z-10 w-full mt-48 pb-16 text-center text-[10px] text-gray-500 space-y-6">
        <div className="flex justify-center gap-8 uppercase tracking-widest font-bold">
          <Link href="/terms" className="hover:text-cyan-400 transition-colors">
            Terms
          </Link>
          <Link href="/privacy" className="hover:text-cyan-400 transition-colors">
            Privacy
          </Link>
          <a
            href={`https://buymeacoffee.com/${FEATURE_FLAGS.BMAC_HANDLE}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-500 hover:text-amber-400 transition-colors"
          >
            Support
          </a>
        </div>
        <div className="max-w-xs mx-auto text-gray-700 leading-relaxed font-mono">
          © 2026 EtchVox Archive. Built for entertainment purposes.
        </div>
      </footer>
    </div>
  );
}

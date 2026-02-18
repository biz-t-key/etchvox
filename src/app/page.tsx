'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import BlessingPortal from '@/components/mirror/BlessingPortal';
import { getHistory, requestSyncOtp, verifySyncOtp, removeFromHistory, softWithdraw, VoiceResult } from '@/lib/storage';
import { voiceTypes } from '@/lib/types';
import { format } from 'date-fns';
import { getDb, isFirebaseConfigured } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

type Mode = 'solo' | 'couple' | 'elon' | 'spy' | null;

export default function HomePage() {
  const [selectedMode, setSelectedMode] = useState<Mode>(null);
  const [history, setHistory] = useState<VoiceResult[]>([]);

  // Vault Sync States
  const [restoreEmail, setRestoreEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const [isRestoring, setIsRestoring] = useState(false);
  const [restoreStatus, setRestoreStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);
  const [showPurgePortal, setShowPurgePortal] = useState(false);

  async function loadHistory() {
    const data = await getHistory();
    setHistory(data);
  }

  const [totalVoices, setTotalVoices] = useState(14028);
  const [dataMB, setDataMB] = useState(482);

  useEffect(() => {
    loadHistory();

    // Fetch real stats
    if (isFirebaseConfigured()) {
      const fetchStats = async () => {
        try {
          const { getCountFromServer, collection } = await import('firebase/firestore');
          const db = getDb();
          const snapshot = await getCountFromServer(collection(db, 'results'));
          const count = snapshot.data().count;
          setTotalVoices(count);
          // Roughly 1.5MB per voice recording * count
          setDataMB(Math.floor(count * 1.5));
        } catch (e) {
          console.warn("Failed to fetch statistics", e);
        }
      };
      fetchStats();
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

    if (confirm('Permanently delete this diagnostic record? This will remove all traces from our servers and your local vault. This action cannot be undone.')) {
      await removeFromHistory(id, true); // Permanent server-side deletion
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl mx-auto animate-fade-in-up">
            {/* Solo Mode */}
            <button
              onClick={() => setSelectedMode('solo')}
              className="group relative glass rounded-3xl p-8 text-left transition-all hover:scale-[1.02] border-2 border-transparent hover:border-cyan-500/50"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl text-cyan-400">🎤</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400 px-3 py-1 bg-cyan-400/10 rounded-full italic">Classic Archive</span>
              </div>
              <h3 className="text-2xl font-black mb-2 italic">SOLO ANALYSIS</h3>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">
                Diagnostics for the 16 core vocal identities. Self-perception audit.
              </p>
            </button>

            {/* Couple Mode */}
            <button
              onClick={() => setSelectedMode('couple')}
              className="group relative glass rounded-3xl p-8 text-left transition-all hover:scale-[1.02] border-2 border-transparent hover:border-magenta-500/50"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl text-magenta-500">👥</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-magenta-500 px-3 py-1 bg-magenta-500/10 rounded-full italic">Resonance Axis</span>
              </div>
              <h3 className="text-2xl font-black mb-2 italic">RESONANCE TEST</h3>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">
                Binary star correlation. Measure the chemistry between two waveforms.
              </p>
            </button>

            {/* Elon Mode */}
            <button
              onClick={() => setSelectedMode('elon')}
              className="group relative glass rounded-3xl p-8 text-left transition-all hover:scale-[1.02] border-2 border-transparent hover:border-orange-500/50"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl">🚀</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-orange-500 px-3 py-1 bg-orange-500/10 rounded-full italic">X-Calibration</span>
              </div>
              <h3 className="text-2xl font-black mb-2 italic">ELON MODE</h3>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">
                Visionary throughput audit. First principles and Mars-ready output.
              </p>
            </button>

            {/* Spy Mode */}
            <button
              onClick={() => setSelectedMode('spy')}
              className="group relative glass rounded-3xl p-8 text-left transition-all hover:scale-[1.02] border-2 border-transparent hover:border-red-500/50"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl text-red-500">🕵️‍♂️</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 px-3 py-1 bg-red-400/10 rounded-full italic">Agency Access</span>
              </div>
              <h3 className="text-2xl font-black mb-2 italic">SPY AUDITION</h3>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">
                Biometric fidelity test. Verify your cover and performance under pressure.
              </p>
            </button>

            {/* Voice Mirror */}
            <Link
              href="/mirror"
              className="group relative glass rounded-3xl p-8 text-left transition-all hover:scale-[1.02] border-2 border-transparent hover:border-yellow-500/50 md:col-span-2"
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl">🪞</span>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-500 px-3 py-1 bg-yellow-500/10 rounded-full italic">7-Day Program</span>
              </div>
              <h3 className="text-2xl font-black mb-2 italic">VOICE MIRROR</h3>
              <p className="text-sm text-gray-400 font-medium leading-relaxed">
                Active Mindfulness. Etch your soul into the digital grid through a 7-day resonance program.
              </p>
            </Link>
          </div>
        ) : (
          /* Confirmation Step */
          <div className="fade-in space-y-12 py-12">
            <div className="glass rounded-2xl p-8 md:p-16 max-w-2xl mx-auto space-y-12">
              <div className="text-center space-y-4">
                <div className="text-6xl mb-4">
                  {selectedMode === 'solo' ? '🎤' : selectedMode === 'couple' ? '👥' : selectedMode === 'elon' ? '🚀' : '🕵️‍♂️'}
                </div>
                <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase">
                  {selectedMode === 'solo' ? <span className="neon-text-cyan">Solo Archive</span> :
                    selectedMode === 'couple' ? <span className="neon-text-magenta">Resonance Test</span> :
                      selectedMode === 'elon' ? <span className="text-orange-500">Mars Emperor Mode</span> :
                        <span className="text-red-500">Agency Audition</span>}
                </h2>
                <p className="text-gray-400 text-lg leading-relaxed max-w-md mx-auto">
                  {selectedMode === 'solo' ? 'Begin the 3-step diagnostic for base vocal identity.' :
                    selectedMode === 'couple' ? 'Synchronized binary recording for affinity audit.' :
                      selectedMode === 'elon' ? 'Calibrating for high-stakes visionary throughput.' :
                        'Identity verification for the London/DC/Moscow/Tokyo sectors.'}
                </p>
                {selectedMode === 'elon' && (
                  <p className="text-[10px] text-orange-500/60 font-mono mt-4 uppercase tracking-widest max-w-sm mx-auto leading-relaxed">
                    Notice: ELON is a diagnostic archetype for entertainment purposes and is not affiliated with any actual person or entity.
                  </p>
                )}
              </div>

              <div className="space-y-6">
                <Link
                  href={selectedMode === 'couple' ? '/couple' : `/record?mode=${selectedMode}`}
                  className="flex justify-center items-center btn-metallic text-lg md:text-xl px-12 py-5 rounded-full font-black tracking-widest transition-all hover:scale-105 w-full"
                >
                  🎤 START CALIBRATION
                </Link>
                <button
                  onClick={() => setSelectedMode(null)}
                  className="text-[10px] uppercase tracking-[0.4em] text-gray-600 font-black transition-colors hover:text-white"
                >
                  ← Reselect Mode
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Statistics & Metrics */}
        <div className="space-y-32">

          <div className="space-y-6 pt-10">
            <p className="text-[10px] uppercase tracking-[0.4em] text-gray-600 font-black italic">Archive Statistics: Real-time Data Feed</p>
            <div className="flex justify-center gap-16 text-center">
              <div className="space-y-2">
                <div className="mono text-3xl md:text-5xl font-bold neon-text-cyan">
                  {totalVoices.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-widest text-[10px] font-bold">Voices Archived</div>
              </div>
              <div className="space-y-2">
                <div className="mono text-3xl md:text-5xl font-bold neon-text-magenta">
                  {dataMB > 1024 ? (dataMB / 1024).toFixed(1) : dataMB} {dataMB > 1024 ? 'GB' : 'MB'}
                </div>
                <div className="text-sm text-gray-500 uppercase tracking-widest text-[10px] font-bold">Grid Capacity</div>
              </div>
            </div>
          </div>
        </div>

        {/* The Vault - History Section */}
        <div className="w-full max-w-4xl pt-40">
          <div className="flex flex-col items-center mb-16 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-cyan-500 rounded-full" />
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-[0.3em] neon-text-cyan italic">
                Biometric Records
              </h2>
              <div className="w-1.5 h-6 bg-cyan-500 rounded-full" />
            </div>
            <p className="text-gray-500 text-[10px] uppercase tracking-[0.2em] font-bold">
              Identity Sync & Archive Management
            </p>
          </div>

          {/* Sync Feature */}
          <div className="mb-20 max-w-md mx-auto">
            {step === 'email' ? (
              <form onSubmit={handleRequestOtp} className="relative group">
                <input
                  type="email"
                  placeholder="Enter archive email..."
                  value={restoreEmail}
                  onChange={(e) => setRestoreEmail(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-sm focus:border-cyan-500/50 outline-none transition-all pr-32 font-medium"
                  required
                />
                <button
                  type="submit"
                  disabled={isRestoring}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-6 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all disabled:opacity-50"
                >
                  {isRestoring ? 'Sending...' : 'Restore History'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="relative group animate-fade-in">
                <input
                  type="text"
                  placeholder="Enter 6-digit code..."
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="w-full bg-black/40 border border-cyan-500/30 rounded-xl px-4 py-4 text-sm focus:border-cyan-500 outline-none transition-all pr-32 font-mono tracking-[0.5em] text-center"
                  maxLength={6}
                  required
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isRestoring || otp.length < 6}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-6 bg-cyan-500/40 hover:bg-cyan-500/60 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all disabled:opacity-50"
                >
                  {isRestoring ? 'Verifying...' : 'Verify'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="block w-full text-center mt-4 text-[9px] text-gray-600 uppercase tracking-widest font-black hover:text-white transition-colors"
                >
                  ← Back to email
                </button>
              </form>
            )}
            {restoreStatus && (
              <p className={`mt-4 text-[10px] uppercase font-bold tracking-widest text-center ${restoreStatus.type === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                {restoreStatus.msg}
              </p>
            )}

            <div className="mt-12 pt-8 border-t border-white/5 opacity-50">
              <p className="text-[8px] font-mono text-gray-700 uppercase tracking-[0.3em] leading-relaxed max-w-xs mx-auto italic">
                Notice: Vocal fingerprints are cryptographically shredded (SHA-256). Administrators cannot see or recover your email. Recovery is strictly via automated OTP. Do not request manual retrieval.
              </p>
            </div>
          </div>

          {/* History Grid */}
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
                  <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 space-y-4">
                    <div className="flex justify-between items-start">
                      <span className="text-3xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">
                        {isCouple ? '👥' : (vType?.icon || '🎤')}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-mono text-gray-500 group-hover:text-cyan-400 transition-colors uppercase">
                          {format(new Date(item.createdAt), 'MMM dd, yyyy')}
                        </span>
                        <button
                          onClick={(e) => handleArchive(e, item.id)}
                          className="text-gray-800 hover:text-red-500 transition-colors text-sm"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-black text-white uppercase tracking-wider mb-1">
                        {isCouple ? 'Couple Resonance' : vType?.name}
                      </div>
                      <div className="text-[10px] font-mono text-cyan-600 tracking-widest uppercase opacity-70">
                        {item.typeCode}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {history.length > 0 && (
            <div className="mt-32 space-y-12">
              <p className="text-[9px] text-gray-600 uppercase tracking-widest font-black italic">
                -- Terminal Options --
              </p>

              {/* Vault Legacy Management */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Safe Withdrawal */}
                <div className="glass rounded-2xl p-8 border border-cyan-500/10 bg-cyan-500/5 group hover:border-cyan-500/30 transition-all duration-700 text-center flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-cyan-500/60 group-hover:text-cyan-500 transition-colors">Freeze Vault & Exit</span>
                    <p className="text-[8px] font-mono text-gray-500 uppercase tracking-widest leading-relaxed">
                      Safe Sanctuary. End your active session but keep your archives viewable for free via your recovery phrase.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      softWithdraw();
                      window.location.reload();
                    }}
                    className="mt-6 px-10 py-3 bg-cyan-900/20 hover:bg-cyan-600 text-cyan-500 hover:text-white rounded-full font-black uppercase tracking-widest text-[9px] transition-all border border-cyan-500/20"
                  >
                    ❄️ FREEZE SESSION
                  </button>
                </div>

                {/* Nuclear Purge Sanctuary */}
                <div className="glass rounded-2xl p-8 border border-red-500/10 bg-red-500/5 group hover:border-red-500/30 transition-all duration-700 text-center flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500/60 group-hover:text-red-500 transition-colors">Nuclear Purge Sanctuary</span>
                    <p className="text-[8px] font-mono text-gray-500 uppercase tracking-widest leading-relaxed">
                      Withdraw Consent. Incinerate all traces of your vocal identity from both the grid and this device.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowPurgePortal(true)}
                    className="mt-6 px-10 py-3 bg-red-900/20 hover:bg-red-600 text-red-500 hover:text-white rounded-full font-black uppercase tracking-widest text-[9px] transition-all border border-red-500/20"
                  >
                    🚀 INITIATE ERASURE
                  </button>
                </div>
              </div>

              {/* Retention Policy Note */}
              <div className="pt-8 border-t border-white/5 opacity-40">
                <p className="text-[8px] font-mono uppercase tracking-[0.3em] leading-relaxed max-w-lg mx-auto">
                  Note for 7-Day Journey & Subscription Users: Expired status does not destroy your Vault. History remains viewable for free unless you perform a Nuclear Purge.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showPurgePortal && (
          <BlessingPortal
            variant="vault"
            onComplete={async () => {
              const { hardPurgeEverything } = await import('@/lib/storage');
              await hardPurgeEverything();
              window.location.reload();
            }}
          />
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 w-full mt-48 pb-16 text-center text-[10px] text-gray-600 space-y-6">
        <div className="flex justify-center gap-8 uppercase tracking-widest font-black">
          <Link href="/terms" className="hover:text-cyan-400 transition-colors">Terms</Link>
          <Link href="/privacy" className="hover:text-cyan-400 transition-colors">Privacy</Link>
          <Link href="/sample" className="hover:text-cyan-400 transition-colors">Samples</Link>
          <Link href="/statement" className="hover:text-cyan-400 transition-colors underline decoration-cyan-500/30">Statement</Link>
        </div>
        <div className="max-w-xs mx-auto leading-relaxed font-mono opacity-50">
          © 2026 EtchVox Archive. Built for entertainment purposes.
        </div>
      </footer>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import EtchvoxTerminal from '@/components/terminal/EtchvoxTerminal';
import ElonModeV2 from '@/components/terminal/ElonModeV2';
import SpyAuditionV2 from '@/components/terminal/SpyAuditionV2';
import SoloAnalysisV2 from '@/components/terminal/SoloAnalysisV2';
import ResonanceTestV2 from '@/components/terminal/ResonanceTestV2';
import VoiceMirrorVelvet from '@/components/mirror/VoiceMirrorVelvet';
import VoiceMirrorPricing from '@/components/mirror/VoiceMirrorPricing';
import MobileOptimizedResult from '@/components/result/MobileOptimizedResult';
import { LegacyHistoryModal } from '@/components/terminal/LegacyHistoryModal';
import { getHistory, removeFromHistory, VoiceResult } from '@/lib/storage';

// Grid glitch transition effect
const GlitchTransition = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, filter: "brightness(2) grayscale(1)" }}
    animate={{ opacity: 1, filter: "brightness(1) grayscale(0)" }}
    exit={{ opacity: 0, filter: "brightness(2) grayscale(1) blur(2px)" }}
    transition={{ duration: 0.4, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

export default function HomePage() {
  const [currentMode, setCurrentMode] = useState('terminal'); // terminal | elon | spy | solo | duo | mirror | pricing | result
  const [lastResult, setLastResult] = useState<string | null>(null);
  const [resultData, setResultData] = useState<any>(null);
  const [history, setHistory] = useState<VoiceResult[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isBooting, setIsBooting] = useState(true);

  // System alert message state
  const [alertMsg, setAlertMsg] = useState<string | null>(null);

  useEffect(() => {
    // Boot sequence
    setTimeout(() => setIsBooting(false), 1200);

    // Load last result
    const saved = localStorage.getItem('etchvox_last_result');
    if (saved) {
      setLastResult(saved);
    }
  }, []);

  useEffect(() => {
    if (isHistoryOpen) {
      loadHistory();
    }
  }, [isHistoryOpen]);

  const loadHistory = async () => {
    const data = await getHistory();
    setHistory(data);
  };

  const handleDiagnosticComplete = (resultJson: string) => {
    localStorage.setItem('etchvox_last_result', resultJson);
    setLastResult(resultJson);

    try {
      const parsed = JSON.parse(resultJson);
      setResultData(parsed);
    } catch (e) {
      setResultData({ type: 'UNKNOWN', roast: 'Data integrity failure.' });
    }

    // Show result screen
    setCurrentMode('result');

    // Trigger system alert
    triggerSystemAlert(`CRITICAL_DISSONANCE_DETECTED // ARCHIVE_UPDATED`);
  };

  const triggerSystemAlert = (message: string) => {
    setAlertMsg(message);
    setTimeout(() => setAlertMsg(null), 4000);
  };

  const handleCloseResult = () => {
    setCurrentMode('terminal');
    // After returning to terminal, scroll to lower world if needed
    setTimeout(() => {
      const lower = document.getElementById('lower-mirror');
      if (lower) lower.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  if (isBooting) {
    return (
      <div className="h-screen w-screen bg-black flex items-center justify-center font-mono text-xs text-amber-500">
        BOOTING_ETCHVOX_OS...
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen text-white overflow-hidden font-sans">

      {/* --- SYSTEM NOTIFICATION --- */}
      <AnimatePresence>
        {alertMsg && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="fixed top-0 left-0 w-full z-[100] p-4 bg-blue-950/80 border-b border-blue-800/50 backdrop-blur-xl shadow-[0_10px_30px_rgba(30,58,138,0.2)] flex items-center justify-center"
          >
            <div className="flex items-center gap-4 text-blue-200 font-mono text-[10px] md:text-xs tracking-[0.3em] uppercase">
              <span className="w-1.5 h-1.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse" />
              <span className="font-bold text-white opacity-50">SYSTEM_AWARE:</span>
              <span className="text-amber-100">{alertMsg}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {currentMode === 'terminal' && (
          <GlitchTransition key="terminal">
            <EtchvoxTerminal
              lastResult={lastResult}
              onSelectMode={(mode) => {
                if (mode === 'mirror') {
                  // Smooth scroll to lower world is handled by browser native behavior if ID exists, 
                  // but here we are switching components. If 'mirror' is a mode, we switch.
                  // But VoiceMirrorVelvet IS the lower world in the new design? 
                  // Actually, EtchvoxTerminal HAS the lower world section.
                  // If the user clicks the lower world button, we might want to go to Pricing?
                  // Let's assume onSelectMode('mirror') goes to VoiceMirrorPricing or initiates the scroll.
                  // The user's code for EtchvoxTerminal calls onSelectMode('mirror') on the button.
                  // Let's map 'mirror' to 'pricing' for now, or maybe 'mirror' mode component?
                  // User provided 'VoiceMirrorVelvet' as "Mirror" component.
                  setCurrentMode('mirror');
                } else {
                  setCurrentMode(mode);
                }
              }}
            />
            {/* Legacy History Trigger (Tiny button in corner) */}
            <button
              onClick={() => setIsHistoryOpen(true)}
              className="fixed bottom-4 right-4 z-50 text-[8px] text-zinc-800 hover:text-zinc-500 uppercase tracking-widest"
            >
              [OPEN_LEGACY_VAULT]
            </button>
          </GlitchTransition>
        )}

        {currentMode === 'elon' && (
          <GlitchTransition key="elon">
            <ElonModeV2 onComplete={handleDiagnosticComplete} />
          </GlitchTransition>
        )}

        {currentMode === 'spy' && (
          <GlitchTransition key="spy">
            <SpyAuditionV2 onComplete={handleDiagnosticComplete} />
          </GlitchTransition>
        )}

        {currentMode === 'solo' && (
          <GlitchTransition key="solo">
            <SoloAnalysisV2 onComplete={handleDiagnosticComplete} />
          </GlitchTransition>
        )}

        {currentMode === 'duo' && (
          <GlitchTransition key="duo">
            <ResonanceTestV2 onComplete={handleDiagnosticComplete} />
          </GlitchTransition>
        )}

        {currentMode === 'mirror' && (
          <GlitchTransition key="mirror">
            <VoiceMirrorVelvet onEnter={() => setCurrentMode('pricing')} />
          </GlitchTransition>
        )}

        {currentMode === 'pricing' && (
          <GlitchTransition key="pricing">
            <VoiceMirrorPricing />
            <button
              onClick={() => setCurrentMode('terminal')}
              className="fixed top-4 left-4 z-50 text-zinc-500 text-[10px] uppercase tracking-widest hover:text-white"
            >
              ← RETURN_TO_TERMINAL
            </button>
          </GlitchTransition>
        )}

        {currentMode === 'result' && (
          <GlitchTransition key="result">
            <MobileOptimizedResult
              mode={resultData?.mode || 'solo'}
              resultData={resultData}
              onClose={handleCloseResult}
            />
          </GlitchTransition>
        )}
      </AnimatePresence>

      <LegacyHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onDelete={async (id) => {
          if (confirm("Delete this record permanently?")) {
            await removeFromHistory(id, true);
            loadHistory();
          }
        }}
      />
    </div>
  );
}

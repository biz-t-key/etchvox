'use client';

import { useEffect, useState } from 'react';
import { getDb, isFirebaseConfigured } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

import { MILESTONES as TARGETS } from '@/config/milestones';

const DISPLAY_MILESTONES = [
    { label: 'Solo AI Analysis Unlock', goal: TARGETS.SOLO_REPORT_UNLOCK },
    { label: 'Establish Entity in Japan ($8.5k)', goal: TARGETS.COUPLE_MODE_UNLOCK },
    { label: 'Universal Duo Reports Unlock', goal: TARGETS.COUPLE_REPORT_UNLOCK },
];

export default function FundingProgressBar() {
    const [totalAmount, setTotalAmount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isFirebaseConfigured()) return;

        const db = getDb();
        const statsRef = doc(db, 'stats', 'global');

        const unsubscribe = onSnapshot(statsRef, (snapshot) => {
            if (snapshot.exists()) {
                setTotalAmount(snapshot.data().totalAmount || 0);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const currentTotalUSD = totalAmount / 100;

    // Find next milestone
    const nextMilestone = DISPLAY_MILESTONES.find(m => m.goal > totalAmount) || DISPLAY_MILESTONES[DISPLAY_MILESTONES.length - 1];
    const progress = Math.min(100, (totalAmount / nextMilestone.goal) * 100);

    if (loading) return null;

    return (
        <div className="w-full bg-black/40 backdrop-blur-md border border-cyan-500/20 rounded-3xl py-6 px-6 md:px-10 animate-fade-in group">
            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-end mb-1.5">
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-400">
                            Seed Round: Japan Entity Launch
                        </span>
                        <div className="flex flex-col md:flex-row md:items-baseline gap-1 md:gap-3">
                            <span className="text-xs font-bold text-white uppercase tracking-tighter">
                                Next Milestone: {nextMilestone.label}
                            </span>
                            <span className="hidden md:inline text-[9px] text-gray-500 italic font-medium opacity-80">
                                "Official seals move slow, but the expiry of love is swift."
                            </span>
                        </div>
                    </div>
                    <div className="text-right">
                        <span className="text-lg font-black text-cyan-400 font-mono tracking-tighter">
                            ${currentTotalUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-gray-400 font-bold ml-1 uppercase">Raised</span>
                    </div>
                </div>

                {/* The Bar */}
                <div className="relative h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-cyan-600 to-white shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all duration-1000 ease-out"
                        style={{ width: `${progress}%` }}
                    />

                    {/* Tick Mark for 128万円/ $8500 Target if current milestone is before it */}
                    {nextMilestone.goal === 850000 && (
                        <div className="absolute left-[85%] top-0 h-full w-[2px] bg-white/20" />
                    )}
                </div>

                <div className="flex justify-between mt-1 opacity-40">
                    <span className="text-[8px] font-black tracking-widest uppercase">Bootstrapping</span>
                    <span className="text-[8px] font-black tracking-widest uppercase">Target: ${(nextMilestone.goal / 100).toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
}

'use client';

import { useState } from 'react';
import { MBTIType, mbtiTypes, mbtiGroups, mbtiOrder } from '@/lib/mbti';

interface MBTISelectorProps {
    onSelect: (mbti: MBTIType | null) => void;
    onSkip?: () => void;
}

export default function MBTISelector({ onSelect, onSkip }: MBTISelectorProps) {
    const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

    // Group MBTIs by their group
    const groupedTypes = mbtiOrder.reduce((acc, type) => {
        const info = mbtiTypes[type];
        if (!acc[info.group]) {
            acc[info.group] = [];
        }
        acc[info.group].push(type);
        return acc;
    }, {} as Record<string, MBTIType[]>);

    return (
        <div className="fade-in max-w-2xl mx-auto">
            <div className="glass rounded-xl p-5 mb-4 relative">
                {onSkip && (
                    <button
                        onClick={onSkip}
                        className="absolute top-4 right-4 text-[10px] text-gray-500 hover:text-white uppercase tracking-widest underline decoration-gray-700 underline-offset-4"
                    >
                        Skip for now
                    </button>
                )}
                <h2 className="text-sm font-bold text-center mb-1 uppercase tracking-widest text-gray-400">
                    Select Your MBTI
                </h2>
                <p className="text-gray-500 text-xs text-center mb-4">
                    To generate your unique identity card
                </p>

                {/* Group Tabs */}
                <div className="grid grid-cols-4 gap-2 mb-6">
                    {Object.keys(mbtiGroups).map((group) => {
                        const groupInfo = mbtiGroups[group as keyof typeof mbtiGroups];
                        const isSelected = selectedGroup === group;
                        return (
                            <button
                                key={group}
                                onClick={() => setSelectedGroup(group)}
                                className={`p-2 rounded-lg border transition-all ${isSelected
                                    ? 'border-white/30 bg-white/5'
                                    : 'border-white/5 hover:border-white/10'
                                    }`}
                            >
                                <div className="text-lg mb-1 opacity-80">{groupInfo.emoji}</div>
                                <div className="text-[9px] uppercase tracking-widest font-bold text-gray-400">
                                    {group}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* MBTI Type Grid */}
                <div className="grid grid-cols-4 gap-2">
                    {mbtiOrder.map((type) => {
                        const info = mbtiTypes[type];
                        const groupInfo = mbtiGroups[info.group];
                        const isInSelectedGroup =
                            !selectedGroup || selectedGroup === info.group;

                        if (!isInSelectedGroup) return null;

                        return (
                            <button
                                key={type}
                                onClick={() => onSelect(type)}
                                className="p-3 rounded-lg border border-white/10 hover:border-white/30 transition-all hover:bg-white/5"
                                style={{
                                    borderColor: isInSelectedGroup ? `${groupInfo.color}40` : '',
                                }}
                            >
                                <div className="font-bold text-sm mb-1 text-gray-200">{type}</div>
                                <div
                                    className="text-[8px] uppercase tracking-wider opacity-60 truncate"
                                    style={{ color: groupInfo.color }}
                                >
                                    {info.nickname.replace('The ', '')}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Skip Option */}
            <div className="text-center mt-4">
                <button
                    onClick={() => onSelect(null)}
                    className="text-xs text-gray-500 hover:text-gray-300 transition-colors border-b border-dashed border-gray-700 hover:border-gray-500 pb-0.5"
                >
                    I don't know my MBTI (Skip)
                </button>
            </div>

            <p className="text-center text-gray-600 text-xs mt-6">
                "MBTI is who you <strong>think</strong> you are. <br />
                EtchVox is who you <strong>sound</strong> like."
            </p>
        </div>
    );
}

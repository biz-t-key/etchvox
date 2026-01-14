'use client';

import { useState } from 'react';
import { MBTIType, mbtiTypes, mbtiGroups, mbtiOrder } from '@/lib/mbti';

interface MBTISelectorProps {
    onSelect: (mbti: MBTIType) => void;
}

export default function MBTISelector({ onSelect }: MBTISelectorProps) {
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
            <div className="glass rounded-xl p-6 mb-6">
                <h2 className="text-xl font-bold text-center mb-2">
                    <span className="neon-text-cyan">Your MBTI Type?</span>
                </h2>
                <p className="text-gray-400 text-sm text-center mb-6">
                    Select your MBTI to generate a unique share card
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
                                className={`p-3 rounded-lg border transition-all ${isSelected
                                    ? 'border-white/30 scale-105'
                                    : 'border-white/10 hover:border-white/20'
                                    }`}
                                style={{
                                    background: isSelected
                                        ? `${groupInfo.color}20`
                                        : 'transparent',
                                }}
                            >
                                <div className="text-2xl mb-1">{groupInfo.emoji}</div>
                                <div className="text-[10px] uppercase tracking-wider">
                                    {group}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* MBTI Type Grid */}
                <div className="grid grid-cols-4 gap-3">
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
                                className="p-4 rounded-lg border border-white/10 hover:border-white/30 transition-all transform hover:scale-105"
                                style={{
                                    background: `linear-gradient(135deg, ${groupInfo.color}15, ${groupInfo.color}05)`,
                                }}
                            >
                                <div className="font-bold text-lg mb-1">{type}</div>
                                <div
                                    className="text-[9px] uppercase tracking-wider opacity-70"
                                    style={{ color: groupInfo.color }}
                                >
                                    {info.nickname.replace('The ', '')}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            <p className="text-center text-gray-600 text-xs">
                "MBTI is who you <strong>think</strong> you are. <br />
                EtchVox is who you <strong>sound</strong> like."
            </p>
        </div>
    );
}

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { format } from 'date-fns';
import { VoiceResult } from '@/lib/storage';
import { voiceTypes } from '@/lib/types';

interface LegacyHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    history: VoiceResult[];
    onDelete: (id: string) => void;
}

export const LegacyHistoryModal: React.FC<LegacyHistoryModalProps> = ({ isOpen, onClose, history, onDelete }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/90 backdrop-blur-md"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="relative z-10 w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-lg max-h-[80vh] flex flex-col overflow-hidden"
                    >
                        <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                            <h3 className="text-zinc-400 font-mono text-xs tracking-widest uppercase">Legacy_Archive_V1</h3>
                            <button onClick={onClose} className="text-zinc-500 hover:text-white">✕</button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {history.length === 0 ? (
                                <div className="text-center text-zinc-600 font-mono text-xs py-10">NO DATA FOUND</div>
                            ) : (
                                history.map(item => {
                                    const isCouple = !!item.coupleData;
                                    const vType = isCouple ? null : voiceTypes[item.typeCode as keyof typeof voiceTypes];
                                    return (
                                        <div key={item.id} className="flex justify-between items-center p-4 border border-zinc-900 bg-zinc-900/30 rounded hover:border-zinc-700 transition-colors">
                                            <div>
                                                <div className="text-xs font-bold text-zinc-300">
                                                    {isCouple ? 'COUPLE RESONANCE' : vType?.name || item.typeCode}
                                                </div>
                                                <div className="text-[10px] text-zinc-600 font-mono mt-1">
                                                    {format(new Date(item.createdAt), 'yyyy-MM-dd HH:mm')} <span className="opacity-50"> // ID: {item.id.slice(0, 8)}</span>
                                                </div>
                                            </div>
                                            <button onClick={(e) => { e.stopPropagation(); onDelete(item.id); }} className="text-zinc-600 hover:text-red-500 text-xs px-2">
                                                DELETE
                                            </button>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

'use client';

import { useState, useRef, useEffect } from 'react';
import { getAudioBlob, getAllAudioBlobs } from '@/lib/mirrorDb';
import { loadVoiceLogHistory, type VoiceLog } from '@/lib/mirrorEngine';

interface MirrorRecapProps {
    userHash: string;
    onClose: () => void;
    archetype?: string;
    demoMode?: boolean;
}

export default function MirrorRecap({ userHash, onClose, archetype = 'optimizer', demoMode = false }: MirrorRecapProps) {
    const [audioUrls, setAudioUrls] = useState<string[]>([]);
    const [logs, setLogs] = useState<VoiceLog[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [exportUrl, setExportUrl] = useState<string | null>(null);

    const THEMES: Record<string, any> = {
        optimizer: {
            bg: '#0a0a0a',
            font: "'Inter', sans-serif",
            align: 'left' as const,
            color: '#FFFFFF',
            blend: 'screen' as GlobalCompositeOperation,
            letterSpacing: 2,
            lineHeight: 1.6,
            stamp: 'barcode_cyan',
            visuals: (ctx: CanvasRenderingContext2D) => {
                ctx.shadowColor = 'rgba(255,255,255,0.4)';
                ctx.shadowBlur = 10;
            }
        },
        stoic: {
            bg: '#f4f1ea',
            font: "'EB Garamond', serif",
            align: 'center' as const,
            color: '#2C2C2C',
            blend: 'multiply' as GlobalCompositeOperation,
            letterSpacing: -0.5,
            lineHeight: 1.4,
            stamp: 'wax_seal_red',
            visuals: (ctx: CanvasRenderingContext2D) => {
                ctx.globalAlpha = 0.85;
            }
        },
        alchemist: {
            bg: '#1a120b',
            font: "'Cinzel', serif",
            align: 'center' as const,
            color: '#EAD6A8',
            blend: 'color-dodge' as GlobalCompositeOperation,
            letterSpacing: 4,
            lineHeight: 2.0,
            stamp: 'sacred_geometry_gold',
            visuals: (ctx: CanvasRenderingContext2D) => {
                ctx.shadowColor = '#CCA352';
                ctx.shadowBlur = 5;
            }
        },
        cinematic_grit: {
            bg: '#121212',
            font: "'Oswald', sans-serif",
            align: 'left' as const,
            color: '#D1D1D1',
            blend: 'hard-light' as GlobalCompositeOperation,
            letterSpacing: 1,
            lineHeight: 1.2,
            stamp: 'industrial_stencil_white',
            visuals: (ctx: CanvasRenderingContext2D) => {
                ctx.filter = 'contrast(1.2)';
            }
        }
    };

    const drawStamp = (ctx: CanvasRenderingContext2D, style: string, x: number, y: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-0.1); // Slightly tilted for authenticity

        if (style === 'barcode_cyan') {
            ctx.fillStyle = '#22d3ee';
            for (let i = 0; i < 30; i++) {
                const w = Math.random() * 4 + 1;
                ctx.fillRect(i * 5, 0, w, 40);
            }
            ctx.font = '8px monospace';
            ctx.fillText("ETCHVOX-OPTIMIZER-REV4", 0, 50);
        } else if (style === 'wax_seal_red') {
            ctx.fillStyle = '#8b0000';
            ctx.beginPath();
            ctx.arc(25, 25, 25, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = '#5c0000';
            ctx.lineWidth = 2;
            ctx.stroke();
            ctx.fillStyle = '#5c0000';
            ctx.font = 'bold 20px serif';
            ctx.textAlign = 'center';
            ctx.fillText("Σ", 25, 33);
        } else if (style === 'sacred_geometry_gold') {
            ctx.strokeStyle = '#CCA352';
            ctx.lineWidth = 1;
            for (let i = 0; i < 6; i++) {
                ctx.beginPath();
                ctx.arc(25, 25, 20, (i * Math.PI) / 3, ((i + 1) * Math.PI) / 3);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(25, 25);
                ctx.lineTo(25 + 20 * Math.cos(i * Math.PI / 3), 25 + 20 * Math.sin(i * Math.PI / 3));
                ctx.stroke();
            }
        } else if (style === 'industrial_stencil_white') {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.strokeRect(0, 0, 100, 40);
            ctx.font = 'bold 14px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText("CLASSIFIED", 10, 25);
            ctx.fillRect(0, 30, 100, 2);
        }
        ctx.restore();
    };

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationRef = useRef<number | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);

    useEffect(() => {
        loadRecapData();
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            audioUrls.forEach(url => URL.revokeObjectURL(url));
            if (exportUrl) URL.revokeObjectURL(exportUrl);
        };
    }, []);

    async function loadRecapData() {
        if (demoMode) {
            setLogs(Array.from({ length: 7 }).map((_, i) => ({
                timestamp: new Date(),
                calibrationVector: new Array(30).fill(0),
                readingVector: new Array(30).fill(0),
                context: {
                    timeCategory: 'Evening',
                    dayCategory: 'Weekday',
                    dayIndex: i + 1,
                    readingText: `This is a demo playback for day ${i + 1}. The voice of the future is being synthesized in real-time.`,
                },
                alignmentScore: 85 + (i * 2)
            } as any)));
            setAudioUrls(new Array(7).fill('')); // Empty URLs for demo, UI will handle
            setIsLoading(false);
            return;
        }

        try {
            const allLogs = loadVoiceLogHistory();
            const blobs = await getAllAudioBlobs(userHash);

            if (blobs.length === 0) {
                // Fallback if no real data found
                setIsLoading(false);
                return;
            }

            // Limit to relevant blobs and sort
            const urls = blobs.map(b => URL.createObjectURL(b.blob));

            // Match logs by dayIndex (1-7)
            const matchedLogs = blobs.map(b => {
                return allLogs.find(l => l.context.dayIndex === b.dayIndex) || allLogs[allLogs.length - 1];
            });

            setAudioUrls(urls);
            setLogs(matchedLogs);
            setIsLoading(false);
        } catch (e) {
            console.error('Failed to load recap data:', e);
            setIsLoading(false);
        }
    }

    const startExport = () => {
        if (audioUrls.length === 0) return;
        setIsRecording(true);
        setIsPlaying(true);
        setCurrentIndex(0);
        recordedChunksRef.current = [];
        playTrack(0, true);
    };

    const startPlayback = () => {
        if (audioUrls.length === 0) return;
        setIsPlaying(true);
        setCurrentIndex(0);
        playTrack(0, false);
    };

    const playTrack = (index: number, recording: boolean) => {
        if (!audioRef.current || (!audioUrls[index] && !demoMode)) {
            if (recording) stopRecording();
            setIsPlaying(false);
            return;
        }

        if (demoMode) {
            setupVisualizer(recording);
            // Simulate 3 seconds per track in demo
            setTimeout(() => {
                if (isPlaying) handleEnded();
            }, 3000);
            return;
        }

        audioRef.current.src = audioUrls[index];
        audioRef.current.play();
        setupVisualizer(recording);
    };

    const setupVisualizer = (recording: boolean) => {
        if (!audioRef.current || !canvasRef.current) return;

        if (!audioContextRef.current && !demoMode) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
            analyzerRef.current = audioContextRef.current.createAnalyser();

            const source = audioContextRef.current.createMediaElementSource(audioRef.current);
            source.connect(analyzerRef.current);
            analyzerRef.current.connect(audioContextRef.current.destination);

            if (recording) {
                const dest = audioContextRef.current.createMediaStreamDestination();
                source.connect(dest);

                // @ts-ignore - captureStream exists on Canvas
                const canvasStream = canvasRef.current.captureStream(30);
                const combinedStream = new MediaStream([
                    ...canvasStream.getVideoTracks(),
                    ...dest.stream.getAudioTracks()
                ]);

                mediaRecorderRef.current = new MediaRecorder(combinedStream, { mimeType: 'video/webm' });
                mediaRecorderRef.current.ondataavailable = (e) => {
                    if (e.data.size > 0) recordedChunksRef.current.push(e.data);
                };
                mediaRecorderRef.current.onstop = () => {
                    const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
                    const url = URL.createObjectURL(blob);
                    setExportUrl(url);
                };
                mediaRecorderRef.current.start();
            }
        }

        // FFT config
        const bufferLength = 128; // Smaller for cleaner lines
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (!canvasRef.current || !analyzerRef.current) return;
            const ctx = canvasRef.current.getContext('2d')!;
            const width = canvasRef.current.width;
            const height = canvasRef.current.height;

            animationRef.current = requestAnimationFrame(draw);

            if (demoMode && isPlaying && !analyzerRef.current) {
                // Simulate wave data for demo
                for (let i = 0; i < bufferLength; i++) {
                    dataArray[i] = 128 + Math.sin(i * 0.2 + Date.now() * 0.01) * 30 + (Math.random() * 10);
                }
            } else if (analyzerRef.current) {
                analyzerRef.current.getByteTimeDomainData(dataArray);
            }

            ctx.clearRect(0, 0, width, height);
            const theme = THEMES[archetype] || THEMES.optimizer;

            // Draw Archetype Background
            ctx.fillStyle = theme.bg;
            ctx.fillRect(0, 0, width, height);

            if (archetype === 'optimizer') {
                ctx.strokeStyle = 'rgba(34, 211, 238, 0.2)';
                for (let x = 0; x < width; x += 40) {
                    ctx.beginPath();
                    ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
                }
                for (let y = 0; y < height; y += 40) {
                    ctx.beginPath();
                    ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
                }
            } else if (archetype === 'stoic') {
                // Subtle parchment texture
                ctx.fillStyle = theme.color + '05';
                for (let i = 0; i < 100; i++) {
                    ctx.fillRect(Math.random() * width, Math.random() * height, 2, 2);
                }
            } else if (archetype === 'cinematic_grit') {
                // Lead / Concrete texture
                ctx.fillStyle = theme.color + '05';
                ctx.fillRect(0, height * 0.7, width, height * 0.3);
            }

            // Draw Visualizer
            ctx.lineWidth = 3;
            ctx.strokeStyle = theme.color;
            ctx.globalCompositeOperation = theme.blend;
            ctx.beginPath();

            const sliceWidth = width / bufferLength;
            let x = 0;

            for (let i = 0; i < bufferLength; i++) {
                const v = dataArray[i] / 128.0;
                const y = (v * height) / 2;

                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);

                x += sliceWidth;
            }

            ctx.lineTo(width, height / 2);

            // Add Glow/Effects
            theme.visuals(ctx);
            ctx.stroke();

            // Draw Identity Stamp
            drawStamp(ctx, theme.stamp, width - 150, 40);

            // Reset for Text
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
            ctx.globalCompositeOperation = 'source-over';
            ctx.filter = 'none';

            // Draw Text Overlay (Simplified for Canvas)
            if (isPlaying) {
                const text = logs[currentIndex]?.context.readingText || `Day ${currentIndex + 1}`;
                const displayText = archetype === 'cinematic_grit' ? text.toUpperCase() : text;

                ctx.font = `italic 24px ${theme.font}`;
                ctx.fillStyle = theme.color;
                ctx.textAlign = theme.align;

                const textX = theme.align === 'center' ? width / 2 : 40;
                let lineY = height - 100;

                // Simple word wrap for canvas
                const words = displayText.split(' ');
                let line = '';
                for (let n = 0; n < words.length; n++) {
                    let testLine = line + words[n] + ' ';
                    let metrics = ctx.measureText(testLine);
                    let testWidth = metrics.width;
                    if (testWidth > width - 100 && n > 0) {
                        ctx.fillText(line.trim(), textX, lineY);
                        line = words[n] + ' ';
                        lineY += 35;
                    } else {
                        line = testLine;
                    }
                }
                ctx.fillText(line.trim(), textX, lineY);

                if (logs[currentIndex]?.alignmentScore) {
                    ctx.font = `12px monospace`;
                    ctx.globalAlpha = 0.6;
                    ctx.fillText(`ALIGNMENT: ${logs[currentIndex].alignmentScore}%`, textX, lineY + 30);
                    ctx.globalAlpha = 1;
                }
            }
        };

        draw();
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    };

    const handleEnded = () => {
        if (currentIndex < audioUrls.length - 1) {
            const nextIndex = currentIndex + 1;
            setCurrentIndex(nextIndex);
            playTrack(nextIndex, isRecording);
        } else {
            if (isRecording) stopRecording();
            setIsPlaying(false);
        }
    };

    const downloadVideo = () => {
        if (!exportUrl) return;
        const a = document.createElement('a');
        a.href = exportUrl;
        a.download = `voice_mirror_journey_${new Date().toISOString().split('T')[0]}.webm`;
        a.click();
    };

    const purgeData = async () => {
        if (confirm('Are you sure? This will delete all 7 days of audio data and reset your progress.')) {
            const { clearAudioBlobs } = await import('@/lib/mirrorDb');
            const { clearVoiceLogHistory } = await import('@/lib/mirrorEngine');
            await clearAudioBlobs();
            clearVoiceLogHistory();
            localStorage.removeItem('mirror_genre_selection');
            onClose();
        }
    }

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center">
                <div className="text-cyan-400 animate-pulse font-mono">Preparing your 7-day recap...</div>
            </div>
        );
    }

    const theme = THEMES[archetype] || THEMES.optimizer;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 text-slate-900 overflow-hidden" style={{ backgroundColor: theme.bg }}>
            {/* Texture Overlay */}
            {archetype === 'stoic' && (
                <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
            )}
            {archetype === 'alchemist' && (
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
            )}

            <div className="max-w-4xl w-full flex flex-col items-center space-y-12 relative z-10">
                <div className="text-center space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-[0.3em]" style={{ color: theme.color + '80' }}>The Seven Day Resonance</h2>
                    <h1 className="text-5xl" style={{ fontFamily: theme.font, color: theme.color }}>Dossier: {archetype.replace('_', ' ').toUpperCase()}</h1>
                </div>

                {/* Main Visualizer Area */}
                <div className="w-full aspect-video border rounded-lg shadow-inner relative flex flex-col items-center justify-center overflow-hidden"
                    style={{ borderColor: theme.color + '30', backgroundColor: archetype === 'optimizer' ? 'rgba(255,255,255,0.05)' : 'transparent' }}>
                    <canvas ref={canvasRef} width={800} height={450} className="w-full h-full" />
                </div>

                {/* Progress Indicators */}
                <div className="w-full grid grid-cols-7 gap-4 px-12">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="space-y-2 text-center">
                            <div className="h-1 w-full rounded-full transition-all duration-500"
                                style={{
                                    backgroundColor: i === currentIndex && isPlaying ? theme.color :
                                        i < currentIndex ? theme.color + '80' : theme.color + '20',
                                    transform: i === currentIndex && isPlaying ? 'scaleY(1.5)' : 'none'
                                }} />
                            <span className="text-[10px] font-mono" style={{ color: theme.color + '60' }}>DAY {i + 1}</span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col items-center gap-6">
                    {!isPlaying && !isRecording ? (
                        <div className="flex flex-col items-center gap-4">
                            {!exportUrl ? (
                                <button
                                    onClick={startExport}
                                    className="px-8 py-3 rounded-full font-serif italic text-sm transition shadow-lg flex items-center gap-3"
                                    style={{ backgroundColor: theme.color, color: theme.bg }}
                                >
                                    <span>🎥</span> Export As Video
                                </button>
                            ) : (
                                <button
                                    onClick={downloadVideo}
                                    className="px-8 py-3 bg-green-600 text-white rounded-full font-serif italic text-sm hover:bg-green-700 transition shadow-lg flex items-center gap-3"
                                >
                                    <span>💾</span> Download Your Movie
                                </button>
                            )}

                            <button
                                onClick={startPlayback}
                                className="px-12 py-4 rounded-full font-serif italic text-lg transition shadow-lg flex items-center gap-3"
                                style={{ backgroundColor: theme.color, color: theme.bg }}
                            >
                                <span>▶</span> Start The Playback
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <span className={`w-2 h-2 rounded-full animate-pulse`} style={{ backgroundColor: isRecording ? '#ef4444' : theme.color }} />
                            <span className="font-mono text-sm uppercase tracking-widest" style={{ color: theme.color + '80' }}>
                                {isRecording ? 'Encoding Visual History...' : 'Playing Historical Echoes'}
                            </span>
                        </div>
                    )}

                    {!isPlaying && !isRecording && (
                        <div className="flex items-center gap-8 border-t pt-6" style={{ borderColor: theme.color + '20' }}>
                            <button
                                onClick={onClose}
                                className="text-sm font-mono transition"
                                style={{ color: theme.color + '60' }}
                            >
                                Finish Journey
                            </button>
                            <button
                                onClick={purgeData}
                                className="text-sm font-mono transition"
                                style={{ color: '#ef4444' }}
                            >
                                Purge & Reset Phase
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <audio
                ref={audioRef}
                onEnded={handleEnded}
                onPlay={() => setIsPlaying(true)}
                className="hidden"
            />

            <style jsx>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 1s ease-out forwards;
                }
            `}</style>
        </div>
    );
}

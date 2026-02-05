'use client';

import { useState, useRef, useEffect } from 'react';
import { getAudioBlob, getAllAudioBlobs } from '@/lib/mirrorDb';

interface MirrorRecapProps {
    userHash: string;
    onClose: () => void;
}

export default function MirrorRecap({ userHash, onClose }: MirrorRecapProps) {
    const [audioUrls, setAudioUrls] = useState<string[]>([]);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isRecording, setIsRecording] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [exportUrl, setExportUrl] = useState<string | null>(null);

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
        try {
            const blobs = await getAllAudioBlobs(userHash);
            const urls = blobs.map(b => URL.createObjectURL(b.blob));
            setAudioUrls(urls);
            setIsLoading(false);
        } catch (e) {
            console.error('Failed to load recap audio:', e);
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
        if (!audioRef.current || !audioUrls[index]) {
            if (recording) stopRecording();
            setIsPlaying(false);
            return;
        }

        audioRef.current.src = audioUrls[index];
        audioRef.current.play();
        setupVisualizer(recording);
    };

    const setupVisualizer = (recording: boolean) => {
        if (!audioRef.current || !canvasRef.current) return;

        if (!audioContextRef.current) {
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

        analyzerRef.current!.fftSize = 256;
        const bufferLength = analyzerRef.current!.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (!canvasRef.current || !analyzerRef.current) return;
            const ctx = canvasRef.current.getContext('2d')!;
            const width = canvasRef.current.width;
            const height = canvasRef.current.height;

            animationRef.current = requestAnimationFrame(draw);
            analyzerRef.current.getByteTimeDomainData(dataArray);

            ctx.clearRect(0, 0, width, height);
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#22d3ee'; // cyan-400
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
            ctx.stroke();
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

    return (
        <div className="fixed inset-0 z-50 bg-[#f4f1ea] flex flex-col items-center justify-center p-8 text-slate-900 overflow-hidden">
            {/* Parchment Texture Overlay */}
            <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />

            <div className="max-w-4xl w-full flex flex-col items-center space-y-12 relative z-10">
                <div className="text-center space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500">The Seven Day Echo</h2>
                    <h1 className="text-5xl font-serif italic text-slate-800">Voice Mirror Recap</h1>
                </div>

                {/* Main Visualizer Area */}
                <div className="w-full aspect-video bg-white/40 border border-slate-300 rounded-lg shadow-inner relative flex flex-col items-center justify-center overflow-hidden">
                    <canvas ref={canvasRef} width={800} height={200} className="w-full h-48 opacity-60" />

                    {/* Animated Text Display */}
                    <div className="mt-8 text-center px-12 h-24 flex items-center justify-center">
                        <p className="text-2xl font-serif leading-relaxed text-slate-700 italic animate-fade-in">
                            {isPlaying ? `Session Day ${currentIndex + 1}` : "Your journey across the last 7 cycles."}
                        </p>
                    </div>
                </div>

                {/* Progress Indicators */}
                <div className="w-full grid grid-cols-7 gap-4 px-12">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="space-y-2 text-center">
                            <div className={`h-1 w-full rounded-full transition-all duration-500 ${i === currentIndex && isPlaying ? 'bg-cyan-500 scale-y-150' :
                                    i < currentIndex || (i === currentIndex && !isPlaying && currentIndex > 0) ? 'bg-slate-400' : 'bg-slate-200'
                                }`} />
                            <span className="text-[10px] font-mono text-slate-400">DAY {i + 1}</span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col items-center gap-6">
                    {!isPlaying && !isRecording ? (
                        <div className="flex flex-col items-center gap-4">
                            {!exportUrl ? (
                                <button
                                    onClick={startExport}
                                    className="px-8 py-3 bg-cyan-600 text-white rounded-full font-serif italic text-sm hover:bg-cyan-700 transition shadow-lg flex items-center gap-3"
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
                                className="px-12 py-4 bg-slate-900 text-white rounded-full font-serif italic text-lg hover:bg-slate-800 transition shadow-lg flex items-center gap-3"
                            >
                                <span>▶</span> Start The Playback
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <span className={`w-2 h-2 rounded-full animate-pulse ${isRecording ? 'bg-red-500' : 'bg-cyan-500'}`} />
                            <span className="font-mono text-sm uppercase tracking-widest text-slate-500">
                                {isRecording ? 'Encoding Visual History...' : 'Playing Historical Echoes'}
                            </span>
                        </div>
                    )}

                    {!isPlaying && !isRecording && (
                        <div className="flex items-center gap-8 border-t border-slate-200 pt-6">
                            <button
                                onClick={onClose}
                                className="text-slate-400 hover:text-slate-600 text-sm font-mono transition"
                            >
                                Finish Journey
                            </button>
                            <button
                                onClick={purgeData}
                                className="text-red-400 hover:text-red-600 text-sm font-mono transition"
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

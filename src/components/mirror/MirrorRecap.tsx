'use client';

import { useState, useRef, useEffect } from 'react';
import { getAudioBlob, getAllAudioBlobs } from '@/lib/mirrorDb';
import { loadVoiceLogHistory, type VoiceLog } from '@/lib/mirrorEngine';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [audioBuffers, setAudioBuffers] = useState<AudioBuffer[]>([]);
    const [exportUrl, setExportUrl] = useState<string | null>(null);
    const [exportMode, setExportMode] = useState<'full' | 'sns'>('full');
    const [revealPhase, setRevealPhase] = useState<'IDLE' | 'RECALLING' | 'SYNCING' | 'STITCHING' | 'FINALIZING' | 'SUCCESS'>('IDLE');
    const [revealLogs, setRevealLogs] = useState<string[]>([]);

    const THEMES: Record<string, any> = {
        OPTIMIZER: {
            name: "The Optimizer",
            bg: '#001540',
            bgImage: '/assets/mirror/optimizer.png',
            font: "'JetBrains Mono', monospace",
            align: 'left' as const,
            color: '#FFFFFF',
            blend: 'overlay' as GlobalCompositeOperation,
            letterSpacing: 4,
            lineHeight: 1.6,
            stamp: 'barcode_cyan',
            snsLabel: ["LOG_ID: 01", "SYNC_POINT: 04", "ENTITY_FINAL"],
            visuals: (ctx: CanvasRenderingContext2D, params: any) => {
                ctx.shadowColor = 'rgba(255,255,255,0.4)';
                ctx.shadowBlur = 10;
            }
        },
        STOIC: {
            name: "The Stoic",
            bg: '#0d0d0d',
            bgImage: '/assets/mirror/stoic.jpg',
            font: "'Newsreader', serif",
            align: 'center' as const,
            color: '#FFFFFF',
            blend: 'screen' as GlobalCompositeOperation,
            letterSpacing: -1,
            lineHeight: 1.4,
            stamp: 'wax_seal_red',
            snsLabel: ["STANZA 1", "CAESURA 4", "CODA 7"],
            visuals: (ctx: CanvasRenderingContext2D, params: any) => {
                ctx.globalAlpha = 0.85;
            }
        },
        ALCHEMIST: {
            name: "The Alchemist",
            bg: '#1a0033',
            bgImage: '/assets/mirror/alchemist.png',
            font: "'EB Garamond', serif",
            align: 'center' as const,
            color: '#9933ff',
            blend: 'color-dodge' as GlobalCompositeOperation,
            letterSpacing: 8,
            lineHeight: 2.0,
            stamp: 'sacred_geometry_gold',
            snsLabel: ["AXIOM I", "TRANSFORM 4", "CODA 7"],
            visuals: (ctx: CanvasRenderingContext2D, params: any) => {
                ctx.shadowColor = '#9933ff';
                ctx.shadowBlur = 10;
            }
        },
        MAVERICK: {
            name: "The Maverick",
            bg: '#2b002b',
            bgImage: '/assets/mirror/maverick.png',
            font: "'Inter', sans-serif",
            align: 'left' as const,
            color: '#ccff00',
            blend: 'hard-light' as GlobalCompositeOperation,
            letterSpacing: 2,
            lineHeight: 1.2,
            stamp: 'industrial_stencil_white',
            snsLabel: ["EP 01: FRICTION", "EP 04: KINETIC", "EP 07: PROVED"],
            visuals: (ctx: CanvasRenderingContext2D, params: any) => {
                ctx.shadowColor = '#ccff00';
                ctx.shadowBlur = 5;
            }
        },
        SANCTUARY: {
            name: "The Sanctuary",
            bg: '#1a0f0f',
            bgImage: '/assets/mirror/sanctuary.png',
            font: "'Playfair Display', serif",
            align: 'center' as const,
            color: '#f5e6ca',
            blend: 'screen' as GlobalCompositeOperation,
            letterSpacing: 2,
            lineHeight: 1.8,
            stamp: 'leaf_seal_emerald',
            snsLabel: ["STILLNESS 01", "ASCENT 04", "RESTORATION 07"],
            visuals: (ctx: CanvasRenderingContext2D, params: any) => {
                ctx.shadowColor = '#f5e6ca';
                ctx.shadowBlur = 15;
            }
        }
    };

    const drawStamp = (ctx: CanvasRenderingContext2D, style: string, x: number, y: number) => {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(-0.05);

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
            ctx.font = 'bold 24px serif';
            ctx.textAlign = 'center';
            ctx.fillText("Σ", 25, 34);
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
            ctx.strokeRect(0, 0, 120, 45);
            ctx.font = 'bold 16px sans-serif';
            ctx.fillStyle = '#ffffff';
            ctx.fillText("ETCH_RECORD", 10, 28);
            ctx.fillRect(0, 35, 120, 2);
        } else if (style === 'leaf_seal_emerald') {
            ctx.fillStyle = '#10b981';
            ctx.beginPath();
            ctx.moveTo(25, 10);
            ctx.quadraticCurveTo(45, 10, 40, 40);
            ctx.quadraticCurveTo(25, 45, 10, 40);
            ctx.quadraticCurveTo(5, 10, 25, 10);
            ctx.fill();
            ctx.font = 'bold 12px serif';
            ctx.fillStyle = '#064e3b';
            ctx.fillText("RESTORE", 5, 55);
        }
        ctx.restore();
    };

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationRef = useRef<number | null>(null);
    const analyzerRef = useRef<AnalyserNode | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    const masterCompressorRef = useRef<DynamicsCompressorNode | null>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const bgImageRef = useRef<HTMLImageElement | null>(null);
    const cumulativeParams = useRef({
        inkDensity: 0,
        lastV: 0,
        stability: 0,
        shake: 0
    });
    const [dynamicStyles, setDynamicStyles] = useState<React.CSSProperties>({});

    useEffect(() => {
        loadRecapData();
        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            // Cleanup: Revoke blobs only on unmount
            audioUrls.forEach(url => {
                if (url.startsWith('blob:')) URL.revokeObjectURL(url);
            });
            if (exportUrl && exportUrl.startsWith('blob:')) URL.revokeObjectURL(exportUrl);
        };
    }, []); // Only run once on mount

    async function stopRecording() {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
    }

    async function handleEnded() {
        if (exportMode === 'sns') {
            // SNS Flow: 0 -> 3 -> 6 (Day 1, 4, 7)
            if (currentIndex === 0 && audioUrls.length > 3) {
                setCurrentIndex(3);
                playTrack(3, isRecording);
            } else if (currentIndex === 3 && audioUrls.length > 6) {
                setCurrentIndex(6);
                playTrack(6, isRecording);
            } else {
                if (isRecording) stopRecording();
                setIsPlaying(false);
            }
        } else {
            // Full Flow: 0 -> 1 -> 2 -> 3 -> 4 -> 5 -> 6
            if (currentIndex < audioUrls.length - 1) {
                const nextIndex = currentIndex + 1;
                setCurrentIndex(nextIndex);
                playTrack(nextIndex, isRecording);
            } else {
                if (isRecording) stopRecording();
                setIsPlaying(false);
            }
        }
    }

    // Load background image when archetype changes
    useEffect(() => {
        const theme = THEMES[archetype.toUpperCase()] || THEMES.OPTIMIZER;
        if (theme.bgImage) {
            const img = new Image();
            img.src = theme.bgImage;
            img.onload = () => {
                bgImageRef.current = img;
            };
            img.onerror = () => {
                console.warn(`Failed to load background image: ${theme.bgImage}. Falling back to solid color.`);
                bgImageRef.current = null;
            };
        } else {
            bgImageRef.current = null;
        }
    }, [archetype]);

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
                    readingText: `This is a demo playback for day ${i + 1}. The voice of the future is being synthesized.`,
                    mood: i % 2 === 0 ? 'high' : 'low',
                    genre: 'maverick'
                },
                alignmentScore: 85 + (i * 2),
                oracle_feedback: {
                    headline: [
                        "Architectural Stability", "Spectral Variance Detected", "Resonance Peak",
                        "Subtle Frequency Shift", "Vocal Mirroring Active", "Neural Synthesis Complete",
                        "Final Resonance Dossier"
                    ][i],
                    observation: `Day ${i + 1}: Your acoustic footprint shows ${85 + i}% alignment with the ${archetype} protocol. No significant latency detected.`
                }
            } as any)));
            setAudioUrls(new Array(7).fill(''));
            setIsLoading(false);
            return;
        }

        try {
            const allLogs = loadVoiceLogHistory();
            const blobs = await getAllAudioBlobs(userHash);

            if (blobs.length === 0) {
                setIsLoading(false);
                return;
            }

            const urls = blobs.map(b => URL.createObjectURL(b.blob));
            const matchedLogs = blobs.map(b => {
                return allLogs.find(l => l.context.dayIndex === b.dayIndex) || allLogs[allLogs.length - 1];
            });

            // Pre-decode buffers for luxury cross-fade
            const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const decodedBuffers = await Promise.all(blobs.map(async (b) => {
                const arrayBuffer = await b.blob.arrayBuffer();
                return await ctx.decodeAudioData(arrayBuffer);
            }));
            ctx.close();

            setAudioUrls(urls);
            setAudioBuffers(decodedBuffers);
            setLogs(matchedLogs);
            setIsLoading(false);
        } catch (e) {
            console.error('Failed to load recap data:', e);
            setIsLoading(false);
        }
    }

    const startExport = async (mode: 'full' | 'sns' = 'full') => {
        if (audioUrls.length === 0) return;
        setExportMode(mode);
        setIsRecording(false); // Disabling client-side recorder
        setRevealPhase('RECALLING');
        setRevealLogs([]);

        // 1. RECALLING (0s - 1s)
        setTimeout(() => {
            setRevealLogs(prev => [...prev, 'RECALLING RESONANCE FROM THE VOID...', 'FETCHING 7 FRAGMENTS FROM CLOUDFLARE R2...']);
            setRevealPhase('SYNCING');
        }, 1000);

        // 2. SYNCING (1.0s - 2.5s)
        setTimeout(() => {
            setRevealLogs(prev => [...prev, 'DAY 1: THE INITIAL IMPULSE... SYNCED.', 'DAY 4: THE MID-WEEK TURBULENCE... ALIGNED.', 'DAY 7: THE FINAL RESOLUTION... ETCHED.']);
            setRevealPhase('STITCHING');
        }, 2500);

        // 3. STITCHING (2.5s - 4.0s)
        setTimeout(() => {
            setRevealLogs(prev => [...prev, 'WEAVING NARRATIVE ARCS... [||||||||||] 100%', 'APPLYING MASTER EQ & LOUDNORM...']);
            setRevealPhase('FINALIZING');
        }, 4000);

        // Triggers server-side generation
        try {
            const response = await fetch('/api/mirror/recap/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userHash, archetype, mode })
            });
            const data = await response.json();

            // 4. FINALIZING (Wait for both timer and API)
            setTimeout(() => {
                setRevealPhase('SUCCESS');
                if (data.url) setExportUrl(data.url);
            }, 5000);
        } catch (e) {
            console.error('Recap generation failed:', e);
            setRevealPhase('IDLE');
        }
    };

    const startPlayback = () => {
        if (audioUrls.length === 0) return;
        setIsPlaying(true);
        setCurrentIndex(0);
        playTrack(0, false);
    };

    const playTrack = (index: number, recording: boolean) => {
        const ctx = audioContextRef.current || new (window.AudioContext || (window as any).webkitAudioContext)();
        audioContextRef.current = ctx;

        if ((!audioBuffers[index] && !demoMode)) {
            if (recording) stopRecording();
            setIsPlaying(false);
            return;
        }

        if (demoMode) {
            setupVisualizerChain(ctx.createGain(), recording);
            setTimeout(() => {
                if (isPlaying) handleEnded();
            }, 8000);
            return;
        }

        // Luxury Cross-fade Playback Logic
        const buffer = audioBuffers[index];
        const source = ctx.createBufferSource();
        source.buffer = buffer;

        const gain = ctx.createGain();
        // Start Fade (0.5s)
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(1.0, ctx.currentTime + 0.5);

        source.connect(gain);
        setupVisualizerChain(gain, recording);

        source.start(0);

        // Schedule next track with overlap
        const fadeOutStart = buffer.duration - 1.0;
        if (fadeOutStart > 0) {
            // Schedule finish fade
            gain.gain.setValueAtTime(1.0, ctx.currentTime + fadeOutStart);
            gain.gain.linearRampToValueAtTime(0, ctx.currentTime + buffer.duration);

            // Trigger next track crossover
            setTimeout(() => {
                if (isPlaying) handleEnded();
            }, fadeOutStart * 1000);
        } else {
            source.onended = () => {
                if (isPlaying) handleEnded();
            };
        }
    };

    const setupVisualizerChain = (trackGain: GainNode, recording: boolean) => {
        if (!canvasRef.current || !audioContextRef.current) return;
        const ctx = audioContextRef.current;

        // Singleton Master Chain Initialization
        if (!masterCompressorRef.current) {
            analyzerRef.current = ctx.createAnalyser();

            const compressor = ctx.createDynamicsCompressor();
            compressor.threshold.setValueAtTime(-24, ctx.currentTime);
            compressor.knee.setValueAtTime(30, ctx.currentTime);
            compressor.ratio.setValueAtTime(12, ctx.currentTime);
            compressor.attack.setValueAtTime(0.003, ctx.currentTime);
            compressor.release.setValueAtTime(0.25, ctx.currentTime);
            masterCompressorRef.current = compressor;

            const masterGain = ctx.createGain();
            masterGain.gain.value = 1.5;
            masterGainRef.current = masterGain;

            compressor.connect(masterGain);
            masterGain.connect(analyzerRef.current);
            analyzerRef.current.connect(ctx.destination);

            if (recording) {
                const dest = ctx.createMediaStreamDestination();
                masterGain.connect(dest);

                // @ts-ignore
                const canvasStream = canvasRef.current.captureStream(30);
                const combinedStream = new MediaStream([
                    ...canvasStream.getVideoTracks(),
                    ...dest.stream.getAudioTracks()
                ]);

                const supportedTypes = [
                    'video/webm;codecs=vp9,opus',
                    'video/webm;codecs=vp8,opus',
                    'video/webm',
                    'video/mp4',
                    'video/quicktime'
                ];
                const mimeType = supportedTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';

                mediaRecorderRef.current = new MediaRecorder(combinedStream, {
                    mimeType: mimeType
                });

                mediaRecorderRef.current.ondataavailable = (e) => {
                    if (e.data.size > 0) recordedChunksRef.current.push(e.data);
                };

                mediaRecorderRef.current.onstop = () => {
                    const blob = new Blob(recordedChunksRef.current, { type: mimeType.split(';')[0] });
                    const url = URL.createObjectURL(blob);
                    setExportUrl(url);
                };

                mediaRecorderRef.current.start(100);
            }
        }

        // Connect specific track to the master normalization chain
        if (masterCompressorRef.current) {
            trackGain.connect(masterCompressorRef.current);
        }
    };

    const bufferLength = 128;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
        if (!canvasRef.current || !analyzerRef.current) return;
        const ctx = canvasRef.current.getContext('2d')!;
        const width = canvasRef.current.width;
        const height = canvasRef.current.height;

        animationRef.current = requestAnimationFrame(draw);

        if (demoMode && isPlaying && !analyzerRef.current) {
            for (let i = 0; i < bufferLength; i++) {
                dataArray[i] = 128 + Math.sin(i * 0.2 + Date.now() * 0.01) * 30 + (Math.random() * 10);
            }
        } else if (analyzerRef.current) {
            analyzerRef.current.getByteTimeDomainData(dataArray);
        }

        // 1. EXTRACT LIGHTWEIGHT AUDIO FEATURES ($V_t, $N_t, $S_t$)
        let sumSq = 0;
        let zcrCount = 0;
        for (let i = 0; i < bufferLength; i++) {
            const val = (dataArray[i] - 128) / 128;
            sumSq += val * val;
            if (i > 0 && ((dataArray[i] - 128) > 0 && (dataArray[i - 1] - 128) <= 0 || (dataArray[i] - 128) < 0 && (dataArray[i - 1] - 128) >= 0)) {
                zcrCount++;
            }
        }

        const v_t = Math.sqrt(sumSq / bufferLength); // Volume (RMS)
        const n_t = zcrCount / bufferLength;        // Noise (ZCR)
        const s_t = 1.0 - Math.min(1, Math.abs(v_t - cumulativeParams.current.lastV) * 10); // Stability (inverse change)

        // Normalize for visual mapping (0-1)
        const v_norm = Math.min(1, v_t * 5);
        const n_norm = Math.min(1, n_t * 5);

        cumulativeParams.current.lastV = v_t;
        cumulativeParams.current.inkDensity = Math.min(1, cumulativeParams.current.inkDensity + (v_norm * 0.001));

        const z_score = (logs[currentIndex]?.alignmentScore || 85) / 100;

        // 2. THEME-SPECIFIC DYNAMIC MAPPING
        const theme = THEMES[archetype.toUpperCase()] || THEMES.OPTIMIZER;
        let containerStyles: React.CSSProperties = {};
        let canvasFilter = 'none';

        if (archetype === 'maverick') {
            const exposure = 0.5 + (v_norm * 1.0);
            const shake = v_norm > 0.8 ? (Math.random() - 0.5) * 10 : 0;
            containerStyles = {
                filter: `brightness(${exposure}) contrast(1.2)`,
                transform: `translate(${shake}px, ${shake}px)`
            };
        } else if (archetype === 'stoic') {
            const focus = 1.0 - (v_norm * 0.5);
            containerStyles = {
                filter: `opacity(${cumulativeParams.current.inkDensity * 0.8 + 0.2}) blur(${focus * 2}px)`
            };
        } else if (archetype === 'alchemist') {
            const goldTint = v_norm * z_score * 2.0;
            const shadow = 1.0 + (v_norm * 0.5);
            containerStyles = {
                filter: `saturate(${1.0 + goldTint}) drop-shadow(0 0 ${shadow * 10}px gold)`
            };
        } else if (archetype === 'optimizer') {
            const rgbShift = n_norm * 15;
            const warp = Math.sin(Date.now() / 1000) * v_norm * 5;
            containerStyles = {
                filter: `contrast(1.5)`,
                transform: `skewX(${warp}deg)`,
                boxShadow: `${rgbShift}px 0 20px rgba(255,0,0,0.2), -${rgbShift}px 0 20px rgba(0,0,255,0.2)`
            };
        }

        // Sync dynamic styles to React state (throttled conceptually by frame)
        setDynamicStyles(containerStyles);

        ctx.clearRect(0, 0, width, height);

        // Draw Background Image
        if (bgImageRef.current) {
            ctx.drawImage(bgImageRef.current, 0, 0, width, height);
            // Apply a dimming overlay to ensure text readability
            ctx.fillStyle = 'rgba(0,0,0,0.3)';
            ctx.fillRect(0, 0, width, height);
        } else {
            ctx.fillStyle = theme.bg;
            ctx.fillRect(0, 0, width, height);
        }

        // Draw Visualizer
        ctx.lineWidth = 4;
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

        theme.visuals(ctx, { v_norm, n_norm, z_score });
        ctx.stroke();

        // Draw Identity Stamp
        drawStamp(ctx, theme.stamp, width - 170, 40);

        // Reset for Text
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
        ctx.globalCompositeOperation = 'source-over';
        ctx.filter = 'none';

        // Draw Text Overlay
        if (isPlaying) {
            const rawText = logs[currentIndex]?.context.readingText || `Day ${currentIndex + 1}`;
            // Filter out instructions like [Instruction: ...]
            const text = rawText.replace(/\[Instruction:[\s\S]*?\]/g, '').trim();
            const displayText = archetype === 'maverick' ? text.toUpperCase() : text;

            ctx.font = `italic 28px ${theme.font}`;
            ctx.fillStyle = theme.color;
            ctx.textAlign = theme.align;

            // Native canvas letter spacing support
            // @ts-ignore
            if (ctx.letterSpacing !== undefined) {
                // @ts-ignore
                ctx.letterSpacing = `${theme.letterSpacing}px`;
            }

            const textX = theme.align === 'center' ? width / 2 : 50;
            let lineY = height - 120;

            const words = displayText.split(' ');
            let line = '';
            for (let n = 0; n < words.length; n++) {
                let testLine = line + words[n] + ' ';
                let metrics = ctx.measureText(testLine);
                let testWidth = metrics.width;
                if (testWidth > width - 100 && n > 0) {
                    ctx.fillText(line.trim(), textX, lineY);
                    line = words[n] + ' ';
                    lineY += 40;
                } else {
                    line = testLine;
                }
            }
            ctx.fillText(line.trim(), textX, lineY);

            if (logs[currentIndex]?.alignmentScore) {
                ctx.font = `12px monospace`;
                // @ts-ignore
                if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '1px';
                ctx.globalAlpha = 0.5;
                ctx.fillText(`ETCHVOX RESONANCE: ${logs[currentIndex].alignmentScore}%`, textX, lineY + 35);
                ctx.globalAlpha = 1;
            }
        }

        // 3. SNS EXCLUSIVE OVERLAYS (Labels & Noise)
        if (exportMode === 'sns') {
            // FILM NOISE
            ctx.save();
            ctx.globalAlpha = 0.05;
            ctx.fillStyle = '#ffffff';
            for (let i = 0; i < 500; i++) {
                ctx.fillRect(Math.random() * width, Math.random() * height, 1, 1);
            }
            ctx.restore();

            // GENRE LABELS
            const currentTheme = THEMES[archetype.toUpperCase()] || THEMES.OPTIMIZER;
            if (currentTheme.snsLabel) {
                ctx.save();
                ctx.font = 'black 10px monospace';
                ctx.fillStyle = currentTheme.color;
                ctx.globalAlpha = 0.6;
                // @ts-ignore
                if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '2px';

                const labelIdx = currentIndex === 0 ? 0 : currentIndex === 3 ? 1 : 2;
                const label = currentTheme.snsLabel[labelIdx] || currentTheme.snsLabel[0];

                ctx.textAlign = 'right';
                ctx.fillText(label, width - 50, height - 50);

                // Add a small divider
                ctx.fillRect(width - 150, height - 42, 100, 1);
                ctx.restore();
            }
        }
    };

    draw();

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
    };

    if (isLoading) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-950 flex items-center justify-center">
                <div className="text-cyan-400 animate-pulse font-mono">Preparing your 7-day recap...</div>
            </div>
        );
    }

    const pageTheme = THEMES[archetype.toUpperCase()] || THEMES.OPTIMIZER;

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center p-8 text-slate-900 overflow-hidden" style={{ backgroundColor: pageTheme.bg }}>
            {/* Texture Overlay */}
            {archetype === 'stoic' && (
                <div className="absolute inset-0 opacity-10 pointer-events-none mix-blend-multiply bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]" />
            )}
            {archetype === 'alchemist' && (
                <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
            )}

            <div className="max-w-4xl w-full flex flex-col items-center space-y-12 relative z-10">
                <div className="text-center space-y-4">
                    <h2 className="text-sm font-black uppercase tracking-[0.3em]" style={{ color: pageTheme.color + '80' }}>The Seven Day Resonance</h2>
                    <h1 className="text-5xl" style={{ fontFamily: pageTheme.font, color: pageTheme.color }}>Dossier: {archetype.replace('_', ' ').toUpperCase()}</h1>
                </div>

                {/* Main Visualizer Area */}
                <div className="w-full aspect-video border rounded-lg shadow-inner relative flex flex-col items-center justify-center overflow-hidden transition-all duration-75"
                    style={{
                        borderColor: pageTheme.color + '30',
                        backgroundColor: archetype === 'optimizer' ? 'rgba(255,255,255,0.05)' : 'transparent',
                        ...dynamicStyles
                    }}>
                    <canvas ref={canvasRef} width={800} height={450} className="w-full h-full" />
                </div>

                {/* Progress Indicators */}
                <div className="w-full grid grid-cols-7 gap-4 px-12">
                    {Array.from({ length: 7 }).map((_, i) => (
                        <div key={i} className="space-y-2 text-center">
                            <div className="h-1 w-full rounded-full transition-all duration-500"
                                style={{
                                    backgroundColor: i === currentIndex && isPlaying ? pageTheme.color :
                                        i < currentIndex ? pageTheme.color + '80' : pageTheme.color + '20',
                                    transform: i === currentIndex && isPlaying ? 'scaleY(1.5)' : 'none'
                                }} />
                            <span className="text-[10px] font-mono" style={{ color: pageTheme.color + '60' }}>DAY {i + 1}</span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col items-center gap-6">
                    {revealPhase !== 'IDLE' && revealPhase !== 'SUCCESS' ? (
                        <div className="flex flex-col items-center gap-6 animate-in fade-in duration-700">
                            <div className="w-64 h-1 bg-white/10 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    transition={{ duration: 5, ease: "linear" }}
                                    className="h-full bg-cyan-500"
                                />
                            </div>
                            <div className="text-center space-y-2 font-mono">
                                {revealLogs.map((log, i) => (
                                    <motion.p
                                        key={i}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1 - (revealLogs.length - 1 - i) * 0.3, x: 0 }}
                                        className="text-[10px] uppercase tracking-[0.2em] text-cyan-400"
                                    >
                                        {log}
                                    </motion.p>
                                ))}
                            </div>
                        </div>
                    ) : !isPlaying && !isRecording ? (
                        <div className="flex flex-col items-center gap-4">
                            {!exportUrl ? (
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <button
                                        onClick={() => startExport('sns')}
                                        className="px-8 py-3 bg-gradient-to-r from-cyan-600 to-blue-700 text-white rounded-full font-serif italic text-sm transition shadow-lg flex items-center gap-3 border border-white/10 hover:shadow-cyan-500/20"
                                    >
                                        <span>📱</span> Encode 90s SNS Highlight
                                    </button>
                                    <button
                                        onClick={() => startExport('full')}
                                        className="px-8 py-3 rounded-full font-serif italic text-sm transition shadow-lg flex items-center gap-3"
                                        style={{ backgroundColor: pageTheme.color, color: pageTheme.bg }}
                                    >
                                        <span>🎞️</span> Stitch Full 7-Day Dossier
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center gap-6">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="bg-green-500/20 border border-green-500/30 px-6 py-2 rounded-full">
                                            <span className="text-green-400 text-[10px] font-black uppercase tracking-[0.3em]">Identity Integration Complete</span>
                                        </div>
                                        <p className="text-[9px] text-white/40 uppercase tracking-[0.2em] font-mono">
                                            Ephemeral Archive: This video and all source fragments will be purged in 24h for your privacy.
                                        </p>
                                    </div>
                                    <button
                                        onClick={downloadVideo}
                                        className="px-10 py-5 bg-white text-black rounded-full font-black uppercase tracking-widest text-xs hover:scale-105 transition-transform shadow-2xl flex items-center gap-4"
                                    >
                                        <span>💾</span> Download Your Movie
                                    </button>
                                </div>
                            )}

                            {!exportUrl && revealPhase === 'IDLE' && (
                                <button
                                    onClick={startPlayback}
                                    className="px-12 py-4 rounded-full font-serif italic text-lg transition shadow-lg flex items-center gap-3 opacity-60 hover:opacity-100"
                                    style={{ backgroundColor: pageTheme.color, color: pageTheme.bg }}
                                >
                                    <span>▶</span> Quick Review
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <span className={`w-2 h-2 rounded-full animate-pulse`} style={{ backgroundColor: isRecording ? '#ef4444' : pageTheme.color }} />
                            <span className="font-mono text-sm uppercase tracking-widest" style={{ color: pageTheme.color + '80' }}>
                                {isRecording ? 'Encoding Visual History...' : 'Playing Historical Echoes'}
                            </span>
                        </div>
                    )}

                    {!isPlaying && !isRecording && (
                        <div className="flex items-center gap-8 border-t pt-6" style={{ borderColor: pageTheme.color + '20' }}>
                            <button
                                onClick={onClose}
                                className="text-sm font-mono transition"
                                style={{ color: pageTheme.color + '60' }}
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

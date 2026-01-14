'use client';

import { useEffect, useRef } from 'react';

interface ParticleVisualizerProps {
    analyser: AnalyserNode | null;
    isActive: boolean;
}

interface Particle {
    x: number;
    y: number;
    baseY: number;
    size: number;
    speedX: number;
    phase: number;
    frequencyIndex: number;
}

export default function ParticleVisualizer({ analyser, isActive }: ParticleVisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const animationRef = useRef<number | null>(null);
    const dataArrayRef = useRef<Uint8Array | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth * window.devicePixelRatio;
            canvas.height = canvas.offsetHeight * window.devicePixelRatio;
            ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        };
        resizeCanvas();

        // Initialize particles
        const initParticles = () => {
            const particles: Particle[] = [];
            const count = 150;
            const width = canvas.offsetWidth;
            const height = canvas.offsetHeight;

            for (let i = 0; i < count; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: height / 2,
                    baseY: height / 2,
                    size: 2 + Math.random() * 4,
                    speedX: 0.3 + Math.random() * 0.5,
                    phase: Math.random() * Math.PI * 2,
                    frequencyIndex: Math.floor(Math.random() * 64),
                });
            }
            particlesRef.current = particles;
        };
        initParticles();

        // Initialize frequency data array
        if (analyser) {
            dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
        }

        // Colors
        const cyan = { r: 0, g: 240, b: 255 };
        const magenta = { r: 255, g: 0, b: 255 };

        // Animation loop
        const draw = () => {
            if (!canvas || !ctx) return;

            const width = canvas.offsetWidth;
            const height = canvas.offsetHeight;

            // Get frequency data
            let avgVolume = 0;
            if (analyser && dataArrayRef.current && isActive) {
                analyser.getByteFrequencyData(dataArrayRef.current as any);
                avgVolume = (dataArrayRef.current as any).reduce((a: number, b: number) => a + b, 0) / dataArrayRef.current.length / 255;
            }

            // Clear with fade effect (trail)
            ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
            ctx.fillRect(0, 0, width, height);

            // Draw particles
            particlesRef.current.forEach((p) => {
                // Get frequency value
                let freqValue = 0.3; // Default when no audio
                if (dataArrayRef.current && isActive) {
                    freqValue = dataArrayRef.current[p.frequencyIndex] / 255;
                }

                // Calculate Y position
                const amplitude = freqValue * (height * 0.35);
                const wave = Math.sin(p.phase + Date.now() * 0.002) * 15;
                p.y = p.baseY - amplitude + wave;

                // Move horizontally
                p.x += p.speedX;
                if (p.x > width) {
                    p.x = 0;
                }

                // Color interpolation
                const colorRatio = p.frequencyIndex / 64;
                const r = Math.floor(cyan.r + (magenta.r - cyan.r) * colorRatio);
                const g = Math.floor(cyan.g + (magenta.g - cyan.g) * colorRatio);
                const b = Math.floor(cyan.b + (magenta.b - cyan.b) * colorRatio);

                // Dynamic size
                const dynamicSize = p.size * (0.5 + freqValue * 1.2);

                // Glow effect
                const glowIntensity = 10 + avgVolume * 20;
                ctx.shadowBlur = glowIntensity;
                ctx.shadowColor = `rgb(${r}, ${g}, ${b})`;

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, dynamicSize, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.6 + freqValue * 0.4})`;
                ctx.fill();

                // Reset shadow
                ctx.shadowBlur = 0;
            });

            animationRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [analyser, isActive]);

    return (
        <div className="relative w-full h-48 rounded-xl overflow-hidden bg-black/50 border border-white/10">
            <canvas
                ref={canvasRef}
                className="w-full h-full"
                style={{ display: 'block' }}
            />
            {/* Glow border effect */}
            <div className="absolute inset-0 pointer-events-none rounded-xl" style={{
                boxShadow: 'inset 0 0 30px rgba(0, 240, 255, 0.2), inset 0 0 60px rgba(255, 0, 255, 0.1)',
            }} />
        </div>
    );
}

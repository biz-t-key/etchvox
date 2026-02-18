'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface BlessingPortalProps {
    onComplete: () => void;
    variant?: 'mirror' | 'vault';
}

// --- Breath Detector Hook ---
const useBreathDetector = (onBurst: () => void) => {
    const [intensity, setIntensity] = useState(0);
    const audioContextRef = useRef<AudioContext | null>(null);

    useEffect(() => {
        let analyser: AnalyserNode;
        let microphone: MediaStreamAudioSourceNode;
        let dataArray: Uint8Array;
        let animationFrame: number;

        const initMic = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const AudioContextClass = (window.AudioContext || (window as any).webkitAudioContext);
                audioContextRef.current = new AudioContextClass();
                analyser = audioContextRef.current.createAnalyser();
                microphone = audioContextRef.current.createMediaStreamSource(stream);
                microphone.connect(analyser);
                analyser.fftSize = 256;
                dataArray = new Uint8Array(analyser.frequencyBinCount);

                const update = () => {
                    analyser.getByteFrequencyData(dataArray as any);
                    // Breath (low-frequency noise/blowing) sits in the 0-20Hz range
                    const lowFreq = dataArray.slice(0, 8).reduce((a, b) => a + b) / 8;
                    const normalized = lowFreq / 255;
                    setIntensity(normalized);

                    if (normalized > 0.85) {
                        onBurst();
                    }
                    animationFrame = requestAnimationFrame(update);
                };
                update();
            } catch (err) {
                console.warn('Microphone access denied for Blessing Portal breath detection.');
            }
        };

        initMic();
        return () => {
            if (audioContextRef.current) audioContextRef.current.close();
            if (animationFrame) cancelAnimationFrame(animationFrame);
        };
    }, [onBurst]);

    return intensity;
};

// --- Nebula Shader ---
const NebulaParticles = ({ intensity, isBursted }: { intensity: number; isBursted: boolean }) => {
    const points = useRef<THREE.Points>(null);
    const count = 24000;

    const [positions, step] = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const step = new Float32Array(count);
        for (let i = 0; i < count; i++) {
            const r = Math.random() * 2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);

            pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            pos[i * 3 + 2] = r * Math.cos(phi);
            step[i] = Math.random();
        }
        return [pos, step];
    }, []);

    useFrame((state) => {
        if (!points.current) return;
        const { clock } = state;
        const material = points.current.material as THREE.ShaderMaterial;

        material.uniforms.uIntensity.value = THREE.MathUtils.lerp(
            material.uniforms.uIntensity.value,
            intensity,
            0.1
        );
        material.uniforms.uTime.value = clock.getElapsedTime();
        material.uniforms.uBursted.value = THREE.MathUtils.lerp(
            material.uniforms.uBursted.value,
            isBursted ? 1.0 : 0.0,
            0.05
        );
    });

    return (
        <points ref={points}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    count={count}
                    array={positions}
                    itemSize={3}
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <shaderMaterial
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                uniforms={{
                    uTime: { value: 0 },
                    uIntensity: { value: 0 },
                    uBursted: { value: 0 },
                    uColorBlack: { value: new THREE.Color("#050510") },
                    uColorAmber: { value: new THREE.Color("#FFBF00") },
                }}
                vertexShader={`
                    uniform float uTime;
                    uniform float uIntensity;
                    uniform float uBursted;
                    varying float vIntensity;
                    varying float vAlpha;

                    void main() {
                        vIntensity = uIntensity;
                        vec3 pos = position;
                        
                        // Noise/Turbulence
                        float dist = length(pos);
                        pos += sin(uTime * 1.5 + dist * 5.0) * uIntensity * 0.15;
                        
                        // Explosion phase
                        if (uBursted > 0.01) {
                            pos *= 1.0 + (uBursted * 15.0);
                        }

                        vAlpha = 1.0 - uBursted; // Fade out as it bursts

                        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                        gl_PointSize = (2.5 + uIntensity * 5.0) * (1.0 / -mvPosition.z);
                        gl_Position = projectionMatrix * mvPosition;
                    }
                `}
                fragmentShader={`
                    uniform vec3 uColorBlack;
                    uniform vec3 uColorAmber;
                    varying float vIntensity;
                    varying float vAlpha;

                    void main() {
                        float dist = distance(gl_PointCoord, vec2(0.5));
                        if (dist > 0.5) discard;

                        vec3 color = mix(uColorBlack, uColorAmber, vIntensity + 0.1);
                        float glow = (1.0 - dist * 2.0);
                        
                        gl_FragColor = vec4(color, vAlpha * glow * 0.8);
                    }
                `}
            />
        </points>
    );
};

// --- Main Blessing Portal Component ---
export const BlessingPortal: React.FC<BlessingPortalProps> = ({ onComplete, variant = 'mirror' }) => {
    const [isBursted, setIsBursted] = useState(false);
    const [phase, setPhase] = useState<'bless' | 'completed'>('bless');

    const intensity = useBreathDetector(() => {
        if (!isBursted) {
            setIsBursted(true);
            setTimeout(() => setPhase('completed'), 2500);
            setTimeout(() => onComplete(), 5000);
        }
    });

    const config = {
        mirror: {
            title: "Bless.",
            subtitle: "Breathe to reset cycle (History secured in Vault)",
            completedTitle: "Journey Archived.",
            completedSubtitle: "The silence returns."
        },
        vault: {
            title: "Purge.",
            subtitle: "Breathe into the void to incinerate your traces",
            completedTitle: "Archive Purged.",
            completedSubtitle: "The void is clean."
        }
    }[variant];

    return (
        <div className="fixed inset-0 z-[100] bg-black overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 z-0">
                <Canvas camera={{ position: [0, 0, 3], fov: 60 }}>
                    <NebulaParticles intensity={intensity} isBursted={isBursted} />
                </Canvas>
            </div>

            <div className="relative z-10 text-center pointer-events-none">
                <AnimatePresence mode="wait">
                    {phase === 'bless' ? (
                        <motion.div
                            key="bless"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 1.5, filter: 'blur(20px)' }}
                            transition={{ duration: 1.5 }}
                            className="space-y-6"
                        >
                            <h1 className="text-6xl md:text-8xl font-serif italic text-white/90 tracking-tighter">
                                {config.title}
                            </h1>
                            <p className="text-amber-500/60 font-mono text-[10px] uppercase tracking-[0.6em] animate-pulse">
                                {config.subtitle}
                            </p>

                            {/* Visual Hint */}
                            <motion.div
                                className="w-16 h-16 mx-auto mt-12 rounded-full border border-white/10 flex items-center justify-center"
                                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                                transition={{ duration: 2, repeat: Infinity }}
                            >
                                <div className="w-1 h-1 bg-white rounded-full" />
                            </motion.div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="completed"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 2 }}
                            className="space-y-4"
                        >
                            <h1 className="text-2xl font-black text-white uppercase tracking-[0.4em]">
                                {config.completedTitle}
                            </h1>
                            <p className="text-gray-500 text-xs uppercase tracking-widest">
                                {config.completedSubtitle}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Grain Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/p6.png')]" />
        </div>
    );
};

export default BlessingPortal;

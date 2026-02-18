'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import { useMirror, MirrorConfig } from '@/context/MirrorContext';
import { trackEv } from '@/lib/analytics';

// --- Shader Definition (Existing Couple) ---
const CouplesNebulaMaterial = shaderMaterial(
    {
        uTime: 0, uType: 0,
        uDataAPresence: 0, uDataAClarity: 0, uDataAResonance: 0, uDataADynamics: 0, uDataATexture: 0,
        uDataBPresence: 0, uDataBClarity: 0, uDataBResonance: 0, uDataBDynamics: 0, uDataBTexture: 0,
        uTotalResonance: 0,
        uColorA: new THREE.Color('#00bcd4'),
        uColorB: new THREE.Color('#ff5722'),
        uColorResonance: new THREE.Color('#ffffff'),
        uIsCouple: 1.0,
    },
    // Vertex Shader (Simplified for brevity in replacement, but keeping the core logic)
    `
    uniform float uTime;
    uniform int uType;
    uniform float uDataAPresence; uniform float uDataADynamics; uniform float uDataATexture;
    uniform float uDataBPresence; uniform float uDataBDynamics; uniform float uDataBTexture;
    uniform float uIsCouple;
    attribute float aOwner;
    varying vec3 vPosition;
    varying float vOwner;
    varying float vDistanceToCenter;

    float noise(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453); }

    void main() {
        vOwner = aOwner;
        vec3 pos = position;
        float orbitRadius = uIsCouple > 0.5 ? 0.4 : 0.0;
        float orbitSpeedBase = 0.3;
        float turbulence = 1.0;
        if (uIsCouple > 0.5) {
            if (uType == 1) { orbitRadius = 0.2; orbitSpeedBase = 0.15; turbulence = 0.7; }
            else if (uType == 2) { orbitRadius = 0.65; orbitSpeedBase = 1.8; turbulence = 2.5; }
            else if (uType == 3) { orbitRadius = 0.9; orbitSpeedBase = 0.05; turbulence = 1.2; }
        }
        float orbitSpeed = uTime * orbitSpeedBase;
        vec3 centerA = vec3(cos(orbitSpeed) * orbitRadius, sin(orbitSpeed * 1.1) * orbitRadius * 0.4, sin(orbitSpeed * 0.7) * 0.15);
        vec3 centerB = vec3(cos(orbitSpeed + 3.14159) * orbitRadius, sin(orbitSpeed * 1.1 + 3.14159) * orbitRadius * 0.4, -sin(orbitSpeed * 0.7) * 0.15);
        float noiseVal;
        if (aOwner < 0.5) {
            pos += centerA;
            noiseVal = noise(pos + uTime * 0.2) * turbulence;
            pos += normal * noiseVal * (0.1 + uDataAPresence * 0.2);
        } else {
            if (uIsCouple > 0.5) {
                pos += centerB;
                noiseVal = noise(pos + uTime * 0.2) * turbulence;
                pos += normal * noiseVal * (0.1 + uDataBPresence * 0.2);
            } else { pos = vec3(0.0); }
        }
        vPosition = pos;
        vDistanceToCenter = length(pos);
        vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
        gl_PointSize = (4.0 + noiseVal * 2.0) * (1.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
    }
    `,
    // Fragment Shader
    `
    uniform vec3 uColorA; uniform vec3 uColorB; uniform vec3 uColorResonance;
    uniform float uTotalResonance; uniform float uDataAResonance; uniform float uDataBResonance;
    uniform float uIsCouple;
    varying float vOwner; varying vec3 vPosition;
    void main() {
        vec2 coord = gl_PointCoord - vec2(0.5);
        if (length(coord) > 0.5) discard;
        vec3 baseColor = mix(uColorA, uColorB, vOwner);
        float resonanceGlow = smoothstep(0.6, 0.0, length(vPosition));
        float totalGlowFactor = uIsCouple > 0.5 ? (resonanceGlow * uTotalResonance * (0.5 + (uDataAResonance + uDataBResonance) * 0.25)) : 0.0;
        vec3 finalColor = mix(baseColor, uColorResonance, totalGlowFactor);
        gl_FragColor = vec4(finalColor, 0.8);
    }
    `
) as any;

// --- Shader Definition (New Mirror Archetype) ---
const MirrorNebulaMaterial = shaderMaterial(
    {
        uTime: 0,
        uDataPresence: 0, uDataClarity: 0, uDataResonance: 0, uDataDynamics: 0, uDataTexture: 0,
        uColorBase: new THREE.Color('#001540'),
        uColorAccent: new THREE.Color('#ffffff'),
    },
    `
    varying vec3 vUv;
    varying float vDist;
    uniform float uTime;
    uniform float uDataPresence;
    uniform float uDataDynamics;
    uniform float uDataTexture;

    float noise(vec3 p) {
        return fract(sin(dot(p, vec3(12.9898, 78.233, 45.164))) * 43758.5453);
    }

    void main() {
        vUv = position;
        vec3 p = position;
        float n = noise(p + uTime * uDataDynamics * 0.5);
        p += normal * n * uDataTexture * 0.3;
        p *= (1.0 + sin(uTime * 0.2) * 0.05 * uDataPresence);
        vec4 mvPosition = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = 2.0 * (1.0 / -mvPosition.z); 
        gl_Position = projectionMatrix * mvPosition;
        vDist = length(p);
    }
    `,
    `
    varying vec3 vUv;
    varying float vDist;
    uniform float uTime;
    uniform float uDataResonance;
    uniform float uDataClarity;
    uniform vec3 uColorBase;
    uniform vec3 uColorAccent;

    void main() {
        float alpha = smoothstep(0.5, 0.2 * uDataClarity, vDist);
        vec3 color = mix(uColorBase, uColorAccent, vDist * uDataResonance + sin(uTime * 0.1));
        gl_FragColor = vec4(color, alpha * 0.8);
    }
    `
) as any;

// Declare custom elements
declare module '@react-three/fiber' {
    interface ThreeElements {
        couplesNebulaMaterial: any;
        mirrorNebulaMaterial: any;
    }
}

extend({ CouplesNebulaMaterial, MirrorNebulaMaterial });

interface NebulaProps {
    dataA?: number[];
    dataB?: number[];
    isCouple?: boolean;
    relationshipType?: string;
}

// --- Mirror Implementation ---
const MirrorParticles = ({ data, config, particleCount }: { data: number[], config: MirrorConfig, particleCount: number }) => {
    const materialRef = useRef<any>(null);

    const domains = useMemo(() => {
        const avg = (start: number, end: number) => data.slice(start, end).reduce((a, b) => a + b, 0) / 6;
        return {
            presence: avg(0, 6) * config.shaderParams.presence,
            clarity: avg(6, 12) * config.shaderParams.clarity,
            resonance: avg(12, 18),
            dynamics: avg(18, 24) * config.shaderParams.dynamics,
            texture: avg(24, 30) * config.shaderParams.texture,
        };
    }, [data, config]);

    const points = useMemo(() => {
        const p = new Float32Array(particleCount * 3);
        for (let i = 0; i < particleCount; i++) {
            const theta = THREE.MathUtils.randFloatSpread(Math.PI * 2);
            const phi = THREE.MathUtils.randFloatSpread(Math.PI);
            const r = THREE.MathUtils.randFloat(0, 0.5);
            p[i * 3] = r * Math.sin(theta) * Math.cos(phi);
            p[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
            p[i * 3 + 2] = r * Math.cos(theta);
        }
        return p;
    }, [particleCount]);

    useFrame((state: any) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.elapsedTime;
            materialRef.current.uDataPresence = domains.presence;
            materialRef.current.uDataClarity = domains.clarity;
            materialRef.current.uDataResonance = domains.resonance;
            materialRef.current.uDataDynamics = domains.dynamics;
            materialRef.current.uDataTexture = domains.texture;
            materialRef.current.uColorBase.set(config.colors.base);
            materialRef.current.uColorAccent.set(config.colors.accent);
        }
    });

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[points, 3]} />
            </bufferGeometry>
            <mirrorNebulaMaterial ref={materialRef} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
    );
};

// --- Couple Implementation ---
const CoupleParticles = ({ dataA, dataB, relationshipType, particleCount }: any) => {
    const materialRef = useRef<any>(null);
    const dA = useMemo(() => dataA || new Array(30).fill(0.5), [dataA]);
    const dB = useMemo(() => dataB || new Array(30).fill(0.5), [dataB]);

    const getDomains = (data: number[]) => {
        const avg = (start: number, end: number) => data.slice(start, end).reduce((a, b) => a + b, 0) / 6;
        return {
            presence: avg(0, 6), clarity: avg(6, 12), resonance: avg(12, 18), dynamics: avg(18, 24), texture: avg(24, 30),
        };
    };

    const domainsA = useMemo(() => getDomains(dA), [dA]);
    const domainsB = useMemo(() => getDomains(dB), [dB]);

    const totalResonanceScore = useMemo(() => {
        let similaritySum = 0;
        for (let i = 0; i < 30; i++) similaritySum += 1.0 - Math.abs(dA[i] - dB[i]);
        return similaritySum / 30;
    }, [dA, dB]);

    const { positions, owners } = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);
        const own = new Float32Array(particleCount);
        for (let i = 0; i < particleCount; i++) {
            const theta = THREE.MathUtils.randFloatSpread(Math.PI * 2);
            const phi = THREE.MathUtils.randFloatSpread(Math.PI);
            const r = THREE.MathUtils.randFloat(0.05, 0.4);
            pos[i * 3] = r * Math.sin(theta) * Math.cos(phi);
            pos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
            pos[i * 3 + 2] = r * Math.cos(theta);
            own[i] = i < particleCount / 2 ? 0.0 : 1.0;
        }
        return { positions: pos, owners: own };
    }, [particleCount]);

    const typeConfig = RELATIONSHIP_CONFIG[relationshipType as keyof typeof RELATIONSHIP_CONFIG] || RELATIONSHIP_CONFIG.romantic;

    useFrame((state: any) => {
        if (materialRef.current) {
            materialRef.current.uTime = state.clock.elapsedTime;
            materialRef.current.uType = typeConfig.id;
            materialRef.current.uColorA.set(typeConfig.colorA);
            materialRef.current.uColorB.set(typeConfig.colorB);
            materialRef.current.uDataAPresence = domainsA.presence;
            materialRef.current.uDataAClarity = domainsA.clarity;
            materialRef.current.uDataAResonance = domainsA.resonance;
            materialRef.current.uDataADynamics = domainsA.dynamics;
            materialRef.current.uDataATexture = domainsA.texture;
            materialRef.current.uDataBPresence = domainsB.presence;
            materialRef.current.uDataBClarity = domainsB.clarity;
            materialRef.current.uDataBResonance = domainsB.resonance;
            materialRef.current.uDataBDynamics = domainsB.dynamics;
            materialRef.current.uDataBTexture = domainsB.texture;
            materialRef.current.uTotalResonance = totalResonanceScore;
            materialRef.current.uIsCouple = 1.0;
        }
    });

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-aOwner" args={[owners, 1]} />
            </bufferGeometry>
            <couplesNebulaMaterial ref={materialRef} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
        </points>
    );
};

export default function AcousticNebula({ dataA, dataB, isCouple, relationshipType = 'romantic' }: NebulaProps) {
    const { type, config, isFallback } = useMirror();

    // Analytics: Nebula Success
    React.useEffect(() => {
        trackEv('1.0', 'nebula_success', { isCouple, type: isCouple ? relationshipType : type });
    }, [isCouple, relationshipType, type]);

    const performanceTier = useMemo(() => {
        if (typeof navigator === 'undefined') return { count: 12000, label: 'High' };
        const cores = navigator.hardwareConcurrency || 4;
        const memory = (navigator as any).deviceMemory || 4;
        const score = cores * 2 + memory;
        if (score > 16) return { count: 32000, label: 'Ultra' };
        if (score > 8) return { count: 16000, label: 'High' };
        return { count: 6000, label: 'Standard' };
    }, []);

    const introSpeed = isFallback ? 2.5 : config.introSpeed;

    return (
        <motion.div
            key={isCouple ? 'couple' : type}
            initial={{ opacity: 0, scale: 0.9, filter: "blur(20px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: introSpeed, ease: "easeOut" }}
            className="w-full h-[500px] md:h-[600px] relative rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl bg-black"
        >
            <Canvas camera={{ position: [0, 0, 1.2], fov: 45 }} gl={{ preserveDrawingBuffer: true, antialias: true }}>
                {isCouple ? (
                    <CoupleParticles dataA={dataA} dataB={dataB} relationshipType={relationshipType} particleCount={performanceTier.count} />
                ) : (
                    <MirrorParticles data={dataA || new Array(30).fill(0.5)} config={config} particleCount={performanceTier.count} />
                )}
                <ambientLight intensity={0.2} />
            </Canvas>

            <div className="absolute top-4 right-6 text-[9px] font-black uppercase tracking-[0.3em] text-white/20 pointer-events-none">
                {performanceTier.label} // {performanceTier.count} PARTICLES
            </div>

            {!isCouple && (
                <div className="absolute top-4 left-6 text-[9px] font-black uppercase tracking-[0.3em] text-white/40 pointer-events-none">
                    {config.name} Lens
                </div>
            )}

            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
        </motion.div>
    );
}

const RELATIONSHIP_CONFIG = {
    romantic: { id: 0, colorA: '#00bcd4', colorB: '#ff5722', label: 'Romantic' },
    friend: { id: 1, colorA: '#50c878', colorB: '#ffd700', label: 'Comrades' },
    rival: { id: 2, colorA: '#8a2be2', colorB: '#cddc39', label: 'Rivals' },
    unknown: { id: 3, colorA: '#4b0082', colorB: '#c0c0c0', label: 'Unknown' },
};

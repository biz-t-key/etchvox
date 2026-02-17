'use client';

import React, { useMemo, useRef } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// ==========================================
// 0. Relationship Type Definitions
// ==========================================
const RELATIONSHIP_CONFIG = {
    romantic: { id: 0, colorA: '#00bcd4', colorB: '#ff5722', label: 'Romantic' },
    friend: { id: 1, colorA: '#50c878', colorB: '#ffd700', label: 'Comrades' },
    rival: { id: 2, colorA: '#8a2be2', colorB: '#cddc39', label: 'Rivals' },
    unknown: { id: 3, colorA: '#4b0082', colorB: '#c0c0c0', label: 'Unknown' },
};

// --- Shader Definition ---
const CouplesNebulaMaterial = shaderMaterial(
    {
        uTime: 0,
        uType: 0,
        uDataAPresence: 0, uDataAClarity: 0, uDataAResonance: 0, uDataADynamics: 0, uDataATexture: 0,
        uDataBPresence: 0, uDataBClarity: 0, uDataBResonance: 0, uDataBDynamics: 0, uDataBTexture: 0,
        uTotalResonance: 0,
        uColorA: new THREE.Color('#00bcd4'),
        uColorB: new THREE.Color('#ff5722'),
        uColorResonance: new THREE.Color('#ffffff'),
        uIsCouple: 1.0,
    },
    // Vertex Shader
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

  // Simplex Noise functions
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
    const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy) );
    vec3 x0 = v - i + dot(i, C.xxx) ;
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min( g.xyz, l.zxy );
    vec3 i2 = max( g.xyz, l.zxy );
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod289(i);
    vec4 p = permute( permute( permute(
              i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
            + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
            + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));
    float n_ = 0.142857142857;
    vec3  ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_ );
    vec4 x = x_ *ns.x + ns.yyyy;
    vec4 y = y_ *ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4( x.xy, y.xy );
    vec4 b1 = vec4( x.zw, y.zw );
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;
    vec3 p0 = vec3(a0.xy,h.x);
    vec3 p1 = vec3(a0.zw,h.y);
    vec3 p2 = vec3(a1.xy,h.z);
    vec3 p3 = vec3(a1.zw,h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
  }

  void main() {
    vOwner = aOwner;
    vec3 pos = position;
    
    // --- Dynamic Movement Logic based on uType ---
    float orbitRadius = uIsCouple > 0.5 ? 0.4 : 0.0;
    float orbitSpeedBase = 0.3;
    float turbulence = 1.0;

    if (uIsCouple > 0.5) {
        if (uType == 1) { // Comrades
            orbitRadius = 0.2; 
            orbitSpeedBase = 0.15; 
            turbulence = 0.7;
        } else if (uType == 2) { // Rivals
            orbitRadius = 0.65; 
            orbitSpeedBase = 1.8; 
            turbulence = 2.5;
        } else if (uType == 3) { // Unknown
            orbitRadius = 0.9; 
            orbitSpeedBase = 0.05; 
            turbulence = 1.2;
        }
    }

    float orbitSpeed = uTime * orbitSpeedBase;
    vec3 centerA = vec3(cos(orbitSpeed) * orbitRadius, sin(orbitSpeed * 1.1) * orbitRadius * 0.4, sin(orbitSpeed * 0.7) * 0.15);
    vec3 centerB = vec3(cos(orbitSpeed + 3.14159) * orbitRadius, sin(orbitSpeed * 1.1 + 3.14159) * orbitRadius * 0.4, -sin(orbitSpeed * 0.7) * 0.15);

    float noiseVal;
    if (aOwner < 0.5) {
        pos += centerA;
        noiseVal = snoise(pos * (1.5 + uDataATexture) + uTime * (0.2 + uDataADynamics * 0.5)) * turbulence;
        pos += normal * noiseVal * (0.1 + uDataAPresence * 0.2);
    } else {
        if (uIsCouple > 0.5) {
            pos += centerB;
            noiseVal = snoise(pos * (1.5 + uDataBTexture) + uTime * (0.2 + uDataBDynamics * 0.5)) * turbulence;
            pos += normal * noiseVal * (0.1 + uDataBPresence * 0.2);
        } else {
            pos = vec3(0.0);
        }
    }

    vPosition = pos;
    vDistanceToCenter = length(pos);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (4.0 + noiseVal * 2.0 * turbulence) * (1.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
  `,
    // Fragment Shader
    `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorResonance;
  uniform float uTotalResonance;
  uniform float uDataAResonance;
  uniform float uDataBResonance;
  uniform float uIsCouple;

  varying float vOwner;
  varying vec3 vPosition;
  varying float vDistanceToCenter;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    if (dist > 0.5) discard;

    vec3 baseColor = mix(uColorA, uColorB, vOwner);
    float distanceFromCenter = length(vPosition);
    float resonanceGlow = smoothstep(0.6, 0.0, distanceFromCenter);
    
    float dynamicResonance = (uDataAResonance + uDataBResonance) * 0.5;
    float totalGlowFactor = uIsCouple > 0.5 ? (resonanceGlow * uTotalResonance * (0.5 + dynamicResonance * 0.5)) : 0.0;
    
    vec3 finalColor = mix(baseColor, uColorResonance, totalGlowFactor * totalGlowFactor);
    float alpha = smoothstep(0.5, 0.3, dist);
    
    gl_FragColor = vec4(finalColor * alpha, alpha);
  }
  `
) as any;

// Declare custom element for R3F
declare module '@react-three/fiber' {
    interface ThreeElements {
        couplesNebulaMaterial: any;
    }
}

extend({ CouplesNebulaMaterial });

interface NebulaProps {
    dataA?: number[];
    dataB?: number[];
    isCouple?: boolean;
    relationshipType?: string;
}

function NebulaContent({ dataA, dataB, isCouple, relationshipType = 'romantic' }: NebulaProps) {
    const materialRef = useRef<any>(null);

    // Default 30D vectors
    const dA = useMemo(() => dataA || new Array(30).fill(0.5), [dataA]);
    const dB = useMemo(() => dataB || new Array(30).fill(0.5), [dataB]);

    const performanceTier = useMemo(() => {
        if (typeof navigator === 'undefined') return { count: 6000 };
        const cores = navigator.hardwareConcurrency || 4;
        const memory = (navigator as any).deviceMemory || 4;
        const score = cores * 2 + memory;
        if (score > 16) return { count: 32000 };
        if (score > 8) return { count: 16000 };
        return { count: 6000 };
    }, []);

    const particleCount = performanceTier.count;

    const getDomains = (data: number[]) => {
        const avg = (start: number, end: number) => data.slice(start, end).reduce((a, b) => a + b, 0) / (end - start) || 0;
        return {
            presence: avg(0, 6),
            clarity: avg(6, 12),
            resonance: avg(12, 18),
            dynamics: avg(18, 24),
            texture: avg(24, 30),
        };
    };

    const domainsA = useMemo(() => getDomains(dA), [dA]);
    const domainsB = useMemo(() => getDomains(dB), [dB]);

    const totalResonanceScore = useMemo(() => {
        if (!isCouple) return 0;
        let similaritySum = 0;
        for (let i = 0; i < 30; i++) {
            similaritySum += 1.0 - Math.abs(dA[i] - dB[i]);
        }
        return similaritySum / 30;
    }, [dA, dB, isCouple]);

    const { positions, owners } = useMemo(() => {
        const pos = new Float32Array(particleCount * 3);
        const own = new Float32Array(particleCount);
        for (let i = 0; i < particleCount; i++) {
            const theta = THREE.MathUtils.randFloatSpread(360);
            const phi = THREE.MathUtils.randFloatSpread(360);
            const r = THREE.MathUtils.randFloat(0.05, 0.4);
            pos[i * 3] = r * Math.sin(theta) * Math.cos(phi);
            pos[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
            pos[i * 3 + 2] = r * Math.cos(theta);
            own[i] = i < particleCount / 2 ? 0.0 : 1.0;
        }
        return { positions: pos, owners: own };
    }, [particleCount]);

    const typeConfig = RELATIONSHIP_CONFIG[relationshipType as keyof typeof RELATIONSHIP_CONFIG] || RELATIONSHIP_CONFIG.romantic;
    const colorA = useMemo(() => new THREE.Color(typeConfig.colorA), [typeConfig.colorA]);
    const colorB = useMemo(() => new THREE.Color(typeConfig.colorB), [typeConfig.colorB]);

    useFrame((state) => {
        if (materialRef.current) {
            // Expose for export
            if (typeof window !== 'undefined') {
                (window as any).etchvoxRenderer = state.gl;
                (window as any).etchvoxScene = state.scene;
                (window as any).etchvoxCamera = state.camera;
            }

            materialRef.current.uTime = state.clock.elapsedTime;
            materialRef.current.uType = typeConfig.id;
            materialRef.current.uColorA = colorA;
            materialRef.current.uColorB = colorB;

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
            materialRef.current.uIsCouple = isCouple ? 1.0 : 0.0;
        }
    });

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-aOwner"
                    args={[owners, 1]}
                />
            </bufferGeometry>
            <couplesNebulaMaterial
                ref={materialRef}
                transparent={true}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}

export default function AcousticNebula({ dataA, dataB, isCouple, relationshipType = 'romantic' }: NebulaProps) {
    const typeConfig = RELATIONSHIP_CONFIG[relationshipType as keyof typeof RELATIONSHIP_CONFIG] || RELATIONSHIP_CONFIG.romantic;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 2.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-[500px] md:h-[600px] relative rounded-[3rem] overflow-hidden border border-white/5 shadow-2xl"
            style={{
                background: `radial-gradient(circle at center, ${typeConfig.colorA}0A 0%, #000000 100%)`,
            }}
        >
            <Canvas
                camera={{ position: [0, 0, 1.8], fov: 50 }}
                gl={{ preserveDrawingBuffer: true, antialias: true }}
            >
                <NebulaContent dataA={dataA} dataB={dataB} isCouple={isCouple} relationshipType={relationshipType} />
                <ambientLight intensity={0.1} />
            </Canvas>

            {/* Ambient Overlays */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none" />
            <div className="absolute top-4 left-6 flex flex-col gap-0.5 pointer-events-none text-left">
                <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">
                    {typeConfig.label} Resonance
                </div>
            </div>
        </motion.div>
    );
}

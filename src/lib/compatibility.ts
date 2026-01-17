// Compatibility Analysis System
// Analyzes vocal compatibility between two users

import { TypeCode, voiceTypes, AnalysisMetrics } from './types';
import { quantizeAcoustics, VocalSignature } from './quantizer';
import { analyzeSCM, calculateCompatibility, SCMProfile } from './scm';

export interface UserVoiceProfile {
    id: string;
    name: string;
    job: string;
    accent: string;
    typeCode: TypeCode;
    metrics: AnalysisMetrics;
    signature?: VocalSignature;
    scmProfile?: SCMProfile;
}

export interface CompatibilityReport {
    userA: UserVoiceProfile;
    userB: UserVoiceProfile;
    matrixScore: number;
    typeCompatibility: {
        score: number;
        chemistry: string;
        chemistryJa: string;
    };
    scmCompatibility: {
        score: number;
        dynamic: string;
        dynamicJa: string;
        advice: string;
        adviceJa: string;
    };
    acousticDelta: {
        pitch: number;
        speed: number;
        volume: number;
        tone: number;
        interpretation: string;
        interpretationJa: string;
    };
    verdict: string;
    verdictJa: string;
}

// Type chemistry matrix (some types are naturally compatible)
const TYPE_CHEMISTRY: Partial<Record<TypeCode, TypeCode[]>> = {
    // High-Energy Idols need grounding
    'HFEC': ['LSCD', 'LFCC', 'LSCC'],
    'HFED': ['LSCC', 'LFCD', 'LSED'],
    'HSEC': ['LFCD', 'LSCD', 'LFCC'],
    'HSED': ['LFCC', 'LSED', 'LFCD'],
    // Intellectuals need energy or depth
    'HFCC': ['LSED', 'LFCC', 'HSCD'],
    'HFCD': ['LSEC', 'LFED', 'HSCC'],
    'HSCC': ['LFED', 'LSEC', 'HFCD'],
    'HSCD': ['LFEC', 'LSED', 'HFCC'],
    // Power leaders need calm or challenge
    'LFEC': ['HSCD', 'HSCC', 'LSCD'],
    'LFED': ['HSCC', 'HFCD', 'LSCC'],
    'LSEC': ['HFCD', 'HSED', 'LFCC'],
    'LSED': ['HFCC', 'HSCD', 'HSED'],
    // Philosophers need energy or understanding
    'LFCC': ['HSED', 'HFEC', 'LSCD'],
    'LFCD': ['HSEC', 'HFED', 'LSCC'],
    'LSCC': ['HFED', 'LFED', 'HSEC'],
    'LSCD': ['HFEC', 'LFEC', 'HSEC'],
};

function calculateTypeCompatibility(typeA: TypeCode, typeB: TypeCode): {
    score: number;
    chemistry: string;
    chemistryJa: string;
} {
    // Check if they're in each other's compatible list
    const aCompatible = TYPE_CHEMISTRY[typeA] || [];
    const bCompatible = TYPE_CHEMISTRY[typeB] || [];

    const isMutualMatch = aCompatible.includes(typeB) && bCompatible.includes(typeA);
    const isOneWayMatch = aCompatible.includes(typeB) || bCompatible.includes(typeA);
    const isBestMatch = voiceTypes[typeA].bestMatch === typeB || voiceTypes[typeB].bestMatch === typeA;

    // Check if same type or group
    const sameType = typeA === typeB;
    const sameGroup = voiceTypes[typeA].group === voiceTypes[typeB].group;

    let score: number;
    let chemistry: string;
    let chemistryJa: string;

    if (isBestMatch) {
        score = 95;
        chemistry = 'Soulmates - Perfectly tuned frequencies';
        chemistryJa = 'ソウルメイト - 完璧に調和した周波数';
    } else if (isMutualMatch) {
        score = 85;
        chemistry = 'Natural Harmony - Your voices dance together';
        chemistryJa = 'ナチュラルハーモニー - 声が一緒に踊る';
    } else if (isOneWayMatch) {
        score = 70;
        chemistry = 'Asymmetric Attraction - One leads, one follows';
        chemistryJa = '非対称の引力 - 導く者と従う者';
    } else if (sameType) {
        score = 75;
        chemistry = 'Mirror Effect - Understanding through similarity';
        chemistryJa = 'ミラー効果 - 類似性による理解';
    } else if (sameGroup) {
        score = 65;
        chemistry = 'Kindred Spirits - Same frequency band';
        chemistryJa = '同族意識 - 同じ周波数帯';
    } else {
        score = 50;
        chemistry = 'Opposites Attract - Tension creates sparks';
        chemistryJa = '正反対の引力 - 緊張が火花を生む';
    }

    return { score, chemistry, chemistryJa };
}

function interpretAcousticDelta(
    metricsA: AnalysisMetrics,
    metricsB: AnalysisMetrics
): {
    pitch: number;
    speed: number;
    volume: number;
    tone: number;
    interpretation: string;
    interpretationJa: string;
} {
    // Normalize and calculate deltas
    const pitchDelta = Math.abs(metricsA.pitch - metricsB.pitch);
    const speedDelta = Math.abs(metricsA.speed - metricsB.speed) * 100;
    const volumeDelta = Math.abs(metricsA.vibe - metricsB.vibe) * 100;
    const toneDelta = Math.abs(metricsA.tone - metricsB.tone) / 30;

    const avgDelta = (pitchDelta / 2 + speedDelta + volumeDelta + toneDelta) / 4;

    let interpretation: string;
    let interpretationJa: string;

    if (avgDelta < 15) {
        interpretation = 'Acoustic Twins - Your voices blend seamlessly, like a well-rehearsed duet.';
        interpretationJa = '音響ツインズ - リハーサル済みのデュエットのように、声がシームレスに溶け合う。';
    } else if (avgDelta < 30) {
        interpretation = 'Complementary Frequencies - Different enough to be interesting, similar enough to harmonize.';
        interpretationJa = '補完的周波数 - 興味を引くほど違い、調和するほど似ている。';
    } else if (avgDelta < 50) {
        interpretation = 'Dynamic Contrast - Your conversations are a jazz improvisation.';
        interpretationJa = 'ダイナミックコントラスト - 会話はジャズの即興演奏のよう。';
    } else {
        interpretation = 'Polar Frequencies - A collision of sonic worlds. Exciting but exhausting.';
        interpretationJa = '極の周波数 - 音の世界の衝突。刺激的だが疲れる。';
    }

    return {
        pitch: Math.round(pitchDelta),
        speed: Math.round(speedDelta),
        volume: Math.round(volumeDelta),
        tone: Math.round(toneDelta),
        interpretation,
        interpretationJa,
    };
}

export function analyzeCompatibility(
    userA: UserVoiceProfile,
    userB: UserVoiceProfile
): CompatibilityReport {
    // 1. Get vocal signatures
    const signatureA = quantizeAcoustics(
        userA.metrics.pitch,
        userA.metrics.speed,
        userA.metrics.vibe,
        userA.metrics.tone
    );
    const signatureB = quantizeAcoustics(
        userB.metrics.pitch,
        userB.metrics.speed,
        userB.metrics.vibe,
        userB.metrics.tone
    );

    // 2. Get SCM profiles
    const scmA = analyzeSCM(
        userA.job,
        userA.accent,
        userA.metrics.speed,
        userA.metrics.vibe,
        userA.metrics.tone,
        userA.metrics.pitch
    );
    const scmB = analyzeSCM(
        userB.job,
        userB.accent,
        userB.metrics.speed,
        userB.metrics.vibe,
        userB.metrics.tone,
        userB.metrics.pitch
    );

    // 3. Calculate type compatibility
    const typeCompat = calculateTypeCompatibility(userA.typeCode, userB.typeCode);

    // 4. Calculate SCM compatibility
    const scmCompat = calculateCompatibility(scmA, scmB);

    // 5. Analyze acoustic delta
    const acousticDelta = interpretAcousticDelta(userA.metrics, userB.metrics);

    // 6. Calculate matrix score (weighted average)
    const matrixScore = Math.round(
        typeCompat.score * 0.4 +
        scmCompat.score * 0.35 +
        (100 - acousticDelta.pitch / 3 - acousticDelta.speed / 2) * 0.25
    );

    // 7. Generate verdict
    let verdict: string;
    let verdictJa: string;

    if (matrixScore >= 85) {
        verdict = `A rare resonance. When ${voiceTypes[userA.typeCode].name} meets ${voiceTypes[userB.typeCode].name}, the universe pays attention.`;
        verdictJa = `稀有な共鳴。${voiceTypes[userA.typeCode].nameJa}と${voiceTypes[userB.typeCode].nameJa}が出会う時、宇宙が注目する。`;
    } else if (matrixScore >= 70) {
        verdict = `A promising frequency match. Your conversations probably never have awkward silences.`;
        verdictJa = `有望な周波数マッチ。おそらく会話に気まずい沈黙はない。`;
    } else if (matrixScore >= 50) {
        verdict = `An interesting tension. Different wavelengths can create beautiful interference patterns.`;
        verdictJa = `興味深い緊張感。異なる波長は美しい干渉パターンを生み出せる。`;
    } else {
        verdict = `A challenging duet. But hey, even dissonance can be avant-garde.`;
        verdictJa = `挑戦的なデュエット。でも、不協和音だってアヴァンギャルドになりえる。`;
    }

    return {
        userA: { ...userA, signature: signatureA, scmProfile: scmA },
        userB: { ...userB, signature: signatureB, scmProfile: scmB },
        matrixScore,
        typeCompatibility: typeCompat,
        scmCompatibility: scmCompat,
        acousticDelta,
        verdict,
        verdictJa,
    };
}

// Generate LLM prompt for detailed analysis
export function generateCompatibilityPrompt(report: CompatibilityReport): string {
    return `
<Context>
Analyze the vocal compatibility of this couple based on their acoustic profiles.
</Context>

<User_A>
- Name: ${report.userA.name}
- Profile: ${report.userA.job} (${report.userA.accent})
- Voice Type: ${voiceTypes[report.userA.typeCode].name} (${report.userA.typeCode})
- Acoustic Tags: ${report.userA.signature?.summary || 'N/A'}
- SCM Archetype: ${report.userA.scmProfile?.archetype || 'N/A'}
- Competence: ${report.userA.scmProfile?.competence || 50}
- Warmth: ${report.userA.scmProfile?.warmth || 50}
</User_A>

<User_B>
- Name: ${report.userB.name}
- Profile: ${report.userB.job} (${report.userB.accent})
- Voice Type: ${voiceTypes[report.userB.typeCode].name} (${report.userB.typeCode})
- Acoustic Tags: ${report.userB.signature?.summary || 'N/A'}
- SCM Archetype: ${report.userB.scmProfile?.archetype || 'N/A'}
- Competence: ${report.userB.scmProfile?.competence || 50}
- Warmth: ${report.userB.scmProfile?.warmth || 50}
</User_B>

<Compatibility_Data>
- Matrix Score: ${report.matrixScore}/100
- Type Chemistry: ${report.typeCompatibility.chemistry}
- SCM Dynamic: ${report.scmCompatibility.dynamic}
- Acoustic Interpretation: ${report.acousticDelta.interpretation}
</Compatibility_Data>

<Task>
Write a detailed, witty, and insightful compatibility report in the style of a New Yorker essayist.
Focus on how their vocal frequencies and social personas interact.
Include specific advice for communication improvement.
</Task>
`.trim();
}

// SCM Analyzer - Stereotype Content Model
// Maps Job + Voice characteristics to a social persona
// Based on Fiske's Stereotype Content Model (Competence × Warmth)

export interface SCMProfile {
    competence: number; // 0-100
    warmth: number;     // 0-100
    archetype: string;
    archetypeJa: string;
    quadrant: 'admiration' | 'respect' | 'sympathy' | 'unconventional';
}

// Job base scores (Competence, Warmth)
const JOB_BASE_SCORES: Record<string, [number, number]> = {
    // High Competence, Low Warmth (Respect/Envy)
    'lawyer': [90, 30],
    'executive': [90, 20],
    'engineer': [85, 40],
    'surgeon': [95, 25],
    'ceo': [95, 20],

    // High Competence, High Warmth (Admiration)
    'doctor': [85, 70],
    'pilot': [85, 60],
    'founder': [80, 70],
    'professor': [80, 65],
    'scientist': [85, 55],

    // Low Competence, High Warmth (Sympathy/Paternalism)
    'artist': [50, 90],
    'teacher': [60, 85],
    'counselor': [50, 95],
    'nurse': [60, 90],
    'social_worker': [45, 95],

    // Neutral
    'student': [50, 60],
    'freelancer': [55, 55],
    'other': [50, 50],
};

// Accent modifiers (small adjustments based on cultural stereotypes)
const ACCENT_MODIFIERS: Record<string, { comp: number; warmth: number }> = {
    'us': { comp: 5, warmth: -5 },      // American: slightly more "confident"
    'uk': { comp: 10, warmth: -10 },    // British: "formal/cold"
    'au': { comp: -5, warmth: 10 },     // Australian: "friendly"
    'in': { comp: 5, warmth: 5 },       // Indian: "technical & warm"
    'asia': { comp: 5, warmth: 0 },
    'eu': { comp: 5, warmth: 5 },
    'latam': { comp: -5, warmth: 15 },  // Latin: "warm"
    'unknown': { comp: 0, warmth: 0 },
};

export function analyzeSCM(
    job: string,
    accent: string,
    speed: number,  // 0-1
    volume: number, // 0-0.3
    tone: number,   // 1000-4000
    pitch: number   // 80-300
): SCMProfile {
    // 1. Get base scores from job
    const jobKey = job.toLowerCase().replace(/\s+/g, '_');
    const [baseComp, baseWarmth] = JOB_BASE_SCORES[jobKey] || JOB_BASE_SCORES['other'];

    // 2. Get accent modifiers
    const accentMod = ACCENT_MODIFIERS[accent] || ACCENT_MODIFIERS['unknown'];

    // 3. Voice adjustments
    // Speed + Volume high = more competent/dominant
    const speedNorm = speed * 100;
    const volumeNorm = (volume / 0.3) * 100;
    const voiceCompImpact = ((speedNorm + volumeNorm) / 2 - 50) * 0.3;

    // Tone high (clear) = more warm/approachable
    const toneNorm = ((tone - 1000) / 3000) * 100;
    const voiceWarmthImpact = (toneNorm - 50) * 0.25;

    // 4. Calculate final scores
    let finalComp = baseComp + accentMod.comp + voiceCompImpact;
    let finalWarmth = baseWarmth + accentMod.warmth + voiceWarmthImpact;

    // Clamp to 0-100
    finalComp = Math.max(0, Math.min(100, finalComp));
    finalWarmth = Math.max(0, Math.min(100, finalWarmth));

    // 5. Determine quadrant and archetype
    const { archetype, archetypeJa, quadrant } = getArchetype(finalComp, finalWarmth);

    return {
        competence: Math.round(finalComp),
        warmth: Math.round(finalWarmth),
        archetype,
        archetypeJa,
        quadrant,
    };
}

function getArchetype(comp: number, warmth: number): {
    archetype: string;
    archetypeJa: string;
    quadrant: 'admiration' | 'respect' | 'sympathy' | 'unconventional';
} {
    if (comp >= 50 && warmth >= 50) {
        return {
            archetype: 'The Charismatic Ideal',
            archetypeJa: 'カリスマ的理想像',
            quadrant: 'admiration',
        };
    } else if (comp >= 50 && warmth < 50) {
        return {
            archetype: 'The Efficient Strategist',
            archetypeJa: '効率的戦略家',
            quadrant: 'respect',
        };
    } else if (comp < 50 && warmth >= 50) {
        return {
            archetype: 'The Empathetic Soul',
            archetypeJa: '共感的な魂',
            quadrant: 'sympathy',
        };
    } else {
        return {
            archetype: 'The Free Spirit',
            archetypeJa: '自由な精神',
            quadrant: 'unconventional',
        };
    }
}

// Calculate compatibility between two SCM profiles
export function calculateCompatibility(profileA: SCMProfile, profileB: SCMProfile): {
    score: number;
    dynamic: string;
    dynamicJa: string;
    advice: string;
    adviceJa: string;
} {
    // Delta calculations
    const compDelta = Math.abs(profileA.competence - profileB.competence);
    const warmthDelta = Math.abs(profileA.warmth - profileB.warmth);

    // Base compatibility (inverse of total delta)
    const totalDelta = (compDelta + warmthDelta) / 2;
    const baseScore = 100 - totalDelta;

    // Bonus for complementary types (opposite quadrants can work well)
    const isComplementary =
        (profileA.quadrant === 'respect' && profileB.quadrant === 'sympathy') ||
        (profileA.quadrant === 'sympathy' && profileB.quadrant === 'respect');

    const complementaryBonus = isComplementary ? 15 : 0;

    // Final score
    const score = Math.min(100, Math.max(0, baseScore + complementaryBonus));

    // Dynamic description
    let dynamic: string;
    let dynamicJa: string;
    let advice: string;
    let adviceJa: string;

    if (compDelta > 30 && warmthDelta > 30) {
        dynamic = 'Polar Opposites - Electric tension';
        dynamicJa = '正反対 - 電撃的な緊張感';
        advice = 'Embrace the contrast. Your differences are your superpower.';
        adviceJa = '違いを受け入れよう。その差異こそが二人の強みだ。';
    } else if (compDelta < 15 && warmthDelta < 15) {
        dynamic = 'Mirror Souls - Deep understanding';
        dynamicJa = '鏡の魂 - 深い理解';
        advice = 'Watch for echo chambers. Challenge each other to grow.';
        adviceJa = 'エコーチェンバーに注意。お互いを成長させる挑戦を。';
    } else if (isComplementary) {
        dynamic = 'Yin & Yang - Perfect balance';
        dynamicJa = '陰陽 - 完璧なバランス';
        advice = 'You complete each other. Let each person lead in their domain.';
        adviceJa = '互いを補完し合う。それぞれの得意分野でリードを。';
    } else {
        dynamic = 'Parallel Lines - Steady harmony';
        dynamicJa = '平行線 - 安定したハーモニー';
        advice = 'Create rituals that celebrate your unique frequencies.';
        adviceJa = '二人だけの周波数を祝うリチュアルを作ろう。';
    }

    return { score: Math.round(score), dynamic, dynamicJa, advice, adviceJa };
}

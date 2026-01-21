import { SOLO_AUDIT_SYSTEM_PROMPT, COUPLE_AUDIT_SYSTEM_PROMPT } from './prompts';
import { AnalysisMetrics } from './types';

/**
 * Normalize AnalysisMetrics (raw Hz/float values) to 0-100 scale
 * for use with Identity Engines.
 * 
 * Raw values from analyzer:
 * - pitch: 50-300 Hz (typical human voice)
 * - speed: 0-1 (normalized float)
 * - vibe: 0-0.5 (variance ratio, energy fluctuation)
 * - tone: 500-4000 Hz (spectral centroid)
 */
export function normalizeMetricsForEngine(metrics: AnalysisMetrics): {
    p: number; s: number; v: number; t: number;
} {
    // Pitch: 50-300 Hz → 0-100
    // Lower pitch (50Hz) = 0, Higher pitch (300Hz) = 100
    const p = Math.min(100, Math.max(0, ((metrics.pitch - 50) / 250) * 100));

    // Speed: 0-1 → 0-100
    const s = Math.min(100, Math.max(0, metrics.speed * 100));

    // Volume: Use 'vibe' (variance) as proxy for volume/energy
    // Higher variance = more dynamic/loud voice
    // vibe typically ranges 0-0.5 → map to 0-100
    const v = Math.min(100, Math.max(0, (metrics.vibe / 0.5) * 100));

    // Tone: 500-4000 Hz → 0-100
    // Lower tone (500Hz) = 0 (husky/deep), Higher tone (4000Hz) = 100 (clear/bright)
    const t = Math.min(100, Math.max(0, ((metrics.tone - 500) / 3500) * 100));

    return {
        p: Math.round(p),
        s: Math.round(s),
        v: Math.round(v),
        t: Math.round(t)
    };
}

// ==========================================
// 1. UTILS: Demographic Mapping
// ==========================================
export type AgeGroup = 'gen_z' | '20s' | '30s' | '40s' | '50s' | '60+';

export function getAgeGroup(birthYear: number): AgeGroup {
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthYear;
    if (age < 20) return 'gen_z';
    if (age < 30) return '20s';
    if (age < 40) return '30s';
    if (age < 50) return '40s';
    if (age < 60) return '50s';
    return '60+';
}

// ==========================================
// 2. CORE: Demographic Normalizer
// ==========================================
class DemographicNormalizer {
    private static AGE_FACTORS: Record<AgeGroup, { s: number; v: number; p: number }> = {
        'gen_z': { s: 1.1, v: 1.0, p: 1.0 },
        '20s': { s: 1.0, v: 1.0, p: 1.0 },
        '30s': { s: 1.0, v: 1.0, p: 1.0 },
        '40s': { s: 0.95, v: 1.0, p: 1.0 },
        '50s': { s: 0.9, v: 0.95, p: 0.95 },
        '60+': { s: 0.8, v: 0.9, p: 0.9 }
    };

    private static GENDER_PITCH_BASE: Record<string, number> = {
        'male': 30,
        'female': 65,
        'non-binary': 50,
        'other': 50
    };

    constructor(
        private p: number,
        private s: number,
        private v: number,
        private t: number,
        private gender: string = 'other',
        private ageGroup: AgeGroup = '30s'
    ) { }

    public normalize() {
        // 1. Age Adjustment (Speed & Volume)
        const factors = DemographicNormalizer.AGE_FACTORS[this.ageGroup] || DemographicNormalizer.AGE_FACTORS['30s'];
        const normS = this.s / factors.s;
        const normV = this.v / factors.v;

        // 2. Gender Adjustment (Pitch)
        const baseP = DemographicNormalizer.GENDER_PITCH_BASE[this.gender.toLowerCase()] || 50;
        const normP = (this.p - baseP) + 50;

        // Tone is kept mostly raw for now
        const normT = this.t;

        return {
            p: Math.floor(Math.max(0, Math.min(100, normP))),
            s: Math.floor(Math.max(0, Math.min(100, normS))),
            v: Math.floor(Math.max(0, Math.min(100, normV))),
            t: Math.floor(Math.max(0, Math.min(100, normT)))
        };
    }
}

// ==========================================
// 3. SHARED CORE: Acoustic Quantizer
// ==========================================
class AcousticQuantizer {
    static getPitchTag(value: number): string {
        if (value < 20) return "Sub-bass / Gravitas (重厚)";
        if (value < 40) return "Deep / Resonant (共鳴)";
        if (value < 60) return "Baritone / Grounded (安定的)";
        if (value < 80) return "Tenor / Clear (明瞭)";
        return "Soprano / Crystalline (透き通った)";
    }

    static getSpeedTag(value: number): string {
        if (value < 20) return "Largo / Contemplative (熟考)";
        if (value < 40) return "Andante / Deliberate (慎重)";
        if (value < 60) return "Moderato / Conversational (会話的)";
        if (value < 80) return "Allegro / Energetic (活発)";
        return "Presto / Urgent (性急)";
    }

    static getVolumeTag(value: number): string {
        if (value < 20) return "Whisper / Intimate (親密・秘密)";
        if (value < 40) return "Soft / Gentle (穏やか・配慮)";
        if (value < 60) return "Mezzo / Balanced (バランス)";
        if (value < 80) return "Forte / Projecting (発信・主張)";
        return "Fortissimo / Commanding (威厳・支配)";
    }

    static getToneTag(value: number): string {
        if (value < 20) return "Husky / Textured (陰影・ハスキー)";
        if (value < 40) return "Smoky / Warm (温かみ・スモーキー)";
        if (value < 60) return "Neutral / Natural (自然的)";
        if (value < 80) return "Bright / Polished (磨かれた)";
        return "Piercing / Pure (純粋・鋭い)";
    }

    static getAllTags(p: number, s: number, v: number, t: number) {
        return {
            "Pitch_Tag": this.getPitchTag(p),
            "Speed_Tag": this.getSpeedTag(s),
            "Volume_Tag": this.getVolumeTag(v),
            "Tone_Tag": this.getToneTag(t)
        };
    }
}

// ==========================================
// 4. SOLO ENGINE: Voice Identity & Gap Analysis
// ==========================================
export class SoloIdentityEngine {
    private stats: { p: number; s: number; v: number; t: number };
    private ageGroup: AgeGroup;

    constructor(
        private rawP: number,
        private rawS: number,
        private rawV: number,
        private rawT: number,
        private mbti: string,
        private gender: string = 'other',
        private birthYear?: number
    ) {
        this.mbti = mbti.toUpperCase();
        this.ageGroup = birthYear ? getAgeGroup(birthYear) : '30s';

        const normalizer = new DemographicNormalizer(rawP, rawS, rawV, rawT, gender, this.ageGroup);
        this.stats = normalizer.normalize();
    }

    private calculateAxes() {
        const projection = (this.stats.v + this.stats.s) / 2;
        const texture = (this.stats.p + this.stats.t) / 2;
        return { projection, texture };
    }

    private determineArchetype(proj: number, text: number) {
        if (proj >= 50) {
            if (text >= 50) {
                return {
                    Label: "The Lightning Rod (雷撃の扇動者)",
                    Quote: "Words like electric shocks. Impossible to ignore.",
                    Vibe: "High Voltage & Sharp"
                };
            } else {
                return {
                    Label: "The Thunder King (轟く覇者)",
                    Quote: "A voice that shakes the floorboards. Pure dominance.",
                    Vibe: "High Voltage & Heavy"
                };
            }
        } else {
            if (text >= 50) {
                return {
                    Label: "The Ice Sculptor (氷の彫刻家)",
                    Quote: "Precision over volume. Every syllable cuts deep.",
                    Vibe: "Low Voltage & Sharp"
                };
            } else {
                return {
                    Label: "The Midnight FM (深夜のDJ)",
                    Quote: "Velvet frequencies. You bypass ears and speak to the soul.",
                    Vibe: "Low Voltage & Heavy"
                };
            }
        }
    }

    private analyzeGap(proj: number, text: number) {
        const expectedProj = this.mbti.includes('E') ? 80 : 30;
        const expectedText = this.mbti.includes('T') ? 80 : 30;

        const projGap = proj - expectedProj;
        const textGap = text - expectedText;

        const tags: string[] = [];

        if (projGap > 30) tags.push("Over-Amplified (Masking Introversion)");
        else if (projGap < -30) tags.push("Under-Projecting (Holding Back)");
        else tags.push("Authentic Projection (Aligned)");

        if (textGap > 30) tags.push("Cooler than Personality (Logical Mask)");
        else if (textGap < -30) tags.push("Warmer than Personality (Social Mask)");
        else tags.push("Authentic Texture (Aligned)");

        return {
            Projection_Delta: Math.floor(projGap),
            Texture_Delta: Math.floor(textGap),
            Diagnosis_Tags: tags
        };
    }

    public generatePayload() {
        const { projection, texture } = this.calculateAxes();
        const archetype = this.determineArchetype(projection, texture);
        const gapAnalysis = this.analyzeGap(projection, texture);
        const quantizedMetrics = AcousticQuantizer.getAllTags(this.stats.p, this.stats.s, this.stats.v, this.stats.t);

        return {
            User_Profile: {
                MBTI: this.mbti,
                Gender: this.gender,
                Age_Group: this.ageGroup
            },
            Voice_Archetype: {
                Label: archetype.Label,
                Quote: archetype.Quote,
                Stats: { Projection: Math.floor(projection), Texture: Math.floor(texture) }
            },
            Gap_Analysis: gapAnalysis,
            Acoustic_Tags: quantizedMetrics,
            System_Instruction: `Analyze the user as a ${this.ageGroup} ${this.gender}. Focus on the discrepancy between MBTI and Voice Archetype.`
        };
    }
}

// ==========================================
// 5. COUPLE ENGINE: Resonance & SCM Analysis
// ==========================================
interface UserData {
    name: string;
    job: string;
    accent: string;
    p: number;
    s: number;
    v: number;
    t: number;
    gender?: string;
    birthYear?: number;
}

export class CoupleResonanceEngine {
    private static JOB_DB: Record<string, [number, number]> = {
        "lawyer": [90, 30], "executive": [90, 20], "engineer": [85, 40],
        "doctor": [85, 70], "founder": [85, 65], "consultant": [80, 40],
        "artist": [50, 90], "teacher": [60, 85], "designer": [60, 80],
        "nurse": [50, 95], "writer": [40, 80], "musician": [45, 90],
        "student": [50, 60], "sales": [70, 80], "other": [50, 50]
    };

    private statsA: { p: number; s: number; v: number; t: number };
    private statsB: { p: number; s: number; v: number; t: number };

    constructor(private ua: UserData, private ub: UserData) {
        const normA = new DemographicNormalizer(ua.p, ua.s, ua.v, ua.t, ua.gender, ua.birthYear ? getAgeGroup(ua.birthYear) : '30s');
        this.statsA = normA.normalize();

        const normB = new DemographicNormalizer(ub.p, ub.s, ub.v, ub.t, ub.gender, ub.birthYear ? getAgeGroup(ub.birthYear) : '30s');
        this.statsB = normB.normalize();
    }

    private calculateSCM(job: string, stats: { p: number; s: number; v: number; t: number }) {
        const [baseC, baseW] = CoupleResonanceEngine.JOB_DB[job.toLowerCase()] || [50, 50];

        const voiceCImpact = ((stats.s + stats.v) / 2 - 50) * 0.5;
        const pFactor = stats.p < 85 ? stats.p : (170 - stats.p);
        const voiceWImpact = ((stats.t + pFactor) / 2 - 50) * 0.5;

        const finalC = Math.max(0, Math.min(100, baseC + voiceCImpact));
        const finalW = Math.max(0, Math.min(100, baseW + voiceWImpact));

        let label = "The Free Spirit (Unconventional)";
        if (finalC >= 50 && finalW >= 50) label = "The Charismatic Ideal (Admiration)";
        else if (finalC >= 50 && finalW < 50) label = "The Efficient Strategist (Respect)";
        else if (finalC < 50 && finalW >= 50) label = "The Empathetic Soul (Sympathy)";

        return { Competence: Math.floor(finalC), Warmth: Math.floor(finalW), Archetype: label };
    }

    private calculateSynergy() {
        const deltaP = Math.abs(this.statsA.p - this.statsB.p);
        const deltaS = Math.abs(this.statsA.s - this.statsB.s);
        const deltaV = Math.abs(this.statsA.v - this.statsB.v);
        const deltaT = Math.abs(this.statsA.t - this.statsB.t);

        const meanDelta = (deltaP + deltaS + deltaV + deltaT) / 4;
        const syncScore = 100 - meanDelta;

        let dtype = "Complementary / Balanced";
        if (syncScore > 80) dtype = "High-Sync / Mirroring";
        else if (syncScore < 40) dtype = "High-Contrast / Opposites";

        return {
            Sync_Score: Math.floor(syncScore),
            Mean_Delta: Math.floor(meanDelta),
            Dynamic_Type: dtype,
            Volume_Dominance_A: this.statsA.v > this.statsB.v
        };
    }

    public generatePayload() {
        const scmA = this.calculateSCM(this.ua.job, this.statsA);
        const tagsA = AcousticQuantizer.getAllTags(this.statsA.p, this.statsA.s, this.statsA.v, this.statsA.t);

        const scmB = this.calculateSCM(this.ub.job, this.statsB);
        const tagsB = AcousticQuantizer.getAllTags(this.statsB.p, this.statsB.s, this.statsB.v, this.statsB.t);

        const synergy = this.calculateSynergy();

        return {
            Report_Type: "Couple_Resonance_v1",
            Relationship_Core: synergy,
            User_A_Insight: {
                Name: this.ua.name,
                Profile: `${this.ua.job} (${this.ua.gender} ${this.ua.birthYear ? new Date().getFullYear() - this.ua.birthYear : ''})`,
                SCM_Profile: scmA,
                Acoustic_Tags: tagsA
            },
            User_B_Insight: {
                Name: this.ub.name,
                Profile: `${this.ub.job} (${this.ub.gender} ${this.ub.birthYear ? new Date().getFullYear() - this.ub.birthYear : ''})`,
                SCM_Profile: scmB,
                Acoustic_Tags: tagsB
            },
            Narrative_Hint: `Interaction is ${synergy.Dynamic_Type}.`
        };
    }
}

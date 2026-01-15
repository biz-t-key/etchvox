import { SOLO_AUDIT_SYSTEM_PROMPT, COUPLE_AUDIT_SYSTEM_PROMPT } from './prompts';

// ==========================================
// 1. SHARED CORE: Acoustic Quantizer
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
// 2. SOLO ENGINE: Voice Identity & Gap Analysis
// ==========================================
export class SoloIdentityEngine {
    constructor(
        private p: number,
        private s: number,
        private v: number,
        private t: number,
        private mbti: string
    ) {
        this.mbti = mbti.toUpperCase();
    }

    private calculateAxes() {
        const projection = (this.v + this.s) / 2;
        const texture = (this.p + this.t) / 2;
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
        const quantizedMetrics = AcousticQuantizer.getAllTags(this.p, this.s, this.v, this.t);

        return {
            User_MBTI: this.mbti,
            Voice_Archetype: {
                Label: archetype.Label,
                Quote: archetype.Quote,
                Stats: { Projection: Math.floor(projection), Texture: Math.floor(texture) }
            },
            Gap_Analysis: gapAnalysis,
            Raw_Metrics_Tags: quantizedMetrics,
            System_Instruction: "Focus on the discrepancy between MBTI and Voice Archetype."
        };
    }
}

// ==========================================
// 3. COUPLE ENGINE: Resonance & SCM Analysis
// ==========================================
interface UserData {
    name: string;
    job: string;
    accent: string;
    p: number;
    s: number;
    v: number;
    t: number;
}

export class CoupleResonanceEngine {
    private static JOB_DB: Record<string, [number, number]> = {
        "lawyer": [90, 30], "executive": [90, 20], "engineer": [85, 40],
        "doctor": [85, 70], "founder": [85, 65], "consultant": [80, 40],
        "artist": [50, 90], "teacher": [60, 85], "designer": [60, 80],
        "nurse": [50, 95], "writer": [40, 80], "musician": [45, 90],
        "student": [50, 60], "sales": [70, 80], "other": [50, 50]
    };

    constructor(private ua: UserData, private ub: UserData) { }

    private calculateSCM(job: string, p: number, s: number, v: number, t: number) {
        const [baseC, baseW] = CoupleResonanceEngine.JOB_DB[job.toLowerCase()] || [50, 50];

        const voiceCImpact = ((s + v) / 2 - 50) * 0.5;
        const pFactor = p < 85 ? p : (170 - p);
        const voiceWImpact = ((t + pFactor) / 2 - 50) * 0.5;

        const finalC = Math.max(0, Math.min(100, baseC + voiceCImpact));
        const finalW = Math.max(0, Math.min(100, baseW + voiceWImpact));

        let label = "The Free Spirit (Unconventional)";
        if (finalC >= 50 && finalW >= 50) label = "The Charismatic Ideal (Admiration)";
        else if (finalC >= 50 && finalW < 50) label = "The Efficient Strategist (Respect)";
        else if (finalC < 50 && finalW >= 50) label = "The Empathetic Soul (Sympathy)";

        return { Competence: Math.floor(finalC), Warmth: Math.floor(finalW), Archetype: label };
    }

    private calculateSynergy() {
        const deltaP = Math.abs(this.ua.p - this.ub.p);
        const deltaS = Math.abs(this.ua.s - this.ub.s);
        const deltaV = Math.abs(this.ua.v - this.ub.v);
        const deltaT = Math.abs(this.ua.t - this.ub.t);

        const meanDelta = (deltaP + deltaS + deltaV + deltaT) / 4;
        const syncScore = 100 - meanDelta;

        let dtype = "Complementary / Balanced";
        let desc = "A healthy mix of similarity and difference.";
        if (syncScore > 80) {
            dtype = "High-Sync / Mirroring";
            desc = "Like looking in an acoustic mirror.";
        } else if (syncScore < 40) {
            dtype = "High-Contrast / Opposites";
            desc = "Magnetic attraction of opposites.";
        }

        return {
            Sync_Score: Math.floor(syncScore),
            Mean_Delta: Math.floor(meanDelta),
            Dynamic_Type: dtype,
            Description: desc,
            Volume_Delta_Specific: this.ua.v - this.ub.v
        };
    }

    public generatePayload() {
        const scmA = this.calculateSCM(this.ua.job, this.ua.p, this.ua.s, this.ua.v, this.ua.t);
        const tagsA = AcousticQuantizer.getAllTags(this.ua.p, this.ua.s, this.ua.v, this.ua.t);

        const scmB = this.calculateSCM(this.ub.job, this.ub.p, this.ub.s, this.ub.v, this.ub.t);
        const tagsB = AcousticQuantizer.getAllTags(this.ub.p, this.ub.s, this.ub.v, this.ub.t);

        const synergy = this.calculateSynergy();

        return {
            Report_Type: "Couple_Resonance_v1",
            Relationship_Core: synergy,
            User_A_Insight: {
                Name: this.ua.name,
                Profile: `${this.ua.job} (${this.ua.accent})`,
                SCM_Profile: scmA,
                Acoustic_Tags: tagsA
            },
            User_B_Insight: {
                Name: this.ub.name,
                Profile: `${this.ub.job} (${this.ub.accent})`,
                SCM_Profile: scmB,
                Acoustic_Tags: tagsB
            },
            Narrative_Hint: `User A is ${scmA.Archetype}, User B is ${scmB.Archetype}. Interaction is ${synergy.Dynamic_Type}.`
        };
    }
}

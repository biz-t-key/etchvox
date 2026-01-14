// Acoustic Quantizer - Converts raw numbers to semantic tags
// Makes data interpretable for LLM and UI display

export interface AcousticTags {
    pitch: { value: number; tag: string; tagJa: string };
    speed: { value: number; tag: string; tagJa: string };
    volume: { value: number; tag: string; tagJa: string };
    tone: { value: number; tag: string; tagJa: string };
}

export interface VocalSignature {
    tags: AcousticTags;
    summary: string;
    summaryJa: string;
}

// Pitch tags (0-100 normalized from Hz)
function getPitchTag(value: number): { tag: string; tagJa: string } {
    if (value < 20) return { tag: 'Sub-bass / Gravitas', tagJa: '重厚・地鳴り系' };
    if (value < 40) return { tag: 'Deep / Resonant', tagJa: '深み・共鳴系' };
    if (value < 60) return { tag: 'Baritone / Grounded', tagJa: '安定・バリトン系' };
    if (value < 80) return { tag: 'Tenor / Clear', tagJa: '明瞭・テノール系' };
    return { tag: 'Soprano / Crystalline', tagJa: '透き通った・ソプラノ系' };
}

// Speed tags (0-100)
function getSpeedTag(value: number): { tag: string; tagJa: string } {
    if (value < 20) return { tag: 'Largo / Contemplative', tagJa: '熟考的・ゆったり' };
    if (value < 40) return { tag: 'Andante / Deliberate', tagJa: '慎重・じっくり' };
    if (value < 60) return { tag: 'Moderato / Conversational', tagJa: '会話的・普通' };
    if (value < 80) return { tag: 'Allegro / Energetic', tagJa: '活発・テンポ良い' };
    return { tag: 'Presto / Urgent', tagJa: '性急・マシンガン系' };
}

// Volume tags (0-100)
function getVolumeTag(value: number): { tag: string; tagJa: string } {
    if (value < 20) return { tag: 'Whisper / Intimate', tagJa: '親密・囁き系' };
    if (value < 40) return { tag: 'Soft / Gentle', tagJa: '穏やか・ソフト' };
    if (value < 60) return { tag: 'Mezzo / Balanced', tagJa: 'バランス型' };
    if (value < 80) return { tag: 'Forte / Projecting', tagJa: '主張・発信系' };
    return { tag: 'Fortissimo / Commanding', tagJa: '威厳・支配系' };
}

// Tone tags (0-100, higher = clearer)
function getToneTag(value: number): { tag: string; tagJa: string } {
    if (value < 20) return { tag: 'Husky / Textured', tagJa: 'ハスキー・陰影系' };
    if (value < 40) return { tag: 'Smoky / Warm', tagJa: 'スモーキー・温かみ' };
    if (value < 60) return { tag: 'Neutral / Natural', tagJa: 'ナチュラル' };
    if (value < 80) return { tag: 'Bright / Polished', tagJa: 'ブライト・磨かれた' };
    return { tag: 'Piercing / Pure', tagJa: '純粋・鋭利' };
}

// Normalize raw metrics to 0-100 scale
export function normalizeMetrics(pitch: number, speed: number, vibe: number, tone: number): {
    pitchNorm: number;
    speedNorm: number;
    volumeNorm: number;
    toneNorm: number;
} {
    // Pitch: 80Hz (whale) - 300Hz (high) → 0-100
    const pitchNorm = Math.min(100, Math.max(0, ((pitch - 80) / 220) * 100));

    // Speed: 0-1 → 0-100
    const speedNorm = Math.min(100, Math.max(0, speed * 100));

    // Vibe/Volume: 0-0.3 → 0-100
    const volumeNorm = Math.min(100, Math.max(0, (vibe / 0.3) * 100));

    // Tone: 1000Hz - 4000Hz centroid → 0-100
    const toneNorm = Math.min(100, Math.max(0, ((tone - 1000) / 3000) * 100));

    return { pitchNorm, speedNorm, volumeNorm, toneNorm };
}

// Main quantizer function
export function quantizeAcoustics(
    pitch: number,
    speed: number,
    vibe: number,
    tone: number
): VocalSignature {
    const { pitchNorm, speedNorm, volumeNorm, toneNorm } = normalizeMetrics(pitch, speed, vibe, tone);

    const pitchTag = getPitchTag(pitchNorm);
    const speedTag = getSpeedTag(speedNorm);
    const volumeTag = getVolumeTag(volumeNorm);
    const toneTag = getToneTag(toneNorm);

    const tags: AcousticTags = {
        pitch: { value: Math.round(pitchNorm), ...pitchTag },
        speed: { value: Math.round(speedNorm), ...speedTag },
        volume: { value: Math.round(volumeNorm), ...volumeTag },
        tone: { value: Math.round(toneNorm), ...toneTag },
    };

    // Generate summary for LLM
    const summary = `A vocal profile marked by ${volumeTag.tag} volume and ${speedTag.tag} delivery, with ${pitchTag.tag} pitch and ${toneTag.tag} timbre.`;
    const summaryJa = `${volumeTag.tagJa}の声量と${speedTag.tagJa}のテンポ。${pitchTag.tagJa}のピッチと${toneTag.tagJa}の音色。`;

    return { tags, summary, summaryJa };
}

// For LLM prompt generation
export function generateLLMPayload(
    name: string,
    job: string,
    accent: string,
    metrics: { pitch: number; speed: number; vibe: number; tone: number }
) {
    const signature = quantizeAcoustics(
        metrics.pitch,
        metrics.speed,
        metrics.vibe,
        metrics.tone
    );

    return {
        Name: name,
        Profile: `${job} (${accent})`,
        Acoustic_Metrics: {
            Pitch: signature.tags.pitch.tag,
            Speed: signature.tags.speed.tag,
            Volume: signature.tags.volume.tag,
            Tone: signature.tags.tone.tag,
        },
        Vocal_Signature: signature.summary,
    };
}

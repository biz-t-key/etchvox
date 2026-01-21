// Toxicity Profile Types
// Used to calibrate the roast intensity and add personality context

export type NicotineLevel = 'none' | 'social' | 'chimney';
export type EthanolLevel = 'none' | 'weekend' | 'liver_failure';
export type SleepEfficiency = 'zombie' | 'human' | 'koala';

export interface ToxicityProfile {
    nicotine: NicotineLevel;
    ethanol: EthanolLevel;
    sleep: SleepEfficiency;
}

export const toxicityLabels = {
    nicotine: {
        none: { en: 'None', emoji: '🚭' },
        social: { en: 'Social', emoji: '🚬' },
        chimney: { en: 'Chimney', emoji: '💨' },
    },
    ethanol: {
        none: { en: 'None', emoji: '🚫' },
        weekend: { en: 'Weekend', emoji: '🍺' },
        liver_failure: { en: 'Liver Failure', emoji: '🍷' },
    },
    sleep: {
        zombie: { en: 'Zombie (3h)', emoji: '🧟' },
        human: { en: 'Human (7h)', emoji: '😴' },
        koala: { en: 'Koala (10h+)', emoji: '🐨' },
    },
} as const;

// Calculate toxicity score (0-100)
export function calculateToxicityScore(profile: ToxicityProfile): number {
    const nicotineScore = { none: 0, social: 30, chimney: 70 }[profile.nicotine];
    const ethanolScore = { none: 0, weekend: 30, liver_failure: 70 }[profile.ethanol];
    const sleepScore = { zombie: 70, human: 0, koala: -20 }[profile.sleep]; // Negative = healthy

    return Math.max(0, Math.min(100, nicotineScore + ethanolScore + sleepScore));
}

// Generate toxicity-aware roast modifier
export function getToxicityModifier(profile: ToxicityProfile): string {
    const score = calculateToxicityScore(profile);

    if (score >= 140) {
        return "concerning levels of self-destruction detected. Your voice sounds like it's been marinated in regret.";
    } else if (score >= 100) {
        return "solid life choices. Your vocal cords sound like they've seen better days.";
    } else if (score >= 60) {
        return "moderate damage. You're basically a walking 'before' photo.";
    } else if (score >= 30) {
        return "some wear and tear. Not terrible, but we can tell you have hobbies.";
    } else if (score <= -20) {
        return "suspiciously healthy. Are you sure you're human? This much sleep is illegal in most countries.";
    } else {
        return "surprisingly well-maintained. Your voice sounds like it actually gets 8 hours of sleep.";
    }
}

// Get lifestyle summary for LLM context
export function getLifestyleSummary(profile: ToxicityProfile): string {
    const nicotine = toxicityLabels.nicotine[profile.nicotine].en;
    const ethanol = toxicityLabels.ethanol[profile.ethanol].en;
    const sleep = toxicityLabels.sleep[profile.sleep].en;

    return `Lifestyle: Nicotine=${nicotine}, Alcohol=${ethanol}, Sleep=${sleep}`;
}

// Voice Mirror Content - Complete database
// Due to file size, full content is in a separate data file

export type Genre = 'philosophy' | 'thriller' | 'poetic' | 'maverick';
export type Mood = 'high' | 'mid' | 'low';
export type Archetype = 'optimizer' | 'stoic' | 'alchemist' | 'maverick' | 'sanctuary';

export interface DayContent {
    day_index: number;
    context: string;
    modes: {
        high: { emotion: string; text: string; word_count: number };
        mid: { emotion: string; text: string; word_count: number };
        low: { emotion: string; text: string; word_count: number };
    };
}

export interface Scenario {
    id: string;
    title: string;
    genre: Genre;
    tone_instruction: string;
    description: string;
}

// Scenario catalog
export const SCENARIO_CATALOG: Scenario[] = [
    // Philosophy
    { id: 'friction_audit', title: 'The Friction Audit', genre: 'philosophy', tone_instruction: 'Grounded and Gravelly', description: 'Building resilience through Stoic acceptance' },
    { id: 'sanctuary', title: 'The Sanctuary', genre: 'philosophy', tone_instruction: 'Stoic and Calm', description: 'Protecting your mind from external chaos' },
    { id: 'scythe', title: 'The Scythe', genre: 'philosophy', tone_instruction: 'Sharp and Urgent', description: 'Memento Mori and radical focus' },

    // Thriller
    { id: 'acheron_trench', title: 'Acheron Trench', genre: 'thriller', tone_instruction: 'Gritty and Claustrophobic', description: '20-mile walk across the deep-sea floor' },
    { id: 'ghost_ship', title: 'The Ghost Ship', genre: 'thriller', tone_instruction: 'Cynicism to Horror', description: 'Salvage mission turns biological nightmare' },
    { id: 'the_seed', title: 'The Seed', genre: 'thriller', tone_instruction: 'Battle-Worn to Tender', description: 'Protecting humanity\'s last embryo' },

    // Poetic
    { id: 'winter_cabin', title: 'Winter Cabin', genre: 'poetic', tone_instruction: 'Fragile and Breathy', description: 'Dissolving into the mountain silence' },
    { id: 'archive_1994', title: 'Archive 1994', genre: 'poetic', tone_instruction: 'Nostalgic Lo-fi', description: 'Fading memories and yellowing polaroids' },
    { id: 'cloud_train', title: 'Cloud Train', genre: 'poetic', tone_instruction: 'Weightless and Ethereal', description: 'Ascending beyond the edge of the world' },

    // Maverick (formerly Cinematic Grit)
    { id: 'iron_contract', title: 'The Iron Contract', genre: 'maverick', tone_instruction: 'Hard-won truth, power in stillness', description: 'A solitary mountain ascent fueled by internal fire' },
    { id: 'titanium_navy', title: 'Titanium and Navy', genre: 'maverick', tone_instruction: 'Smooth, low-register, intimate', description: 'Navigating power and victory in the high-stakes city' },
    { id: 'copper_dust', title: 'Copper Dust', genre: 'maverick', tone_instruction: 'Steady, grounded authority', description: 'A founder\'s journey from the void to a new home' }
];

// Full content data (imported from user's JSON structure)
// For MVP, we'll hardcode the first scenario's full content
import { FULL_CONTENT_DATA } from './mirrorContentData';

export function getScenariosByGenre(genre: Genre): Scenario[] {
    return SCENARIO_CATALOG.filter(s => s.genre === genre);
}

export function getReadingText(scenarioId: string, dayIndex: number, mood: Mood): string {
    // Temporary: Return calibration text for now
    if (dayIndex === 0 || !FULL_CONTENT_DATA[scenarioId]) {
        return 'Hello, world.';
    }

    const scenario = FULL_CONTENT_DATA[scenarioId];
    const day = scenario.days.find((d: any) => d.day_index === dayIndex);

    if (!day) return 'Hello, world.';

    return day.modes[mood].text;
}

export function getScenarioById(id: string): Scenario | undefined {
    return SCENARIO_CATALOG.find(s => s.id === id);
}

export function getProgressLevel(completedSessions: number): 'beginner' | 'intermediate' | 'advanced' {
    if (completedSessions < 10) return 'beginner';
    if (completedSessions < 30) return 'intermediate';
    return 'advanced';
}

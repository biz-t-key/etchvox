// Silhouette Mapping for Voice Types
// Maps each voice type to its corresponding silhouette image

import { TypeCode } from './types';

export type SilhouetteKey =
    | 'neutral'
    | 'elegant_woman'
    | 'hat_man'
    | 'robot'
    | 'whale';

// Map voice types to silhouettes
export const silhouetteMap: Record<TypeCode, SilhouetteKey> = {
    // High-Energy Idols
    'HFEC': 'neutral',
    'HFED': 'neutral',
    'HSEC': 'neutral',
    'HSED': 'elegant_woman',

    // Intellectual Artists
    'HFCC': 'robot',           // Special: Robot
    'HFCD': 'neutral',
    'HSCC': 'elegant_woman',
    'HSCD': 'elegant_woman',

    // Power Leaders
    'LFEC': 'hat_man',
    'LFED': 'elegant_woman',
    'LSEC': 'hat_man',
    'LSED': 'hat_man',

    // Deep Philosophers
    'LFCC': 'neutral',
    'LFCD': 'hat_man',
    'LSCC': 'neutral',
    'LSCD': 'whale',           // Special: Whale
};

// File paths for silhouettes
export const silhouettePaths: Record<SilhouetteKey, string> = {
    'neutral': '/assets/silhouettes/silhouette_neutral.png',
    'elegant_woman': '/assets/silhouettes/silhouette_elegant_woman.png',
    'hat_man': '/assets/silhouettes/silhouette_hat_man.png',
    'robot': '/assets/silhouettes/silhouette_robot.png',
    'whale': '/assets/silhouettes/silhouette_whale.png',
};

// Get silhouette path for a voice type
export function getSilhouettePath(typeCode: TypeCode): string {
    const key = silhouetteMap[typeCode] || 'neutral';
    return silhouettePaths[key];
}

// Get silhouette key for a voice type
export function getSilhouetteKey(typeCode: TypeCode): SilhouetteKey {
    return silhouetteMap[typeCode] || 'neutral';
}

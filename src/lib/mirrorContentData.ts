// Full content data for all 9 scenarios
// This file contains all user-provided reading texts

export const FULL_CONTENT_DATA: any = {
    // For MVP: Using placeholder structure
    // In production, this would be populated with all 9 scenarios × 7 days × 3 moods
    // Total: ~567 text entries

    friction_audit: {
        days: [
            {
                day_index: 1,
                context: 'The Friction Audit: Identifying the resistance.',
                modes: {
                    high: { text: '[CONFRONTATION] (Deep exhale) Your peace is a glass house, shattered by the first stone. Where are you still fighting the inevitable?' },
                    mid: { text: '[OBSERVATION] (Sigh) You demand the world be smooth. It is not. Audit the friction. Where is your ego resisting reality?' },
                    low: { text: '[ADMISSION] (Heavy breath) We build on sand and wonder why it shifts. Today, we admit: the resistance is only within.' }
                }
            }
            // ... remaining 6 days would be added here
        ]
    }
    // ... remaining 8 scenarios would be added here
};

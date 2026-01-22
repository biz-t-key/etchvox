/**
 * Feature Flags Configuration
 * Toggle features on/off without modifying core logic.
 */
export const FEATURE_FLAGS = {
    // Set to true to show "Couple Resonance" mode on the landing page
    ENABLE_COUPLE_MODE: false,

    // Set to true to show the $5 basic unlock option
    ENABLE_BASIC_UNLOCK: false,

    // Buy Me a Coffee settings
    BMAC_HANDLE: 'etchvox',

    // Payment Gateway: 'bmac' | 'stripe'
    PAYMENT_GATEWAY: 'bmac' as 'bmac' | 'stripe',
};

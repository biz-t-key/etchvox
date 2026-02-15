/**
 * Feature Flags Configuration
 * Toggle features on/off without modifying core logic.
 */
export const FEATURE_FLAGS = {
    // Set to true to show "Couple Resonance" mode on the landing page
    ENABLE_COUPLE_MODE: false,

    // Set to true to show the $5 basic unlock option
    ENABLE_BASIC_UNLOCK: false,
};

/**
 * Polar.sh Configuration
 */
export const POLAR_CONFIG = {
    // API Access Token (server-side only)
    ACCESS_TOKEN: process.env.POLAR_ACCESS_TOKEN || '',

    // Organization ID (found in Polar dashboard)
    ORGANIZATION_ID: process.env.POLAR_ORGANIZATION_ID || '',

    // Webhook secret for verification
    WEBHOOK_SECRET: process.env.POLAR_WEBHOOK_SECRET || '',

    // Product IDs
    WEEKLY_PRODUCT_ID: process.env.NEXT_PUBLIC_POLAR_WEEKLY_PRODUCT_ID || '',
    MONTHLY_PRODUCT_ID: process.env.NEXT_PUBLIC_POLAR_MONTHLY_PRODUCT_ID || '',
    SOLO_PRODUCT_ID: process.env.NEXT_PUBLIC_POLAR_SOLO_PRODUCT_ID || '',
    COUPLE_PRODUCT_ID: process.env.NEXT_PUBLIC_POLAR_COUPLE_PRODUCT_ID || '',
    SPY_PRODUCT_ID: process.env.NEXT_PUBLIC_POLAR_SPY_PRODUCT_ID || '',
    UPGRADE_PRODUCT_ID: process.env.NEXT_PUBLIC_POLAR_UPGRADE_PRODUCT_ID || '',

    // Display Pricing (consistent with UI)
    WEEKLY_PRICE: 7.00,
    MONTHLY_PRICE: 15.00,
    UPGRADE_PRICE: 8.00,
    SOLO_PRICE: 10.00,
    COUPLE_PRICE: 15.00,
    SPY_PRICE: 10.00,
};

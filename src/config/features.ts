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
 * Lemon Squeezy Configuration
 * Subscription settings for Voice Mirror
 */
export const LEMONSQUEEZY_CONFIG = {
    // Store ID from Lemon Squeezy dashboard
    STORE_ID: process.env.NEXT_PUBLIC_LEMONSQUEEZY_STORE_ID || '',

    // Product variant IDs (create these in Lemon Squeezy dashboard)
    WEEKLY_VARIANT_ID: process.env.NEXT_PUBLIC_LEMONSQUEEZY_WEEKLY_VARIANT_ID || '',
    MONTHLY_VARIANT_ID: process.env.NEXT_PUBLIC_LEMONSQUEEZY_MONTHLY_VARIANT_ID || '',
    SOLO_VARIANT_ID: process.env.NEXT_PUBLIC_LEMONSQUEEZY_SOLO_VARIANT_ID || '',
    COUPLE_VARIANT_ID: process.env.NEXT_PUBLIC_LEMONSQUEEZY_COUPLE_VARIANT_ID || '',
    SPY_VARIANT_ID: process.env.NEXT_PUBLIC_LEMONSQUEEZY_SPY_VARIANT_ID || '',

    // Pricing
    WEEKLY_PRICE: 7.00,
    MONTHLY_PRICE: 15.00,
    SOLO_PRICE: 10.00,
    COUPLE_PRICE: 15.00,
    SPY_PRICE: 10.00,

    // API Key (server-side only)
    API_KEY: process.env.LEMONSQUEEZY_API_KEY || '',

    // Webhook secret for signature verification
    WEBHOOK_SECRET: process.env.LEMONSQUEEZY_WEBHOOK_SECRET || '',
};

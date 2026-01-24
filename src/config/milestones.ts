/**
 * Community Funding Milestones
 * Values in cents (USD)
 */
export const MILESTONES = {
    SOLO_REPORT_UNLOCK: 100000,   // $1,000
    COUPLE_MODE_UNLOCK: 850000,   // $8,500 (Japan Entity Launch)
    COUPLE_REPORT_UNLOCK: 1500000, // $15,000 (Permanent Vault)
};

export type FeatureState = {
    isSoloPurchaseUnlocked: boolean; // Can buy $10 Solo Vault
    isCoupleModeUnlocked: boolean;   // Can access Couple Diagnosis
    isCouplePurchaseUnlocked: boolean; // Can buy $15 Couple Vault
    currentAmount: number; // in cents
};

/**
 * Calculates which features are available for use or purchase based on funding.
 */
export function getUnlockedFeatures(totalAmountCents: number): FeatureState {
    return {
        isSoloPurchaseUnlocked: totalAmountCents >= MILESTONES.SOLO_REPORT_UNLOCK,
        isCoupleModeUnlocked: totalAmountCents >= MILESTONES.COUPLE_MODE_UNLOCK,
        isCouplePurchaseUnlocked: totalAmountCents >= MILESTONES.COUPLE_REPORT_UNLOCK,
        currentAmount: totalAmountCents,
    };
}

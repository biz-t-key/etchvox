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
    isSoloReportUnlocked: boolean;
    isCoupleModeUnlocked: boolean;
    isCoupleReportUnlocked: boolean;
    currentAmount: number; // in cents
};

/**
 * Calculates which features are unlocked based on the current funding amount.
 */
export function getUnlockedFeatures(totalAmountCents: number): FeatureState {
    return {
        isSoloReportUnlocked: totalAmountCents >= MILESTONES.SOLO_REPORT_UNLOCK,
        isCoupleModeUnlocked: totalAmountCents >= MILESTONES.COUPLE_MODE_UNLOCK,
        isCoupleReportUnlocked: totalAmountCents >= MILESTONES.COUPLE_REPORT_UNLOCK,
        currentAmount: totalAmountCents,
    };
}

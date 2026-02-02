// Dynamic pricing calculation based on demand prediction

interface PricingInput {
    basePrice: number;
    predictedPrice: number;
}

/**
 * Calculate dynamic price with business rules:
 * - Never go below base price
 * - Cap at 2x base price maximum
 */
export function calculateDynamicPrice({ basePrice, predictedPrice }: PricingInput): number {
    // Rule 1: Never go below base price
    if (predictedPrice <= basePrice) {
        return basePrice;
    }

    // Rule 2: Cap at 2x base price
    const maxPrice = basePrice * 2;
    if (predictedPrice > maxPrice) {
        return maxPrice;
    }

    // Return predicted price if within acceptable range
    return predictedPrice;
}

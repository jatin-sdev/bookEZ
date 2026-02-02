
import { calculateDynamicPrice  } from "./pricing.service";

console.log("=== Pricing Rules Test ===");

const basePrice = 1000;

const cases = [
    { predicted: 800, expected: 1000 },
    { predicted: 1200, expected: 1200 },
    { predicted: 2500, expected: 2000 }
];

cases.forEach(({ predicted, expected }) => {
    const final = calculateDynamicPrice ({
        basePrice,
        predictedPrice: predicted
    });

    console.log(
        `Predicted ₹${predicted} → Final ₹${final} (expected ≤ ₹${expected})`
    );
});

import { initDemandModel, predictMultiplierByDemand } from "./demandModel";

(async () => {
    await initDemandModel();

    const demandSamples = [5, 20, 40, 70];

    console.log("=== Pricing Model Test ===");

    for (const demand of demandSamples) {
        const price = predictMultiplierByDemand(demand);
        console.log(`Demand ${demand} → Predicted ₹${Math.round(price)}`);
    }
})();

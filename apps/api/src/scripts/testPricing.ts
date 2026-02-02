import { initDemandModel, predictMultiplierByDemand } from "../ml/demandModel";
import { recordBookingDemand, getBookingRate } from "../services/demand.service";
import { redis } from "../lib/redis";

(async () => {
    console.log("🚀 Testing Dynamic Pricing (Backend Only)");

    // 1️⃣ Init ML model (train once in memory)
    await initDemandModel();

    const eventId = "TEST_EVENT_DYNAMIC_PRICING";
    const basePrice = 100;

    // 2️⃣ IMPORTANT: Reset Redis demand for clean test
    await redis.del(`demand:event:${eventId}`);
    console.log("♻️  Cleared previous demand data");

    // 3️⃣ Simulate bookings
    for (let i = 1; i <= 60; i++) {
        // Simulate a unique booking
        await recordBookingDemand(
            eventId,
            `BOOKING_${Date.now()}_${i}`
        );

        // Fetch real demand from Redis
        const demand = await getBookingRate(eventId);

        // Predict multiplier from ML
        const multiplier = predictMultiplierByDemand(demand);

        // Final price calculation
        const finalPrice = Math.round(basePrice * multiplier);

        // Log every 10 bookings
        if (i % 10 === 0) {
            console.log(
                `Demand: ${demand} → Multiplier: ${multiplier.toFixed(2)} → ₹${finalPrice}`
            );
        }
    }

    console.log("✅ Pricing test completed successfully");
    process.exit(0);
})();

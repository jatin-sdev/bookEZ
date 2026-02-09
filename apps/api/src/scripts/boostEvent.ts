import { recordBookingDemand, recordView } from "../services/demand.service";
import { redis } from "../lib/redis";

// Usage: pnpm exec tsx src/scripts/boostEvent.ts <EVENT_ID>
const eventId = process.argv[2];

if (!eventId) {
    console.error("Please provide an event ID. Usage: pnpm exec tsx src/scripts/boostEvent.ts <EVENT_ID>");
    process.exit(1);
}

(async () => {
    console.log(`🚀 Boosting event: ${eventId}`);

    // Simulate 20 views
    console.log("Adding 20 views...");
    for (let i = 0; i < 20; i++) {
        await recordView(eventId);
    }

    // Simulate 10 bookings
    console.log("Adding 10 bookings...");
    for (let i = 0; i < 10; i++) {
        await recordBookingDemand(eventId, `mock_booking_${Date.now()}_${i}`);
    }

    console.log("✅ Event boosted! It should now be Hot.");
    process.exit(0);
})();

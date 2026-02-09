
import { analyticsService } from "../analytics/analytics.service";
import { logger } from "../lib/logger";

async function run() {
  try {
    console.log("🔥 Fetching Hot Events Stats...");
    const hotEvents = await analyticsService.getHotEventsStats();
    console.table(hotEvents.slice(0, 5));

    console.log("💰 Fetching Pricing Health Stats...");
    const pricingStats = await analyticsService.getPricingHealthStats();
    console.table(pricingStats.slice(0, 5));

    console.log("✅ Analytics Service verification passed.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Verification failed:", error);
    process.exit(1);
  }
}

run();

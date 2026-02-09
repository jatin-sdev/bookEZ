
import { db } from "../db";
import { events, eventSeats, venues } from "../db/schema";
import { eq, sql } from "drizzle-orm";
import { recordBookingDemand, recordView } from "../services/demand.service";

async function simulateTraffic() {
  console.log("🚀 Starting Traffic Simulation...");

  // 1. Get a random active event - Using explicit select to avoid relation issues
  const [activeEvent] = await db.select()
    .from(events)
    .where(eq(events.status, 'PUBLISHED'))
    .limit(1);

  if (!activeEvent) {
    console.error("❌ No active events found to simulate traffic for.");
    process.exit(1);
  }

  console.log(`🎯 Targeting Event: ${activeEvent.name} (${activeEvent.id})`);

  // 2. Simulate Views (lots of people looking)
  const viewsToSimulate = 200;
  console.log(`👀 Simulating ${viewsToSimulate} views...`);
  
  const viewPromises = [];
  for (let i = 0; i < viewsToSimulate; i++) {
    viewPromises.push(recordView(activeEvent.id));
  }
  await Promise.all(viewPromises);

  // 3. Simulate specific bookings (high demand)
  const bookingsToSimulate = 80;
  console.log(`🎟️  Simulating ${bookingsToSimulate} bookings (High Demand Scenario)...`);
  
  for (let i = 0; i < bookingsToSimulate; i++) {
      await recordBookingDemand(activeEvent.id, "sim-book-" + Math.random()); 
  }

  console.log("✅ Simulation complete! Check the dashboard in 30 seconds.");
  process.exit(0);
}

simulateTraffic().catch(console.error);

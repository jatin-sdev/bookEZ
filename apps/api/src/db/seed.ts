import bcrypt from "bcrypt";
import { db } from "./index";
import { users, venues, sections, events } from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("🌱 Seeding database...");

  // Default admin credentials
  const adminEmail = "admin@tf.com";
  const adminPassword = "12345678";

  // Check if admin already exists
  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.email, adminEmail),
  });

  if (!existingAdmin) {
    // Create admin user
    const passwordHash = await bcrypt.hash(adminPassword, 10);

    await db.insert(users).values({
      fullName: "Admin User",
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    });

    console.log("✅ Admin user created successfully!");
    console.log("   Email:", adminEmail);
    console.log("   Password:", adminPassword);
  } else {
    console.log("✅ Admin user already exists");
  }

  // Default normal user credentials
  const userEmail = "user@tf.com";
  const userPassword = "12345678";

  // Check if normal user already exists
  const existingUser = await db.query.users.findFirst({
    where: eq(users.email, userEmail),
  });

  if (!existingUser) {
    // Create normal user
    const passwordHash = await bcrypt.hash(userPassword, 10);

    await db.insert(users).values({
      fullName: "Normal User",
      email: userEmail,
      passwordHash,
      role: "USER",
    });

    console.log("✅ Normal user created successfully!");
    console.log("   Email:", userEmail);
    console.log("   Password:", userPassword);
  } else {
    console.log("✅ Normal user already exists");
  }

  // Check if venues already exist
  const existingVenues = await db.select().from(venues).limit(1);
  
  if (existingVenues.length === 0) {
    console.log("🏟️  Creating sample venues...");
    
    // Create venue 1: Wembley Stadium
    const [wembley] = await db.insert(venues).values({
      name: "Wembley Stadium",
      location: "London, UK",
      capacity: 90000,
    }).returning();

    await db.insert(sections).values([
      { venueId: wembley.id, name: "VIP Circle", capacity: 500, basePrice: 50000 },
      { venueId: wembley.id, name: "General Admission", capacity: 2000, basePrice: 15000 },
      { venueId: wembley.id, name: "Upper Deck", capacity: 1500, basePrice: 8000 },
    ]);

    // Create venue 2: Madison Square Garden
    const [msg] = await db.insert(venues).values({
      name: "Madison Square Garden",
      location: "New York, USA",
      capacity: 20000,
    }).returning();

    await db.insert(sections).values([
      { venueId: msg.id, name: "Floor Seats", capacity: 300, basePrice: 75000 },
      { venueId: msg.id, name: "Lower Bowl", capacity: 800, basePrice: 35000 },
      { venueId: msg.id, name: "Upper Bowl", capacity: 1200, basePrice: 12000 },
    ]);

    console.log("✅ Created 2 sample venues with sections");

    // Create sample event
    await db.insert(events).values({
      name: "Taylor Swift - Eras Tour",
      venueId: wembley.id,
      date: new Date("2026-06-15"),
      status: "PUBLISHED",
    });

    console.log("✅ Created 1 sample event (Eras Tour at Wembley)");
  } else {
    console.log("✅ Venues already exist");
  }

  console.log("\n✨ Database seeding complete!\n");
  process.exit(0);
}

seed().catch((error) => {
  console.error("❌ Seeding failed:", error);
  process.exit(1);
});

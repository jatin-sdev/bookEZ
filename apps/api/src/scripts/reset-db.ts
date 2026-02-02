import { db } from '../db';
import { sql } from 'drizzle-orm';

async function reset() {
  console.log('🗑️  Dropping all tables...');
  
  // Drop tables in correct order due to foreign key constraints
  // Note: We use CASCADE to handle dependencies automatically if preferred, 
  // but explicit order is safer if we want to be sure.
  // Using CASCADE on the parent tables is the most robust way to clear everything.
  
  await db.execute(sql`DROP TABLE IF EXISTS "seats" CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS "sections" CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS "events" CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS "venues" CASCADE;`);
  await db.execute(sql`DROP TABLE IF EXISTS "users" CASCADE;`);
  
  // Drop enums if they exist (Postgres specific)
  await db.execute(sql`DROP TYPE IF EXISTS "seat_status" CASCADE;`);
  await db.execute(sql`DROP TYPE IF EXISTS "event_status" CASCADE;`);
  await db.execute(sql`DROP TYPE IF EXISTS "user_role" CASCADE;`);

  console.log('✅ All tables and types dropped.');
  process.exit(0);
}

reset().catch((err) => {
  console.error('❌ Reset failed:', err);
  process.exit(1);
});

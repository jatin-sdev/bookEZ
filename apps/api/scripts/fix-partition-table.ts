import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function fixPartitionTable() {
  try {
    console.log('🔧 Fixing event_seats table to be partitioned...');
    
    // Drop the existing non-partitioned table
    console.log('1. Dropping existing event_seats table...');
    await db.execute(sql.raw('DROP TABLE IF EXISTS "event_seats" CASCADE'));
    
    // Recreate as partitioned
    console.log('2. Creating partitioned event_seats table...');
    await db.execute(sql.raw(`
      CREATE TABLE "event_seats" (
        "event_id" uuid NOT NULL,
        "seat_id" uuid NOT NULL,
        "section_id" uuid NOT NULL,
        "user_id" uuid,
        "status" "seat_status" DEFAULT 'AVAILABLE' NOT NULL,
        "updated_at" timestamp DEFAULT now(),
        CONSTRAINT "event_seats_pk" PRIMARY KEY ("event_id", "seat_id")
      ) PARTITION BY LIST ("event_id")
    `));
    
    // Create index
    console.log('3. Creating index...');
    await db.execute(sql.raw(`
      CREATE INDEX IF NOT EXISTS "idx_event_seats_lookup" 
      ON "event_seats" ("event_id", "section_id", "status")
    `));
    
    console.log('✅ event_seats table is now partitioned!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixPartitionTable();

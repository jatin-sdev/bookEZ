import { db } from '../src/db';
import { sql } from 'drizzle-orm';
import { readFileSync } from 'fs';
import { join } from 'path';

async function runMigration() {
  try {
    console.log('📦 Running partition migration...');
    
    const migrationSQL = readFileSync(
      join(__dirname, '../drizzle/0002_add_event_seats.sql'),
      'utf-8'
    );
    
    await db.execute(sql.raw(migrationSQL));
    
    console.log('✅ Partition migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runMigration();

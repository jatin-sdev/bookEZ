import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { sql } from 'drizzle-orm';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

async function resetDatabase() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  console.log('🗑️  Dropping all tables and enums...');

  try {
    // Drop tables in reverse dependency order
    await db.execute(sql`DROP TABLE IF EXISTS tickets CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS orders CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS event_seats CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS seats CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS sections CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS events CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS venues CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS users CASCADE;`);
    await db.execute(sql`DROP TABLE IF EXISTS __drizzle_migrations CASCADE;`);

    console.log('✅ All tables dropped');

    // Drop enums
    await db.execute(sql`DROP TYPE IF EXISTS order_status CASCADE;`);
    await db.execute(sql`DROP TYPE IF EXISTS seat_status CASCADE;`);
    await db.execute(sql`DROP TYPE IF EXISTS event_status CASCADE;`);
    await db.execute(sql`DROP TYPE IF EXISTS user_role CASCADE;`);

    console.log('✅ All enums dropped');
    console.log('✨ Database reset complete! You can now run: pnpm --filter api exec drizzle-kit push');

  } catch (error) {
    console.error('❌ Error resetting database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

resetDatabase();

import { db } from '../src/db';
import { sql } from 'drizzle-orm';
import { users, venues, sections, events } from '../src/db/schema';

async function verifyDatabase() {
    console.log('🔍 Verifying database state...\n');

    try {
        // Check all tables
        const tablesResult = await db.execute(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `);

        console.log('📋 Tables in database:');
        tablesResult.rows.forEach((row: any) => {
            console.log(`  - ${row.table_name}`);
        });

        // Check all enums
        const enumsResult = await db.execute(sql`
      SELECT typname 
      FROM pg_type 
      WHERE typtype = 'e' 
      ORDER BY typname;
    `);

        console.log('\n📋 Enums in database:');
        enumsResult.rows.forEach((row: any) => {
            console.log(`  - ${row.typname}`);
        });

        // Check users
        const usersList = await db.select().from(users);
        console.log(`\n👥 Users: ${usersList.length}`);
        usersList.forEach(user => {
            console.log(`  - ${user.email} (${user.role})`);
        });

        // Check venues
        const venuesList = await db.select().from(venues);
        console.log(`\n🏟️  Venues: ${venuesList.length}`);
        venuesList.forEach(venue => {
            console.log(`  - ${venue.name} (${venue.location})`);
        });

        // Check sections
        const sectionsList = await db.select().from(sections);
        console.log(`\n🎫 Sections: ${sectionsList.length}`);
        sectionsList.forEach(section => {
            console.log(`  - ${section.name} (Base Price: ₹${section.basePrice / 100})`);
        });

        // Check events
        const eventsList = await db.select().from(events);
        console.log(`\n🎉 Events: ${eventsList.length}`);
        eventsList.forEach(event => {
            console.log(`  - ${event.name} (${event.date.toISOString().split('T')[0]}) - ${event.status}`);
        });

        // Check if event_seats is partitioned
        const partitionCheck = await db.execute(sql`
      SELECT 
        c.relname as tablename,
        pt.partstrat as partitiontype
      FROM pg_partitioned_table pt
      JOIN pg_class c ON pt.partrelid = c.oid
      JOIN pg_namespace n ON c.relnamespace = n.oid
      WHERE n.nspname = 'public';
    `);

        console.log('\n🔧 Partitioned tables:');
        if (partitionCheck.rows.length > 0) {
            partitionCheck.rows.forEach((row: any) => {
                console.log(`  - ${row.tablename} (partition type: ${row.partitiontype})`);
            });
        } else {
            console.log('  - None');
        }

        console.log('\n✅ Database verification complete!\n');
        process.exit(0);

    } catch (error) {
        console.error('❌ Verification failed:', error);
        process.exit(1);
    }
}

verifyDatabase();

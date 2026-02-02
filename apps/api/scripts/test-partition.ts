import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function testPartition() {
  try {
    const testId = '12345678-1234-1234-1234-123456789012';
    const partitionName = `event_seats_${testId.replace(/-/g, '_')}`;
    
    const query = `
      CREATE TABLE IF NOT EXISTS "${partitionName}" 
      PARTITION OF "event_seats" 
      FOR VALUES IN ('${testId}')
    `;
    
    console.log('Testing SQL:');
    console.log(query);
    console.log('');
    
    await db.execute(sql.raw(query));
    console.log('✅ Partition created successfully!');
    
    // Clean up
    await db.execute(sql.raw(`DROP TABLE IF EXISTS "${partitionName}"`));
    console.log('✅ Test partition removed');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testPartition();

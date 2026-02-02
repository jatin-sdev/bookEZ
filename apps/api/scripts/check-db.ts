import { db } from '../src/db';
import { events } from '../src/db/schema';

async function check() {
  const allEvents = await db.select().from(events);
  console.log('Total Events:', allEvents.length);
  allEvents.forEach(e => console.log(JSON.stringify(e, null, 2)));
  process.exit(0);
}

check().catch(console.error);

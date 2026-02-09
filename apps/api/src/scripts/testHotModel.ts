import { initHotEventModel, predictHotness } from '../ml/hotEventModel';

// Mock stats
const EVENTS = [
  { id: '1', name: 'Cold Event', bookingRate: 1, viewRate: 10, totalCapacity: 1000, bookedSeats: 50 },
  { id: '2', name: 'Warm Event', bookingRate: 10, viewRate: 50, totalCapacity: 1000, bookedSeats: 200 },
  { id: '3', name: 'HOT Event', bookingRate: 40, viewRate: 150, totalCapacity: 500, bookedSeats: 100 }, // High velocity
  { id: '4', name: 'Selling Fast', bookingRate: 20, viewRate: 80, totalCapacity: 100, bookedSeats: 90 }, // High fill rate
];

(async () => {
  console.log('🔥 Testing Hot Event Model...');
  await initHotEventModel();

  for (const event of EVENTS) {
     const score = predictHotness(event);
     console.log(`${event.name}: Score = ${score.toFixed(4)}`);
     
     if (score > 0.6) console.log('   => TRENDING!');
  }
  
  console.log('Done.');
})();

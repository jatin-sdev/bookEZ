import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { Kafka } from 'kafkajs';
import cors from 'cors';
import { env } from './config/env';

const app = express();
app.use(cors({ origin: env.CORS_ORIGIN }));

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: env.CORS_ORIGIN,
    methods: ["GET", "POST"]
  }
});

// --- Kafka Consumer Setup ---
const kafka = new Kafka({
  clientId: 'ticketforge-realtime',
  brokers: [env.KAFKA_BROKER],
});

const consumer = kafka.consumer({ groupId: 'realtime-seat-updates' });

async function startKafkaConsumer() {
  try {
    await consumer.connect();
    console.log('✅ [Kafka] Consumer connected');
    
    // Subscribe to topics
    await consumer.subscribe({ topic: 'seat-events', fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (!message.value) return;
        
        const rawMessage = message.value.toString();
        try {
          const eventData = JSON.parse(rawMessage);
          const { eventId, seatId, status } = eventData.payload || {};


          if (eventId) {
            // console.log(`📨 [Kafka] Update for Event: ${eventId} -> Type: ${eventData.type}`);

            // SCALABILITY FIX: Broadcast ONLY to the specific event room
            // Emit the SPECIFIC event type so frontend listeners trigger
            io.to(eventId).emit(eventData.type, eventData.payload);
            
            // Handle SEATS_BOOKED explicitly if needed, but generic emission works if frontend listens to SEATS_BOOKED
          }
        } catch (err) {
          console.error('❌ [Kafka] Error parsing message:', err);
        }
      },
    });
  } catch (error) {
    console.error('❌ [Kafka] Consumer error:', error);
    process.exit(1); // Exit if Kafka fails, k8s will restart
  }
}

// --- Socket Lifecycle ---
io.on('connection', (socket) => {
  // console.log(`🔌 [Socket] Client connected: ${socket.id}`);

  // SCALABILITY FIX: Clients must join a room to receive updates
  socket.on('join-event', (eventId: string) => {
    if (eventId) {
        socket.join(eventId);
        // console.log(`socket ${socket.id} joined room: ${eventId}`);
    }
  });

  socket.on('leave-event', (eventId: string) => {
    if (eventId) {
        socket.leave(eventId);
        // console.log(`socket ${socket.id} left room: ${eventId}`);
    }
  });

  socket.on('disconnect', () => {
    // console.log(`❌ [Socket] Client disconnected: ${socket.id}`);
  });
});

// --- Start Server ---
httpServer.listen(env.REALTIME_PORT, async () => {
  console.log(`🚀 Realtime Service running on http://localhost:${env.REALTIME_PORT}`);
  await startKafkaConsumer();
});
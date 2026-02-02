import { Kafka, Producer, Consumer } from 'kafkajs';
import { Server } from 'socket.io';
import { env } from '../config/env';
import { logger } from './logger';

const kafka = new Kafka({
  clientId: 'ticketforge-api',
  brokers: [env.KAFKA_BROKER],
  retry: {
    initialRetryTime: 300,
    retries: 5
  }
});

let producer: Producer | null = null;

export const connectKafkaProducer = async () => {
  if (producer) return producer;

  producer = kafka.producer();
  
  try {
    await producer.connect();
    logger.info('✅ Kafka Producer connected');
  } catch (error) {
    logger.error('❌ Failed to connect Kafka Producer', error);
    // In production, you might want to throw here to fail startup
  }
  return producer;
};

/**
 * Publishes an event to a Kafka topic.
 * @param topic The topic name (e.g., 'seat-events')
 * @param type The event type (e.g., 'SEAT_LOCKED')
 * @param payload The data payload
 */
export const sendEvent = async (topic: string, type: string, payload: any) => {
  if (!producer) {
    await connectKafkaProducer(); 
  }
  
  if (producer) {
    try {
      await producer.send({
        topic,
        messages: [
          { 
            key: payload.id || undefined, // Use ID as partition key if available
            value: JSON.stringify({ type, payload, timestamp: new Date().toISOString() }) 
          },
        ],
      });
      // logger.info(`📤 Kafka Event Sent: ${type}`);
    } catch (error) {
      logger.error('❌ Failed to send Kafka event', error);
    }
  }
};

let consumer: Consumer | null = null;

export const connectKafkaConsumer = async (io: Server) => {
  if (consumer) return consumer;

  consumer = kafka.consumer({ groupId: 'api-websocket-gateway' });

  try {
    await consumer.connect();
    logger.info('✅ Kafka Consumer connected');

    await consumer.subscribe({ topic: 'seat-events', fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const value = message.value?.toString();
          if (!value) return;

          const event = JSON.parse(value);
          const { type, payload } = event;

          if (topic === 'seat-events') {
            let updatePayload: any = null;

            if (type === 'SEATS_BOOKED') {
              const { eventId, seatIds, status, triggeredBy } = payload;
              updatePayload = { eventId, seatIds, status, lockedBy: triggeredBy };
            } 
            else if (type === 'SEAT_LOCKED') {
              const { eventId, seatId, status, userId } = payload;
              updatePayload = { eventId, seatIds: [seatId], status, lockedBy: userId };
            }
            else if (type === 'SEAT_UNLOCKED') {
              const { eventId, seatId, status } = payload;
               updatePayload = { eventId, seatIds: [seatId], status, lockedBy: null };
            }

            if (updatePayload) {
              const { eventId, ...data } = updatePayload;
              io.to(`event:${eventId}`).emit('seat-update', data);

              logger.info(`CONSUMER PROCESSING: ${type} -> Broadcasting status '${data.status}' for ${data.seatIds?.length} seats to event:${eventId}`);
              // logger.info(`Payload: ${JSON.stringify(data)}`);
            }
          }

        } catch (err) {
          logger.error('Error processing Kafka message', err);
        }
      },
    });

  } catch (error) {
    logger.error('❌ Failed to connect Kafka Consumer', error);
  }
  return consumer;
};
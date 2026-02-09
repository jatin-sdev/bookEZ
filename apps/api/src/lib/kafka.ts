import { Kafka, Producer } from 'kafkajs';
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
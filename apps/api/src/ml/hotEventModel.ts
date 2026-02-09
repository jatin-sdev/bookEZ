import * as tf from "@tensorflow/tfjs";
import { logger } from "../lib/logger";
import { env } from "../config/env";

// Factors: [BookingVelocity, ViewVelocity, FillRate]
// Normalized inputs:
// BookingVelocity: 0-MAX per hour -> 0-1
// ViewVelocity: 0-MAX per hour -> 0-1
// FillRate: 0-1 -> 0-1

const MAX_BOOKINGS_PER_HOUR = env.HOT_EVENT_BOOKING_THRESHOLD;
const MAX_VIEWS_PER_HOUR = env.HOT_EVENT_VIEW_THRESHOLD;

let model: tf.Sequential;
let trained = false;

// Initialize and train the model (simple in-memory training for now)
export async function initHotEventModel() {
    if (trained) return;

    model = tf.sequential();
    
    // Input layer: 3 features
    model.add(tf.layers.dense({ units: 8, inputShape: [3], activation: "relu" }));
    
    // Hidden layer
    model.add(tf.layers.dense({ units: 4, activation: "relu" }));

    // Output: Single "Hotness" score 0 to 1
    model.add(tf.layers.dense({ units: 1, activation: "sigmoid" }));

    model.compile({
        optimizer: tf.train.adam(0.01),
        loss: "meanSquaredError",
    });

    // Synthetic Training Data
    // Pattern: High bookings OR High views OR High fill rate -> active
    // But mostly looking for VELOCITY (Bookings + Views)
    
    const xsData = [
       // [Bookings, Views, Fill]
       [0.0, 0.0, 0.0], // Dead
       [0.0, 0.1, 0.1], // Cold
       [0.1, 0.2, 0.5], // Warm
       [0.5, 0.5, 0.2], // Hot (Selling fast)
       [0.2, 0.8, 0.1], // Hot (High interest/viral)
       [0.9, 0.9, 0.9], // On Fire
       [1.0, 1.0, 1.0], // Max
    ];

    const ysData = [
        [0.0],
        [0.1],
        [0.3],
        [0.7],
        [0.8],
        [0.95],
        [0.99]
    ];

    const xs = tf.tensor2d(xsData);
    const ys = tf.tensor2d(ysData);

    await model.fit(xs, ys, { epochs: 500, verbose: 0 });
    
    trained = true;
    logger.info("🔥 Hot Event Model initialized and trained.");
}

export interface EventHotStats {
    bookingRate: number; // bookings/hr
    viewRate: number;    // views/hr
    totalCapacity: number;
    bookedSeats: number;
}

export function predictHotness(stats: EventHotStats): number {
    if (!trained) return 0;

    const fillRate = stats.totalCapacity > 0 ? stats.bookedSeats / stats.totalCapacity : 0;
    
    const normBookings = Math.min(stats.bookingRate, MAX_BOOKINGS_PER_HOUR) / MAX_BOOKINGS_PER_HOUR;
    const normViews = Math.min(stats.viewRate, MAX_VIEWS_PER_HOUR) / MAX_VIEWS_PER_HOUR;

    const input = tf.tensor2d([[normBookings, normViews, fillRate]]);
    const prediction = model.predict(input) as tf.Tensor;
    
    const score = prediction.dataSync()[0];
    
    input.dispose();
    prediction.dispose();

    return score;
}

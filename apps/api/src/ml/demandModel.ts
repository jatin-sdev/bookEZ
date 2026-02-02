import * as tf from "@tensorflow/tfjs";

const MAX_DEMAND = 100;

// --- Model ---
const model = tf.sequential();
model.add(tf.layers.dense({ units: 8, inputShape: [1], activation: "relu" }));
model.add(tf.layers.dense({ units: 1, activation: "sigmoid" })); // 🔑 KEY CHANGE

model.compile({
    optimizer: tf.train.adam(0.01), // slightly higher LR
    loss: "meanSquaredError",
});

let trained = false;

// --- Train once ---
export async function initDemandModel() {
    if (trained) return;

    // Demand normalized [0–1]
    const xs = tf.tensor2d([
        [0.0],
        [0.1],
        [0.3],
        [0.5],
        [0.7],
        [1.0],
    ]);

    // Multiplier normalized to [0–1]
    // 1.0 → 0.0
    // 2.0 → 1.0
    const ys = tf.tensor2d([
        [0.0],  // 1.0x
        [0.05], // 1.05x
        [0.2],  // 1.2x
        [0.4],  // 1.4x
        [0.7],  // 1.7x
        [1.0],  // 2.0x
    ]);

    await model.fit(xs, ys, { epochs: 800, verbose: 0 });
    trained = true;

    console.log("🤖 Demand multiplier model initialized (sigmoid)");
}

// --- Predict multiplier ---
export function predictMultiplierByDemand(demand: number): number {
    if (!trained) return 1.0;

    const normalizedDemand = Math.min(demand, MAX_DEMAND) / MAX_DEMAND;
    const input = tf.tensor2d([[normalizedDemand]]);
    const prediction = model.predict(input) as tf.Tensor;

    const normalizedMultiplier = prediction.dataSync()[0];

    // Map [0–1] → [1–2]
    const multiplier = 1 + normalizedMultiplier;

    return Math.min(2.0, Math.max(1.0, multiplier));
}

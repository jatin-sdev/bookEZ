type SeatType = "ORDINARY" | "PREMIUM";

interface PricingInput {
    basePrice: number;
    seatType: SeatType;
    totalSeats: number;
    bookedSeats: number;
    eventDate: Date;
}

export function calculateDynamicPrice(input: PricingInput) {
    let price = input.basePrice;

    // Seat type rule
    if (input.seatType === "PREMIUM") {
        price *= 1.5;
    }

    // Demand rule
    const demandRatio = input.bookedSeats / input.totalSeats;

    if (demandRatio > 0.9) price *= 1.4;
    else if (demandRatio > 0.7) price *= 1.2;

    // Time rule
    const hoursLeft =
        (input.eventDate.getTime() - Date.now()) / (1000 * 60 * 60);

    if (hoursLeft < 24) {
        price *= 1.25;
    }

    return Math.round(price);
}

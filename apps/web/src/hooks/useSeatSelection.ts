import { useState, useCallback } from 'react';
// Import the updated SeatData type we defined in the Renderer
import { SeatData } from '@/components/events/Booking/SeatMapRenderer';

export const useSeatSelection = (maxSeats = 4) => {
  const [selectedSeats, setSelectedSeats] = useState<SeatData[]>([]);
  const [error, setError] = useState<string | null>(null);

  const toggleSeat = useCallback((seat: SeatData) => {
    setError(null); // Clear error on interaction

    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.id === seat.id);
      
      // 1. Deselect if already selected
      if (exists) {
        return prev.filter((s) => s.id !== seat.id);
      }

      // 2. Prevent selecting if max reached
      if (prev.length >= maxSeats) {
        setError(`You can only select up to ${maxSeats} seats.`);
        return prev;
      }

      // 3. Select new seat
      return [...prev, seat];
    });
  }, [maxSeats]);

  const clearSelection = useCallback(() => {
    setSelectedSeats([]);
    setError(null);
  }, []);

  // Helper to check if we can select more
  const canSelectMore = selectedSeats.length < maxSeats;
  
  // Calculate total price
  const totalPrice = selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);

  return { 
    selectedSeats, 
    toggleSeat, 
    clearSelection,
    canSelectMore,
    totalPrice,
    error
  };
};
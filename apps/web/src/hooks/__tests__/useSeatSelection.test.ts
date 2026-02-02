import { renderHook, act } from '@testing-library/react';
import { useSeatSelection } from '../useSeatSelection';
import { SeatData } from '@/components/events/Booking/SeatMapRenderer';

// Mock Data
const mockSeat1: SeatData = { id: '1', x: 0, y: 0, status: 'AVAILABLE', label: 'A1', price: 100 };
const mockSeat2: SeatData = { id: '2', x: 0, y: 0, status: 'AVAILABLE', label: 'A2', price: 150 };
const mockSeat3: SeatData = { id: '3', x: 0, y: 0, status: 'AVAILABLE', label: 'A3', price: 100 };

describe('useSeatSelection Hook', () => {
  it('should start with empty selection', () => {
    const { result } = renderHook(() => useSeatSelection());
    expect(result.current.selectedSeats).toEqual([]);
    expect(result.current.totalPrice).toBe(0);
  });

  it('should select a seat and update total price', () => {
    const { result } = renderHook(() => useSeatSelection());

    act(() => {
      result.current.toggleSeat(mockSeat1);
    });

    expect(result.current.selectedSeats).toHaveLength(1);
    expect(result.current.selectedSeats[0].id).toBe('1');
    expect(result.current.totalPrice).toBe(100);
  });

  it('should deselect a seat if clicked again', () => {
    const { result } = renderHook(() => useSeatSelection());

    act(() => {
      result.current.toggleSeat(mockSeat1); // Select
    });
    act(() => {
      result.current.toggleSeat(mockSeat1); // Deselect
    });

    expect(result.current.selectedSeats).toHaveLength(0);
    expect(result.current.totalPrice).toBe(0);
  });

  it('should respect the max seat limit', () => {
    const { result } = renderHook(() => useSeatSelection(2)); // Max 2

    act(() => {
      result.current.toggleSeat(mockSeat1);
      result.current.toggleSeat(mockSeat2);
    });

    // Try to add 3rd
    act(() => {
      result.current.toggleSeat(mockSeat3);
    });

    expect(result.current.selectedSeats).toHaveLength(2); // Should still be 2
    expect(result.current.error).toBe('You can only select up to 2 seats.');
  });
});
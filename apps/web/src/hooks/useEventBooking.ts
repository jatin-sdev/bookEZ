import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { graphqlClient } from '@/lib/graphql';
import { gql } from 'graphql-request';
import { useSocket } from '@/hooks/useSocket';
import { useToast } from '@/components/ToastProvider';
import { useSeatSelection } from '@/hooks/useSeatSelection';
import { useAuth } from '@/providers/AuthProvider'; // Import Auth Hook
import { SeatData, SeatStatus } from '@/components/events/Booking/SeatMapRenderer';
import { useRouter } from 'next/navigation';

// --- Strict Types ---
interface Section {
  id: string;
  name: string;
  capacity: number;
  basePrice: number;
}

interface Venue {
  id: string;
  name: string;
  sections: Section[];
}

interface EventDetail {
  id: string;
  name: string;
  venue: Venue;
}

interface SeatResponse {
  id: string;
  row: string | null;
  number: string;
  x: number | null;
  y: number | null;
  status: SeatStatus;
  lockedBy?: string | null;
}

// --- Queries ---
const GET_EVENT_DETAILS = gql`
  query GetBookingEventDetails($eventId: ID!) {
    event(id: $eventId) {
      id
      name
      venue {
        id
        name
        sections {
          id
          name
          capacity
          basePrice 
        }
      }
    }
  }
`;

const GET_SECTION_SEATS = gql`
  query GetSectionSeats($eventId: ID!, $sectionId: ID!) {
    sectionSeats(eventId: $eventId, sectionId: $sectionId) {
      id
      row
      number
      x
      y
      status
      lockedBy
    }
  }
`;

const LOCK_SEAT = gql`
  mutation LockSeat($eventId: ID!, $seatId: ID!) {
    lockSeat(eventId: $eventId, seatId: $seatId) { id status }
  }
`;

const UNLOCK_SEAT = gql`
  mutation UnlockSeat($eventId: ID!, $seatId: ID!) {
    unlockSeat(eventId: $eventId, seatId: $seatId)
  }
`;

const BOOK_TICKETS = gql`
  mutation BookTickets($eventId: ID!, $seatIds: [ID!]!, $idempotencyKey: String!) {
    bookTickets(eventId: $eventId, seatIds: $seatIds, idempotencyKey: $idempotencyKey) {
      id
      status
    }
  }
`;

export const useEventBooking = (eventId: string) => {
  const router = useRouter();
  const socket = useSocket(eventId);
  const { addToast } = useToast();
  const { user, refreshProfile } = useAuth(); // Use Auth Hook internally
  const userId = user?.id; // Derived
  
  const { selectedSeats, toggleSeat, clearSelection } = useSeatSelection(6);

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [realtimeSeats, setRealtimeSeats] = useState<SeatData[]>([]);

  // 1. Fetch Event Meta
  const { data: eventData, isLoading: isEventLoading, error: eventError } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => graphqlClient.request<{ event: EventDetail }>(GET_EVENT_DETAILS, { eventId }),
  });

  const event = eventData?.event;
  const sections = event?.venue?.sections || [];

  // Auto-select first section
  useEffect(() => {
    if (sections.length > 0 && !activeSectionId) {
      setActiveSectionId(sections[0].id);
    }
  }, [sections, activeSectionId]);

  // 2. Fetch Seats
  const { data: seatData, isLoading: isSeatsLoading } = useQuery({
    queryKey: ['seats', eventId, activeSectionId],
    queryFn: async () => {
      if (!activeSectionId) return null;
      return graphqlClient.request<{ sectionSeats: SeatResponse[] }>(GET_SECTION_SEATS, { eventId, sectionId: activeSectionId });
    },
    enabled: !!activeSectionId,
  });

  // 3. Hydrate & Merge Data
  // We use a separate state 'realtimeSeats' to avoid waiting for React Query re-fetches on socket events
  useEffect(() => {
    if (seatData?.sectionSeats && activeSectionId) {
      const currentSection = sections.find(s => s.id === activeSectionId);
      const basePrice = currentSection?.basePrice || 0;

      const mapped = seatData.sectionSeats.map(s => {
        let uiStatus = s.status || 'AVAILABLE';
        if (s.status === 'LOCKED' && s.lockedBy === userId) {
           uiStatus = 'AVAILABLE';
        }

        return {
          id: s.id,
          // Convert nulls to undefined for cleaner strict typing if needed, or keep null
          x: s.x,
          y: s.y,
          row: s.row,
          number: s.number,
          status: uiStatus,
          label: `${s.row ? s.row : ''}${s.number}`,
          price: basePrice,
        };
      });
      setRealtimeSeats(mapped);
    }
  }, [seatData, activeSectionId, sections, userId]);

  // 4. Socket Listeners
  useEffect(() => {
    if (!socket) return;

    const updateSeatStatus = (seatId: string, status: SeatStatus) => {
      setRealtimeSeats(prev => 
        prev.map(seat => seat.id === seatId ? { ...seat, status } : seat)
      );
      
      // If a seat I selected gets booked by someone else (race condition), remove it
      if (status === 'BOOKED' || status === 'LOCKED') {
         // In a real app, check if the lock owner is NOT the current user
         // For now, we assume if a socket event comes in, we update the UI
      }
    };

    socket.on('SEAT_LOCKED', (p: any) => {
        if (p.userId === userId) return;
        updateSeatStatus(p.seatId, 'LOCKED');
    });

    socket.on('SEAT_UNLOCKED', (p: any) => updateSeatStatus(p.seatId, 'AVAILABLE'));
    
    socket.on('SEAT_BOOKED', (p: any) => updateSeatStatus(p.seatId, 'BOOKED'));
    
    socket.on('SEATS_BOOKED', (p: any) => {
        if (p.seatIds && Array.isArray(p.seatIds)) {
            p.seatIds.forEach((id: string) => updateSeatStatus(id, 'BOOKED'));
        }
    });

    return () => {
      socket.off('SEAT_LOCKED');
      socket.off('SEAT_UNLOCKED');
      socket.off('SEAT_BOOKED');
      socket.off('SEATS_BOOKED');
    };
  }, [socket, userId]);

  // --- 4b. Cleanup on Unmount (Handling Page Leave) ---
  // We use a ref to access the latest selectedSeats without adding it to the dependency array
  // of a useEffect, which would trigger on every selection change.
  const selectedSeatsRef = React.useRef(selectedSeats);
  useEffect(() => {
     selectedSeatsRef.current = selectedSeats;
  }, [selectedSeats]);

  useEffect(() => {
     return () => {
        // When component unmounts (navigating away), release locks
        const seatsToUnlock = selectedSeatsRef.current;
        if (seatsToUnlock.length > 0) {
           console.log(`🧹 Creating cleanup tasks for ${seatsToUnlock.length} seats...`);
           
           seatsToUnlock.forEach(seat => {
              // We use fetch/sendBeacon for reliability during unmount to ensure 
              // the request goes out even if the React lifecycle is terminating.
              const query = JSON.stringify({
                  query: `mutation UnlockSeat($eventId: ID!, $seatId: ID!) { unlockSeat(eventId: $eventId, seatId: $seatId) }`,
                  variables: { eventId, seatId: seat.id }
              });

              // Fire-and-forget beacon style using fetch with keepalive if supported
              // or standard fetch
              fetch('http://localhost:4000/graphql', { // Hardcoded URL for now, strictly should use env
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      // 'Authorization': `Bearer ...` // If required, but we might rely on cookie or session if available
                      // Ideally we grab the token from localStorage
                      'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
                  },
                  body: query,
                  keepalive: true // Critical for unmount requests
              }).catch(e => console.error("Unlock cleanup failed", e));
           });
        }
     };
  }, [eventId]); // Run once on mount (cleanup on unmount)

  // Listen for window close/reload specifically
  useEffect(() => {
    const handleBeforeUnload = () => {
        const seatsToUnlock = selectedSeatsRef.current;
        if (seatsToUnlock.length > 0) {
           seatsToUnlock.forEach(seat => {
              const query = JSON.stringify({
                  query: `mutation UnlockSeat($eventId: ID!, $seatId: ID!) { unlockSeat(eventId: $eventId, seatId: $seatId) }`,
                  variables: { eventId, seatId: seat.id }
              });

              fetch('http://localhost:4000/graphql', {
                  method: 'POST',
                  headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('accessToken') || ''}`
                  },
                  body: query,
                  keepalive: true 
              }).catch(e => console.error(e));
           });
        }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [eventId]);

  // 5. Mutations
  const lockMutation = useMutation({
    mutationFn: (vars: { eventId: string; seatId: string }) => graphqlClient.request(LOCK_SEAT, vars),
    onError: () => addToast("Failed to lock seat. It may have been taken.", "error"),
  });

  const unlockMutation = useMutation({
    mutationFn: (vars: { eventId: string; seatId: string }) => graphqlClient.request(UNLOCK_SEAT, vars),
    onError: () => addToast("Failed to unlock seat.", "error"),
  });

  const bookMutation = useMutation({
    mutationFn: (vars: { eventId: string; seatIds: string[]; idempotencyKey: string }) => 
      graphqlClient.request(BOOK_TICKETS, vars),
    onSuccess: (data: any) => {
      addToast("Seats reserved! Redirecting to payment...", "success");
      clearSelection();
      const orderId = data.bookTickets.id;
      router.push(`/checkout?orderId=${orderId}`);
    },
    onError: () => addToast("Booking failed. Please try again.", "error"),
  });

  // 6. Handlers
  const handleSeatClick = useCallback(async (seat: SeatData) => {
    // Robust Auth Check
    let currentUserId = user?.id;
    
    if (!currentUserId) {
        // Fallback: Check if token exists in storage but user state is stale
        const token = localStorage.getItem('accessToken');
        if (token) {
            try {
                await refreshProfile();
                // We can't await the state update here immediately in closure, 
                // but we can try to proceed or ask user to retry.
                // Or better: Checking token means "we MIGHT be logged in".
                
                // Let's optimisticly assume refresh works and we simply warn user to retry 
                // or we rely on the component re-rendering.
                
                // Better approach: Since we can't get the updated state instantly in this closure,
                // we tell the user we are refreshing session.
                addToast("Refreshing session... please try again.", "info");
                return;
            } catch (e) {
                // If refresh fails, then truly logged out
            }
        }
        
        addToast("Please login to select seats", "error");
        return router.push('/login');
    }

    const isSelecting = !selectedSeats.find(s => s.id === seat.id);
    
    // Optimistic UI Update handled by useSeatSelection hook, 
    // but we trigger the side effect here
    toggleSeat(seat);

    if (isSelecting) {
      try {
        await lockMutation.mutateAsync({ eventId, seatId: seat.id });
      } catch (err) {
        toggleSeat(seat); // Revert on failure
      }
    } else {
       // Unlock API call
       try {
         await unlockMutation.mutateAsync({ eventId, seatId: seat.id });
       } catch (e) {
         // If unlock fails, we might want to revert UI? 
         // But usually it's fine, it will expire anyway.
       }
    }
  }, [user, selectedSeats, toggleSeat, lockMutation, unlockMutation, eventId, router, addToast, refreshProfile]);

  const handleCheckout = useCallback(async () => {
    if (selectedSeats.length === 0) return;
    // Polyfill for crypto.randomUUID in insecure contexts
    const generateUUID = () => {
        if (typeof crypto !== 'undefined' && crypto.randomUUID) {
            return crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    };
    const idempotencyKey = generateUUID();
    await bookMutation.mutateAsync({
      eventId,
      seatIds: selectedSeats.map(s => s.id),
      idempotencyKey
    });
  }, [bookMutation, eventId, selectedSeats]);

  return {
    event,
    sections,
    activeSectionId,
    setActiveSectionId,
    seats: realtimeSeats,
    selectedSeats,
    isLoading: isEventLoading || isSeatsLoading,
    isProcessing: bookMutation.isPending,
    error: eventError,
    handleSeatClick,
    handleCheckout
  };
};
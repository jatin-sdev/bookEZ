'use client';

import React from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { useEventBooking } from '@/hooks/useEventBooking';
import { SeatMapRenderer } from '@/components/events/Booking/SeatMapRenderer';
import { BookingSummary } from '@/components/events/Booking/BookingSummary';
import { SectionTabs } from '@/components/events/Booking/SectionTabs';

export default function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: eventId } = React.use(params);
  const { user, isLoading: isAuthLoading } = useAuth();
  
  // All logic is hoisted to the hook
  const {
    event,
    sections,
    activeSectionId,
    setActiveSectionId,
    seats,
    selectedSeats,
    isLoading,
    isProcessing,
    error,
    handleSeatClick,
    handleCheckout
  } = useEventBooking(eventId);

  if (isLoading || isAuthLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <span className="loading loading-spinner loading-lg text-primary"></span>
          <p className="text-gray-500 font-medium">Loading venue map...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 text-red-500">
        <p>Failed to load event. Please try refreshing.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden bg-background-dark text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-background-darker/50 py-4 px-6 shadow-sm z-10 flex justify-between items-center shrink-0 backdrop-blur-md">
        <div>
          <h1 className="font-bold text-xl text-white">{event.name}</h1>
          <p className="text-sm text-gray-400 flex items-center gap-2">
            📍 {event.venue.name}
          </p>
        </div>
      </header>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        {/* Main Stage (Canvas) */}
        <main className="flex-1 p-4 md:p-6 flex flex-col relative min-w-0 order-1 lg:order-1 h-2/3 lg:h-auto">
          <SectionTabs 
             sections={sections} 
             activeSectionId={activeSectionId} 
             onSelect={setActiveSectionId} 
          />
          
          <div className="flex-1 bg-surface-dark rounded-xl shadow-2xl border border-gray-800 overflow-hidden relative mt-4 h-full ring-1 ring-white/5">
             <SeatMapRenderer 
                 seats={seats}
                 selectedSeatIds={selectedSeats.map(s => s.id)}
                 onSeatClick={handleSeatClick}
             />
          </div>
        </main>

        {/* Sidebar (Cart) */}
        <aside className="w-full lg:w-96 bg-surface-dark border-t lg:border-t-0 lg:border-l border-gray-800 shadow-xl z-20 flex flex-col shrink-0 order-2 lg:order-2 h-1/3 lg:h-auto overflow-y-auto">
          <div className="flex-1 h-full">
            <BookingSummary 
              selectedSeats={selectedSeats}
              onCheckout={handleCheckout}
              isProcessing={isProcessing}
              // Calculate expiration based on first selection time in a real app
              lockExpiryTime={Date.now() + 1000 * 60 * 10} 
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
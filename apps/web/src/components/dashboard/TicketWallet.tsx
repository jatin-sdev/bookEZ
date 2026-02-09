'use client';

import React from 'react';
import Link from 'next/link';
import { Ticket as TicketIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Ticket } from '@/components/tickets/Ticket';

interface TicketWalletProps {
  orders: any[]; // Replacing 'any' with a proper type is recommended for future refactors
  userFullName?: string;
}

export const TicketWallet: React.FC<TicketWalletProps> = ({ orders, userFullName }) => {
  // We rely on the parent to pass the correct list of orders
  
  if (orders.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-900/50 rounded-3xl border border-dashed border-slate-700">
        <div className="bg-slate-800 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
          <TicketIcon className="w-10 h-10 text-slate-600" />
        </div>
        <h3 className="text-xl font-bold text-white">No Upcoming Tickets</h3>
        <p className="text-slate-400 mb-6 max-w-sm mx-auto mt-2">
          You haven't booked any upcoming events yet. Browse our marketplace to find your next experience.
        </p>
        <Link href="/events">
          <Button variant="outline">Browse Events</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {orders.map((order: any) => (
        <React.Fragment key={order.id}>
          {order.tickets.map((ticket: any) => (
            <div key={ticket.id} className="flex justify-center h-full">
              <Ticket
                id={ticket.id}
                eventName={order.event?.name || 'Unknown Event'}
                eventDate={order.event?.date || new Date().toISOString()}
                venueName={order.event?.venue?.name || 'Unknown Venue'}
                section={ticket.sectionName}
                row={ticket.row}
                number={ticket.number}
                qrCodeValue={ticket.qrCode || `TICKET|${ticket.id}`}
                holderName={userFullName || "Guest"}
              />
            </div>
          ))}
        </React.Fragment>
      ))}
    </div>
  );
};

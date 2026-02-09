"use client";

import { useEffect, useState } from "react";

import TicketCard from "@/components/tickets/TicketCard";
import { getMyOrders, Order } from "@/lib/api";
import { Loader2, Ticket as TicketIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function MyTicketsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrders()
      .then((res: any) => {
        // @ts-ignore
        setOrders(res.data?.myOrders || []);
      })
      .catch((err: any) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display">


      <main className="max-w-4xl mx-auto px-4 py-24">
        <div className="mb-10 text-center space-y-2">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white">Your Wallet</h1>
          <p className="text-slate-500">Access your secure digital passes.</p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
            <p className="text-slate-400">Loading your tickets...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
            <TicketIcon className="w-16 h-16 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No tickets yet</h2>
            <p className="text-slate-500 mb-6">Looks like you haven't booked any events.</p>
            <Link href="/">
              <Button variant="primary">Browse Events</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => 
              order.tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticketId={ticket.id}
                  eventName={order.eventName || "Event Name"}
                  eventImage={order.eventImage || "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4"}
                  date={order.createdAt} // Should be event date in real app
                  location={order.eventLocation || "Main Venue"}
                  seat={`${ticket.sectionName} • Row ${ticket.row} • Seat ${ticket.number}`}
                  qrCodeValue={`TICKET:${ticket.id}:${ticket.qrCode}`}
                />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}
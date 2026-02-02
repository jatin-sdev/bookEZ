// apps/web/src/app/tickets/page.tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMyOrders, Order } from '@/lib/api';
import { 
  Ticket as TicketIcon, Calendar, Clock, MapPin, 
  QrCode, CheckCircle, AlertCircle, Loader2 
} from 'lucide-react';

export default function TicketsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      // Check if user is logged in before making the request
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login?redirect=/tickets');
        return;
      }

      try {
        const res = await getMyOrders();
        // Filter out pending/cancelled orders to show only confirmed tickets
        const confirmedOrders = res.data.myOrders.filter(o => o.status === 'COMPLETED');
        setOrders(confirmedOrders);
      } catch (err: any) {
        console.error(err);
        // Handle authentication errors (various formats)
        // Handle authentication errors (various formats)
        if (err.message.includes('Unauthorized') || 
            err.message.includes('UNAUTHENTICATED') ||
            err.message.includes('log in')) {
          // err.message.includes('non-nullable') - Removed to prevent loop
          router.push('/login?redirect=/tickets');
        } else {
          setError(err.message || 'Failed to load tickets');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 font-display text-white">


      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold tracking-tight">My Tickets</h1>
          <span className="text-slate-500 text-sm font-medium">
            {orders.length} Orders Found
          </span>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {orders.length === 0 && !error ? (
          <div className="text-center py-20 bg-slate-900 rounded-2xl border border-dashed border-slate-700">
            <TicketIcon className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-white">No tickets yet</h3>
            <p className="text-slate-500 mb-6">You haven't booked any events yet.</p>
            <Link 
              href="/" 
              className="inline-flex items-center justify-center px-6 py-2.5 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark transition-all"
            >
              Browse Events
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div 
                key={order.id} 
                className="bg-slate-900 rounded-2xl border border-slate-700 shadow-sm overflow-hidden"
              >
                {/* Order Header */}
                <div className="px-5 py-3 bg-slate-800/50 border-b border-slate-700 flex flex-wrap items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Order ID</p>
                    <p className="font-mono text-sm font-medium text-slate-300">
                      #{order.id.slice(0, 8)}...
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Date Booked</p>
                    <div className="flex items-center gap-1.5 text-sm font-medium">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      {new Date(parseInt(order.createdAt)).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Paid</p>
                    <p className="text-sm font-black text-white">
                      ₹{(order.totalAmount / 100).toFixed(2)}
                    </p>
                  </div>

                  <div className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold flex items-center gap-1.5">
                    <CheckCircle className="w-3.5 h-3.5" />
                    {order.status}
                  </div>
                </div>

                {/* Tickets Grid */}
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {order.tickets.map((ticket) => (
                    <div 
                      key={ticket.id}
                      className="flex border border-slate-700 rounded-xl overflow-hidden hover:border-primary/50 transition-colors group"
                    >
                      {/* Ticket Info */}
                      <div className="flex-1 p-4 space-y-3">
                        <div>
                          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Section</p>
                          <p className="font-bold text-base">{ticket.sectionName}</p>
                        </div>
                        <div className="flex gap-6">
                          <div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Row</p>
                            <p className="font-mono font-bold text-base">{ticket.row}</p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-1">Seat</p>
                            <p className="font-mono font-bold text-base bg-slate-800 px-2 rounded">
                              {ticket.number}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* QR Stub */}
                      <div className="w-24 bg-slate-800 border-l border-dashed border-slate-700 flex flex-col items-center justify-center p-2 gap-2">
                        <QrCode className="w-10 h-10 text-white opacity-80 group-hover:opacity-100 transition-opacity" />
                        <span className="text-[10px] text-slate-400 font-mono rotate-90 whitespace-nowrap">
                          SCAN ENTRY
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
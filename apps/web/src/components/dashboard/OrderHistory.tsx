'use client';

import React from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import { formatPrice, cn } from '@/lib/utils';

interface OrderHistoryProps {
  orders: any[];
}

export const OrderHistory: React.FC<OrderHistoryProps> = ({ orders }) => {
  // Sort by date descending
  const sortedOrders = [...orders].sort((a, b) => {
    const dateA = a.event?.date ? new Date(a.event.date).getTime() : 0;
    const dateB = b.event?.date ? new Date(b.event.date).getTime() : 0;
    return dateB - dateA;
  });

  return (
    <div className="bg-slate-900 rounded-2xl shadow-sm border border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-800/50 border-b border-slate-700">
            <tr>
              <th className="p-4 font-semibold text-slate-400 text-xs uppercase tracking-wider">Event Details</th>
              <th className="p-4 font-semibold text-slate-400 text-xs uppercase tracking-wider hidden md:table-cell">Date</th>
              <th className="p-4 font-semibold text-slate-400 text-xs uppercase tracking-wider text-right">Total Paid</th>
              <th className="p-4 font-semibold text-slate-400 text-xs uppercase tracking-wider text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {sortedOrders.map((order: any) => (
              <tr key={order.id} className="hover:bg-slate-800/50 transition-colors">
                <td className="p-4">
                  <div className="font-bold text-white text-sm">{order.event?.name || 'Unknown Event'}</div>
                  <div className="text-xs text-slate-400 mt-1 md:hidden">
                    {order.event?.date ? format(new Date(order.event.date), 'MMM d, yyyy') : 'Date N/A'}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Order ID: #{order.id.slice(-6)} • {order.tickets.length} Ticket(s)
                  </div>
                </td>
                <td className="p-4 hidden md:table-cell text-slate-400 text-sm">
                  {order.event?.date ? format(new Date(order.event.date), 'MMM d, yyyy') : 'Date N/A'}<br/>
                  <span className="text-xs text-slate-600">
                    {order.event?.date ? format(new Date(order.event.date), 'h:mm a') : ''}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm font-bold text-slate-900 dark:text-white">
                  ₹{(order.totalAmount / 100).toFixed(2)}
                </td>
                <td className="p-4 text-center">
                  <span className={cn(
                    "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border",
                    order.status === 'COMPLETED' 
                      ? "bg-green-900/20 text-green-400 border-green-900/50" 
                    : order.status === 'PENDING' 
                      ? "bg-yellow-900/20 text-yellow-400 border-yellow-900/50" 
                    : "bg-red-900/20 text-red-400 border-red-900/50"
                  )}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
            {sortedOrders.length === 0 && (
               <tr>
                  <td colSpan={4} className="p-12 text-center text-slate-400">
                    No orders found. <Link href="/events" className="text-primary hover:underline">Book your first event!</Link>
                  </td>
               </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Calendar, 
  MapPin, 
  ArrowRight, 
  Clock, 
  CheckCircle2,
  Ticket,
  Wallet
} from "lucide-react";
import { getMyOrders, Order } from "@/lib/api";
import WalletCard from "@/components/dashboard/WalletCard";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user's orders on mount
    getMyOrders()
      .then((res: any) => {
        // @ts-ignore - Adjust based on your actual API response wrapper
        setOrders(res.data?.myOrders || []);
      })
      .catch((err: any) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  // Simple logic to separate upcoming (future) vs past events
  // Note: Since real API might lack date fields on 'Order', we mock/hydrate for demo if needed
  const upcomingOrders = orders.slice(0, 2); 
  const pastOrders = orders.slice(2);

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Welcome back, Alex
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            You have {upcomingOrders.length} upcoming events this week.
          </p>
        </div>
        <Link href="/">
            <Button>Find Events</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN (2/3 width) */}
        <div className="xl:col-span-2 space-y-8">
          
          {/* Upcoming Events Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Upcoming Events</h3>
              <Link href="/dashboard/tickets" className="text-primary text-sm font-semibold hover:underline">
                View All
              </Link>
            </div>

            {loading ? (
               <div className="grid md:grid-cols-2 gap-4">
                 {[1,2].map(i => (
                   <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
                 ))}
               </div>
            ) : upcomingOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {upcomingOrders.map((order) => (
                  <div key={order.id} className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all">
                    <div className="h-32 bg-slate-200 dark:bg-slate-800 relative bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1540039155733-5bb30b53aa14)' }}>
                       <div className="absolute top-3 left-3 bg-white/90 dark:bg-black/80 backdrop-blur px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                         Confirmed
                       </div>
                    </div>
                    <div className="p-5">
                      <h4 className="font-bold text-lg mb-1 line-clamp-1">{order.eventName || 'Global Tech Summit 2024'}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mb-4">
                        <Calendar className="w-3 h-3" /> Oct 24 • <MapPin className="w-3 h-3" /> San Francisco
                      </p>
                      
                      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                         <div className="flex items-center gap-2 text-green-600 dark:text-green-500 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4" /> Ready
                         </div>
                         <Button size="sm" variant="outline" className="h-8 text-xs">View Ticket</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                    <p className="text-slate-500">No upcoming events found.</p>
                </div>
            )}
          </section>

          {/* Past Bookings Table */}
          <section>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Past Bookings</h3>
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-slate-500">Event</th>
                    <th className="px-6 py-4 font-semibold text-slate-500">Date</th>
                    <th className="px-6 py-4 font-semibold text-slate-500">Status</th>
                    <th className="px-6 py-4 font-semibold text-slate-500 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {pastOrders.length > 0 ? pastOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                        {order.eventName || 'Past Event Name'}
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(Number(order.createdAt)).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">
                          Completed
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right font-mono">
                        ${(order.totalAmount / 100).toFixed(2)}
                      </td>
                    </tr>
                  )) : (
                    <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-500">No past orders.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* RIGHT COLUMN (1/3 width) */}
        <div className="space-y-8">
           <WalletCard />

           {/* Recent Activity Mini-List */}
           <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="font-bold text-lg mb-4 text-slate-900 dark:text-white">Recent Activity</h3>
              <div className="space-y-6">
                 <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0">
                        <Ticket className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Ticket Purchase</p>
                        <p className="text-xs text-slate-500 truncate">Neon Pulse Festival</p>
                    </div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white">-$150.00</span>
                 </div>
                 
                 <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 dark:text-white truncate">Funds Added</p>
                        <p className="text-xs text-slate-500 truncate">Visa •••• 4242</p>
                    </div>
                    <span className="text-sm font-bold text-green-600 dark:text-green-500">+$500.00</span>
                 </div>
              </div>
              <Button variant="ghost" className="w-full mt-6 text-xs border border-slate-200 dark:border-slate-800">
                 View Full History
              </Button>
           </div>
        </div>

      </div>
    </div>
  );
}
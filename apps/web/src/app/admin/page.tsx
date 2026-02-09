'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import Footer from '@/components/Footer';
import { Calendar, MapPin, TrendingUp, Building2, Ticket, Plus, Users, DollarSign, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface Event {
  id: string;
  name: string;
  venue: { name: string };
  date: string;
  status: string;
}

interface Venue {
  id: string;
  name: string;
  location: string;
}

interface DashboardStats {
  totalRevenue: number;
  totalTicketsSold: number;
}

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalRevenue: 0, totalTicketsSold: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const query = `
        query GetDashboardData {
          events {
            id
            name
            date
            status
            venue {
              name
            }
          }
          venues {
            id
            name
            location
          }
          adminDashboardStats {
            totalRevenue
            totalTicketsSold
          }
        }
      `;
      const data = await apiRequest<{ data: { events: Event[]; venues: Venue[]; adminDashboardStats: DashboardStats } }>('/graphql', {
        method: 'POST',
        body: JSON.stringify({ query }),
      });

      if (data.data?.events) setEvents(data.data.events);
      if (data.data?.venues) setVenues(data.data.venues);
      if (data.data?.adminDashboardStats) setStats(data.data.adminDashboardStats);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-slate-950 flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center text-slate-400">
          <div className="w-10 h-10 bg-slate-200 dark:bg-slate-800 rounded-full mb-3"></div>
          <p className="text-sm font-medium">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-950 font-sans text-white">
      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6 pt-24">
        
        {/* Compact Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Admin Overview
            </h1>
            <p className="text-slate-400 text-sm mt-0.5">
              System performance and management
            </p>
          </div>
          <div className="flex gap-2">
            <Link href="/admin/venues/new">
              <Button variant="outline" size="sm" className="h-9 gap-2">
                <Plus className="w-3.5 h-3.5" />
                Venue
              </Button>
            </Link>
            <Link href="/admin/events/new">
              <Button size="sm" className="h-9 gap-2">
                <Plus className="w-3.5 h-3.5" />
                Event
              </Button>
            </Link>
          </div>
        </div>

        {/* Dense Stats Grid (4 columns) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Events</p>
              <Calendar className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{events.length}</p>
              <div className="flex items-center gap-1 mt-1">
                 <TrendingUp className="w-3 h-3 text-green-500" />
                 <span className="text-xs font-medium text-green-500">+12% mo</span>
              </div>
            </div>
          </div>
          
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Venues</p>
              <Building2 className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{venues.length}</p>
              <span className="text-xs text-slate-500">Across 12 regions</span>
            </div>
          </div>
          
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tickets Sold</p>
              <Ticket className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{stats.totalTicketsSold.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1">
                 <TrendingUp className="w-3 h-3 text-green-500" />
                 <span className="text-xs font-medium text-green-500">+8.5% wk</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between hover:border-primary/50 transition-colors">
              <div className="flex justify-between items-start mb-2">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Revenue</p>
                <span className="w-4 h-4 text-slate-400 font-bold flex items-center justify-center">₹</span>
              </div>
            <div>
              <p className="text-2xl font-bold text-white">₹{(stats.totalRevenue / 100).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
              <div className="flex items-center gap-1 mt-1">
                 <TrendingUp className="w-3 h-3 text-green-500" />
                 <span className="text-xs font-medium text-green-500">+24% mo</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Recent Events Table - Compact */}
          <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
              <h2 className="text-sm font-bold text-white">Recent Events</h2>
              <Link href="/admin/events" className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-sm text-left">
                <thead className="bg-slate-800/50 text-slate-400 font-medium">
                  <tr>
                    <th className="px-5 py-2.5 w-1/3">Event Name</th>
                    <th className="px-5 py-2.5">Venue</th>
                    <th className="px-5 py-2.5">Date</th>
                    <th className="px-5 py-2.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {events.slice(0, 8).map((event) => (
                    <tr key={event.id} className="group hover:bg-slate-800/30 transition-colors">
                      <td className="px-5 py-2.5 font-medium text-white truncate max-w-[200px]">
                        {event.name}
                      </td>
                      <td className="px-5 py-2.5 text-slate-400 truncate max-w-[150px]">
                        {event.venue?.name || 'Unknown'}
                      </td>
                      <td className="px-5 py-2.5 text-slate-500 text-xs">
                        {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-5 py-2.5 text-right">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${
                          event.status === 'PUBLISHED' 
                            ? 'bg-green-900/20 text-green-400 border-green-900/30'  
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}>
                          {event.status === 'PUBLISHED' ? 'Live' : event.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {events.length === 0 && (
                     <tr><td colSpan={4} className="p-8 text-center text-slate-500 text-sm">No events found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Side Widgets Column */}
          <div className="space-y-6">
            
            {/* Active Venues List - Compact */}
            <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                <h2 className="text-sm font-bold text-white">Active Venues</h2>
                <Link href="/admin/venues" className="text-xs text-primary font-medium hover:underline">Manage</Link>
              </div>
              <ul className="divide-y divide-slate-800 max-h-[300px] overflow-y-auto">
                {venues.slice(0, 5).map((venue) => (
                  <li key={venue.id} className="px-5 py-3 hover:bg-slate-800/30 flex justify-between items-center transition-colors group">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">
                        {venue.name}
                      </p>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3 h-3" /> {venue.location}
                      </p>
                    </div>
                    <Link 
                      href={`/admin/venues/${venue.id}`}
                      className="text-xs font-medium text-slate-400 hover:text-primary px-2 py-1 rounded hover:bg-slate-800 transition-all"
                    >
                      Edit
                    </Link>
                  </li>
                ))}
                 {venues.length === 0 && (
                     <li className="p-6 text-center text-slate-500 text-sm">No venues found</li>
                  )}
              </ul>
            </div>

            {/* Quick Action Widget */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 text-white shadow-lg">
                <h3 className="text-sm font-bold mb-1">System Status</h3>
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                    <span className="text-xs text-slate-300">All systems operational</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Latency</p>
                        <p className="text-lg font-bold">24ms</p>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3 border border-white/10">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">CPU Load</p>
                        <p className="text-lg font-bold">12%</p>
                    </div>
                </div>
            </div>

          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
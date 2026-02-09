"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Calendar, MapPin, Users, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { apiRequest } from "@/lib/api";

interface Event {
  id: string;
  name: string;
  date: string;
  status: string;
  venue: {
    name: string;
    location: string;
  };
  ticketsSold?: number;
}

import { useToast } from "@/components/ToastProvider";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const fetchEvents = async () => {
    try {
      const query = `
        query GetEvents {
          events {
            id
            name
            date
            status
            venue {
              name
              location
            }
            ticketsSold
          }
        }
      `;
      const res = await apiRequest<{ data: { events: Event[] } }>('/graphql', {
        method: 'POST',
        body: JSON.stringify({ query })
      });
      setEvents(res.data.events || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const query = `
        mutation DeleteEvent($id: ID!) {
          deleteEvent(id: $id)
        }
      `;
      await apiRequest('/graphql', {
        method: 'POST',
        body: JSON.stringify({
          query,
          variables: { id }
        })
      });
      addToast("Event deleted successfully", "success");
      fetchEvents(); // Refresh list
    } catch (err: any) {
      addToast(err.message || "Failed to delete event", "error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <main className="max-w-[1400px] mx-auto px-6 py-8 pt-24">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Event Management</h2>
              <p className="text-slate-400">Manage and configure your events</p>
            </div>
            <Link href="/admin/events/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Create Event
              </Button>
            </Link>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/50 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-400">Event Name</th>
                  <th className="px-6 py-4 font-bold text-slate-400">Venue</th>
                  <th className="px-6 py-4 font-bold text-slate-400">Sold</th>
                  <th className="px-6 py-4 font-bold text-slate-400">Date</th>
                  <th className="px-6 py-4 font-bold text-slate-400">Status</th>
                  <th className="px-6 py-4 font-bold text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400">Loading events...</td></tr>
                ) : events.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-slate-400">No events found.</td></tr>
                ) : (
                  events.map((event) => (
                    <tr key={event.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <Link href={`/events/${event.id}`} target="_blank" className="font-semibold text-white hover:text-primary hover:underline transition-colors block">
                          {event.name}
                        </Link>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">ID: {event.id}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <div>
                            <div className="font-medium text-white">{event.venue.name}</div>
                            <div className="text-xs text-slate-400">{event.venue.location}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        <div className="flex items-center gap-2">
                           <Users className="w-4 h-4" />
                           <span className="font-medium text-white">{(event as any).ticketsSold || 0}</span>
                        
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {(() => {
                              const date = typeof event.date === 'string' && /^\d+$/.test(event.date)
                                ? new Date(parseInt(event.date))
                                : new Date(event.date);
                              return !isNaN(date.getTime()) 
                                ? date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                : 'Invalid Date';
                          })()}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          event.status === 'PUBLISHED'
                            ? 'bg-green-900/20 text-green-400'
                            : event.status === 'DRAFT'
                            ? 'bg-slate-800 text-slate-300'
                            : 'bg-yellow-900/20 text-yellow-400'
                        }`}>
                          {event.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/events/${event.id}/edit`}>
                            <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors" title="Edit Event">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </Link>
                          <button 
                            onClick={() => handleDelete(event.id)}
                            className="p-2 hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-500 transition-colors"  
                            title="Delete Event"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

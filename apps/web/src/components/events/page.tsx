"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, MoreHorizontal, Calendar, MapPin, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getEvents } from "@/lib/data"; // Reusing the public fetcher for now, or create admin specific one
import { Event } from "@/types/events";

export default function AdminEventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, this would use an authenticated Admin API
    getEvents()
      .then(setEvents)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Events</h2>
          <p className="text-slate-500">Manage your event listings and inventory.</p>
        </div>
        <Link href="/admin/events/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" /> Create Event
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
            <tr>
              <th className="px-6 py-4 font-bold text-slate-500">Event Name</th>
              <th className="px-6 py-4 font-bold text-slate-500">Date</th>
              <th className="px-6 py-4 font-bold text-slate-500">Venue</th>
              <th className="px-6 py-4 font-bold text-slate-500">Status</th>
              <th className="px-6 py-4 font-bold text-slate-500 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
            {loading ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">Loading events...</td>
              </tr>
            ) : events.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-slate-500">No events found. Create your first one!</td>
              </tr>
            ) : (
              events.map((event) => (
                <tr key={event.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-lg bg-cover bg-center bg-slate-200"
                        style={{ backgroundImage: `url(${event.imageUrl})` }}
                      />
                      <span className="font-semibold text-slate-900 dark:text-white">{event.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {new Date(Number(event.date)).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                     <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {event.venue.name}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
                      Published
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-500 transition-colors">
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
  );
}
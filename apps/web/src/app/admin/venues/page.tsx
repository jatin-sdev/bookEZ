"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, MapPin, Users, Edit2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { apiRequest } from "@/lib/api";

interface Venue {
  id: string;
  name: string;
  location: string;
  capacity: number;
}

export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVenues = async () => {
      try {
        const query = `
          query GetVenues {
            venues {
              id
              name
              location
              capacity
            }
          }
        `;
        const res = await apiRequest<{ data: { venues: Venue[] } }>('/graphql', {
          method: 'POST',
          body: JSON.stringify({ query })
        });
        setVenues(res.data.venues || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchVenues();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this venue? This cannot be undone.")) return;

    try {
      const mutation = `
        mutation DeleteVenue($id: ID!) {
          deleteVenue(id: $id)
        }
      `;
      await apiRequest('/graphql', {
        method: 'POST',
        body: JSON.stringify({
          query: mutation,
          variables: { id }
        })
      });
      setVenues(venues.filter(v => v.id !== id));
    } catch (err) {
      console.error(err);
      alert("Failed to delete venue");
    }
  };

  return (
    <div className="min-h-screen bg-slate-950">
      <main className="max-w-[1400px] mx-auto px-6 py-8 pt-24">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Venues</h2>
              <p className="text-slate-400">Manage stadium layouts and seating configurations.</p>
            </div>
            <Link href="/admin/venues/new">
              <Button className="gap-2">
                <Plus className="w-4 h-4" /> Add Venue
              </Button>
            </Link>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/50 border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4 font-bold text-slate-400">Venue Name</th>
                  <th className="px-6 py-4 font-bold text-slate-400">Location</th>
                  <th className="px-6 py-4 font-bold text-slate-400 text-right">Capacity</th>
                  <th className="px-6 py-4 font-bold text-slate-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-400">Loading venues...</td></tr>
                ) : venues.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-slate-400">No venues found.</td></tr>
                ) : (
                  venues.map((venue) => (
                    <tr key={venue.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{venue.name}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">ID: {venue.id}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-400">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {venue.location}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Users className="w-4 h-4" />
                          {venue.capacity.toLocaleString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin/venues/${venue.id}`}>
                            <button className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </Link>
                          <button 
                            onClick={() => handleDelete(venue.id)}
                            className="p-2 hover:bg-red-900/20 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
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
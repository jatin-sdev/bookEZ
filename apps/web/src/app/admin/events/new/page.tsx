"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

export default function CreateEventPage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    date: "",
    venueId: "", 
    capacity: 1000,
    imageUrl: ""
  });

  const [venues, setVenues] = useState<any[]>([]);

  useEffect(() => {
    // Fetch venues for dropdown
    const fetchVenues = async () => {
      try {
        const query = `query { venues { id name location } }`;
        const res = await apiRequest<{ data: { venues: any[] } }>('/graphql', {
          method: 'POST',
          body: JSON.stringify({ query })
        });
        setVenues(res.data.venues || []);
        // Pre-select first venue if available
        if (res.data.venues?.length > 0) {
           setFormData(prev => ({ ...prev, venueId: res.data.venues[0].id }));
        }
      } catch (err) {
        console.error("Failed to fetch venues", err);
      }
    };
    fetchVenues();
  }, []); // Run once on mount

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const mutation = `
        mutation CreateEvent($input: CreateEventInput!) {
          createEvent(input: $input) {
            id
            name
          }
        }
      `;
      
      const publishMutation = `
        mutation PublishEvent($id: ID!) {
          publishEvent(id: $id) {
            id
            status
          }
        }
      `;

      
      const createRes = await apiRequest<{ data: { createEvent: { id: string } } }>('/graphql', {
        method: 'POST',
        body: JSON.stringify({
          query: mutation,
          variables: {
            input: {
              name: formData.name,
              description: formData.description,
              date: formData.date ? new Date(formData.date).toISOString() : new Date().toISOString(),
              venueId: formData.venueId,
              imageUrl: formData.imageUrl
            }
          }
        })
      });

      const newEventId = createRes.data?.createEvent?.id;
      if (newEventId) {
         // Auto-publish to generate seats
         await apiRequest('/graphql', {
            method: 'POST',
            body: JSON.stringify({
                query: publishMutation,
                variables: { id: newEventId }
            })
         });
      }

      addToast("Event created successfully!", "success");
      router.push("/admin/events");
    } catch (err: any) {
      console.error(err);
      addToast(err.message || "Failed to create event", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/events" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Create New Event</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 space-y-6">
        
        {/* Basic Info */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold border-b border-slate-100 dark:border-slate-700 pb-2">Basic Details</h3>
          
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Event Name</label>
              <input 
                required
                type="text" 
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                placeholder="e.g. Summer Music Festival 2024"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
              <textarea 
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all h-32 resize-none"
                placeholder="Describe the event..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Date & Venue */}
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Date & Time</label>
            <input 
              required
              type="datetime-local" 
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
              value={formData.date}
              onChange={e => setFormData({...formData, date: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Capacity</label>
            <input 
              required
              type="number" 
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
              value={formData.capacity}
              onChange={e => setFormData({...formData, capacity: parseInt(e.target.value)})}
            />
          </div>
        </div>

        {/* Venue Selector */}
        <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Venue</label>
            {venues.length === 0 ? (
                <div className="text-sm text-red-500">No venues found. Please create a venue first.</div>
            ) : (
                <select 
                required
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
                value={formData.venueId}
                onChange={e => setFormData({...formData, venueId: e.target.value})}
                >
                <option value="" disabled>Select a Venue</option>
                {venues.map(v => (
                    <option key={v.id} value={v.id}>{v.name} ({v.location})</option>
                ))}
                </select>
            )}
            <p className="text-xs text-slate-500 mt-1">Select the venue where this event will take place.</p>
        </div>

        {/* Image URL */}
        <div>
          <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Cover Image URL</label>
          <div className="flex gap-2">
            <input 
              type="url" 
              className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="https://..."
              value={formData.imageUrl}
              onChange={e => setFormData({...formData, imageUrl: e.target.value})}
            />
            <input
              type="file"
              id="image-upload"
              className="hidden"
              accept="image/*"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;

                const uploadData = new FormData();
                uploadData.append('file', file);
                
                try {
                  const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/graphql\/?$/, '');
                  const res = await fetch(`${BASE_URL}/api/upload`, {
                    method: 'POST',
                    body: uploadData,
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                    }
                  });
                  
                  if (!res.ok) throw new Error('Upload failed');
                  
                  const data = await res.json();
                  setFormData(prev => ({ ...prev, imageUrl: data.url }));
                  addToast("Image uploaded successfully", "success");
                } catch (err) {
                  console.error(err);
                  addToast("Failed to upload image", "error");
                }
              }}
            />
            <Button 
              type="button" 
              variant="outline" 
              className="shrink-0"
              onClick={() => document.getElementById('image-upload')?.click()}
            >
               <Upload className="w-4 h-4 mr-2" /> Upload
            </Button>
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
           <Link href="/admin/events">
              <Button type="button" variant="ghost">Cancel</Button>
           </Link>
           <Button type="submit" disabled={loading} className="min-w-[120px]">
             {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Publish Event"}
           </Button>
        </div>

      </form>
    </div>
  );
}
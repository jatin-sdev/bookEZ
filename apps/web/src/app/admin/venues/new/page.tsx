"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";

export default function CreateVenuePage() {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    description: "",
    capacity: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const mutation = `
        mutation CreateVenue($input: CreateVenueInput!) {
          createVenue(input: $input) {
            id
            name
          }
        }
      `;

      await apiRequest('/graphql', {
        method: 'POST',
        body: JSON.stringify({
          query: mutation,
          variables: {
            input: {
              name: formData.name,
              location: formData.location,
              capacity: formData.capacity
            }
          }
        })
      });

      addToast("Venue created successfully!", "success");
      router.push("/admin/venues");
    } catch (err: any) {
      console.error(err);
      addToast(err.message || "Failed to create venue", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/admin/venues" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Add New Venue</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-8 space-y-6">
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Venue Name</label>
            <input 
              required
              type="text" 
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="e.g. Madison Square Garden"
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Location</label>
            <input 
              required
              type="text" 
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
              placeholder="City, State"
              value={formData.location}
              onChange={e => setFormData({...formData, location: e.target.value})}
            />
          </div>

          <div>
             <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Total Capacity</label>
             <input 
               required
               type="number" 
               className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
               value={formData.capacity}
               onChange={e => setFormData({...formData, capacity: parseInt(e.target.value) || 0})}
             />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
            <textarea 
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all h-24 resize-none"
              placeholder="Details about the venue..."
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>
        </div>

        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-700">
           <Link href="/admin/venues">
              <Button type="button" variant="ghost">Cancel</Button>
           </Link>
           <Button type="submit" disabled={loading} className="min-w-[120px]">
             {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Venue"}
           </Button>
        </div>

      </form>
    </div>
  );
}
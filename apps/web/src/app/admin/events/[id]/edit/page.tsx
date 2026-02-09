'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, Loader2, Save } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { apiRequest } from '@/lib/api';
import { useToast } from '@/components/ToastProvider';

export default function EditEventPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [eventId, setEventId] = useState<string>('');
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    date: '',
    imageUrl: '',
    status: 'DRAFT'
  });

  useEffect(() => {
    params.then(p => {
      setEventId(p.id);
      fetchEventDetails(p.id);
    });
  }, []);

  const fetchEventDetails = async (id: string) => {
    try {
      const query = `
        query GetEvent($id: ID!) {
          event(id: $id) {
            id
            name
            description
            date
            imageUrl
            status
            venue {
              id
              name
            }
          }
        }
      `;
      const res = await apiRequest<{ data: { event: any } }>('/graphql', {
        method: 'POST',
        body: JSON.stringify({ query, variables: { id } })
      });
      
      const event = res.data.event;
      if (event) {
        setFormData({
            name: event.name,
            description: event.description || '',
            // Convert to datetime-local format (YYYY-MM-DDTHH:mm)
            date: (() => {
                const d = typeof event.date === 'string' && /^\d+$/.test(event.date)
                  ? new Date(parseInt(event.date))
                  : new Date(event.date);
                return !isNaN(d.getTime()) ? d.toISOString().slice(0, 16) : '';
            })(),
            imageUrl: event.imageUrl || '',
            status: event.status
        });
      }
    } catch (err) {
      console.error(err);
      addToast('Failed to load event details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const mutation = `
        mutation UpdateEvent($id: ID!, $input: UpdateEventInput!) {
          updateEvent(id: $id, input: $input) {
            id
            name
            status
          }
        }
      `;
      
      await apiRequest('/graphql', {
        method: 'POST',
        body: JSON.stringify({
          query: mutation,
          variables: {
            id: eventId,
            input: {
                name: formData.name,
                description: formData.description,
                date: new Date(formData.date).toISOString(),
                imageUrl: formData.imageUrl,
                status: formData.status
            }
          }
        })
      });

      addToast('Event updated successfully!', 'success');
      router.push('/admin/events');
    } catch (err: any) {
      console.error(err);
      addToast(err.message || 'Failed to update event', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center">Loading event...</div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-10">
      <div className="flex items-center gap-4">
        <Link href="/admin/events" className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-500" />
        </Link>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Edit Event</h1>
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
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Description</label>
              <textarea 
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all h-32 resize-none"
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
        </div>

        {/* Date & Status */}
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
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1.5">Status</label>
            <select 
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm focus:ring-1 focus:ring-primary outline-none transition-all appearance-none"
              value={formData.status}
              onChange={e => setFormData({...formData, status: e.target.value})}
            >
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
                <option value="CANCELLED">Cancelled</option>
                <option value="COMPLETED">Completed</option>
            </select>
          </div>
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
           <Button type="submit" disabled={saving} className="min-w-[120px] gap-2">
             {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4" /> Save Changes</>}
           </Button>
        </div>

      </form>
    </div>
  );
}

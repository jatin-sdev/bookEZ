'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';

interface Section {
  id: string;
  name: string;
  capacity: string;
  basePrice: number;
}

interface Venue {
  id: string;
  name: string;
  location: string;
  sections: Section[];
}

export default function VenueDetailsPage() {
  const params = useParams();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [loading, setLoading] = useState(true);

  // Section Form State
  const [sectionData, setSectionData] = useState({ name: '', capacity: 100, basePrice: 5000, rows: 10, seatsPerRow: 10 });
  const [addingSection, setAddingSection] = useState(false);

  // Edit/Delete State
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [deletingSection, setDeletingSection] = useState<Section | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchVenueDetails();
  }, []);

  const fetchVenueDetails = async () => {
    try {
      const query = `
        query GetVenue($id: ID!) {
          venue(id: $id) {
            id
            name
            location
            sections {
              id
              name
              capacity
              basePrice
            }
          }
        }
      `;
      const data = await apiRequest<{ data: { venue: Venue } }>('/graphql', {
        method: 'POST',
        body: JSON.stringify({ query, variables: { id: params.id } })
      });
      setVenue(data.data.venue);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSection = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingSection(true);

    // Correct Mutation Name: addSection (was addSectionToVenue)
    const query = `
      mutation AddSection($venueId: ID!, $input: CreateSectionInput!) {
        addSection(venueId: $venueId, input: $input) {
          id
          name
        }
      }
    `;

    try {
      await apiRequest('/graphql', {
        method: 'POST',
        body: JSON.stringify({
          query,
          variables: {
            venueId: params.id,
            input: {
              ...sectionData,
              capacity: Number(sectionData.capacity),
              basePrice: Math.round(Number(sectionData.basePrice) * 100), // Convert rupees to paise
              rows: Number(sectionData.rows),
              seatsPerRow: Number(sectionData.seatsPerRow)
            }
          }
        })
      });
      alert('Section added and seats generated!');
      setSectionData({ name: '', capacity: 100, basePrice: 5000, rows: 10, seatsPerRow: 10 });
      fetchVenueDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to add section');
    } finally {
      setAddingSection(false);
    }
  };

  const handleUpdateSection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSection) return;

    setIsUpdating(true);

    const query = `
      mutation UpdateSection($id: ID!, $input: UpdateSectionInput!) {
        updateSection(id: $id, input: $input) {
          id
          name
          basePrice
        }
      }
    `;

    try {
      await apiRequest('/graphql', {
        method: 'POST',
        body: JSON.stringify({
          query,
          variables: {
            id: editingSection.id,
            input: {
              name: editingSection.name,
              basePrice: Math.round(Number(editingSection.basePrice) * 100) // Convert to paise
            }
          }
        })
      });
      alert('Section updated successfully!');
      setEditingSection(null);
      fetchVenueDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to update section');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteSection = async () => {
    if (!deletingSection) return;

    setIsDeleting(true);

    const query = `
      mutation DeleteSection($id: ID!) {
        deleteSection(id: $id)
      }
    `;

    try {
      await apiRequest('/graphql', {
        method: 'POST',
        body: JSON.stringify({
          query,
          variables: { id: deletingSection.id }
        })
      });
      alert('Section deleted successfully!');
      setDeletingSection(null);
      fetchVenueDetails();
    } catch (err: any) {
      alert(err.message || 'Failed to delete section');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-background-light dark:bg-slate-950 p-8 text-black dark:text-white">Loading...</div>;
  if (!venue) return <div className="min-h-screen bg-background-light dark:bg-slate-950 p-8 text-black dark:text-white">Venue not found</div>;

  return (
    <div className="min-h-screen bg-background-light dark:bg-slate-950 pb-20">
      <div className="max-w-[1400px] mx-auto px-6 py-8 pt-24">
        <Link href="/admin/venues" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-white mb-6 inline-block transition-colors">
          ← Back to Venues
        </Link>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">{venue.name}</h1>
            <p className="text-slate-500 mt-1 flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              {venue.location}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sections List */}
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Seating Sections</h2>
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden transition-all">
              <table className="w-full text-left">
                <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Section Name</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Capacity</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Base Price</th>
                    <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                  {venue.sections?.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                        No sections configured yet. Add one to get started.
                      </td>
                    </tr>
                  ) : venue.sections?.map((section) => (
                    <tr key={section.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{section.name}</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{section.capacity.toLocaleString()} seats</td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono">₹{(section.basePrice / 100).toFixed(2)}</td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => setEditingSection({ ...section, basePrice: section.basePrice / 100 })}
                          className="px-3 py-1.5 text-xs font-bold bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeletingSection(section)}
                          className="px-3 py-1.5 text-xs font-bold bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Add Section Form */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xl h-fit sticky top-24">
            <h3 className="text-lg font-bold mb-4 text-slate-900 dark:text-white">Add New Section</h3>
            <form onSubmit={handleAddSection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Section Name</label>
                <input type="text" required placeholder="e.g. A2, VIP Box, Bleachers"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                  value={sectionData.name} onChange={(e) => setSectionData({ ...sectionData, name: e.target.value })} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Rows</label>
                  <input type="number" required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    value={sectionData.rows} onChange={(e) => setSectionData({ ...sectionData, rows: parseInt(e.target.value) })} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Seats/Row</label>
                  <input type="number" required
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    value={sectionData.seatsPerRow} onChange={(e) => setSectionData({ ...sectionData, seatsPerRow: parseInt(e.target.value) })} />
                </div>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-700/50 p-3 rounded-lg flex justify-between items-center">
                <span>Total Capacity:</span>
                <span className="font-bold text-slate-900 dark:text-white text-sm">{sectionData.rows * sectionData.seatsPerRow} seats</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Base Price (INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400">₹</span>
                  <input type="number" required placeholder="5000"
                    className="w-full pl-6 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    value={sectionData.basePrice} onChange={(e) => setSectionData({ ...sectionData, basePrice: parseInt(e.target.value) })} />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 text-right">
                  Enter amount in rupees (will be saved as ₹{sectionData.basePrice.toFixed(2)})
                </p>
              </div>

              <button type="submit" disabled={addingSection}
                className="w-full py-2.5 bg-slate-900 dark:bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-slate-800 dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl">
                {addingSection ? 'Creating...' : 'Add Section'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Edit Section Modal */}
      {editingSection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl">
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Edit Section</h3>
            <form onSubmit={handleUpdateSection} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Section Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                  value={editingSection.name}
                  onChange={(e) => setEditingSection({ ...editingSection, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1.5">Base Price (INR)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-400">₹</span>
                  <input
                    type="number"
                    required
                    className="w-full pl-6 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/50"
                    value={editingSection.basePrice}
                    onChange={(e) => setEditingSection({ ...editingSection, basePrice: parseFloat(e.target.value) })}
                  />
                </div>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 text-right">
                  Enter amount in rupees
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSection(null)}
                  className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex-1 py-2.5 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isUpdating ? 'Updating...' : 'Update Section'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingSection && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-700 shadow-2xl">
            <h3 className="text-xl font-bold mb-2 text-red-600 dark:text-red-400">Delete Section</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Are you sure you want to delete <span className="font-bold text-slate-900 dark:text-white">"{deletingSection.name}"</span>?
              This will also delete all {deletingSection.capacity} seats in this section. This action cannot be undone.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setDeletingSection(null)}
                className="flex-1 py-2.5 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white text-sm font-bold rounded-lg hover:bg-slate-300 dark:hover:bg-slate-600 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteSection}
                disabled={isDeleting}
                className="flex-1 py-2.5 bg-red-600 text-white text-sm font-bold rounded-lg hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isDeleting ? 'Deleting...' : 'Delete Section'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
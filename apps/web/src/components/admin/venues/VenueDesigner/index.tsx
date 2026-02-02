'use client';

import React, { useState, useCallback } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { DraggableSeat } from './DraggableSeat';
import { DroppableCanvas, PlacedSeat } from './DroppableCanvas';
import { Button } from '@/components/ui/Button';
import { Upload } from 'lucide-react';

interface VenueDesignerProps {
  onSave: (seats: PlacedSeat[], image: string) => void;
  isSaving: boolean;
}

export const VenueDesigner: React.FC<VenueDesignerProps> = ({ onSave, isSaving }) => {
  const [seats, setSeats] = useState<PlacedSeat[]>([]);
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

  // Handle Drag & Drop Logic
  const handleDropSeat = useCallback((item: any, x: number, y: number) => {
    setSeats((prev) => {
      // If moving an existing seat, update it
      if (item.isPlaced) {
        return prev.map(s => s.id === item.id ? { ...s, x, y } : s);
      }
      
      // If adding a new seat from toolbox
      const newSeat: PlacedSeat = {
        id: `seat-${Date.now()}`,
        type: item.type,
        x,
        y,
        label: `${prev.length + 1}`
      };
      return [...prev, newSeat];
    });
  }, []);

  // Handle Image Upload (Mocking the upload for now or using a direct URL)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // In a real app, upload to /api/upload here and get URL
      // For UX preview, we use local object URL
      const objectUrl = URL.createObjectURL(file);
      setBackgroundImage(objectUrl);
      
      // We would normally set the REAL url here after upload
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
        {/* Sidebar / Toolbox */}
        <div className="lg:col-span-1 bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col">
          <h3 className="font-semibold mb-4 text-gray-700">Toolbox</h3>
          
          <div className="space-y-6 flex-1">
            <div>
              <p className="text-sm text-gray-500 mb-2">Drag to Map</p>
              <div className="flex justify-around bg-gray-50 p-4 rounded-lg">
                <DraggableSeat id="new-vip" type="VIP" />
                <DraggableSeat id="new-reg" type="REGULAR" />
              </div>
            </div>

            <div className="border-t pt-4">
               <label className="block text-sm font-medium text-gray-700 mb-2">Floor Plan</label>
               <div className="flex items-center gap-2">
                 <input 
                   type="file" 
                   accept="image/*"
                   onChange={handleImageUpload}
                   className="hidden"
                   id="map-upload"
                 />
                 <Button 
                   variant="outline" 
                   onClick={() => document.getElementById('map-upload')?.click()}
                   className="w-full"
                 >
                   <Upload size={16} className="mr-2" />
                   Upload Image
                 </Button>
               </div>
            </div>
          </div>

          <div className="mt-auto pt-4 border-t">
             <div className="flex justify-between items-center mb-2">
               <span className="text-sm text-gray-500">Seats Count:</span>
               <span className="font-bold">{seats.length}</span>
             </div>
             <Button 
                className="w-full" 
                onClick={() => backgroundImage && onSave(seats, backgroundImage)}
                disabled={!backgroundImage || seats.length === 0 || isSaving}
             >
               {isSaving ? 'Saving...' : 'Save Venue Layout'}
             </Button>
          </div>
        </div>

        {/* Main Canvas */}
        <div className="lg:col-span-3 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="h-full flex flex-col">
            <div className="flex justify-between items-center mb-4">
               <h3 className="font-semibold text-gray-700">Venue Map</h3>
               <span className="text-xs text-gray-400">Canvas coordinates are normalized (%)</span>
            </div>
            <DroppableCanvas 
              seats={seats} 
              onDropSeat={handleDropSeat} 
              backgroundImage={backgroundImage}
            />
          </div>
        </div>
      </div>
    </DndProvider>
  );
};
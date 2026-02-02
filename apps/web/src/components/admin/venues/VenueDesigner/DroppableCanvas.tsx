'use client';

import React, { useRef } from 'react';
import { useDrop, DropTargetMonitor } from 'react-dnd';
import { ItemTypes, DraggableSeat } from './DraggableSeat';
import useMeasure from 'react-use-measure';

export interface PlacedSeat {
  id: string;
  type: 'VIP' | 'REGULAR' | 'TABLE';
  x: number; // Percentage
  y: number; // Percentage
  label: string;
}

interface DroppableCanvasProps {
  seats: PlacedSeat[];
  onDropSeat: (item: any, x: number, y: number) => void;
  backgroundImage: string | null;
}

export const DroppableCanvas: React.FC<DroppableCanvasProps> = ({ seats, onDropSeat, backgroundImage }) => {
  const [ref, bounds] = useMeasure();
  
  const [, drop] = useDrop(() => ({
    accept: ItemTypes.SEAT,
    drop: (item: any, monitor: DropTargetMonitor) => {
      const clientOffset = monitor.getClientOffset();
      if (!clientOffset || !bounds) return;

      // Calculate position relative to the canvas container
      const relativeX = clientOffset.x - bounds.left;
      const relativeY = clientOffset.y - bounds.top;

      // Convert to percentage (0-100)
      const xPercent = (relativeX / bounds.width) * 100;
      const yPercent = (relativeY / bounds.height) * 100;

      onDropSeat(item, xPercent, yPercent);
    },
  }), [bounds, onDropSeat]);

  return (
    <div 
      ref={(node) => {
        ref(node);
        drop(node);
      }}
      className="relative w-full aspect-video bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 overflow-hidden"
    >
      {backgroundImage ? (
        <img 
          src={backgroundImage} 
          alt="Venue Layout" 
          className="w-full h-full object-contain opacity-50 pointer-events-none select-none" 
        />
      ) : (
        <div className="flex items-center justify-center h-full text-gray-400">
          Upload a Floor Plan to start designing
        </div>
      )}

      {seats.map((seat) => (
        <DraggableSeat
          key={seat.id}
          id={seat.id}
          type={seat.type}
          left={seat.x}
          top={seat.y}
          isPlaced={true}
        />
      ))}
    </div>
  );
};
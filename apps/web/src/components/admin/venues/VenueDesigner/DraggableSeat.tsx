'use client';

import React from 'react';
import { useDrag } from 'react-dnd';
import { cn } from '@/lib/utils';
import { Armchair } from 'lucide-react';

export const ItemTypes = {
  SEAT: 'seat',
};

interface DraggableSeatProps {
  id: string;
  type: 'VIP' | 'REGULAR' | 'TABLE';
  left?: number; // Percentage (0-100)
  top?: number;  // Percentage (0-100)
  isPlaced?: boolean;
}

export const DraggableSeat: React.FC<DraggableSeatProps> = ({ id, type, left, top, isPlaced = false }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemTypes.SEAT,
    item: { id, type, left, top, isPlaced },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }), [id, left, top, isPlaced]);

  const getColor = () => {
    switch (type) {
      case 'VIP': return 'bg-amber-500 border-amber-600 text-white';
      case 'TABLE': return 'bg-purple-500 border-purple-600 text-white';
      default: return 'bg-blue-500 border-blue-600 text-white';
    }
  };

  return (
    <div
      ref={(node) => { drag(node) }}
      style={isPlaced ? { left: `${left}%`, top: `${top}%`, position: 'absolute' } : {}}
      className={cn(
        "cursor-grab active:cursor-grabbing flex items-center justify-center shadow-sm rounded-full transition-transform hover:scale-110",
        isPlaced ? "w-6 h-6 border-2 transform -translate-x-1/2 -translate-y-1/2" : "w-12 h-12 mb-4 mx-auto relative",
        getColor(),
        isDragging ? "opacity-50" : "opacity-100"
      )}
    >
      <Armchair size={isPlaced ? 12 : 20} />
      {!isPlaced && <span className="absolute -bottom-6 text-xs text-gray-600 font-medium">{type}</span>}
    </div>
  );
};
'use client';

import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { Download, MapPin, Calendar } from 'lucide-react';
import html2canvas from 'html2canvas';
import { Button } from '@/components/ui/Button';

interface TicketProps {
  id: string;
  eventName: string;
  eventDate: string;
  venueName: string;
  section: string;
  row?: string | null;
  number: string;
  qrCodeValue: string;
  holderName: string;
}

export const Ticket: React.FC<TicketProps> = ({
  id,
  eventName,
  eventDate,
  venueName,
  section,
  row,
  number,
  qrCodeValue,
  holderName,
}) => {
  const ticketRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!ticketRef.current) return;
    
    try {
      // Capture the element
      const canvas = await html2canvas(ticketRef.current, {
        scale: 2, // High resolution
        backgroundColor: null, // Transparent bg support if needed
      });
      
      // Convert to image
      const image = canvas.toDataURL('image/png');
      
      // Trigger download
      const link = document.createElement('a');
      link.href = image;
      link.download = `ticket-${eventName.replace(/\s+/g, '-').toLowerCase()}-${number}.png`;
      link.click();
    } catch (err) {
      console.error('Failed to download ticket', err);
      alert('Could not download ticket. Please try again.');
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Visual Ticket Container */}
      <div 
        ref={ticketRef} 
        className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200 relative"
      >
        {/* Header (Event Info) */}
        <div className="bg-slate-900 text-white p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500 rounded-full blur-2xl opacity-20 -mr-10 -mt-10"></div>
          <h3 className="text-xl font-bold mb-1 leading-tight">{eventName}</h3>
          <p className="text-blue-200 text-sm font-medium mb-4">{venueName}</p>
          
          <div className="flex gap-4 text-xs text-gray-300">
            <div className="flex items-center gap-1">
              <Calendar size={14} />
              <span>{format(new Date(eventDate), 'MMM d, h:mm a')}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin size={14} />
              <span>{venueName}</span>
            </div>
          </div>
        </div>

        {/* Perforation Effect */}
        <div className="relative h-4 bg-slate-900">
             <div className="absolute -bottom-2 left-0 w-full h-4 bg-white rounded-t-xl"></div>
             <div className="absolute top-1/2 left-0 w-full border-b-2 border-dashed border-gray-500/50"></div>
             {/* Notches */}
             <div className="absolute top-1/2 -left-3 w-6 h-6 bg-gray-100 rounded-full transform -translate-y-1/2"></div>
             <div className="absolute top-1/2 -right-3 w-6 h-6 bg-gray-100 rounded-full transform -translate-y-1/2"></div>
        </div>

        {/* Body (Seat Info & QR) */}
        <div className="p-6 bg-white flex flex-col items-center">
          
          <div className="grid grid-cols-3 gap-4 w-full text-center mb-6">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Sec</span>
              <span className="font-bold text-gray-900 text-lg">{section}</span>
            </div>
            <div className="flex flex-col border-x border-gray-100">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Row</span>
              <span className="font-bold text-gray-900 text-lg">{row || '-'}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400 uppercase tracking-wider">Seat</span>
              <span className="font-bold text-gray-900 text-lg">{number}</span>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 mb-4">
            <QRCodeSVG value={qrCodeValue} size={160} level="H" />
          </div>

          <div className="text-center">
             <p className="text-xs text-gray-400 uppercase mb-1">Holder</p>
             <p className="font-medium text-gray-900">{holderName}</p>
             <p className="text-[10px] text-gray-300 mt-2 font-mono">{id.split('-')[0]}</p>
          </div>
        </div>
      </div>

      <Button onClick={handleDownload} variant="outline" className="w-full max-w-sm flex items-center justify-center gap-2">
        <Download size={16} />
        Download Ticket
      </Button>
    </div>
  );
};
"use client";

import { QRCodeSVG } from "qrcode.react";
import { Calendar, MapPin, Clock, Share2, Download } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface TicketCardProps {
  eventImage: string;
  eventName: string;
  date: string;
  location: string;
  seat: string;
  ticketId: string;
  qrCodeValue: string;
}

export default function TicketCard({
  eventImage,
  eventName,
  date,
  location,
  seat,
  ticketId,
  qrCodeValue,
}: TicketCardProps) {
  return (
    <div className="flex flex-col md:flex-row w-full max-w-3xl mx-auto bg-white dark:bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 relative group">
      
      {/* Left: Event Visuals */}
      <div className="w-full md:w-2/5 relative h-48 md:h-auto bg-slate-900">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-80 transition-transform duration-700 group-hover:scale-105"
          style={{ backgroundImage: `url(${eventImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent md:bg-gradient-to-r" />
        
        <div className="absolute bottom-0 left-0 p-6 text-white">
          <p className="text-[10px] font-bold uppercase tracking-widest bg-primary/90 px-2 py-1 rounded w-fit mb-2">
            Confirmed
          </p>
          <h3 className="text-xl font-black leading-tight mb-1">{eventName}</h3>
          <p className="text-xs text-slate-300 flex items-center gap-1">
            <MapPin className="w-3 h-3" /> {location}
          </p>
        </div>
      </div>

      {/* Right: Ticket Details */}
      <div className="flex-1 p-6 md:p-8 flex flex-col justify-between relative bg-white dark:bg-slate-900">
        {/* Tear-off circles decoration */}
        <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background-light dark:bg-background-dark hidden md:block" />
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-background-light dark:bg-background-dark hidden md:block" />

        <div className="flex justify-between items-start mb-6">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold">Date & Time</p>
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-semibold">
                <Calendar className="w-4 h-4 text-primary" />
                {new Date(date).toLocaleDateString()} 
                <span className="text-slate-300">|</span>
                <Clock className="w-4 h-4 text-primary" />
                7:00 PM
              </div>
            </div>
            
            <div>
              <p className="text-xs text-slate-500 uppercase font-bold">Seat Assignment</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                {seat}
              </p>
            </div>
          </div>

          <div className="bg-white p-2 rounded-xl shadow-inner border border-slate-100">
            <QRCodeSVG value={qrCodeValue} size={100} />
          </div>
        </div>

        <div className="border-t border-slate-100 dark:border-slate-800 pt-6 flex items-center justify-between">
          <div className="text-[10px] text-slate-400 font-mono">
            ID: {ticketId.slice(0, 8).toUpperCase()}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0 rounded-full">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
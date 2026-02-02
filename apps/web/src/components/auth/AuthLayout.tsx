"use client";

import Link from "next/link";
import { Ticket } from "lucide-react";

export default function AuthLayout({
  children,
  title,
  subtitle,
  image = "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2670&auto=format&fit=crop"
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  image?: string;
}) {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-slate-950 font-display">
      {/* Left: Content */}
      <div className="flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12 relative z-10">
        <div className="mb-12">
          <Link href="/" className="flex items-center gap-2 group w-fit">
            <Ticket className="w-6 h-6 text-primary transition-transform group-hover:rotate-12" />
            <span className="text-lg font-black tracking-tight text-white">
              TicketForge<span className="text-primary">AI</span>
            </span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              {title}
            </h1>
            <p className="text-slate-400">
              {subtitle}
            </p>
          </div>
          
          {children}
        </div>
        
        <div className="mt-12 text-xs text-slate-400 text-center">
          &copy; 2024 TicketForge AI. Protected by reCAPTCHA.
        </div>
      </div>

      {/* Right: Cinematic Visual */}
      <div className="hidden lg:block relative h-full bg-slate-900 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-60"
          style={{ backgroundImage: `url(${image})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-l from-slate-950 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 p-12 text-white/80 max-w-lg">
          <blockquote className="text-2xl font-bold leading-relaxed mb-4">
            "The future of live events is here. Secure, instant, and intelligent ticketing for the modern era."
          </blockquote>
          <cite className="not-italic font-medium text-primary">— System Administrator</cite>
        </div>
      </div>
    </div>
  );
}
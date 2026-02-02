import { ArrowRight, Info } from "lucide-react";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative mb-16 px-4 md:px-10">
      <div 
        className="relative overflow-hidden rounded-2xl aspect-[21/9] flex items-center justify-center p-8 bg-cover bg-center group"
        style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1459749411177-712961561f58?q=80&w=2670&auto=format&fit=crop")' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background-dark/90 via-background-dark/60 to-transparent"></div>
        
        <div className="relative z-10 max-w-3xl text-center space-y-6">
          <h1 className="text-white text-4xl md:text-6xl font-black leading-tight tracking-tighter drop-shadow-2xl">
            Book tickets in real-time.<br/> 
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">No bots.</span> No double booking.
          </h1>
          <p className="text-slate-300 text-lg max-w-xl mx-auto font-medium text-glow">
            Experience the next generation of ticketing with AI-powered fair access for the world's biggest events.
          </p>
          <div className="flex flex-wrap justify-center gap-4 pt-4">
            <Link href="#events">
              <Button size="lg" variant="glow" className="gap-2">
                Browse Events <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Button size="lg" variant="secondary" className="gap-2 backdrop-blur-md">
              <Info className="w-5 h-5" /> How it works
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
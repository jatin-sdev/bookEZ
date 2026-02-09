import Footer from "@/components/Footer";
import { Shield, Zap, Globe } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-950 font-display text-white">
      <main className="pt-24 pb-16">
        {/* Hero */}
        <div className="max-w-4xl mx-auto px-6 text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
            Fair ticketing for the <span className="text-primary">real fans</span>.
          </h1>
          <p className="text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            TicketForge AI was built to solve the biggest problem in live events: the bots.
            We use advanced AI to ensure that every ticket sold goes to a human being, not a scalper script.
          </p>
        </div>

        {/* Features */}
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-3 gap-8">
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl hover:bg-slate-800/50 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                    <Shield className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">Bot-Proof</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Our proprietary AI analyzes booking patterns in milliseconds to block automated purchase attempts.</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl hover:bg-slate-800/50 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                    <Zap className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">Real-Time Sync</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Powered by WebSockets and Redis, our inventory updates instantly. No more "Ticket Unavailable" errors after clicking buy.</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl hover:bg-slate-800/50 transition-colors">
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                    <Globe className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-white">Global Scale</h3>
                <p className="text-slate-400 text-sm leading-relaxed">Built on a distributed microservices architecture to handle the traffic of the world's largest stadium tours.</p>
            </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
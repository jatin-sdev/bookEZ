import Link from "next/link";
import { Ticket, Twitter, Instagram, Linkedin, Globe, Mail, Clapperboard } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-background-dark border-t border-white/10 py-16 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand Column */}
        <div className="col-span-1 space-y-6">
          <div className="flex items-center gap-2 text-primary">
            <Ticket className="w-8 h-8" />
            <h2 className="text-white text-xl font-black tracking-tight">
              TicketForge<span className="text-primary">AI</span>
            </h2>
          </div>
          <p className="text-[#9dabb9] text-sm leading-relaxed">
            The next generation of high-performance ticketing. Fair access, every time.
            Powered by real-time inventory AI.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-[#9dabb9] hover:text-primary transition-colors">
              <Globe className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-[#9dabb9] hover:text-primary transition-colors">
              <Mail className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-[#9dabb9] hover:text-primary transition-colors">
              <Clapperboard className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h6 className="text-white font-bold">Quick Links</h6>
          <ul className="space-y-2 text-sm text-[#9dabb9]">
            <li><Link href="/events" className="hover:text-primary transition-colors">Find Events</Link></li>
            <li><Link href="/sell" className="hover:text-primary transition-colors">Sell Tickets</Link></li>
            <li><Link href="/gift-cards" className="hover:text-primary transition-colors">Gift Cards</Link></li>
            <li><Link href="/dashboard" className="hover:text-primary transition-colors">My Account</Link></li>
          </ul>
        </div>

        {/* Support */}
        <div className="space-y-4">
          <h6 className="text-white font-bold">Support</h6>
          <ul className="space-y-2 text-sm text-[#9dabb9]">
            <li><Link href="/help" className="hover:text-primary transition-colors">Help Center</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="space-y-4">
          <h6 className="text-white font-bold">Stay Updated</h6>
          <p className="text-[#9dabb9] text-sm">Join our newsletter to get flash sale alerts.</p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Email address"
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none w-full text-white placeholder:text-slate-500"
            />
            <button className="bg-primary text-white p-2 rounded-lg hover:bg-primary/90 transition-all">
              <Mail className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[#9dabb9] text-xs">
        <p>© 2024 TicketForge AI. All rights reserved. Built for performance.</p>
        <div className="flex gap-6">
          <Link href="#" className="hover:text-white transition-colors"><Twitter className="w-4 h-4" /></Link>
          <Link href="#" className="hover:text-white transition-colors"><Instagram className="w-4 h-4" /></Link>
          <Link href="#" className="hover:text-white transition-colors"><Linkedin className="w-4 h-4" /></Link>
        </div>
      </div>
    </footer>
  );
}
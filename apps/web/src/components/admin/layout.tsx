"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { Search, Bell } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Simple client-side role check (Robust check should happen on API/Server Actions)
    const token = localStorage.getItem("accessToken");
    // In a real app, decode JWT here to check role === 'ADMIN'
    if (!token) {
      router.push("/login");
    } else {
      setIsAuthorized(true);
    }
  }, [router]);

  if (!isAuthorized) return null;

  return (
    <div className="min-h-screen bg-slate-950 font-display text-white">
      <AdminSidebar />
      
      <div className="lg:ml-64 min-h-screen flex flex-col">
        {/* Top Bar */}
        <header className="h-16 sticky top-0 z-40 bg-slate-900 border-b border-slate-800 px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">Home / Dashboard</span>
            <div className="h-6 w-px bg-slate-800 mx-2" />
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search events..." 
                className="w-full bg-slate-800 border-none rounded-lg pl-10 py-1.5 text-sm focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center bg-emerald-900/20 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
              <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 shadow-[0_0_8px_#10b981]" />
              <span className="text-xs font-bold uppercase tracking-wider">Systems Operational</span>
            </div>
            <button className="p-2 text-slate-500 hover:bg-slate-800 rounded-lg relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border-2 border-slate-900" />
            </button>
            <div className="w-9 h-9 rounded-full bg-slate-700 ml-2" />
          </div>
        </header>

        <main className="flex-1 p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
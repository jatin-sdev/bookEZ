"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Search, Ticket, Menu, User, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { isAuthenticated, logout } from "@/utils/auth-utils";
import { decodeAccessToken } from "@/utils/jwt-utils";
import { cn } from "@/lib/utils";

interface NavigationProps {
  isSidebarCollapsed: boolean;
  onMobileMenuToggle: () => void;
}

export default function Navigation({ isSidebarCollapsed, onMobileMenuToggle }: NavigationProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<'ADMIN' | 'USER' | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated();
      setIsLoggedIn(authenticated);
      if (authenticated) {
        try {
          const token = localStorage.getItem('accessToken');
          if (token) {
            const user = decodeAccessToken(token);
            setUserRole(user.role);
          }
        } catch (err) {
          console.error('Failed to decode token:', err);
          setIsLoggedIn(false);
        }
      }
    };
    checkAuth();
  }, [pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    setIsLoggedIn(false);
    setUserRole(null);
    setIsUserMenuOpen(false);
    router.push('/');
  };

  return (
    <header 
      className={cn(
        "fixed top-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 transition-all duration-300 ease-in-out",
        "left-0", // Always left-0 on mobile
        isSidebarCollapsed ? "lg:left-16" : "lg:left-64" // Dynamic on desktop
      )}
    >
      <div className="h-16 px-4 md:px-6 flex items-center justify-between lg:justify-end gap-4">
        
        {/* Mobile/Tablet Logo & Hamburger - Left Aligned */}
        <div className="flex lg:hidden items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="p-2 -ml-2 text-slate-300 hover:bg-slate-800 rounded-lg"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <Link href="/" className="flex items-center gap-1.5 group">
            <Ticket className="w-5 h-5 text-primary transition-transform group-hover:rotate-12" />
            <span className="text-lg font-black tracking-tight text-white">
              TicketForge
            </span>
          </Link>
        </div>

        {/* Search Bar */}
        <form 
          onSubmit={handleSearch} 
          className="hidden md:flex flex-1 max-w-md items-center bg-slate-800/50 border border-slate-700 rounded-lg px-3 py-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all ml-auto lg:ml-0"
        >
          <Search className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent border-none focus:ring-0 text-sm placeholder:text-slate-400 text-white w-full outline-none"
          />
          <button type="submit" className="bg-slate-700 hover:bg-slate-600 px-3 py-1 text-xs text-white rounded transition-colors ml-2">
            Search
          </button>
        </form>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Mobile Search Toggle (Optional optimization) */}
          <button className="md:hidden p-2 text-slate-300">
            <Search className="w-5 h-5" />
          </button>

          {isLoggedIn ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-2 py-1.5 md:px-3 md:py-2 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-primary transition-colors"
              >
                <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                   <User className="w-4 h-4" />
                </div>
                <span className="hidden sm:inline text-sm font-medium text-white">Account</span>
              </button>

              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-xl shadow-xl py-2 z-50">
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 hover:bg-slate-800"
                    >
                      <Settings className="w-4 h-4" /> Settings
                    </Link>
                    <div className="h-px bg-slate-800 my-2" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/20 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" /> Logout
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button variant="primary" size="sm" className="h-9 md:h-10">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
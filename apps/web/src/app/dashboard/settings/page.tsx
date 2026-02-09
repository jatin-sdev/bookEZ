"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Shield, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { apiRequest } from "@/lib/api";
import { useToast } from "@/components/ToastProvider";
import { cn } from "@/lib/utils";

interface UserProfile {
  name: string;
  email: string;
}

export default function SettingsPage() {
  const [profile, setProfile] = useState<UserProfile>({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const { addToast } = useToast();

  useEffect(() => {
    const fetchUserData = async () => {
      // Check if user is logged in
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login?redirect=/dashboard/settings');
        return;
      }

      try {
        const query = `
          query GetUserProfile {
            me {
              name
              email
            }
          }
        `;
        
        const res = await apiRequest<{
          data: {
            me: UserProfile;
          }
        }>('/graphql', {
          method: 'POST',
          body: JSON.stringify({ query })
        });
        
        if (res.data?.me) setProfile(res.data.me);
      } catch (err: any) {
        console.error('Failed to fetch user data:', err);
        // Don't show error for 401, handled by auth redirect usually
        if (!err.message?.includes('Unauthenticated')) {
          setError(err.message || 'Failed to load user data');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 bg-slate-950 flex items-center justify-center">
        <div className="text-center p-6 bg-slate-900 rounded-xl shadow-sm border border-slate-800">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-white font-semibold mb-2">Unable to load profile</p>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
          <Button variant="outline" onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-20">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pt-24">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Account Settings
          </h1>
          <p className="text-slate-400 mt-0.5 text-sm">
            View your profile information.
          </p>
        </div>

        <section className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-800 bg-slate-800/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-900/30 rounded-lg">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">Profile Information</h2>
                <p className="text-sm text-slate-400">Your personal details</p>
              </div>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Full Name
                </label>
                <p className="text-lg font-medium text-white bg-slate-950/50 px-4 py-3 rounded-lg border border-slate-800/50">
                  {profile.name}
                </p>
              </div>
              
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Email Address
                </label>
                <div className="flex items-center gap-2 text-lg font-medium text-white bg-slate-950/50 px-4 py-3 rounded-lg border border-slate-800/50">
                  <Mail className="w-4 h-4 text-slate-500" />
                  {profile.email}
                </div>
              </div>
            </div>
            
            <div className="bg-blue-900/10 border border-blue-900/30 rounded-lg p-4 flex gap-3 items-start">
              <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-blue-200">Account Secured</h3>
                <p className="text-xs text-blue-300MT-1">Your account is active and verified.</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { graphqlClient } from '@/lib/graphql';
import { gql } from 'graphql-request';

// --- Types ---
export interface User {
  id: string;
  email: string;
  fullName: string;
  role: 'ADMIN' | 'USER';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (token: string, refreshToken: string) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// --- Queries ---
// We use a manual fetch for the profile to support the REST/Hybrid approach 
// defined in your backend, or we can use a GQL query if available. 
// Here we use the REST endpoint you already built: /auth/me
const fetchUserProfile = async (token: string): Promise<User> => {
  const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000').replace(/\/graphql\/?$/, '');
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) throw new Error('Unauthorized');
  if (!res.ok) throw new Error('Failed to fetch user');
  return res.json();
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 1. Initialize Auth on Mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const profile = await fetchUserProfile(token);
        setUser(profile);
      } catch (error: any) {
        // Use warn for expected auth errors to avoid Error Overlay in Dev
        if (error.message === 'Unauthorized' || error.message === 'Failed to fetch user') {
           console.warn('Session expired:', error.message);
        } else {
           console.error('Auth Error:', error);
        }
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // 2. Actions
  const login = async (accessToken: string, refreshToken: string) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    
    // Fetch profile immediately after setting token
    try {
      const profile = await fetchUserProfile(accessToken);
      setUser(profile);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login profile fetch failed', error);
    }
  };

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    router.push('/login');
  };

  const refreshProfile = async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const profile = await fetchUserProfile(token);
      setUser(profile);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
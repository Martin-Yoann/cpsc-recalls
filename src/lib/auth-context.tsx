'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/types/auth';
import {
  getStoredUser, refreshSession, login as authLogin, register as authRegister,
  logout as authLogout, updateProfile as authUpdateProfile,
} from '@/lib/auth-utils';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updates: { name?: string; avatarDataUrl?: string | null }) => Promise<{ success: boolean; error?: string }>;
  /** Drawer control */
  authDrawerOpen: boolean;
  authDrawerMode: 'signin' | 'register';
  openAuthDrawer: (mode?: 'signin' | 'register') => void;
  closeAuthDrawer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authDrawerOpen, setAuthDrawerOpen] = useState(false);
  const [authDrawerMode, setAuthDrawerMode] = useState<'signin' | 'register'>('signin');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Restore the cached session immediately, then revalidate it in the background.
      // This prevents a refresh from briefly (or permanently, on transient errors)
      // appearing as a signed-out state.
      const stored = getStoredUser();
      if (!cancelled) setUser(stored);
      if (stored?.token) {
        const refreshed = await refreshSession();
        if (!cancelled) setUser(refreshed);
      }
      if (!cancelled) setIsLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authLogin(email, password);
    if (result.user) {
      setUser(result.user);
      setAuthDrawerOpen(false);
      return { success: true };
    }
    return { success: false, error: result.error };
  }, []);

  const register = useCallback(async (data: { name: string; email: string; phone: string; password: string }) => {
    const result = await authRegister(data);
    if (result.user) {
      setUser(result.user);
      setAuthDrawerOpen(false);
      return { success: true };
    }
    return { success: false, error: result.error };
  }, []);

  const logout = useCallback(async () => {
    await authLogout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (updates: { name?: string; avatarDataUrl?: string | null }) => {
    const refreshed = await authUpdateProfile({
      ...(updates.name !== undefined ? { displayName: updates.name } : {}),
      ...(updates.avatarDataUrl !== undefined ? { avatarDataUrl: updates.avatarDataUrl } : {}),
    });
    if (refreshed) {
      setUser(refreshed);
      return { success: true };
    }
    return { success: false, error: 'Profile update failed' };
  }, []);

  const openAuthDrawer = useCallback((mode: 'signin' | 'register' = 'signin') => {
    setAuthDrawerMode(mode);
    setAuthDrawerOpen(true);
  }, []);

  const closeAuthDrawer = useCallback(() => {
    setAuthDrawerOpen(false);
  }, []);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, isLoading,
      login, register, logout, updateProfile,
      authDrawerOpen, authDrawerMode, openAuthDrawer, closeAuthDrawer,
    }}>
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

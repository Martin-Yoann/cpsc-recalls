'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User } from '@/types/auth';
import { getStoredUser, login as authLogin, register as authRegister, logout as authLogout } from '@/lib/auth-utils';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
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
    const stored = getStoredUser();
    setUser(stored);
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const result = authLogin(email, password);
    if (result) {
      setUser(result);
      setAuthDrawerOpen(false);
      return { success: true };
    }
    return { success: false, error: 'Invalid email or password' };
  }, []);

  const register = useCallback(async (data: { name: string; email: string; phone: string; password: string }) => {
    const result = authRegister(data);
    if (result) {
      setUser(result);
      setAuthDrawerOpen(false);
      return { success: true };
    }
    return { success: false, error: 'This email is already registered' };
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setUser(null);
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
      login, register, logout,
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

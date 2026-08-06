'use client';

import { useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function RegisterRedirect() {
  const { isAuthenticated, openAuthDrawer } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) openAuthDrawer('register');
  }, [isAuthenticated, openAuthDrawer]);

  if (isAuthenticated) {
    if (typeof window !== 'undefined') window.location.href = '/dashboard';
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#faf8ff' }}>
      <p className="text-sm" style={{ color: '#404944' }}>Opening sign up...</p>
    </div>
  );
}

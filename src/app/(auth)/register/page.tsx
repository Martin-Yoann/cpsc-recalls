'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function RegisterRedirect() {
  const { isAuthenticated, openAuthDrawer } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
      return;
    }

    openAuthDrawer('register');
  }, [isAuthenticated, openAuthDrawer, router]);

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-primary">
      <p className="text-sm text-text-secondary">Opening sign up...</p>
    </div>
  );
}

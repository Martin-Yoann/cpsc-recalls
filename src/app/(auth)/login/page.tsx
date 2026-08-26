'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function LoginRedirect() {
  const { isAuthenticated, openAuthDrawer } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
      return;
    }
    openAuthDrawer('signin');
  }, [isAuthenticated, openAuthDrawer, router]);

  if (isAuthenticated) return null;

  return (
    <div className="flex items-center justify-center min-h-[40vh] text-sm text-secondary">
      Opening sign in...
    </div>
  );
}

'use client';

import { useAuth } from '@/lib/auth-context';

export function AuthLinks() {
  const { openAuthDrawer } = useAuth();

  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-text-secondary">
      <span>Already have an account? </span>
      <button
        onClick={() => openAuthDrawer('signin')}
        className="font-semibold text-brand-teal hover:underline cursor-pointer bg-transparent border-0 p-0"
      >
        Sign In
      </button>
      <span className="mx-1 hidden sm:inline">&middot;</span>
      <span className="hidden sm:inline">New to KOI? </span>
      <button
        onClick={() => openAuthDrawer('register')}
        className="font-semibold text-brand-teal hover:underline cursor-pointer bg-transparent border-0 p-0 sm:inline"
      >
        <span className="sm:hidden"> · </span>Create Free Account
      </button>
    </div>
  );
}

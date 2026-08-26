'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

const BENEFITS = [
  'Save your claim history',
  'Get clearer status updates',
  'Pick up on any device',
];

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

  if (isAuthenticated) return null;

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
      {/* Left: Pitch */}
      <section className="hidden lg:block">
        <div className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 mb-6">
          <Sparkles className="h-3.5 w-3.5 text-brand" />
          <span className="label-eyebrow !text-foreground">Welcome to KOI</span>
        </div>
        <h1 className="text-[44px] xl:text-[56px] leading-[1.05] font-bold tracking-[-0.03em] text-foreground max-w-lg">
          Stay on top of recalls.
        </h1>
        <p className="mt-5 text-secondary text-lg leading-relaxed max-w-md">
          Create a free account to keep your claims, status updates, and next steps together — wherever you are.
        </p>
        <div className="mt-8 space-y-3">
          {BENEFITS.map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm font-semibold text-foreground">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-success/10 text-success">
                <Check className="h-4 w-4" />
              </span>
              {item}
            </div>
          ))}
        </div>
      </section>

      {/* Right: loading state */}
      <section className="card-elevated p-8 sm:p-10 text-center max-w-md mx-auto w-full">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-md bg-foreground text-white">
          <Shield className="h-7 w-7" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">Let&apos;s get you set up</h2>
        <p className="mt-2 text-sm text-secondary leading-relaxed">
          Your account drawer is opening. It only takes a minute to join.
        </p>
        <div className="mt-7 inline-flex items-center gap-2 label-eyebrow">
          <Shield className="h-4 w-4 text-success" />
          Private & Secure
        </div>
        <p className="mt-4 text-xs text-secondary">Opening sign up...</p>
      </section>
    </div>
  );
}

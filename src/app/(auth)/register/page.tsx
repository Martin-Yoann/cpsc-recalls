'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Candy, Check, ShieldCheck, Sparkles } from 'lucide-react';

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
    <div className="candy-register-stage grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.75fr)] lg:items-center">
      <section className="hidden max-w-xl px-4 lg:block lg:px-10">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#f4c6d6] bg-white/75 px-4 py-2 text-xs font-extrabold uppercase tracking-[0.16em] text-[#a54d70] shadow-[0_8px_20px_rgba(240,91,120,0.08)]">
          <Sparkles className="h-4 w-4 text-[#f9c95f]" /> Welcome to KOI
        </div>
        <h1 className="max-w-lg text-5xl font-black leading-[0.98] tracking-[-0.06em] text-[#5d3047] xl:text-6xl">
          A sweeter way to stay on top of recalls.
        </h1>
        <p className="mt-6 max-w-md text-base leading-7 text-[#806874]">
          Create a free account to keep your claims, status updates, and next steps together wherever you are.
        </p>
        <div className="mt-8 grid gap-3">
          {['Save your claim history', 'Get clearer status updates', 'Pick up on any device'].map((item) => (
            <div key={item} className="flex items-center gap-3 text-sm font-semibold text-[#6d4b5a]">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#dff6eb] text-[#3fa77d]"><Check className="h-4 w-4" /></span>
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="candy-register-card relative mx-auto w-full max-w-[480px] overflow-hidden rounded-[2rem] border border-white/80 bg-white/85 p-6 text-center shadow-[0_28px_70px_rgba(137,67,97,0.16)] backdrop-blur-xl sm:p-8">
        <div className="candy-card-ribbon" aria-hidden="true" />
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-[#ffb6cf] text-[#8e3c5c] shadow-[0_12px_24px_rgba(240,91,120,0.18)]"><Candy className="h-8 w-8" /></div>
        <h2 className="text-2xl font-black tracking-[-0.04em] text-[#5d3047]">Let&apos;s make it official</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-[#806874]">Your account drawer is opening. It only takes a minute to join.</p>
        <div className="mt-7 flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-[#7e6370]"><ShieldCheck className="h-4 w-4 text-[#63c7a2]" /> Private & secure</div>
        <div className="mt-5 flex justify-center gap-1.5" aria-label="Loading sign up form"><span className="candy-loader-dot candy-loader-dot-pink" /><span className="candy-loader-dot candy-loader-dot-yellow" /><span className="candy-loader-dot candy-loader-dot-mint" /></div>
        <p className="mt-3 text-xs font-medium text-[#987d89]">Opening sign up...</p>
      </section>
    </div>
  );
}

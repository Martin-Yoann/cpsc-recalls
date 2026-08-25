// ============================================================
// KOI Recall Platform — Auth Layout
// Clean centered layout, no header/footer
// ============================================================

import Link from 'next/link';
import { Candy, ShieldCheck, Sparkles } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="candy-auth-shell min-h-screen flex flex-col overflow-hidden">
      <div className="candy-auth-orb candy-auth-orb-pink" aria-hidden="true" />
      <div className="candy-auth-orb candy-auth-orb-yellow" aria-hidden="true" />
      <div className="candy-auth-sprinkles" aria-hidden="true" />

      <header className="relative z-10 border-b border-white/70 bg-white/70 px-5 py-5 backdrop-blur-xl sm:px-8">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="group inline-flex items-center gap-3 font-bold text-[#5d3047] transition-transform hover:-translate-y-0.5">
            <span className="candy-logo-mark">
              <Candy className="h-5 w-5" />
            </span>
            <span className="text-xl tracking-[-0.04em]">KOI <span className="text-[#f05b78]">Recall</span></span>
          </Link>
          <span className="hidden items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-[#8f6877] sm:inline-flex">
            <ShieldCheck className="h-4 w-4 text-[#63c7a2]" /> Safe & simple
          </span>
        </div>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:px-8 sm:py-16">
        <div className="w-full max-w-6xl">
          {children}
        </div>
      </main>

      <footer className="relative z-10 px-5 pb-6 text-center text-xs font-medium text-[#987d89]">
        <Sparkles className="mx-auto mb-2 h-4 w-4 text-[#f9c95f]" />
        KOI Recall keeps every next step clear.
      </footer>
    </div>
  );
}

// ============================================================
// KOI Recall Platform — Auth Layout
// Clean centered layout, no header/footer
// ============================================================

import Link from 'next/link';
import { Shield } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-surface-primary">
      {/* Minimal top bar with logo */}
      <div className="border-b bg-surface-elevated px-4 py-5 text-center">
        <Link href="/" className="inline-flex items-center gap-2.5 font-bold text-text-primary hover:text-brand-teal transition-colors">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-brand-teal">
            <Shield className="h-4.5 w-4.5 text-white" />
          </div>
          <span className="text-lg tracking-tight">KOI <span className="text-xs font-normal text-text-tertiary">Recall Service</span></span>
        </Link>
      </div>

      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center px-4 py-10 sm:py-16">
        {children}
      </div>
    </div>
  );
}

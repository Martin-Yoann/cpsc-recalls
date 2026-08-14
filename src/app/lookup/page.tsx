'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { LookupForm } from '@/components/lookup/lookup-form';
import { LookupResult } from '@/components/lookup/lookup-result';
import { getClaimByNumber, seedIfEmpty } from '@/lib/shared-claims-store';
import { cn } from '@/lib/utils';

export default function LookupPage() {
  const [result, setResult] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Seed demo claims (if none exist) so status lookup has data to match against.
  useEffect(() => {
    seedIfEmpty([
      { id: 'cmp_001', title: 'Music Lollipop Safety Recall', slug: 'music-lollipop-demo-2026' },
    ]);
  }, []);

  const handleSearch = (claimNumber: string, phone: string) => {
    setIsLoading(true);
    setNotFound(false);
    setResult(null);
    setTimeout(() => {
      const claim = getClaimByNumber(claimNumber);
      if (claim && claim.consumerPhone === phone) {
        setResult({
          claim,
          campaignTitle: claim.campaignTitle,
          productName: claim.productName,
          remedyTitle: claim.remedyTitle,
          remedyType: claim.remedyType,
          refundAmount: claim.refundAmount,
        });
        setDrawerOpen(true);
      } else {
        setNotFound(true);
      }
      setIsLoading(false);
    }, 800);
  };

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div className="min-h-[calc(100vh-3.75rem)] flex items-center justify-center px-5" style={{ background: '#faf8ff' }}>
      {/* ═══ Centered form ═══ */}
      <div className="w-full max-w-[440px] -mt-16">
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-5"
            style={{ background: 'rgba(0,53,39,0.05)' }}>
            <Search className="h-7 w-7" style={{ color: '#003527' }} />
          </div>
          <h1 className="text-[32px] md:text-[40px] font-bold leading-[1.15] tracking-[-0.02em] mb-2.5"
            style={{ color: '#003527' }}>
            Check Your<br />Recall Status
          </h1>
          <p className="text-base leading-relaxed max-w-sm mx-auto" style={{ color: '#404944' }}>
            Enter your claim number and phone number.<br />No registration required.
          </p>
        </div>

        {/* Form card */}
        <div className="rounded-xl p-6 sm:p-8 shadow-sm" style={{ background: '#ffffff', border: '1px solid rgba(0,53,39,0.1)' }}>
          <LookupForm onSearch={handleSearch} isLoading={isLoading} />

          {/* Not Found */}
          {notFound && (
            <div className="mt-4 p-3 rounded-lg text-center animate-in fade-in duration-150"
              style={{ background: '#ffdad6', border: '1px solid rgba(186,26,26,0.15)', color: '#93000a', fontSize: '0.8125rem' }}>
              <p className="font-semibold mb-0.5">No Matching Record Found</p>
              <p className="opacity-80">Verify your claim number and phone number.</p>
            </div>
          )}
        </div>

        {/* Bottom links */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm mt-5">
          <Link href="/register" className="hover:underline transition-colors" style={{ color: '#404944' }}>
            Create Account
          </Link>
          <span style={{ color: '#bfc9c3' }}>|</span>
          <Link href="/login" className="hover:underline transition-colors" style={{ color: '#404944' }}>
            Sign In
          </Link>
          <span style={{ color: '#bfc9c3' }}>|</span>
          <Link href="/" className="hover:underline transition-colors" style={{ color: '#404944' }}>
            Home
          </Link>
        </div>
      </div>

      {/* ═══ Drawer overlay ═══ */}
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-50 transition-opacity duration-300',
          drawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none',
        )}
        style={{ background: 'rgba(0,0,0,0.3)' }}
        onClick={closeDrawer}
      />

      {/* Drawer panel — slides in from right */}
      <div
        className={cn(
          'fixed top-0 right-0 z-50 h-full w-full sm:max-w-[560px] md:max-w-[640px] lg:max-w-[720px] overflow-y-auto shadow-2xl',
          'transition-transform duration-350 ease-[cubic-bezier(0.16,1,0.3,1)]',
          drawerOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        style={{ background: '#faf8ff' }}
      >
        {/* Close button */}
        <button
          onClick={closeDrawer}
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-full transition-colors cursor-pointer hover:bg-black/5"
          aria-label="Close"
        >
          <X className="h-5 w-5" style={{ color: '#003527' }} />
        </button>

        {/* Result content */}
        <div className="p-6 sm:p-8 lg:p-10 pt-14 min-h-full">
          {result && <LookupResult {...result} />}
        </div>
      </div>
    </div>
  );
}

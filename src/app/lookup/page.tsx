'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { LookupForm } from '@/components/lookup/lookup-form';
import { LookupResult } from '@/components/lookup/lookup-result';
import { getClaimByNumberAndPhone } from '@/data/mock-claims';
import { mockCampaigns } from '@/data/mock-recalls';
import { cn } from '@/lib/utils';

export default function LookupPage() {
  const [result, setResult] = useState<any>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSearch = (claimNumber: string, phone: string) => {
    setIsLoading(true);
    setNotFound(false);
    setResult(null);
    setTimeout(() => {
      const claim = getClaimByNumberAndPhone(claimNumber, phone);
      if (claim) {
        const campaign = mockCampaigns.find((c) => c.id === claim.campaignId);
        const product = campaign?.affectedProducts.find((p) => p.id === claim.productId);
        const remedy = campaign?.remedies.find((r) => r.id === claim.remedyId);
        setResult({
          claim,
          campaignTitle: campaign?.title,
          productName: product?.name || 'Unknown Product',
          remedyTitle: remedy?.title,
          remedyType: remedy?.type,
          refundAmount: remedy?.compensationAmount,
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

        {/* Demo hints */}
        <div className="text-center mt-4">
          <details className="group">
            <summary className="text-xs cursor-pointer hover:underline transition-colors list-none select-none"
              style={{ color: '#707974' }}>
              Demo test data
            </summary>
            <div className="mt-2 inline-block p-2 rounded-lg text-[11px] font-mono space-y-0.5"
              style={{ background: '#ffffff', border: '1px solid rgba(0,53,39,0.08)', color: '#404944' }}>
              <p>KOI-2512-1842 / 13812341234</p>
              <p>KOI-2601-2104 / 18611223344</p>
              <p>KOI-2512-0412 / 13956785678</p>
            </div>
          </details>
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


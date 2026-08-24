'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, LockKeyhole, ShieldCheck, X } from 'lucide-react';
import { LookupForm } from '@/components/lookup/lookup-form';
import { LookupResult } from '@/components/lookup/lookup-result';
import { lookupConsumerClaim, type ConsumerClaim } from '@/lib/api-client';
import { cn } from '@/lib/utils';

export default function LookupPage() {
  const [result, setResult] = useState<{
    claim: ConsumerClaim;
    campaignTitle: string;
    productName: string;
    remedyTitle: string;
    remedyType: string;
    refundAmount?: number;
  } | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleSearch = async (claimNumber: string, phone: string) => {
    setIsLoading(true);
    setNotFound(false);
    setResult(null);
    const response = await lookupConsumerClaim(claimNumber, phone);
    if (response.ok) {
      setResult(response.data);
      setDrawerOpen(true);
    } else {
      setNotFound(response.status === 404);
    }
    setIsLoading(false);
  };

  const closeDrawer = () => setDrawerOpen(false);

  return (
    <div className="lookup-page">
      <div className="lookup-page__inner">
        <div className="lookup-intro">
          <div className="lookup-intro__topline"><span>Consumer support</span><span>01 / 02</span></div>
          <div className="lookup-intro__icon"><ShieldCheck aria-hidden="true" /><span>Secure recall centre</span></div>
          <h1>Check your<br /><em>recall status.</em></h1>
          <p className="lookup-intro__lead">
            A clear answer starts with your claim number. Review your case, remedy, and next steps in one place.
          </p>
          <div className="lookup-intro__rule" />
          <div className="lookup-intro__points">
            <div><Check aria-hidden="true" /><span><strong>No account required</strong>Use the details from your claim.</span></div>
            <div><Check aria-hidden="true" /><span><strong>Private by design</strong>Your phone number verifies access.</span></div>
          </div>
          <div className="lookup-intro__mark">KOI<span>•</span>RECALL</div>
        </div>

        <div className="lookup-form-area">
          <div className="lookup-form-area__heading">
            <div><span className="lookup-kicker">Find a case</span><h2>Enter your details</h2></div>
            <div className="lookup-step"><span>STEP</span><strong>01</strong></div>
          </div>
          <div className="lookup-form-card">
            <LookupForm onSearch={handleSearch} isLoading={isLoading} />

          {/* Not Found */}
          {notFound && (
            <div className="mt-4 p-3 rounded-md text-center animate-in fade-in duration-150 bg-red-50 border border-red-200 text-red-800 text-[0.8125rem]">
              <p className="font-semibold mb-0.5">No Matching Record Found</p>
              <p className="opacity-80">Verify your claim number and phone number.</p>
            </div>
          )}
            <div className="lookup-form-card__privacy"><LockKeyhole aria-hidden="true" /><span>Your information is encrypted and only used to locate your recall record.</span></div>
          </div>
          <div className="lookup-form-area__footer">
            <span>Looking for a different way to get help?</span>
            <Link href="/register">Create an account <ArrowRight aria-hidden="true" /></Link>
          </div>
        </div>
      </div>
      <div className="lookup-links">
          <Link href="/register" className="text-text-secondary hover:text-brand-teal hover:underline transition-colors">
            Create Account
          </Link>
          <span className="text-text-tertiary">|</span>
          <Link href="/login" className="text-text-secondary hover:text-brand-teal hover:underline transition-colors">
            Sign In
          </Link>
          <span className="text-text-tertiary">|</span>
          <Link href="/" className="text-text-secondary hover:text-brand-teal hover:underline transition-colors">
            Home
          </Link>
      </div>

      {/* ═══ Drawer overlay ═══ */}
      {/* Backdrop */}
      <div
        className={cn(
          'lookup-drawer-backdrop',
          drawerOpen && 'is-open',
        )}
        onClick={closeDrawer}
      />

      {/* Drawer panel — slides in from right */}
      <div
        className={cn(
          'lookup-drawer-panel',
          drawerOpen && 'is-open',
        )}
      >
        {/* Close button */}
        <button
          onClick={closeDrawer}
          className="absolute top-4 right-4 z-10 flex h-9 w-9 items-center justify-center rounded-md transition-colors cursor-pointer hover:bg-surface-secondary"
          aria-label="Close"
        >
          <X className="h-5 w-5 text-brand-teal" />
        </button>

        {/* Result content */}
        <div className="p-6 sm:p-8 lg:p-10 pt-14 min-h-full">
          {result && <LookupResult {...result} />}
        </div>
      </div>
    </div>
  );
}

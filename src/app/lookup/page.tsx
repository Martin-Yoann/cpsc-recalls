'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Check, Clock3, LockKeyhole, Search, ShieldCheck, Sparkles, Ticket, X } from 'lucide-react';
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

  const handleSearch = async (claimNumber: string, reference: string) => {
    setIsLoading(true);
    setNotFound(false);
    setResult(null);
    const response = await lookupConsumerClaim(claimNumber, reference);
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
        <section className="lookup-intro">
          <div className="lookup-intro__topline"><span>Consumer support</span><span>01 / 02</span></div>
          <div className="lookup-intro__icon"><ShieldCheck aria-hidden="true" /><span>Secure recall centre</span></div>
          <h1>Check your<br /><em>recall status.</em></h1>
          <p className="lookup-intro__lead">
            A clear answer starts with your claim number. Review your case, remedy, and next steps in one place.
          </p>
          <div className="lookup-intro__rule" />
          <div className="lookup-intro__stats">
            <div><Search className="h-4 w-4" /><span><strong>Fast lookup</strong>Claim number and reference only.</span></div>
            <div><LockKeyhole className="h-4 w-4" /><span><strong>Private by design</strong>Access stays tied to this case.</span></div>
            <div><Ticket className="h-4 w-4" /><span><strong>Recall ready</strong>Track remedy, evidence, and status.</span></div>
          </div>
          <div className="lookup-intro__footer">
            <div className="lookup-intro__mark">KOI<span>•</span>RECALL</div>
            <div className="lookup-intro__chips">
              <span><Sparkles className="h-3.5 w-3.5" /> Candy support</span>
              <span><Clock3 className="h-3.5 w-3.5" /> Status updates</span>
            </div>
          </div>
        </section>

        <section className="lookup-form-area">
          <div className="lookup-form-area__heading">
            <div>
              <span className="lookup-kicker">Find a case</span>
              <h2>Enter your details</h2>
              <p className="lookup-form-area__lead">Use the claim number and reference from your recall notice to open the latest progress view.</p>
            </div>
            <div className="lookup-step"><span>STEP</span><strong>01</strong></div>
          </div>
          <div className="lookup-form-card">
            <LookupForm onSearch={handleSearch} isLoading={isLoading} />

            {notFound && (
              <div className="lookup-form-card__alert">
                <p className="mb-0.5 font-semibold">No Matching Record Found</p>
                <p className="opacity-80">Verify your claim number and reference number.</p>
              </div>
            )}
            <div className="lookup-form-card__privacy"><LockKeyhole aria-hidden="true" /><span>Your information is encrypted and only used to locate your recall record.</span></div>
          </div>
          <div className="lookup-form-area__footer">
            <span>Need another path?</span>
            <Link href="/register">Create an account <ArrowRight aria-hidden="true" /></Link>
          </div>
        </section>
      </div>
      <div className="lookup-links">
        <Link href="/register" className="text-[#4A2C2A] transition-colors hover:text-[#FF6B8A]">
          Create Account
        </Link>
        <span className="text-[#D7B8C0]">|</span>
        <Link href="/login" className="text-[#4A2C2A] transition-colors hover:text-[#FF6B8A]">
          Sign In
        </Link>
        <span className="text-[#D7B8C0]">|</span>
        <Link href="/" className="text-[#4A2C2A] transition-colors hover:text-[#FF6B8A]">
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

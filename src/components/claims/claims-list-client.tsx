'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, ClipboardList, LockKeyhole, Search, Sparkles, UserRoundPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { useAuth } from '@/lib/auth-context';
import { getClaimsForViewer } from '@/lib/claim-access';
import type { ConsumerClaim } from '@/lib/api-client';

interface ClaimsListClientProps {
  detailBasePath: string;
  title?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ClaimsListClient({
  detailBasePath,
  title = 'My Claims',
  emptyTitle = 'No Claims Found',
  emptyDescription = 'You have not submitted or looked up any recall claims yet.',
}: ClaimsListClientProps) {
  const { user, isAuthenticated, openAuthDrawer } = useAuth();
  const [claims, setClaims] = useState<ConsumerClaim[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    void getClaimsForViewer(user?.token).then((nextClaims) => {
      if (cancelled) return;
      setClaims(nextClaims);
    });

    return () => {
      cancelled = true;
    };
  }, [user?.token]);

  const claimsList = claims ?? [];

  return (
    <div className="space-y-6">
      <div className="rounded-[14px] border border-[#F4C6B9] bg-gradient-to-br from-[#FFF7F2] via-white to-[#FFF1F5] p-5 shadow-card sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[#F4C6B9] bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#B46B78]">
              <Sparkles className="h-3.5 w-3.5" />
              Claim center
            </div>
            <h1 className="text-2xl font-bold text-text-primary sm:text-[2rem]">{title}</h1>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">
              {claimsList.length} claim{claimsList.length !== 1 ? 's' : ''} available. Review the latest status, evidence count, and resolution path from one place.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/lookup">
              <Button variant="outline" className="gap-2 border-[#F4C6B9] bg-white/80 text-[#4A2C2A] hover:bg-[#FFF0F4] hover:text-[#FF6B8A]">
                <Search className="h-4 w-4" />
                Check Status
              </Button>
            </Link>
            <Link href="/#active-recalls">
              <Button className="gap-2 bg-[#FF6B8A] text-white hover:bg-[#E75480]">
                <ArrowRight className="h-4 w-4" />
                Browse Active Recalls
              </Button>
            </Link>
          </div>
        </div>

        {!isAuthenticated && (
          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-[#F4C6B9] bg-white/90 p-4 text-sm text-[#7A4B45] sm:flex-row sm:items-center sm:justify-between">
            <p className="flex items-center gap-2 font-semibold text-[#4A2C2A]">
              <LockKeyhole className="h-4 w-4" />
              Guest mode keeps claims on this device.
            </p>
            <button
              type="button"
              onClick={() => openAuthDrawer('register')}
              className="inline-flex items-center gap-2 font-semibold text-[#FF6B8A] transition-colors hover:text-[#E75480]"
            >
              <UserRoundPlus className="h-4 w-4" />
              Create an account for cross-device access
            </button>
          </div>
        )}
      </div>

      {claimsList.length > 0 ? (
        <div className="grid gap-3">
          {claimsList.map((claim) => (
            <Link
              key={claim.id}
              href={`${detailBasePath}/${encodeURIComponent(claim.claimNumber)}`}
              className="group block rounded-[14px] border border-[#E9DDD4] bg-white p-4 transition-all hover:-translate-y-[1px] hover:border-[#F4C6B9] hover:shadow-card sm:p-5"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="font-mono text-sm font-bold text-text-primary transition-colors group-hover:text-brand-teal">
                      {claim.claimNumber}
                    </span>
                    <StatusBadge variant={claim.status} />
                  </div>
                  <p className="text-sm font-medium text-text-secondary">{claim.campaignTitle || 'Unknown Campaign'}</p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-text-tertiary">
                    <span>Submitted: {new Date(claim.submittedAt).toLocaleDateString('en-US')}</span>
                    <span>Evidence: {claim.evidenceCount} file{claim.evidenceCount !== 1 ? 's' : ''}</span>
                    {claim.resolutionDate && (
                      <span>Resolved: {new Date(claim.resolutionDate).toLocaleDateString('en-US')}</span>
                    )}
                  </div>
                </div>
                <ArrowRight className="h-5 w-5 shrink-0 text-text-tertiary transition-colors group-hover:text-brand-teal" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-[14px] border border-[#F4C6B9] bg-white p-8 text-center shadow-card sm:p-10">
          <ClipboardList className="mx-auto mb-3 h-10 w-10 text-[#B46B78]" />
          <h3 className="mb-1 text-base font-semibold text-text-primary">{emptyTitle}</h3>
          <p className="mx-auto mb-5 max-w-lg text-sm leading-relaxed text-text-secondary">{emptyDescription}</p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/lookup">
              <Button variant="outline" className="border-[#F4C6B9] text-[#4A2C2A] hover:bg-[#FFF0F4] hover:text-[#FF6B8A]">
                Check Existing Claim
              </Button>
            </Link>
            <Link href="/register">
              <Button className="bg-[#FF6B8A] text-black hover:bg-[#E75480]">
                Create Account
              </Button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

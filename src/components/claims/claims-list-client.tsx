'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowRight, ClipboardList, LockKeyhole, Search, UserRoundPlus } from 'lucide-react';
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
    return () => { cancelled = true; };
  }, [user?.token]);

  const claimsList = claims ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="label-eyebrow text-brand">Claim Center</p>
          <h1 className="mt-2 text-[28px] leading-tight font-bold text-foreground">
            {title}
          </h1>
          <p className="mt-1 text-secondary">
            {claimsList.length} claim{claimsList.length !== 1 ? 's' : ''} available. Review the latest status, evidence count, and resolution path from one place.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/lookup" className="btn-outline">
            <Search className="h-4 w-4" />
            Check Status
          </Link>
          <Link href="/#active-recalls" className="btn-brand">
            Browse Active Recalls
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Guest notice */}
      {!isAuthenticated && (
        <div className="card-surface p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <LockKeyhole className="h-4 w-4 text-secondary" />
            Guest mode keeps claims on this device.
          </p>
          <button
            type="button"
            onClick={() => openAuthDrawer('register')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
          >
            <UserRoundPlus className="h-4 w-4" />
            Create an account for cross-device access
          </button>
        </div>
      )}

      {/* Claims list */}
      {claimsList.length > 0 ? (
        <div className="space-y-2">
          {claimsList.map((claim) => (
            <Link
              key={claim.id}
              href={`${detailBasePath}/${encodeURIComponent(claim.claimNumber)}`}
              className="card-surface p-4 sm:p-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between group hover:border-foreground/30"
            >
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-bold text-foreground group-hover:text-brand transition-colors">
                    {claim.claimNumber}
                  </span>
                  <StatusBadge variant={claim.status} />
                </div>
                <p className="text-sm font-medium text-secondary">
                  {claim.campaignTitle || 'Unknown Campaign'}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-secondary">
                  <span>Submitted: {new Date(claim.submittedAt).toLocaleDateString('en-US')}</span>
                  <span>Evidence: {claim.evidenceCount} file{claim.evidenceCount !== 1 ? 's' : ''}</span>
                  {claim.resolutionDate && (
                    <span>Resolved: {new Date(claim.resolutionDate).toLocaleDateString('en-US')}</span>
                  )}
                </div>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-secondary group-hover:text-brand transition-colors" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="card-surface p-10 text-center">
          <ClipboardList className="mx-auto mb-3 h-10 w-10 text-secondary" />
          <h3 className="text-base font-semibold text-foreground mb-1">{emptyTitle}</h3>
          <p className="mx-auto mb-5 max-w-lg text-sm text-secondary leading-relaxed">
            {emptyDescription}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/lookup" className="btn-outline">Check Existing Claim</Link>
            <Link href="/" className="btn-brand">Browse Recalls</Link>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { ArrowLeft, FileText, LockKeyhole, Package, UserRoundPlus, Wallet } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { useAuth } from '@/lib/auth-context';
import { getClaimDetailForViewer } from '@/lib/claim-access';
import type { ClaimLookupPayload } from '@/types/claims';

interface ClaimDetailClientProps {
  claimNumber: string;
  backHref: string;
  backLabel: string;
}

export function ClaimDetailClient({ claimNumber, backHref, backLabel }: ClaimDetailClientProps) {
  const { user, isAuthenticated, openAuthDrawer } = useAuth();
  const [detail, setDetail] = useState<ClaimLookupPayload | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    void getClaimDetailForViewer(claimNumber, user?.token).then((nextDetail) => {
      if (!cancelled) setDetail(nextDetail);
    });
    return () => { cancelled = true; };
  }, [claimNumber, user?.token]);

  if (detail === undefined) return null;
  if (!detail) notFound();

  const claim = detail.claim;

  return (
    <div className="space-y-6">
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      {/* Header */}
      <div className="card-surface p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-mono text-xl font-bold text-foreground">{claim.claimNumber}</h1>
              <StatusBadge variant={claim.status} />
            </div>
            <p className="text-sm text-secondary">
              Submitted {new Date(claim.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {detail.campaignTitle || claim.campaignTitle}
            </p>
          </div>

          {!isAuthenticated && (
            <div className="max-w-sm p-4 rounded-md bg-surface-dim text-sm">
              <p className="flex items-center gap-2 font-semibold text-foreground">
                <LockKeyhole className="h-4 w-4" />
                This guest view only works on this device after lookup.
              </p>
              <button
                type="button"
                onClick={() => openAuthDrawer('register')}
                className="mt-2 inline-flex items-center gap-2 font-semibold text-brand hover:underline"
              >
                <UserRoundPlus className="h-4 w-4" />
                Sign up to keep claims synced everywhere
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Product */}
        <div className="card-surface p-6">
          <h2 className="text-base font-bold text-foreground pb-3 border-b border-border mb-4">Product Information</h2>
          <p className="text-sm font-semibold text-foreground">{detail.productName || claim.productName}</p>
          <div className="mt-3 space-y-1.5 text-xs text-secondary">
            <p>Lot: <span className="font-mono font-semibold text-foreground">{claim.lotCode || 'N/A'}</span></p>
            <p>Date: <span className="font-mono font-semibold text-foreground">{claim.dateCode || 'N/A'}</span></p>
          </div>
          {claim.campaignSlug && (
            <Link
              href={`/recalls/${claim.campaignSlug}`}
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
            >
              View recall details →
            </Link>
          )}
        </div>

        {/* Remedy */}
        <div className="card-surface p-6">
          <h2 className="text-base font-bold text-foreground pb-3 border-b border-border mb-4">Remedy Details</h2>
          <div className="flex items-center gap-2 mb-3">
            {claim.remedyType === 'refund' ? (
              <Wallet className="h-4 w-4 text-foreground" />
            ) : (
              <Package className="h-4 w-4 text-foreground" />
            )}
            <span className="inline-flex items-center rounded-md bg-surface-dim px-2 py-0.5 text-xs font-semibold text-foreground">
              {detail.remedyType === 'refund' ? 'Refund' : 'Replacement'}
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {detail.remedyTitle || claim.remedyTitle}
          </p>
          {detail.refundAmount && (
            <p className="mt-2 text-base font-bold text-foreground">
              Compensation: <span className="text-brand">${detail.refundAmount.toFixed(2)}</span>
            </p>
          )}
        </div>
      </div>

      {/* Evidence */}
      <div className="card-surface p-6">
        <h2 className="text-base font-bold text-foreground pb-3 border-b border-border mb-4">
          Submitted Evidence ({claim.evidenceCount} file{claim.evidenceCount !== 1 ? 's' : ''})
        </h2>
        {claim.evidenceCount > 0 ? (
          <div className="flex items-center gap-3 p-3 rounded-md bg-surface-dim">
            <FileText className="h-5 w-5 shrink-0 text-foreground" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {claim.evidenceCount} evidence file{claim.evidenceCount !== 1 ? 's' : ''} submitted
              </p>
              <p className="text-xs text-secondary mt-0.5">
                Submitted with claim on {new Date(claim.submittedAt).toLocaleDateString('en-US')}
              </p>
            </div>
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-secondary">No evidence files submitted yet</p>
        )}
      </div>
    </div>
  );
}

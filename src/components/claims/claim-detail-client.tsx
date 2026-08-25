'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { ArrowLeft, FileText, LockKeyhole, Package, UserRoundPlus, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    return () => {
      cancelled = true;
    };
  }, [claimNumber, user?.token]);

  if (detail === undefined) return null;
  if (!detail) notFound();
  if (!detail) return null;

  const claim = detail.claim;

  return (
    <div className="space-y-6">
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary">
        <ArrowLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-3">
            <h1 className="font-mono text-xl font-bold text-text-primary">{claim.claimNumber}</h1>
            <StatusBadge variant={claim.status} />
          </div>
          <p className="text-sm text-text-secondary">
            Submitted {new Date(claim.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
          <p className="mt-2 text-sm text-text-secondary">{detail.campaignTitle || claim.campaignTitle}</p>
        </div>

        {!isAuthenticated && (
          <div className="max-w-sm rounded-md border border-[#F4C6B9] bg-[#FFF7F2] px-4 py-3 text-sm text-[#7A4B45]">
            <p className="flex items-center gap-2 font-semibold text-[#4A2C2A]">
              <LockKeyhole className="h-4 w-4" />
              This guest view only works on this device after lookup.
            </p>
            <button type="button" onClick={() => openAuthDrawer('register')} className="mt-2 inline-flex items-center gap-2 font-semibold text-[#FF6B8A] transition-colors hover:text-[#E75480]">
              <UserRoundPlus className="h-4 w-4" />
              Sign up to keep claims synced everywhere
            </button>
          </div>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold text-text-primary">{detail.productName || claim.productName}</p>
            <p className="font-mono text-xs text-text-secondary">Lot: {claim.lotCode || 'N/A'}</p>
            <p className="font-mono text-xs text-text-secondary">Date: {claim.dateCode || 'N/A'}</p>
            {claim.campaignSlug && <Link href={`/recalls/${claim.campaignSlug}`} className="mt-2 inline-block text-xs text-brand-teal hover:underline">View recall details →</Link>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Remedy Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {claim.remedyType === 'refund' ? <Wallet className="h-4 w-4 text-brand-teal" /> : <Package className="h-4 w-4 text-brand-teal" />}
                <Badge variant="outline">{detail.remedyType === 'refund' ? 'Refund' : 'Replacement'}</Badge>
              </div>
              <p className="text-sm font-semibold text-text-primary">{detail.remedyTitle || claim.remedyTitle}</p>
              {detail.refundAmount && <p className="text-sm font-bold text-brand-teal">Compensation: ${detail.refundAmount.toFixed(2)}</p>}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Submitted Evidence ({claim.evidenceCount} file{claim.evidenceCount !== 1 ? 's' : ''})</CardTitle>
        </CardHeader>
        <CardContent>
          {claim.evidenceCount > 0 ? (
            <div className="flex items-center gap-3 rounded-lg border bg-surface-secondary p-3">
              <FileText className="h-5 w-5 shrink-0 text-text-tertiary" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary">{claim.evidenceCount} evidence file{claim.evidenceCount !== 1 ? 's' : ''} submitted</p>
                <p className="text-xs text-text-tertiary">Submitted with claim on {new Date(claim.submittedAt).toLocaleDateString('en-US')}</p>
              </div>
            </div>
          ) : (
            <p className="py-4 text-center text-sm text-text-tertiary">No evidence files submitted yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

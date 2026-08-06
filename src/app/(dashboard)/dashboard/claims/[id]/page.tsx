'use client';

// ============================================================
// KOI Recall Platform — Claim Detail (Dashboard)
// ============================================================

import { use } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  Clock,
  Circle,
  Package,
  Wallet,
  FileText,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { useAuth } from '@/lib/auth-context';
import { getClaimByNumber } from '@/data/mock-claims';
import { mockCampaigns } from '@/data/mock-recalls';
import { ClaimStatus, RemedyType } from '@/types';
import { cn } from '@/lib/utils';

const PIPELINE_STAGES = [
  { status: ClaimStatus.SUBMITTED, label: 'Submitted', icon: Circle },
  { status: ClaimStatus.UNDER_REVIEW, label: 'Under Review', icon: Clock },
  { status: ClaimStatus.VERIFIED, label: 'Verified', icon: Check },
  { status: ClaimStatus.REMEDY_ISSUED, label: 'Remedy Issued', icon: Package },
  { status: ClaimStatus.RESOLVED, label: 'Resolved', icon: ShieldCheck },
];

const STATUS_ORDER = [ClaimStatus.SUBMITTED, ClaimStatus.UNDER_REVIEW, ClaimStatus.VERIFIED, ClaimStatus.REMEDY_ISSUED, ClaimStatus.RESOLVED];

const REMEDY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  [RemedyType.REFUND]: Wallet,
  [RemedyType.REPLACEMENT]: Package,
  [RemedyType.REPAIR]: Package,
  [RemedyType.VOUCHER]: Package,
  [RemedyType.DISPOSAL_INSTRUCTION]: AlertTriangle,
};

const REMEDY_DESCRIPTIONS: Record<string, string> = {
  refund: 'Refund',
  replacement: 'Replacement',
  repair: 'Repair',
  disposal_instruction: 'Disposal Instructions',
  voucher: 'Store Credit',
};

export default function ClaimDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { user } = useAuth();
  const claim = getClaimByNumber(id);

  if (!claim) notFound();
  // Verify ownership
  if (user && claim.consumerEmail !== user.email) notFound();

  const campaign = mockCampaigns.find((c) => c.id === claim.campaignId);
  const product = campaign?.affectedProducts.find((p) => p.id === claim.productId);
  const remedy = campaign?.remedies.find((r) => r.id === claim.remedyId);

  const currentStatusIdx = STATUS_ORDER.indexOf(claim.status);
  const isRejected = claim.status === ClaimStatus.REJECTED;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/dashboard/claims"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Claims
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-xl font-bold text-text-primary font-mono">{claim.claimNumber}</h1>
          <StatusBadge variant={claim.status as 'submitted' | 'under_review' | 'verified' | 'remedy_issued' | 'resolved' | 'rejected'} />
        </div>
        <p className="text-sm text-text-secondary">
          Submitted {new Date(claim.submittedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          {claim.resolutionDate && ` · Resolved ${new Date(claim.resolutionDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
        </p>
      </div>

      {/* Progress Pipeline */}
      {!isRejected && (
        <Card>
          <CardHeader><CardTitle className="text-base">Processing Status</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-start">
              {PIPELINE_STAGES.map((stage, i) => {
                const stageIdx = STATUS_ORDER.indexOf(stage.status);
                const isComplete = stageIdx < currentStatusIdx;
                const isCurrent = stage.status === claim.status;
                const isFuture = stageIdx > currentStatusIdx;
                const StatusIcon = stage.icon;

                return (
                  <div key={stage.status} className="flex-1 flex flex-col items-center relative">
                    {i > 0 && (
                      <div className={cn(
                        'absolute right-1/2 top-4.5 h-0.5',
                        isComplete || (i <= currentStatusIdx) ? 'w-full bg-blade-resolution' : 'w-full bg-border'
                      )} style={{ zIndex: 0 }} />
                    )}
                    <div className={cn(
                      'relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors',
                      isComplete && 'bg-blade-resolution border-blade-resolution text-white',
                      isCurrent && 'bg-brand-teal border-brand-teal text-white',
                      isFuture && 'bg-surface-elevated border-border text-text-tertiary'
                    )}>
                      <StatusIcon className="h-4 w-4" />
                    </div>
                    <p className={cn(
                      'mt-2 text-xs font-semibold text-center',
                      isFuture ? 'text-text-tertiary' : 'text-text-primary'
                    )}>
                      {stage.label}
                    </p>
                    {isComplete && <p className="text-[10px] text-text-tertiary mt-0.5">Complete</p>}
                    {isCurrent && <p className="text-[10px] text-brand-teal font-semibold mt-0.5">Current</p>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejected Notice */}
      {isRejected && (
        <Card className="border-red-200 bg-red-50/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700">Claim Rejected</p>
                <p className="text-sm text-red-600/80 mt-1">
                  This claim was not approved after review. Please contact customer support if you have questions.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product + Remedy Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Product Information</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {product ? (
              <>
                <p className="text-sm font-semibold text-text-primary">{product.name}</p>
                <p className="text-xs text-text-secondary">Brand: {product.brandName}</p>
                <p className="text-xs text-text-secondary font-mono">Model: {product.modelNumber}</p>
                <p className="text-xs text-text-secondary font-mono">UPC: {product.upc}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {product.retailerNames.map((r) => (
                    <Badge key={r} variant="secondary" className="text-xs">{r}</Badge>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-text-tertiary">Product information unavailable</p>
            )}
            {campaign && (
              <Link href={`/recalls/${campaign.slug}`} className="inline-block text-xs text-brand-teal hover:underline mt-2">
                View recall details →
              </Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">Remedy Details</CardTitle></CardHeader>
          <CardContent>
            {remedy ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {(() => {
                    const IconComp = REMEDY_ICONS[remedy.type] || Package;
                    return <IconComp className="h-4 w-4 text-brand-teal" />;
                  })()}
                  <Badge variant="outline">{REMEDY_DESCRIPTIONS[remedy.type] || remedy.type}</Badge>
                </div>
                <p className="text-sm font-semibold text-text-primary">{remedy.title}</p>
                <p className="text-sm text-text-secondary">{remedy.description}</p>
                {remedy.compensationAmount && (
                  <p className="text-sm font-bold text-brand-teal">
                    Compensation: ${remedy.compensationAmount.toFixed(2)}
                  </p>
                )}
                <p className="text-xs text-text-tertiary">
                  Deadline: {new Date(remedy.deadline).toLocaleDateString('en-US')}
                </p>
              </div>
            ) : (
              <p className="text-sm text-text-tertiary">Remedy information unavailable</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Evidence */}
      <Card>
        <CardHeader><CardTitle className="text-base">Submitted Evidence ({claim.evidence.length} file{claim.evidence.length !== 1 ? 's' : ''})</CardTitle></CardHeader>
        <CardContent>
          {claim.evidence.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-2">
              {claim.evidence.map((ev) => (
                <div key={ev.id} className="flex items-center gap-3 p-3 rounded-lg bg-surface-secondary border">
                  <FileText className="h-5 w-5 text-text-tertiary shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary truncate">{ev.fileName}</p>
                    <p className="text-xs text-text-tertiary">{new Date(ev.uploadedAt).toLocaleDateString('en-US')}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-tertiary text-center py-4">No evidence files submitted yet</p>
          )}
        </CardContent>
      </Card>

      {/* Estimated Resolution */}
      {!isRejected && claim.status !== ClaimStatus.RESOLVED && (
        <div className="rounded-xl bg-brand-teal/5 border border-brand-teal/20 p-5 flex items-center gap-4">
          <Clock className="h-6 w-6 text-brand-teal shrink-0" />
          <div>
            <p className="text-sm font-semibold text-text-primary">Estimated Completion</p>
            <p className="text-xl font-bold text-brand-teal mt-0.5">Aug 8, 2025</p>
            <p className="text-xs text-text-tertiary mt-1">Processing time may vary based on evidence verification</p>
          </div>
        </div>
      )}
    </div>
  );
}

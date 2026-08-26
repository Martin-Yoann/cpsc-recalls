'use client';

import { Check, Clock, Circle } from 'lucide-react';
import { ClaimStatus } from '@/types';
import type { ConsumerClaim } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface LookupResultProps {
  claim: ConsumerClaim;
  campaignTitle?: string;
  productName?: string;
  remedyTitle?: string;
  remedyType?: string;
  refundAmount?: number;
}

const PIPELINE = [
  { status: ClaimStatus.SUBMITTED, label: 'Submitted' },
  { status: ClaimStatus.UNDER_REVIEW, label: 'Under Review' },
  { status: ClaimStatus.VERIFIED, label: 'Confirmed' },
  { status: ClaimStatus.REMEDY_ISSUED, label: 'Remedy Issued' },
  { status: ClaimStatus.RESOLVED, label: 'Resolved' },
];
const ORDER = [ClaimStatus.SUBMITTED, ClaimStatus.UNDER_REVIEW, ClaimStatus.VERIFIED, ClaimStatus.REMEDY_ISSUED, ClaimStatus.RESOLVED];

const STATUS_META: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  submitted:     { label: 'Submitted',     bg: 'bg-info/10',    color: 'text-info',     dot: 'bg-info' },
  under_review:  { label: 'Under Review',  bg: 'bg-info/10',    color: 'text-info',     dot: 'bg-info' },
  verified:      { label: 'Confirmed',     bg: 'bg-success/10', color: 'text-success', dot: 'bg-success' },
  remedy_issued: { label: 'Remedy Issued', bg: 'bg-success/10', color: 'text-success', dot: 'bg-success' },
  resolved:      { label: 'Resolved',      bg: 'bg-success/10', color: 'text-success', dot: 'bg-success' },
  rejected:      { label: 'Not Eligible',  bg: 'bg-brand-light', color: 'text-brand', dot: 'bg-brand' },
};

const REMEDY_LABELS: Record<string, string> = {
  refund: 'Refund', replacement: 'Replacement', repair: 'Repair',
  voucher: 'Store Credit', disposal_instruction: 'Disposal',
};

export function LookupResult({
  claim, campaignTitle, productName, remedyTitle, remedyType, refundAmount,
}: LookupResultProps) {
  const idx = ORDER.indexOf(claim.status as ClaimStatus);
  const meta = STATUS_META[claim.status] || STATUS_META.submitted;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-5 border-b border-border">
        <span className={cn('mb-3 inline-flex items-center gap-1.5 rounded-md border border-current/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-wide', meta.bg, meta.color)}>
          <span className={cn('h-1.5 w-1.5 rounded-full', meta.dot)} />
          {meta.label}
        </span>
        <h2 className="font-mono text-[24px] font-bold leading-tight tracking-[-0.02em] text-foreground">
          {claim.claimNumber}
        </h2>
        <p className="mt-1 text-sm text-secondary">{campaignTitle}</p>
      </div>

      {/* Timeline */}
      <div className="card-surface p-5">
        <h3 className="text-sm font-bold text-foreground mb-5">Processing Status</h3>
        <div className="flex items-start">
          {PIPELINE.map((stage, i) => {
            const done = i < idx;
            const cur = i === idx;
            const future = i > idx;

            return (
              <div key={stage.status} className="flex-1 flex items-start min-w-0 first:flex-none last:flex-none">
                {i > 0 && (
                  <div className={cn('h-[2px] flex-1 mt-[13px]', done ? 'bg-foreground' : 'bg-border')} />
                )}
                <div className="flex flex-col items-center min-w-0 shrink-0">
                  <div className={cn(
                    'flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full',
                    cur || done
                      ? 'bg-foreground text-white'
                      : 'border-2 border-border bg-white text-transparent',
                  )}>
                    {done ? <Check className="h-3 w-3" /> :
                     cur  ? <Clock className="h-3 w-3" /> :
                     <Circle className="h-3 w-3" />}
                  </div>
                  <p className={cn(
                    'mt-2 px-1 text-center text-[10px] font-semibold leading-tight',
                    cur ? 'text-foreground' : future ? 'text-secondary opacity-50' : 'text-foreground',
                  )}>
                    {stage.label}
                  </p>
                </div>
                {i < PIPELINE.length - 1 && (
                  <div className={cn('h-[2px] flex-1 mt-[13px]', done ? 'bg-foreground' : 'bg-border')} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="card-surface p-4">
          <p className="label-eyebrow">Product</p>
          <p className="mt-2 text-sm font-bold leading-snug text-foreground">
            {productName || '—'}
          </p>
        </div>

        <div className="card-surface p-4">
          <p className="label-eyebrow">Remedy</p>
          {remedyType && (
            <span className="mt-2 inline-block rounded-md bg-surface-dim px-2 py-0.5 text-[10px] font-semibold text-foreground">
              {REMEDY_LABELS[remedyType] || remedyType}
            </span>
          )}
          <p className="mt-2 text-sm font-bold leading-snug text-foreground">
            {remedyTitle || '—'}
          </p>
          {refundAmount != null && refundAmount > 0 && (
            <p className="mt-1 text-sm font-bold text-foreground">${refundAmount.toFixed(2)}</p>
          )}
        </div>

        <div className="card-surface p-4">
          <p className="label-eyebrow">Timeline</p>
          <div className="mt-2 space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-secondary">Submitted</span>
              <span className="font-semibold text-foreground">
                {new Date(claim.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">Updated</span>
              <span className="font-semibold text-foreground">
                {new Date(claim.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-md border border-border bg-surface-dim p-3 text-center text-xs text-secondary">
        Want more details?{' '}
        <Link href="/" className="font-semibold text-brand hover:underline">Return home</Link>
      </div>
    </div>
  );
}

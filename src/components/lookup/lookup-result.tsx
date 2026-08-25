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
  submitted:    { label: 'Submitted',     bg: 'bg-blue-50',             color: 'text-trust-blue',       dot: 'bg-trust-blue' },
  under_review: { label: 'Under Review',  bg: 'bg-blue-50',             color: 'text-trust-blue',       dot: 'bg-trust-blue' },
  verified:     { label: 'Confirmed',     bg: 'bg-blade-resolution-light', color: 'text-blade-resolution', dot: 'bg-blade-resolution' },
  remedy_issued:{ label: 'Remedy Issued', bg: 'bg-blade-resolution-light', color: 'text-blade-resolution', dot: 'bg-blade-resolution' },
  resolved:     { label: 'Resolved',      bg: 'bg-blade-resolution-light', color: 'text-blade-resolution', dot: 'bg-blade-resolution' },
  rejected:     { label: 'Not Eligible',  bg: 'bg-red-50',              color: 'text-status-rejected',  dot: 'bg-status-rejected' },
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
    <div className="animate-in fade-in duration-300">

      {/* ── Header ── */}
      <div className="mb-8 border-b border-border pb-6">
        <span className={cn('mb-3 inline-flex items-center gap-1.5 rounded-sm border border-current/15 px-2 py-1 text-[11px] font-bold uppercase tracking-wide', meta.bg, meta.color)}>
          <span className={cn('status-dot', meta.dot)} />
          {meta.label}
        </span>
        <h2 className="mb-1.5 font-mono text-[28px] font-semibold leading-tight tracking-[-0.02em] text-text-primary md:text-[36px]">
          {claim.claimNumber}
        </h2>
        <p className="text-sm text-text-secondary">{campaignTitle}</p>
      </div>

      {/* ── Timeline — horizontal on wide, vertical on narrow ── */}
      <div className="mb-8 rounded-md border bg-surface-elevated p-5">
        <h3 className="mb-4 text-sm font-semibold text-text-primary">Processing Status</h3>

        <div className="flex flex-nowrap gap-0 items-start">
          {PIPELINE.map((stage, i) => {
            const done = i < idx;
            const cur = i === idx;
            const future = i > idx;

            return (
              <div key={stage.status} className="flex-1 flex items-start gap-0 min-w-0">
                {/* Connector line behind dot */}
                {i > 0 && (
                  <div className={cn('mt-[13px] h-[2px] flex-1 -mr-1', done ? 'bg-blade-resolution' : 'bg-border')} />
                )}
                {/* Dot + label */}
                <div className="flex min-w-0 shrink-0 flex-col items-center">
                  <div className={cn(
                    'flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-full',
                    cur || done
                      ? 'bg-blade-resolution text-white ring-4 ring-blade-resolution/15'
                      : 'border-2 border-border bg-surface-primary text-transparent',
                  )}>
                    {done ? <Check className="h-[13px] w-[13px]" /> :
                     cur  ? <Clock className="h-[13px] w-[13px]" /> :
                     <Circle className="h-[13px] w-[13px]" />}
                  </div>
                  <p className={cn(
                    'px-1 text-center text-[10px] font-semibold leading-tight',
                    cur ? 'mt-1.5 text-blade-resolution' : future ? 'mt-1.5 text-text-tertiary opacity-40' : 'mt-1.5 text-text-primary',
                  )}>
                    {stage.label}
                  </p>
                </div>
                {/* Connector */}
                {i < PIPELINE.length - 1 && (
                  <div className={cn('mt-[13px] h-[2px] flex-1 -ml-1', done ? 'bg-blade-resolution' : 'bg-border')} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom row: product + remedy + timeline ── */}
      <div className="grid sm:grid-cols-3 gap-4">

        {/* Product */}
        <div className="rounded-md border border-t-[3px] border-t-blade-resolution bg-surface-elevated p-4">
          <p className="mb-1.5 text-xs text-text-tertiary">Product</p>
          <p className="text-sm font-bold leading-snug text-text-primary">
            {productName || '—'}
          </p>
        </div>

        {/* Remedy */}
        <div className="rounded-md border border-t-[3px] border-t-blade-resolution bg-surface-elevated p-4">
          <p className="mb-1.5 text-xs text-text-tertiary">Remedy</p>
          {remedyType && (
            <span className="mb-1 inline-block rounded-sm bg-surface-secondary px-2 py-0.5 text-[10px] font-medium text-text-secondary">
              {REMEDY_LABELS[remedyType] || remedyType}
            </span>
          )}
          <p className="text-sm font-bold leading-snug text-text-primary">
            {remedyTitle || '—'}
          </p>
          {refundAmount != null && refundAmount > 0 && (
            <p className="mt-1 text-xs font-bold text-blade-resolution">${refundAmount.toFixed(2)}</p>
          )}
        </div>

        {/* Timeline */}
        <div className="rounded-md border bg-surface-elevated p-4">
          <p className="mb-3 text-xs text-text-tertiary">Timeline</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-text-tertiary">Submitted</span>
              <span className="font-medium text-text-primary">
                {new Date(claim.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-text-tertiary">Updated</span>
              <span className="font-medium text-text-primary">
                {new Date(claim.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ── CTA ── */}
      <div className="mt-5 rounded-md border border-border bg-surface-secondary p-3 text-center text-xs text-text-secondary">
        Want more details?{' '}
        <Link href="/register" className="font-bold text-brand-teal hover:underline">Create Account</Link>
        {' '}or{' '}
        <Link href="/login" className="font-bold text-brand-teal hover:underline">Sign In</Link>
      </div>

    </div>
  );
}

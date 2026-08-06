'use client';

import { Check, Clock, Circle } from 'lucide-react';
import { ClaimStatus } from '@/types';
import type { Claim } from '@/types';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface LookupResultProps {
  claim: Claim & { consumerPhone?: string };
  campaignTitle?: string;
  productName?: string;
  remedyTitle?: string;
  remedyType?: string;
  refundAmount?: number;
}

const PIPELINE = [
  { status: ClaimStatus.SUBMITTED, label: 'Submitted' },
  { status: ClaimStatus.UNDER_REVIEW, label: 'Under Review' },
  { status: ClaimStatus.VERIFIED, label: 'Verified' },
  { status: ClaimStatus.REMEDY_ISSUED, label: 'Remedy Issued' },
  { status: ClaimStatus.RESOLVED, label: 'Resolved' },
];
const ORDER = [ClaimStatus.SUBMITTED, ClaimStatus.UNDER_REVIEW, ClaimStatus.VERIFIED, ClaimStatus.REMEDY_ISSUED, ClaimStatus.RESOLVED];

const STATUS_META: Record<string, { label: string; bg: string; color: string }> = {
  submitted:    { label: 'Submitted',     bg: '#eaedff', color: '#404944' },
  under_review: { label: 'Under Review',  bg: '#eaedff', color: '#404944' },
  verified:     { label: 'Verified',      bg: '#6cf8bb', color: '#00714d' },
  remedy_issued:{ label: 'Remedy Issued', bg: '#6cf8bb', color: '#00714d' },
  resolved:     { label: 'Resolved',      bg: '#6cf8bb', color: '#00714d' },
  rejected:     { label: 'Rejected',      bg: '#ffdad6', color: '#93000a' },
};

const REMEDY_LABELS: Record<string, string> = {
  refund: 'Refund', replacement: 'Replacement', repair: 'Repair',
  voucher: 'Store Credit', disposal_instruction: 'Disposal',
};

export function LookupResult({
  claim, campaignTitle, productName, remedyTitle, remedyType, refundAmount,
}: LookupResultProps) {
  const idx = ORDER.indexOf(claim.status);
  const meta = STATUS_META[claim.status] || STATUS_META.submitted;

  return (
    <div className="animate-in fade-in duration-300">

      {/* ── Header ── */}
      <div className="mb-8 pb-6" style={{ borderBottom: '1px solid rgba(0,53,39,0.08)' }}>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-3"
          style={{ background: meta.bg, color: meta.color }}>
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
          {meta.label}
        </span>
        <h2 className="text-[28px] md:text-[36px] font-semibold leading-tight tracking-[-0.02em] mb-1.5" style={{ color: '#003527' }}>
          {claim.claimNumber}
        </h2>
        <p className="text-sm" style={{ color: '#707974' }}>{campaignTitle}</p>
      </div>

      {/* ── Timeline — horizontal on wide, vertical on narrow ── */}
      <div className="mb-8 p-5 rounded-xl"
        style={{ background: '#ffffff', border: '1px solid rgba(0,53,39,0.08)' }}>
        <h3 className="text-sm font-semibold mb-4" style={{ color: '#003527' }}>Processing Status</h3>

        <div className="flex flex-nowrap gap-0 items-start">
          {PIPELINE.map((stage, i) => {
            const done = i < idx;
            const cur = i === idx;
            const future = i > idx;

            return (
              <div key={stage.status} className="flex-1 flex items-start gap-0 min-w-0">
                {/* Connector line behind dot */}
                {i > 0 && (
                  <div className="h-[2px] flex-1 mt-[13px] -mr-1"
                    style={{ background: done ? '#006c49' : 'rgba(0,53,39,0.08)' }} />
                )}
                {/* Dot + label */}
                <div className="flex flex-col items-center shrink-0" style={{ minWidth: 0 }}>
                  <div className={cn(
                    'w-[26px] h-[26px] rounded-full flex items-center justify-center shrink-0',
                  )}
                  style={cur || done
                    ? { background: '#006c49', color: '#ffffff', boxShadow: '0 0 0 3px rgba(0,108,73,0.12)' }
                    : { background: '#faf8ff', border: '2px solid #bfc9c3' }
                  }>
                    {done ? <Check className="h-[13px] w-[13px]" /> :
                     cur  ? <Clock className="h-[13px] w-[13px]" /> :
                     <Circle className="h-[13px] w-[13px]" style={{ color: 'transparent' }} />}
                  </div>
                  <p className={cn(
                    'text-[10px] font-semibold text-center mt-1.5 leading-tight px-1',
                    future ? 'opacity-40' : ''
                  )}
                  style={{ color: cur ? '#006c49' : future ? '#707974' : '#003527' }}>
                    {stage.label}
                  </p>
                </div>
                {/* Connector */}
                {i < PIPELINE.length - 1 && (
                  <div className="h-[2px] flex-1 mt-[13px] -ml-1"
                    style={{ background: done ? '#006c49' : 'rgba(0,53,39,0.08)' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom row: product + remedy + timeline ── */}
      <div className="grid sm:grid-cols-3 gap-4">

        {/* Product */}
        <div className="p-4 rounded-xl border-t-[3px]"
          style={{ background: '#ffffff', borderColor: 'rgba(0,53,39,0.08)', borderTopColor: '#006c49' }}>
          <p className="text-xs mb-1.5" style={{ color: '#707974' }}>Product</p>
          <p className="text-sm font-bold leading-snug" style={{ color: '#003527' }}>
            {productName || '—'}
          </p>
        </div>

        {/* Remedy */}
        <div className="p-4 rounded-xl border-t-[3px]"
          style={{ background: '#ffffff', borderColor: 'rgba(0,53,39,0.08)', borderTopColor: '#006c49' }}>
          <p className="text-xs mb-1.5" style={{ color: '#707974' }}>Remedy</p>
          {remedyType && (
            <span className="inline-block px-2 py-0.5 rounded text-[10px] font-medium mb-1"
              style={{ background: '#f2f3ff', color: '#404944' }}>
              {REMEDY_LABELS[remedyType] || remedyType}
            </span>
          )}
          <p className="text-sm font-bold leading-snug" style={{ color: '#003527' }}>
            {remedyTitle || '—'}
          </p>
          {refundAmount != null && refundAmount > 0 && (
            <p className="text-xs font-bold mt-1" style={{ color: '#006c49' }}>${refundAmount.toFixed(2)}</p>
          )}
        </div>

        {/* Timeline */}
        <div className="p-4 rounded-xl"
          style={{ background: '#ffffff', border: '1px solid rgba(0,53,39,0.08)' }}>
          <p className="text-xs mb-3" style={{ color: '#707974' }}>Timeline</p>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span style={{ color: '#707974' }}>Submitted</span>
              <span className="font-medium" style={{ color: '#003527' }}>
                {new Date(claim.submittedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: '#707974' }}>Updated</span>
              <span className="font-medium" style={{ color: '#003527' }}>
                {new Date(claim.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ── CTA ── */}
      <div className="mt-5 p-3 rounded-lg text-center text-xs"
        style={{ background: '#e2e7ff', color: '#404944' }}>
        Want more details?{' '}
        <Link href="/register" className="font-bold hover:underline" style={{ color: '#006c49' }}>Create Account</Link>
        {' '}or{' '}
        <Link href="/login" className="font-bold hover:underline" style={{ color: '#006c49' }}>Sign In</Link>
      </div>

    </div>
  );
}

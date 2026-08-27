'use client';

import { CheckCircle2, Clock, FileQuestion, LockKeyhole } from 'lucide-react';
import type { CaseStatusLookupOk } from '@/lib/api-client';
import { cn } from '@/lib/utils';
import Link from 'next/link';

/**
 * Renders the case-status-lookups whitelist verbatim (design §7/§8). Labels
 * come from the API (`publicStatusLabel`); color here keys off the enum value
 * for accessibility only and never reinterprets an internal status.
 */
const PUBLIC_STATUS_TONE: Record<string, { chip: string; icon: 'progress' | 'done' | 'blocked' }> = {
  received:               { chip: 'bg-[#ecf5ff] text-[#409eff]',         icon: 'progress' },
  in_review:              { chip: 'bg-[#ecf5ff] text-[#409eff]',         icon: 'progress' },
  action_required:        { chip: 'bg-[#fdf6ec] text-[#b88230]',         icon: 'progress' },
  resolution_approved:    { chip: 'bg-[#f0f9eb] text-[#529b2e]',         icon: 'done' },
  resolution_in_progress: { chip: 'bg-[#f0f9eb] text-[#529b2e]',         icon: 'done' },
  completed:              { chip: 'bg-[#f0f9eb] text-[#529b2e]',         icon: 'done' },
  not_approved:           { chip: 'bg-[#f4f4f5] text-[#606266]',         icon: 'blocked' },
  closed:                 { chip: 'bg-[#f4f4f5] text-[#606266]',         icon: 'blocked' },
};

function StatusIcon({ tone }: { tone: PublicStatusTone }) {
  if (!tone || tone.icon === 'done') return <CheckCircle2 className="h-3.5 w-3.5" />;
  if (tone.icon === 'blocked') return <FileQuestion className="h-3.5 w-3.5" />;
  return <Clock className="h-3.5 w-3.5" />;
}

type PublicStatusTone = (typeof PUBLIC_STATUS_TONE)[string];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function LookupResult({ result }: { result: CaseStatusLookupOk }) {
  const tone = PUBLIC_STATUS_TONE[result.publicStatus];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-5 border-b border-slate-200">
        <span className={cn('mb-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wide', tone?.chip ?? 'bg-slate-100 text-slate-600')}>
          <StatusIcon tone={tone} />
          {result.publicStatusLabel}
        </span>
        <h2 className="font-mono text-[24px] font-bold leading-tight tracking-[-0.02em] text-slate-900">
          {result.caseReference}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{result.campaignTitle}</p>
      </div>

      {/* Next action */}
      <div className="rounded-[4px] border border-slate-200 bg-slate-50 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Next step</p>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{result.consumerNextAction}</p>
      </div>

      {/* Whitelisted facts only */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="card-surface p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Requested resolution</p>
          <p className="mt-2 text-sm font-bold text-slate-900">
            {result.requestedResolution ?? '—'}
          </p>
        </div>
        {result.approvedResolution != null && (
          <div className="card-surface p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Approved resolution</p>
            <p className="mt-2 text-sm font-bold text-slate-900">{result.approvedResolution}</p>
          </div>
        )}
        <div className="card-surface p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Last updated</p>
          <p className="mt-2 text-sm font-bold text-slate-900">
            {formatDate(result.lastUpdatedAt)}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-md border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-500">
        <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
        <p>Only minimal case facts are shown here. Internal handling details are never published.</p>
      </div>

      <div className="text-center">
        <Link href="/" className="text-[13px] font-semibold text-[#163A5F] hover:text-[#1D4F7A] transition-colors">
          Return home
        </Link>
      </div>
    </div>
  );
}

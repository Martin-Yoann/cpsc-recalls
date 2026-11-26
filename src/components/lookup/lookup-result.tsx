'use client';
import { useI18n } from "@/lib/i18n/provider";


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

const STATUS_MESSAGES: Record<string, string> = {"received":"case.status.received","in_review":"case.status.inReview","action_required":"case.status.actionRequired","resolution_approved":"case.status.resolutionApproved","resolution_in_progress":"case.status.resolutionInProgress","completed":"case.status.completed","not_approved":"case.status.notApproved","closed":"case.status.closed"};
const ACTION_MESSAGES: Record<string, string> = {"received":"ui.we.have.received.your.claim.and.will.46cff4","in_review":"ui.your.claim.is.under.review.no.action.369832","action_required":"ui.additional.information.is.required.please.follow.the.306e2a","resolution_approved":"ui.your.resolution.has.been.approved.we.will.672914","resolution_in_progress":"ui.your.resolution.is.being.processed.no.action.73ca58","completed":"ui.this.case.is.complete.thank.you.for.c5f348","not_approved":"ui.your.claim.was.not.approved.please.check.b716e8","closed":"ui.this.case.is.closed.contact.support.if.3c88d6"};
const RESOLUTION_MESSAGES: Record<string,string> = { refund: 'ui.refund.b51118', replacement: 'ui.replacement.91b5c0' };

function StatusIcon({ tone }: { tone: PublicStatusTone }) {
  if (!tone || tone.icon === 'done') return <CheckCircle2 className="h-3.5 w-3.5" />;
  if (tone.icon === 'blocked') return <FileQuestion className="h-3.5 w-3.5" />;
  return <Clock className="h-3.5 w-3.5" />;
}

type PublicStatusTone = (typeof PUBLIC_STATUS_TONE)[string];

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function LookupResult({ result }: { result: CaseStatusLookupOk }) {
  const { t, locale } = useI18n();
  const tone = PUBLIC_STATUS_TONE[result.publicStatus];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="pb-5 border-b border-slate-200">
        <span className={cn('mb-3 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wide', tone?.chip ?? 'bg-slate-100 text-slate-600')}>
          <StatusIcon tone={tone} />
          {t(STATUS_MESSAGES[result.publicStatus] ?? result.publicStatusLabel)}
        </span>
        <h2 className="font-mono text-[24px] font-bold leading-tight tracking-[-0.02em] text-slate-900">
          {result.caseReference}
        </h2>
        <p className="mt-1 text-sm text-slate-500">{result.campaignTitle}</p>
      </div>

      {/* Next action */}
      <div className="rounded-[4px] border border-slate-200 bg-slate-50 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t("ui.next.step.5500ee")}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-slate-700">{t(ACTION_MESSAGES[result.publicStatus] ?? result.consumerNextAction)}</p>
      </div>

      {/* Whitelisted facts only */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="card-surface p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t("ui.requested.resolution.e08fcf")}</p>
          <p className="mt-2 text-sm font-bold text-slate-900">
            {t(RESOLUTION_MESSAGES[result.requestedResolutionCode ?? ''] ?? result.requestedResolution ?? '—')}
          </p>
        </div>
        {result.approvedResolution != null && (
          <div className="card-surface p-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t("ui.approved.resolution.329e82")}</p>
            <p className="mt-2 text-sm font-bold text-slate-900">{t(RESOLUTION_MESSAGES[result.approvedResolutionCode ?? ''] ?? result.approvedResolution)}</p>
          </div>
        )}
        <div className="card-surface p-4">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{t("ui.last.updated.583c9e")}</p>
          <p className="mt-2 text-sm font-bold text-slate-900">
            {formatDate(result.lastUpdatedAt, locale)}
          </p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-md border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-500">
        <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
        <p>{t("ui.only.minimal.case.facts.are.shown.here.5d2af0")}</p>
      </div>

      <div className="text-center">
        <Link href="/" className="text-[13px] font-semibold text-[#163A5F] hover:text-[#1D4F7A] transition-colors">
          {t("ui.return.home.a3d070")}</Link>
      </div>
    </div>
  );
}

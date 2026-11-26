"use client";
import { useI18n } from "@/lib/i18n/provider";


// ============================================================
// KOI Recall Platform — Semantic Status Badge
// ============================================================

import { cn } from '@/lib/utils';

type StatusVariant =
  | 'open'
  | 'reviewing'
  | 'verified'
  | 'resolved'
  | 'rejected'
  | 'active'
  | 'pending'
  | 'closed'
  | 'expanded'
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'action_required'
  | 'remedy_issued';

const STATUS_COLORS: Record<StatusVariant, { dot: string; text: string; bg: string }> = {
  open: { dot: 'bg-status-open', text: 'text-status-open', bg: 'bg-orange-50' },
  reviewing: { dot: 'bg-status-reviewing', text: 'text-status-reviewing', bg: 'bg-blue-50' },
  verified: { dot: 'bg-status-verified', text: 'text-status-verified', bg: 'bg-emerald-50' },
  resolved: { dot: 'bg-status-resolved', text: 'text-status-resolved', bg: 'bg-emerald-50' },
  rejected: { dot: 'bg-status-rejected', text: 'text-status-rejected', bg: 'bg-red-50' },
  active: { dot: 'bg-status-open', text: 'text-status-open', bg: 'bg-orange-50' },
  pending: { dot: 'bg-status-reviewing', text: 'text-status-reviewing', bg: 'bg-blue-50' },
  closed: { dot: 'bg-text-tertiary', text: 'text-text-tertiary', bg: 'bg-slate-50' },
  expanded: { dot: 'bg-status-rejected', text: 'text-status-rejected', bg: 'bg-red-50' },
  draft: { dot: 'bg-text-tertiary', text: 'text-text-tertiary', bg: 'bg-slate-50' },
  submitted: { dot: 'bg-status-reviewing', text: 'text-status-reviewing', bg: 'bg-blue-50' },
  under_review: { dot: 'bg-status-reviewing', text: 'text-status-reviewing', bg: 'bg-blue-50' },
  action_required: { dot: 'bg-status-open', text: 'text-status-open', bg: 'bg-orange-50' },
  remedy_issued: { dot: 'bg-status-verified', text: 'text-status-verified', bg: 'bg-emerald-50' },
};

const STATUS_LABELS: Record<StatusVariant, string> = {
  open: "ui.open.cf9b77",
  reviewing: "ui.reviewing.166ea8",
  verified: "ui.verified.aed3b8",
  resolved: "ui.resolved.d999ae",
  rejected: "ui.rejected.27eeb7",
  active: "ui.active.a733b8",
  pending: "ui.pending.96f608",
  closed: "ui.closed.88d86b",
  expanded: "ui.expanded.6d1704",
  draft: "ui.draft.23d33e",
  submitted: "ui.submitted.2e0035",
  under_review: "ui.under.review.18afed",
  action_required: "ui.action.required.4cd4f4",
  remedy_issued: "ui.remedy.issued.c74da1",
};

interface StatusBadgeProps {
  variant: StatusVariant;
  label?: string;
  className?: string;
}

export function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  const { t } = useI18n();
  const colors = STATUS_COLORS[variant];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border border-current/15 px-2 py-1 text-[11px] font-bold uppercase tracking-wide',
        colors.bg,
        colors.text,
        className
      )}
    >
      <span className={cn('status-dot', colors.dot)} aria-hidden="true" />
      {t(label || STATUS_LABELS[variant])}
    </span>
  );
}

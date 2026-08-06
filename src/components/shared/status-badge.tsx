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
  | 'remedy_issued';

const STATUS_COLORS: Record<StatusVariant, { dot: string; text: string; bg: string }> = {
  open: { dot: 'bg-status-open', text: 'text-status-open', bg: 'bg-orange-50' },
  reviewing: { dot: 'bg-status-reviewing', text: 'text-status-reviewing', bg: 'bg-blue-50' },
  verified: { dot: 'bg-status-verified', text: 'text-status-verified', bg: 'bg-green-50' },
  resolved: { dot: 'bg-status-resolved', text: 'text-status-resolved', bg: 'bg-green-50' },
  rejected: { dot: 'bg-status-rejected', text: 'text-status-rejected', bg: 'bg-red-50' },
  active: { dot: 'bg-status-open', text: 'text-status-open', bg: 'bg-orange-50' },
  pending: { dot: 'bg-status-reviewing', text: 'text-status-reviewing', bg: 'bg-blue-50' },
  closed: { dot: 'bg-text-tertiary', text: 'text-text-tertiary', bg: 'bg-slate-50' },
  expanded: { dot: 'bg-status-rejected', text: 'text-status-rejected', bg: 'bg-red-50' },
  draft: { dot: 'bg-text-tertiary', text: 'text-text-tertiary', bg: 'bg-slate-50' },
  submitted: { dot: 'bg-status-reviewing', text: 'text-status-reviewing', bg: 'bg-blue-50' },
  under_review: { dot: 'bg-status-reviewing', text: 'text-status-reviewing', bg: 'bg-blue-50' },
  remedy_issued: { dot: 'bg-status-verified', text: 'text-status-verified', bg: 'bg-green-50' },
};

const STATUS_LABELS: Record<StatusVariant, string> = {
  open: 'Open',
  reviewing: 'Reviewing',
  verified: 'Verified',
  resolved: 'Resolved',
  rejected: 'Rejected',
  active: 'Active',
  pending: 'Pending',
  closed: 'Closed',
  expanded: 'Expanded',
  draft: 'Draft',
  submitted: 'Submitted',
  under_review: 'Under Review',
  remedy_issued: 'Remedy Issued',
};

interface StatusBadgeProps {
  variant: StatusVariant;
  label?: string;
  className?: string;
}

export function StatusBadge({ variant, label, className }: StatusBadgeProps) {
  const colors = STATUS_COLORS[variant];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium',
        colors.bg,
        colors.text,
        className
      )}
    >
      <span className={cn('status-dot', colors.dot)} aria-hidden="true" />
      {label || STATUS_LABELS[variant]}
    </span>
  );
}

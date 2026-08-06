// ============================================================
// KOI Recall Platform — Recall Card v3.0
// Clean, warm cards with risk accent
// ============================================================

import Link from 'next/link';
import { AlertTriangle, Factory, ArrowRight } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import type { Campaign } from '@/types';
import { RiskLevel } from '@/types';
import { cn } from '@/lib/utils';

interface RecallCardProps {
  campaign: Campaign;
}

const RISK_CONFIG: Record<string, { accent: string; bg: string; text: string; label: string }> = {
  [RiskLevel.CRITICAL]: {
    accent: 'border-l-red-500',
    bg: 'bg-red-50',
    text: 'text-red-700',
    label: 'CRITICAL',
  },
  [RiskLevel.HIGH]: {
    accent: 'border-l-blade-safety',
    bg: 'bg-orange-50',
    text: 'text-orange-700',
    label: 'HIGH RISK',
  },
  [RiskLevel.MODERATE]: {
    accent: 'border-l-amber-500',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    label: 'MODERATE',
  },
  [RiskLevel.LOW]: {
    accent: 'border-l-blue-500',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    label: 'LOW',
  },
};

export function RecallCard({ campaign }: RecallCardProps) {
  const risk = RISK_CONFIG[campaign.riskLevel];

  return (
    <Link href={`/recalls/${campaign.slug}`} className="block group h-full cursor-pointer">
      <article
        className={cn(
          'h-full rounded-2xl border-l-[3px] bg-surface-elevated border shadow-sm transition-all duration-300 flex flex-col card-lift',
          risk.accent
        )}
      >
        <div className="p-5 flex-1 flex flex-col">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <StatusBadge variant={campaign.status} />
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider',
                risk.bg,
                risk.text
              )}
            >
              <AlertTriangle className="h-3 w-3" />
              {risk.label}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-sm font-bold text-text-primary leading-snug line-clamp-2 mb-2 group-hover:text-brand-teal transition-colors duration-250">
            {campaign.title}
          </h3>

          {/* Summary */}
          <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed flex-1">
            {campaign.summary}
          </p>

          {/* Data chips row */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-border">
            <span className="data-chip text-[11px]">
              <Factory className="h-3 w-3" />
              {campaign.manufacturerName.length > 16
                ? campaign.manufacturerName.slice(0, 16) + '…'
                : campaign.manufacturerName}
            </span>
            <span className="data-chip text-[11px] font-mono">
              CPSC #{campaign.cpscNumber}
            </span>
          </div>

          {/* Units & link */}
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-text-tertiary">
              {campaign.estimatedUnits.toLocaleString()} units affected
            </span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-teal opacity-0 group-hover:opacity-100 transition-opacity duration-250">
              View Recall
              <ArrowRight className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

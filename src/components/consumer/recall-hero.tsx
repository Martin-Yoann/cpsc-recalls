// ============================================================
// KOI Recall Platform — Recall Hero v3.0
// ============================================================

import { Calendar, Factory, Hash, AlertTriangle, Package } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import type { Campaign } from '@/types';
import { RiskLevel } from '@/types';
import { cn } from '@/lib/utils';

interface RecallHeroProps {
  campaign: Campaign;
}

const RISK_CONFIG: Record<string, { bg: string; text: string; border: string; label: string }> = {
  [RiskLevel.CRITICAL]: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'CRITICAL RISK' },
  [RiskLevel.HIGH]: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'HIGH RISK' },
  [RiskLevel.MODERATE]: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'MODERATE RISK' },
  [RiskLevel.LOW]: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'LOW RISK' },
};

export function RecallHero({ campaign }: RecallHeroProps) {
  const risk = RISK_CONFIG[campaign.riskLevel];

  return (
    <section className="bg-surface-primary border-b">
      <div className="container-content py-12 sm:py-14">
        {/* Badge row */}
        <div className="flex flex-wrap items-center gap-2 mb-5">
          <StatusBadge variant={campaign.status} />
          <span
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-bold uppercase tracking-wider',
              risk.bg, risk.text, risk.border
            )}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            {risk.label}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-fluid-4xl text-text-primary max-w-3xl">
          {campaign.title}
        </h1>

        {/* Summary */}
        <p className="mt-4 text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl">
          {campaign.summary}
        </p>

        {/* Data chips row */}
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <span className="data-chip">
            <Hash className="h-3.5 w-3.5" />
            CPSC #{campaign.cpscNumber}
          </span>
          <span className="data-chip">
            <Calendar className="h-3.5 w-3.5" />
            Recalled {campaign.recallDate}
          </span>
          <span className="data-chip">
            <Factory className="h-3.5 w-3.5" />
            {campaign.manufacturerName}
          </span>
          <span className="data-chip">
            <Package className="h-3.5 w-3.5" />
            {campaign.estimatedUnits.toLocaleString()} units
          </span>
        </div>

        {/* Hazard description */}
        <div className="mt-8 p-5 rounded-xl blade-accent-safety bg-blade-safety-light/60">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blade-safety">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blade-safety-text/60 mb-1">
                Hazard Description
              </p>
              <p className="text-sm text-text-primary leading-relaxed">
                {campaign.hazardDescription}
              </p>
              <p className="text-sm font-semibold text-blade-safety mt-3">
                <strong>Immediate action:</strong> {campaign.instructions}
              </p>
            </div>
          </div>
        </div>

        {/* Product image if available */}
        {campaign.images[0] && (
          <div className="mt-8 p-4 rounded-xl bg-surface-secondary border flex justify-center">
            <img
              src={campaign.images[0]}
              alt={campaign.title}
              className="max-h-64 object-contain mix-blend-multiply"
            />
          </div>
        )}
      </div>
    </section>
  );
}

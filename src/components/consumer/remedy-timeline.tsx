'use client';

// ============================================================
// KOI Recall Platform — Remedy Timeline v2.0
// Blade 3: Actionable remedy selection pipeline
// ============================================================

import { Wallet, Package, Wrench, Trash2, Ticket, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Remedy } from '@/types';
import { RemedyType } from '@/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface RemedyTimelineProps {
  remedies: Remedy[];
}

const REMEDY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  [RemedyType.REFUND]: Wallet,
  [RemedyType.REPLACEMENT]: Package,
  [RemedyType.REPAIR]: Wrench,
  [RemedyType.DISPOSAL_INSTRUCTION]: Trash2,
  [RemedyType.VOUCHER]: Ticket,
};

const REMEDY_COLORS: Record<string, string> = {
  [RemedyType.REFUND]: 'border-l-green-500 bg-green-50/50',
  [RemedyType.REPLACEMENT]: 'border-l-blue-500 bg-blue-50/50',
  [RemedyType.REPAIR]: 'border-l-amber-500 bg-amber-50/50',
  [RemedyType.DISPOSAL_INSTRUCTION]: 'border-l-slate-400 bg-slate-50/50',
  [RemedyType.VOUCHER]: 'border-l-purple-500 bg-purple-50/50',
};

export function RemedyTimeline({ remedies }: RemedyTimelineProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <div className="rounded-2xl border bg-surface-elevated shadow-card overflow-hidden blade-accent-resolution">
      <div className="px-6 py-5 border-b bg-blade-resolution-light/30">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blade-resolution">
            <CheckCircle2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">Available Remedies</h3>
            <p className="text-xs text-text-secondary">Select the option that best fits your situation</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-3">
          {remedies.map((remedy, index) => {
            const Icon = REMEDY_ICONS[remedy.type] || Package;
            const isSelected = selected === remedy.id;
            const isFirst = index === 0 && !selected;

            return (
              <div
                key={remedy.id}
                className={cn(
                  'rounded-xl border-l-4 p-5 transition-all duration-250 cursor-pointer',
                  isSelected
                    ? 'border-l-blade-resolution bg-blade-resolution-light/30 shadow-card ring-1 ring-blade-resolution-medium/30'
                    : `${REMEDY_COLORS[remedy.type] || 'border-l-slate-200'} hover:shadow-card hover:bg-surface-secondary/50`
                )}
                onClick={() => setSelected(remedy.id)}
              >
                <div className="flex items-start gap-4">
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border',
                    isSelected ? 'bg-blade-resolution border-blade-resolution text-white' : 'bg-surface-elevated border-border'
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1.5">
                      <h4 className="text-sm font-bold text-text-primary">{remedy.title}</h4>
                      {isFirst && !selected && (
                        <Badge className="bg-blade-resolution-light text-blade-resolution text-[10px] font-semibold border-blade-resolution-medium/30">
                          Recommended
                        </Badge>
                      )}
                      {isSelected && (
                        <Badge className="bg-blade-resolution text-white text-[10px] font-semibold">
                          Selected
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-text-secondary leading-relaxed mb-3">{remedy.description}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-tertiary">
                      <span className="font-medium">Deadline: {remedy.deadline}</span>
                      {remedy.compensationAmount && (
                        <span className="font-mono font-bold text-blade-resolution">${remedy.compensationAmount.toFixed(2)}</span>
                      )}
                      {remedy.requiresEvidence && (
                        <span className="text-text-tertiary">· Evidence Required</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <Button
            className="bg-blade-resolution hover:bg-blade-resolution-dark text-white font-semibold"
            disabled={!selected}
          >
            Continue with Selected Remedy
          </Button>
        </div>
      </div>
    </div>
  );
}

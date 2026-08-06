'use client';

// ============================================================
// KOI Recall Platform — Case Status Tracker v2.0
// Blade 3: Pipeline-style claim status with operational data
// ============================================================

import { Check, Clock, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CaseStatusTrackerProps {
  campaignId?: string;
}

const PIPELINE = [
  { id: 'submitted', label: 'Submitted', date: 'Jul 18, 2025', blade: 'verification' },
  { id: 'under_review', label: 'Under Review', date: 'Jul 19, 2025', blade: 'verification' },
  { id: 'verified', label: 'Verified', date: null, blade: 'verification' },
  { id: 'remedy_issued', label: 'Remedy Issued', date: null, blade: 'resolution' },
  { id: 'resolved', label: 'Resolved', date: null, blade: 'resolution' },
];

const CURRENT_STAGE = 'under_review';

export function CaseStatusTracker({ campaignId }: CaseStatusTrackerProps) {
  const currentIdx = PIPELINE.findIndex((s) => s.id === CURRENT_STAGE);

  return (
    <div className="rounded-2xl border bg-surface-elevated shadow-card overflow-hidden blade-accent-resolution">
      <div className="px-5 py-4 border-b bg-blade-resolution-light/30">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-text-primary">Case Status</h3>
            <p className="text-xs text-text-secondary">Track your claim resolution</p>
          </div>
          <span className="text-[10px] font-bold text-blade-resolution uppercase tracking-widest bg-blade-resolution-light px-2 py-1 rounded">
            In Progress
          </span>
        </div>
      </div>

      <div className="p-5">
        {/* Reference chip */}
        <div className="rounded-lg bg-surface-secondary border p-3 mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-text-tertiary uppercase tracking-wider font-semibold">Claim Reference</p>
            <p className="text-sm font-mono font-bold text-text-primary">KOI-2507-1842</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-text-tertiary">Est. Resolution</p>
            <p className="text-sm font-semibold text-blade-resolution">Aug 8, 2025</p>
          </div>
        </div>

        {/* Pipeline */}
        <div className="space-y-0">
          {PIPELINE.map((stage, i) => {
            const isComplete = i < currentIdx;
            const isCurrent = i === currentIdx;
            const isFuture = i > currentIdx;

            return (
              <div key={stage.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className={cn('w-0.5 h-2.5', i === 0 ? 'bg-transparent' : isComplete ? 'bg-blade-resolution' : 'bg-border')} />
                  <div className={cn(
                    'relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors duration-250',
                    isComplete && 'bg-blade-resolution border-blade-resolution text-white',
                    isCurrent && 'bg-blade-verification border-blade-verification text-white',
                    isFuture && 'bg-surface-elevated border-border text-text-tertiary'
                  )}>
                    {isComplete ? <Check className="h-3.5 w-3.5" /> :
                     isCurrent ? <Clock className="h-3.5 w-3.5" /> :
                     <Circle className="h-2 w-2" />}
                  </div>
                  <div className={cn('w-0.5 flex-1 min-h-6', i === PIPELINE.length - 1 ? 'bg-transparent' : isComplete ? 'bg-blade-resolution' : 'bg-border')} />
                </div>
                <div className="pb-4 pt-0.5">
                  <p className={cn('text-sm font-semibold', isFuture ? 'text-text-tertiary' : 'text-text-primary')}>
                    {stage.label}
                  </p>
                  <p className="text-xs text-text-tertiary mt-0.5">
                    {stage.date || (isFuture ? 'Pending' : '')}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

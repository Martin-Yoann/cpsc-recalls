'use client';

// ============================================================
// KOI Recall Platform — Remedy Options v4.1
// Header-free — blade badge already labels this section
// ============================================================

import { Wallet, Package, Wrench, Trash2, Ticket } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Remedy } from '@/types';
import { RemedyType } from '@/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import Link from 'next/link';

interface RemedyOptionsProps { remedies: Remedy[]; }

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  [RemedyType.REFUND]: Wallet,
  [RemedyType.REPLACEMENT]: Package,
  [RemedyType.REPAIR]: Wrench,
  [RemedyType.DISPOSAL_INSTRUCTION]: Trash2,
  [RemedyType.VOUCHER]: Ticket,
};

export function RemedyOptions({ remedies }: RemedyOptionsProps) {
  const [sel, setSel] = useState<string | null>(null);

  return (
    <div className="w-full h-full rounded-xl border bg-surface-elevated overflow-hidden flex flex-col">
      <div className="p-3 sm:p-4 space-y-2">
        {remedies.map((r) => {
          const Icon = ICONS[r.type] || Package;
          const active = sel === r.id;
          return (
            <button key={r.id} type="button" onClick={() => setSel(r.id)}
              className={cn('w-full text-left rounded-lg border p-3 transition-all cursor-pointer btn-press',
                active ? 'border-blade-resolution bg-blade-resolution-light/30 ring-1 ring-blade-resolution/20' : 'border-border bg-surface-elevated hover:border-blade-resolution/30 hover:bg-surface-secondary')}>
              <div className="flex items-center gap-3">
                <div className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-md border transition-colors',
                  active ? 'bg-blade-resolution border-blade-resolution text-white' : 'bg-surface-secondary border-border')}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-text-primary">{r.title}</p>
                    {active && <Badge className="bg-blade-resolution text-white text-[10px] py-0">Selected</Badge>}
                  </div>
                  <p className="text-xs text-text-secondary mt-0.5 line-clamp-1">{r.description}</p>
                  {r.compensationAmount && (
                    <p className="text-xs font-bold text-blade-resolution mt-0.5">Up to ${r.compensationAmount.toFixed(2)}</p>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {sel && (
        <div className="px-3 sm:px-4 pb-3 sm:pb-4">
          <Link href="/login">
            <Button className="w-full h-9 bg-blade-resolution hover:bg-blade-resolution-dark text-white font-semibold text-sm cursor-pointer btn-lift btn-press">
              Continue with Selected Remedy
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

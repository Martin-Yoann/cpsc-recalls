'use client';

// ============================================================
// KOI Recall Platform — Remedy Options v4.4
// Header-free — blade badge already labels this section
// ============================================================

import { Check, Wallet, Package, Wrench, Trash2, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Remedy } from '@/types';
import { RemedyType } from '@/types';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface RemedyOptionsProps {
  remedies: Remedy[];
  onSelect?: (remedy: Remedy) => void;
  busyRemedyId?: string | null;
}

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  [RemedyType.REFUND]: Wallet,
  [RemedyType.REPLACEMENT]: Package,
  [RemedyType.REPAIR]: Wrench,
  [RemedyType.DISPOSAL_INSTRUCTION]: Trash2,
  [RemedyType.VOUCHER]: Ticket,
};

export function RemedyOptions({ remedies, onSelect, busyRemedyId }: RemedyOptionsProps) {
  const [sel, setSel] = useState<string | null>(null);

  const chosen = sel ? remedies.find((r) => r.id === sel) : undefined;

  return (
    <div className="overflow-hidden rounded-md border border-[#dcdfe6] bg-white">
      {/* 头部：Available resolutions */}
      <div className="border-b border-[#ebeef5] bg-[#f5f7fa] px-4 py-3 sm:px-5">
        <p className="text-sm font-semibold text-[#303133]">Available resolutions</p>
        <p className="mt-1 text-xs leading-5 text-[#909399]">
          Choose one option to start your claim draft.
        </p>
      </div>

      {/* 内容区域：整体居中 */}
      <div className="flex flex-col items-center px-4 py-6 sm:px-5 sm:py-8">
        {/* 两个选项卡片：flex 居中 + 等宽 */}
        <div className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:gap-4">
          {remedies.map((r) => {
            const Icon = ICONS[r.type] || Package;
            const active = sel === r.id;
            return (
              <button
                key={r.id}
                type="button"
                aria-pressed={active}
                onClick={() => setSel(r.id)}
                className={cn(
                  'group relative flex-1 cursor-pointer rounded-md border p-5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#409eff]/25',
                  active
                    ? 'border-[#409eff] bg-[#ecf5ff] ring-1 ring-[#409eff]/25'
                    : 'border-[#dcdfe6] bg-white hover:border-[#409eff]'
                )}
              >
                {/* ===== 关键改动：内容整体居中 ===== */}
                <div className="flex flex-col items-center gap-3">
                  {/* 图标：居中 */}
                  <div
                    className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-full border transition-colors',
                      active
                        ? 'border-[#409eff] bg-[#409eff] text-white'
                        : 'border-[#dcdfe6] bg-[#f5f7fa] text-[#606266] group-hover:border-[#a0cfff] group-hover:text-[#409eff]'
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  {/* 文字区域：居中 */}
                  <div className="flex flex-col items-center">
                    <p className="text-sm font-semibold text-[#303133]">{r.title}</p>
                    <p className="mt-1 text-xs leading-5 text-[#606266]">{r.description}</p>
                    {r.compensationAmount && (
                      <p className="mt-2 text-sm font-semibold text-[#409eff]">
                        Up to ${r.compensationAmount.toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
                {/* 选中对勾：保持右上角 */}
                <span
                  className={cn(
                    'absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full border',
                    active
                      ? 'border-[#409eff] bg-[#409eff] text-white'
                      : 'border-[#dcdfe6] bg-white'
                  )}
                >
                  {active && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                </span>
              </button>
            );
          })}
        </div>

        {/* 底部按钮 */}
        {sel && chosen && (
          <div className="mt-6 flex w-full max-w-2xl justify-center">
            <Button
              className="h-10 w-full px-5 text-sm font-medium sm:w-auto sm:min-w-[200px]"
              style={{
                backgroundColor:
                  busyRemedyId === chosen.id ? '#a0cfff' : '#409eff',
                borderColor: busyRemedyId === chosen.id ? '#a0cfff' : '#409eff',
                color: '#fff',
                opacity: 1,
              }}
              onClick={() => onSelect?.(chosen)}
              disabled={busyRemedyId === chosen.id}
            >
              {busyRemedyId === chosen.id
                ? 'Preparing draft...'
                : 'Continue with Selected Remedy'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
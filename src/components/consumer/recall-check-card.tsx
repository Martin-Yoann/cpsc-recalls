'use client';

// ============================================================
// KOI Recall Platform — Recall Check Card v4.1
// Header-free — blade badge already labels this section
// ============================================================

import { useState } from 'react';
import { ShieldCheck, XCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { checkProduct, isPhase1NotImplemented } from '@/lib/api-client';
import type { Campaign, Product } from '@/types';

interface RecallCheckCardProps { campaign: Campaign; product: Product; }

export function RecallCheckCard({ campaign, product }: RecallCheckCardProps) {
  const [shape, setShape] = useState('');
  const [flavor, setFlavor] = useState('');
  const [lotCode, setLotCode] = useState('');
  const [dateCode, setDateCode] = useState('');
  const [result, setResult] = useState<'match' | 'no-match' | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isChecking, setIsChecking] = useState(false);

  const shapes = product?.shapes || [];
  const flavors = product?.flavors || [];
  const lots = campaign.affectedLots || [];
  const dates = campaign.dateCodes || [];

  const handleCheck = async () => {
    const e: Record<string, string> = {};
    if (!shape) e.shape = 'Select a shape';
    if (!flavor) e.flavor = 'Select a flavor';
    if (!lotCode.trim()) e.lotCode = 'Enter lot code';
    if (!dateCode.trim()) e.dateCode = 'Enter date code';
    setErrors(e);
    if (Object.keys(e).length) return;

    setIsChecking(true);

    // Phase 1: try API first, fall back to local matching on 501
    const apiResult = await checkProduct(campaign.slug, {
      shape, flavor, lotCode: lotCode.trim(), dateCode: dateCode.trim(),
    });

    if (apiResult.ok) {
      setResult(apiResult.data.result === 'potential_match' ? 'match' : 'no-match');
    } else if (isPhase1NotImplemented(apiResult)) {
      // 501 — fall back to local matching
      const ok = lots.includes(lotCode.trim().toUpperCase())
        && dates.includes(dateCode.trim())
        && shapes.includes(shape)
        && flavors.includes(flavor);
      setResult(ok ? 'match' : 'no-match');
    } else {
      // Network error or other — still fall back to local
      const ok = lots.includes(lotCode.trim().toUpperCase())
        && dates.includes(dateCode.trim())
        && shapes.includes(shape)
        && flavors.includes(flavor);
      setResult(ok ? 'match' : 'no-match');
    }

    setIsChecking(false);
  };

  const reset = () => { setShape(''); setFlavor(''); setLotCode(''); setDateCode(''); setResult(null); setErrors({}); };

  return (
    <div className="w-full h-full rounded-xl border bg-surface-elevated overflow-hidden flex flex-col">
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center">
        {result === 'match' ? (
          <div className="text-center py-4 space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blade-resolution-light border border-blade-resolution-medium/30">
              <ShieldCheck className="h-6 w-6 text-blade-resolution" />
            </div>
            <h4 className="text-base font-bold text-blade-resolution">Product Is Affected</h4>
            <p className="text-sm text-text-secondary">Your product matches the recall scope.</p>
            <div className="inline-flex flex-wrap justify-center gap-x-5 gap-y-1 rounded-lg bg-surface-secondary border p-2.5 text-sm">
              <span><strong>Shape:</strong> {shape}</span>
              <span><strong>Flavor:</strong> {flavor}</span>
              <span><strong>Lot:</strong> <code className="font-mono text-blade-verification">{lotCode.toUpperCase()}</code></span>
              <span><strong>Date:</strong> <code className="font-mono text-blade-verification">{dateCode}</code></span>
            </div>
            <p className="text-xs text-text-tertiary">Scroll down to select a remedy.</p>
            <Button variant="outline" size="sm" onClick={reset}>Check Again</Button>
          </div>
        ) : result === 'no-match' ? (
          <div className="text-center py-4 space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 border border-amber-200">
              <XCircle className="h-6 w-6 text-amber-600" />
            </div>
            <h4 className="text-base font-bold text-amber-700">No Match Found</h4>
            <p className="text-sm text-text-secondary">Not in the affected scope for this recall.</p>
            <Button variant="outline" size="sm" onClick={reset}>Try Again</Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Candy Shape — full-width single row */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Candy Shape</Label>
              <div className="grid grid-cols-4 gap-1.5">
                {shapes.map((s) => (
                  <button key={s} type="button" onClick={() => { setShape(s); setErrors((e) => ({ ...e, shape: '' })); }}
                    className={cn('py-2.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer',
                      shape === s ? 'bg-blade-verification text-white border-blade-verification' : 'bg-surface-secondary border-border text-text-primary hover:border-blade-verification/30 hover:bg-blade-verification-light')}>
                    {s}
                  </button>
                ))}
              </div>
              {errors.shape && <p className="text-xs text-destructive">{errors.shape}</p>}
            </div>

            {/* Flavor — full-width single row */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Flavor</Label>
              <div className="grid grid-cols-2 gap-1.5">
                {flavors.map((f) => (
                  <button key={f} type="button" onClick={() => { setFlavor(f); setErrors((e) => ({ ...e, flavor: '' })); }}
                    className={cn('py-2.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer',
                      flavor === f ? 'bg-blade-verification text-white border-blade-verification' : 'bg-surface-secondary border-border text-text-primary hover:border-blade-verification/30 hover:bg-blade-verification-light')}>
                    {f}
                  </button>
                ))}
              </div>
              {errors.flavor && <p className="text-xs text-destructive">{errors.flavor}</p>}
            </div>

            {/* Lot + Date — same row */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="lot-code" className="text-xs font-semibold">Lot Code</Label>
                <Input id="lot-code" className="h-10 font-mono text-sm" placeholder="ML-0000-X"
                  value={lotCode} onChange={(e) => { setLotCode(e.target.value); setErrors((e) => ({ ...e, lotCode: '' })); }} />
                {errors.lotCode && <p className="text-xs text-destructive">{errors.lotCode}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="date-code" className="text-xs font-semibold">Date Code</Label>
                <Input id="date-code" className="h-10 font-mono text-sm" placeholder="MM/YYYY"
                  value={dateCode} onChange={(e) => { setDateCode(e.target.value); setErrors((e) => ({ ...e, dateCode: '' })); }} />
                {errors.dateCode && <p className="text-xs text-destructive">{errors.dateCode}</p>}
              </div>
            </div>

            <Button onClick={handleCheck} disabled={isChecking}
              className="w-full h-10 bg-blade-verification hover:bg-blade-verification-dark text-white font-semibold cursor-pointer btn-lift btn-press disabled:opacity-50">
              {isChecking ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" />Checking...</> : 'Check My Product'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

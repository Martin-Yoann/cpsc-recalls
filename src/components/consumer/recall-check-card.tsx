'use client';

// ============================================================
// KOI Recall Platform — Recall Check Card v6.0
// Legacy four-field check: shape/flavor + lot/date codes.
// All values are click-to-select from the campaign's own data,
// matching the backend mode=legacy contract.
// ============================================================

import { useState } from 'react';
import { ShieldCheck, XCircle, Loader2, AlertTriangle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { checkProduct } from '@/lib/api-client';
import type { Campaign, Product } from '@/types';

interface RecallCheckCardProps { campaign: Campaign; product: Product; }

type CheckResult = 'potential_match' | 'not_matched' | 'manual_review' | null;

export function RecallCheckCard({ campaign, product }: RecallCheckCardProps) {
  const [shape, setShape] = useState('');
  const [flavor, setFlavor] = useState('');
  const [lotCode, setLotCode] = useState('');
  const [dateCode, setDateCode] = useState('');
  const [result, setResult] = useState<CheckResult>(null);
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const shapes = product?.shapes || [];
  const flavors = product?.flavors || [];
  const lots = campaign?.affectedLots || [];
  const dates = campaign?.dateCodes || [];

  const handleCheck = async () => {
    if (!shape && !flavor && !lotCode && !dateCode) {
      setError('Select at least one field to check your product.');
      return;
    }
    setError('');
    setIsChecking(true);
    setApiError(null);

    const apiResult = await checkProduct(campaign.slug, {
      mode: 'legacy',
      ...(shape ? { shape } : {}),
      ...(flavor ? { flavor } : {}),
      ...(lotCode ? { lotCode } : {}),
      ...(dateCode ? { dateCode } : {}),
    });

    if (apiResult.ok) {
      setResult(apiResult.data.result);
    } else {
      setApiError(`Unable to verify. Please try again or contact support. Ref: ${apiResult.error.requestId?.slice(0, 8) || 'N/A'}`);
    }

    setIsChecking(false);
  };

  const reset = () => { setShape(''); setFlavor(''); setLotCode(''); setDateCode(''); setResult(null); setError(''); setApiError(null); };

  return (
    <div className="w-full h-full rounded-xl border bg-surface-elevated overflow-hidden flex flex-col">
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-center">
        {result === 'potential_match' ? (
          <div className="text-center py-4 space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blade-resolution-light border border-blade-resolution-medium/30">
              <ShieldCheck className="h-6 w-6 text-blade-resolution" />
            </div>
            <h4 className="text-base font-bold text-blade-resolution">Product Matched</h4>
            <p className="text-sm text-text-secondary">The identifiers you selected are listed in this recall scope.</p>
            <div className="inline-flex flex-wrap justify-center gap-x-5 gap-y-1 rounded-lg bg-surface-secondary border p-2.5 text-sm">
              {shape && <span><strong>Shape:</strong> {shape}</span>}
              {flavor && <span><strong>Flavor:</strong> {flavor}</span>}
              {lotCode && <span><strong>Lot:</strong> <code className="font-mono text-blade-verification">{lotCode}</code></span>}
              {dateCode && <span><strong>Date:</strong> <code className="font-mono text-blade-verification">{dateCode}</code></span>}
            </div>
            <p className="text-xs text-text-tertiary">
              This check is preliminary and is not a final eligibility decision.
            </p>
            <Button variant="outline" size="sm" onClick={reset}>Check Again</Button>
          </div>
        ) : result === 'not_matched' ? (
          <div className="text-center py-4 space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 border border-amber-200">
              <XCircle className="h-6 w-6 text-amber-600" />
            </div>
            <h4 className="text-base font-bold text-amber-700">No Automated Match</h4>
            <p className="text-sm text-text-secondary">
              The values you selected were not found in this recall scope. This does not confirm your product is safe — please try different selections or continue to manual review.
            </p>
            <Button variant="outline" size="sm" onClick={reset}>Try Again</Button>
          </div>
        ) : result === 'manual_review' ? (
          <div className="text-center py-4 space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blade-verification-light border border-blade-verification-medium/30">
              <AlertTriangle className="h-6 w-6 text-blade-verification" />
            </div>
            <h4 className="text-base font-bold text-blade-verification">Additional Review Needed</h4>
            <p className="text-sm text-text-secondary">
              We could not automatically confirm whether your product is affected. Your submission will be reviewed by our team.
            </p>
            <Button variant="outline" size="sm" onClick={reset}>Try Different Selections</Button>
          </div>
        ) : apiError ? (
          <div className="text-center py-4 space-y-3">
            <XCircle className="h-10 w-10 mx-auto text-red-500" />
            <p className="text-sm text-text-secondary">{apiError}</p>
            <Button variant="outline" size="sm" onClick={handleCheck}>Retry</Button>
          </div>
        ) : (
          <div className="space-y-5">
            {/* Candy Shape */}
            {shapes.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold">Candy Shape</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {shapes.map((s) => (
                    <button key={s} type="button" onClick={() => { setShape(shape === s ? '' : s); setError(''); }}
                      className={cn('py-2.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer',
                        shape === s ? 'bg-blade-verification text-white border-blade-verification' : 'bg-surface-secondary border-border text-text-primary hover:border-blade-verification/30 hover:bg-blade-verification-light')}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Flavor */}
            {flavors.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold">Flavor</p>
                <div className="grid grid-cols-2 gap-1.5">
                  {flavors.map((f) => (
                    <button key={f} type="button" onClick={() => { setFlavor(flavor === f ? '' : f); setError(''); }}
                      className={cn('py-2.5 rounded-lg border text-sm font-semibold transition-all cursor-pointer',
                        flavor === f ? 'bg-blade-verification text-white border-blade-verification' : 'bg-surface-secondary border-border text-text-primary hover:border-blade-verification/30 hover:bg-blade-verification-light')}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Lot Code */}
            {lots.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold">Affected Lot Code</p>
                <div className="flex flex-wrap gap-1.5">
                  {lots.map((lot) => (
                    <button key={lot} type="button" onClick={() => { setLotCode(lotCode === lot ? '' : lot); setError(''); }}
                      className={cn('px-3 py-2 rounded-lg border text-sm font-mono font-semibold transition-all cursor-pointer',
                        lotCode === lot ? 'bg-blade-verification text-white border-blade-verification' : 'bg-surface-secondary border-border text-text-primary hover:border-blade-verification/30 hover:bg-blade-verification-light')}>
                      {lot}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date Code */}
            {dates.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold">Date Code</p>
                <div className="flex flex-wrap gap-1.5">
                  {dates.map((d) => (
                    <button key={d} type="button" onClick={() => { setDateCode(dateCode === d ? '' : d); setError(''); }}
                      className={cn('px-3 py-2 rounded-lg border text-sm font-mono font-semibold transition-all cursor-pointer',
                        dateCode === d ? 'bg-blade-verification text-white border-blade-verification' : 'bg-surface-secondary border-border text-text-primary hover:border-blade-verification/30 hover:bg-blade-verification-light')}>
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Hint */}
            <div className="flex items-start gap-2 rounded-lg bg-surface-secondary border p-3">
              <Info className="h-4 w-4 text-text-tertiary shrink-0 mt-0.5" />
              <p className="text-xs text-text-tertiary leading-relaxed">
                Select the shape, flavor, lot code, and date code printed on your package. We&apos;ll check them against this recall scope.
              </p>
            </div>

            {error && <p className="text-xs text-destructive">{error}</p>}

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

'use client';

// ============================================================
// KOI Recall Platform — Recall Check Card v6.0
// Legacy four-field check: shape/flavor + lot/date codes.
// All values are click-to-select from the campaign's own data,
// matching the backend mode=legacy contract.
// ============================================================

import { useState } from 'react';
import { ShieldCheck, XCircle, Loader2, AlertTriangle, Info } from 'lucide-react';
import Select from 'react-tailwindcss-select';
import { Button } from '@/components/ui/button';
import { checkProduct } from '@/lib/api-client';
import type { Campaign, Product } from '@/types';

interface RecallCheckCardProps { campaign: Campaign; product: Product; }

type CheckResult = 'potential_match' | 'not_matched' | 'manual_review' | null;
type SelectOption = { value: string; label: string };

const selectClassNames = {
  menuButton: () => 'flex h-10 w-full cursor-pointer items-center justify-between rounded-md border border-[#dcdfe6] bg-white px-3 text-sm text-gray-900 shadow-none transition-colors hover:border-[#c0c4cc] focus:border-[#409eff] focus:outline-none focus:ring-2 focus:ring-[#409eff]/20',
  menu: 'z-20 mt-1 overflow-hidden rounded-md border border-[#e4e7ed] bg-white py-1 shadow-[0_4px_12px_rgba(0,0,0,0.12)]',
  list: 'max-h-52 overflow-y-auto py-1',
  listItem: ({ isSelected }: { isSelected?: boolean } = {}) => `cursor-pointer px-3 py-2 text-sm text-[#606266] transition-colors hover:bg-[#ecf5ff] hover:text-[#409eff] ${isSelected ? 'bg-[#ecf5ff] text-[#409eff]' : ''}`,
  ChevronIcon: ({ open }: { open?: boolean } = {}) => `h-4 w-4 text-[#c0c4cc] transition-transform ${open ? 'rotate-180' : ''}`,
};

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
  const optionFor = (value: string, options: string[]): SelectOption | null => value ? { value, label: options.find((option) => option === value) ?? value } : null;
  const optionsFor = (options: string[]): SelectOption[] => options.map((option) => ({ value: option, label: option }));
  const selectValue = (setter: (value: string) => void) => (value: SelectOption | SelectOption[] | null) => {
    setter(Array.isArray(value) ? value[0]?.value ?? '' : value?.value ?? '');
    setError('');
  };

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
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Candy Shape */}
            {shapes.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold">Candy Shape</p>
                <Select value={optionFor(shape, shapes)} onChange={selectValue(setShape)} options={optionsFor(shapes)} placeholder="Select Shape" primaryColor="blue" isSearchable={false} isClearable={false} classNames={selectClassNames} />
              </div>
            )}

            {/* Flavor */}
            {flavors.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold">Flavor</p>
                <Select value={optionFor(flavor, flavors)} onChange={selectValue(setFlavor)} options={optionsFor(flavors)} placeholder="Select Flavor" primaryColor="blue" isSearchable={false} isClearable={false} classNames={selectClassNames} />
              </div>
            )}

            {/* Lot Code */}
            {lots.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold">Affected Lot Code</p>
                <Select value={optionFor(lotCode, lots)} onChange={selectValue(setLotCode)} options={optionsFor(lots)} placeholder="Select Lot Code" primaryColor="blue" isSearchable={false} isClearable={false} classNames={selectClassNames} />
              </div>
            )}

            {/* Date Code */}
            {dates.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold">Date Code</p>
                <Select value={optionFor(dateCode, dates)} onChange={selectValue(setDateCode)} options={optionsFor(dates)} placeholder="Select Date Code" primaryColor="blue" isSearchable={false} isClearable={false} classNames={selectClassNames} />
              </div>
            )}

            {/* Hint */}
            <div className="flex items-start gap-2 rounded-lg bg-surface-secondary border p-3 sm:col-span-2">
              <Info className="h-4 w-4 text-text-tertiary shrink-0 mt-0.5" />
              <p className="text-xs text-text-tertiary leading-relaxed">
                Select the shape, flavor, lot code, and date code printed on your package. We&apos;ll check them against this recall scope.
              </p>
            </div>

            {error && <p className="text-xs text-destructive sm:col-span-2">{error}</p>}

            <Button onClick={handleCheck} disabled={isChecking}
              className="h-10 w-full font-semibold cursor-pointer btn-lift btn-press sm:col-span-2"
              style={{ backgroundColor: isChecking ? '#a0cfff' : '#409eff', borderColor: isChecking ? '#a0cfff' : '#409eff', color: '#fff', opacity: 1 }}>
              {isChecking ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" />Checking...</> : 'Check My Product'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

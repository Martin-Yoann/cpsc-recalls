'use client';
import { useI18n } from "@/lib/i18n/provider";
import { message, type MessageInput } from '@/lib/i18n/translate';


// ============================================================
// KOI Recall Platform — Recall Check Card v6.0
// Legacy four-field check: shape/flavor + lot/date codes.
// All values are click-to-select from the campaign's own data,
// matching the backend mode=legacy contract.
// ============================================================

import { useState } from 'react';
import Link from 'next/link';
import { ShieldCheck, XCircle, Loader2, AlertTriangle, Info } from 'lucide-react';
import Select from 'react-tailwindcss-select';
import { Button } from '@/components/ui/button';
import { checkProduct } from '@/lib/api-client';
import type { Campaign, Product } from '@/types';

interface RecallCheckCardProps { campaign: Campaign; product: Product; }

type CheckResult = 'potential_match' | 'not_matched' | 'manual_review' | null;
type SelectOption = { value: string; label: string };

const selectClassNames = {
  menuButton: () => 'flex h-10 min-w-0 w-full cursor-pointer items-center justify-between rounded-md border border-[#dcdfe6] bg-white px-3 text-sm text-gray-900 shadow-none transition-colors hover:border-[#c0c4cc] focus:border-[#409eff] focus:outline-none focus:ring-2 focus:ring-[#409eff]/20 [&>div:first-child]:min-w-0 [&>div:first-child]:overflow-hidden [&>div:first-child]:pl-0 [&>div:first-child]:pr-1 [&_svg]:size-4',
  menu: 'absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-md border border-[#e4e7ed] bg-white py-1 shadow-[0_4px_12px_rgba(0,0,0,0.12)]',
  list: 'max-h-52 overflow-y-auto py-1',
  listItem: ({ isSelected }: { isSelected?: boolean } = {}) => `cursor-pointer px-3 py-2 text-sm text-[#606266] transition-colors hover:bg-[#ecf5ff] hover:text-[#409eff] ${isSelected ? 'bg-[#ecf5ff] text-[#409eff]' : ''}`,
  // Keep the chevron state explicit so the legacy Select stylesheet cannot
  // leave a stale transform after the menu closes.
  ChevronIcon: ({ open }: { open?: boolean } = {}) =>
    `h-4 w-4 text-[#c0c4cc] transform-gpu transition-transform duration-200 ${open ? '!rotate-180' : '!rotate-0'}`, 
};

export function RecallCheckCard({ campaign, product }: RecallCheckCardProps) {
  const { t } = useI18n();
  const [shape, setShape] = useState('');
  const [flavor, setFlavor] = useState('');
  const [lotCode, setLotCode] = useState('');
  const [dateCode, setDateCode] = useState('');
  const [result, setResult] = useState<CheckResult>(null);
  const [error, setError] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [apiError, setApiError] = useState<MessageInput | null>(null);

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
      setError("ui.select.at.least.one.field.to.check.7cc49c");
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
      setApiError(message('error.verification', { reference: apiResult.error.requestId?.slice(0, 8) || 'N/A' }));
    }

    setIsChecking(false);
  };

  const reset = () => { setShape(''); setFlavor(''); setLotCode(''); setDateCode(''); setResult(null); setError(''); setApiError(null); };

  return (
    <div className="relative z-0 w-full h-full rounded-xl border bg-surface-elevated flex flex-col">
      <div className="relative z-0 p-4 sm:p-5 flex-1 flex flex-col justify-center">
        {result === 'potential_match' ? (
          <div className="text-center py-4 space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blade-resolution-light border border-blade-resolution-medium/30">
              <ShieldCheck className="h-6 w-6 text-blade-resolution" />
            </div>
            <h4 className="text-base font-bold text-blade-resolution">{t("ui.product.matched.f24929")}</h4>
            <p className="text-sm text-text-secondary">{t("ui.the.identifiers.you.selected.are.listed.in.93615f")}</p>
            <div className="inline-flex flex-wrap justify-center gap-x-5 gap-y-1 rounded-lg bg-surface-secondary border p-2.5 text-sm">
              {shape && <span><strong>{t("ui.shape.14edb2")}</strong> {shape}</span>}
              {flavor && <span><strong>{t("ui.flavor.f03677")}</strong> {flavor}</span>}
              {lotCode && <span><strong>{t("ui.lot.94d34d")}</strong> <code className="font-mono text-blade-verification">{lotCode}</code></span>}
              {dateCode && <span><strong>{t("ui.date.81b7d2")}</strong> <code className="font-mono text-blade-verification">{dateCode}</code></span>}
            </div>
            <p className="text-xs text-text-tertiary">
              {t("ui.this.check.is.preliminary.and.is.not.0abfed")}</p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Button variant="outline" size="default" onClick={reset}>{t("ui.check.again.e6a1ed")}</Button>
              <Link
                href={`/recalls/${campaign.slug}`}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-foreground bg-foreground px-3 text-sm font-medium text-white transition-colors hover:bg-foreground/90"
              >
                {t("ui.go.to.recall.page.308045")}</Link>
            </div>
          </div>
        ) : result === 'not_matched' ? (
          <div className="text-center py-4 space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 border border-amber-200">
              <XCircle className="h-6 w-6 text-amber-600" />
            </div>
            <h4 className="text-base font-bold text-amber-700">{t("ui.no.automated.match.f52bc2")}</h4>
            <p className="text-sm text-text-secondary">
              {t("ui.the.values.you.selected.were.not.found.2ff158")}</p>
            <Button variant="outline" size="default" onClick={reset}>{t("ui.try.again.cef2fe")}</Button>
          </div>
        ) : result === 'manual_review' ? (
          <div className="text-center py-4 space-y-3">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blade-verification-light border border-blade-verification-medium/30">
              <AlertTriangle className="h-6 w-6 text-blade-verification" />
            </div>
            <h4 className="text-base font-bold text-blade-verification">{t("ui.additional.review.needed.ec2d19")}</h4>
            <p className="text-sm text-text-secondary">
              {t("ui.we.could.not.automatically.confirm.whether.your.eb5023")}</p>
            <Button variant="outline" size="sm" onClick={reset}>{t("ui.try.different.selections.9d7fbc")}</Button>
          </div>
        ) : apiError ? (
          <div className="text-center py-4 space-y-3">
            <XCircle className="h-10 w-10 mx-auto text-red-500" />
            <p className="text-sm text-text-secondary">{t(apiError)}</p>
            <Button variant="outline" size="sm" onClick={handleCheck}>{t("ui.retry.9f5cd8")}</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Candy Shape */}
            {shapes.length > 0 && (
              <div className="relative min-w-0 space-y-1.5">
                <p className="text-xs font-semibold">{t("ui.candy.shape.863e4e")}</p>
                <Select value={optionFor(shape, shapes)} onChange={selectValue(setShape)} options={optionsFor(shapes)} placeholder={t("ui.select.shape.146d7c")} primaryColor="blue" isSearchable={false} isClearable={false} classNames={selectClassNames} />
              </div>
            )}

            {/* Flavor */}
            {flavors.length > 0 && (
              <div className="relative min-w-0 space-y-1.5">
                <p className="text-xs font-semibold">{t("ui.flavor.51adc2")}</p>
                <Select value={optionFor(flavor, flavors)} onChange={selectValue(setFlavor)} options={optionsFor(flavors)} placeholder={t("ui.select.flavor.0926fe")} primaryColor="blue" isSearchable={false} isClearable={false} classNames={selectClassNames} />
              </div>
            )}

            {/* Lot Code */}
            {lots.length > 0 && (
              <div className="relative min-w-0 space-y-1.5">
                <p className="text-xs font-semibold">{t("ui.affected.lot.code.05cfc5")}</p>
                <Select value={optionFor(lotCode, lots)} onChange={selectValue(setLotCode)} options={optionsFor(lots)} placeholder={t("ui.select.lot.code.0ff31d")} primaryColor="blue" isSearchable={false} isClearable={false} classNames={selectClassNames} />
              </div>
            )}

            {/* Date Code */}
            {dates.length > 0 && (
              <div className="relative min-w-0 space-y-1.5">
                <p className="text-xs font-semibold">{t("ui.date.code.8d4869")}</p>
                <Select value={optionFor(dateCode, dates)} onChange={selectValue(setDateCode)} options={optionsFor(dates)} placeholder={t("ui.select.date.code.20f29c")} primaryColor="blue" isSearchable={false} isClearable={false} classNames={selectClassNames} />
              </div>
            )}

            {/* Hint */}
            <div className="flex items-start gap-2 rounded-lg bg-surface-secondary border p-3 sm:col-span-2">
              <Info className="h-4 w-4 text-text-tertiary shrink-0 mt-0.5" />
              <p className="text-xs text-text-tertiary leading-relaxed">
                {t("ui.select.the.shape.flavor.lot.code.and.1e7475")}</p>
            </div>

            {error && <p className="text-xs text-destructive sm:col-span-2">{t(error)}</p>}

            <Button onClick={handleCheck} disabled={isChecking}
              className="h-10 w-full font-semibold cursor-pointer btn-lift btn-press sm:col-span-2"
              style={{ backgroundColor: isChecking ? '#7B7A7A' : '#363434', borderColor: isChecking ? '#0d0d0d' : '#1B1B1B', color: '#fff', opacity: 1 }}>
              {isChecking ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" />{t("ui.checking.494d0f")}</> : t("ui.check.my.product.053630")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

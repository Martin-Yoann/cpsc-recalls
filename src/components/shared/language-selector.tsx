'use client';

import { Globe } from 'lucide-react';
import { useI18n } from '@/lib/i18n/provider';
import { languageNames, locales, type Locale } from '@/lib/i18n/locale';

export function LanguageSelector() {
  const { locale, setLocale, pending } = useI18n();
  return (
    <label className="inline-flex items-center gap-1.5 text-sm text-foreground">
      <Globe aria-hidden="true" className="hidden h-4 w-4 shrink-0 sm:block" />
      <span className="sr-only">Language / Idioma</span>
      <select aria-label="Language / Idioma" value={locale} disabled={pending} onChange={(event) => setLocale(event.target.value as Locale)} className="max-w-24 rounded border border-border bg-white px-1 py-1.5 text-sm focus-visible:outline-2 focus-visible:outline-foreground">
        {locales.map((code) => <option key={code} value={code} lang={code === 'es-US' ? 'es' : 'en'}>{languageNames[code]}</option>)}
      </select>
    </label>
  );
}

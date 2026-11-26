'use client';

import { useI18n } from '@/lib/i18n/provider';
import { languageNames, locales, type Locale } from '@/lib/i18n/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

/** Local vector flags render consistently, including on Windows without flag emoji. */
function LanguageFlag({ locale }: { locale: Locale }) {
  return (
    <span aria-hidden="true" className="inline-flex h-3.5 w-5 shrink-0 overflow-hidden rounded-[2px] ring-1 ring-black/10">
      {locale === 'en-US' ? (
        <svg viewBox="0 0 60 40" className="h-full w-full" preserveAspectRatio="none">
          <path fill="#fff" d="M0 0h60v40H0z" />
          {Array.from({ length: 7 }, (_, row) => (
            <path key={row} fill="#b22234" d={`M0 ${row * 80 / 13}h60v${40 / 13}H0z`} />
          ))}
          <path fill="#3c3b6e" d="M0 0h25v21.54H0z" />
          {Array.from({ length: 9 }, (_, row) =>
            Array.from({ length: row % 2 === 0 ? 6 : 5 }, (_, column) => (
              <circle key={`${row}-${column}`} fill="#fff" r="0.7" cx={2.1 + column * 4.15 + (row % 2) * 2.1} cy={2 + row * 2.2} />
            )),
          )}
        </svg>
      ) : (
        <svg viewBox="0 0 60 40" className="h-full w-full" preserveAspectRatio="none">
          <path fill="#aa151b" d="M0 0h60v40H0z" />
          <path fill="#f1bf00" d="M0 10h60v20H0z" />
          <path fill="#aa151b" d="M15 16h7v8a3.5 3.5 0 0 1-7 0z" />
          <path fill="#f7e5a4" d="M16 17h2v4h-2zm3 5h2v3h-2z" />
          <path fill="#aa151b" d="M14 14h9v2h-9z" />
        </svg>
      )}
    </span>
  );
}

export function LanguageSelector() {
  const { locale, setLocale, pending } = useI18n();
  return (
    <Select
      value={locale}
      disabled={pending}
      items={languageNames}
      onValueChange={(value) => { if (value && locales.includes(value as Locale)) setLocale(value as Locale); }}
    >
      <SelectTrigger
        aria-label="Language / Idioma"
        className="h-9 min-w-[126px] gap-2 rounded-lg border-[#dedede] bg-white px-2.5 text-[13px] font-medium text-[#303030] shadow-none hover:bg-[#f7f7f7] focus-visible:border-[#303030] focus-visible:ring-2 focus-visible:ring-[#303030]/15 sm:min-w-[138px] data-[size=default]:h-9"
      >
        <SelectValue>
          <span className="flex items-center gap-2" lang={locale === 'es-US' ? 'es' : 'en'}>
            <LanguageFlag locale={locale} />
            {languageNames[locale]}
          </span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent
        align="end"
        alignItemWithTrigger={false}
        sideOffset={6}
        className="min-w-[180px] rounded-xl bg-white p-1.5 text-[#303030] shadow-[0_8px_24px_rgba(0,0,0,0.1)] ring-black/10"
      >
        {locales.map((code) => (
          <SelectItem
            key={code}
            value={code}
            label={languageNames[code]}
            lang={code === 'es-US' ? 'es' : 'en'}
            className="min-h-10 cursor-pointer rounded-lg px-2.5 pr-8 text-[13px] focus:bg-[#f4f4f4] focus:text-[#303030] data-selected:bg-[#f4f4f4] data-highlighted:bg-[#f4f4f4]"
          >
            <LanguageFlag locale={code} />
            {languageNames[code]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

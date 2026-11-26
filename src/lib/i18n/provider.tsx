'use client';

import { createContext, useContext, useMemo, useState, useTransition, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { LOCALE_COOKIE, type Locale } from './locale';
import { translator } from './translate';

const I18nContext = createContext<{ locale: Locale; t: ReturnType<typeof translator>; pending: boolean; setLocale: (locale: Locale) => void }>({ locale: 'en-US', t: translator('en-US'), pending: false, setLocale: () => {} });

export function I18nProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const [locale, updateLocale] = useState(initialLocale);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const value = useMemo(() => ({
    locale, t: translator(locale), pending,
    setLocale(next: Locale) {
      if (next === locale) return;
      document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax${location.protocol === 'https:' ? '; Secure' : ''}`;
      document.documentElement.lang = next === 'es-US' ? 'es' : 'en';
      const url = new URL(location.href);
      url.searchParams.delete('lang');
      history.replaceState(history.state, '', url);
      updateLocale(next);
      // Refresh Server Components while retaining the mounted claim form and its draft.
      startTransition(() => router.refresh());
    },
  }), [locale, pending, router]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export const useI18n = () => useContext(I18nContext);

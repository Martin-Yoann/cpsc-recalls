export const locales = ['en-US', 'es-US'] as const;
export type Locale = (typeof locales)[number];
export const LOCALE_COOKIE = 'koi_locale';
export const languageNames: Record<Locale, string> = { 'en-US': 'English', 'es-US': 'Español' };

export function normalizeLocale(value: string | null | undefined): Locale {
  return value?.toLowerCase().split(/[-_;]/)[0] === 'es' ? 'es-US' : 'en-US';
}

export function browserLocale(): Locale {
  if (typeof document === 'undefined') return 'en-US';
  const cookie = document.cookie.split('; ').find((part) => part.startsWith(`${LOCALE_COOKIE}=`));
  return normalizeLocale(cookie?.slice(LOCALE_COOKIE.length + 1) ?? document.documentElement.lang);
}

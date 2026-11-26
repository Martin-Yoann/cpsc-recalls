import 'server-only';
import { cookies } from 'next/headers';
import { cache } from 'react';
import { LOCALE_COOKIE, normalizeLocale } from './locale';
import { translator } from './translate';

export const getI18n = cache(async () => {
  const locale = normalizeLocale((await cookies()).get(LOCALE_COOKIE)?.value);
  return { locale, t: translator(locale) };
});

import { NextResponse, type NextRequest } from 'next/server';
import { LOCALE_COOKIE, normalizeLocale } from './lib/i18n/locale';

/** Explicit links override preference; otherwise retain the visitor's chosen language. */
export function proxy(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('lang');
  const existing = request.cookies.get(LOCALE_COOKIE)?.value;
  if (!query && existing) return NextResponse.next();
  const accepted = request.headers.get('accept-language')?.split(',')[0];
  const locale = normalizeLocale(query ?? accepted);
  request.cookies.set(LOCALE_COOKIE, locale);
  const response = NextResponse.next({ request: { headers: request.headers } });
  response.cookies.set(LOCALE_COOKIE, locale, { path: '/', maxAge: 31536000, sameSite: 'lax', secure: request.nextUrl.protocol === 'https:' });
  return response;
}

export const config = { matcher: ['/((?!api|_next|favicon.ico|.*\\..*).*)'] };

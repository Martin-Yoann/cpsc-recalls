import type { Locale } from './locale';

export const formatDate = (value: Date | string, locale: Locale, options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' }) =>
  new Intl.DateTimeFormat(locale, options).format(typeof value === 'string' ? new Date(value) : value);
export const formatNumber = (value: number, locale: Locale) => new Intl.NumberFormat(locale).format(value);
export const formatMoney = (value: number, currency: string, locale: Locale) => new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);

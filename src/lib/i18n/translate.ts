import en from './en.json' with { type: 'json' };
import es from './es.json' with { type: 'json' };
import type { Locale } from './locale';

export type MessageId = keyof typeof en;
export type MessageValues = Record<string, string | number | boolean | null | undefined | UiMessage>;
export interface UiMessage { readonly kind: 'ui-message'; readonly id: string; readonly values: MessageValues }
export type MessageInput = string | UiMessage;
const catalogues: Record<Locale, Record<string, string>> = { 'en-US': en, 'es-US': es };

/** Descriptors keep validation text in the current language after switching. */
export function message(id: string, values: MessageValues = {}): UiMessage { return { kind: 'ui-message', id, values }; }

export function translator(locale: Locale) {
  function t(value: MessageInput, values?: MessageValues): string;
  function t<T>(value: T, values?: MessageValues): T;
  function t(value: unknown, values: MessageValues = {}): unknown {
    if (value && typeof value === 'object' && 'kind' in value && value.kind === 'ui-message') {
      const descriptor = value as UiMessage;
      return t(descriptor.id, descriptor.values);
    }
    if (typeof value !== 'string') return value;
    const template = catalogues[locale][value] ?? (en as Record<string, string>)[value];
    if (template === undefined) return value;
    return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (token, name: string) => {
      const replacement = values[name];
      if (replacement === undefined || replacement === null) return token;
      if (typeof replacement === 'object') return t(replacement);
      return typeof replacement === 'number' ? new Intl.NumberFormat(locale).format(replacement) : String(replacement);
    });
  }
  return t;
}

export function pluralMessage(locale: Locale, base: string, count: number, values: MessageValues = {}): UiMessage {
  const category = new Intl.PluralRules(locale).select(count);
  const id = `${base}.${category}`;
  return message(id in en ? id : `${base}.other`, { ...values, count });
}

/**
 * Google Analytics (GA4) plumbing, deliberately inert until configured.
 *
 * Set `NEXT_PUBLIC_GA_MEASUREMENT_ID` to a real `G-XXXXXXX` id to switch it on;
 * with the variable unset (or malformed) every function here no-ops and no
 * third-party script is loaded. That keeps the tag out of the way until the
 * measurement id exists.
 *
 * Privacy: this is a product-recall portal, so URLs and payloads can carry
 * consumer PII (email, phone, address, case/claim references). Two rules are
 * enforced here rather than left to call sites:
 *   1. page views report the pathname only — never the query string, which is
 *      where claim/session tokens live;
 *   2. `trackEvent` drops any parameter whose key looks like PII.
 */

/** GA4 property id, inlined at build time (must be a `NEXT_PUBLIC_*` var). */
export const GA_MEASUREMENT_ID = (process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? '').trim();

/** Only a well-formed GA4 id enables the tag; anything else stays off. */
export const isAnalyticsEnabled = /^G-[A-Z0-9]{6,}$/i.test(GA_MEASUREMENT_ID);

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

/**
 * Parameter names that must never reach a third-party analytics property.
 * Matched case-insensitively against the whole key, so `caseReference`,
 * `case_reference` and `case-reference` are all caught.
 */
const PII_KEY_PATTERNS: readonly RegExp[] = [
  /e-?mail/,
  /phone|mobile|tel/,
  /name/,
  /address|street|city|zip|postal/,
  /case|claim|order|reference|ref\b/,
  /token|secret|session|cookie|auth/,
  /ssn|dob|birth|licen[cs]e|passport/,
  /document|evidence|attachment|receipt/,
  /sku|upc|gtin|lot|serial/,
];

const isPiiKey = (key: string): boolean => PII_KEY_PATTERNS.some((pattern) => pattern.test(key));

/** Drops PII-shaped keys, and warns loudly in development so they get renamed. */
function stripPii(
  params: Record<string, unknown>,
  context: string,
): Record<string, unknown> {
  const safe: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(params)) {
    if (isPiiKey(key)) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(
          `[analytics] dropped PII-ish parameter "${key}" from ${context}. ` +
            'Use an opaque, non-identifying key instead.',
        );
      }
      continue;
    }
    safe[key] = value;
  }
  return safe;
}

const ready = (): boolean =>
  isAnalyticsEnabled && typeof window !== 'undefined' && typeof window.gtag === 'function';

/**
 * Reports one page view. Call with a pathname only — see the module note on
 * query strings.
 */
export function trackPageView(pathname: string): void {
  if (!ready()) return;
  window.gtag?.('event', 'page_view', { page_path: pathname });
}

/**
 * Reports a custom event, e.g. `trackEvent('recall_search', { has_lot_code: true })`.
 * Parameters that look like PII are dropped before they leave the browser.
 */
export function trackEvent(
  name: string,
  params: Record<string, unknown> = {},
): void {
  if (!ready()) return;
  window.gtag?.('event', name, stripPii(params, `event "${name}"`));
}

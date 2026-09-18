'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { GA_MEASUREMENT_ID, isAnalyticsEnabled, trackPageView } from '@/lib/analytics';

/**
 * Google Analytics (GA4) loader. Renders nothing — and loads no third-party
 * script — unless `NEXT_PUBLIC_GA_MEASUREMENT_ID` holds a well-formed `G-…` id,
 * so this is inert until the measurement id is supplied.
 *
 * Route changes are reported by hand because the App Router does not do a full
 * document load on navigation. The initial hit comes from `gtag('config')`, so
 * the effect below deliberately skips its first run rather than double-counting
 * the landing page. The pathname alone is reported — never the query string,
 * which can carry claim/session tokens.
 *
 * `afterInteractive` keeps the tag off the critical path: it loads after
 * hydration, so a slow or blocked googletagmanager.com cannot delay first paint.
 *
 * Note before enabling: GA4 sets cookies, so a jurisdiction with prior-consent
 * rules (EU/UK, and parts of the US) needs a consent gate or Consent Mode wired
 * up first. Enabling this id alone is not a consent story.
 */
export function Analytics() {
  const pathname = usePathname();
  const isInitialRender = useRef(true);

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }
    if (!isAnalyticsEnabled) return;
    trackPageView(pathname);
  }, [pathname]);

  if (!isAnalyticsEnabled) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_MEASUREMENT_ID}');`}
      </Script>
    </>
  );
}

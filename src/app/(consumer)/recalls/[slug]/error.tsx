'use client';
import { useI18n } from "@/lib/i18n/provider";


import { useEffect } from 'react';
import Link from 'next/link';
import { Home, RefreshCw } from 'lucide-react';

/**
 * Error boundary for the recall notice route.
 *
 * This exists so a failure to *load* a notice never looks like a notice that
 * does not exist. The page raises for any non-404 backend failure precisely to
 * avoid the "this recall doesn't apply to me" conclusion a consumer would draw
 * from a not-found page; this boundary is what they see instead.
 *
 * Like notFound(), this boundary does not control the HTTP status — a streaming
 * dynamic route has already sent its shell, so the response stays 200 and only
 * the content is swapped. The message therefore carries the meaning here, and
 * `generateMetadata` is what marks the outage page `noindex`.
 */
export default function RecallNoticeError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const { t } = useI18n();
  useEffect(() => {
    console.error('[recalls] notice failed to load', { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-lg card-elevated p-10 text-center">
        <p className="label-eyebrow text-alert">{t("ui.temporarily.unavailable.88f0e1")}</p>
        <h1 className="mt-3 text-[32px] leading-tight font-bold tracking-[-0.02em] text-foreground">
          {t("ui.we.couldn.t.load.this.recall.notice.e8405c")}</h1>
        <p className="mt-4 text-secondary leading-relaxed">
          {t("ui.this.is.a.problem.on.our.side.891666")}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={reset} className="btn-dark">
            <RefreshCw className="h-4 w-4" />
            {t("ui.try.again.042c86")}</button>
          <Link href="/" className="btn-outline">
            <Home className="h-4 w-4" />
            {t("ui.back.to.home.ce7472")}</Link>
        </div>
      </div>
    </div>
  );
}

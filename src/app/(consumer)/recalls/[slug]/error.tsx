'use client';

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
  useEffect(() => {
    console.error('[recalls] notice failed to load', { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-lg card-elevated p-10 text-center">
        <p className="label-eyebrow text-alert">Temporarily unavailable</p>
        <h1 className="mt-3 text-[32px] leading-tight font-bold tracking-[-0.02em] text-foreground">
          We couldn&apos;t load this recall notice
        </h1>
        <p className="mt-4 text-secondary leading-relaxed">
          This is a problem on our side, not a statement about your product. Please try again in a
          moment. If you need an answer now, contact the support details in your recall letter.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <button type="button" onClick={reset} className="btn-dark">
            <RefreshCw className="h-4 w-4" />
            Try again
          </button>
          <Link href="/" className="btn-outline">
            <Home className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import { AlertTriangle, X } from 'lucide-react';
import { useState } from 'react';

export function SafetyBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="bg-brand text-white">
      <div className="container-content flex items-center justify-between py-2.5 text-sm">
        <span className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <strong className="shrink-0">Safety Recall</strong>
          <span className="hidden sm:inline text-white/80 truncate">
            — Stop using the product until you have checked the lot code.
          </span>
        </span>
        <button
          onClick={() => setDismissed(true)}
          className="group shrink-0 inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-white/80 bg-white px-2.5 text-sm font-semibold text-brand shadow-sm transition-colors hover:bg-white/90 hover:border-white active:bg-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand"
          aria-label="Dismiss safety recall notice"
          title="Dismiss safety recall notice"
        >
          <span className="hidden sm:inline">Dismiss</span>
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

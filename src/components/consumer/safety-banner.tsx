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
          className="shrink-0 h-7 w-7 flex items-center justify-center rounded-md text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

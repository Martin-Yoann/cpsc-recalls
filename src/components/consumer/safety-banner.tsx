'use client';

// ============================================================
// KOI Recall Platform — Safety Banner v3.0
// Thin strip — just get attention, Blade 1 handles the details
// ============================================================

import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Campaign } from '@/types';
import { useState } from 'react';

interface SafetyBannerProps {
  campaign: Campaign;
}

export function SafetyBanner({ campaign }: SafetyBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="bg-blade-safety text-white">
      <div className="container-content flex items-center justify-between py-2.5 text-sm">
        <span className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <strong className="shrink-0">Safety Recall</strong>
          <span className="hidden sm:inline text-white/80 truncate">
            — Stop using the product until you have checked the lot code below.
          </span>
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0 h-7 w-7 text-white/60 hover:text-white hover:bg-white/10 ml-3 cursor-pointer"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

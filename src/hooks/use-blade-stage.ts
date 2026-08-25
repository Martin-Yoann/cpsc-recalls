'use client';

// ============================================================
// KOI Recall Platform — useBladeStage Hook
// Derives the current blade stage from workflow state
// ============================================================

import { useMemo } from 'react';
import type { BladeStage } from '@/types';
import { BLADE_CONFIG, type BladeConfig } from '@/lib/constants';

interface BladeStageState {
  stage: BladeStage;
  config: BladeConfig;
}

/**
 * Derives the current blade stage.
 *
 * This is driven by the active section of the consumer flow.
 */
export function useBladeStage(
  activeSection?: 'identify' | 'verify' | 'resolve'
): BladeStageState {
  const stage = useMemo<BladeStage>(() => {
    switch (activeSection) {
      case 'identify':
        return 'safety';
      case 'verify':
        return 'verification';
      case 'resolve':
        return 'resolution';
      default:
        return 'safety';
    }
  }, [activeSection]);

  const config = BLADE_CONFIG[stage];

  return { stage, config };
}

'use client';

// ============================================================
// KOI Recall Platform — Three-Blade Progress Indicator v2.0
// ============================================================

import { motion, AnimatePresence } from 'framer-motion';
import { Check, ShieldAlert, SearchCheck, CheckCircle2 } from 'lucide-react';
import type { BladeStage } from '@/types';
import { BLADE_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface BladeProgressProps {
  current: BladeStage;
  completedSteps: BladeStage[];
}

const BLADES: BladeStage[] = ['safety', 'verification', 'resolution'];

const BLADE_ICONS: Record<BladeStage, React.ComponentType<{ className?: string }>> = {
  safety: ShieldAlert,
  verification: SearchCheck,
  resolution: CheckCircle2,
};

export function BladeProgress({ current, completedSteps }: BladeProgressProps) {
  return (
    <div className="container-content py-6">
      <div className="flex items-center relative max-w-lg mx-auto">
        {/* Connector background */}
        <div className="absolute top-4 left-0 right-0 h-0.5 bg-border -z-0 rounded-full" />

        {/* Active connector */}
        <motion.div
          className="absolute top-4 left-0 h-0.5 rounded-full -z-0"
          style={{ backgroundColor: `var(--blade-${current})` }}
          initial={{ width: '0%' }}
          animate={{
            width: current === 'safety' ? '0%' : current === 'verification' ? '50%' : '100%',
          }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        />

        {BLADES.map((blade, index) => {
          const config = BLADE_CONFIG[blade];
          const Icon = BLADE_ICONS[blade];
          const isComplete = completedSteps.includes(blade);
          const isCurrent = current === blade;

          return (
            <div key={blade} className="flex-1 flex flex-col items-center gap-1.5 z-10">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full transition-all duration-300',
                  isComplete && 'bg-blade-resolution text-white',
                  isCurrent && 'text-white shadow-lg',
                  !isCurrent && !isComplete && 'bg-surface-elevated border-2 border-border text-text-tertiary'
                )}
                style={isCurrent ? { backgroundColor: `var(--blade-${blade})`, borderColor: `var(--blade-${blade})` } : undefined}
              >
                <AnimatePresence mode="wait">
                  {isComplete ? (
                    <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.2 }}>
                      <Check className="h-4 w-4" />
                    </motion.div>
                  ) : (
                    <motion.div key="icon" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      <Icon className="h-4 w-4" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              <div className="text-center">
                <p className={cn('text-[10px] font-bold uppercase tracking-wider', isCurrent ? 'text-text-primary' : 'text-text-tertiary')}>
                  {config.label.split(' ')[0]}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

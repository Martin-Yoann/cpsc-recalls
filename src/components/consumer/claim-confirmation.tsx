'use client';

// ============================================================
// KOI Recall Platform — Claim Confirmation v2.0
// Blade 3: Post-submission success state with chain-of-custody
// ============================================================

import { motion } from 'framer-motion';
import { CheckCircle2, ClipboardList, Package, Mail, Download, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { scaleIn } from '@/lib/motion-presets';

interface ClaimConfirmationProps {
  claimNumber: string;
  remedyType: string;
}

const NEXT_STEPS = [
  {
    icon: ClipboardList,
    color: 'bg-blade-verification-light text-blade-verification',
    title: 'Verification Review',
    description: 'Our team reviews your evidence within 3–5 business days.',
  },
  {
    icon: Package,
    color: 'bg-blade-resolution-light text-blade-resolution',
    title: 'Remedy Fulfillment',
    description: 'Once verified, your remedy will be processed and shipped.',
  },
  {
    icon: Mail,
    color: 'bg-blade-safety-light text-blade-safety',
    title: 'Status Updates',
    description: 'You will receive email updates at every stage. Track anytime here.',
  },
];

export function ClaimConfirmation({ claimNumber, remedyType }: ClaimConfirmationProps) {
  return (
    <div className="rounded-2xl border bg-surface-elevated shadow-card overflow-hidden blade-accent-resolution">
      <div className="px-6 py-8 text-center">
        <motion.div variants={scaleIn} initial="hidden" animate="visible" className="flex justify-center mb-5">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blade-resolution">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
        </motion.div>

        <h3 className="text-xl font-bold text-blade-resolution mb-1">Claim Submitted</h3>
        <p className="text-sm text-text-secondary mb-5">Your claim has been received and is being processed.</p>

        {/* Reference number */}
        <div className="rounded-xl bg-surface-secondary border p-4 mb-6 inline-block min-w-[240px]">
          <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">
            Claim Reference Number
          </p>
          <p className="text-xl font-mono font-bold text-blade-resolution tracking-tight">
            {claimNumber}
          </p>
        </div>

        {/* What happens next */}
        <div className="text-left space-y-3 mb-6">
          <h4 className="text-sm font-bold text-text-primary flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-blade-resolution" />
            What Happens Next
          </h4>
          {NEXT_STEPS.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="flex items-start gap-3">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${step.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">{step.title}</p>
                  <p className="text-xs text-text-secondary leading-relaxed">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-2">
          <Button variant="outline" size="sm" className="font-medium">
            <Download className="mr-1.5 h-4 w-4" />
            Download Confirmation
          </Button>
          <Button size="sm" className="bg-blade-resolution hover:bg-blade-resolution-dark text-white font-medium">
            Track Your Claim
          </Button>
        </div>
      </div>
    </div>
  );
}

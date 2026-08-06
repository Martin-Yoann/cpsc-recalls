'use client';

// ============================================================
// KOI Recall Platform — Product Check Wizard v4.0
// Demo flow: Shape → Flavor → Lot Code → Date Code → Result
// Based on: Music Lollipop Recall Demo
// ============================================================

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, SearchCheck, ShieldCheck, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { slideInRight, slideInLeft, scaleIn } from '@/lib/motion-presets';
import type { Campaign } from '@/types';
import { cn } from '@/lib/utils';

interface EligibilityWizardProps {
  campaign: Campaign;
}

const STEPS = [
  { id: 'shape', label: 'Candy Shape', description: 'Select the candy shape' },
  { id: 'flavor', label: 'Flavor', description: 'Choose the flavor' },
  { id: 'lot', label: 'Lot & Date Code', description: 'Enter codes from package' },
  { id: 'result', label: 'Result', description: 'Check if your product is affected' },
];

type ProductCheck = {
  shape: string;
  flavor: string;
  lotCode: string;
  dateCode: string;
};

export function EligibilityWizard({ campaign }: EligibilityWizardProps) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');
  const [check, setCheck] = useState<ProductCheck>({ shape: '', flavor: '', lotCode: '', dateCode: '' });
  const [result, setResult] = useState<'match' | 'no-match' | null>(null);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductCheck, string>>>({});

  const product = campaign.affectedProducts[0];
  const shapes = product?.shapes || [];
  const flavors = product?.flavors || [];
  const lots = campaign.affectedLots || [];
  const dates = campaign.dateCodes || [];

  const validateStep = (): boolean => {
    const newErrors: Partial<Record<keyof ProductCheck, string>> = {};
    if (step === 0 && !check.shape) newErrors.shape = 'Please select the candy shape.';
    if (step === 1 && !check.flavor) newErrors.flavor = 'Please select the flavor.';
    if (step === 2) {
      if (!check.lotCode.trim()) newErrors.lotCode = 'Please enter the lot code.';
      else if (!/^ML-\d{4}-[A-C]$/.test(check.lotCode.trim().toUpperCase()))
        newErrors.lotCode = 'Demo format: ML-0000-X';
      if (!check.dateCode.trim()) newErrors.dateCode = 'Please enter the date code.';
      else if (!/^\d{2}\/\d{4}$/.test(check.dateCode.trim()))
        newErrors.dateCode = 'Enter MM/YYYY.';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const goNext = () => {
    if (!validateStep()) return;
    if (step < 2) {
      setDirection('forward');
      setStep((s) => s + 1);
    } else {
      // Evaluate
      const normalizedLot = check.lotCode.trim().toUpperCase();
      const normalizedDate = check.dateCode.trim();
      const isMatch = shapes.includes(check.shape)
        && flavors.includes(check.flavor)
        && lots.includes(normalizedLot)
        && dates.includes(normalizedDate);
      setResult(isMatch ? 'match' : 'no-match');
      setDirection('forward');
      setStep(3);
    }
  };

  const goBack = () => {
    setDirection('back');
    if (step === 3) setResult(null);
    setStep((s) => s - 1);
  };

  const reset = () => {
    setCheck({ shape: '', flavor: '', lotCode: '', dateCode: '' });
    setResult(null);
    setErrors({});
    setStep(0);
  };

  return (
    <div className="rounded-2xl border bg-surface-elevated shadow-sm overflow-hidden blade-accent-verification">
      {/* Header */}
      <div className="px-5 sm:px-6 py-4 sm:py-5 border-b bg-blade-verification-light/30">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blade-verification">
            <SearchCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">Product Check</h3>
            <p className="text-xs text-text-secondary">Find the details on your package</p>
          </div>
        </div>

        {/* Step Pipeline */}
        <div className="flex items-center gap-0">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-0 flex-1 last:flex-none">
              <div className={cn(
                'flex items-center gap-1.5 px-1.5 sm:px-2 py-1.5 rounded-md transition-colors duration-250',
                i < step ? 'text-blade-resolution' : i === step ? 'bg-blade-verification text-white' : 'text-text-tertiary'
              )}>
                <span className={cn(
                  'flex items-center justify-center h-5 w-5 rounded-full text-[10px] font-bold border',
                  i < step ? 'bg-blade-resolution border-blade-resolution text-white' :
                  i === step ? 'bg-white border-white text-blade-verification' :
                  'border-text-tertiary'
                )}>
                  {i < step ? '✓' : i + 1}
                </span>
                <span className="text-xs font-semibold hidden sm:inline">{s.label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn('h-0.5 flex-1 mx-0.5 rounded', i < step ? 'bg-blade-resolution' : 'bg-border')} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="p-5 sm:p-6">
        <AnimatePresence mode="wait" custom={direction}>
          {step === 3 && result === 'match' ? (
            /* ── Match result ── */
            <motion.div
              key="match"
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              className="py-8 text-center"
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blade-resolution-light border border-blade-resolution-medium/30 mb-5">
                <ShieldCheck className="h-8 w-8 text-blade-resolution" />
              </div>
              <h3 className="text-xl font-bold text-blade-resolution mb-2">Potential Demo Match</h3>
              <p className="text-sm text-text-secondary max-w-sm mx-auto leading-relaxed mb-4">
                The sample identifiers match one of the affected lots in this fictional recall scope.
                You are eligible to proceed with a remedy claim.
              </p>
              <div className="rounded-xl bg-blade-verification-light/50 border p-4 text-left space-y-1 text-sm">
                <p><strong>Product:</strong> {product?.name}</p>
                <p><strong>Shape:</strong> {check.shape} · <strong>Flavor:</strong> {check.flavor}</p>
                <p><strong>Lot:</strong> <span className="font-mono">{check.lotCode.toUpperCase()}</span></p>
                <p><strong>Date:</strong> {check.dateCode}</p>
              </div>
              <p className="text-xs text-text-tertiary mt-4">
                This scripted result is not an authoritative safety or eligibility decision.
              </p>
              <Button variant="outline" size="sm" onClick={reset} className="mt-3">
                Check Again
              </Button>
            </motion.div>
          ) : step === 3 && result === 'no-match' ? (
            /* ── No-match result ── */
            <motion.div
              key="no-match"
              variants={scaleIn}
              initial="hidden"
              animate="visible"
              className="py-8 text-center"
            >
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 border border-amber-200 mb-5">
                <XCircle className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-amber-700 mb-2">No Listed Demo Match</h3>
              <p className="text-sm text-text-secondary max-w-sm mx-auto leading-relaxed mb-4">
                The identifiers you entered are not listed in this fictional recall scope.
                If you believe your product is affected, please contact support.
              </p>
              <Button variant="outline" size="sm" onClick={reset} className="mt-3">
                Check Again
              </Button>
            </motion.div>
          ) : (
            /* ── Step content ── */
            <motion.div
              key={`step-${step}`}
              variants={direction === 'forward' ? slideInRight : slideInLeft}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Step 0: Shape */}
              {step === 0 && (
                <div className="space-y-4">
                  <Label className="text-sm font-semibold">Select the candy shape</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {shapes.map((shape) => (
                      <button
                        key={shape}
                        type="button"
                        onClick={() => { setCheck((c) => ({ ...c, shape })); setErrors({}); }}
                        className={cn(
                          'p-3 rounded-lg border text-sm font-semibold transition-all cursor-pointer',
                          check.shape === shape
                            ? 'bg-blade-verification text-white border-blade-verification'
                            : 'bg-surface-elevated border-border text-text-primary hover:border-blade-verification-medium'
                        )}
                      >
                        {shape}
                      </button>
                    ))}
                  </div>
                  {errors.shape && <p className="text-sm text-destructive">{errors.shape}</p>}
                </div>
              )}

              {/* Step 1: Flavor */}
              {step === 1 && (
                <div className="space-y-4">
                  <Label className="text-sm font-semibold">Select the flavor</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {flavors.map((flavor) => (
                      <button
                        key={flavor}
                        type="button"
                        onClick={() => { setCheck((c) => ({ ...c, flavor })); setErrors({}); }}
                        className={cn(
                          'p-3 rounded-lg border text-sm font-semibold transition-all cursor-pointer',
                          check.flavor === flavor
                            ? 'bg-blade-verification text-white border-blade-verification'
                            : 'bg-surface-elevated border-border text-text-primary hover:border-blade-verification-medium'
                        )}
                      >
                        {flavor}
                      </button>
                    ))}
                  </div>
                  {errors.flavor && <p className="text-sm text-destructive">{errors.flavor}</p>}
                </div>
              )}

              {/* Step 2: Lot + Date code */}
              {step === 2 && (
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="lot-code" className="text-sm font-semibold">Lot Code</Label>
                    <Input
                      id="lot-code"
                      className="h-11 font-mono"
                      placeholder="ML-0000-X"
                      value={check.lotCode}
                      onChange={(e) => { setCheck((c) => ({ ...c, lotCode: e.target.value })); setErrors({}); }}
                    />
                    <p className="text-xs text-text-tertiary">Demo format: ML-0000-X</p>
                    {errors.lotCode && <p className="text-sm text-destructive">{errors.lotCode}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date-code" className="text-sm font-semibold">Date Code</Label>
                    <Input
                      id="date-code"
                      className="h-11 font-mono"
                      placeholder="MM/YYYY"
                      value={check.dateCode}
                      onChange={(e) => { setCheck((c) => ({ ...c, dateCode: e.target.value })); setErrors({}); }}
                    />
                    <p className="text-xs text-text-tertiary">Enter MM/YYYY.</p>
                    {errors.dateCode && <p className="text-sm text-destructive">{errors.dateCode}</p>}
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex items-center justify-between pt-6">
                <Button type="button" variant="outline" onClick={goBack} disabled={step === 0} size="sm">
                  <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
                </Button>
                <Button
                  type="button"
                  onClick={goNext}
                  size="sm"
                  className="bg-blade-verification hover:bg-blade-verification-dark text-white font-semibold"
                >
                  {step === 2 ? 'Review This Product' : 'Continue'}
                  {step < 2 && <ArrowRight className="ml-1.5 h-4 w-4" />}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

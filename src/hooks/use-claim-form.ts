'use client';

// ============================================================
// KOI Recall Platform — useClaimForm Hook
// Multi-step form state machine for the consumer claim flow
// ============================================================

import { useState, useCallback, useMemo } from 'react';

export interface ClaimFormStep {
  id: string;
  label: string;
  blade: 'safety' | 'verification' | 'resolution';
}

export interface ClaimFormData {
  productId: string;
  purchaseDate: string;
  serialNumber?: string;
  upc?: string;
  evidenceIds: string[];
  incident?: {
    occurredAt: string;
    severity: string;
    description: string;
    injuryDescription?: string;
    medicalAttentionRequired: boolean;
  };
}

const DEFAULT_STEPS: ClaimFormStep[] = [
  { id: 'identify', label: 'Identify Product', blade: 'safety' },
  { id: 'eligibility', label: 'Check Eligibility', blade: 'verification' },
  { id: 'evidence', label: 'Submit Evidence', blade: 'verification' },
  { id: 'review', label: 'Review & Confirm', blade: 'resolution' },
];

interface UseClaimFormReturn {
  steps: ClaimFormStep[];
  currentStepIndex: number;
  currentStep: ClaimFormStep;
  formData: Partial<ClaimFormData>;
  isFirstStep: boolean;
  isLastStep: boolean;
  goNext: () => void;
  goBack: () => void;
  goToStep: (index: number) => void;
  updateField: <K extends keyof ClaimFormData>(
    key: K,
    value: ClaimFormData[K]
  ) => void;
  reset: () => void;
}

const initialData: Partial<ClaimFormData> = {
  productId: '',
  purchaseDate: '',
  serialNumber: '',
  upc: '',
  evidenceIds: [],
};

export function useClaimForm(
  customSteps?: ClaimFormStep[]
): UseClaimFormReturn {
  const steps = customSteps || DEFAULT_STEPS;
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<Partial<ClaimFormData>>(initialData);

  const currentStep = steps[currentStepIndex];
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const goNext = useCallback(() => {
    setCurrentStepIndex((prev) => Math.min(prev + 1, steps.length - 1));
  }, [steps.length]);

  const goBack = useCallback(() => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
  }, []);

  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < steps.length) {
        setCurrentStepIndex(index);
      }
    },
    [steps.length]
  );

  const updateField = useCallback(
    <K extends keyof ClaimFormData>(key: K, value: ClaimFormData[K]) => {
      setFormData((prev) => ({ ...prev, [key]: value }));
    },
    []
  );

  const reset = useCallback(() => {
    setCurrentStepIndex(0);
    setFormData(initialData);
  }, []);

  return useMemo(
    () => ({
      steps,
      currentStepIndex,
      currentStep,
      formData,
      isFirstStep,
      isLastStep,
      goNext,
      goBack,
      goToStep,
      updateField,
      reset,
    }),
    [
      steps,
      currentStepIndex,
      currentStep,
      formData,
      isFirstStep,
      isLastStep,
      goNext,
      goBack,
      goToStep,
      updateField,
      reset,
    ]
  );
}

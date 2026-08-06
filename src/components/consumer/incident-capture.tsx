'use client';

// ============================================================
// KOI Recall Platform — Incident Capture v2.0
// Blade 2: Structured incident reporting
// ============================================================

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertTriangle, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { incidentSchema, type IncidentFormData } from '@/lib/validators';
import { IncidentSeverity } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { scaleIn } from '@/lib/motion-presets';
import { INCIDENT_SEVERITY_LABELS } from '@/lib/constants';

const SEVERITY_STYLES: Record<string, string> = {
  [IncidentSeverity.MINOR]: 'bg-amber-50 border-amber-200 text-amber-700',
  [IncidentSeverity.MODERATE]: 'bg-orange-50 border-orange-200 text-orange-700',
  [IncidentSeverity.SERIOUS]: 'bg-red-50 border-red-200 text-red-700',
  [IncidentSeverity.FATAL]: 'bg-red-100 border-red-300 text-red-800',
};

export function IncidentCapture() {
  const [submitted, setSubmitted] = useState(false);
  const [showInjury, setShowInjury] = useState(false);

  const form = useForm<IncidentFormData>({
    resolver: zodResolver(incidentSchema),
    defaultValues: {
      occurredAt: '',
      severity: undefined,
      description: '',
      injuryDescription: '',
      medicalAttentionRequired: false,
    },
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = form;
  const severity = watch('severity');

  const onSubmit = () => setSubmitted(true);

  return (
    <div className="rounded-2xl border bg-surface-elevated shadow-card overflow-hidden blade-accent-safety">
      <div className="px-6 py-5 border-b bg-blade-safety-light/30">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blade-safety">
            <AlertTriangle className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-text-primary">Report an Incident</h3>
            <p className="text-xs text-text-secondary">Optional — tell us if this product caused harm</p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {submitted ? (
            <motion.div key="done" variants={scaleIn} initial="hidden" animate="visible" className="py-8 text-center">
              <CheckCircle2 className="h-10 w-10 mx-auto text-blade-resolution mb-3" />
              <p className="text-sm font-semibold text-blade-resolution">Incident report recorded.</p>
              <p className="text-xs text-text-secondary mt-1">Thank you — your safety matters.</p>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={handleSubmit(onSubmit)} className="space-y-5" initial={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="incident-date" className="text-sm font-semibold">Date of Incident</Label>
                  <Input id="incident-date" type="date" className="h-11" {...register('occurredAt')} />
                  {errors.occurredAt && <p className="text-sm text-destructive">{errors.occurredAt.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="incident-severity" className="text-sm font-semibold">Severity</Label>
                  <Select value={severity} onValueChange={(v) => {
                    setValue('severity', v as IncidentSeverity, { shouldValidate: true });
                    setShowInjury(v === IncidentSeverity.MODERATE || v === IncidentSeverity.SERIOUS || v === IncidentSeverity.FATAL);
                  }}>
                    <SelectTrigger id="incident-severity" className="h-11">
                      <SelectValue placeholder="Select severity..." />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.values(IncidentSeverity).map((s) => (
                        <SelectItem key={s} value={s}>
                          <span className="inline-flex items-center gap-2">
                            <span className={`inline-block h-2 w-2 rounded-full ${s === IncidentSeverity.FATAL || s === IncidentSeverity.SERIOUS ? 'bg-red-500' : s === IncidentSeverity.MODERATE ? 'bg-orange-500' : 'bg-amber-500'}`} />
                            {INCIDENT_SEVERITY_LABELS[s]}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.severity && <p className="text-sm text-destructive">{errors.severity.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="incident-description" className="text-sm font-semibold">Describe What Happened</Label>
                <Textarea id="incident-description" placeholder="Please describe the incident in as much detail as possible..." rows={4} {...register('description')} />
                {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
              </div>

              {showInjury && (
                <div className="space-y-2">
                  <Label htmlFor="injury-description" className="text-sm font-semibold">Injury Description</Label>
                  <Textarea id="injury-description" placeholder="Describe any injuries sustained..." rows={3} {...register('injuryDescription')} />
                </div>
              )}

              <div className="flex items-start gap-2">
                <Checkbox id="medical-attention" {...register('medicalAttentionRequired')} />
                <Label htmlFor="medical-attention" className="text-sm font-normal cursor-pointer">Medical attention was required</Label>
              </div>

              <Button type="submit" className="bg-blade-safety hover:bg-blade-safety-dark text-white font-semibold">
                <Send className="mr-1.5 h-4 w-4" />
                Submit Incident Report
              </Button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

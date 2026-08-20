'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, ClipboardList, Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RemedyOptions } from '@/components/consumer/remedy-options';
import {
  claimFlowModule,
  CLAIM_FLOW_FORM_VERSION,
  CLAIM_FLOW_PRIVACY_VERSION,
  type ClaimConfirmation,
  type ClaimFlowDraftState,
  type ClaimFlowSession,
  type DocumentCategory,
} from '@/lib/claim-flow';
import type { ProblemDetails } from '@/lib/api-client';
import type { Campaign, CampaignEvidenceRequirement, Product, Remedy } from '@/types';

interface Props {
  campaign: Campaign;
}

const PURCHASE_CHANNEL_OPTIONS = [
  { value: 'amazon', label: 'Amazon' },
  { value: 'tiktok', label: 'TikTok Shop' },
  { value: 'koi', label: 'KOI direct' },
  { value: 'retailer', label: 'Retailer / store' },
  { value: 'gift', label: 'Gift' },
  { value: 'other', label: 'Other' },
] as const;

const INCIDENT_EVENT_OPTIONS = [
  { value: 'injury', label: 'Injury' },
  { value: 'illness', label: 'Illness' },
  { value: 'choking', label: 'Choking' },
  { value: 'ingestion', label: 'Ingestion' },
  { value: 'fire', label: 'Fire' },
  { value: 'overheating', label: 'Overheating' },
  { value: 'property_damage', label: 'Property damage' },
  { value: 'near_miss', label: 'Near miss' },
  { value: 'other', label: 'Other' },
  { value: 'unknown', label: 'Unknown' },
] as const;

const DOCUMENT_CATEGORY_OPTIONS: Array<{ value: DocumentCategory; label: string }> = [
  { value: 'proof_of_purchase', label: 'Proof of purchase' },
  { value: 'product_photo', label: 'Product photo' },
  { value: 'incident_evidence', label: 'Incident evidence' },
];

function formatDocumentCategory(category: DocumentCategory) {
  return DOCUMENT_CATEGORY_OPTIONS.find((option) => option.value === category)?.label ?? category;
}

function describeEvidenceRule(rule: CampaignEvidenceRequirement) {
  const minimum = rule.minimumFiles;
  const maximum = rule.maximumFiles;
  const requiredLabel = rule.required || minimum > 0 ? 'Required' : 'Optional';
  return `${requiredLabel} - ${formatDocumentCategory(rule.category)} (${minimum}-${maximum} file${maximum === 1 ? '' : 's'})`;
}

function formatMimeTypes(mimeTypes: string[]) {
  return mimeTypes.map((mimeType) => mimeType.replace('image/', '').replace('application/', '')).join(', ');
}

function buildDefaultForm(product: Product | undefined): ClaimFlowDraftState {
  return {
    locale: 'en-US',
    consumer: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      postalCode: '',
      countryCode: 'US',
    },
    product: {
      campaignProductId: product?.id ?? '',
      quantity: 1,
      purchaseChannel: 'other',
      purchaseDate: '',
      orderNumber: '',
      lotCode: '',
      dateCode: '',
      flavor: product?.flavors?.[0] ?? '',
      shape: product?.shapes?.[0] ?? '',
    },
    incidentAnswer: 'no',
    incident: {
      eventDescription: '',
      occurredDate: '',
      occurredDateUnknown: false,
      eventTypes: [],
      injurySeverity: '',
      medicalTreatment: '',
      usedAsIntended: '',
    },
    privacyAccepted: false,
    accuracyAccepted: false,
  };
}

export function ClaimSubmitWrapper({ campaign }: Props) {
  const firstProduct = campaign.affectedProducts[0];
  const [session, setSession] = useState<ClaimFlowSession | null>(() => claimFlowModule.resume(campaign.slug));
  const [submitted, setSubmitted] = useState<ClaimConfirmation | null>(null);
  const [problem, setProblem] = useState<ProblemDetails | null>(null);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [pendingRemedyId, setPendingRemedyId] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(() => !claimFlowModule.resume(campaign.slug));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const evidenceRequirements = campaign.evidenceRequirements ?? [];

  useEffect(() => {
    if (session) return;

    let cancelled = false;
    claimFlowModule.start(campaign.slug).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        const seeded = claimFlowModule.save({
          ...result.data,
          form: buildDefaultForm(firstProduct),
        });
        setSession(seeded);
        setProblem(null);
      } else {
        setProblem(result.error);
      }
      setIsBootstrapping(false);
    });

    return () => {
      cancelled = true;
    };
  }, [campaign.slug, firstProduct, session]);

  const selectedRemedy = useMemo(
    () => campaign.remedies.find((remedy) => remedy.id === session?.remedyCode),
    [campaign.remedies, session?.remedyCode],
  );

  const syncSession = (updater: (current: ClaimFlowSession) => ClaimFlowSession) => {
    setSession((current) => {
      if (!current) return current;
      const next = updater(current);
      return claimFlowModule.save(next);
    });
  };

  const updateForm = (updater: (form: ClaimFlowDraftState) => ClaimFlowDraftState) => {
    setValidationMessage(null);
    setProblem(null);
    syncSession((current) => ({
      ...current,
      form: updater(current.form),
    }));
  };

  const handleSelect = (remedy: Remedy) => {
    if (!session) return;
    setPendingRemedyId(remedy.id);
    setProblem(null);
    const nextSession = claimFlowModule.save({
      ...session,
      currentStep: 'consumer',
      remedyCode: remedy.id,
      form: {
        ...session.form,
        product: {
          ...session.form.product,
          campaignProductId: session.form.product.campaignProductId || firstProduct?.id || '',
        },
      },
    });
    setSession(nextSession);
    setPendingRemedyId(null);
  };

  const bootstrapFreshDraft = async () => {
    const result = await claimFlowModule.start(campaign.slug);
    if (result.ok) {
      const seeded = claimFlowModule.save({
        ...result.data,
        form: buildDefaultForm(firstProduct),
      });
      setSession(seeded);
      setProblem(null);
    } else {
      setProblem(result.error);
    }
    setIsBootstrapping(false);
  };

  const handleReset = () => {
    claimFlowModule.abandon(campaign.slug);
    setSession(null);
    setSubmitted(null);
    setProblem(null);
    setValidationMessage(null);
    setIsBootstrapping(true);
    void bootstrapFreshDraft();
  };

  const validateEvidenceRequirements = (documents: ClaimFlowSession['documents']): string | null => {
    for (const rule of evidenceRequirements) {
      const count = documents.filter((document) => document.category === rule.category).length;
      if (count > rule.maximumFiles) {
        return `Too many ${formatDocumentCategory(rule.category).toLowerCase()} files. Maximum allowed is ${rule.maximumFiles}.`;
      }
      if (count < rule.minimumFiles || (rule.required && count === 0)) {
        return `Please upload ${rule.minimumFiles} ${formatDocumentCategory(rule.category).toLowerCase()} file${rule.minimumFiles === 1 ? '' : 's'} before submitting.`;
      }
    }
    return null;
  };

  const validateBeforeSubmit = (current: ClaimFlowSession): string | null => {
    const { form } = current;
    if (!current.remedyCode) return 'Please choose a resolution option first.';
    if (!form.consumer.firstName.trim() || !form.consumer.lastName.trim() || !form.consumer.email.trim()) {
      return 'Please complete first name, last name, and email.';
    }
    if (!form.consumer.addressLine1.trim() || !form.consumer.city.trim() || !form.consumer.state.trim() || !form.consumer.postalCode.trim()) {
      return 'Please complete your mailing address before submission.';
    }
    if ((form.consumer.countryCode.trim() || 'US').length !== 2) {
      return 'Please enter a valid 2-letter country code.';
    }
    if (!form.product.campaignProductId) return 'Please choose the affected product.';
    if (!form.privacyAccepted || !form.accuracyAccepted) {
      return 'Please accept both required attestations before submission.';
    }
    const evidenceError = validateEvidenceRequirements(current.documents);
    if (evidenceError) return evidenceError;
    if (form.incidentAnswer !== 'no') {
      if (!form.incident.occurredDate && !form.incident.occurredDateUnknown) {
        return 'For incident claims, provide an incident date or mark it as unknown.';
      }
      if (form.incidentAnswer === 'yes' && !form.incident.eventTypes.length) {
        return 'Select at least one incident event type when the answer is yes.';
      }
    }
    return null;
  };

  const onUploadFiles = async (category: DocumentCategory, files: FileList | null) => {
    if (!session || !files?.length) return;
    const selectedRule = evidenceRequirements.find((rule) => rule.category === category);
    if (selectedRule) {
      const existingCount = session.documents.filter((document) => document.category === category).length;
      if (existingCount + files.length > selectedRule.maximumFiles) {
        setValidationMessage(
          `You can upload at most ${selectedRule.maximumFiles} ${formatDocumentCategory(category).toLowerCase()} file${selectedRule.maximumFiles === 1 ? '' : 's'}.`,
        );
        return;
      }
    }
    setIsUploading(true);
    setValidationMessage(null);
    setProblem(null);

    let nextSession = session;
    for (const file of Array.from(files)) {
      const result = await claimFlowModule.addDocument(nextSession, file, category);
      if (!result.ok) {
        setProblem(result.error);
        setIsUploading(false);
        return;
      }
      nextSession = result.data.session;
    }

    setSession(nextSession);
    setIsUploading(false);
  };

  if (submitted) {
    return (
      <div className="text-center py-12 space-y-5 rounded-xl border bg-surface-elevated">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blade-resolution-light border border-blade-resolution-medium/30">
          <CheckCircle2 className="h-8 w-8 text-blade-resolution" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-blade-resolution mb-1">Claim Submitted</h3>
          <p className="text-sm text-text-secondary">Your claim was accepted by KOI Recall API.</p>
        </div>
        <div className="inline-flex flex-col items-center rounded-xl bg-surface-secondary border p-4">
          <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Case Reference</p>
          <p className="text-2xl font-mono font-bold text-blade-resolution">{submitted.caseReference}</p>
        </div>
        <div className="space-y-2 text-sm text-text-secondary max-w-md mx-auto">
          <p className="flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blade-resolution" />
            Confirmation email queued: {submitted.emailStatus}
          </p>
          <p className="flex items-center justify-center gap-2">
            <ClipboardList className="h-4 w-4 text-blade-resolution" />
            Next step: {submitted.nextStep}
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/lookup">
            <Button size="sm" variant="outline">Check Status</Button>
          </Link>
          <Button size="sm" onClick={handleReset} className="bg-blade-resolution hover:bg-blade-resolution-dark text-white">
            Start Another Claim
          </Button>
        </div>
      </div>
    );
  }

  if (isBootstrapping) {
    return (
      <div className="rounded-xl border bg-surface-elevated p-6 text-sm text-text-secondary flex items-center gap-3">
        <Loader2 className="h-4 w-4 animate-spin text-blade-resolution" />
        Preparing secure claim session...
      </div>
    );
  }

  if (problem && !session) {
    return (
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 space-y-2">
        <p className="text-sm font-semibold text-destructive flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          Claim flow unavailable
        </p>
        <p className="text-sm text-text-secondary">{problem.detail}</p>
        {problem.requestId && <p className="text-xs text-text-tertiary">Request ID: {problem.requestId}</p>}
      </div>
    );
  }

  if (!session || !selectedRemedy) {
    return <RemedyOptions remedies={campaign.remedies} onSelect={handleSelect} busyRemedyId={pendingRemedyId} />;
  }

  return (
    <div className="rounded-xl border bg-surface-elevated p-5 space-y-5">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-text-tertiary">Draft Ready</p>
        <h3 className="text-lg font-bold text-text-primary mt-1">Requested resolution captured</h3>
        <p className="text-sm text-text-secondary mt-1">
          Resolution `{selectedRemedy.id}` is stored in the draft session. This bridge form now persists claim data into session storage and submits using the real API contract.
        </p>
      </div>

      <div className="rounded-lg border bg-surface-secondary/50 p-4 text-sm text-text-secondary space-y-2">
        <p><span className="font-semibold text-text-primary">Draft ID:</span> {session.draftId}</p>
        <p><span className="font-semibold text-text-primary">Expires:</span> {session.expiresAt}</p>
        <p><span className="font-semibold text-text-primary">Requested Resolution:</span> {selectedRemedy.title}</p>
        <p><span className="font-semibold text-text-primary">Form Version:</span> {CLAIM_FLOW_FORM_VERSION}</p>
      </div>

      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Your selection is a requested resolution and remains subject to eligibility and operational review.
      </div>

      {selectedRemedy.type === 'refund' && (
        <div className="rounded-lg border bg-surface-secondary/50 p-4 text-sm text-text-secondary">
          If approved, the refund will be processed outside this website by the appropriate finance, ecommerce, or payment team. This website does not collect card or bank details.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="first-name">First name</Label>
          <Input id="first-name" value={session.form.consumer.firstName} onChange={(event) => updateForm((form) => ({ ...form, consumer: { ...form.consumer, firstName: event.target.value } }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last-name">Last name</Label>
          <Input id="last-name" value={session.form.consumer.lastName} onChange={(event) => updateForm((form) => ({ ...form, consumer: { ...form.consumer, lastName: event.target.value } }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={session.form.consumer.email} onChange={(event) => updateForm((form) => ({ ...form, consumer: { ...form.consumer, email: event.target.value } }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={session.form.consumer.phone} onChange={(event) => updateForm((form) => ({ ...form, consumer: { ...form.consumer, phone: event.target.value } }))} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address-line1">Address line 1</Label>
          <Input id="address-line1" value={session.form.consumer.addressLine1} onChange={(event) => updateForm((form) => ({ ...form, consumer: { ...form.consumer, addressLine1: event.target.value } }))} />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address-line2">Address line 2</Label>
          <Input id="address-line2" value={session.form.consumer.addressLine2} onChange={(event) => updateForm((form) => ({ ...form, consumer: { ...form.consumer, addressLine2: event.target.value } }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" value={session.form.consumer.city} onChange={(event) => updateForm((form) => ({ ...form, consumer: { ...form.consumer, city: event.target.value } }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state">State / Province</Label>
          <Input id="state" value={session.form.consumer.state} onChange={(event) => updateForm((form) => ({ ...form, consumer: { ...form.consumer, state: event.target.value } }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="postal-code">Postal code</Label>
          <Input id="postal-code" value={session.form.consumer.postalCode} onChange={(event) => updateForm((form) => ({ ...form, consumer: { ...form.consumer, postalCode: event.target.value } }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country-code">Country code</Label>
          <Input id="country-code" maxLength={2} value={session.form.consumer.countryCode} onChange={(event) => updateForm((form) => ({ ...form, consumer: { ...form.consumer, countryCode: event.target.value.toUpperCase() } }))} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="product">Affected product</Label>
          <select
            id="product"
            value={session.form.product.campaignProductId}
            onChange={(event) => updateForm((form) => ({ ...form, product: { ...form.product, campaignProductId: event.target.value } }))}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            {campaign.affectedProducts.map((product) => (
              <option key={product.id} value={product.id}>{product.name}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="purchase-channel">Purchase channel</Label>
          <select
            id="purchase-channel"
            value={session.form.product.purchaseChannel}
            onChange={(event) => updateForm((form) => ({ ...form, product: { ...form.product, purchaseChannel: event.target.value as ClaimFlowDraftState['product']['purchaseChannel'] } }))}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            {PURCHASE_CHANNEL_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="purchase-date">Purchase date</Label>
          <Input id="purchase-date" type="date" value={session.form.product.purchaseDate} onChange={(event) => updateForm((form) => ({ ...form, product: { ...form.product, purchaseDate: event.target.value } }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="order-number">Order number</Label>
          <Input id="order-number" value={session.form.product.orderNumber} onChange={(event) => updateForm((form) => ({ ...form, product: { ...form.product, orderNumber: event.target.value } }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lot-code">Lot code</Label>
          <Input id="lot-code" value={session.form.product.lotCode} onChange={(event) => updateForm((form) => ({ ...form, product: { ...form.product, lotCode: event.target.value } }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="date-code">Date code</Label>
          <Input id="date-code" value={session.form.product.dateCode} onChange={(event) => updateForm((form) => ({ ...form, product: { ...form.product, dateCode: event.target.value } }))} />
        </div>
      </div>

      <div className="space-y-4 rounded-lg border p-4">
        <div className="space-y-2">
          <Label htmlFor="incident-answer">Did the recalled product cause an incident?</Label>
          <select
            id="incident-answer"
            value={session.form.incidentAnswer}
            onChange={(event) => updateForm((form) => ({
              ...form,
              incidentAnswer: event.target.value as ClaimFlowDraftState['incidentAnswer'],
              incident: event.target.value === 'no' ? buildDefaultForm(firstProduct).incident : form.incident,
            }))}
            className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
            <option value="unsure">Unsure</option>
          </select>
        </div>

        {session.form.incidentAnswer !== 'no' && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="incident-date">Incident date</Label>
                <Input id="incident-date" type="date" value={session.form.incident.occurredDate} onChange={(event) => updateForm((form) => ({ ...form, incident: { ...form.incident, occurredDate: event.target.value } }))} />
              </div>
              <label className="flex items-center gap-2 text-sm text-text-secondary pt-7">
                <input
                  type="checkbox"
                  checked={session.form.incident.occurredDateUnknown}
                  onChange={(event) => updateForm((form) => ({ ...form, incident: { ...form.incident, occurredDateUnknown: event.target.checked } }))}
                />
                Date unknown
              </label>
            </div>

            <div className="space-y-2">
              <Label htmlFor="incident-description">What happened?</Label>
              <Textarea id="incident-description" rows={4} value={session.form.incident.eventDescription} onChange={(event) => updateForm((form) => ({ ...form, incident: { ...form.incident, eventDescription: event.target.value } }))} />
            </div>

            <div className="space-y-2">
              <Label>Event types</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {INCIDENT_EVENT_OPTIONS.map((option) => {
                  const checked = session.form.incident.eventTypes.includes(option.value);
                  return (
                    <label key={option.value} className="flex items-center gap-2 rounded border px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(event) => updateForm((form) => ({
                          ...form,
                          incident: {
                            ...form.incident,
                            eventTypes: event.target.checked
                              ? [...form.incident.eventTypes, option.value]
                              : form.incident.eventTypes.filter((value) => value !== option.value),
                          },
                        }))}
                      />
                      {option.label}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="injury-severity">Injury severity</Label>
                <select
                  id="injury-severity"
                  value={session.form.incident.injurySeverity}
                  onChange={(event) => updateForm((form) => ({ ...form, incident: { ...form.incident, injurySeverity: event.target.value as ClaimFlowDraftState['incident']['injurySeverity'] } }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Select</option>
                  <option value="none">None</option>
                  <option value="minor">Minor</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                  <option value="death">Death</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="medical-treatment">Medical treatment</Label>
                <select
                  id="medical-treatment"
                  value={session.form.incident.medicalTreatment}
                  onChange={(event) => updateForm((form) => ({ ...form, incident: { ...form.incident, medicalTreatment: event.target.value as ClaimFlowDraftState['incident']['medicalTreatment'] } }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="used-as-intended">Used as intended</Label>
                <select
                  id="used-as-intended"
                  value={session.form.incident.usedAsIntended}
                  onChange={(event) => updateForm((form) => ({ ...form, incident: { ...form.incident, usedAsIntended: event.target.value as ClaimFlowDraftState['incident']['usedAsIntended'] } }))}
                  className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Select</option>
                  <option value="yes">Yes</option>
                  <option value="no">No</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <div className="space-y-3 rounded-lg border border-dashed p-4">
          {(evidenceRequirements.length
            ? evidenceRequirements
            : DOCUMENT_CATEGORY_OPTIONS.map((option) => ({
                category: option.value,
                required: false,
                minimumFiles: 0,
                maximumFiles: 5,
                allowedMimeTypes: [],
                maximumFileSizeBytes: 0,
                instructions: '',
              } satisfies CampaignEvidenceRequirement))).map((rule) => {
            const uploadedCount = session.documents.filter((document) => document.category === rule.category).length;
            const limitReached = uploadedCount >= rule.maximumFiles;
            return (
              <div key={rule.category} className="rounded-md border bg-background/60 p-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-text-primary">{formatDocumentCategory(rule.category)}</p>
                    <p className="text-xs text-text-tertiary">
                      {rule.required || rule.minimumFiles > 0 ? 'Required' : 'Optional'} | Uploaded {uploadedCount} of {rule.maximumFiles}
                    </p>
                    {rule.instructions ? <p className="text-xs text-text-tertiary">{rule.instructions}</p> : null}
                    {rule.allowedMimeTypes.length ? (
                      <p className="text-xs text-text-tertiary">Accepted: {formatMimeTypes(rule.allowedMimeTypes)}</p>
                    ) : null}
                  </div>
                  <label
                    className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium text-white ${limitReached || isUploading ? 'cursor-not-allowed bg-muted' : 'cursor-pointer bg-blade-verification'}`}
                  >
                    <Upload className="h-4 w-4" />
                    {isUploading ? 'Uploading...' : limitReached ? 'Limit reached' : `Add ${formatDocumentCategory(rule.category)}`}
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept={rule.allowedMimeTypes.length ? rule.allowedMimeTypes.join(',') : undefined}
                      disabled={limitReached || isUploading}
                      onChange={(event) => {
                        void onUploadFiles(rule.category, event.target.files);
                        event.currentTarget.value = '';
                      }}
                    />
                  </label>
                </div>
              </div>
            );
          })}
        </div>

        {session.documents.length > 0 ? (
          <div className="space-y-2">
            {session.documents.map((document) => (
              <div key={document.documentId} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                <div>
                  <p className="font-medium text-text-primary">{document.fileName}</p>
                  <p className="text-xs text-text-tertiary">{formatDocumentCategory(document.category)} | {document.status} | {document.documentId}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSession(claimFlowModule.removeDocument(session, document.documentId))}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-text-secondary">No evidence receipts attached yet.</p>
        )}
      </div>

      <div className="rounded-lg border p-4 text-sm text-text-secondary">
        <p className="font-medium text-text-primary">Evidence requirements</p>
        {evidenceRequirements.length ? (
          <div className="mt-2 space-y-2 text-xs text-text-tertiary">
            {evidenceRequirements.map((rule) => (
              <div key={rule.category}>
                <p className="font-medium text-text-primary">{describeEvidenceRule(rule)}</p>
                <p>{rule.instructions}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-xs text-text-tertiary">No campaign-specific evidence requirements were returned.</p>
        )}
      </div>

      <div className="rounded-lg border p-4 text-sm text-text-secondary">
        <p className="font-medium text-text-primary">Mailing address</p>
        <p className="mt-1 text-xs text-text-tertiary">Used for replacement or other remedies that need shipment details.</p>
      </div>

      <div className="space-y-2 rounded-lg border p-4 text-sm text-text-secondary">
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={session.form.privacyAccepted}
            onChange={(event) => updateForm((form) => ({ ...form, privacyAccepted: event.target.checked }))}
          />
          <span>I acknowledge the privacy notice version `{CLAIM_FLOW_PRIVACY_VERSION}`.</span>
        </label>
        <label className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={session.form.accuracyAccepted}
            onChange={(event) => updateForm((form) => ({ ...form, accuracyAccepted: event.target.checked }))}
          />
          <span>I confirm the submitted information is accurate for form version `{CLAIM_FLOW_FORM_VERSION}`.</span>
        </label>
      </div>

      {validationMessage && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-destructive">
          {validationMessage}
        </div>
      )}

      {problem && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm text-text-secondary">
          <p className="font-semibold text-destructive">Last API issue</p>
          <p>{problem.detail}</p>
          {problem.requestId && <p className="text-xs text-text-tertiary mt-1">Request ID: {problem.requestId}</p>}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button variant="outline" onClick={handleReset}>Reset Draft</Button>
        <Button
          className="bg-blade-resolution hover:bg-blade-resolution-dark text-white"
          disabled={isSubmitting}
          onClick={async () => {
            const current = session;
            const validationError = validateBeforeSubmit(current);
            if (validationError) {
              setValidationMessage(validationError);
              return;
            }

            setIsSubmitting(true);
            const result = await claimFlowModule.submit(current, claimFlowModule.buildSubmitInput(current));
            setIsSubmitting(false);

            if (result.ok) {
              setSubmitted(result.data);
              setProblem(null);
              return;
            }

            setProblem(result.error);
          }}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Through API'}
        </Button>
      </div>
    </div>
  );
}


"use client";
import { useI18n } from "@/lib/i18n/provider";
import { message, type MessageInput } from '@/lib/i18n/translate';
import { problemMessage } from '@/lib/i18n/problem';


import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Loader2,
  RefreshCw,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DisposalTaskLoader } from "@/components/consumer/disposal-task-loader";
import { RemedyOptions } from "@/components/consumer/remedy-options";
import {
  allDocumentsVerified,
  claimFlowModule,
  CLAIM_FLOW_FORM_VERSION,
  createDefaultForm,
  isPendingDocument,
  isDraftExpired,
  type ClaimConfirmation,
  type ClaimFlowDocumentReceipt,
  type ClaimFlowDraftState,
  type ClaimFlowSession,
  type DocumentCategory,
} from "@/lib/claim-flow";
import type { ProblemDetails } from "@/lib/api-client";
import {
  isClaimTimeEvidence,
  remedyRequiresMailingAddress,
  type ClaimTimeEvidenceCategory,
} from "@/lib/constants";
import type {
  Campaign,
  CampaignEvidenceRequirement,
  Product,
  Remedy,
} from "@/types";

interface Props {
  campaign: Campaign;
}

const PURCHASE_CHANNEL_OPTIONS = [
  { value: "amazon", label: "ui.amazon.74c0fd" },
  { value: "tiktok", label: "ui.tiktok.shop.afa85c" },
  { value: "koi", label: "ui.koi.direct.9bfaf8" },
  { value: "retailer", label: "ui.retailer.store.2eb78e" },
  { value: "gift", label: "ui.gift.8d0a32" },
  { value: "other", label: "ui.other.6e6a6f" },
] as const;

const INCIDENT_EVENT_OPTIONS = [
  { value: "injury", label: "ui.injury.889d51" },
  { value: "illness", label: "ui.illness.c58225" },
  { value: "choking", label: "ui.choking.90ccd5" },
  { value: "ingestion", label: "ui.ingestion.ee02ed" },
  { value: "fire", label: "ui.fire.78baeb" },
  { value: "overheating", label: "ui.overheating.07b91e" },
  { value: "property_damage", label: "ui.property.damage.79e46c" },
  { value: "near_miss", label: "ui.near.miss.661e7e" },
  { value: "other", label: "ui.other.6e6a6f" },
  { value: "unknown", label: "ui.unknown.bc7819" },
] as const;

/**
 * The two event types that imply a person was hurt. Mirrors the backend's
 * `hasInjury`, which is what makes `injurySeverity`, `medicalTreatment` and
 * `injuryDescription` relevant at all.
 */
const INJURY_EVENT_TYPES: readonly string[] = ["injury", "illness"];

const DOCUMENT_CATEGORY_OPTIONS: Array<{
  value: ClaimTimeEvidenceCategory;
  label: string;
}> = [
  { value: "proof_of_purchase", label: "ui.proof.of.purchase.46c22f" },
  { value: "product_photo", label: "ui.product.photo.5a6865" },
  { value: "incident_evidence", label: "ui.incident.evidence.c39c94" },
];

function formatDocumentCategory(category: DocumentCategory) {
  return (
    DOCUMENT_CATEGORY_OPTIONS.find((option) => option.value === category)
      ?.label ?? category
  );
}

function describeEvidenceRule(rule: CampaignEvidenceRequirement) {
  const minimum = Math.max(rule.minimumFiles, rule.required ? 1 : 0);
  const maximum = rule.maximumFiles;
  const requiredLabel = rule.required || minimum > 0 ? "form.required" : "form.optional";
  return message('evidence.rule', { requirement: message(requiredLabel), category: message(formatDocumentCategory(rule.category)), minimum, maximum });
}

function formatMimeTypes(mimeTypes: string[]) {
  return mimeTypes
    .map((mimeType) =>
      mimeType.replace("image/", "").replace("application/", ""),
    )
    .join(", ");
}

// Six-state upload lifecycle labels (design §5.4). Colors only — the wording
// tracks the server-derived status values, never an optimistic "accepted".
const DOCUMENT_STATUS_META: Record<
  string,
  { label: string; className: string }
> = {
  uploading: {
    label: "ui.uploading.de2724",
    className: "bg-[#f4f4f5] text-[#606266] border-[#dcdfe6]",
  },
  verifying: {
    label: "ui.verifying.691f43",
    className: "bg-[#ecf5ff] text-[#409eff] border-[#b3d8ff]",
  },
  verified: {
    label: "ui.verified.aed3b8",
    className: "bg-[#f0f9eb] text-[#529b2e] border-[#c2e7b0]",
  },
  scan_pending: {
    label: "ui.scan.pending.897887",
    className: "bg-[#fdf6ec] text-[#b88230] border-[#f5dab1]",
  },
  rejected: {
    label: "ui.rejected.27eeb7",
    className: "bg-[#fef0f0] text-[#f56c6c] border-[#fbc4c4]",
  },
  expired: {
    label: "ui.expired.a689a9",
    className: "bg-[#fef0f0] text-[#f56c6c] border-[#fbc4c4]",
  },
  failed: {
    label: "ui.upload.failed.ad0d06",
    className: "bg-[#fef0f0] text-[#f56c6c] border-[#fbc4c4]",
  },
};

function DocumentStatusChip({
  status,
}: {
  status: ClaimFlowDocumentReceipt["status"];
}) {
  const { t } = useI18n();
  // The fallback is the failure treatment, not the in-progress one: an unrecognised status
  // must not read as "still working on it", which is the promise nobody can keep.
  const meta = DOCUMENT_STATUS_META[status] ?? DOCUMENT_STATUS_META.failed!;
  return (
    <span
      className={`inline-flex items-center rounded border px-1.5 py-0.5 text-[11px] font-medium ${meta.className}`}
    >
      {t(meta.label)}
    </span>
  );
}

function buildDefaultForm(product: Product | undefined): ClaimFlowDraftState {
  return createDefaultForm(product);
}

// ===== Element UI 风格的自定义 Select 组件 =====
function ElSelect({
  value,
  onChange,
  options,
  placeholder = "Select",
  id,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
  placeholder?: string;
  id?: string;
  disabled?: boolean;
}) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);

  const selectedLabel =
    options.find((opt) => opt.value === value)?.label || placeholder;

  return (
    <div
      className="relative"
      onBlur={() => setTimeout(() => setIsOpen(false), 150)}
    >
      <div
        id={id}
        className={`
          flex h-10 w-full cursor-pointer items-center justify-between
          rounded border border-[#dcdfe6] bg-white px-3 text-sm
          transition-colors
          ${disabled ? "cursor-not-allowed bg-[#f5f7fa] text-[#c0c4cc]" : "hover:border-[#409eff]"}
          ${isOpen ? "border-[#409eff] ring-2 ring-[#409eff]/20" : ""}
        `}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span className={value ? "text-[#303133]" : "text-[#c0c4cc]"}>
          {t(selectedLabel)}
        </span>
        <ChevronDown
          className={`
          h-4 w-4 transition-transform duration-200
          ${isOpen ? "rotate-180" : ""}
          ${disabled ? "text-[#c0c4cc]" : "text-[#909399]"}
        `}
        />
      </div>
      {isOpen && !disabled && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-auto rounded border border-[#dcdfe6] bg-white shadow-lg">
          {options.map((option) => (
            <div
              key={option.value}
              className={`
                cursor-pointer px-3 py-2 text-sm transition-colors
                ${option.value === value ? "bg-[#ecf5ff] text-[#409eff]" : "text-[#303133] hover:bg-[#f5f7fa]"}
              `}
              onMouseDown={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
            >
              {t(option.label)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ===== Element UI 风格的复选框 =====
function ElCheckbox({
  checked,
  onChange,
  children,
  disabled = false,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <label
      className={`
      flex cursor-pointer items-start gap-2 text-sm
      ${disabled ? "cursor-not-allowed opacity-60" : ""}
    `}
    >
      <div className="relative flex h-4 w-4 shrink-0 items-center justify-center">
        <input
          type="checkbox"
          className="absolute h-0 w-0 opacity-0"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={`
          flex h-4 w-4 items-center justify-center rounded border transition-all
          ${checked ? "border-[#409eff] bg-[#409eff]" : "border-[#dcdfe6] bg-white hover:border-[#409eff]"}
        `}
        >
          {checked && (
            <CheckCircle2 className="h-3 w-3 text-white" strokeWidth={3} />
          )}
        </div>
      </div>
      <span className="text-[#606266]">{children}</span>
    </label>
  );
}

export function ClaimSubmitWrapper({ campaign }: Props) {
  const { t } = useI18n();
  const firstProduct = campaign.affectedProducts[0];
  const [session, setSession] = useState<ClaimFlowSession | null>(null);
  const [submitted, setSubmitted] = useState<ClaimConfirmation | null>(null);
  /** Set once the consumer has seen Page 4 and moved on to the confirmation. */
  const [disposalAcknowledged, setDisposalAcknowledged] = useState(false);
  const [problem, setProblem] = useState<ProblemDetails | null>(null);
  const [validationMessage, setValidationMessage] = useState<MessageInput | null>(
    null,
  );
  const [pendingRemedyId, setPendingRemedyId] = useState<string | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [bootstrapAttempt, setBootstrapAttempt] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const uploadGeneration = useRef(0);
  // Filtered, not narrowed by type: a campaign may declare a disposal-evidence
  // requirement so the upload endpoint accepts it, but that evidence belongs to
  // the disposal task, which may never be offered to this consumer.
  const evidenceRequirements = (campaign.evidenceRequirements ?? []).filter(
    (rule) => isClaimTimeEvidence(rule.category),
  );
  const privacyNoticeVersion =
    campaign.privacyNotice?.version ?? "not-configured";
  const privacyNoticeHref = `/privacy?campaign=${encodeURIComponent(campaign.slug)}`;
  const reportedInjury =
    session?.form.incident.eventTypes.some((type) =>
      INJURY_EVENT_TYPES.includes(type),
    ) ?? false;

  useEffect(() => {
    if (session) return;

    let cancelled = false;
    Promise.resolve().then(() => {
      if (cancelled) return;

      const restored = claimFlowModule.resume(campaign.slug);
      if (restored) {
        setSession(restored);
        setProblem(null);
        setIsBootstrapping(false);
        return;
      }

      setIsBootstrapping(true);
      const expiredDraft = claimFlowModule.hasExpiredDraft(campaign.slug);
      return claimFlowModule.start(campaign.slug).then((result) => {
        if (cancelled) return;
        if (result.ok) {
          if (expiredDraft) setValidationMessage('draft.renewed');
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
    });

    return () => {
      cancelled = true;
    };
  }, [campaign.slug, firstProduct, session, bootstrapAttempt]);

  const selectedRemedy = useMemo(
    () => campaign.remedies.find((remedy) => remedy.id === session?.remedyCode),
    [campaign.remedies, session?.remedyCode],
  );

  const hasPendingDocuments =
    session?.documents.some(isPendingDocument) ?? false;

  // Poll the authoritative six-state document statuses while anything is still
  // reconciling so chips and the submit gate track server verification.
  useEffect(() => {
    if (!session || !hasPendingDocuments) return;

    let cancelled = false;
    const refresh = async () => {
      const result = await claimFlowModule.refreshDocuments(session);
      if (cancelled || !result.ok) return;
      setSession((current) => {
        if (!current || current.draftId !== session.draftId) return current;
        if (
          JSON.stringify(current.documents) ===
          JSON.stringify(result.data.documents)
        )
          return current;
        const updates = new Map(result.data.documents.map((document) => [document.documentId, document]));
        return claimFlowModule.save({ ...current, documents: current.documents.map((document) => updates.get(document.documentId) ?? document) });
      });
    };

    void refresh();
    const timer = setInterval(() => void refresh(), 4000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [session, hasPendingDocuments]);

  const handleRemoveDocument = async (documentId: string) => {
    if (!session) return;
    setValidationMessage(null);
    setProblem(null);
    const result = await claimFlowModule.removeDocument(session, documentId);
    if (result.ok) {
      setSession((current) => !current || current.draftId !== session.draftId ? current : claimFlowModule.save({ ...current, documents: current.documents.filter((document) => document.documentId !== documentId) }));
    } else {
      setProblem(result.error);
    }
  };

  const handleRefreshDocuments = async () => {
    if (!session) return;
    const result = await claimFlowModule.refreshDocuments(session);
    if (result.ok) {
      setSession((current) => {
        if (!current || current.draftId !== session.draftId) return current;
        const updates = new Map(result.data.documents.map((document) => [document.documentId, document]));
        return claimFlowModule.save({ ...current, documents: current.documents.map((document) => updates.get(document.documentId) ?? document) });
      });
    } else {
      setProblem(result.error);
    }
  };

  const syncSession = (
    updater: (current: ClaimFlowSession) => ClaimFlowSession,
  ) => {
    setSession((current) => {
      if (!current) return current;
      const next = updater(current);
      return claimFlowModule.save(next);
    });
  };

  const updateForm = (
    updater: (form: ClaimFlowDraftState) => ClaimFlowDraftState,
  ) => {
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
      currentStep: "consumer",
      remedyCode: remedy.id,
      form: {
        ...session.form,
        product: {
          ...session.form.product,
          campaignProductId:
            session.form.product.campaignProductId || firstProduct?.id || "",
        },
      },
    });
    setSession(nextSession);
    setPendingRemedyId(null);
  };

  const handleReset = () => {
    uploadGeneration.current += 1;
    setIsUploading(false);
    claimFlowModule.abandon(campaign.slug);
    setSession(null);
    setSubmitted(null);
    setProblem(null);
    setValidationMessage(null);
    setIsBootstrapping(true);
    setBootstrapAttempt((attempt) => attempt + 1);
  };

  const validateEvidenceRequirements = (
    documents: ClaimFlowSession["documents"],
  ): MessageInput | null => {
    for (const rule of evidenceRequirements) {
      const count = documents.filter(
        (document) => document.category === rule.category,
      ).length;
      if (count > rule.maximumFiles) {
        return message('validation.files.maximum', { category: message(formatDocumentCategory(rule.category)), count: rule.maximumFiles });
      }
      if (count < rule.minimumFiles || (rule.required && count === 0)) {
        const minimum = Math.max(rule.minimumFiles, rule.required ? 1 : 0);
        return message('validation.files.minimum', { category: message(formatDocumentCategory(rule.category)), count: minimum });
      }
    }
    return null;
  };

  const validateBeforeSubmit = (current: ClaimFlowSession): MessageInput | null => {
    const { form } = current;
    if (!current.remedyCode) return "ui.please.choose.a.resolution.option.first.9a68ee";
    if (
      !form.consumer.firstName.trim() ||
      !form.consumer.lastName.trim() ||
      !form.consumer.email.trim()
    ) {
      return "validation.contactRequired";
    }
    // Design §5.5 / P2-1: shipment-style remedies require the delivery
    // address; a refund may leave it out entirely. A partially typed refund
    // address must be completed or cleared — never submitted half-formed.
    // Ask whether this remedy needs an address rather than assuming every
    // non-refund remedy is a shipment.
    const addressNeeded = remedyRequiresMailingAddress(selectedRemedy?.type);
    const addressValues = [
      form.consumer.addressLine1,
      form.consumer.city,
      form.consumer.state,
      form.consumer.postalCode,
    ];
    const addressComplete = addressValues.every(
      (field) => field.trim().length > 0,
    );
    const addressStarted = addressValues.some(
      (field) => field.trim().length > 0,
    );
    if (addressNeeded && !addressComplete) {
      return "ui.please.complete.your.mailing.address.before.submission.4830fe";
    }
    if (!addressNeeded && addressStarted && !addressComplete) {
      return "ui.please.finish.or.clear.the.mailing.address.a97f04";
    }
    if ((form.consumer.countryCode.trim() || "US").length !== 2) {
      return "ui.please.enter.a.valid.2.letter.country.757f00";
    }
    if (!form.product.campaignProductId)
      return "ui.please.choose.the.affected.product.14e0ba";
    if (!form.privacyAccepted || !form.accuracyAccepted) {
      return "ui.please.accept.both.required.attestations.before.submission.a4479d";
    }
    const evidenceError = validateEvidenceRequirements(current.documents);
    if (evidenceError) return evidenceError;
    // Design §16: only verified documents may enter submission. The API
    // enforces the same rule server-side; this is the consumer-side mirror.
    if (!allDocumentsVerified(current.documents)) {
      const blocker = current.documents.find(
        (document) => document.status !== "verified",
      );
      switch (blocker?.status) {
        case "uploading":
        case "verifying":
          return "ui.one.or.more.files.are.still.being.3fe5c6";
        case "scan_pending":
          return "ui.security.scanning.is.still.in.progress.for.f00b36";
        case "rejected":
          return "ui.a.file.was.rejected.during.verification.please.d8710b";
        case "expired":
          return "ui.an.upload.expired.before.it.could.be.1570f7";
        case "failed":
          // Waiting cannot help here, so the message says what does — and names the file,
          // which is the only thing that tells the consumer which row to remove.
          return message('validation.file.failed', { file: blocker.fileName });
        default:
          return "ui.all.evidence.files.must.be.verified.before.a1d87d";
      }
    }
    if (form.incidentAnswer !== "no") {
      if (!form.incident.occurredDate && !form.incident.occurredDateUnknown) {
        return "ui.for.incident.claims.provide.an.incident.date.50c8ae";
      }
      if (form.incidentAnswer === "yes" && !form.incident.eventTypes.length) {
        return "ui.select.at.least.one.incident.event.type.ba083c";
      }
      // Mirrors the contract's cross-field rule so the answer arrives as an
      // inline message rather than a 422 after the whole form is submitted.
      // The new fields stay optional here — that is what makes this release
      // stage safe to ship ahead of the backend's strict-validation switch.
      const namesTreatment =
        form.incident.medicalTreatment !== "" &&
        form.incident.medicalTreatment !== "none" &&
        form.incident.medicalTreatment !== "unknown";
      if (form.incident.medicalTreatmentReceived === "no" && namesTreatment) {
        return "ui.you.answered.that.no.medical.treatment.was.24f3c8";
      }
      // The mirror half: "treatment was received" owes a type that is not
      // "none". "Unknown" stays allowed — treated but unsure what kind is an
      // honest answer. Same rule the backend enforces once its strict switch
      // is on; the client applies it now so the fix is one field away.
      if (
        form.incident.medicalTreatmentReceived === "yes" &&
        (form.incident.medicalTreatment === "" ||
          form.incident.medicalTreatment === "none")
      ) {
        return "You answered that medical treatment was received, but no treatment type is selected. Select the type of treatment received.";
      }
      // `other` without a description is a category with nothing in it.
      if (
        form.incident.failureMode === "other" &&
        !form.incident.failureModeOtherDescription.trim()
      ) {
        return "incident.other.required";
      }
    }
    return null;
  };

  const onUploadFiles = async (
    category: DocumentCategory,
    files: FileList | null,
  ) => {
    if (!session || !files?.length) return;
    const selectedRule = evidenceRequirements.find(
      (rule) => rule.category === category,
    );
    if (selectedRule) {
      const existingCount = session.documents.filter(
        (document) => document.category === category,
      ).length;
      if (existingCount + files.length > selectedRule.maximumFiles) {
        setValidationMessage(
          message('validation.files.limit', { category: message(formatDocumentCategory(category)), count: selectedRule.maximumFiles }),
        );
        return;
      }
    }
    const generation = ++uploadGeneration.current;
    setIsUploading(true);
    setValidationMessage(null);
    setProblem(null);

    let nextSession = session;
    for (const file of Array.from(files)) {
      const result = await claimFlowModule.addDocument(
        nextSession,
        file,
        category,
      );
      if (generation !== uploadGeneration.current) return;
      if (!result.ok) {
        setProblem(result.error);
        setIsUploading(false);
        return;
      }
      nextSession = result.data.session;
      const receipt = result.data.receipt;
      setSession((current) => !current || current.draftId !== session.draftId ? current : claimFlowModule.save({ ...current, documents: [...current.documents.filter((document) => document.documentId !== receipt.documentId), receipt] }));
    }

    setIsUploading(false);
  };

  if (submitted) {
    // Page 4 branch. The server decides: a disposal task comes back only when the
    // pinned campaign version carries an approved instruction version backed by an
    // authorizing approval. When it is absent — the normal case — this step is
    // skipped entirely rather than shown empty, which is what keeps an
    // inapplicable recall from demanding a disposal declaration.
    if (submitted.disposal && !disposalAcknowledged) {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-2 rounded border border-[#b3d8ff] bg-[#ecf5ff] p-4 text-sm text-[#303133]">
            <CheckCircle2
              className="h-5 w-5 shrink-0 text-[#409eff]"
              aria-hidden="true"
            />
            <p>
              {t("ui.your.claim.was.accepted.reference.05704a")}{t(" ")}
              <span className="font-mono font-semibold">
                {submitted.caseReference}
              </span>
              {t("ui.one.more.step.may.apply.to.your.592060")}</p>
          </div>

          <DisposalTaskLoader
            taskId={submitted.disposal.taskId}
            supportContact={campaign.manufacturerContact}
          />

          <div className="flex flex-wrap items-center gap-3">
            <Button type="button" onClick={() => setDisposalAcknowledged(true)}>
              {t("ui.continue.2e0262")}</Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDisposalAcknowledged(true)}
            >
              {t("ui.i.will.come.back.to.this.later.4b166f")}</Button>
          </div>
          <p className="text-xs text-[#909399]">
            {t("ui.you.can.return.to.this.step.from.840acf")}</p>
        </div>
      );
    }

    return (
      <div className="text-center py-12 space-y-5 rounded border border-[#dcdfe6] bg-white">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border border-[#b3d8ff] bg-[#ecf5ff]">
          <CheckCircle2 className="h-8 w-8 text-[#409eff]" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-[#303133] mb-1">
            {t("ui.claim.submitted.4bb1c3")}</h3>
          <p className="text-sm text-[#606266]">
            {t("ui.your.claim.was.accepted.by.koi.recall.a4dcdf")}</p>
        </div>
        <div className="inline-flex flex-col items-center rounded border border-[#dcdfe6] bg-[#f5f7fa] p-4">
          <p className="text-[10px] font-bold text-[#909399] uppercase tracking-widest mb-1">
            {t("ui.case.reference.4461c6")}</p>
          <p className="text-2xl font-mono font-bold text-[#409eff]">
            {submitted.caseReference}
          </p>
        </div>
        <div className="space-y-2 text-sm text-[#606266] max-w-md mx-auto">
          <p className="flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#409eff]" />
            {t("ui.confirmation.email.queued.6df1d3")}{" "}{t(submitted.emailStatus)}
          </p>
          <p className="flex items-center justify-center gap-2">
            <ClipboardList className="h-4 w-4 text-[#409eff]" />
            {t("ui.next.step.934fd4")}{" "}{t(submitted.nextStep)}
          </p>
        </div>
        {submitted.disposal && (
          // The confirmation email includes this task's resume link when the
          // submission opened a disposal step.
          <div className="space-y-1 rounded border border-[#b3d8ff] bg-[#ecf5ff] p-3 text-sm text-[#303133] max-w-md mx-auto">
            <p className="font-semibold">
              {t("ui.a.disposal.step.was.opened.for.your.883082")}</p>
            <p className="text-[#606266]">
              {t("ui.return.with.the.link.below.or.from.c62b1e")}</p>
            <Link
              href={submitted.disposal.resumePath}
              className="inline-flex items-center gap-1.5 font-semibold text-[#409eff] underline"
            >
              {t("ui.return.to.the.disposal.step.9f4868")}<ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        )}

        <div className="space-y-3">
          <div className="space-y-1 text-sm text-[#606266]">
            <p>
              {t("ui.use.your.case.reference.on.this.device.6a0664")}</p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/claims">
              <Button
                size="sm"
                variant="outline"
                className="border-[#dcdfe6] text-[#606266] hover:border-[#409eff] hover:text-[#409eff]"
              >
                {t("ui.view.claims.fcd41d")}</Button>
            </Link>
            <Link href="/lookup">
              <Button
                size="sm"
                variant="outline"
                className="border-[#dcdfe6] text-[#606266] hover:border-[#409eff] hover:text-[#409eff]"
              >
                {t("nav.checkStatus")}</Button>
            </Link>
            <Button
              size="sm"
              onClick={handleReset}
              className="bg-[#409eff] text-white hover:bg-[#337ecc] border-0"
            >
              {t("ui.start.another.claim.faff29")}</Button>
          </div>
        </div>
      </div>
    );
  }

  if (isBootstrapping) {
    return (
      <div className="rounded border border-[#dcdfe6] bg-white p-6 text-sm text-[#606266] flex items-center gap-3">
        <Loader2 className="h-4 w-4 animate-spin text-[#409eff]" />
        {t("ui.preparing.secure.claim.session.7dbc0c")}</div>
    );
  }

  if (problem && !session) {
    return (
      <div className="rounded border border-red-500/20 bg-red-50 p-4 space-y-2">
        <p className="text-sm font-semibold text-red-500 flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          {t("ui.claim.flow.unavailable.ed60bc")}</p>
        <p className="text-sm text-[#606266]">{t(problemMessage(problem))}</p>
        <Button type="button" variant="outline" onClick={() => {
          setProblem(null);
          setIsBootstrapping(true);
          setBootstrapAttempt((attempt) => attempt + 1);
        }}>{t('claims.retry')}</Button>
        {problem.requestId && (
          <p className="text-xs text-[#909399]">
            {t("ui.request.id.364dc5")}{" "}{problem.requestId}
          </p>
        )}
      </div>
    );
  }

  if (!session || !selectedRemedy) {
    return (
      <div className="space-y-4">
      {validationMessage && <p role="status" className="rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">{t(validationMessage)}</p>}
      <RemedyOptions
        remedies={campaign.remedies}
        onSelect={handleSelect}
        busyRemedyId={pendingRemedyId}
      />
      </div>
    );
  }

  return (
    <div
      data-claim-form
      className="rounded border border-[#dcdfe6] bg-white p-4 space-y-6 sm:p-5"
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#909399]">
          {t("ui.draft.ready.96b5a4")}</p>
        <h3 className="text-lg font-bold text-[#303133] mt-1">
          {t("ui.requested.resolution.captured.12aba7")}</h3>
        <p className="text-sm text-[#606266] mt-1">
          {t("ui.resolution.8a9c4d")}{selectedRemedy.id}{t("ui.is.stored.in.the.draft.session.this.43a2c8")}</p>
      </div>

      <div className="rounded border border-[#dcdfe6] bg-[#f5f7fa] p-4 text-sm text-[#606266] space-y-2">
        <p>
          <span className="font-semibold text-[#303133]">{t("ui.draft.id.065855")}</span>{t(" ")}
          {session.draftId}
        </p>
        <p>
          <span className="font-semibold text-[#303133]">{t("ui.expires.081ecd")}</span>{t(" ")}
          {session.expiresAt}
        </p>
        <p>
          <span className="font-semibold text-[#303133]">
            {t("ui.requested.resolution.d3b23c")}</span>{t(" ")}
          {selectedRemedy.title}
        </p>
        <p>
          <span className="font-semibold text-[#303133]">{t("ui.form.version.745926")}</span>{t(" ")}
          {CLAIM_FLOW_FORM_VERSION}
        </p>
      </div>

      <div className="rounded border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        {t("ui.your.selection.is.a.requested.resolution.and.1b552a")}</div>

      {selectedRemedy.type === "refund" && (
        <div className="rounded border border-[#dcdfe6] bg-[#f5f7fa] p-4 text-sm text-[#606266]">
          {t("ui.if.approved.the.refund.will.be.processed.223913")}</div>
      )}

      {/* ===== 消费者信息 ===== */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label
            htmlFor="first-name"
            className="text-sm font-medium text-[#303133]"
          >
            {t("claim.firstName")}</Label>
          <Input
            id="first-name"
            value={session.form.consumer.firstName}
            onChange={(event) =>
              updateForm((form) => ({
                ...form,
                consumer: { ...form.consumer, firstName: event.target.value },
              }))
            }
            className="h-10 rounded border border-[#dcdfe6] px-3 text-sm text-[#303133] transition-colors placeholder:text-[#c0c4cc] focus:border-[#409eff] focus:outline-none focus:ring-2 focus:ring-[#409eff]/20"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="last-name"
            className="text-sm font-medium text-[#303133]"
          >
            {t("claim.lastName")}</Label>
          <Input
            id="last-name"
            value={session.form.consumer.lastName}
            onChange={(event) =>
              updateForm((form) => ({
                ...form,
                consumer: { ...form.consumer, lastName: event.target.value },
              }))
            }
            className="h-10 rounded border border-[#dcdfe6] px-3 text-sm text-[#303133] transition-colors placeholder:text-[#c0c4cc] focus:border-[#409eff] focus:outline-none focus:ring-2 focus:ring-[#409eff]/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email" className="text-sm font-medium text-[#303133]">
            {t("contact.email")}</Label>
          <Input
            id="email"
            type="email"
            value={session.form.consumer.email}
            onChange={(event) =>
              updateForm((form) => ({
                ...form,
                consumer: { ...form.consumer, email: event.target.value },
              }))
            }
            className="h-10 rounded border border-[#dcdfe6] px-3 text-sm text-[#303133] transition-colors placeholder:text-[#c0c4cc] focus:border-[#409eff] focus:outline-none focus:ring-2 focus:ring-[#409eff]/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone" className="text-sm font-medium text-[#303133]">
            {t("contact.phone")}</Label>
          <Input
            id="phone"
            value={session.form.consumer.phone}
            onChange={(event) =>
              updateForm((form) => ({
                ...form,
                consumer: { ...form.consumer, phone: event.target.value },
              }))
            }
            className="h-10 rounded border border-[#dcdfe6] px-3 text-sm text-[#303133] transition-colors placeholder:text-[#c0c4cc] focus:border-[#409eff] focus:outline-none focus:ring-2 focus:ring-[#409eff]/20"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label
            htmlFor="address-line1"
            className="text-sm font-medium text-[#303133]"
          >
            {t("ui.address.line.1.168619")}</Label>
          <Input
            id="address-line1"
            value={session.form.consumer.addressLine1}
            onChange={(event) =>
              updateForm((form) => ({
                ...form,
                consumer: {
                  ...form.consumer,
                  addressLine1: event.target.value,
                },
              }))
            }
            className="h-10 rounded border border-[#dcdfe6] px-3 text-sm text-[#303133] transition-colors placeholder:text-[#c0c4cc] focus:border-[#409eff] focus:outline-none focus:ring-2 focus:ring-[#409eff]/20"
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <Label
            htmlFor="address-line2"
            className="text-sm font-medium text-[#303133]"
          >
            {t("ui.address.line.2.88d419")}</Label>
          <Input
            id="address-line2"
            value={session.form.consumer.addressLine2}
            onChange={(event) =>
              updateForm((form) => ({
                ...form,
                consumer: {
                  ...form.consumer,
                  addressLine2: event.target.value,
                },
              }))
            }
            className="h-10 rounded border border-[#dcdfe6] px-3 text-sm text-[#303133] transition-colors placeholder:text-[#c0c4cc] focus:border-[#409eff] focus:outline-none focus:ring-2 focus:ring-[#409eff]/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city" className="text-sm font-medium text-[#303133]">
            {t("ui.city.427162")}</Label>
          <Input
            id="city"
            value={session.form.consumer.city}
            onChange={(event) =>
              updateForm((form) => ({
                ...form,
                consumer: { ...form.consumer, city: event.target.value },
              }))
            }
            className="h-10 rounded border border-[#dcdfe6] px-3 text-sm text-[#303133] transition-colors placeholder:text-[#c0c4cc] focus:border-[#409eff] focus:outline-none focus:ring-2 focus:ring-[#409eff]/20"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="state" className="text-sm font-medium text-[#303133]">
            {t("ui.state.province.d9a83a")}</Label>
          <Input
            id="state"
            value={session.form.consumer.state}
            onChange={(event) =>
              updateForm((form) => ({
                ...form,
                consumer: { ...form.consumer, state: event.target.value },
              }))
            }
            className="h-10 rounded border border-[#dcdfe6] px-3 text-sm text-[#303133] transition-colors placeholder:text-[#c0c4cc] focus:border-[#409eff] focus:outline-none focus:ring-2 focus:ring-[#409eff]/20"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="postal-code"
            className="text-sm font-medium text-[#303133]"
          >
            {t("ui.postal.code.d7432c")}</Label>
          <Input
            id="postal-code"
            value={session.form.consumer.postalCode}
            onChange={(event) =>
              updateForm((form) => ({
                ...form,
                consumer: { ...form.consumer, postalCode: event.target.value },
              }))
            }
            className="h-10 rounded border border-[#dcdfe6] px-3 text-sm text-[#303133] transition-colors placeholder:text-[#c0c4cc] focus:border-[#409eff] focus:outline-none focus:ring-2 focus:ring-[#409eff]/20"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="country-code"
            className="text-sm font-medium text-[#303133]"
          >
            {t("ui.country.code.2eb6c4")}</Label>
          <Input
            id="country-code"
            maxLength={2}
            value={session.form.consumer.countryCode}
            onChange={(event) =>
              updateForm((form) => ({
                ...form,
                consumer: {
                  ...form.consumer,
                  countryCode: event.target.value.toUpperCase(),
                },
              }))
            }
            className="h-10 rounded border border-[#dcdfe6] px-3 text-sm text-[#303133] transition-colors placeholder:text-[#c0c4cc] focus:border-[#409eff] focus:outline-none focus:ring-2 focus:ring-[#409eff]/20"
          />
        </div>
      </div>

      {/* ===== 产品信息 ===== */}
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label
            htmlFor="product"
            className="text-sm font-medium text-[#303133]"
          >
            {t("ui.affected.product.1c8cb2")}</Label>
          <ElSelect
            id="product"
            value={session.form.product.campaignProductId}
            onChange={(value) =>
              updateForm((form) => ({
                ...form,
                product: { ...form.product, campaignProductId: value },
              }))
            }
            options={campaign.affectedProducts.map((p) => ({
              value: p.id,
              label: p.name,
            }))}
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="purchase-channel"
            className="text-sm font-medium text-[#303133]"
          >
            {t("ui.purchase.channel.7b19fa")}</Label>
          <ElSelect
            id="purchase-channel"
            value={session.form.product.purchaseChannel}
            onChange={(value) =>
              updateForm((form) => ({
                ...form,
                product: {
                  ...form.product,
                  purchaseChannel:
                    value as ClaimFlowDraftState["product"]["purchaseChannel"],
                },
              }))
            }
            options={PURCHASE_CHANNEL_OPTIONS}
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="purchase-date"
            className="text-sm font-medium text-[#303133]"
          >
            {t("ui.purchase.date.a40d89")}</Label>
          <Input
            id="purchase-date"
            type="date"
            value={session.form.product.purchaseDate}
            onChange={(event) =>
              updateForm((form) => ({
                ...form,
                product: { ...form.product, purchaseDate: event.target.value },
              }))
            }
            className="h-10 rounded border border-[#dcdfe6] px-3 text-sm text-[#303133] transition-colors placeholder:text-[#c0c4cc] focus:border-[#409eff] focus:outline-none focus:ring-2 focus:ring-[#409eff]/20"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="order-number"
            className="text-sm font-medium text-[#303133]"
          >
            {t("ui.order.number.1c14bf")}</Label>
          <Input
            id="order-number"
            value={session.form.product.orderNumber}
            onChange={(event) =>
              updateForm((form) => ({
                ...form,
                product: { ...form.product, orderNumber: event.target.value },
              }))
            }
            className="h-10 rounded border border-[#dcdfe6] px-3 text-sm text-[#303133] transition-colors placeholder:text-[#c0c4cc] focus:border-[#409eff] focus:outline-none focus:ring-2 focus:ring-[#409eff]/20"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="lot-code"
            className="text-sm font-medium text-[#303133]"
          >
            {t("ui.lot.code.be1bd4")}</Label>
          <Input
            id="lot-code"
            value={session.form.product.lotCode}
            onChange={(event) =>
              updateForm((form) => ({
                ...form,
                product: { ...form.product, lotCode: event.target.value },
              }))
            }
            className="h-10 rounded border border-[#dcdfe6] px-3 text-sm text-[#303133] transition-colors placeholder:text-[#c0c4cc] focus:border-[#409eff] focus:outline-none focus:ring-2 focus:ring-[#409eff]/20"
          />
        </div>
        <div className="space-y-2">
          <Label
            htmlFor="date-code"
            className="text-sm font-medium text-[#303133]"
          >
            {t("ui.date.code.39e679")}</Label>
          <Input
            id="date-code"
            value={session.form.product.dateCode}
            onChange={(event) =>
              updateForm((form) => ({
                ...form,
                product: { ...form.product, dateCode: event.target.value },
              }))
            }
            className="h-10 rounded border border-[#dcdfe6] px-3 text-sm text-[#303133] transition-colors placeholder:text-[#c0c4cc] focus:border-[#409eff] focus:outline-none focus:ring-2 focus:ring-[#409eff]/20"
          />
        </div>
      </div>

      {/* ===== 事故信息 ===== */}
      <div className="space-y-4 rounded border border-[#dcdfe6] p-4">
        <div className="space-y-2">
          <Label
            htmlFor="incident-answer"
            className="text-sm font-medium text-[#303133]"
          >
            {t("ui.did.the.recalled.product.cause.an.incident.bdbc18")}</Label>
          <ElSelect
            id="incident-answer"
            value={session.form.incidentAnswer}
            onChange={(value) =>
              updateForm((form) => ({
                ...form,
                incidentAnswer: value as ClaimFlowDraftState["incidentAnswer"],
                incident:
                  value === "no"
                    ? buildDefaultForm(firstProduct).incident
                    : form.incident,
              }))
            }
            options={[
              { value: "no", label: "ui.no.816c52" },
              { value: "yes", label: "ui.yes.5397e0" },
              { value: "unsure", label: "ui.unsure.205738" },
            ]}
          />
        </div>

        {session.form.incidentAnswer !== "no" && (
          <>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label
                  htmlFor="incident-date"
                  className="text-sm font-medium text-[#303133]"
                >
                  {t("ui.incident.date.795efc")}</Label>
                <Input
                  id="incident-date"
                  type="date"
                  value={session.form.incident.occurredDate}
                  onChange={(event) =>
                    updateForm((form) => ({
                      ...form,
                      incident: {
                        ...form.incident,
                        occurredDate: event.target.value,
                      },
                    }))
                  }
                  className="h-10 rounded border border-[#dcdfe6] px-3 text-sm text-[#303133] transition-colors placeholder:text-[#c0c4cc] focus:border-[#409eff] focus:outline-none focus:ring-2 focus:ring-[#409eff]/20"
                />
              </div>
              <div className="flex items-center pt-7">
                <ElCheckbox
                  checked={session.form.incident.occurredDateUnknown}
                  onChange={(checked) =>
                    updateForm((form) => ({
                      ...form,
                      incident: {
                        ...form.incident,
                        occurredDateUnknown: checked,
                      },
                    }))
                  }
                >
                  {t("ui.date.unknown.798f8b")}</ElCheckbox>
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="incident-description"
                className="text-sm font-medium text-[#303133]"
              >
                {t("ui.what.happened.e9ef65")}</Label>
              <Textarea
                id="incident-description"
                rows={4}
                value={session.form.incident.eventDescription}
                onChange={(event) =>
                  updateForm((form) => ({
                    ...form,
                    incident: {
                      ...form.incident,
                      eventDescription: event.target.value,
                    },
                  }))
                }
                className="rounded border border-[#dcdfe6] px-3 py-2 text-sm text-[#303133] transition-colors placeholder:text-[#c0c4cc] focus:border-[#409eff] focus:outline-none focus:ring-2 focus:ring-[#409eff]/20"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium text-[#303133]">
                {t("ui.event.types.0b420f")}</Label>
              <div className="grid gap-2 sm:grid-cols-2">
                {INCIDENT_EVENT_OPTIONS.map((option) => {
                  const checked = session.form.incident.eventTypes.includes(
                    option.value,
                  );
                  return (
                    <ElCheckbox
                      key={option.value}
                      checked={checked}
                      onChange={(eventChecked) =>
                        updateForm((form) => ({
                          ...form,
                          incident: {
                            ...form.incident,
                            eventTypes: eventChecked
                              ? [...form.incident.eventTypes, option.value]
                              : form.incident.eventTypes.filter(
                                  (value) => value !== option.value,
                                ),
                          },
                        }))
                      }
                    >
                      {t(option.label)}
                    </ElCheckbox>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label
                  htmlFor="injury-severity"
                  className="text-sm font-medium text-[#303133]"
                >
                  {t("ui.injury.severity.a17527")}</Label>
                <ElSelect
                  id="injury-severity"
                  value={session.form.incident.injurySeverity}
                  onChange={(value) =>
                    updateForm((form) => ({
                      ...form,
                      incident: {
                        ...form.incident,
                        injurySeverity:
                          value as ClaimFlowDraftState["incident"]["injurySeverity"],
                      },
                    }))
                  }
                  options={[
                    { value: "", label: "ui.select.859822" },
                    { value: "none", label: "ui.none.6eef66" },
                    { value: "minor", label: "ui.minor.100b45" },
                    {
                      value: "medical_attention",
                      label: "ui.needed.medical.attention.9918fa",
                    },
                    { value: "hospitalized", label: "ui.hospitalized.e40651" },
                    { value: "death", label: "ui.death.d8c7d8" },
                    { value: "unknown", label: "ui.unknown.bc7819" },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="medical-treatment"
                  className="text-sm font-medium text-[#303133]"
                >
                  {t("ui.medical.treatment.889166")}</Label>
                <ElSelect
                  id="medical-treatment"
                  value={session.form.incident.medicalTreatment}
                  onChange={(value) =>
                    updateForm((form) => ({
                      ...form,
                      incident: {
                        ...form.incident,
                        medicalTreatment:
                          value as ClaimFlowDraftState["incident"]["medicalTreatment"],
                      },
                    }))
                  }
                  options={[
                    { value: "", label: "ui.select.859822" },
                    { value: "none", label: "ui.none.6eef66" },
                    { value: "first_aid", label: "ui.first.aid.bbe1aa" },
                    { value: "outpatient", label: "ui.outpatient.clinic.563c17" },
                    { value: "emergency", label: "ui.emergency.room.688a5c" },
                    { value: "hospitalized", label: "ui.hospitalized.e40651" },
                    { value: "unknown", label: "ui.unknown.bc7819" },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="used-as-intended"
                  className="text-sm font-medium text-[#303133]"
                >
                  {t("ui.used.as.intended.57fc06")}</Label>
                <ElSelect
                  id="used-as-intended"
                  value={session.form.incident.usedAsIntended}
                  onChange={(value) =>
                    updateForm((form) => ({
                      ...form,
                      incident: {
                        ...form.incident,
                        usedAsIntended:
                          value as ClaimFlowDraftState["incident"]["usedAsIntended"],
                      },
                    }))
                  }
                  options={[
                    { value: "", label: "ui.select.859822" },
                    { value: "yes", label: "ui.yes.5397e0" },
                    { value: "no", label: "ui.no.816c52" },
                    { value: "unknown", label: "ui.unknown.bc7819" },
                  ]}
                />
              </div>
            </div>

            {/* ===== Structured detail (P0-4) ===== */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label
                  htmlFor="unit-type"
                  className="text-sm font-medium text-[#303133]"
                >
                  {t("ui.which.unit.was.involved.93a4fc")}</Label>
                <ElSelect
                  id="unit-type"
                  value={session.form.incident.unitType}
                  onChange={(value) =>
                    updateForm((form) => ({
                      ...form,
                      incident: {
                        ...form.incident,
                        unitType:
                          value as ClaimFlowDraftState["incident"]["unitType"],
                      },
                    }))
                  }
                  options={[
                    { value: "", label: "ui.select.859822" },
                    { value: "original", label: "ui.the.recalled.unit.e34e33" },
                    { value: "replacement", label: "ui.a.replacement.unit.019af3" },
                    { value: "unknown", label: "ui.unknown.bc7819" },
                  ]}
                />
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="failure-mode"
                  className="text-sm font-medium text-[#303133]"
                >
                  {t("ui.how.did.the.product.fail.504861")}</Label>
                <ElSelect
                  id="failure-mode"
                  value={session.form.incident.failureMode}
                  onChange={(value) =>
                    updateForm((form) => ({
                      ...form,
                      incident: {
                        ...form.incident,
                        failureMode:
                          value as ClaimFlowDraftState["incident"]["failureMode"],
                        // The description belongs to `other` and only to
                        // `other` — the API rejects the pair otherwise — so
                        // leaving `other` drops the stale text instead of
                        // submitting a contradiction.
                        failureModeOtherDescription:
                          value === "other"
                            ? form.incident.failureModeOtherDescription
                            : "",
                      },
                    }))
                  }
                  options={[
                    { value: "", label: "ui.select.859822" },
                    { value: "body_rupture", label: "ui.body.or.casing.broke.dbe0e9" },
                    {
                      value: "battery_exposure",
                      label: "ui.battery.became.exposed.f66455",
                    },
                    { value: "choking_hazard", label: "ui.small.part.came.loose.cae5eb" },
                    { value: "leak", label: "ui.leaked.34a98d" },
                    { value: "overheating", label: "ui.overheated.8baab4" },
                    { value: "other", label: "ui.other.6e6a6f" },
                    { value: "unknown", label: "ui.unknown.bc7819" },
                  ]}
                />
              </div>
              {/* `other` names an unlisted failure mode, so the answer is the
                  description itself: without it "Other" carries no reportable
                  fact. Mirrors the backend's strict-stage rule client-side so
                  the consumer hears it inline, not as a 422. */}
              {session.form.incident.failureMode === "other" && (
                <div className="space-y-2 md:col-span-2">
                  <Label
                    htmlFor="failure-mode-other"
                    className="text-sm font-medium text-[#303133]"
                  >
                    {t("incident.other.label")}
                  </Label>
                  <Textarea
                    id="failure-mode-other"
                    rows={3}
                    value={session.form.incident.failureModeOtherDescription}
                    onChange={(event) =>
                      updateForm((form) => ({
                        ...form,
                        incident: {
                          ...form.incident,
                          failureModeOtherDescription: event.target.value,
                        },
                      }))
                    }
                    placeholder={t("incident.other.placeholder")}
                    className="rounded border border-[#dcdfe6] px-3 py-2 text-sm text-[#303133] transition-colors placeholder:text-[#c0c4cc] focus:border-[#409eff] focus:outline-none focus:ring-2 focus:ring-[#409eff]/20"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label
                  htmlFor="treatment-received"
                  className="text-sm font-medium text-[#303133]"
                >
                  {t("ui.was.medical.treatment.received.801600")}</Label>
                <ElSelect
                  id="treatment-received"
                  value={session.form.incident.medicalTreatmentReceived}
                  onChange={(value) =>
                    updateForm((form) => ({
                      ...form,
                      incident: {
                        ...form.incident,
                        medicalTreatmentReceived:
                          value as ClaimFlowDraftState["incident"]["medicalTreatmentReceived"],
                      },
                    }))
                  }
                  options={[
                    { value: "", label: "ui.select.859822" },
                    { value: "yes", label: "ui.yes.5397e0" },
                    { value: "no", label: "ui.no.816c52" },
                    { value: "unknown", label: "ui.unknown.bc7819" },
                  ]}
                />
              </div>
            </div>

            {/* Asked only when an injury or illness was reported: for a fire or a
                near miss there is no injury to describe. */}
            {reportedInjury && (
              <div className="space-y-2">
                <Label
                  htmlFor="injury-description"
                  className="text-sm font-medium text-[#303133]"
                >
                  {t("ui.describe.the.injury.101375")}</Label>
                <Textarea
                  id="injury-description"
                  rows={3}
                  value={session.form.incident.injuryDescription}
                  onChange={(event) =>
                    updateForm((form) => ({
                      ...form,
                      incident: {
                        ...form.incident,
                        injuryDescription: event.target.value,
                      },
                    }))
                  }
                  placeholder={t("ui.what.injury.occurred.and.what.part.of.01a6f9")}
                  className="rounded border border-[#dcdfe6] px-3 py-2 text-sm text-[#303133] transition-colors placeholder:text-[#c0c4cc] focus:border-[#409eff] focus:outline-none focus:ring-2 focus:ring-[#409eff]/20"
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* ===== 上传区域 ===== */}
      <div className="space-y-3 rounded border border-[#dcdfe6] p-4">
        <div className="space-y-3 rounded border border-dashed border-[#dcdfe6] p-4">
          {(evidenceRequirements.length
            ? evidenceRequirements
            : DOCUMENT_CATEGORY_OPTIONS.map(
                (option) =>
                  ({
                    category: option.value,
                    required: false,
                    minimumFiles: 0,
                    maximumFiles: 5,
                    allowedMimeTypes: [],
                    maximumFileSizeBytes: 0,
                    instructions: "",
                  }) satisfies CampaignEvidenceRequirement,
              )
          ).map((rule) => {
            const uploadedCount = session.documents.filter(
              (document) => document.category === rule.category,
            ).length;
            const limitReached = uploadedCount >= rule.maximumFiles;
            return (
              <div
                key={rule.category}
                className="rounded border border-[#dcdfe6] bg-[#fafafa] p-3"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1 text-sm">
                    <p className="font-medium text-[#303133]">
                      {t(formatDocumentCategory(rule.category))}
                    </p>
                    <p className="text-xs text-[#909399]">
                      {t(rule.required || rule.minimumFiles > 0
                        ? "form.required"
                        : "form.optional")}{t(" ")}
                      {t("ui.uploaded.51a548")}{" "}{uploadedCount} {t("ui.of.de04fa")}{" "}{rule.maximumFiles}
                    </p>
                    {rule.instructions ? (
                      <p className="text-xs text-[#909399]">
                        {rule.instructions}
                      </p>
                    ) : null}
                    {rule.allowedMimeTypes.length ? (
                      <p className="text-xs text-[#909399]">
                        {t("ui.accepted.a93098")}{" "}{formatMimeTypes(rule.allowedMimeTypes)}
                      </p>
                    ) : null}
                  </div>
                  <label
                    className={`
                      inline-flex items-center justify-center gap-2 rounded px-4 py-2 text-sm font-medium text-white transition-colors
                      ${limitReached || isUploading ? "cursor-not-allowed bg-[#a0cfff]" : "cursor-pointer bg-[#409eff] hover:bg-[#337ecc]"}
                    `}
                  >
                    <Upload className="h-4 w-4" />
                    {t(isUploading
                      ? "ui.uploading.070e32"
                      : limitReached
                        ? "ui.limit.reached.068bb7"
                        : message('evidence.add', { category: message(formatDocumentCategory(rule.category)) }))}
                    <input
                      type="file"
                      className="hidden"
                      multiple
                      accept={
                        rule.allowedMimeTypes.length
                          ? rule.allowedMimeTypes.join(",")
                          : undefined
                      }
                      disabled={limitReached || isUploading}
                      onChange={(event) => {
                        void onUploadFiles(rule.category, event.target.files);
                        event.currentTarget.value = "";
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
            {hasPendingDocuments && (
              <div className="flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshDocuments}
                  className="h-7 px-2 text-xs text-[#409eff] hover:text-[#337ecc]"
                >
                  <RefreshCw className="mr-1 h-3 w-3" />
                  {t("ui.refresh.status.ade15a")}</Button>
              </div>
            )}
            {session.documents.map((document) => (
              <div
                key={document.documentId}
                className="flex items-center justify-between rounded border border-[#dcdfe6] px-3 py-2 text-sm"
              >
                <div>
                  <p className="flex items-center gap-2 font-medium text-[#303133]">
                    {document.fileName}
                    <DocumentStatusChip status={document.status} />
                  </p>
                  <p className="text-xs text-[#909399]">
                    {t(formatDocumentCategory(document.category))} |{t(" ")}
                    {document.documentId}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={t('evidence.remove', { file: document.fileName })}
                  onClick={() => void handleRemoveDocument(document.documentId)}
                  className="text-[#909399] hover:text-[#409eff]"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-[#909399]">
            {t("ui.no.evidence.receipts.attached.yet.25a777")}</p>
        )}
      </div>

      <div className="rounded border border-[#dcdfe6] p-4 text-sm text-[#606266]">
        <p className="font-medium text-[#303133]">{t("ui.evidence.requirements.08f233")}</p>
        {evidenceRequirements.length ? (
          <div className="mt-2 space-y-2 text-xs text-[#909399]">
            {evidenceRequirements.map((rule) => (
              <div key={rule.category}>
                <p className="font-medium text-[#303133]">
                  {t(describeEvidenceRule(rule))}
                </p>
                <p>{rule.instructions}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-xs text-[#909399]">
            {t("ui.no.campaign.specific.evidence.requirements.were.returned.21e17d")}</p>
        )}
      </div>

      <div className="rounded border border-[#dcdfe6] p-4 text-sm text-[#606266]">
        <p className="font-medium text-[#303133]">
          {t("ui.mailing.address.a5e34b")}{" "}{t(remedyRequiresMailingAddress(selectedRemedy?.type)
            ? ""
            : " (not required for this remedy)")}
        </p>
        <p className="mt-1 text-xs text-[#909399]">
          {t("ui.used.for.replacement.or.other.remedies.that.9301d2")}</p>
      </div>

      {/* ===== 复选框 ===== */}
      <div className="space-y-2 rounded border border-[#dcdfe6] p-4 text-sm text-[#606266]">
        <ElCheckbox
          checked={session.form.privacyAccepted}
          onChange={(checked) =>
            updateForm((form) => ({ ...form, privacyAccepted: checked }))
          }
        >
          {t("ui.i.acknowledge.0ce652")}{t(" ")}
          <Link
            className="font-medium text-[#409eff] underline"
            href={privacyNoticeHref}
          >
            {t("ui.the.privacy.notice.26bb7e")}</Link>{t(" ")}
          {t("ui.version.d74fc0")}{privacyNoticeVersion}`.
        </ElCheckbox>
        <ElCheckbox
          checked={session.form.accuracyAccepted}
          onChange={(checked) =>
            updateForm((form) => ({ ...form, accuracyAccepted: checked }))
          }
        >
          {t("ui.i.confirm.the.submitted.information.is.accurate.a877c2")}{CLAIM_FLOW_FORM_VERSION}`.
        </ElCheckbox>
      </div>

      {validationMessage && (
        <div className="rounded border border-red-500/20 bg-red-50 p-4 text-sm text-red-500">
          {t(validationMessage)}
        </div>
      )}

      {problem && (
        <div className="rounded border border-red-500/20 bg-red-50 p-4 text-sm text-[#606266]">
          <p className="font-semibold text-red-500">{t("ui.last.api.issue.ee20a9")}</p>
          <p>{t(problemMessage(problem))}</p>
          {problem.requestId && (
            <p className="text-xs text-[#909399] mt-1">
              {t("ui.request.id.364dc5")}{" "}{problem.requestId}
            </p>
          )}
        </div>
      )}

      {/* ===== 底部按钮 ===== */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isSubmitting}
          className="border-[#dcdfe6] text-[#606266] hover:border-[#409eff] hover:text-[#409eff]"
        >
          {t("ui.reset.draft.cc26b5")}</Button>
        <Button
          className="bg-[#409eff] text-white hover:bg-[#337ecc] border-0 disabled:bg-[#a0cfff]"
          disabled={isSubmitting || isUploading}
          onClick={async () => {
            const current = session;
            if (isDraftExpired(current)) {
              setIsSubmitting(true);
              const renewed = await claimFlowModule.renew(current);
              setIsSubmitting(false);
              if (renewed.ok) {
                setSession((latest) => !latest || latest.draftId !== current.draftId ? latest : claimFlowModule.save({ ...renewed.data, form: latest.form, remedyCode: latest.remedyCode }));
                setValidationMessage('draft.renewed');
              } else setProblem(renewed.error);
              return;
            }
            const validationError = validateBeforeSubmit(current);
            if (validationError) {
              setValidationMessage(validationError);
              return;
            }

            setIsSubmitting(true);
            const result = await claimFlowModule.submit(
              current,
              claimFlowModule.buildSubmitInput(current, privacyNoticeVersion, {
                contentLocale: campaign.contentLocale,
                contentTranslationId: campaign.contentTranslationId,
                addressRequired: remedyRequiresMailingAddress(
                  selectedRemedy?.type,
                ),
              }),
            );
            if (result.ok) {
              setIsSubmitting(false);
              setSubmitted(result.data);
              setProblem(null);
              return;
            }

            if (result.status === 410) {
              const renewed = await claimFlowModule.renew(current);
              setIsSubmitting(false);
              if (renewed.ok) {
                setSession((latest) => !latest || latest.draftId !== current.draftId ? latest : claimFlowModule.save({ ...renewed.data, form: latest.form, remedyCode: latest.remedyCode }));
                setValidationMessage('draft.renewed');
                setProblem(null);
                return;
              }
              setProblem(renewed.error);
              return;
            }
            setIsSubmitting(false);
            setProblem(result.error);
          }}
        >
          {t(isSubmitting ? "ui.submitting.46a1a6" : "claim.submitAction")}
        </Button>
      </div>
    </div>
  );
}

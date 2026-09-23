"use client";

import {
  deleteDraftDocument,
  getUploadToken,
  listDraftDocuments,
  submitClaim,
  submitClaimDraft,
  type ClaimSubmissionOk,
  type ClaimSubmissionRequest,
  type ProblemDetails,
  type UploadTokenOk,
  type UploadTokenRequest,
} from "@/lib/api-client";
import { saveDisposalToken } from "@/lib/disposal-access";
import { uploadPrivateObject } from "@/lib/blob-upload";

const SESSION_KEY_PREFIX = "koi_claim_flow:";
export const CLAIM_FLOW_FORM_VERSION = "consumer-claim-form-v1";

export type ClaimFlowStep =
  | "verification"
  | "consumer"
  | "incident"
  | "resolution"
  | "review"
  /**
   * Page 4. Post-submission only: a disposal task exists once the claim is
   * submitted, because that is when the server can pin an instruction version to
   * a case. The step is entered only when the submission returns a task, so the
   * not-applicable branch skips it entirely rather than showing an empty page.
   */
  | "disposal";
export type DocumentCategory = UploadTokenRequest["category"];
export type IncidentAnswer = ClaimSubmissionRequest["incidentAnswer"];
export type IncidentDetailsInput = ClaimSubmissionRequest["incidentDetails"];
export type ClaimProductInput = ClaimSubmissionRequest["products"][number];
export type ClaimConsumerInput = ClaimSubmissionRequest["consumer"];
export type ClaimConsentInput = ClaimSubmissionRequest["consents"][number];
export type PurchaseChannel = ClaimProductInput["purchaseChannel"];

export interface ClaimFlowDocumentReceipt {
  documentId: string;
  pathname: string;
  clientToken: string;
  expiresAt: string;
  category: DocumentCategory;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  status:
    | "uploading"
    | "verifying"
    | "verified"
    | "scan_pending"
    | "rejected"
    | "expired";
}

/** Receipts whose server lifecycle has not reached a terminal state yet. */
export function isPendingDocument(receipt: ClaimFlowDocumentReceipt): boolean {
  return (
    receipt.status === "uploading" ||
    receipt.status === "verifying" ||
    receipt.status === "scan_pending"
  );
}

/** Only verified documents may enter Claim Submission (design §5.4 / §16). */
export function allDocumentsVerified(
  documents: ClaimFlowDocumentReceipt[],
): boolean {
  return documents.every((document) => document.status === "verified");
}

export interface ClaimFlowDraftState {
  locale: string;
  consumer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    addressLine1: string;
    addressLine2: string;
    city: string;
    state: string;
    postalCode: string;
    countryCode: string;
  };
  product: {
    campaignProductId: string;
    quantity: number;
    purchaseChannel: PurchaseChannel;
    purchaseDate: string;
    orderNumber: string;
    lotCode: string;
    dateCode: string;
    flavor: string;
    shape: string;
  };
  incidentAnswer: IncidentAnswer;
  incident: {
    eventDescription: string;
    occurredDate: string;
    occurredDateUnknown: boolean;
    eventTypes: string[];
    // Values are exactly the OpenAPI enum values (design §5.6) — no
    // frontend-only severity model and no remapping layer at submit time.
    injurySeverity:
      | ""
      | "none"
      | "minor"
      | "medical_attention"
      | "hospitalized"
      | "death"
      | "unknown";
    medicalTreatment:
      | ""
      | "none"
      | "first_aid"
      | "outpatient"
      | "emergency"
      | "hospitalized"
      | "unknown";
    usedAsIntended: "" | "yes" | "no" | "unknown";
    // Structured capture (P0-4), same rule: the literals are the OpenAPI enum
    // values verbatim. Every one is optional at submit time while the backend's
    // strict-validation switch is off, so an empty string simply means "not
    // answered" and is dropped from the payload rather than sent as ''.
    failureMode:
      | ""
      | "body_rupture"
      | "battery_exposure"
      | "choking_hazard"
      | "leak"
      | "overheating"
      | "other"
      | "unknown";
    injuryDescription: string;
    medicalTreatmentReceived: "" | "yes" | "no" | "unknown";
    unitType: "" | "original" | "replacement" | "unknown";
  };
  privacyAccepted: boolean;
  accuracyAccepted: boolean;
}

export interface ClaimFlowSession {
  sessionKey: string;
  campaignSlug: string;
  draftId: string;
  draftToken: string;
  expiresAt: string;
  idempotencyKey: string;
  currentStep: ClaimFlowStep;
  remedyCode?: string;
  documents: ClaimFlowDocumentReceipt[];
  form: ClaimFlowDraftState;
}

/**
 * What is allowed to touch sessionStorage (design §5.3): tokens, step, and
 * non-sensitive choices only. Consumer identity/contact/address and the
 * incident narrative never leave React state; losing them on refresh is
 * accepted behavior. Document receipts persist a minimal projection — no
 * blob pathname or clientToken (§5.3 note on minimization).
 */
export interface ClaimFlowSessionSnapshot {
  draftId: string;
  draftToken: string;
  expiresAt: string;
  idempotencyKey: string;
  currentStep: ClaimFlowStep;
  remedyCode?: string;
  documents: Array<
    Pick<
      ClaimFlowDocumentReceipt,
      "documentId" | "category" | "fileName" | "status"
    > & {
      expiresAt?: string;
    }
  >;
  form: {
    locale: string;
    incidentAnswer: IncidentAnswer;
    eventTypes: string[];
    privacyAccepted: boolean;
    accuracyAccepted: boolean;
    product: Pick<
      ClaimFlowDraftState["product"],
      | "campaignProductId"
      | "quantity"
      | "purchaseChannel"
      | "lotCode"
      | "dateCode"
      | "flavor"
      | "shape"
    >;
  };
}

function toSnapshot(session: ClaimFlowSession): ClaimFlowSessionSnapshot {
  return {
    draftId: session.draftId,
    draftToken: session.draftToken,
    expiresAt: session.expiresAt,
    idempotencyKey: session.idempotencyKey,
    currentStep: session.currentStep,
    remedyCode: session.remedyCode,
    documents: session.documents.map((document) => ({
      documentId: document.documentId,
      category: document.category,
      fileName: document.fileName,
      status: document.status,
      expiresAt: document.expiresAt,
    })),
    form: {
      locale: session.form.locale,
      incidentAnswer: session.form.incidentAnswer,
      eventTypes: session.form.incident.eventTypes,
      privacyAccepted: session.form.privacyAccepted,
      accuracyAccepted: session.form.accuracyAccepted,
      product: {
        campaignProductId: session.form.product.campaignProductId,
        quantity: session.form.product.quantity,
        purchaseChannel: session.form.product.purchaseChannel,
        lotCode: session.form.product.lotCode,
        dateCode: session.form.product.dateCode,
        flavor: session.form.product.flavor,
        shape: session.form.product.shape,
      },
    },
  };
}

export interface ClaimFlowSubmitInput {
  locale: string;
  consumer: ClaimConsumerInput;
  products: ClaimProductInput[];
  remedyCode: string;
  documentIds: string[];
  consents: ClaimConsentInput[];
  incidentAnswer: IncidentAnswer;
  incidentDetails?: IncidentDetailsInput;
}

export interface ClaimConfirmation {
  caseReference: string;
  submittedAt: string;
  emailStatus: ClaimSubmissionOk["emailStatus"];
  nextStep: string;
  /**
   * Present only when the server opened a disposal task — which requires an
   * approved instruction version backed by an authorizing approval on the pinned
   * campaign version. Absent is the normal case and means the consumer is never
   * offered a disposal step.
   */
  disposal?: { taskId: string; token: string; resumePath: string };
}

export type ClaimFlowResult<T> =
  { ok: true; data: T } | { ok: false; error: ProblemDetails; status: number };

function sessionStorageKey(campaignSlug: string) {
  return `${SESSION_KEY_PREFIX}${campaignSlug}`;
}

function makeIdempotencyKey() {
  return crypto.randomUUID();
}

/**
 * The one blank draft state. Exported so the form component can seed it with a
 * chosen product instead of keeping a second copy — the two copies had already
 * drifted, and the drift only surfaced as a type error the next time a field
 * was added.
 */
export function createDefaultForm(product?: {
  id: string;
  flavors?: string[];
  shapes?: string[];
}): ClaimFlowDraftState {
  return {
    locale: "en-US",
    consumer: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      postalCode: "",
      countryCode: "US",
    },
    product: {
      campaignProductId: product?.id ?? "",
      quantity: 1,
      purchaseChannel: "other",
      purchaseDate: "",
      orderNumber: "",
      lotCode: "",
      dateCode: "",
      flavor: product?.flavors?.[0] ?? "",
      shape: product?.shapes?.[0] ?? "",
    },
    incidentAnswer: "no",
    incident: {
      eventDescription: "",
      occurredDate: "",
      occurredDateUnknown: false,
      eventTypes: [],
      injurySeverity: "",
      medicalTreatment: "",
      usedAsIntended: "",
      failureMode: "",
      injuryDescription: "",
      medicalTreatmentReceived: "",
      unitType: "",
    },
    privacyAccepted: false,
    accuracyAccepted: false,
  };
}

function toSession(
  campaignSlug: string,
  draft: { draftId: string; draftToken: string; expiresAt: string },
): ClaimFlowSession {
  return {
    sessionKey: sessionStorageKey(campaignSlug),
    campaignSlug,
    draftId: draft.draftId,
    draftToken: draft.draftToken,
    expiresAt: draft.expiresAt,
    idempotencyKey: makeIdempotencyKey(),
    currentStep: "verification",
    documents: [],
    form: createDefaultForm(),
  };
}

function readSession(campaignSlug: string): ClaimFlowSession | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(sessionStorageKey(campaignSlug));
  if (!raw) return null;

  try {
    // Only the non-sensitive snapshot is ever persisted; identity, contact,
    // address, purchase order details, and incident narrative start empty.
    const parsed = JSON.parse(raw) as Partial<ClaimFlowSessionSnapshot>;
    const defaults = createDefaultForm();
    return {
      sessionKey: sessionStorageKey(campaignSlug),
      campaignSlug,
      draftId: parsed.draftId ?? "",
      draftToken: parsed.draftToken ?? "",
      expiresAt: parsed.expiresAt ?? "",
      idempotencyKey: parsed.idempotencyKey ?? makeIdempotencyKey(),
      currentStep: parsed.currentStep ?? "verification",
      remedyCode: parsed.remedyCode,
      documents: (parsed.documents ?? []).map((document) => ({
        pathname: "",
        clientToken: "",
        mimeType: "",
        sizeBytes: 0,
        ...document,
        expiresAt: document.expiresAt ?? parsed.expiresAt ?? "",
      })),
      form: {
        ...defaults,
        locale: parsed.form?.locale ?? defaults.locale,
        incidentAnswer: parsed.form?.incidentAnswer ?? defaults.incidentAnswer,
        privacyAccepted: parsed.form?.privacyAccepted ?? false,
        accuracyAccepted: parsed.form?.accuracyAccepted ?? false,
        consumer: defaults.consumer,
        product: {
          ...defaults.product,
          ...(parsed.form?.product ?? {}),
        },
        incident: {
          ...defaults.incident,
          eventTypes: parsed.form?.eventTypes ?? [],
        },
      },
    };
  } catch {
    sessionStorage.removeItem(sessionStorageKey(campaignSlug));
    return null;
  }
}

function writeSession(session: ClaimFlowSession) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(
    session.sessionKey,
    JSON.stringify(toSnapshot(session)),
  );
}

function removeSession(campaignSlug: string) {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(sessionStorageKey(campaignSlug));
}

export class ClaimFlowModule {
  async start(
    campaignSlug: string,
  ): Promise<ClaimFlowResult<ClaimFlowSession>> {
    const existing = readSession(campaignSlug);
    if (existing) return { ok: true, data: existing };

    const draft = await submitClaimDraft(campaignSlug);
    if (!draft.ok) return draft;

    const session = toSession(campaignSlug, draft.data);
    writeSession(session);
    return { ok: true, data: session };
  }

  resume(campaignSlug: string): ClaimFlowSession | null {
    return readSession(campaignSlug);
  }

  save(session: ClaimFlowSession): ClaimFlowSession {
    writeSession(session);
    return session;
  }

  updateForm(
    session: ClaimFlowSession,
    nextForm: ClaimFlowDraftState,
  ): ClaimFlowSession {
    return this.save({ ...session, form: nextForm });
  }

  abandon(campaignSlug: string) {
    removeSession(campaignSlug);
  }

  async addDocument(
    session: ClaimFlowSession,
    file: File,
    category: DocumentCategory,
  ): Promise<
    ClaimFlowResult<{
      session: ClaimFlowSession;
      receipt: ClaimFlowDocumentReceipt;
    }>
  > {
    const body: UploadTokenRequest = {
      category,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    };

    const token = await getUploadToken(
      session.draftId,
      session.draftToken,
      body,
    );
    if (!token.ok) return token;

    try {
      await uploadPrivateObject({
        pathname: token.data.pathname,
        file,
        clientToken: token.data.clientToken,
        contentType: file.type,
      });
    } catch (error) {
      return {
        ok: false,
        status: 0,
        error: {
          type: "about:blank",
          title: "Upload Error",
          status: 0,
          detail:
            error instanceof Error
              ? error.message
              : "Could not upload the selected file.",
        },
      };
    }

    // Bytes are stored by the time `put` resolves; reconciliation on the API
    // side now decides between verified / rejected / expired.
    const receipt: ClaimFlowDocumentReceipt = {
      ...this.toDocumentReceipt(file, category, token.data),
      status: "verifying",
    };
    const nextSession = {
      ...session,
      documents: [...session.documents, receipt],
    };
    writeSession(nextSession);
    return { ok: true, data: { session: nextSession, receipt } };
  }

  /**
   * Deletes the document server-side first, then drops it from the local
   * session. A 404 means the server already dropped it (e.g. duplicate
   * delete or reconciliation expiry) and the local removal still proceeds;
   * other failures leave both sides untouched so the UI can surface them.
   */
  async removeDocument(
    session: ClaimFlowSession,
    documentId: string,
  ): Promise<ClaimFlowResult<ClaimFlowSession>> {
    const result = await deleteDraftDocument(
      session.draftId,
      session.draftToken,
      documentId,
    );
    const gone = result.ok || (!result.ok && result.status === 404);
    if (!gone) return { ok: false, error: result.error, status: result.status };

    const nextSession = {
      ...session,
      documents: session.documents.filter(
        (document) => document.documentId !== documentId,
      ),
    };
    writeSession(nextSession);
    return { ok: true, data: nextSession };
  }

  /**
   * Pulls authoritative six-state statuses from the Draft and merges them into
   * local receipts. Documents created elsewhere against the same draft are
   * adopted so evidence requirement checks stay aligned with the server list.
   */
  async refreshDocuments(
    session: ClaimFlowSession,
  ): Promise<ClaimFlowResult<ClaimFlowSession>> {
    const result = await listDraftDocuments(
      session.draftId,
      session.draftToken,
    );
    if (!result.ok) return result;

    const serverById = new Map(
      result.data.documents.map((document) => [document.documentId, document]),
    );
    const merged: ClaimFlowDocumentReceipt[] = session.documents.map(
      (receipt) => {
        const server = serverById.get(receipt.documentId);
        if (!server) return receipt;
        return {
          ...receipt,
          fileName: server.fileName || receipt.fileName,
          status: server.status,
        };
      },
    );

    for (const server of result.data.documents) {
      if (merged.some((receipt) => receipt.documentId === server.documentId))
        continue;
      merged.push({
        documentId: server.documentId,
        pathname: "",
        clientToken: "",
        expiresAt: session.expiresAt,
        category: server.category,
        fileName: server.fileName,
        mimeType: "",
        sizeBytes: 0,
        status: server.status,
      });
    }

    const changed =
      merged.length !== session.documents.length ||
      merged.some((document, index) => {
        const before = session.documents[index];
        return (
          !before ||
          before.status !== document.status ||
          before.fileName !== document.fileName
        );
      });
    const nextSession = { ...session, documents: merged };
    if (changed) writeSession(nextSession);
    return { ok: true, data: nextSession };
  }

  /**
   * `addressRequired` comes from the selected remedy: shipment-style remedies
   * (replacement) require it; refund may omit it entirely (design §5.5). A
   * partially entered address is still sent so the backend can validate it.
   */
  buildSubmitInput(
    session: ClaimFlowSession,
    privacyNoticeVersion: string,
    options?: { addressRequired?: boolean },
  ): ClaimFlowSubmitInput {
    // UI values ARE the OpenAPI enum values — no conversion layer (design §5.6).
    const incidentDetails: IncidentDetailsInput =
      session.form.incidentAnswer === "no"
        ? undefined
        : {
            narrative: session.form.incident.eventDescription.trim(),
            occurredDate: session.form.incident.occurredDate || undefined,
            occurredDateUnknown: session.form.incident.occurredDateUnknown,
            eventTypes: session.form.incident.eventTypes.length
              ? (session.form.incident
                  .eventTypes as NonNullable<IncidentDetailsInput>["eventTypes"])
              : undefined,
            injurySeverity: session.form.incident.injurySeverity || undefined,
            medicalTreatment:
              session.form.incident.medicalTreatment || undefined,
            usedAsIntended: session.form.incident.usedAsIntended || undefined,
            failureMode: session.form.incident.failureMode || undefined,
            injuryDescription:
              session.form.incident.injuryDescription.trim() || undefined,
            medicalTreatmentReceived:
              session.form.incident.medicalTreatmentReceived || undefined,
            unitType: session.form.incident.unitType || undefined,
          };

    const deliveryAddress = {
      line1: session.form.consumer.addressLine1.trim(),
      line2: session.form.consumer.addressLine2.trim() || undefined,
      city: session.form.consumer.city.trim(),
      state: session.form.consumer.state.trim(),
      postalCode: session.form.consumer.postalCode.trim(),
      countryCode: (
        session.form.consumer.countryCode.trim() || "US"
      ).toUpperCase(),
    };
    const hasAddressInput =
      Boolean(deliveryAddress.line1) ||
      Boolean(deliveryAddress.city) ||
      Boolean(deliveryAddress.state) ||
      Boolean(deliveryAddress.postalCode);

    return {
      locale: session.form.locale,
      remedyCode: session.remedyCode ?? "",
      documentIds: session.documents.map((document) => document.documentId),
      incidentAnswer: session.form.incidentAnswer,
      incidentDetails,
      consumer: {
        firstName: session.form.consumer.firstName.trim(),
        lastName: session.form.consumer.lastName.trim(),
        email: session.form.consumer.email.trim(),
        currentDeliveryAddress:
          options?.addressRequired || hasAddressInput
            ? deliveryAddress
            : undefined,
        phone: session.form.consumer.phone.trim() || undefined,
      },
      products: [
        {
          campaignProductId: session.form.product.campaignProductId,
          quantity: session.form.product.quantity,
          purchaseChannel: session.form.product.purchaseChannel,
          identificationMode: "unknown",
          purchaseDate: session.form.product.purchaseDate || undefined,
          orderNumber: session.form.product.orderNumber || undefined,
          lotCode: session.form.product.lotCode,
          dateCode: session.form.product.dateCode,
          flavor: session.form.product.flavor,
          shape: session.form.product.shape,
        },
      ],
      consents: [
        {
          type: "privacy_notice",
          textVersion: privacyNoticeVersion,
          accepted: true,
        },
        {
          type: "information_accuracy",
          textVersion: CLAIM_FLOW_FORM_VERSION,
          accepted: true,
        },
      ],
    };
  }

  async submit(
    session: ClaimFlowSession,
    input: ClaimFlowSubmitInput,
  ): Promise<ClaimFlowResult<ClaimConfirmation>> {
    const body: ClaimSubmissionRequest = {
      draftId: session.draftId,
      draftToken: session.draftToken,
      locale: "en-US",
      consumer: input.consumer,
      products: input.products,
      remedyCode: input.remedyCode,
      documentIds: input.documentIds,
      consents: input.consents,
      incidentAnswer: input.incidentAnswer,
      incidentDetails: input.incidentDetails,
    };

    const response = await submitClaim(session.campaignSlug, body, {
      idempotencyKey: session.idempotencyKey,
    });

    if (!response.ok) return response;

    // The token is the visitor's only way back to a review that may take hours,
    // so it is stored before anything else can fail. The confirmation screen and
    // the email link both carry it; storage is what makes the in-tab path work.
    if (response.data.disposal) {
      saveDisposalToken(
        response.data.disposal.taskId,
        response.data.disposal.token,
      );
    }

    removeSession(session.campaignSlug);
    return {
      ok: true,
      data: {
        caseReference: response.data.caseReference,
        submittedAt: response.data.submittedAt,
        emailStatus: response.data.emailStatus,
        nextStep: response.data.nextStep,
        ...(response.data.disposal
          ? {
              disposal: {
                taskId: response.data.disposal.taskId,
                token: response.data.disposal.token,
                resumePath: response.data.disposal.resumePath,
              },
            }
          : {}),
      },
    };
  }

  private toDocumentReceipt(
    file: { name: string; type: string; size: number },
    category: DocumentCategory,
    token: UploadTokenOk,
  ): ClaimFlowDocumentReceipt {
    return {
      documentId: token.documentId,
      pathname: token.pathname,
      clientToken: token.clientToken,
      expiresAt: token.expiresAt,
      category,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      status: "uploading",
    };
  }
}

export const claimFlowModule = new ClaimFlowModule();

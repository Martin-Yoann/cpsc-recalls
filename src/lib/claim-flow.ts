'use client';

import { put } from '@vercel/blob/client';

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
} from '@/lib/api-client';

const SESSION_KEY_PREFIX = 'koi_claim_flow:';
export const CLAIM_FLOW_FORM_VERSION = 'consumer-claim-form-v1';

export type ClaimFlowStep = 'verification' | 'consumer' | 'incident' | 'resolution' | 'review';
export type DocumentCategory = UploadTokenRequest['category'];
export type IncidentAnswer = ClaimSubmissionRequest['incidentAnswer'];
export type IncidentDetailsInput = ClaimSubmissionRequest['incidentDetails'];
export type ClaimProductInput = ClaimSubmissionRequest['products'][number];
export type ClaimConsumerInput = ClaimSubmissionRequest['consumer'];
export type ClaimConsentInput = ClaimSubmissionRequest['consents'][number];
export type PurchaseChannel = ClaimProductInput['purchaseChannel'];

export interface ClaimFlowDocumentReceipt {
  documentId: string;
  pathname: string;
  clientToken: string;
  expiresAt: string;
  category: DocumentCategory;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  status: 'uploading' | 'verifying' | 'verified' | 'scan_pending' | 'rejected' | 'expired';
}

/** Receipts whose server lifecycle has not reached a terminal state yet. */
export function isPendingDocument(receipt: ClaimFlowDocumentReceipt): boolean {
  return receipt.status === 'uploading' || receipt.status === 'verifying' || receipt.status === 'scan_pending';
}

/** Only verified documents may enter Claim Submission (design §5.4 / §16). */
export function allDocumentsVerified(documents: ClaimFlowDocumentReceipt[]): boolean {
  return documents.every((document) => document.status === 'verified');
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
    injurySeverity: '' | 'none' | 'minor' | 'moderate' | 'severe' | 'death' | 'unknown';
    medicalTreatment: '' | 'yes' | 'no' | 'unknown';
    usedAsIntended: '' | 'yes' | 'no' | 'unknown';
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
  emailStatus: ClaimSubmissionOk['emailStatus'];
  nextStep: string;
}

export type ClaimFlowResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ProblemDetails; status: number };

function sessionStorageKey(campaignSlug: string) {
  return `${SESSION_KEY_PREFIX}${campaignSlug}`;
}

function makeIdempotencyKey() {
  return crypto.randomUUID();
}

function createDefaultForm(): ClaimFlowDraftState {
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
      campaignProductId: '',
      quantity: 1,
      purchaseChannel: 'other',
      purchaseDate: '',
      orderNumber: '',
      lotCode: '',
      dateCode: '',
      flavor: '',
      shape: '',
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
    currentStep: 'verification',
    documents: [],
    form: createDefaultForm(),
  };
}

function readSession(campaignSlug: string): ClaimFlowSession | null {
  if (typeof window === 'undefined') return null;
  const raw = sessionStorage.getItem(sessionStorageKey(campaignSlug));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<ClaimFlowSession>;
    return {
      sessionKey: sessionStorageKey(campaignSlug),
      campaignSlug,
      draftId: parsed.draftId ?? '',
      draftToken: parsed.draftToken ?? '',
      expiresAt: parsed.expiresAt ?? '',
      idempotencyKey: parsed.idempotencyKey ?? makeIdempotencyKey(),
      currentStep: parsed.currentStep ?? 'verification',
      remedyCode: parsed.remedyCode,
      documents: parsed.documents ?? [],
      form: {
        ...createDefaultForm(),
        ...parsed.form,
        consumer: {
          ...createDefaultForm().consumer,
          ...parsed.form?.consumer,
        },
        product: {
          ...createDefaultForm().product,
          ...parsed.form?.product,
        },
        incident: {
          ...createDefaultForm().incident,
          ...parsed.form?.incident,
        },
      },
    };
  } catch {
    sessionStorage.removeItem(sessionStorageKey(campaignSlug));
    return null;
  }
}

function writeSession(session: ClaimFlowSession) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(session.sessionKey, JSON.stringify(session));
}

function removeSession(campaignSlug: string) {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(sessionStorageKey(campaignSlug));
}

export class ClaimFlowModule {
  async start(campaignSlug: string): Promise<ClaimFlowResult<ClaimFlowSession>> {
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

  updateForm(session: ClaimFlowSession, nextForm: ClaimFlowDraftState): ClaimFlowSession {
    return this.save({ ...session, form: nextForm });
  }

  abandon(campaignSlug: string) {
    removeSession(campaignSlug);
  }

  async addDocument(
    session: ClaimFlowSession,
    file: File,
    category: DocumentCategory,
  ): Promise<ClaimFlowResult<{ session: ClaimFlowSession; receipt: ClaimFlowDocumentReceipt }>> {
    const body: UploadTokenRequest = {
      category,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    };

    const token = await getUploadToken(session.draftId, session.draftToken, body);
    if (!token.ok) return token;

    try {
      await put(token.data.pathname, file, {
        access: 'private',
        token: token.data.clientToken,
        contentType: file.type,
      });
    } catch (error) {
      return {
        ok: false,
        status: 0,
        error: {
          type: 'about:blank',
          title: 'Upload Error',
          status: 0,
          detail: error instanceof Error ? error.message : 'Could not upload the selected file.',
        },
      };
    }

    // Bytes are stored by the time `put` resolves; reconciliation on the API
    // side now decides between verified / rejected / expired.
    const receipt: ClaimFlowDocumentReceipt = {
      ...this.toDocumentReceipt(file, category, token.data),
      status: 'verifying',
    };
    const nextSession = { ...session, documents: [...session.documents, receipt] };
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
    const result = await deleteDraftDocument(session.draftId, session.draftToken, documentId);
    const gone = result.ok || (!result.ok && result.status === 404);
    if (!gone) return { ok: false, error: result.error, status: result.status };

    const nextSession = {
      ...session,
      documents: session.documents.filter((document) => document.documentId !== documentId),
    };
    writeSession(nextSession);
    return { ok: true, data: nextSession };
  }

  /**
   * Pulls authoritative six-state statuses from the Draft and merges them into
   * local receipts. Documents created elsewhere against the same draft are
   * adopted so evidence requirement checks stay aligned with the server list.
   */
  async refreshDocuments(session: ClaimFlowSession): Promise<ClaimFlowResult<ClaimFlowSession>> {
    const result = await listDraftDocuments(session.draftId, session.draftToken);
    if (!result.ok) return result;

    const serverById = new Map(result.data.documents.map((document) => [document.documentId, document]));
    const merged: ClaimFlowDocumentReceipt[] = session.documents.map((receipt) => {
      const server = serverById.get(receipt.documentId);
      if (!server) return receipt;
      return {
        ...receipt,
        fileName: server.fileName || receipt.fileName,
        status: server.status,
      };
    });

    for (const server of result.data.documents) {
      if (merged.some((receipt) => receipt.documentId === server.documentId)) continue;
      merged.push({
        documentId: server.documentId,
        pathname: '',
        clientToken: '',
        expiresAt: session.expiresAt,
        category: server.category,
        fileName: server.fileName,
        mimeType: '',
        sizeBytes: 0,
        status: server.status,
      });
    }

    const changed =
      merged.length !== session.documents.length ||
      merged.some((document, index) => {
        const before = session.documents[index];
        return !before || before.status !== document.status || before.fileName !== document.fileName;
      });
    const nextSession = { ...session, documents: merged };
    if (changed) writeSession(nextSession);
    return { ok: true, data: nextSession };
  }

  buildSubmitInput(session: ClaimFlowSession, privacyNoticeVersion: string): ClaimFlowSubmitInput {
    const mappedInjurySeverity: NonNullable<IncidentDetailsInput>['injurySeverity'] =
      session.form.incident.injurySeverity === ''
        ? undefined
        : session.form.incident.injurySeverity === 'moderate'
          ? 'medical_attention'
          : session.form.incident.injurySeverity === 'severe'
            ? 'hospitalized'
            : session.form.incident.injurySeverity;

    const mappedMedicalTreatment: NonNullable<IncidentDetailsInput>['medicalTreatment'] =
      session.form.incident.medicalTreatment === ''
        ? undefined
        : session.form.incident.medicalTreatment === 'yes'
          ? 'outpatient'
          : session.form.incident.medicalTreatment === 'no'
            ? 'none'
            : session.form.incident.medicalTreatment;

    const incidentDetails: IncidentDetailsInput = session.form.incidentAnswer === 'no'
      ? undefined
      : {
          narrative: session.form.incident.eventDescription.trim(),
          occurredDate: session.form.incident.occurredDate || undefined,
          occurredDateUnknown: session.form.incident.occurredDateUnknown,
          eventTypes: session.form.incident.eventTypes.length
            ? (session.form.incident.eventTypes as NonNullable<IncidentDetailsInput>['eventTypes'])
            : undefined,
          injurySeverity: mappedInjurySeverity,
          medicalTreatment: mappedMedicalTreatment,
          usedAsIntended: session.form.incident.usedAsIntended || undefined,
        };

    return {
      locale: session.form.locale,
      remedyCode: session.remedyCode ?? '',
      documentIds: session.documents.map((document) => document.documentId),
      incidentAnswer: session.form.incidentAnswer,
      incidentDetails,
      consumer: {
        firstName: session.form.consumer.firstName.trim(),
        lastName: session.form.consumer.lastName.trim(),
        email: session.form.consumer.email.trim(),
        currentDeliveryAddress: {
          line1: session.form.consumer.addressLine1.trim(),
          line2: session.form.consumer.addressLine2.trim() || undefined,
          city: session.form.consumer.city.trim(),
          state: session.form.consumer.state.trim(),
          postalCode: session.form.consumer.postalCode.trim(),
          countryCode: (session.form.consumer.countryCode.trim() || 'US').toUpperCase(),
        },
        phone: session.form.consumer.phone.trim() || undefined,
      },
      products: [
        {
          campaignProductId: session.form.product.campaignProductId,
          quantity: session.form.product.quantity,
          purchaseChannel: session.form.product.purchaseChannel,
          identificationMode: 'unknown',
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
          type: 'privacy_notice',
          textVersion: privacyNoticeVersion,
          accepted: true,
        },
        {
          type: 'information_accuracy',
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
      locale: 'en-US',
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

    removeSession(session.campaignSlug);
    return {
      ok: true,
      data: {
        caseReference: response.data.caseReference,
        submittedAt: response.data.submittedAt,
        emailStatus: response.data.emailStatus,
        nextStep: response.data.nextStep,
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
      status: 'uploading',
    };
  }
}

export const claimFlowModule = new ClaimFlowModule();

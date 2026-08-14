// ============================================================
// KOI — API Client
// Uses generated types from openapi-typescript (src/types/api.ts)
// Connected to Neon-backed API via NEXT_PUBLIC_API_URL
// ============================================================

import type { paths, components } from '@/types/api';

// ── Convenience type aliases from generated paths ──

export type GetCampaignOk = paths['/v1/recall-campaigns/{slug}']['get']['responses'][200]['content']['application/json'];

// ── Product check (mode-based contract — inline; generated types are stale) ──
export type ProductIdentifierInput = {
  type: 'sku' | 'unit_upc' | 'gtin14' | 'model' | 'style' | 'lot_code' | 'date_code';
  value: string;
};

export type ProductCheckBody =
  | { mode: 'product_identifiers'; identifiers: ProductIdentifierInput[] }
  | { mode: 'legacy'; shape?: string; flavor?: string; lotCode?: string; dateCode?: string };

export type ProductCheckOk = {
  result: 'potential_match' | 'not_matched' | 'manual_review';
  reasonCodes: string[];
  matchedVariantIds: string[];
  identificationMode: string;
  messageKey: string;
  checkedCampaignVersion: number;
  disclaimer: string;
};

export type CampaignView = GetCampaignOk['campaign'];
export type ProblemDetails = components['schemas']['ProblemDetails'];

// ── Claim submission types (inline — backend endpoints exist but OpenAPI types not regenerated yet) ──

export interface ClaimConsumer {
  name: string;
  email: string;
  phone: string;
  address?: string;
}

export interface ClaimProduct {
  productId: string;
  quantity: number;
  identificationMode: 'lot_code' | 'product_identifiers' | 'purchase_evidence' | 'unknown';
  lotCode?: string;
  dateCode?: string;
}

export interface ClaimConsent {
  type: 'privacy_policy' | 'accuracy';
  accepted: boolean;
  acceptedAt: string;
}

export interface ClaimSubmissionBody {
  draftId?: string;
  draftToken?: string;
  consumer: ClaimConsumer;
  products: ClaimProduct[];
  remedyCode: string;
  documents: Array<{ documentId: string }>;
  consents: ClaimConsent[];
  incident?: {
    eventType: string;
    eventDate: string;
    severity: 'minor' | 'moderate' | 'serious' | 'fatal';
    description: string;
  };
}

export interface ClaimSubmissionOk {
  caseRef: string;
  claimNumber: string;
  submittedAt: string;
}

export interface ClaimDraftBody {
  // empty body for draft creation
}

export interface ClaimDraftOk {
  draftId: string;
  draftToken: string;
  expiresAt: string;
}

export interface UploadTokenBody {
  documents: Array<{
    fileName: string;
    mimeType: string;
    category: string;
    sizeBytes: number;
  }>;
}

export interface UploadTokenOk {
  uploadTokens: Array<{
    documentId: string;
    url: string;
    fields?: Record<string, string>;
    expiresAt: string;
  }>;
}

// ── Runtime ──

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002';

type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ProblemDetails; status: number };

function requestId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function fetchApi<T>(
  path: string,
  options: RequestInit = {},
): Promise<ApiResult<T>> {
  const rid = requestId();
  const url = `${API_BASE}${path}`;

  try {
    const res = await fetch(url, {
      ...options,
      // Guard against a hung API: abort after 10s so a slow/unreachable
      // backend surfaces a fast error instead of blocking the page forever.
      signal: options.signal ?? AbortSignal.timeout(10_000),
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Id': rid,
        ...options.headers,
      },
    });

    if (res.ok) {
      const data = (await res.json()) as T;
      return { ok: true, data };
    }

    const body = await res.json().catch(() => null);
    const problem: ProblemDetails = body?.type
      ? (body as ProblemDetails)
      : {
          type: 'about:blank',
          title: res.statusText,
          status: res.status,
          detail: body?.detail ?? 'Unexpected error',
          requestId: rid,
        };
    return { ok: false, error: problem, status: res.status };
  } catch {
    return {
      ok: false,
      error: {
        type: 'about:blank',
        title: 'Network Error',
        status: 0,
        detail: 'Could not reach the API server.',
        requestId: rid,
      },
      status: 0,
    };
  }
}

// ── Public API methods ──

/** GET /v1/recall-campaigns/{slug} */
export async function getCampaign(
  slug: string,
  locale = 'en-US',
): Promise<ApiResult<GetCampaignOk>> {
  return fetchApi<GetCampaignOk>(
    `/v1/recall-campaigns/${slug}?locale=${encodeURIComponent(locale)}`,
  );
}

/** POST /v1/recall-campaigns/{slug}/product-checks */
export async function checkProduct(
  slug: string,
  body: ProductCheckBody,
): Promise<ApiResult<ProductCheckOk>> {
  return fetchApi<ProductCheckOk>(
    `/v1/recall-campaigns/${slug}/product-checks`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}

/** Returns true when the Phase 1 skeleton returned 501. */
export function isPhase1NotImplemented(result: ApiResult<unknown>): boolean {
  return !result.ok && result.status === 501;
}

// ── Claim Submission API methods ──

/** POST /v1/recall-campaigns/{slug}/claims — Submit formal claim */
export async function submitClaim(
  slug: string,
  body: ClaimSubmissionBody,
): Promise<ApiResult<ClaimSubmissionOk>> {
  return fetchApi<ClaimSubmissionOk>(
    `/v1/recall-campaigns/${slug}/claims`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}

/** POST /v1/recall-campaigns/{slug}/claim-drafts — Create anonymous claim draft */
export async function submitClaimDraft(
  slug: string,
  body: ClaimDraftBody,
): Promise<ApiResult<ClaimDraftOk>> {
  return fetchApi<ClaimDraftOk>(
    `/v1/recall-campaigns/${slug}/claim-drafts`,
    { method: 'POST', body: JSON.stringify(body) },
  );
}

/** POST /v1/claim-drafts/{draftId}/upload-tokens — Authorize document upload */
export async function getUploadToken(
  draftId: string,
  draftToken: string,
  body: UploadTokenBody,
): Promise<ApiResult<UploadTokenOk>> {
  return fetchApi<UploadTokenOk>(
    `/v1/claim-drafts/${draftId}/upload-tokens`,
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'X-Draft-Token': draftToken },
    },
  );
}

// ============================================================
// KOI — API Client
// Uses generated types from openapi-typescript (src/types/api.ts)
// Connected to Neon-backed API via NEXT_PUBLIC_API_URL
// ============================================================

import type { paths, components } from '@/types/api';

// ── Convenience type aliases from generated paths ──

export type GetCampaignOk = paths['/v1/recall-campaigns/{slug}']['get']['responses'][200]['content']['application/json'];
export type CreateClaimDraftOk = paths['/v1/recall-campaigns/{slug}/claim-drafts']['post']['responses'][201]['content']['application/json'];
export type ClaimSubmissionRequest = paths['/v1/recall-campaigns/{slug}/claims']['post']['requestBody']['content']['application/json'];
export type ClaimSubmissionOk = paths['/v1/recall-campaigns/{slug}/claims']['post']['responses'][201]['content']['application/json'];
export type UploadTokenRequest = components['schemas']['UploadTokenRequest'];
export type UploadTokenOk = components['schemas']['UploadTokenResponse'];

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

// ── Runtime ──

const LOCAL_API_BASE = 'http://localhost:3002';
const ONLINE_API_BASE = 'https://koi-recall-backend.vercel.app';

const configuredApi = (process.env.NEXT_PUBLIC_API_URL || '').trim().replace(/\/+$/, '');

// Primary base: explicit NEXT_PUBLIC_API_URL when set, otherwise the local backend.
const PRIMARY_API_BASE = configuredApi || LOCAL_API_BASE;

// When the primary points at a local backend that isn't running, transparently
// fall back to the deployed API so the app keeps working. Only localhost URLs
// get an online fallback — an explicitly configured remote URL is used as-is.
const isLocalPrimary = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(PRIMARY_API_BASE);
const API_BASES: string[] =
  isLocalPrimary && PRIMARY_API_BASE !== ONLINE_API_BASE
    ? [PRIMARY_API_BASE, ONLINE_API_BASE]
    : [PRIMARY_API_BASE];

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

  for (const base of API_BASES) {
    const url = `${base}${path}`;

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
      // Network error (e.g. local backend not running) — try the next base.
    }
  }

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
  body: ClaimSubmissionRequest,
  options?: { idempotencyKey?: string },
): Promise<ApiResult<ClaimSubmissionOk>> {
  return fetchApi<ClaimSubmissionOk>(
    `/v1/recall-campaigns/${slug}/claims`,
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: options?.idempotencyKey
        ? { 'Idempotency-Key': options.idempotencyKey }
        : undefined,
    },
  );
}

/** POST /v1/recall-campaigns/{slug}/claim-drafts — Create anonymous claim draft */
export async function submitClaimDraft(
  slug: string,
): Promise<ApiResult<CreateClaimDraftOk>> {
  return fetchApi<CreateClaimDraftOk>(
    `/v1/recall-campaigns/${slug}/claim-drafts`,
    { method: 'POST' },
  );
}

/** POST /v1/claim-drafts/{draftId}/upload-tokens — Authorize document upload */
export async function getUploadToken(
  draftId: string,
  draftToken: string,
  body: UploadTokenRequest,
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

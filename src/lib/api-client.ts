// ============================================================
// KOI — API Client
// Uses generated types from openapi-typescript (src/types/api.ts)
// Connected to Neon-backed API via NEXT_PUBLIC_API_URL
// ============================================================

import type { paths, components } from "@/types/api";

import { campaignTag } from "@/lib/cache-tags";

// ── Convenience type aliases from generated paths ──

export type GetCampaignOk =
  paths["/v1/recall-campaigns/{slug}"]["get"]["responses"][200]["content"]["application/json"];
export type CreateClaimDraftOk =
  paths["/v1/recall-campaigns/{slug}/claim-drafts"]["post"]["responses"][201]["content"]["application/json"];
export type ClaimSubmissionRequest =
  paths["/v1/recall-campaigns/{slug}/claims"]["post"]["requestBody"]["content"]["application/json"];
export type ClaimSubmissionOk =
  paths["/v1/recall-campaigns/{slug}/claims"]["post"]["responses"][201]["content"]["application/json"];
export type UploadTokenRequest = components["schemas"]["UploadTokenRequest"];
export type UploadTokenOk = components["schemas"]["UploadTokenResponse"];
export type CaseStatusLookupRequest =
  components["schemas"]["CaseStatusLookupRequest"];
export type CaseStatusLookupOk =
  paths["/v1/case-status-lookups"]["post"]["responses"][200]["content"]["application/json"];
export type DraftDocument = components["schemas"]["DraftDocument"];
export type DraftDocumentStatus = components["schemas"]["DraftDocumentStatus"];
export type DraftDocumentListOk =
  paths["/v1/claim-drafts/{draftId}/documents"]["get"]["responses"][200]["content"]["application/json"];
export type DisposalTask =
  paths["/v1/disposal-tasks/{taskId}"]["get"]["responses"][200]["content"]["application/json"];
export type DisposalInstruction =
  components["schemas"]["DisposalInstructionView"];
export type DisposalEvidenceDocument =
  paths["/v1/disposal-tasks/{taskId}/documents"]["get"]["responses"][200]["content"]["application/json"]["documents"][number];
export type DisposalEvidenceBatch =
  paths["/v1/disposal-tasks/{taskId}/evidence"]["post"]["responses"][201]["content"]["application/json"];

// ── Product check (mode-based contract — inline; generated types are stale) ──
export type ProductIdentifierInput = {
  type:
    | "sku"
    | "unit_upc"
    | "gtin14"
    | "model"
    | "style"
    | "lot_code"
    | "date_code";
  value: string;
};

export type ProductCheckBody =
  | { mode: "product_identifiers"; identifiers: ProductIdentifierInput[] }
  | {
      mode: "legacy";
      shape?: string;
      flavor?: string;
      lotCode?: string;
      dateCode?: string;
    };

export type ProductCheckOk = {
  result: "potential_match" | "not_matched" | "manual_review";
  reasonCodes: string[];
  matchedVariantIds: string[];
  identificationMode: string;
  messageKey: string;
  checkedCampaignVersion: number;
  disclaimer: string;
};

export type CampaignView = GetCampaignOk["campaign"];
export type ProblemDetails = components["schemas"]["ProblemDetails"];
export type ConsumerClaim = {
  id: string;
  claimNumber: string;
  caseRef: string;
  campaignId: string;
  campaignTitle: string;
  campaignSlug: string;
  consumerName: string;
  consumerEmail: string;
  consumerPhone: string;
  productName: string;
  shape?: string;
  flavor?: string;
  lotCode?: string;
  dateCode?: string;
  remedyId: string;
  remedyTitle: string;
  remedyType: string;
  refundAmount?: number;
  status:
    | "submitted"
    | "under_review"
    | "action_required"
    | "verified"
    | "remedy_issued"
    | "resolved"
    | "rejected";
  /** What the review team asked the consumer to provide (set when status is action_required). */
  infoRequest?: string;
  evidenceCount: number;
  submittedAt: string;
  updatedAt: string;
  resolutionDate?: string;
};

// ── Runtime ──

const ONLINE_API_BASE = "https://koi-recall-backend.vercel.app";

const configuredApi = (process.env.NEXT_PUBLIC_API_URL || "")
  .trim()
  .replace(/\/+$/, "");

// Default to the deployed API. Localhost is opt-in via NEXT_PUBLIC_API_URL so
// production-like verification does not silently start with an unavailable dev API.
const PRIMARY_API_BASE = configuredApi || ONLINE_API_BASE;

// When an explicit localhost backend is selected, transparently fall back to the
// deployed API if the local server is unreachable.
const isLocalPrimary = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(
  PRIMARY_API_BASE,
);
const API_BASES: string[] =
  isLocalPrimary && PRIMARY_API_BASE !== ONLINE_API_BASE
    ? [PRIMARY_API_BASE, ONLINE_API_BASE]
    : [PRIMARY_API_BASE];

type ApiResult<T> =
  { ok: true; data: T } | { ok: false; error: ProblemDetails; status: number };

/**
 * A read that is safe to share between visitors (public, unauthenticated GET).
 * Setting `revalidateSeconds` turns on Next's Data Cache and bounds how stale a
 * served copy may be. Anything that carries a consumer token or writes must
 * leave it unset so it stays uncached.
 */
interface FetchOptions extends RequestInit {
  revalidateSeconds?: number;
  /**
   * Cache tags for this read. Publishing a campaign calls the web revalidate
   * endpoint with the same tag, so an edited notice can be expired immediately
   * instead of waiting out `revalidateSeconds`.
   */
  cacheTags?: readonly string[];
}

function requestId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

async function fetchApi<T>(
  path: string,
  options: FetchOptions = {},
): Promise<ApiResult<T>> {
  const { revalidateSeconds, cacheTags, ...init } = options;
  const rid = requestId();
  const cacheable = revalidateSeconds !== undefined;

  for (const base of API_BASES) {
    const url = `${base}${path}`;

    try {
      const res = await fetch(url, {
        ...init,
        // Caching is opt-in: the default (`auto no cache`) would leave this
        // read uncached even with a revalidate set.
        ...(cacheable
          ? {
              cache: "force-cache" as const,
              next: {
                revalidate: revalidateSeconds,
                tags: cacheTags === undefined ? undefined : [...cacheTags],
              },
            }
          : {}),
        // Guard against a hung API: abort after 10s so a slow/unreachable
        // backend surfaces a fast error instead of blocking the page forever.
        // Skipped for cached reads: a signal is tied to the request that made
        // it, while a cached response has to outlive that request.
        signal: cacheable
          ? undefined
          : (init.signal ?? AbortSignal.timeout(10_000)),
        headers: {
          "Content-Type": "application/json",
          // Next keys its fetch cache on the request headers, so a per-request
          // correlation id must not be sent on a shared cached read. Sending it
          // gives every request its own cache entry: the cache never hits, it
          // grows without bound, and the backend is still called every time.
          ...(cacheable ? {} : { "X-Request-Id": rid }),
          ...init.headers,
        },
      });

      if (res.ok) {
        // 204 No Content (e.g. document DELETE) has no body to parse.
        if (res.status === 204) return { ok: true, data: undefined as T };
        const data = (await res.json()) as T;
        return { ok: true, data };
      }

      const body = await res.json().catch(() => null);
      const problem: ProblemDetails = body?.type
        ? (body as ProblemDetails)
        : {
            type: "about:blank",
            title: res.statusText,
            status: res.status,
            detail: body?.detail ?? "Unexpected error",
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
      type: "about:blank",
      title: "Network Error",
      status: 0,
      detail: "Could not reach the API server.",
      requestId: rid,
    },
    status: 0,
  };
}

// ── Public API methods ──

/**
 * How long a published campaign may be served from the Data Cache.
 *
 * Campaign content is public and changes rarely, so caching it is what keeps a
 * traffic spike off the database. It is also safety content, though: a
 * superseded lot list or hazard description must not linger, which is why this
 * window is short rather than minutes-to-hours.
 *
 * Route segments rendering this data declare the same value as a literal in
 * `export const revalidate` (Next requires a literal there, not an import) —
 * change both together.
 */
export const CAMPAIGN_REVALIDATE_SECONDS = 60;

/**
 * GET /v1/recall-campaigns/{slug}
 *
 * The one read that is safe to cache: public, unauthenticated, and identical
 * for every visitor. Every other method in this file either carries a consumer
 * token or performs a write, and must stay uncached.
 */
export async function getCampaign(
  slug: string,
  locale = "en-US",
): Promise<ApiResult<GetCampaignOk>> {
  return fetchApi<GetCampaignOk>(
    `/v1/recall-campaigns/${slug}?locale=${encodeURIComponent(locale)}`,
    {
      revalidateSeconds: CAMPAIGN_REVALIDATE_SECONDS,
      cacheTags: [campaignTag(slug)],
    },
  );
}

/** POST /v1/recall-campaigns/{slug}/product-checks */
export async function checkProduct(
  slug: string,
  body: ProductCheckBody,
): Promise<ApiResult<ProductCheckOk>> {
  return fetchApi<ProductCheckOk>(
    `/v1/recall-campaigns/${slug}/product-checks`,
    { method: "POST", body: JSON.stringify(body) },
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
  return fetchApi<ClaimSubmissionOk>(`/v1/recall-campaigns/${slug}/claims`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: options?.idempotencyKey
      ? { "Idempotency-Key": options.idempotencyKey }
      : undefined,
  });
}

export async function listConsumerClaims(
  token: string,
): Promise<ApiResult<{ claims: ConsumerClaim[] }>> {
  return fetchApi<{ claims: ConsumerClaim[] }>("/v1/consumer-auth/claims", {
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function getConsumerClaim(
  claimNumber: string,
  token: string,
): Promise<ApiResult<{ claim: ConsumerClaim }>> {
  return fetchApi<{ claim: ConsumerClaim }>(
    `/v1/consumer-auth/claims/${encodeURIComponent(claimNumber)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
}

// ── Case status lookup (public, PII-free contract) ──

/**
 * POST /v1/case-status-lookups — public, whitelisted status lookup.
 * Wrong caseReference and wrong email return the identical 404, so callers
 * must not attempt to distinguish them in the UI either.
 */
export async function caseStatusLookup(
  body: CaseStatusLookupRequest,
): Promise<ApiResult<CaseStatusLookupOk>> {
  return fetchApi<CaseStatusLookupOk>("/v1/case-status-lookups", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** GET /v1/claim-drafts/{draftId}/documents — six-state upload lifecycle */
/**
 * GET /v1/disposal-tasks/{taskId} — the visitor's own disposal task.
 *
 * Deliberately uncached: the request carries a bearer credential and the response
 * is per-visitor. Nothing here decides whether disposal is permitted — the
 * payload's `allowedActions` and `blockingReasons` are the server's answer, and
 * `instruction` is null when approved content is not available to show.
 */
export async function getDisposalTask(
  taskId: string,
  token: string,
): Promise<ApiResult<DisposalTask>> {
  return fetchApi<DisposalTask>(`/v1/disposal-tasks/${taskId}`, {
    headers: { "X-Disposal-Token": token },
  });
}

/**
 * POST /v1/disposal-tasks/{taskId}/upload-tokens — an upload target for one
 * evidence photo.
 *
 * Task-scoped rather than draft-scoped on purpose: the draft route requires an
 * active draft, and submitting the claim is exactly what made this draft
 * inactive. Authorising here does not permit anything — a verified photo is not
 * an accepted one.
 */
export async function authorizeDisposalUpload(
  taskId: string,
  token: string,
  body: UploadTokenRequest,
): Promise<ApiResult<UploadTokenOk>> {
  return fetchApi<UploadTokenOk>(`/v1/disposal-tasks/${taskId}/upload-tokens`, {
    method: "POST",
    headers: { "X-Disposal-Token": token, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** GET /v1/disposal-tasks/{taskId}/documents — technical status only. */
export async function listDisposalDocuments(
  taskId: string,
  token: string,
): Promise<ApiResult<{ documents: DisposalEvidenceDocument[] }>> {
  return fetchApi<{ documents: DisposalEvidenceDocument[] }>(
    `/v1/disposal-tasks/${taskId}/documents`,
    { headers: { "X-Disposal-Token": token } },
  );
}

/**
 * POST /v1/disposal-tasks/{taskId}/evidence — hand a batch to a person.
 *
 * The idempotency key makes a retry safe: a replay returns the batch that was
 * already created rather than opening a second review of the same photos.
 */
export async function submitDisposalEvidence(
  taskId: string,
  token: string,
  documentIds: string[],
  idempotencyKey: string,
): Promise<ApiResult<DisposalEvidenceBatch>> {
  return fetchApi<DisposalEvidenceBatch>(
    `/v1/disposal-tasks/${taskId}/evidence`,
    {
      method: "POST",
      headers: {
        "X-Disposal-Token": token,
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        documents: documentIds.map((documentId) => ({ documentId })),
      }),
    },
  );
}

export async function listDraftDocuments(
  draftId: string,
  draftToken: string,
): Promise<ApiResult<DraftDocumentListOk>> {
  return fetchApi<DraftDocumentListOk>(
    `/v1/claim-drafts/${draftId}/documents`,
    { headers: { "X-Draft-Token": draftToken } },
  );
}

/** DELETE /v1/claim-drafts/{draftId}/documents/{documentId} — 204 No Content */
export async function deleteDraftDocument(
  draftId: string,
  draftToken: string,
  documentId: string,
): Promise<ApiResult<void>> {
  return fetchApi<void>(
    `/v1/claim-drafts/${draftId}/documents/${encodeURIComponent(documentId)}`,
    {
      method: "DELETE",
      headers: { "X-Draft-Token": draftToken },
    },
  );
}

/** POST /v1/recall-campaigns/{slug}/claim-drafts — Create anonymous claim draft */
export async function submitClaimDraft(
  slug: string,
): Promise<ApiResult<CreateClaimDraftOk>> {
  return fetchApi<CreateClaimDraftOk>(
    `/v1/recall-campaigns/${slug}/claim-drafts`,
    { method: "POST" },
  );
}

/** POST /v1/claim-drafts/{draftId}/upload-tokens — Authorize document upload */
export async function getUploadToken(
  draftId: string,
  draftToken: string,
  body: UploadTokenRequest,
): Promise<ApiResult<UploadTokenOk>> {
  return fetchApi<UploadTokenOk>(`/v1/claim-drafts/${draftId}/upload-tokens`, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "X-Draft-Token": draftToken },
  });
}

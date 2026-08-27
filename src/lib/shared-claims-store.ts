// ============================================================
// KOI — Shared Claims Store (read-only legacy view)
//
// Production facts must come from the API only (design §9). This module no
// longer writes claims; it exists so demo dashboards can render Associated
// Claims from a previous localStorage session. Reads are gated behind
// NEXT_PUBLIC_DEMO_MODE by the callers.
// ============================================================

export type ClaimStatus =
  | 'submitted' | 'under_review' | 'verified'
  | 'remedy_issued' | 'resolved' | 'rejected';

export interface SharedClaim {
  id: string;
  claimNumber: string;
  /** Backend case reference (KOI-XXXX-XXXXXXXX), set after successful API submission */
  caseRef?: string;
  campaignId: string;
  campaignTitle: string;
  campaignSlug: string;
  consumerName: string;
  consumerEmail: string;
  productName: string;
  shape?: string;
  flavor?: string;
  lotCode?: string;
  dateCode?: string;
  remedyId: string;
  remedyTitle: string;
  remedyType: string;
  refundAmount?: number;
  status: ClaimStatus;
  evidenceCount: number;
  submittedAt: string;
  updatedAt: string;
  resolutionDate?: string;
  adminNotes?: string;
}

const STORAGE_KEY = 'koi_shared_claims';

function readAll(): SharedClaim[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

/** Get a single claim by number */
export function getClaimByNumber(claimNumber: string): SharedClaim | undefined {
  return readAll().find((c) => c.claimNumber === claimNumber);
}

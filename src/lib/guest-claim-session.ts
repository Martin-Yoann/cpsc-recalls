'use client';

import type { GuestClaimAccess, ClaimLookupPayload } from '@/types/claims';

const STORAGE_KEY = 'koi_guest_claim_access';

function readAll(): GuestClaimAccess[] {
  if (typeof window === 'undefined') return [];

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed as GuestClaimAccess[] : [];
  } catch {
    return [];
  }
}

function writeAll(records: GuestClaimAccess[]) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function saveGuestClaimAccess(reference: string, payload: ClaimLookupPayload) {
  const records = readAll().filter((record) => record.claimNumber !== payload.claim.claimNumber);
  records.unshift({
    claimNumber: payload.claim.claimNumber,
    reference,
    savedAt: new Date().toISOString(),
    payload,
  });
  writeAll(records.slice(0, 10));
}

export function getGuestClaimAccess(claimNumber: string): GuestClaimAccess | null {
  return readAll().find((record) => record.claimNumber === claimNumber) ?? null;
}

export function listGuestClaimAccess(): GuestClaimAccess[] {
  return readAll();
}

export function listGuestClaimPayloads(): ClaimLookupPayload[] {
  return readAll().map((record) => record.payload);
}

export function clearGuestClaimAccess(claimNumber?: string) {
  if (claimNumber) {
    writeAll(readAll().filter((record) => record.claimNumber !== claimNumber));
    return;
  }

  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(STORAGE_KEY);
}

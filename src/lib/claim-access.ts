import { getConsumerClaim, listConsumerClaims, lookupConsumerClaim, type ConsumerClaim } from '@/lib/api-client';
import { getGuestClaimAccess, listGuestClaimPayloads, saveGuestClaimAccess } from '@/lib/guest-claim-session';
import type { ClaimLookupPayload } from '@/types/claims';

export async function lookupClaimForGuest(claimNumber: string, reference: string) {
  const response = await lookupConsumerClaim(claimNumber, reference);
  if (response.ok) {
    saveGuestClaimAccess(reference, response.data);
  }
  return response;
}

export async function getClaimsForViewer(token?: string): Promise<ConsumerClaim[]> {
  if (!token) {
    return getGuestClaims();
  }

  const response = await listConsumerClaims(token);
  return response.ok ? response.data.claims : [];
}

export async function getClaimDetailForViewer(claimNumber: string, token?: string): Promise<ClaimLookupPayload | null> {
  if (token) {
    const response = await getConsumerClaim(claimNumber, token);
    if (!response.ok) return null;

    return consumerClaimToLookupPayload(response.data.claim);
  }

  const guest = getGuestClaimAccess(claimNumber);
  return guest?.payload ?? null;
}

export function getGuestClaims(): ConsumerClaim[] {
  return listGuestClaims().map((entry) => entry.claim);
}

export function listGuestClaims(): ClaimLookupPayload[] {
  return listGuestClaimPayloads();
}

export function consumerClaimToLookupPayload(claim: ConsumerClaim): ClaimLookupPayload {
  return {
    claim,
    campaignTitle: claim.campaignTitle,
    productName: claim.productName,
    remedyTitle: claim.remedyTitle,
    remedyType: claim.remedyType,
    refundAmount: claim.refundAmount,
  };
}

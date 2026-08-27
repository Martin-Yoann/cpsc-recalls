import { getConsumerClaim, listConsumerClaims, type ConsumerClaim } from '@/lib/api-client';
import { getGuestClaimAccess, listGuestClaimPayloads } from '@/lib/guest-claim-session';
import type { ClaimLookupPayload } from '@/types/claims';

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

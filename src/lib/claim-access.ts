import { getConsumerClaim, listConsumerClaims, type ConsumerClaim } from '@/lib/api-client';
import { getGuestClaimAccess, listGuestClaimPayloads } from '@/lib/guest-claim-session';
import type { ClaimLookupPayload } from '@/types/claims';

export async function getClaimsForViewer(token?: string): Promise<ConsumerClaim[]> {
  if (!token) {
    return getGuestClaims();
  }

  const response = await listConsumerClaims(token);
  if (!response.ok) throw Object.assign(new Error('Could not load claims'), { problem: response.error, status: response.status });
  return response.data.claims;
}

export async function getClaimDetailForViewer(claimNumber: string, token?: string): Promise<ClaimLookupPayload | null> {
  if (token) {
    const response = await getConsumerClaim(claimNumber, token);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw Object.assign(new Error('Could not load claim detail'), { problem: { ...response.error, status: response.status } });
    }

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

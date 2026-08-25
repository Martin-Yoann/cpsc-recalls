import type { ConsumerClaim } from '@/lib/api-client';

export interface ClaimLookupPayload {
  claim: ConsumerClaim;
  campaignTitle: string;
  productName: string;
  remedyTitle: string;
  remedyType: string;
  refundAmount?: number;
}

export interface GuestClaimAccess {
  claimNumber: string;
  reference: string;
  savedAt: string;
  payload: ClaimLookupPayload;
}

// ============================================================
// KOI Recall Platform — Mock Claims
// Music Lollipop Recall Demo claims
// ============================================================

import { ClaimStatus, EvidenceType, IncidentSeverity } from '@/types';

import type { Claim } from '@/types';

interface ClaimWithPhone extends Claim {
  consumerPhone: string;
  consumerShape?: string;
  consumerFlavor?: string;
  consumerLotCode?: string;
}

export const mockClaims: ClaimWithPhone[] = [
  {
    id: 'cl_001',
    campaignId: 'cmp_001',
    status: ClaimStatus.VERIFIED,
    consumerName: 'Sarah Chen',
    consumerEmail: 'sarah.chen@email.com',
    consumerPhone: '13812341234',
    consumerShape: 'Bear',
    consumerFlavor: 'Peach',
    consumerLotCode: 'ML-2406-A',
    productId: 'prod_001',
    remedyId: 'rem_001',
    evidence: [
      {
        id: 'ev_001',
        type: EvidenceType.PRODUCT_PHOTO,
        fileUrl: '/evidence/lollipop-lot-label-1.jpg',
        fileName: 'music-lollipop-lot-label.jpg',
        uploadedAt: '2025-12-15T09:30:00Z',
      },
      {
        id: 'ev_002',
        type: EvidenceType.SERIAL_NUMBER,
        fileUrl: '/evidence/lot-code-closeup-1.jpg',
        fileName: 'lot-code-closeup.jpg',
        uploadedAt: '2025-12-15T09:31:00Z',
      },
    ],
    submittedAt: '2025-12-15T09:32:00Z',
    updatedAt: '2026-01-08T14:15:00Z',
    claimNumber: 'KOI-2512-1842',
  },
  {
    id: 'cl_002',
    campaignId: 'cmp_001',
    status: ClaimStatus.SUBMITTED,
    consumerName: 'Marcus Johnson',
    consumerEmail: 'mjohnson@email.com',
    consumerPhone: '15012349876',
    consumerShape: 'Dinosaur',
    consumerFlavor: 'Strawberry',
    consumerLotCode: 'ML-2407-B',
    productId: 'prod_001',
    remedyId: 'rem_002',
    evidence: [
      {
        id: 'ev_003',
        type: EvidenceType.PROOF_OF_PURCHASE,
        fileUrl: '/evidence/receipt-amazon-1.pdf',
        fileName: 'amazon-receipt.pdf',
        uploadedAt: '2026-01-20T11:20:00Z',
      },
    ],
    submittedAt: '2026-01-20T11:22:00Z',
    updatedAt: '2026-01-20T11:22:00Z',
    claimNumber: 'KOI-2601-1951',
  },
  {
    id: 'cl_003',
    campaignId: 'cmp_001',
    status: ClaimStatus.REMEDY_ISSUED,
    consumerName: 'Emily Davis',
    consumerEmail: 'emily.d@email.com',
    consumerPhone: '13956785678',
    consumerShape: 'Strawberry',
    consumerFlavor: 'Strawberry',
    consumerLotCode: 'ML-2406-A',
    productId: 'prod_001',
    remedyId: 'rem_001',
    evidence: [
      {
        id: 'ev_004',
        type: EvidenceType.PRODUCT_PHOTO,
        fileUrl: '/evidence/lollipop-photo-2.jpg',
        fileName: 'lollipop-package.png',
        uploadedAt: '2025-12-20T08:45:00Z',
      },
    ],
    submittedAt: '2025-12-20T08:47:00Z',
    updatedAt: '2026-02-10T10:30:00Z',
    claimNumber: 'KOI-2512-0412',
  },
  {
    id: 'cl_004',
    campaignId: 'cmp_001',
    status: ClaimStatus.UNDER_REVIEW,
    consumerName: 'James Wilson',
    consumerEmail: 'jwilson@email.com',
    consumerPhone: '18611223344',
    consumerShape: 'Heart',
    consumerFlavor: 'Peach',
    consumerLotCode: 'ML-2408-C',
    productId: 'prod_001',
    remedyId: 'rem_001',
    evidence: [
      {
        id: 'ev_005',
        type: EvidenceType.SERIAL_NUMBER,
        fileUrl: '/evidence/lot-label-3.jpg',
        fileName: 'lot-code.jpg',
        uploadedAt: '2026-01-28T16:10:00Z',
      },
      {
        id: 'ev_006',
        type: EvidenceType.PRODUCT_PHOTO,
        fileUrl: '/evidence/lollipop-photo-3.jpg',
        fileName: 'lollipop.jpg',
        uploadedAt: '2026-01-28T16:11:00Z',
      },
    ],
    submittedAt: '2026-01-28T16:12:00Z',
    updatedAt: '2026-01-30T09:05:00Z',
    claimNumber: 'KOI-2601-2104',
  },
  {
    id: 'cl_005',
    campaignId: 'cmp_001',
    status: ClaimStatus.RESOLVED,
    consumerName: 'Amanda Torres',
    consumerEmail: 'atorres@email.com',
    consumerPhone: '15287654321',
    consumerShape: 'Bear',
    consumerFlavor: 'Strawberry',
    consumerLotCode: 'ML-2407-B',
    productId: 'prod_001',
    remedyId: 'rem_002',
    evidence: [
      {
        id: 'ev_007',
        type: EvidenceType.PROOF_OF_PURCHASE,
        fileUrl: '/evidence/receipt-walmart-1.pdf',
        fileName: 'walmart-receipt.pdf',
        uploadedAt: '2025-12-12T13:00:00Z',
      },
    ],
    submittedAt: '2025-12-12T13:02:00Z',
    updatedAt: '2026-01-15T11:00:00Z',
    resolutionDate: '2026-01-15T11:00:00Z',
    claimNumber: 'KOI-2512-1288',
  },
  {
    id: 'cl_006',
    campaignId: 'cmp_001',
    status: ClaimStatus.REJECTED,
    consumerName: 'Jennifer Wu',
    consumerEmail: 'jwu@email.com',
    consumerPhone: '18755443322',
    consumerShape: 'Heart',
    consumerFlavor: 'Peach',
    consumerLotCode: 'ML-2405-Z',
    productId: 'prod_001',
    remedyId: 'rem_002',
    evidence: [
      {
        id: 'ev_008',
        type: EvidenceType.PRODUCT_PHOTO,
        fileUrl: '/evidence/wrong-lollipop.jpg',
        fileName: 'lollipop-photo.jpg',
        uploadedAt: '2026-01-10T15:45:00Z',
      },
    ],
    submittedAt: '2026-01-10T15:46:00Z',
    updatedAt: '2026-01-14T09:20:00Z',
    claimNumber: 'KOI-2601-1201',
  },
];

export function getClaimByNumber(claimNumber: string): ClaimWithPhone | undefined {
  return mockClaims.find((c) => c.claimNumber === claimNumber);
}

export function getClaimByNumberAndPhone(
  claimNumber: string,
  phone: string
): ClaimWithPhone | undefined {
  return mockClaims.find(
    (c) => c.claimNumber === claimNumber && c.consumerPhone === phone
  );
}

export function getClaimsByEmail(email: string): ClaimWithPhone[] {
  return mockClaims.filter((c) => c.consumerEmail === email);
}

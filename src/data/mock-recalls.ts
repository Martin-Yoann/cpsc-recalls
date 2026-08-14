// ============================================================
// KOI Recall Platform — Mock Recall Campaigns
// Based on: Candy Master Music Lollipop Recall Demo
// ============================================================

import {
  type Campaign,
  EvidenceType,
  RecallStatus,
  RemedyType,
  RiskLevel,
} from '@/types';

// === Campaign: Music Lollipop Safety Recall ===
const musicLollipopCampaign: Campaign = {
  id: 'cmp_001',
  slug: 'music-lollipop-demo-2026',
  title: 'Music Lollipop Safety Recall',
  summary:
    'Selected fictional lots across the Candy Master Music Lollipop series are included in this demonstration. Affected products may pose a component-separation hazard.',
  description:
    'Candy Master has initiated a voluntary safety recall for specific lots of the Music Lollipop product line. The recall addresses a fictional component-separation hazard identified during routine quality testing. Consumers who have purchased affected products should stop using them immediately and check the lot code printed near the package seal against the list of affected lots below. Only products with lot codes ML-2406-A, ML-2407-B, or ML-2408-C and date codes 06/2024, 07/2024, or 08/2024 are within the scope of this demonstration.',
  riskLevel: RiskLevel.MODERATE,
  status: RecallStatus.ACTIVE,
  cpscNumber: '26-042',
  recallDate: '2025-12-10',
  lastUpdated: '2026-02-20',
  manufacturerName: 'Candy Master Confectionery Co.',
  manufacturerContact: '(555) 010-2042 (Mon–Fri, 9:00 a.m.–5:00 p.m. ET)',
  estimatedUnits: 45000,
  hazardDescription:
    'Fictional component-separation hazard identified during routine quality testing. The candy housing may separate from the musical stick component, posing a potential small-parts hazard.',
  instructions:
    'Stop using a potentially affected product until its lot code has been checked. Locate the lot code near the package seal (format ML-0000-X) and the date code (MM/YYYY). If your product matches one of the listed affected lots, do not consume the product and follow the remedy instructions below.',
  images: ['/images/music-lollipop.png'],
  affectedLots: ['ML-2406-A', 'ML-2407-B', 'ML-2408-C'],
  dateCodes: ['06/2024', '07/2024', '08/2024'],
  affectedProducts: [
    {
      id: 'prod_001',
      name: 'Candy Master Music Lollipop',
      modelNumber: 'ML-18G-SERIES',
      upc: '850045672031',
      manufactureDateStart: '2024-06-01',
      manufactureDateEnd: '2024-08-31',
      description:
        'Musical lollipop with built-in sound component. 18g candy head in assorted shapes (Bear, Dinosaur, Strawberry, Heart) and flavors (Peach, Strawberry). Lot code printed near the package seal in format ML-0000-X. Date code in MM/YYYY format below the lot code.',
      imageUrl: '/images/music-lollipop.png',
      brandName: 'Candy Master',
      retailerNames: [
        'Amazon',
        'Walmart',
        'Target',
        'Kroger',
        'CVS',
        'Walgreens',
        'CandyMaster.com',
      ],
      priceRange: { min: 3.99, max: 5.99 },
      weight: '18g',
      flavors: ['Peach', 'Strawberry'],
      shapes: ['Bear', 'Dinosaur', 'Strawberry', 'Heart'],
    },
  ],
  remedies: [
    {
      id: 'rem_001',
      type: RemedyType.REPLACEMENT,
      title: 'Free Replacement Product',
      description:
        'Receive a replacement Music Lollipop from an unaffected production batch. The replacement will be shipped within 10–14 business days after your claim is verified. A prepaid return label for the affected product will be included.',
      deadline: '2027-12-10',
      requiresEvidence: true,
      evidenceTypes: [EvidenceType.PRODUCT_PHOTO, EvidenceType.SERIAL_NUMBER],
    },
    {
      id: 'rem_002',
      type: RemedyType.REFUND,
      title: 'Full Refund',
      description:
        'Receive a full refund of the purchase price. Proof of purchase is required. Refund will be processed to the original payment method within 7–14 business days after claim approval.',
      deadline: '2027-12-10',
      requiresEvidence: true,
      evidenceTypes: [EvidenceType.PROOF_OF_PURCHASE, EvidenceType.PRODUCT_PHOTO],
      compensationAmount: 5.99,
    },
  ],
};

export const mockCampaigns: Campaign[] = [musicLollipopCampaign];

export function getCampaignBySlug(slug: string): Campaign | undefined {
  return mockCampaigns.find((c) => c.slug === slug);
}

export function getCampaignById(id: string): Campaign | undefined {
  return mockCampaigns.find((c) => c.id === id);
}

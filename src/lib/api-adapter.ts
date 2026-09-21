// ============================================================
// KOI — API Adapter
// Bridges generated API types → frontend domain types
// Connected to Neon-backed API. Demo mode: graceful mock fallback.
// ============================================================

import { cache } from 'react';
import { RecallStatus, RemedyType, EvidenceType } from '@/types';
import type { Campaign } from '@/types';
import type { CampaignView } from '@/lib/api-client';
import { getCampaign as apiGetCampaign } from '@/lib/api-client';
import { mockCampaigns, getCampaignBySlug } from '@/data/mock-recalls';

const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

// ================================================================
// API → Domain adapter — only fill what the API provides
// ================================================================

function campaignViewToCampaign(view: CampaignView): Campaign {
  const firstProduct = view.products[0];
  const lots = firstProduct?.affectedLots ?? [];
  const dateCodes = [...new Set(lots.map((l) => l.dateCode))].filter(Boolean);

  return {
    id: view.code,
    slug: view.slug,
    title: view.title,
    summary: view.summary,
    description: view.summary,
    // riskLevel intentionally absent: the API provides no severity signal yet
    // (P1-5) and the UI hides the badge rather than guessing one.
    status: RecallStatus.ACTIVE,
    cpscNumber: view.code,
    recallDate: view.publishedAt ?? '',
    lastUpdated: '',
    remedySummary: view.remedySummary,
    manufacturerName: firstProduct?.brand ?? '',
    manufacturerContact: view.support?.phone
      ? `${view.support.phone} (${view.support.hours ?? ''})`
      : '',
    estimatedUnits: 0,
    hazardDescription: view.hazard,
    instructions: view.immediateAction,
    images: [],
    affectedLots: lots.map((l) => l.lotCode).filter(Boolean),
    dateCodes,
    privacyNotice: view.privacyNotice,
    evidenceRequirements: view.evidenceRequirements.map((requirement) => ({
      category: requirement.category,
      required: requirement.required,
      minimumFiles: requirement.minimumFiles,
      maximumFiles: requirement.maximumFiles,
      allowedMimeTypes: requirement.allowedMimeTypes,
      maximumFileSizeBytes: requirement.maximumFileSizeBytes,
      instructions: requirement.instructions,
    })),
    affectedProducts: view.products.map((p) => ({
      id: p.productId,
      name: p.name,
      modelNumber: p.sku,
      upc: '', // unit UPC not provided by the API yet; empty until it is
      manufactureDateStart: lots[0]?.dateCode ?? '',
      manufactureDateEnd: lots[lots.length - 1]?.dateCode ?? '',
      description: `${p.name}`,
      imageUrl: '',
      brandName: p.brand,
      retailerNames: [],
      priceRange: { min: 0, max: 0 },
      flavors: p.flavors,
      shapes: p.shapes,
    })),
    remedies: view.remedies.map((r) => ({
      id: r.code,
      type: remedyTypeForCode(r.code),
      title: r.displayName,
      description: r.displayName,
      deadline: '',
      requiresEvidence: true,
      evidenceTypes: [EvidenceType.PRODUCT_PHOTO, EvidenceType.PROOF_OF_PURCHASE],
      compensationAmount: undefined,
    })),
  };
}

/**
 * Maps a campaign remedy code to the domain type.
 *
 * The previous form —  — silently
 * classified every other code as a replacement, so a disposal campaign asked the
 * consumer for a mailing address and read as if a shipment were coming. Known
 * codes are named; anything unrecognised still falls back to REPLACEMENT, which
 * is now a visible choice in one place rather than an accident of a ternary.
 */
function remedyTypeForCode(code: string): RemedyType {
  switch (code) {
    case 'refund':
      return RemedyType.REFUND;
    case 'repair':
      return RemedyType.REPAIR;
    case 'voucher':
      return RemedyType.VOUCHER;
    case 'disposal_instruction':
      return RemedyType.DISPOSAL_INSTRUCTION;
    case 'replacement':
    default:
      return RemedyType.REPLACEMENT;
  }
}

// ================================================================
// Unified fetch — demo only mock, production shows errors
// ================================================================

// `cache` dedupes the double fetch from `generateMetadata` + the page body so a
// single recall view only hits the backend once per request.
export const fetchCampaign = cache(async function fetchCampaign(
  slug: string,
): Promise<{ campaign?: Campaign; error?: { status: number; requestId?: string } }> {
  const result = await apiGetCampaign(slug);

  if (result.ok) {
    return { campaign: campaignViewToCampaign(result.data.campaign) };
  }

  // API failure — demo mode falls back to mock data instead of erroring
  const problem = result.ok ? undefined : (result as { error: { requestId?: string } }).error;

  if (DEMO_MODE) {
    const mock = getCampaignBySlug(slug) ?? mockCampaigns[0];
    if (mock) {
      console.warn(
        `[API] GET /v1/recall-campaigns/${slug} → ${result.status}; demo mode fallback to mock campaign "${mock.slug}"`,
      );
      return { campaign: mock };
    }
  }

  console.error(
    `[API] GET /v1/recall-campaigns/${slug} → ${result.status}`,
    { requestId: problem?.requestId },
  );
  return { error: { status: result.status, requestId: problem?.requestId } };
});

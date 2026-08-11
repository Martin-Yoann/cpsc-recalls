// ============================================================
// KOI — API Adapter
// Bridges generated API types → frontend domain types
// Production: API failures → explicit error state, NOT mock data
// Demo: NEXT_PUBLIC_DEMO_MODE=true enables mock fallback
// ============================================================

import { RiskLevel, RecallStatus, RemedyType, EvidenceType } from '@/types';
import type { Campaign } from '@/types';
import type { CampaignView } from '@/lib/api-client';
import { getCampaign as apiGetCampaign } from '@/lib/api-client';

const isDemo = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

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
    riskLevel: RiskLevel.MODERATE,
    status: RecallStatus.ACTIVE,
    cpscNumber: view.code,
    recallDate: '',
    lastUpdated: '',
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
    affectedProducts: view.products.map((p) => ({
      id: p.productId,
      name: p.name,
      modelNumber: p.sku,
      upc: p.sku, // Note: sku ≠ UPC; this will be refined when the API provides unit UPCs
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
      type: r.code === 'refund' ? RemedyType.REFUND : RemedyType.REPLACEMENT,
      title: r.displayName,
      description: r.displayName,
      deadline: '',
      requiresEvidence: true,
      evidenceTypes: [EvidenceType.PRODUCT_PHOTO, EvidenceType.PROOF_OF_PURCHASE],
      compensationAmount: undefined,
    })),
  };
}

// ================================================================
// Unified fetch — demo only mock, production shows errors
// ================================================================

export async function fetchCampaign(
  slug: string,
): Promise<{ campaign?: Campaign; error?: { status: number; requestId?: string } }> {
  const result = await apiGetCampaign(slug);

  if (result.ok) {
    return { campaign: campaignViewToCampaign(result.data.campaign) };
  }

  // Demo mode only: fall back to mock data
  if (isDemo) {
    console.info(
      `[API DEMO] GET /v1/recall-campaigns/${slug} → ${result.status}, using mock data`,
    );
    // Dynamic import only in demo mode
    const { getCampaignBySlug } = await import('@/data/mock-recalls');
    return { campaign: getCampaignBySlug(slug) };
  }

  // Production: return explicit error
  const problem = result.ok ? undefined : (result as { error: { requestId?: string } }).error;
  console.error(
    `[API] GET /v1/recall-campaigns/${slug} → ${result.status}`,
    { requestId: problem?.requestId },
  );
  return { error: { status: result.status, requestId: problem?.requestId } };
}

// ============================================================
// KOI — Campaign Utilities
// Bridge until GET /v1/campaigns list endpoint exists.
// Currently fetches known slugs from the single-campaign backend.
// ============================================================

import { fetchCampaign } from '@/lib/api-adapter';
import type { Campaign } from '@/types';

/** Known campaign slugs from the backend seed data. */
const KNOWN_SLUGS = ['music-lollipop-demo-2026'];

export interface FetchAllResult {
  campaigns: Campaign[];
  errors: Array<{ slug: string; status: number }>;
}

/**
 * Fetches all known recall campaigns from the backend.
 * Uses a hardcoded slug list until GET /v1/campaigns is available.
 */
export async function fetchAllCampaigns(): Promise<FetchAllResult> {
  const results = await Promise.allSettled(
    KNOWN_SLUGS.map(async (slug) => {
      const result = await fetchCampaign(slug);
      return { slug, result };
    }),
  );

  const campaigns: Campaign[] = [];
  const errors: Array<{ slug: string; status: number }> = [];

  for (const r of results) {
    if (r.status === 'fulfilled') {
      const { slug, result } = r.value;
      if (result.campaign) {
        campaigns.push(result.campaign);
      } else if (result.error) {
        errors.push({ slug, status: result.error.status });
      }
    }
  }

  return { campaigns, errors };
}

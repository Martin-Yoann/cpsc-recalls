/**
 * Cache tag names for the published-campaign reads, shared by the reader
 * (src/lib/api-client.ts) and the on-demand revalidation route
 * (src/app/api/revalidate/route.ts).
 *
 * This format is defined here and nowhere else. The backend's cache invalidator
 * sends a bare campaign slug over HTTP and the revalidate route turns it into a
 * tag, so no constant is mirrored across the two repositories and there is
 * nothing to keep in sync: changing the prefix below moves both the tag applied
 * at fetch time and the tag expired on demand, because both go through
 * campaignTag().
 */

const CAMPAIGN_TAG_PREFIX = 'campaign:';

/** Tag applied to a single campaign's cached public read. */
export function campaignTag(slug: string): string {
  return `${CAMPAIGN_TAG_PREFIX}${slug}`;
}

/**
 * Guards the revalidate route against arbitrary tag injection. This mirrors the
 * backend's `recall_campaigns_slug_format_chk` constraint — the one genuine
 * cross-repo coupling left, and it fails safe: a slug the database would reject
 * is also rejected here rather than being used to build a tag.
 */
export const CAMPAIGN_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

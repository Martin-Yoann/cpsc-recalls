import { timingSafeEqual } from 'node:crypto';

import { revalidateTag } from 'next/cache';
import { NextResponse } from 'next/server';

import { CAMPAIGN_SLUG_PATTERN, campaignTag } from '@/lib/cache-tags';

/**
 * On-demand cache invalidation, called by the backend right after a campaign
 * version is published. The 60-second revalidate window remains as a backstop;
 * this endpoint is what makes an edited recall notice appear immediately
 * instead of up to a minute later.
 *
 * `REVALIDATE_SECRET` is a shared secret between the two repos and is compared
 * in constant time. With no secret configured the route fails closed, so an
 * unconfigured deployment is never an open invalidation endpoint.
 *
 * POST /api/revalidate
 *   Authorization: Bearer <REVALIDATE_SECRET>
 *   { "slug": "music-lollipop-demo-2026" }
 */

const REVALIDATE_SECRET = (process.env.REVALIDATE_SECRET ?? '').trim();

function isAuthorized(request: Request): boolean {
  if (REVALIDATE_SECRET.length === 0) return false;

  const presented = (request.headers.get('authorization') ?? '').replace(/^Bearer\s+/i, '');
  const presentedBytes = Buffer.from(presented, 'utf8');
  const expectedBytes = Buffer.from(REVALIDATE_SECRET, 'utf8');

  // timingSafeEqual throws on a length mismatch, which would itself leak the
  // secret's length, so reject unequal lengths first.
  if (presentedBytes.length !== expectedBytes.length) return false;
  return timingSafeEqual(presentedBytes, expectedBytes);
}

export async function POST(request: Request): Promise<NextResponse> {
  if (!isAuthorized(request)) {
    if (REVALIDATE_SECRET.length === 0) {
      console.error('[revalidate] REVALIDATE_SECRET is not configured; refusing to invalidate.');
    }
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: unknown = await request.json().catch(() => null);
  const slug = (body as { slug?: unknown } | null)?.slug;

  // Restrict to the backend's slug shape so a caller cannot expire arbitrary
  // tags by passing an unexpected value.
  if (typeof slug !== 'string' || !CAMPAIGN_SLUG_PATTERN.test(slug)) {
    return NextResponse.json(
      { error: 'A campaign slug matching ^[a-z0-9]+(-[a-z0-9]+)*$ is required.' },
      { status: 400 },
    );
  }

  const tag = campaignTag(slug);
  // `{ expire: 0 }` rather than the usual `'max'` profile: this caller is
  // another service hitting a Route Handler, not a Server Action, and `'max'`
  // would keep serving the superseded notice while revalidating in the
  // background. For recall content the very next visitor must see the new
  // version, even at the cost of that one request blocking.
  revalidateTag(tag, { expire: 0 });

  return NextResponse.json({ revalidated: true, tag });
}

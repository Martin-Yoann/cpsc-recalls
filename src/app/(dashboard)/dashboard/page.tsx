'use client';

// ============================================================
// KOI Recall Platform — User Dashboard v4
// Stat cards · status distribution · recent claims · orders
// ============================================================

import Link from 'next/link';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Package,
  Search,
  ShieldCheck,
  Store,
  TrendingUp,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/shared/status-badge';
import { useAuth } from '@/lib/auth-context';
import { listConsumerClaims, type ConsumerClaim } from '@/lib/api-client';
import { getOrdersByUserId } from '@/data/mock-orders';
import { DEMO_MODE } from '@/lib/demo-mode';

type ClaimStatusKey =
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'remedy_issued'
  | 'resolved'
  | 'rejected';

const STATUS_ORDER: ClaimStatusKey[] = [
  'submitted',
  'under_review',
  'verified',
  'remedy_issued',
  'resolved',
  'rejected',
];

const STATUS_BAR_COLORS: Record<ClaimStatusKey, string> = {
  submitted: 'bg-info',
  under_review: 'bg-alert',
  verified: 'bg-success/70',
  remedy_issued: 'bg-success',
  resolved: 'bg-foreground',
  rejected: 'bg-brand',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [claims, setClaims] = useState<ConsumerClaim[] | null>(null);
  // Design §9/§14: mock orders are demo-only fixtures.
  const orders = DEMO_MODE && user ? getOrdersByUserId(user.id) : [];

  useEffect(() => {
    let cancelled = false;
    if (!user?.token) return () => { cancelled = true; };
    void listConsumerClaims(user.token).then((response) => {
      if (cancelled) return;
      setClaims(response.ok ? response.data.claims : []);
    });
    return () => { cancelled = true; };
  }, [user?.token]);

  const claimsList = user?.token ? (claims ?? []) : [];

  const activeClaims = claimsList.filter((c) =>
    ['submitted', 'under_review', 'verified', 'remedy_issued'].includes(c.status)
  );
  const resolvedClaims = claimsList.filter((c) => c.status === 'resolved');
  const pendingClaims = claimsList.filter((c) =>
    ['submitted', 'under_review'].includes(c.status)
  );

  const statusCounts = STATUS_ORDER.map((s) => ({
    status: s,
    count: claimsList.filter((c) => c.status === s).length,
  })).filter((s) => s.count > 0);

  const resolutionRate =
    claimsList.length > 0 ? Math.round((resolvedClaims.length / claimsList.length) * 100) : 0;

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="label-eyebrow text-brand">Dashboard</p>
          <h1 className="mt-2 text-[28px] leading-tight font-bold text-foreground">
            Welcome back, {user?.name}
          </h1>
          <p className="mt-1 text-secondary">
            Here is your recall processing overview
          </p>
        </div>
        <Link href="/lookup" className="btn-outline">
          <Search className="h-4 w-4" />
          Track a Claim
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Claims', value: claimsList.length, icon: ClipboardList },
          { label: 'In Progress', value: activeClaims.length, icon: Clock },
          { label: 'Resolved', value: resolvedClaims.length, icon: CheckCircle2 },
          { label: DEMO_MODE ? 'Linked Orders · Demo' : 'Linked Orders', value: orders.length, icon: Package },
        ].map((stat) => (
          <div key={stat.label} className="card-surface p-5">
            <div className="flex items-center justify-between">
              <p className="label-eyebrow">{stat.label}</p>
              <div className="flex h-9 w-9 items-center justify-center rounded-md bg-surface-dim text-foreground">
                <stat.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-[28px] font-bold text-foreground leading-none">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Status distribution */}
      {claimsList.length > 0 && (
        <div className="card-surface p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-secondary" />
              Claims by Status
            </h2>
            <span className="text-sm text-secondary">
              Resolution rate{' '}
              <span className="font-semibold text-foreground">{resolutionRate}%</span>
            </span>
          </div>
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-dim">
            {statusCounts.map((s) => (
              <div
                key={s.status}
                className={`h-full ${STATUS_BAR_COLORS[s.status]}`}
                style={{ width: `${(s.count / claimsList.length) * 100}%` }}
                title={`${s.status.replace(/_/g, ' ')}: ${s.count}`}
              />
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            {statusCounts.map((s) => (
              <span key={s.status} className="inline-flex items-center gap-2 text-xs text-secondary">
                <span className={`h-2 w-2 rounded-full ${STATUS_BAR_COLORS[s.status]}`} />
                {s.status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                <span className="font-semibold text-foreground">{s.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Pending Action */}
      {pendingClaims.length > 0 && (
        <div className="rounded-md border-l-4 border-brand bg-brand-light/40 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-brand mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-brand">Pending Claims Require Attention</p>
              <p className="text-sm text-secondary mt-1">
                You have {pendingClaims.length} claim{pendingClaims.length > 1 ? 's' : ''} currently
                under review. Please ensure all required evidence has been submitted to expedite
                processing.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Claims */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Recent Claims</h2>
          <Link href="/dashboard/claims" className="text-sm font-semibold text-brand hover:underline flex items-center gap-1">
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {claimsList.length > 0 ? (
          <div className="space-y-2">
            {claimsList.slice(0, 5).map((claim) => (
              <Link
                key={claim.id}
                href={`/dashboard/claims/${claim.claimNumber}`}
                className="flex items-center justify-between card-surface p-4 transition-colors hover:border-foreground/30 group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-surface-dim text-foreground">
                    <ClipboardList className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground font-mono group-hover:text-brand transition-colors">
                      {claim.claimNumber}
                    </p>
                    <p className="text-xs text-secondary truncate max-w-[260px]">
                      {claim.campaignTitle || 'Unknown Campaign'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge variant={claim.status} />
                  <span className="text-xs text-secondary hidden sm:block">
                    {new Date(claim.submittedAt).toLocaleDateString('en-US')}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="card-surface p-12 text-center">
            <ClipboardList className="h-10 w-10 mx-auto text-secondary mb-3" />
            <h3 className="text-base font-semibold text-foreground mb-1">No Claims Yet</h3>
            <p className="text-sm text-secondary mb-5">
              You haven&apos;t submitted any recall claims. Browse active recall campaigns to get started.
            </p>
            <Link href="/#active-recalls" className="btn-brand">
              Browse Active Recalls
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>

      {/* Linked Orders */}
      {orders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-foreground">Linked Orders</h2>
            <Link href="/dashboard/orders" className="text-sm font-semibold text-brand hover:underline flex items-center gap-1">
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {orders.slice(0, 4).map((order) => (
              <div key={order.id} className="card-surface p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">
                      {order.productName}
                    </p>
                    <p className="text-xs text-secondary font-mono mt-0.5">
                      {order.orderNumber}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-foreground shrink-0">
                    ${order.purchaseAmount.toFixed(2)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-secondary">
                  <span className="inline-flex items-center gap-1">
                    <Store className="h-3 w-3" />
                    {order.retailerName}
                  </span>
                  <span>{new Date(order.purchaseDate).toLocaleDateString('en-US')}</span>
                </div>
                {order.claimId && (
                  <div className="mt-3 inline-flex items-center gap-1 rounded-md bg-success/10 px-2 py-0.5 text-[10px] font-semibold text-success">
                    <ShieldCheck className="h-3 w-3" />
                    Linked to claim
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

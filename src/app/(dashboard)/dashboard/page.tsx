'use client';

// ============================================================
// KOI Recall Platform — User Dashboard Home v2.0
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
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { useAuth } from '@/lib/auth-context';
import { listConsumerClaims, type ConsumerClaim } from '@/lib/api-client';
import { getOrdersByUserId } from '@/data/mock-orders';
import { cn } from '@/lib/utils';

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
  submitted: 'bg-blue-400',
  under_review: 'bg-amber-400',
  verified: 'bg-emerald-400',
  remedy_issued: 'bg-teal-500',
  resolved: 'bg-blade-resolution',
  rejected: 'bg-red-400',
};

export default function DashboardPage() {
  const { user } = useAuth();
  const [claims, setClaims] = useState<ConsumerClaim[]>([]);
  const orders = user ? getOrdersByUserId(user.id) : [];

  useEffect(() => {
    let cancelled = false;
    if (!user?.token) {
      setClaims([]);
      return;
    }
    void listConsumerClaims(user.token).then((response) => {
      if (!cancelled && response.ok) setClaims(response.data.claims);
      if (!cancelled && !response.ok) setClaims([]);
    });
    return () => {
      cancelled = true;
    };
  }, [user?.token]);

  const activeClaims = claims.filter((c) =>
    ['submitted', 'under_review', 'verified', 'remedy_issued'].includes(c.status)
  );
  const resolvedClaims = claims.filter((c) => c.status === 'resolved');
  const pendingClaims = claims.filter((c) =>
    ['submitted', 'under_review'].includes(c.status)
  );

  const statusCounts = STATUS_ORDER.map((s) => ({
    status: s,
    count: claims.filter((c) => c.status === s).length,
  })).filter((s) => s.count > 0);

  const resolutionRate =
    claims.length > 0 ? Math.round((resolvedClaims.length / claims.length) * 100) : 0;

  return (
    <div className="space-y-8 stagger-in">
      {/* Welcome */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Welcome back, {user?.name}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Here is your recall processing overview
          </p>
        </div>
        <Link href="/lookup">
          <Button variant="outline" size="sm" className="gap-1.5 cursor-pointer">
            <Search className="h-3.5 w-3.5" />
            Track a Claim
          </Button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Claims', value: claims.length, icon: ClipboardList, color: 'text-brand-teal', bg: 'bg-blade-resolution-light' },
          { label: 'In Progress', value: activeClaims.length, icon: Clock, color: 'text-blade-verification', bg: 'bg-blade-verification-light' },
          { label: 'Resolved', value: resolvedClaims.length, icon: CheckCircle2, color: 'text-blade-resolution', bg: 'bg-blade-resolution-light' },
          { label: 'Linked Orders', value: orders.length, icon: Package, color: 'text-blade-safety', bg: 'bg-blade-safety-light' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border bg-surface-elevated p-4 shadow-sm card-lift cursor-default"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">
                {stat.label}
              </span>
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', stat.bg)}>
                <stat.icon className={cn('h-4 w-4', stat.color)} />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Status distribution */}
      {claims.length > 0 && (
        <div className="rounded-xl border bg-surface-elevated p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 className="text-sm font-bold text-text-primary flex items-center gap-1.5">
              <TrendingUp className="h-4 w-4 text-text-tertiary" />
              Claims by Status
            </h2>
            <span className="text-xs text-text-tertiary">
              Resolution rate{' '}
              <span className="font-semibold text-blade-resolution">{resolutionRate}%</span>
            </span>
          </div>
          {/* Stacked bar */}
          <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-secondary">
            {statusCounts.map((s) => (
              <div
                key={s.status}
                className={cn('h-full transition-all duration-500', STATUS_BAR_COLORS[s.status])}
                style={{ width: `${(s.count / claims.length) * 100}%` }}
                title={`${s.status.replace(/_/g, ' ')}: ${s.count}`}
              />
            ))}
          </div>
          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
            {statusCounts.map((s) => (
              <span key={s.status} className="inline-flex items-center gap-1.5 text-xs text-text-secondary">
                <span className={cn('h-2 w-2 rounded-full', STATUS_BAR_COLORS[s.status])} />
                {s.status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                <span className="font-semibold text-text-primary">{s.count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Pending Action */}
      {pendingClaims.length > 0 && (
        <div className="rounded-xl border blade-accent-safety bg-blade-safety-light/30 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blade-safety mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-blade-safety-text">Pending Claims Require Attention</p>
              <p className="text-sm text-blade-safety-text/80 mt-1">
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
          <h2 className="text-lg font-bold text-text-primary">Recent Claims</h2>
          <Link
            href="/dashboard/claims"
            className="text-sm font-medium text-brand-teal hover:underline flex items-center gap-1"
          >
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {claims.length > 0 ? (
          <div className="space-y-3">
            {claims.slice(0, 5).map((claim) => {
              return (
                <Link
                  key={claim.id}
                  href={`/dashboard/claims/${claim.claimNumber}`}
                  className="flex items-center justify-between p-4 rounded-xl border bg-surface-elevated hover:shadow-md hover:border-brand-teal/30 hover:-translate-y-0.5 transition-all duration-250 group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                        claim.status === 'resolved' && 'bg-blade-resolution-light',
                        claim.status === 'rejected' && 'bg-red-50',
                        ['submitted', 'under_review'].includes(claim.status) &&
                          'bg-blade-verification-light',
                        ['verified', 'remedy_issued'].includes(claim.status) &&
                          'bg-blade-resolution-light',
                      )}
                    >
                      <ClipboardList
                        className={cn(
                          'h-4.5 w-4.5',
                          claim.status === 'resolved' && 'text-blade-resolution',
                          claim.status === 'rejected' && 'text-red-600',
                          ['submitted', 'under_review'].includes(claim.status) &&
                            'text-blade-verification',
                          ['verified', 'remedy_issued'].includes(claim.status) &&
                            'text-blade-resolution',
                        )}
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary font-mono group-hover:text-brand-teal transition-colors">
                        {claim.claimNumber}
                      </p>
                      <p className="text-xs text-text-secondary truncate max-w-[260px]">
                        {claim.campaignTitle || 'Unknown Campaign'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge variant={claim.status} />
                    <span className="text-xs text-text-tertiary hidden sm:block">
                      {new Date(claim.submittedAt).toLocaleDateString('en-US')}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-xl border bg-surface-elevated p-10 text-center">
            <ClipboardList className="h-10 w-10 mx-auto text-text-tertiary mb-3" />
            <h3 className="text-base font-semibold text-text-primary mb-1">No Claims Yet</h3>
            <p className="text-sm text-text-secondary mb-4">
              You haven&apos;t submitted any recall claims. Browse active recall campaigns to get
              started.
            </p>
            <Link href="/#active-recalls">
              <Button className="bg-brand-teal hover:bg-blade-resolution-dark text-white cursor-pointer">
                Browse Active Recalls
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Linked Orders */}
      {orders.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-text-primary">Linked Orders</h2>
            <Link
              href="/dashboard/orders"
              className="text-sm font-medium text-brand-teal hover:underline flex items-center gap-1"
            >
              View All
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {orders.slice(0, 4).map((order) => (
              <div
                key={order.id}
                className="rounded-xl border bg-surface-elevated p-4 shadow-sm card-lift cursor-default"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-text-primary truncate">
                      {order.productName}
                    </p>
                    <p className="text-xs text-text-tertiary font-mono mt-0.5">
                      {order.orderNumber}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-text-primary shrink-0">
                    ${order.purchaseAmount.toFixed(2)}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-text-tertiary">
                  <span className="inline-flex items-center gap-1">
                    <Store className="h-3 w-3" />
                    {order.retailerName}
                  </span>
                  <span>{new Date(order.purchaseDate).toLocaleDateString('en-US')}</span>
                </div>
                {order.claimId && (
                  <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-blade-resolution-light px-2 py-0.5 text-[10px] font-semibold text-blade-resolution">
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

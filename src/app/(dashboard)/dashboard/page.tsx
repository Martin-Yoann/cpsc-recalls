'use client';

// ============================================================
// KOI Recall Platform — User Dashboard Home
// ============================================================

import Link from 'next/link';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Package,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { useAuth } from '@/lib/auth-context';
import { getClaimsByEmail } from '@/data/mock-claims';
import { getOrdersByUserId } from '@/data/mock-orders';
import { mockCampaigns } from '@/data/mock-recalls';
import { ClaimStatus } from '@/types';
import { cn } from '@/lib/utils';

export default function DashboardPage() {
  const { user } = useAuth();
  const claims = user ? getClaimsByEmail(user.email) : [];
  const orders = user ? getOrdersByUserId(user.id) : [];

  const activeClaims = claims.filter((c) =>
    [ClaimStatus.SUBMITTED, ClaimStatus.UNDER_REVIEW, ClaimStatus.VERIFIED, ClaimStatus.REMEDY_ISSUED].includes(c.status)
  );
  const resolvedClaims = claims.filter((c) => c.status === ClaimStatus.RESOLVED);
  const pendingClaims = claims.filter((c) =>
    [ClaimStatus.SUBMITTED, ClaimStatus.UNDER_REVIEW].includes(c.status)
  );

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Welcome back, {user?.name}
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Here is your recall processing overview
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Claims', value: claims.length, icon: ClipboardList, color: 'text-brand-teal', bg: 'bg-blade-resolution-light' },
          { label: 'In Progress', value: activeClaims.length, icon: Clock, color: 'text-blade-verification', bg: 'bg-blade-verification-light' },
          { label: 'Resolved', value: resolvedClaims.length, icon: CheckCircle2, color: 'text-blade-resolution', bg: 'bg-blade-resolution-light' },
          { label: 'Linked Orders', value: orders.length, icon: Package, color: 'text-blade-safety', bg: 'bg-blade-safety-light' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border bg-surface-elevated p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-tertiary uppercase tracking-wider">{stat.label}</span>
              <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', stat.bg)}>
                <stat.icon className={cn('h-4 w-4', stat.color)} />
              </div>
            </div>
            <p className="text-2xl font-bold text-text-primary">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Claims */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-text-primary">Recent Claims</h2>
          <Link href="/dashboard/claims" className="text-sm font-medium text-brand-teal hover:underline flex items-center gap-1">
            View All
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {claims.length > 0 ? (
          <div className="space-y-3">
            {claims.slice(0, 5).map((claim) => {
              const campaign = mockCampaigns.find((c) => c.id === claim.campaignId);
              return (
                <Link
                  key={claim.id}
                  href={`/dashboard/claims/${claim.claimNumber}`}
                  className="flex items-center justify-between p-4 rounded-xl border bg-surface-elevated hover:shadow-sm hover:border-brand-teal/30 transition-all group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                      claim.status === ClaimStatus.RESOLVED && 'bg-blade-resolution-light',
                      claim.status === ClaimStatus.REJECTED && 'bg-red-50',
                      [ClaimStatus.SUBMITTED, ClaimStatus.UNDER_REVIEW].includes(claim.status) && 'bg-blade-verification-light',
                      [ClaimStatus.VERIFIED, ClaimStatus.REMEDY_ISSUED].includes(claim.status) && 'bg-blade-resolution-light',
                    )}>
                      <ClipboardList className={cn(
                        'h-4.5 w-4.5',
                        claim.status === ClaimStatus.RESOLVED && 'text-blade-resolution',
                        claim.status === ClaimStatus.REJECTED && 'text-red-600',
                        [ClaimStatus.SUBMITTED, ClaimStatus.UNDER_REVIEW].includes(claim.status) && 'text-blade-verification',
                        [ClaimStatus.VERIFIED, ClaimStatus.REMEDY_ISSUED].includes(claim.status) && 'text-blade-resolution',
                      )} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text-primary font-mono group-hover:text-brand-teal transition-colors">
                        {claim.claimNumber}
                      </p>
                      <p className="text-xs text-text-secondary truncate max-w-[260px]">
                        {campaign?.title || 'Unknown Campaign'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge variant={claim.status as 'submitted' | 'under_review' | 'verified' | 'remedy_issued' | 'resolved' | 'rejected'} />
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
            <p className="text-sm text-text-secondary mb-4">You haven&apos;t submitted any recall claims. Browse active recall campaigns to get started.</p>
            <Link href="/#active-recalls">
              <Button className="bg-brand-teal hover:bg-blade-resolution-dark text-white">
                Browse Active Recalls
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>

      {/* Pending Action */}
      {pendingClaims.length > 0 && (
        <div className="rounded-xl border blade-accent-safety bg-blade-safety-light/30 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-blade-safety mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-bold text-blade-safety-text">Pending Claims Require Attention</p>
              <p className="text-sm text-blade-safety-text/80 mt-1">
                You have {pendingClaims.length} claim{pendingClaims.length > 1 ? 's' : ''} currently under review. Please ensure all required evidence has been submitted to expedite processing.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

'use client';

// ============================================================
// KOI Recall Platform — My Claims List
// ============================================================

import Link from 'next/link';
import { ClipboardList, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { useAuth } from '@/lib/auth-context';
import { getClaimsByEmail } from '@/data/mock-claims';
import { mockCampaigns } from '@/data/mock-recalls';

export default function MyClaimsPage() {
  const { user } = useAuth();
  const claims = user ? getClaimsByEmail(user.email) : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">My Claims</h1>
        <p className="text-sm text-text-secondary mt-1">
          {claims.length} claim{claims.length !== 1 ? 's' : ''} total
        </p>
      </div>

      {claims.length > 0 ? (
        <div className="space-y-3">
          {claims.map((claim) => {
            const campaign = mockCampaigns.find((c) => c.id === claim.campaignId);
            return (
              <Link
                key={claim.id}
                href={`/dashboard/claims/${claim.claimNumber}`}
                className="block rounded-xl border bg-surface-elevated p-5 hover:shadow-sm hover:border-brand-teal/30 transition-all group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm font-bold text-text-primary group-hover:text-brand-teal transition-colors">
                        {claim.claimNumber}
                      </span>
                      <StatusBadge variant={claim.status as 'submitted' | 'under_review' | 'verified' | 'remedy_issued' | 'resolved' | 'rejected'} />
                    </div>
                    <p className="text-sm text-text-secondary">{campaign?.title || 'Unknown Campaign'}</p>
                    <div className="flex items-center gap-4 text-xs text-text-tertiary">
                      <span>Submitted: {new Date(claim.submittedAt).toLocaleDateString('en-US')}</span>
                      <span>Evidence: {claim.evidence.length} file{claim.evidence.length !== 1 ? 's' : ''}</span>
                      {claim.resolutionDate && (
                        <span>Resolved: {new Date(claim.resolutionDate).toLocaleDateString('en-US')}</span>
                      )}
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-text-tertiary group-hover:text-brand-teal transition-colors shrink-0" />
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border bg-surface-elevated p-10 text-center">
          <ClipboardList className="h-10 w-10 mx-auto text-text-tertiary mb-3" />
          <h3 className="text-base font-semibold text-text-primary mb-1">No Claims Found</h3>
          <p className="text-sm text-text-secondary mb-4">You haven&apos;t submitted any recall claims yet.</p>
          <Link href="/#active-recalls">
            <Button className="bg-brand-teal hover:bg-blade-resolution-dark text-white">
              Browse Active Recalls
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

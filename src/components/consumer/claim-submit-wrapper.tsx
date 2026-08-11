'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, ClipboardList } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RemedyOptions } from '@/components/consumer/remedy-options';
import { submitClaim, type SharedClaim } from '@/lib/shared-claims-store';
import type { Campaign } from '@/types';
import type { Remedy } from '@/types';

interface Props {
  campaign: Campaign;
}

export function ClaimSubmitWrapper({ campaign }: Props) {
  const [submitted, setSubmitted] = useState<SharedClaim | null>(null);

  const handleSelect = (remedy: Remedy) => {
    const product = campaign.affectedProducts[0];
    const claim = submitClaim({
      campaignId: campaign.id,
      campaignTitle: campaign.title,
      campaignSlug: campaign.slug,
      consumerName: 'Consumer', // Will be collected in Phase 2 with full claim flow
      consumerEmail: 'consumer@email.com',
      consumerPhone: '',
      productName: product?.name || campaign.title,
      remedyId: remedy.id,
      remedyTitle: remedy.title,
      remedyType: remedy.type,
      refundAmount: remedy.compensationAmount,
      evidenceCount: 0,
    });
    setSubmitted(claim);
  };

  if (submitted) {
    return (
      <div className="text-center py-12 space-y-5 rounded-xl border bg-surface-elevated">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-blade-resolution-light border border-blade-resolution-medium/30">
          <CheckCircle2 className="h-8 w-8 text-blade-resolution" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-blade-resolution mb-1">Claim Submitted</h3>
          <p className="text-sm text-text-secondary">Your claim has been received.</p>
        </div>
        <div className="inline-flex flex-col items-center rounded-xl bg-surface-secondary border p-4">
          <p className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest mb-1">Claim Reference</p>
          <p className="text-2xl font-mono font-bold text-blade-resolution">{submitted.claimNumber}</p>
        </div>
        <div className="space-y-2 text-sm text-text-secondary max-w-xs mx-auto">
          <p className="flex items-center justify-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-blade-resolution" />
            Your remedy choice: {submitted.remedyTitle}
          </p>
          <p className="flex items-center justify-center gap-2">
            <ClipboardList className="h-4 w-4 text-blade-resolution" />
            Status: Submitted — an administrator will review your claim
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Link href="/lookup">
            <Button size="sm" variant="outline">
              Check Status
            </Button>
          </Link>
          <Button size="sm" onClick={() => setSubmitted(null)} className="bg-blade-resolution hover:bg-blade-resolution-dark text-white">
            Submit Another
          </Button>
        </div>
      </div>
    );
  }

  return <RemedyOptions remedies={campaign.remedies} onSelect={handleSelect} />;
}

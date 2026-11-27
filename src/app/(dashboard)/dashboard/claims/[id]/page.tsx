'use client';
import { useI18n } from "@/lib/i18n/provider";


// ============================================================
// KOI Recall Platform — Claim Detail (Dashboard)
// ============================================================

import { use, useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Check,
  Clock,
  Circle,
  Package,
  Wallet,
  FileText,
  AlertTriangle,
  ShieldCheck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/shared/status-badge';
import { useAuth } from '@/lib/auth-context';
import { EmailVerificationGate } from '@/components/auth/email-verification-gate';
import { getConsumerClaim, type ConsumerClaim } from '@/lib/api-client';
import { ClaimStatus } from '@/types';
import { cn } from '@/lib/utils';

const PIPELINE_STAGES = [
  { status: ClaimStatus.SUBMITTED, label: "ui.submitted.2e0035", icon: Circle },
  { status: ClaimStatus.UNDER_REVIEW, label: "ui.under.review.18afed", icon: Clock },
  { status: ClaimStatus.VERIFIED, label: "ui.verified.aed3b8", icon: Check },
  { status: ClaimStatus.REMEDY_ISSUED, label: "ui.remedy.issued.c74da1", icon: Package },
  { status: ClaimStatus.RESOLVED, label: "ui.resolved.d999ae", icon: ShieldCheck },
];

const STATUS_ORDER = [ClaimStatus.SUBMITTED, ClaimStatus.UNDER_REVIEW, ClaimStatus.VERIFIED, ClaimStatus.REMEDY_ISSUED, ClaimStatus.RESOLVED];

export default function ClaimDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { t, locale } = useI18n();
  const { id } = use(params);
  const { user } = useAuth();
  const [claim, setClaim] = useState<ConsumerClaim | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    if (!user?.token || !user.claimsAccessVerified) {
      return () => {
        cancelled = true;
      };
    }
    void getConsumerClaim(id, user.token).then((response) => {
      if (cancelled) return;
      setClaim(response.ok ? response.data.claim : null);
    });
    return () => {
      cancelled = true;
    };
  }, [id, user?.token, user?.claimsAccessVerified]);

  if (user?.token && !user.claimsAccessVerified) return <EmailVerificationGate />;
  if (!user?.token || claim === undefined) return null;
  if (!claim) notFound();
  if (!claim) return null;

  const rawStatusIdx = STATUS_ORDER.indexOf(claim.status as ClaimStatus);
  // action_required (and any unknown status) keeps the pipeline at "Submitted
  // complete" — progress must never advance because the consumer was asked
  // for more information.
  const currentStatusIdx = rawStatusIdx >= 0 ? rawStatusIdx : 0;
  const isRejected = claim.status === 'rejected';
  const isActionRequired = claim.status === 'action_required';

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href="/dashboard/claims"
        className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("ui.back.to.claims.23cc01")}</Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-xl font-bold text-text-primary font-mono">{claim.claimNumber}</h1>
          <StatusBadge variant={claim.status} />
        </div>
        <p className="text-sm text-text-secondary">
          {t("ui.submitted.2e0035")}{" "}{new Date(claim.submittedAt).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
          {claim.resolutionDate && ` · Resolved ${new Date(claim.resolutionDate).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}`}
        </p>
      </div>

      {/* Action Required Notice (need_info loop with the review team) */}
      {isActionRequired && (
        <Card className="border-amber-200 bg-amber-50/60">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-amber-800">{t("ui.we.need.more.information.691bd8")}</p>
                {claim.infoRequest ? (
                  <p className="text-sm text-amber-900/90 mt-1 whitespace-pre-wrap leading-relaxed">{claim.infoRequest}</p>
                ) : (
                  <p className="text-sm text-amber-700/80 mt-1">
                    {t("ui.our.review.team.has.requested.additional.details.be0466")}</p>
                )}
                <p className="text-xs text-amber-700 mt-2">
                  {t("ui.your.claim.is.paused.until.the.requested.0c6e5f")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progress Pipeline */}
      {!isRejected && (
        <Card>
          <CardHeader><CardTitle className="text-base">{t("ui.processing.status.54c108")}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-start">
              {PIPELINE_STAGES.map((stage, i) => {
                const stageIdx = STATUS_ORDER.indexOf(stage.status);
                const isComplete = stageIdx < currentStatusIdx;
                const isCurrent = stage.status === claim.status;
                const isFuture = stageIdx > currentStatusIdx;
                const StatusIcon = stage.icon;

                return (
                  <div key={stage.status} className="flex-1 flex flex-col items-center relative">
                    {i > 0 && (
                      <div className={cn(
                        'absolute right-1/2 top-4.5 h-0.5',
                        isComplete || (i <= currentStatusIdx) ? 'w-full bg-blade-resolution' : 'w-full bg-border'
                      )} style={{ zIndex: 0 }} />
                    )}
                    <div className={cn(
                      'relative z-10 flex h-9 w-9 items-center justify-center rounded-full border-2 transition-colors',
                      isComplete && 'bg-blade-resolution border-blade-resolution text-white',
                      isCurrent && 'bg-brand-teal border-brand-teal text-white',
                      isFuture && 'bg-surface-elevated border-border text-text-tertiary'
                    )}>
                      <StatusIcon className="h-4 w-4" />
                    </div>
                    <p className={cn(
                      'mt-2 text-xs font-semibold text-center',
                      isFuture ? 'text-text-tertiary' : 'text-text-primary'
                    )}>
                      {t(stage.label)}
                    </p>
                    {isComplete && <p className="text-[10px] text-text-tertiary mt-0.5">{t("ui.complete.1f5a1a")}</p>}
                    {isCurrent && <p className="text-[10px] text-brand-teal font-semibold mt-0.5">{t("ui.current.4fc0e2")}</p>}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejected Notice */}
      {isRejected && (
        <Card className="border-red-200 bg-red-50/30">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-red-700">{t("ui.claim.rejected.df283e")}</p>
                <p className="text-sm text-red-600/80 mt-1">
                  {t("ui.this.claim.was.not.approved.after.review.8016a4")}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Product + Remedy Info */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">{t("ui.product.information.8f093e")}</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm font-semibold text-text-primary">{claim.productName}</p>
            <p className="text-xs text-text-secondary font-mono">{t("ui.lot.94d34d")}{" "}{claim.lotCode || 'N/A'}</p>
            <p className="text-xs text-text-secondary font-mono">{t("ui.date.81b7d2")}{" "}{claim.dateCode || 'N/A'}</p>
            {claim.shape && <p className="text-xs text-text-secondary">{t("ui.shape.14edb2")}{" "}{claim.shape}</p>}
            {claim.flavor && <p className="text-xs text-text-secondary">{t("ui.flavor.f03677")}{" "}{claim.flavor}</p>}
            {claim.campaignSlug && (
              <Link href={`/recalls/${claim.campaignSlug}`} className="inline-block text-xs text-brand-teal hover:underline mt-2">
                {t("ui.view.recall.details.6aafc3")}</Link>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base">{t("ui.remedy.details.1498bb")}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {(() => {
                  const IconComp = claim.remedyType === 'refund' ? Wallet : Package;
                  return <IconComp className="h-4 w-4 text-brand-teal" />;
                })()}
                <Badge variant="outline">{t(claim.remedyType === "refund" ? "remedy.refund" : "remedy.replacement")}</Badge>
              </div>
              <p className="text-sm font-semibold text-text-primary">{claim.remedyTitle}</p>
              {claim.refundAmount && (
                <p className="text-sm font-bold text-brand-teal">
                  {t("ui.compensation.4eb0d0")}{" "}{claim.refundAmount.toFixed(2)}
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Evidence */}
      <Card>
        <CardHeader><CardTitle className="text-base">{t("ui.submitted.evidence.338ccb")}{claim.evidenceCount} {t("ui.file.971c41")}{" "}{t(claim.evidenceCount !== 1 ? 's' : '')})</CardTitle></CardHeader>
        <CardContent>
          {claim.evidenceCount > 0 ? (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-secondary border">
              <FileText className="h-5 w-5 text-text-tertiary shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-text-primary">{claim.evidenceCount} {t("ui.evidence.file.aa92af")}{" "}{t(claim.evidenceCount !== 1 ? 's' : '')} {t("ui.submitted.fda437")}</p>
                <p className="text-xs text-text-tertiary">{t("ui.submitted.with.claim.on.e8966e")}{" "}{new Date(claim.submittedAt).toLocaleDateString(locale)}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-text-tertiary text-center py-4">{t("ui.no.evidence.files.submitted.yet.629004")}</p>
          )}
        </CardContent>
      </Card>

      {/* Estimated Resolution */}
      {!isRejected && !isActionRequired && claim.status !== 'resolved' && (
        <div className="rounded-md border border-brand-teal/20 bg-brand-teal/5 p-5 flex items-center gap-4">
          <Clock className="h-6 w-6 text-brand-teal shrink-0" />
          <div>
            <p className="text-sm font-semibold text-text-primary">{t("ui.estimated.completion.dc458d")}</p>
            <p className="text-xl font-bold text-brand-teal mt-0.5">
              {(() => {
                const submitted = new Date(claim.submittedAt).getTime();
                const fmt = (t: number) =>
                  new Date(t).toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
                return `${fmt(submitted + 14 * 864e5)} – ${fmt(submitted + 28 * 864e5)}`;
              })()}
            </p>
            <p className="text-xs text-text-tertiary mt-1">{t("ui.processing.time.may.vary.based.on.evidence.d553d3")}</p>
          </div>
        </div>
      )}
    </div>
  );
}

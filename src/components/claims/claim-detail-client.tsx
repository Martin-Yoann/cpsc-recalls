'use client';
import { useI18n } from "@/lib/i18n/provider";


import Link from 'next/link';
import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import { ArrowLeft, FileText, LockKeyhole, Package, UserRoundPlus, Wallet } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { useAuth } from '@/lib/auth-context';
import { EmailVerificationGate } from '@/components/auth/email-verification-gate';
import { getClaimDetailForViewer } from '@/lib/claim-access';
import type { ClaimLookupPayload } from '@/types/claims';

interface ClaimDetailClientProps {
  claimNumber: string;
  backHref: string;
  backLabel: string;
}

export function ClaimDetailClient({ claimNumber, backHref, backLabel }: ClaimDetailClientProps) {
  const { t, locale } = useI18n();
  const { user, isAuthenticated, isLoading, openAuthDrawer } = useAuth();
  const [detail, setDetail] = useState<ClaimLookupPayload | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    if (isLoading || (user?.token && !user.claimsAccessVerified)) return () => { cancelled = true; };
    void getClaimDetailForViewer(claimNumber, user?.token).then((nextDetail) => {
      if (!cancelled) setDetail(nextDetail);
    });
    return () => { cancelled = true; };
  }, [claimNumber, user?.token, user?.claimsAccessVerified, isLoading]);

  if (isLoading) return null;
  if (user?.token && !user.claimsAccessVerified) return <EmailVerificationGate />;
  if (detail === undefined) return null;
  if (!detail) notFound();

  const claim = detail.claim;

  return (
    <div className="space-y-6">
      <Link href={backHref} className="inline-flex items-center gap-1.5 text-sm text-secondary hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" />
        {t(backLabel)}
      </Link>

      {/* Header */}
      <div className="card-surface p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="font-mono text-xl font-bold text-foreground">{claim.claimNumber}</h1>
              <StatusBadge variant={claim.status} />
            </div>
            <p className="text-sm text-secondary">
              {t("ui.submitted.2e0035")}{" "}{new Date(claim.submittedAt).toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
            <p className="mt-1 text-sm font-medium text-foreground">
              {detail.campaignTitle || claim.campaignTitle}
            </p>
          </div>

          {!isAuthenticated && (
            <div className="max-w-sm p-4 rounded-md bg-surface-dim text-sm">
              <p className="flex items-center gap-2 font-semibold text-foreground">
                <LockKeyhole className="h-4 w-4" />
                {t("ui.this.guest.view.only.works.on.this.8df3b2")}</p>
              <button
                type="button"
                onClick={() => openAuthDrawer('register')}
                className="mt-2 inline-flex items-center gap-2 font-semibold text-brand hover:underline"
              >
                <UserRoundPlus className="h-4 w-4" />
                {t("ui.sign.up.to.keep.claims.synced.everywhere.d5ed81")}</button>
            </div>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Product */}
        <div className="card-surface p-6">
          <h2 className="text-base font-bold text-foreground pb-3 border-b border-border mb-4">{t("ui.product.information.8f093e")}</h2>
          <p className="text-sm font-semibold text-foreground">{detail.productName || claim.productName}</p>
          <div className="mt-3 space-y-1.5 text-xs text-secondary">
            <p>{t("ui.lot.94d34d")}<span className="font-mono font-semibold text-foreground">{claim.lotCode || 'N/A'}</span></p>
            <p>{t("ui.date.81b7d2")}<span className="font-mono font-semibold text-foreground">{claim.dateCode || 'N/A'}</span></p>
          </div>
          {claim.campaignSlug && (
            <Link
              href={`/recalls/${claim.campaignSlug}`}
              className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-brand hover:underline"
            >
              {t("ui.view.recall.details.6aafc3")}</Link>
          )}
        </div>

        {/* Remedy */}
        <div className="card-surface p-6">
          <h2 className="text-base font-bold text-foreground pb-3 border-b border-border mb-4">{t("ui.remedy.details.1498bb")}</h2>
          <div className="flex items-center gap-2 mb-3">
            {claim.remedyType === 'refund' ? (
              <Wallet className="h-4 w-4 text-foreground" />
            ) : (
              <Package className="h-4 w-4 text-foreground" />
            )}
            <span className="inline-flex items-center rounded-md bg-surface-dim px-2 py-0.5 text-xs font-semibold text-foreground">
              {t(detail.remedyType === "refund" ? "remedy.refund" : "remedy.replacement")}
            </span>
          </div>
          <p className="text-sm font-semibold text-foreground">
            {detail.remedyTitle || claim.remedyTitle}
          </p>
          {detail.refundAmount && (
            <p className="mt-2 text-base font-bold text-foreground">
              {t("ui.compensation.cf03ba")}<span className="text-brand">${detail.refundAmount.toFixed(2)}</span>
            </p>
          )}
        </div>
      </div>

      {/* Evidence */}
      <div className="card-surface p-6">
        <h2 className="text-base font-bold text-foreground pb-3 border-b border-border mb-4">
          {t("ui.submitted.evidence.338ccb")}{claim.evidenceCount} {t("ui.file.971c41")}{" "}{t(claim.evidenceCount !== 1 ? 's' : '')})
        </h2>
        {claim.evidenceCount > 0 ? (
          <div className="flex items-center gap-3 p-3 rounded-md bg-surface-dim">
            <FileText className="h-5 w-5 shrink-0 text-foreground" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-foreground">
                {claim.evidenceCount} {t("ui.evidence.file.aa92af")}{" "}{t(claim.evidenceCount !== 1 ? 's' : '')} {t("ui.submitted.fda437")}</p>
              <p className="text-xs text-secondary mt-0.5">
                {t("ui.submitted.with.claim.on.e8966e")}{" "}{new Date(claim.submittedAt).toLocaleDateString(locale)}
              </p>
            </div>
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-secondary">{t("ui.no.evidence.files.submitted.yet.629004")}</p>
        )}
      </div>
    </div>
  );
}

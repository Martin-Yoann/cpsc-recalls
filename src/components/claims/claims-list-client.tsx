'use client';
import { useI18n } from "@/lib/i18n/provider";


import Link from 'next/link';
import { useViewerClaims } from '@/lib/use-viewer-claims';
import { ClaimsLoadNotice } from '@/components/claims/claims-load-notice';
import { ArrowRight, ClipboardList, LockKeyhole, Search, UserRoundPlus } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { useAuth } from '@/lib/auth-context';
import { EmailVerificationGate } from '@/components/auth/email-verification-gate';

interface ClaimsListClientProps {
  detailBasePath: string;
  title?: string;
  emptyTitle?: string;
  emptyDescription?: string;
}

export function ClaimsListClient({
  detailBasePath,
  title = 'My Claims',
  emptyTitle = 'No Claims Found',
  emptyDescription = 'You have not submitted or looked up any recall claims yet.',
}: ClaimsListClientProps) {
  const { t, locale } = useI18n();
  const { user, isAuthenticated, isLoading, openAuthDrawer } = useAuth();
  const { claims: claimsList, loading, error, retry } = useViewerClaims();

  if (isLoading) return null;
  if (user?.token && !user.claimsAccessVerified) return <EmailVerificationGate />;

  if ((loading || error) && claimsList.length === 0) return <ClaimsLoadNotice loading={loading} error={error} retry={retry} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="label-eyebrow text-brand">{t("ui.claim.center.45b886")}</p>
          <h1 className="mt-2 text-[28px] leading-tight font-bold text-foreground">
            {t(title)}
          </h1>
          <p className="mt-1 text-secondary">
            {claimsList.length} {t("count.claim.one")}{" "}{t(claimsList.length !== 1 ? 's' : '')} {t("ui.available.review.the.latest.status.evidence.count.bbf02c")}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/lookup" className="btn-outline">
            <Search className="h-4 w-4" />
            {t("nav.checkStatus")}</Link>
          <Link href="/#active-recalls" className="btn-brand">
            {t("ui.browse.active.recalls.1be86e")}<ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>

      {/* Guest notice */}
      {!isAuthenticated && (
        <div className="card-surface p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <LockKeyhole className="h-4 w-4 text-secondary" />
            {t("ui.guest.mode.keeps.claims.on.this.device.15b589")}</p>
          <button
            type="button"
            onClick={() => openAuthDrawer('register')}
            className="inline-flex items-center gap-2 text-sm font-semibold text-brand hover:underline"
          >
            <UserRoundPlus className="h-4 w-4" />
            {t("ui.create.an.account.for.cross.device.access.d4b25e")}</button>
        </div>
      )}

      <ClaimsLoadNotice loading={loading} error={error} retry={retry} />
      {/* Claims list */}
      {claimsList.length > 0 ? (
        <div className="space-y-2">
          {claimsList.map((claim) => (
            <Link
              key={claim.id}
              href={`${detailBasePath}/${encodeURIComponent(claim.claimNumber)}`}
              className="card-surface p-4 sm:p-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between group hover:border-foreground/30"
            >
              <div className="min-w-0 space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-mono text-sm font-bold text-foreground group-hover:text-brand transition-colors">
                    {claim.claimNumber}
                  </span>
                  <StatusBadge variant={claim.status} />
                </div>
                <p className="text-sm font-medium text-secondary">
                  {claim.campaignTitle || t("ui.unknown.campaign.8228fd")}
                </p>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-secondary">
                  <span>{t("ui.submitted.100a58")}{" "}{new Date(claim.submittedAt).toLocaleDateString(locale)}</span>
                  <span>{t("ui.evidence.3ef354")}{" "}{claim.evidenceCount} {t("ui.file.971c41")}{" "}{t(claim.evidenceCount !== 1 ? 's' : '')}</span>
                  {claim.resolutionDate && (
                    <span>{t("ui.resolved.5a8b9c")}{" "}{new Date(claim.resolutionDate).toLocaleDateString(locale)}</span>
                  )}
                </div>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-secondary group-hover:text-brand transition-colors" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="card-surface p-10 text-center">
          <ClipboardList className="mx-auto mb-3 h-10 w-10 text-secondary" />
          <h3 className="text-base font-semibold text-foreground mb-1">{t(emptyTitle)}</h3>
          <p className="mx-auto mb-5 max-w-lg text-sm text-secondary leading-relaxed">
            {t(emptyDescription)}
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/lookup" className="btn-outline">{t("ui.check.existing.claim.391444")}</Link>
            <Link href="/" className="btn-brand">{t("ui.browse.recalls.4e805c")}</Link>
          </div>
        </div>
      )}
    </div>
  );
}

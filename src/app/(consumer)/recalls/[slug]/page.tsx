
import { getI18n } from "@/lib/i18n/server";
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  AlertTriangle,
  Eye,
  FileText,
  HelpCircle,
  Info,
  Package,
  Search,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { fetchCampaign } from '@/lib/api-adapter';
import { ClaimSubmitWrapper } from '@/components/consumer/claim-submit-wrapper';
import { StatusBadge } from '@/components/shared/status-badge';
import { RecallSupport } from '@/components/consumer/recall-support';
import { ContentLanguageNotice } from '@/components/consumer/content-language-notice';
import { RiskLevel } from '@/types';

interface RecallPageProps {
  params: Promise<{ slug: string }>;
}

/**
 * Revalidate window for the public recall notice.
 *
 * This page reads only route params — no cookies, headers, or search params —
 * so nothing here is per-visitor and the campaign data it awaits is shared. The
 * campaign fetch itself carries the same window (see
 * CAMPAIGN_REVALIDATE_SECONDS in src/lib/api-client.ts), and that fetch-level
 * value is what currently governs: with no campaign-list endpoint there is no
 * `generateStaticParams` to enumerate slugs, so Next still renders this segment
 * on demand and the HTML itself is not cached. What is cached is the backend
 * read, which is the part that was putting a request spike onto the database.
 * Keep both values in sync — changing this literal alone has no effect today,
 * but it becomes the route's ISR window if slugs ever become enumerable.
 *
 * The window is short on purpose: this is safety content, and a superseded lot
 * list or hazard description must not linger. Next requires a literal here — an
 * imported constant is not statically analysable.
 */
export const revalidate = 60;

const riskLabels: Record<string, string> = {
  [RiskLevel.CRITICAL]: 'CRITICAL RISK',
  [RiskLevel.HIGH]: 'HIGH RISK',
  [RiskLevel.MODERATE]: 'MODERATE RISK',
  [RiskLevel.LOW]: 'LOW RISK',
};

const riskStyles: Record<string, string> = {
  [RiskLevel.CRITICAL]: 'bg-brand-light text-brand border-brand/20',
  [RiskLevel.HIGH]: 'bg-alert/10 text-alert border-alert/20',
  [RiskLevel.MODERATE]: 'bg-alert/5 text-alert border-alert/10',
  [RiskLevel.LOW]: 'bg-success/10 text-success border-success/20',
};

export async function generateMetadata({ params }: RecallPageProps): Promise<Metadata> {
  const { campaign, error } = await fetchCampaign((await params).slug);

  // Metadata resolves before the response shell is flushed, so raising notFound
  // here is what actually produces a 404 status. The same call in the page body
  // is too late: loading.tsx has already streamed the shell out with a 200.
  // Only a genuine "no such campaign" is a 404 — see the note in the page body.
  if (error?.status === 404) notFound();

  // The page will render the outage boundary instead of a notice. Keep a
  // transient failure out of search results so it is never indexed against a
  // real recall URL — the boundary itself cannot declare this, since a client
  // component cannot export metadata.
  if (error) {
    return { title: 'Recall notice unavailable', robots: { index: false } };
  }

  return {
    title: campaign?.title ?? 'Recall Details',
    description: campaign?.hazardDescription ?? 'Product safety recall information',
  };
}

async function SectionHeading({
  icon: Icon,
  step,
  children,
  description,
}: {
  icon: typeof Info;
  step: string;
  children: React.ReactNode;
  description?: string;
}) {
  const { t } = await getI18n();
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="label-data text-brand">{step}</span>
        <Icon className="h-4 w-4 text-foreground" />
        <h2 className="text-xl font-bold text-foreground">{children}</h2>
      </div>
      {description && (
        <p className="text-sm text-secondary leading-relaxed max-w-2xl">{t(description)}</p>
      )}
    </div>
  );
}

async function SideCard({ title, icon: Icon, children }: { title: string; icon?: typeof Info; children: React.ReactNode }) {
  const { t } = await getI18n();
  return (
    <div className="card-surface p-5">
      <h3 className="mb-4 flex items-center gap-2 pb-3 border-b border-border text-base font-semibold text-foreground">
        {Icon && <Icon className="h-4 w-4 text-brand" />}
        {t(title)}
      </h3>
      {children}
    </div>
  );
}

export default async function RecallPage({ params }: RecallPageProps) {
  const { t, locale } = await getI18n();
  const { campaign, error } = await fetchCampaign((await params).slug);

  // Distinguish "there is no such notice" from "we could not load it". Only the
  // first is a 404. A backend outage must never render as "this recall does not
  // exist" — on a safety notice that tells a consumer their product is fine when
  // the system merely could not answer. Non-404 failures surface as an error so
  // the page reports a problem instead of denying the recall.
  if (error) {
    if (error.status === 404) notFound();
    throw new Error(`Recall notice could not be loaded (backend responded ${error.status}).`);
  }
  if (!campaign) notFound();

  const product = campaign.affectedProducts?.[0];
  if (!product) notFound();

  return (
    <div className="bg-background text-foreground">
      <main className="container-content py-10 sm:py-12">
        <ContentLanguageNotice contentLocale={campaign.contentLocale} />
        {/* ── Header ── */}
        <header className="mb-10 pb-8 border-b border-border">
          <div className="flex items-center gap-2 text-sm text-secondary mb-4">
            <Link href="/" className="hover:text-foreground">{t("nav.home")}</Link>
            <span>/</span>
            <Link href="/#active-recalls" className="hover:text-foreground">{t("ui.recalls.8b3be4")}</Link>
            <span>/</span>
            <span className="text-foreground">{campaign.cpscNumber}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <StatusBadge variant={campaign.status} />
            {campaign.riskLevel && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${riskStyles[campaign.riskLevel] || 'bg-surface-dim text-foreground'}`}
              >
                {t(riskLabels[campaign.riskLevel] || campaign.riskLevel)}
              </span>
            )}
            <span className="label-data">{t("ui.reference.348555")}{" "}{campaign.cpscNumber}</span>
          </div>

          <h1 className="text-[36px] sm:text-[40px] leading-[1.1] font-bold tracking-[-0.02em] text-foreground max-w-4xl">
            {campaign.title}
          </h1>

          <p className="mt-4 text-secondary text-lg max-w-3xl leading-relaxed">
            {campaign.summary}
          </p>

          {/* Data strip — only API-provided facts; absent values render as em dash */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-border">
            <div>
              <p className="label-eyebrow">{t("ui.recall.date.c1046f")}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {campaign.recallDate
                  ? new Date(campaign.recallDate).toLocaleDateString(locale, {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '—'}
              </p>
            </div>
            <div>
              <p className="label-eyebrow">{t("ui.manufacturer.7adfcd")}</p>
              <p className="mt-1 text-sm font-semibold text-foreground truncate">{campaign.manufacturerName || '—'}</p>
            </div>
            <div>
              <p className="label-eyebrow">{t("ui.affected.units.066be0")}</p>
              <p className="mt-1 text-sm font-mono font-semibold text-foreground">
                {campaign.estimatedUnits > 0 ? campaign.estimatedUnits.toLocaleString() : '—'}
              </p>
            </div>
            <div>
              <p className="label-eyebrow">{t("ui.last.updated.66f3e1")}</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{campaign.lastUpdated || '—'}</p>
            </div>
          </div>
        </header>

        {/* ── Main content + sidebar ── */}
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          {/* Left */}
          <div className="min-w-0 space-y-10">
            {/* 1. Identify Product */}
            <section>
              <SectionHeading
                step="01"
                icon={Info}
                description={t("ui.check.whether.your.product.matches.this.recall.4a1d32")}
              >
                {t("ui.identify.the.product.24b5c9")}</SectionHeading>

              <div className="card-surface p-6">
                <div className="grid gap-6 sm:grid-cols-2 pb-6 border-b border-border">
                  <div>
                    <p className="label-eyebrow mb-3">{t("ui.product.details.279cc0")}</p>
                    <div className="space-y-2 text-sm text-foreground">
                      <p><span className="text-secondary">{t("ui.name.71dd2e")}</span> <strong className="font-semibold">{product.name}</strong></p>
                      <p><span className="text-secondary">{t("ui.brand.549489")}</span> <strong className="font-semibold">{product.brandName}</strong></p>
                      <div>
                        <span className="text-secondary">{t("ui.shapes.f2c870")}</span>{t(' ')}
                        <span className="inline-flex flex-wrap gap-1.5">
                          {product.shapes?.map((shape) => (
                            <span key={shape} className="rounded-md bg-info/10 px-2 py-0.5 text-xs font-medium text-info">
                              {shape}
                            </span>
                          ))}
                        </span>
                      </div>
                      <div>
                        <span className="text-secondary">{t("ui.flavors.77f930")}</span>{t(' ')}
                        <span className="inline-flex flex-wrap gap-1.5">
                          {product.flavors?.map((flavor) => (
                            <span key={flavor} className="rounded-md bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
                              {flavor}
                            </span>
                          ))}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="label-eyebrow mb-3">{t("ui.hazard.description.f0689f")}</p>
                    <p className="text-sm leading-relaxed text-foreground">
                      {campaign.hazardDescription}
                    </p>
                    <div className="mt-3 flex items-start gap-2 p-3 bg-brand-light rounded-md border border-brand/20">
                      <AlertTriangle className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                      <p className="text-xs text-brand font-medium leading-relaxed">
                        {campaign.instructions || t("ui.follow.the.safety.instructions.in.the.applicable.31bd5b")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-5">
                  <p className="label-eyebrow mb-3">{t("ui.affected.lot.codes.e0f4f4")}</p>
                  <div className="flex flex-wrap gap-2">
                    {campaign.affectedLots?.map((lot) => (
                      <code
                        key={lot}
                        className="rounded-md bg-surface-dim px-3 py-1.5 text-xs font-mono font-semibold text-foreground"
                      >
                        {lot}
                      </code>
                    ))}
                  </div>
                  {campaign.dateCodes && campaign.dateCodes.length > 0 && (
                    <p className="mt-3 text-xs text-secondary">
                      {t("ui.date.codes.e60c9e")}{" "}{t(' ')}
                      <span className="font-mono font-semibold text-foreground">
                        {campaign.dateCodes.join(', ')}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </section>

            {Boolean(campaign.faq?.length) && (
              <section lang={campaign.contentLocale} className="card-surface p-6 space-y-4">
                {campaign.faq!.map((item, index) => (
                  <details key={index} className="border-b border-border pb-4">
                    <summary className="cursor-pointer font-semibold">{item.question}</summary>
                    <p className="mt-3 whitespace-pre-line text-sm text-secondary">{item.answer}</p>
                  </details>
                ))}
              </section>
            )}

            {/* 2. Submit Claim */}
            <section>
              <SectionHeading
                step="02"
                icon={FileText}
                description={campaign.remedySummary || t("ui.follow.the.remedy.instructions.provided.for.this.45c968")}
              >
                {t("claim.submit")}</SectionHeading>

              <div className="card-surface p-6">
                <ClaimSubmitWrapper campaign={campaign} />
              </div>
            </section>
          </div>

          {/* Right sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <SideCard title={t("ui.need.help.8a3838")} icon={HelpCircle}>
              <RecallSupport support={campaign.support} />

              <div className="mt-5">
                <p className="label-eyebrow mb-3">{t("ui.what.to.expect.84fa9a")}</p>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-white">1</span>
                    <span className="text-foreground leading-relaxed pt-0.5">{t("ui.submit.your.claim.with.your.contact.and.fa37fb")}</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-white">2</span>
                    <span className="text-foreground leading-relaxed pt-0.5">{t("ui.the.review.team.checks.your.submission.and.5dd08b")}</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-white">3</span>
                    <span className="text-foreground leading-relaxed pt-0.5">{t("ui.track.progress.any.time.with.your.case.cdfd34")}</span>
                  </li>
                </ol>
              </div>
            </SideCard>

            <SideCard title={t("ui.where.to.find.codes.961b80")} icon={Search}>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-dim text-secondary">
                    <Package className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-foreground leading-relaxed pt-0.5">{t("ui.look.for.product.identifiers.sku.upc.model.1c664b")}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-dim text-secondary">
                    <FileText className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-foreground leading-relaxed pt-0.5">{t("ui.lot.and.date.codes.are.typically.printed.90d8c1")}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-dim text-secondary">
                    <Eye className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-foreground leading-relaxed pt-0.5">{t("ui.select.visible.attributes.like.shape.or.flavor.c9b07b")}</span>
                </li>
              </ul>
            </SideCard>

            <SideCard title={t("ui.quick.links.917bcf")} icon={FileText}>
              <div className="space-y-1">
                <Link href="/lookup" className="flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-surface-dim transition-colors group">
                  {t("ui.track.an.existing.claim.2e9ba8")}<ArrowRight className="h-3.5 w-3.5 text-secondary group-hover:text-brand transition-colors" />
                </Link>
                <Link href="/faq" className="flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-surface-dim transition-colors group">
                  {t("ui.frequently.asked.questions.af90ce")}<ArrowRight className="h-3.5 w-3.5 text-secondary group-hover:text-brand transition-colors" />
                </Link>
                <Link href="/#active-recalls" className="flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-surface-dim transition-colors group">
                  {t("ui.all.active.recalls.ed53ae")}<ArrowRight className="h-3.5 w-3.5 text-secondary group-hover:text-brand transition-colors" />
                </Link>
              </div>
            </SideCard>
          </aside>
        </div>
      </main>
    </div>
  );
}

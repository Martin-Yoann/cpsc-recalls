
import { getI18n } from "@/lib/i18n/server";
import Link from "next/link";
import { Search, FileText, CheckCircle2, ShieldCheck, ArrowRight, Package } from "lucide-react";
import { fetchCampaign } from "@/lib/api-adapter";
import { DEMO_MODE } from "@/lib/demo-mode";
import { FAQGrid, FAQCTA } from "@/components/consumer/faq-grid";
import { getCampaignBySlug } from "@/data/mock-recalls";
import { RecallCheckCard } from "@/components/consumer/recall-check-card";
import { RecallSupport } from "@/components/consumer/recall-support";
import { ContentLanguageNotice } from '@/components/consumer/content-language-notice';

/**
 * The landing page reads its highlighted campaign during the build. With no
 * revalidate window that fetch is frozen into the static HTML, so an edited or
 * newly published campaign would stay invisible until the next deploy.
 * Revalidating keeps the shell static — still no per-request render — while
 * letting the highlight catch up. Keep in sync with
 * CAMPAIGN_REVALIDATE_SECONDS in src/lib/api-client.ts.
 */
export const revalidate = 60;

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "ui.search.the.recall.b94643",
    description: "ui.enter.a.product.name.upc.lot.code.75318e",
    icon: Search,
  },
  {
    step: "02",
    title: "ui.submit.your.claim.466ab2",
    description: "ui.provide.your.contact.details.product.information.and.3e7d0b",
    icon: FileText,
  },
  {
    step: "03",
    title: "ui.track.resolution.181b75",
    description: "ui.follow.your.claim.s.progress.and.final.35a124",
    icon: CheckCircle2,
  },
];

const TRUST_ITEMS = [
  "ui.official.notice.structure.with.traceable.metadata.705efb",
  "ui.high.contrast.presentation.for.urgent.safety.actions.6dac52",
  "ui.clear.separation.between.warning.status.and.reference.daf967",
  "ui.privacy.information.available.before.submitting.a.claim.657957",
];

export default async function LandingPage() {
  const { t, locale } = await getI18n();
  // Fetch the active campaign for the highlight section. Mock fallback is a
  // demo-mode-only affordance — production never renders fabricated campaigns.
  const { campaign: fetched } = await fetchCampaign("music-lollipop-demo-2026");
  const campaign = fetched ?? (DEMO_MODE ? getCampaignBySlug("music-lollipop-demo-2026") : undefined);

  return (
    <>
      {/* ─── Hero — side-by-side ─── */}
      <section className="bg-white border-b border-border">
        <div className="container-content py-12 sm:py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-12 items-start">
            {/* Left: text + CTA */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 border border-border bg-white px-3 py-1.5 rounded-full">
                <ShieldCheck className="h-3.5 w-3.5 text-foreground" />
                <span className="label-eyebrow !text-foreground">{t("ui.consumer.recall.portal.d8e5e6")}</span>
              </div>

              <h1 className="text-[40px] sm:text-[48px] leading-[1.1] font-bold tracking-[-0.025em] text-foreground">
                {t("ui.product.safety.recall.submission.3caa00")}</h1>

              <p className="text-[17px] leading-7 text-secondary max-w-xl">
                {t("ui.check.whether.your.product.is.recalled.read.3d4494")}</p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/lookup" className="btn-dark">
                  <Search className="h-4 w-4" />
                  {t("ui.check.claim.status.cf5234")}</Link>
                <Link href="#active-recalls" className="btn-outline">
                  {t("ui.view.active.recalls.4b99d2")}<ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Service commitments (no invented figures — facts must come
                  from the API per design §11/§16) */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-border">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 mt-1 shrink-0 text-foreground" />
                  <p className="text-xs leading-5 text-secondary">{t("ui.no.payment.details.collected.ever.3ec8c0")}</p>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-1 shrink-0 text-foreground" />
                  <p className="text-xs leading-5 text-secondary">{t("ui.documents.stored.privately.and.reviewed.server.side.93457d")}</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-1 shrink-0 text-foreground" />
                  <p className="text-xs leading-5 text-secondary">{t("ui.track.progress.any.time.via.case.status.828b17")}</p>
                </div>
              </div>
            </div>

            {/* Right: product check moved from the recall detail page */}
            <div className="lg:pt-2">
              {campaign ? (
                  <div className="card-elevated p-6 sm:p-8 space-y-5">
                    <div>
                      <p className="label-eyebrow text-brand">{campaign.title}</p>
                      <h2 className="mt-2 text-xl font-bold leading-snug text-foreground">{t("ui.check.your.product.4ca974")}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-secondary">
                        {t("ui.enter.the.product.details.from.your.package.b415f1")}</p>
                    </div>
                    <RecallCheckCard campaign={campaign} product={campaign.affectedProducts[0]} />
                    <Link href="/how-it-works" className="link-underline text-sm font-medium">
                      {t("ui.how.it.works.9c6bf1")}</Link>
                  </div>
                ) : (
                  <div className="card-elevated p-8 text-center text-secondary">{t("ui.no.active.recall.campaign.8bd069")}</div>
                )}
              </div>

          </div>
        </div>
      </section>

      {/* ─── How it works — 3 steps ─── */}
      <section className="section-band border-b border-border">
        <div className="container-content py-14 sm:py-16">
          <div className="max-w-2xl mb-10">
            <p className="label-eyebrow text-brand">{t("ui.how.it.works.1dd6a1")}</p>
            <h2 className="mt-3 text-[28px] sm:text-[32px] leading-tight font-bold text-foreground">
              {t("ui.three.steps.from.notice.to.resolution.0e8dba")}</h2>
            <p className="mt-3 text-secondary">
              {t("ui.our.process.is.designed.for.clarity.and.9c0923")}</p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, title, description, icon: Icon }) => (
              <div key={step} className="card-surface p-6">
                <div className="flex items-center justify-between mb-5">
                  <span className="label-data text-brand">{step}</span>
                  <Icon className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{t(title)}</h3>
                <p className="text-sm text-secondary leading-relaxed">{t(description)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Active recall — single highlighted card ─── */}
        <section id="active-recalls" className="bg-white border-b border-border scroll-mt-44 sm:scroll-mt-32">
          <div className="container-content py-14 sm:py-16">
            <ContentLanguageNotice contentLocale={campaign?.contentLocale} />
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <p className="label-eyebrow text-brand">{t("nav.productRecalls")}</p>
                <h2 className="mt-3 text-[28px] sm:text-[32px] leading-tight font-bold text-foreground">
                  {t("ui.current.consumer.notices.9a08fc")}</h2>
              </div>
            </div>

            {campaign ? <Link
              href={`/recalls/${campaign.slug}`}
              className="card-surface group block p-6 sm:p-8 hover:border-foreground/40"
            >
              <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
                {/* Image */}
                <div className="aspect-square bg-surface-dim rounded-md flex items-center justify-center overflow-hidden">
                  {campaign.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={campaign.images[0]}
                      alt={campaign.title}
                      className="max-h-3/4 max-w-3/4 object-contain"
                    />
                  ) : (
                    <Package className="h-16 w-16 text-secondary/40" />
                  )}
                </div>

                {/* Content */}
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className="label-data">{t("ui.reference.348555")}{" "}{campaign.cpscNumber}</span>
                  </div>

                  <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-brand transition-colors">
                    {campaign.title}
                  </h3>
                  <p className="text-secondary leading-relaxed mb-5">{campaign.summary}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-border">
                    <div>
                      <p className="label-eyebrow">{t("ui.recall.date.c1046f")}</p>
                      <p className="text-sm font-medium text-foreground mt-1">
                        {campaign.recallDate
                          ? new Date(campaign.recallDate).toLocaleDateString(locale, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="label-eyebrow">{t("ui.units.127482")}</p>
                      <p className="text-sm font-mono font-medium text-foreground mt-1">
                        {campaign.estimatedUnits > 0 ? campaign.estimatedUnits.toLocaleString() : '—'}
                      </p>
                    </div>
                    <div>
                      <p className="label-eyebrow">{t("ui.manufacturer.7adfcd")}</p>
                      <p className="text-sm font-medium text-foreground mt-1 truncate">
                        {campaign.manufacturerName}
                      </p>
                    </div>
                    <div>
                      <p className="label-eyebrow">{t("ui.status.bae7d5")}</p>
                      <p className="text-sm font-medium text-foreground mt-1 capitalize">{t(campaign.status)}</p>
                    </div>
                  </div>

                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand group-hover:gap-3 transition-all">
                    {t("ui.review.official.notice.ca5908")}<ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link> : <p className="card-surface p-6 text-secondary">{t("ui.recall.information.could.not.be.loaded.please.850f0a")}</p>}
            {campaign && (
              <div className="card-surface mt-4 p-6">
                <h3 className="mb-3 text-base font-semibold">{t("ui.recall.assistance.83aa6d")}</h3>
                <RecallSupport support={campaign.support} />
              </div>
            )}
          </div>
        </section>

      {/* ─── FAQ — 3 columns ─── */}
      <section className="section-band border-b border-border">
        <div className="container-content py-14 sm:py-16">
          <div className="max-w-2xl mb-10">
            <p className="label-eyebrow text-brand">{t("ui.frequently.asked.questions.d790b4")}</p>
            <h2 className="mt-3 text-[28px] sm:text-[32px] leading-tight font-bold text-foreground">
              {t("ui.common.questions.clear.answers.92be70")}</h2>
            <p className="mt-3 text-secondary">
              {t("ui.everything.you.need.to.know.about.filing.a553ab")}</p>
          </div>
          <FAQGrid />
          <FAQCTA />
        </div>
      </section>

      {/* ─── Trust band — 4 items ─── */}
      <section className="bg-white">
        <div className="container-content py-14 sm:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
            <div>
              <p className="label-eyebrow text-brand">{t("ui.why.koi.recall.f4d5b2")}</p>
              <h2 className="mt-3 text-[28px] leading-tight font-bold text-foreground">
                {t("ui.designed.for.official.recall.communication.c304fd")}</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {TRUST_ITEMS.map((item) => (
                <div key={item} className="flex items-start gap-3 p-4 card-surface">
                  <ShieldCheck className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground leading-relaxed">{t(item)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

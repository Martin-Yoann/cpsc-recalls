
import { getI18n } from "@/lib/i18n/server";
import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileText, SearchCheck, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Learn how to review a recall, check your product, and submit and track a remedy claim with KOI.',
};

const STEPS = [
  { number: '01', title: "ui.find.the.notice.d12ccf", description: "ui.review.the.product.name.recall.number.hazard.18200e", icon: FileText },
  { number: '02', title: "ui.check.your.product.1f9f0c", description: "ui.use.the.product.details.on.your.packaging.667e08", icon: SearchCheck },
  { number: '03', title: "ui.submit.and.track.a98668", description: "ui.choose.an.available.remedy.send.your.claim.127f98", icon: CheckCircle2 },
] as const;

export default async function HowItWorksPage() {
  const { t } = await getI18n();
  return (
    <>
      <section className="border-b border-border bg-surface-elevated">
        <div className="container-content grid gap-8 py-14 sm:py-18 lg:grid-cols-[.8fr_1.2fr] lg:items-end lg:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-teal">{t("ui.how.koi.helps.d70ed8")}</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">{t("ui.a.clear.path.from.notice.to.remedy.bdc80a")}</h1>
          </div>
          <p className="max-w-2xl text-base leading-relaxed text-text-secondary">{t("ui.koi.organizes.the.information.you.need.to.6fcad2")}</p>
        </div>
      </section>

      <section className="bg-surface-primary py-14 sm:py-18 lg:py-20">
        <div className="container-content">
          <div className="mb-8 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-brand-teal" />
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-alert-orange">{t("ui.the.process.1531f2")}</p>
          </div>
          <ol className="grid divide-y divide-border border border-border bg-surface-elevated md:grid-cols-3 md:divide-x md:divide-y-0">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return <li key={step.number} className="p-6 sm:p-7"><div className="flex items-center justify-between"><span className="font-mono text-xs font-bold tracking-widest text-alert-orange">{t("ui.step.0c9b85")}{" "}{step.number}</span><Icon className="h-5 w-5 text-brand-teal" /></div><h2 className="mt-8 text-lg font-bold text-text-primary">{t(step.title)}</h2><p className="mt-2 text-sm leading-relaxed text-text-secondary">{t(step.description)}</p></li>;
            })}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/#active-recalls" className="inline-flex items-center gap-3 bg-brand-teal px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blade-resolution-dark">{t("ui.browse.active.recalls.375cc1")}<ArrowRight className="h-4 w-4" /></Link>
            <Link href="/lookup" className="inline-flex items-center gap-3 border border-border bg-surface-elevated px-5 py-3 text-sm font-bold text-brand-teal transition-colors hover:bg-surface-secondary">{t("ui.check.a.claim.status.b2250d")}<ArrowRight className="h-4 w-4" /></Link>
            <Link href="/faq" className="inline-flex items-center gap-3 border border-border bg-surface-elevated px-5 py-3 text-sm font-bold text-brand-teal transition-colors hover:bg-surface-secondary">{t("ui.read.faqs.60b2be")}<ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
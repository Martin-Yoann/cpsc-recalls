
import { getI18n } from "@/lib/i18n/server";
import Link from 'next/link';
import type { Metadata } from 'next';
import { ExternalLink, FileText, ShieldCheck } from 'lucide-react';
import { fetchCampaign } from '@/lib/api-adapter';

export const metadata: Metadata = {
  title: 'Privacy Notice',
  description: 'Campaign-specific privacy notice information.',
};

interface PrivacyPageProps {
  searchParams: Promise<{ campaign?: string }>;
}

const SECTIONS: Array<{ title: string; paragraphs: string[] }> = [
  {
    title: "ui.who.we.are.cdab44",
    paragraphs: [
      "ui.koi.importer.inc.we.us.operates.this.107593",
    ],
  },
  {
    title: "ui.information.we.collect.ca195d",
    paragraphs: [
      "ui.to.process.a.recall.claim.we.collect.b97a7d",
      "ui.if.you.tell.us.about.an.incident.445dae",
    ],
  },
  {
    title: "ui.why.we.collect.it.5e898f",
    paragraphs: [
      "ui.solely.to.verify.eligibility.administer.the.remedy.4356f1",
    ],
  },
  {
    title: "ui.who.can.access.it.bd2361",
    paragraphs: [
      "ui.the.recall.review.team.handling.your.claim.7de122",
    ],
  },
  {
    title: "ui.where.it.is.stored.9be835",
    paragraphs: [
      "ui.claim.records.and.uploaded.documents.are.stored.3b4fab",
    ],
  },
  {
    title: "ui.how.long.we.keep.it.5a0160",
    paragraphs: [
      "ui.claim.records.are.retained.for.the.retention.7692fd",
    ],
  },
  {
    title: "ui.access.correction.and.deletion.requests.819b89",
    paragraphs: [
      "ui.email.the.support.address.listed.above.to.633ecd",
    ],
  },
];

export default async function PrivacyPage({ searchParams }: PrivacyPageProps) {
  const { t } = await getI18n();
  const campaignSlug = (await searchParams).campaign;
  const { campaign } = campaignSlug ? await fetchCampaign(campaignSlug) : { campaign: null };
  const notice = campaign?.privacyNotice;

  return (
    <section className="bg-[#f5f7fa] py-12 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="border border-[#dcdfe6] bg-white p-6 shadow-sm sm:p-10">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-[#ecf5ff] text-[#409eff]">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#909399]">{t("ui.privacy.notice.ec7c82")}</p>
              <h1 className="mt-1 text-3xl font-bold text-[#303133]">{t("ui.how.your.claim.data.is.handled.5ebe5c")}</h1>
            </div>
          </div>

          {campaign && notice ? (
            <div className="mt-8 space-y-5 text-sm leading-relaxed text-[#606266]">
              <div className="border-l-4 border-[#409eff] bg-[#ecf5ff] px-4 py-3">
                <p className="font-medium text-[#303133]">{campaign.title}</p>
                <p className="mt-1">{t("ui.privacy.notice.version.65a7b8")}<span className="font-mono text-[#303133]">{notice.version}</span></p>
              </div>
              <a href={notice.url} className="inline-flex items-center gap-2 font-medium text-[#409eff] underline" {...(notice.url.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>
                <FileText className="h-4 w-4" /> {t("ui.review.privacy.notice.cc26e9")}<ExternalLink className="h-3.5 w-3.5" />
              </a>
              {(campaign.manufacturerContact) && (
                <p>{t("ui.contact.channel.for.this.campaign.b1336b")}{" "}{campaign.manufacturerContact}</p>
              )}
            </div>
          ) : (
            <div className="mt-8 border border-[#dcdfe6] bg-[#f5f7fa] p-5 text-sm leading-relaxed text-[#606266]">
              <p className="font-medium text-[#303133]">{t("ui.select.a.campaign.to.view.its.specific.edb36b")}</p>
              <p className="mt-2">{t("ui.privacy.terms.and.versions.are.campaign.specific.699a7a")}</p>
            </div>
          )}

          <div className="mt-8 space-y-7 text-sm leading-relaxed text-[#606266]">
            <div className="rounded border border-[#c2e7b0] bg-[#f0f9eb] px-4 py-3 font-medium text-[#529b2e]">
              {t("ui.we.never.collect.credit.card.numbers.bank.bf623a")}</div>

            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="text-base font-bold text-[#303133]">{t(section.title)}</h2>
                {section.paragraphs.map((paragraph, index) => (
                  <p key={index} className="mt-2">{t(paragraph)}</p>
                ))}
              </section>
            ))}

            <section>
              <h2 className="text-base font-bold text-[#303133]">{t("ui.sensitive.categories.1e61cd")}</h2>
              <p className="mt-2">
                {t("ui.your.delivery.address.incident.descriptions.and.uploaded.f298c4")}</p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#303133]">{t("ui.effective.date.153c9b")}</h2>
              <p className="mt-2">
                {t("ui.this.structure.ships.ahead.of.final.legal.c603a5")}</p>
            </section>
          </div>

          <Link href="/" className="mt-8 inline-flex items-center text-sm font-medium text-[#409eff] underline">{t("ui.return.to.active.recalls.35cb87")}</Link>
        </div>
      </div>
    </section>
  );
}

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

export default async function PrivacyPage({ searchParams }: PrivacyPageProps) {
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
              <p className="text-xs font-semibold uppercase tracking-wider text-[#909399]">Privacy notice</p>
              <h1 className="mt-1 text-3xl font-bold text-[#303133]">Campaign privacy information</h1>
            </div>
          </div>

          {campaign && notice ? (
            <div className="mt-8 space-y-5 text-sm leading-relaxed text-[#606266]">
              <div className="border-l-4 border-[#409eff] bg-[#ecf5ff] px-4 py-3">
                <p className="font-medium text-[#303133]">{campaign.title}</p>
                <p className="mt-1">Privacy notice version: <span className="font-mono text-[#303133]">{notice.version}</span></p>
              </div>
              <p>The notice for this campaign is maintained by the campaign provider. Review it before providing personal information or submitting a claim.</p>
              <a href={notice.url} className="inline-flex items-center gap-2 font-medium text-[#409eff] underline" {...(notice.url.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>
                <FileText className="h-4 w-4" /> Review privacy notice <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </div>
          ) : (
            <div className="mt-8 border border-[#dcdfe6] bg-[#f5f7fa] p-5 text-sm leading-relaxed text-[#606266]">
              <p className="font-medium text-[#303133]">Select a campaign to view its privacy notice.</p>
              <p className="mt-2">Privacy terms and versions are campaign-specific and are shown from the campaign configuration during claim submission.</p>
            </div>
          )}

          <Link href="/" className="mt-8 inline-flex items-center text-sm font-medium text-[#409eff] underline">Return to active recalls</Link>
        </div>
      </div>
    </section>
  );
}
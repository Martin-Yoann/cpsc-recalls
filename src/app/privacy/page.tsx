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
    title: 'Information we collect',
    paragraphs: [
      'To process a recall claim we collect your first and last name, email address, optional phone number, and delivery address. We also collect the product details you enter — lot code, date code, flavor, shape, purchase channel — and any receipt or product photographs you upload as claim evidence.',
      'If you tell us about an incident involving the product, that description is stored with your case as well.',
    ],
  },
  {
    title: 'Why we collect it',
    paragraphs: [
      'Solely to verify eligibility, administer the remedy you choose, contact you about your case, and meet safety record-keeping obligations for the recall. We do not sell personal information or use it for advertising.',
    ],
  },
  {
    title: 'Who can access it',
    paragraphs: [
      'The recall review team handling your claim, a restricted set of platform staff, and the service providers used to store documents and deliver email — each bound to process data only for this recall program.',
    ],
  },
  {
    title: 'Where it is stored',
    paragraphs: [
      'Claim records and uploaded documents are stored in the United States. Uploaded files are private: they are reachable only through short-lived authorized access, never public URLs.',
    ],
  },
  {
    title: 'How long we keep it',
    paragraphs: [
      'Claim records are retained for the retention period of the associated recall campaign so the safety record stays auditable. After that period they are deleted or de-identified.',
    ],
  },
  {
    title: 'Access, correction, and deletion requests',
    paragraphs: [
      'Email the support address listed above to request a copy of your claim data, ask for corrections, or request deletion. Requests are handled manually by staff; there is no self-service portal yet.',
    ],
  },
];

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
              <h1 className="mt-1 text-3xl font-bold text-[#303133]">How your claim data is handled</h1>
            </div>
          </div>

          {campaign && notice ? (
            <div className="mt-8 space-y-5 text-sm leading-relaxed text-[#606266]">
              <div className="border-l-4 border-[#409eff] bg-[#ecf5ff] px-4 py-3">
                <p className="font-medium text-[#303133]">{campaign.title}</p>
                <p className="mt-1">Privacy notice version: <span className="font-mono text-[#303133]">{notice.version}</span></p>
              </div>
              <a href={notice.url} className="inline-flex items-center gap-2 font-medium text-[#409eff] underline" {...(notice.url.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})}>
                <FileText className="h-4 w-4" /> Review privacy notice <ExternalLink className="h-3.5 w-3.5" />
              </a>
              {(campaign.manufacturerContact) && (
                <p>Contact channel for this campaign: {campaign.manufacturerContact}</p>
              )}
            </div>
          ) : (
            <div className="mt-8 border border-[#dcdfe6] bg-[#f5f7fa] p-5 text-sm leading-relaxed text-[#606266]">
              <p className="font-medium text-[#303133]">Select a campaign to view its specific privacy terms.</p>
              <p className="mt-2">Privacy terms and versions are campaign-specific; the exact version you accept is recorded with your claim.</p>
            </div>
          )}

          <div className="mt-8 space-y-7 text-sm leading-relaxed text-[#606266]">
            <div className="rounded border border-[#c2e7b0] bg-[#f0f9eb] px-4 py-3 font-medium text-[#529b2e]">
              We never collect credit-card numbers, bank account details, or any payment credentials — for refunds or otherwise.
            </div>

            {SECTIONS.map((section) => (
              <section key={section.title}>
                <h2 className="text-base font-bold text-[#303133]">{section.title}</h2>
                {section.paragraphs.map((paragraph, index) => (
                  <p key={index} className="mt-2">{paragraph}</p>
                ))}
              </section>
            ))}

            <section>
              <h2 className="text-base font-bold text-[#303133]">Sensitive categories</h2>
              <p className="mt-2">
                Your delivery address, incident descriptions, and uploaded photographs are treated
                as sensitive claim material: they are visible only to the people reviewing your case
                and are excluded from analytics, logs, and status lookups.
              </p>
            </section>

            <section>
              <h2 className="text-base font-bold text-[#303133]">Effective date</h2>
              <p className="mt-2">
                This structure ships ahead of final legal review; the binding version for any claim
                is the campaign notice version shown during submission and recorded with the claim.
              </p>
            </section>
          </div>

          <Link href="/" className="mt-8 inline-flex items-center text-sm font-medium text-[#409eff] underline">Return to active recalls</Link>
        </div>
      </div>
    </section>
  );
}

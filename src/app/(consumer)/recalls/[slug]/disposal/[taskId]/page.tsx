import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";

import { DisposalTaskLoader } from "@/components/consumer/disposal-task-loader";
import { fetchCampaign } from "@/lib/api-adapter";

interface DisposalPageProps {
  params: Promise<{ slug: string; taskId: string }>;
}

/**
 * Page 4: the disposal step for one task, reached from the link we send after a
 * claim is submitted.
 *
 * Server-side this page holds nothing per-visitor: the campaign notice is a
 * shared public read, and the task itself is fetched in the browser with the
 * visitor's own credential.
 *
 * `robots: noindex` because the URL identifies a specific consumer's task. The
 * credential is not in the URL, so an indexer could not read the task, but there
 * is no reason for the address to be collected at all.
 */
export const metadata: Metadata = {
  title: "Product disposal",
  robots: { index: false, follow: false },
};

export default async function DisposalPage({ params }: DisposalPageProps) {
  const { slug, taskId } = await params;
  const { campaign, error } = await fetchCampaign(slug);
  if (error || !campaign) notFound();

  return (
    <main className="container-content py-10">
      <div className="mb-6">
        <Link
          href={`/recalls/${encodeURIComponent(slug)}`}
          className="inline-flex items-center gap-1.5 text-sm text-[#606266] underline hover:text-[#303133]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to the recall notice
        </Link>
      </div>

      <h1 className="mb-2 text-2xl font-semibold text-[#303133]">
        {campaign.title}
      </h1>
      <p className="mb-8 text-sm text-[#606266]">
        This page shows the disposal step for your claim, when one applies to
        your product.
      </p>

      <DisposalTaskLoader
        taskId={taskId}
        supportContact={campaign.manufacturerContact}
      />
    </main>
  );
}

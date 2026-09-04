import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  AlertTriangle,
  Eye,
  FileText,
  HelpCircle,
  Info,
  Package,
  Phone,
  Search,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import { fetchCampaign } from '@/lib/api-adapter';
import { ClaimSubmitWrapper } from '@/components/consumer/claim-submit-wrapper';
import { StatusBadge } from '@/components/shared/status-badge';
import { RiskLevel } from '@/types';

interface RecallPageProps {
  params: Promise<{ slug: string }>;
}

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
  const { campaign } = await fetchCampaign((await params).slug);
  return {
    title: campaign?.title ?? 'Recall Details',
    description: campaign?.hazardDescription ?? 'Product safety recall information',
  };
}

function SectionHeading({
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
  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-2">
        <span className="label-data text-brand">{step}</span>
        <Icon className="h-4 w-4 text-foreground" />
        <h2 className="text-xl font-bold text-foreground">{children}</h2>
      </div>
      {description && (
        <p className="text-sm text-secondary leading-relaxed max-w-2xl">{description}</p>
      )}
    </div>
  );
}

function SideCard({ title, icon: Icon, children }: { title: string; icon?: typeof Info; children: React.ReactNode }) {
  return (
    <div className="card-surface p-5">
      <h3 className="mb-4 flex items-center gap-2 pb-3 border-b border-border text-base font-semibold text-foreground">
        {Icon && <Icon className="h-4 w-4 text-brand" />}
        {title}
      </h3>
      {children}
    </div>
  );
}

export default async function RecallPage({ params }: RecallPageProps) {
  const { campaign } = await fetchCampaign((await params).slug);
  if (!campaign) notFound();
  const product = campaign.affectedProducts?.[0];
  if (!product) notFound();

  // Adapter packs contact as "phone (hours)" — split instead of inventing
  // defaults for either part.
  const rawContact = campaign.manufacturerContact || '';
  const openParen = rawContact.indexOf(' (');
  const supportPhone = (openParen === -1 ? rawContact : rawContact.slice(0, openParen)).trim();
  const supportHours =
    openParen === -1 ? '' : rawContact.slice(openParen + 2).replace(/\)\s*$/, '').trim();

  return (
    <div className="bg-background text-foreground">
      <main className="container-content py-10 sm:py-12">
        {/* ── Header ── */}
        <header className="mb-10 pb-8 border-b border-border">
          <div className="flex items-center gap-2 text-sm text-secondary mb-4">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <Link href="/#active-recalls" className="hover:text-foreground">Recalls</Link>
            <span>/</span>
            <span className="text-foreground">{campaign.cpscNumber}</span>
          </div>

          <div className="flex flex-wrap items-center gap-2 mb-4">
            <StatusBadge variant={campaign.status} />
            {campaign.riskLevel && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${riskStyles[campaign.riskLevel] || 'bg-surface-dim text-foreground'}`}
              >
                {riskLabels[campaign.riskLevel] || campaign.riskLevel}
              </span>
            )}
            <span className="label-data">Reference #{campaign.cpscNumber}</span>
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
              <p className="label-eyebrow">Recall Date</p>
              <p className="mt-1 text-sm font-semibold text-foreground">
                {campaign.recallDate
                  ? new Date(campaign.recallDate).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '—'}
              </p>
            </div>
            <div>
              <p className="label-eyebrow">Manufacturer</p>
              <p className="mt-1 text-sm font-semibold text-foreground truncate">{campaign.manufacturerName || '—'}</p>
            </div>
            <div>
              <p className="label-eyebrow">Affected Units</p>
              <p className="mt-1 text-sm font-mono font-semibold text-foreground">
                {campaign.estimatedUnits > 0 ? campaign.estimatedUnits.toLocaleString() : '—'}
              </p>
            </div>
            <div>
              <p className="label-eyebrow">Last Updated</p>
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
                description="Check whether your product matches this recall. Locate the lot code, date code, shape, and flavor on your package."
              >
                Identify the Product
              </SectionHeading>

              <div className="card-surface p-6">
                <div className="grid gap-6 sm:grid-cols-2 pb-6 border-b border-border">
                  <div>
                    <p className="label-eyebrow mb-3">Product Details</p>
                    <div className="space-y-2 text-sm text-foreground">
                      <p><span className="text-secondary">Name:</span> <strong className="font-semibold">{product.name}</strong></p>
                      <p><span className="text-secondary">Brand:</span> <strong className="font-semibold">{product.brandName}</strong></p>
                      <div>
                        <span className="text-secondary">Shapes:</span>{' '}
                        <span className="inline-flex flex-wrap gap-1.5">
                          {product.shapes?.map((shape) => (
                            <span key={shape} className="rounded-md bg-info/10 px-2 py-0.5 text-xs font-medium text-info">
                              {shape}
                            </span>
                          ))}
                        </span>
                      </div>
                      <div>
                        <span className="text-secondary">Flavors:</span>{' '}
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
                    <p className="label-eyebrow mb-3">Hazard Description</p>
                    <p className="text-sm leading-relaxed text-foreground">
                      {campaign.hazardDescription}
                    </p>
                    <div className="mt-3 flex items-start gap-2 p-3 bg-brand-light rounded-md border border-brand/20">
                      <AlertTriangle className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                      <p className="text-xs text-brand font-medium leading-relaxed">
                        Stop using a potentially affected product until its lot code has been checked.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-5">
                  <p className="label-eyebrow mb-3">Affected Lot Codes</p>
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
                      Date codes:{' '}
                      <span className="font-mono font-semibold text-foreground">
                        {campaign.dateCodes.join(', ')}
                      </span>
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* 2. Submit Claim */}
            <section>
              <SectionHeading
                step="02"
                icon={FileText}
                description={campaign.remedySummary || 'Select the resolution option that works best for you.'}
              >
                Submit a Claim
              </SectionHeading>

              <div className="card-surface p-6">
                <ClaimSubmitWrapper campaign={campaign} />
              </div>
            </section>
          </div>

          {/* Right sidebar */}
          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <SideCard title="Need Help?" icon={HelpCircle}>
              {supportPhone ? (
                <div className="flex items-start gap-3 p-3 bg-surface-dim rounded-md text-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-white">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Consumer Support</p>
                    <p className="text-xs text-secondary mt-0.5">{supportPhone}</p>
                    {supportHours && (
                      <p className="mt-1 text-[10px] text-secondary">{supportHours}</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-secondary">Contact details are provided in the campaign notice.</p>
              )}

              <div className="mt-5">
                <p className="label-eyebrow mb-3">What to Expect</p>
                <ol className="space-y-3 text-sm">
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-white">1</span>
                    <span className="text-foreground leading-relaxed pt-0.5">Submit your claim with your contact and product details.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-white">2</span>
                    <span className="text-foreground leading-relaxed pt-0.5">The review team checks your submission and keeps your case status updated.</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-bold text-white">3</span>
                    <span className="text-foreground leading-relaxed pt-0.5">Track progress any time with your case reference via status lookup.</span>
                  </li>
                </ol>
              </div>
            </SideCard>

            <SideCard title="Where to Find Codes" icon={Search}>
              <ul className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-dim text-secondary">
                    <Package className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-foreground leading-relaxed pt-0.5">Look for product identifiers (SKU, UPC, model) on the package or label.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-dim text-secondary">
                    <FileText className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-foreground leading-relaxed pt-0.5">Lot and date codes are typically printed near the package seal.</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-surface-dim text-secondary">
                    <Eye className="h-3.5 w-3.5" />
                  </span>
                  <span className="text-foreground leading-relaxed pt-0.5">Select visible attributes like shape or flavor from the label.</span>
                </li>
              </ul>
            </SideCard>

            <SideCard title="Quick Links" icon={FileText}>
              <div className="space-y-1">
                <Link href="/lookup" className="flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-surface-dim transition-colors group">
                  Track an existing claim
                  <ArrowRight className="h-3.5 w-3.5 text-secondary group-hover:text-brand transition-colors" />
                </Link>
                <Link href="/faq" className="flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-surface-dim transition-colors group">
                  Frequently asked questions
                  <ArrowRight className="h-3.5 w-3.5 text-secondary group-hover:text-brand transition-colors" />
                </Link>
                <Link href="/#active-recalls" className="flex items-center justify-between gap-2 px-3 py-2 rounded-md text-sm font-medium text-foreground hover:bg-surface-dim transition-colors group">
                  All active recalls
                  <ArrowRight className="h-3.5 w-3.5 text-secondary group-hover:text-brand transition-colors" />
                </Link>
              </div>
            </SideCard>
          </aside>
        </div>
      </main>
    </div>
  );
}

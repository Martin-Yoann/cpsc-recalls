import Link from "next/link";
import { Search, FileText, CheckCircle2, ShieldCheck, AlertTriangle, ArrowRight, Package } from "lucide-react";
import { fetchCampaign } from "@/lib/api-adapter";
import { DEMO_MODE } from "@/lib/demo-mode";
import { FAQGrid, FAQCTA } from "@/components/consumer/faq-grid";
import { getCampaignBySlug } from "@/data/mock-recalls";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Search the recall",
    description: "Enter a product name, UPC, lot code, or notice number to verify whether your item is covered by an active recall.",
    icon: Search,
  },
  {
    step: "02",
    title: "Submit your claim",
    description: "Provide your contact details, product information, and choose a remedy. Review times vary by campaign.",
    icon: FileText,
  },
  {
    step: "03",
    title: "Track resolution",
    description: "Follow your claim's progress and final disposition from a single record with clear, plain-language status updates.",
    icon: CheckCircle2,
  },
];

const TRUST_ITEMS = [
  "Official notice structure with traceable metadata",
  "High-contrast presentation for urgent safety actions",
  "Clear separation between warning, status, and reference data",
  "Encryption in transit and at rest for all claim data",
];

export default async function LandingPage() {
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
                <span className="label-eyebrow !text-foreground">Consumer Recall Portal</span>
              </div>

              <h1 className="text-[40px] sm:text-[48px] leading-[1.1] font-bold tracking-[-0.025em] text-foreground">
                Product Safety &amp; Recall Submission
              </h1>

              <p className="text-[17px] leading-7 text-secondary max-w-xl">
                Verify recalled products, review official remedy instructions, and submit
                claims — all in one place. Built for regulatory recall workflows with authority
                in presentation and urgency where needed.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link href="/lookup" className="btn-dark">
                  <Search className="h-4 w-4" />
                  Check Claim Status
                </Link>
                <Link href="#active-recalls" className="btn-outline">
                  View Active Recalls
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Service commitments (no invented figures — facts must come
                  from the API per design §11/§16) */}
              <div className="grid grid-cols-3 gap-3 pt-6 border-t border-border">
                <div className="flex items-start gap-2">
                  <ShieldCheck className="h-4 w-4 mt-1 shrink-0 text-foreground" />
                  <p className="text-xs leading-5 text-secondary">No payment details collected, ever</p>
                </div>
                <div className="flex items-start gap-2">
                  <FileText className="h-4 w-4 mt-1 shrink-0 text-foreground" />
                  <p className="text-xs leading-5 text-secondary">Documents stored privately and reviewed server-side</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 mt-1 shrink-0 text-foreground" />
                  <p className="text-xs leading-5 text-secondary">Track progress any time via case status lookup</p>
                </div>
              </div>
            </div>

            {/* Right: real claim flow entry */}
            <div className="lg:pt-2">
              {campaign ? (
                <div className="card-elevated p-6 sm:p-8 space-y-5">
                  <div>
                    <p className="label-eyebrow text-brand">{campaign.title}</p>
                    <h2 className="mt-2 text-xl font-bold leading-snug text-foreground">
                      Think you have an affected product?
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-secondary">
                      Check your lot code against the recall scope, choose a remedy,
                      and submit — the whole flow takes a few minutes.
                    </p>
                  </div>
                  <ul className="space-y-2 text-sm text-secondary">
                    {[campaign.summary].filter(Boolean).map((line, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0 text-brand" />
                        <span>{line}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="flex flex-wrap items-center gap-3 pt-1">
                    <Link href={`/recalls/${campaign.slug}`} className="btn-dark">
                      <Package className="h-4 w-4" />
                      Start a claim
                    </Link>
                    <Link href="/how-it-works" className="link-underline text-sm font-medium">
                      How it works →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="card-elevated p-8 text-center text-secondary">
                  No active recall campaign.
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it works — 3 steps ─── */}
      <section className="section-band border-b border-border">
        <div className="container-content py-14 sm:py-16">
          <div className="max-w-2xl mb-10">
            <p className="label-eyebrow text-brand">How it works</p>
            <h2 className="mt-3 text-[28px] sm:text-[32px] leading-tight font-bold text-foreground">
              Three steps from notice to resolution
            </h2>
            <p className="mt-3 text-secondary">
              Our process is designed for clarity and speed — every step is logged and
              traceable from submission to final disposition.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {HOW_IT_WORKS.map(({ step, title, description, icon: Icon }) => (
              <div key={step} className="card-surface p-6">
                <div className="flex items-center justify-between mb-5">
                  <span className="label-data text-brand">{step}</span>
                  <Icon className="h-5 w-5 text-secondary" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-secondary leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Active recall — single highlighted card ─── */}
      {campaign && (
        <section id="active-recalls" className="bg-white border-b border-border">
          <div className="container-content py-14 sm:py-16">
            <div className="flex items-end justify-between gap-4 mb-8">
              <div>
                <p className="label-eyebrow text-brand">Active Recalls</p>
                <h2 className="mt-3 text-[28px] sm:text-[32px] leading-tight font-bold text-foreground">
                  Current consumer notices
                </h2>
              </div>
              <Link
                href="/lookup"
                className="hidden sm:inline-flex link-underline text-sm font-medium"
              >
                Search all notices →
              </Link>
            </div>

            <Link
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
                    <span className="label-data">Reference #{campaign.cpscNumber}</span>
                  </div>

                  <h3 className="text-2xl font-bold text-foreground mb-3 group-hover:text-brand transition-colors">
                    {campaign.title}
                  </h3>
                  <p className="text-secondary leading-relaxed mb-5">{campaign.summary}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-5 border-t border-border">
                    <div>
                      <p className="label-eyebrow">Recall Date</p>
                      <p className="text-sm font-medium text-foreground mt-1">{campaign.recallDate}</p>
                    </div>
                    <div>
                      <p className="label-eyebrow">Units</p>
                      <p className="text-sm font-mono font-medium text-foreground mt-1">
                        {campaign.estimatedUnits.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="label-eyebrow">Manufacturer</p>
                      <p className="text-sm font-medium text-foreground mt-1 truncate">
                        {campaign.manufacturerName}
                      </p>
                    </div>
                    <div>
                      <p className="label-eyebrow">Status</p>
                      <p className="text-sm font-medium text-foreground mt-1 capitalize">{campaign.status}</p>
                    </div>
                  </div>

                  <div className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand group-hover:gap-3 transition-all">
                    Review official notice
                    <ArrowRight className="h-4 w-4" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>
      )}

      {/* ─── FAQ — 3 columns ─── */}
      <section className="section-band border-b border-border">
        <div className="container-content py-14 sm:py-16">
          <div className="max-w-2xl mb-10">
            <p className="label-eyebrow text-brand">Frequently Asked Questions</p>
            <h2 className="mt-3 text-[28px] sm:text-[32px] leading-tight font-bold text-foreground">
              Common questions, clear answers
            </h2>
            <p className="mt-3 text-secondary">
              Everything you need to know about filing a claim, tracking status, and
              receiving your remedy.
            </p>
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
              <p className="label-eyebrow text-brand">Why KOI Recall</p>
              <h2 className="mt-3 text-[28px] leading-tight font-bold text-foreground">
                Designed for official recall communication
              </h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {TRUST_ITEMS.map((item) => (
                <div key={item} className="flex items-start gap-3 p-4 card-surface">
                  <ShieldCheck className="h-5 w-5 text-success shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

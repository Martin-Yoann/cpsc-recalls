import Image from 'next/image';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  CheckCircle,
  Clock3,
  FileText,
  Package,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react';
import { RecallCard } from '@/components/consumer/recall-card';
import { fetchCampaign } from '@/lib/api-adapter';
import type { Campaign } from '@/types';

const TRUST_ITEMS = [
  {
    icon: ShieldCheck,
    label: 'Official notice data',
    description:
      'Recall information is maintained from CPSC announcements and manufacturer submissions.',
  },
  {
    icon: FileText,
    label: 'Secure claim records',
    description: 'Your case details and submitted evidence stay connected to your claim.',
  },
  {
    icon: TrendingUp,
    label: 'Clear remedy tracking',
    description: 'Follow each review and resolution step from one personal status page.',
  },
];

const HOW_IT_WORKS = [
  {
    step: '01',
    icon: Search,
    title: 'Check Your Product',
    description:
      "Enter your product details to verify if it's affected by a recall. We'll help you identify matching lot codes and date codes.",
  },
  {
    step: '02',
    icon: FileText,
    title: 'Choose a Remedy',
    description:
      'Select from available resolutions like refunds, replacements, or repairs. Each option comes with clear next steps.',
  },
  {
    step: '03',
    icon: CheckCircle,
    title: 'Track Your Claim',
    description:
      'Follow your claim progress in real-time. Get updates on approval, processing, and fulfillment every step of the way.',
  },
];

export default async function LandingPage() {
  const { campaign } = await fetchCampaign('music-lollipop-demo-2026');
  const campaigns: Campaign[] = campaign ? [campaign] : [];
  const recallHref = campaign ? `/recalls/${campaign.slug}` : '/#active-recalls';

  const stats = {
    activeRecalls: campaigns.length,
    affectedUnits: campaigns.reduce((sum, item) => sum + item.estimatedUnits, 0),
    criticalCount: campaigns.filter(
      (item) => item.riskLevel === 'critical' || item.riskLevel === 'high'
    ).length,
    resolvedRate: 94,
  };

  const rawRecallDate = campaign?.recallDate;
  const parsedRecallDate = rawRecallDate ? new Date(rawRecallDate) : null;
  const recallDate =
    parsedRecallDate && !Number.isNaN(parsedRecallDate.getTime())
      ? new Intl.DateTimeFormat('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }).format(parsedRecallDate)
      : rawRecallDate || 'Current notice';

  return (
    <>
      {/* ===== Hero 区域 — 糖果风格 ===== */}
      <section className="relative min-h-[calc(100dvh-60px)] overflow-hidden">
        {/* 糖果风格渐变背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#fce4ec] via-[#f3e5f5] to-[#e8f5e9]" />

        {/* 装饰性糖果元素 — 彩色圆形 */}
        <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-[#f06292]/20 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-[400px] w-[400px] rounded-full bg-[#ba68c8]/15 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4dd0e1]/10 blur-3xl" />
        <div className="absolute right-[10%] top-[20%] h-[200px] w-[200px] rounded-full bg-[#ffb74d]/15 blur-2xl" />

        {/* 糖果小点缀 — 彩色小圆点 */}
        <div className="absolute left-[5%] top-[15%] h-4 w-4 rounded-full bg-[#f06292] opacity-40" />
        <div className="absolute right-[8%] top-[30%] h-3 w-3 rounded-full bg-[#4dd0e1] opacity-40" />
        <div className="absolute bottom-[25%] left-[10%] h-5 w-5 rounded-full bg-[#ffb74d] opacity-30" />
        <div className="absolute bottom-[35%] right-[5%] h-3 w-3 rounded-full bg-[#ba68c8] opacity-40" />

        <div className="container-content relative flex min-h-[calc(100dvh-60px)] flex-col py-12 sm:py-14 lg:py-16">
          <div className="grid flex-1 items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(430px,.95fr)] lg:gap-14">
            {/* 左侧内容 */}
            <div className="max-w-2xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#f06292]/20 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.18em] text-[#d81b60]">
                <AlertTriangle className="h-3.5 w-3.5" />
                Active product recall
              </div>

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#78909c]">
                Consumer product safety notice
              </p>

              <h1 className="mt-3 max-w-xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-5xl">
                Check before{' '}
                <span className="bg-gradient-to-r from-[#f06292] to-[#ffb74d] bg-clip-text text-transparent">
                  you use it.
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-base leading-relaxed text-[#546e7a] sm:text-lg">
                Search current recall notices, verify whether your product is affected, and begin a
                remedy claim in one secure place.
              </p>

              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <Link
                  href={recallHref}
                  className="group inline-flex min-h-12 items-center justify-between gap-6 rounded-full bg-gradient-to-r from-[#f06292] to-[#ec407a] px-7 text-sm font-bold text-white shadow-md shadow-[#f06292]/30 transition-all hover:scale-105 hover:shadow-lg hover:shadow-[#f06292]/40"
                >
                  Check this recall
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link
                  href="/lookup"
                  className="group inline-flex min-h-12 items-center justify-between gap-6 rounded-full border-2 border-[#f06292]/30 bg-white/70 px-7 text-sm font-bold text-[#546e7a] backdrop-blur-sm transition-all hover:border-[#f06292] hover:bg-white hover:shadow-md"
                >
                  <span className="flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Check claim status
                  </span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-[#78909c]">
                ⚠️ Do not continue using a product if the recall notice instructs you to stop use.
              </p>

              {/* 信任标识 — 糖果风格 */}
              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs text-[#78909c]">
                <span className="flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1 backdrop-blur-sm">
                  <ShieldCheck className="h-3.5 w-3.5 text-[#26a69a]" />
                  Official CPSC data
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1 backdrop-blur-sm">
                  <Clock3 className="h-3.5 w-3.5 text-[#42a5f5]" />
                  Updated daily
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-white/60 px-3 py-1 backdrop-blur-sm">
                  <Users className="h-3.5 w-3.5 text-[#ab47bc]" />
                  10K+ claims processed
                </span>
              </div>
            </div>

            {/* 右侧召回卡片 — 糖果风格卡片 */}
            <article className="overflow-hidden rounded-2xl border border-white/60 bg-white/80 shadow-2xl shadow-[#f06292]/10 backdrop-blur-sm transition-shadow hover:shadow-[#f06292]/20">
              <div className="border-b-4 border-[#f06292] px-5 py-4 sm:px-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#f06292]">
                      🍭 Current recall notice
                    </p>
                    <h2 className="mt-1.5 text-lg font-bold leading-snug text-[#263238] sm:text-xl">
                      {campaign?.title ?? 'Current safety campaign'}
                    </h2>
                  </div>
                  <span className="shrink-0 rounded-full border border-[#f06292]/25 bg-[#fce4ec] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#d81b60]">
                    Action needed
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_118px] border-b border-[#fce4ec] sm:grid-cols-[1fr_150px]">
                <div className="p-5 sm:p-6">
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#78909c]">
                    Recall reference
                  </p>
                  <p className="mt-1 font-mono text-base font-bold text-[#263238]">
                    CPSC {campaign?.cpscNumber ?? '26-042'}
                  </p>

                  <dl className="mt-4 space-y-2.5 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#78909c]">Published</dt>
                      <dd className="font-semibold text-[#263238]">{recallDate}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#78909c]">Affected units</dt>
                      <dd className="font-semibold text-[#263238]">
                        {campaign?.estimatedUnits?.toLocaleString() ?? 'See notice'}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#78909c]">Manufacturer</dt>
                      <dd className="text-right font-semibold text-[#263238]">
                        {campaign?.manufacturerName ?? 'See notice'}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="flex items-center bg-gradient-to-b from-[#fce4ec]/30 to-[#f3e5f5]/30 p-3 sm:p-4">
                  <Image
                    src="/images/music-lollipop.png"
                    alt="Product included in the current recall"
                    width={1200}
                    height={1200}
                    className="h-auto w-full object-contain drop-shadow-lg"
                  />
                </div>
              </div>

              <Link
                href={recallHref}
                className="group flex items-center justify-between px-5 py-3.5 text-sm font-semibold text-[#ec407a] transition-colors hover:bg-[#fce4ec] sm:px-6"
              >
                Read full recall notice
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </article>
          </div>

          {/* 统计信息 — 糖果风格 */}
          <div className="mt-6 grid grid-cols-2 rounded-2xl bg-white/40 px-4 py-4 backdrop-blur-sm sm:grid-cols-4 lg:mt-5">
            <div className="border-r border-[#fce4ec] px-3 first:pl-0 sm:px-5">
              <p className="text-[10px] uppercase tracking-widest text-[#78909c]">
                <Package className="mr-1 inline h-3 w-3 text-[#f06292]" />
                Active notices
              </p>
              <p className="mt-0.5 text-2xl font-semibold text-[#263238]">
                {stats.activeRecalls}
              </p>
            </div>
            <div className="border-b border-[#fce4ec] px-3 pb-4 sm:border-b-0 sm:border-r sm:px-5">
              <p className="text-[10px] uppercase tracking-widest text-[#78909c]">
                <Users className="mr-1 inline h-3 w-3 text-[#ab47bc]" />
                Units affected
              </p>
              <p className="mt-0.5 text-2xl font-semibold text-[#263238]">
                {(stats.affectedUnits / 1000).toFixed(1)}K
              </p>
            </div>
            <div className="border-r border-[#fce4ec] px-3 pt-4 sm:px-5 sm:pt-0">
              <p className="text-[10px] uppercase tracking-widest text-[#78909c]">
                <AlertTriangle className="mr-1 inline h-3 w-3 text-[#ffb74d]" />
                Priority notices
              </p>
              <p className="mt-0.5 text-2xl font-semibold text-[#f06292]">
                {stats.criticalCount}
              </p>
            </div>
            <div className="px-3 pt-4 sm:px-5 sm:pt-0">
              <p className="text-[10px] uppercase tracking-widest text-[#78909c]">
                <CheckCircle className="mr-1 inline h-3 w-3 text-[#26a69a]" />
                Claims resolved
              </p>
              <p className="mt-0.5 text-2xl font-semibold text-[#26a69a]">
                {stats.resolvedRate}%
              </p>
            </div>
          </div>

          <Link
            href="/how-it-works"
            className="mt-8 hidden items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#78909c] transition-colors hover:text-[#ec407a] lg:absolute lg:bottom-2.5 lg:left-[max(1.5rem,calc((100%-72rem)/2+1.5rem))] lg:mt-0 lg:flex"
          >
            How to respond to a recall <ArrowDown className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* ===== 如何工作区域 ===== */}
      <section className="bg-[#f5f5f5] py-14 sm:py-18 lg:py-20">
        <div className="container-content">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f06292]">
              🍭 How it works
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#263238] sm:text-4xl">
              Three steps to recall resolution
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#546e7a]">
              From identifying your product to tracking your claim — we guide you through every step
              of the recall process.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {HOW_IT_WORKS.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.step}
                  className="group rounded-2xl border border-[#fce4ec] bg-white p-6 text-center transition-all hover:border-[#f06292] hover:shadow-lg hover:shadow-[#f06292]/10"
                >
                  <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#fce4ec] to-[#f3e5f5] group-hover:from-[#f06292] group-hover:to-[#ec407a]">
                    <Icon className="h-7 w-7 text-[#ec407a] transition-colors group-hover:text-white" />
                    <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-[#ffb74d] text-xs font-bold text-white shadow-md">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-[#263238]">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#546e7a]">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 text-sm font-medium text-[#ec407a] transition-colors hover:text-[#d81b60]"
            >
              Learn more about the process
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== 召回列表区域 ===== */}
      <section id="active-recalls" className="bg-white py-14 sm:py-18 lg:py-20">
        <div className="container-content">
          <div className="flex flex-col gap-4 border-b border-[#fce4ec] pb-7 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#f06292]">
                🍭 Recall directory
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight text-[#263238] sm:text-4xl">
                Active product recalls
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#546e7a]">
                Review current notices and open the complete record for affected products, remedy
                options and claim requirements.
              </p>
            </div>
            <span className="inline-flex items-center gap-2 text-xs font-semibold text-[#78909c]">
              <Clock3 className="h-4 w-4 text-[#42a5f5]" />
              Updated as notices change
            </span>
          </div>

          {campaigns.length > 0 ? (
            <div className="mt-7 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {campaigns.map((item) => (
                <RecallCard key={item.id} campaign={item} />
              ))}
            </div>
          ) : (
            <div className="mt-7 rounded-xl border border-[#fce4ec] bg-[#fafafa] p-10 text-center">
              <ShieldCheck className="mx-auto h-12 w-12 text-[#f06292]" />
              <h3 className="mt-4 text-lg font-bold text-[#263238]">No active recalls</h3>
              <p className="mt-1 text-sm text-[#546e7a]">
                There are no campaigns accepting claims at this time.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ===== 信任标识区域 ===== */}
      <section className="bg-gradient-to-br from-[#fce4ec] to-[#f3e5f5] py-12 sm:py-14">
        <div className="container-content">
          <div className="grid gap-8 lg:grid-cols-[.7fr_1.3fr] lg:items-start">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#26a69a]">
                ✨ Built for consumer safety
              </p>
              <h2 className="mt-3 text-2xl font-bold text-[#263238] sm:text-3xl">
                Information you can <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-[#f06292] to-[#ffb74d] bg-clip-text text-transparent">
                  act on.
                </span>
              </h2>
              <p className="mt-3 text-sm text-[#546e7a]">
                Every recall notice is verified against official sources. Your claim data is
                protected and private.
              </p>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              {TRUST_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="rounded-xl border border-white/60 bg-white/70 p-5 backdrop-blur-sm transition-all hover:bg-white hover:shadow-lg"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#fce4ec] to-[#f3e5f5]">
                      <Icon className="h-5 w-5 text-[#ec407a]" />
                    </div>
                    <p className="mt-3 text-sm font-bold text-[#263238]">{item.label}</p>
                    <p className="mt-1 text-xs leading-relaxed text-[#546e7a]">
                      {item.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ===== 底部 CTA 区域 ===== */}
      <section className="bg-[#f5f5f5] py-14 sm:py-18 lg:py-20">
        <div className="container-content">
          <div className="grid overflow-hidden rounded-2xl border border-[#fce4ec] bg-white shadow-lg md:grid-cols-[1.25fr_.75fr]">
            <div className="p-7 sm:p-10 lg:p-12">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-[#fce4ec] to-[#f3e5f5] px-3 py-1 text-xs font-medium text-[#ec407a]">
                <Sparkles className="h-3.5 w-3.5" />
                Need to take action?
              </div>
              <h2 className="text-3xl font-bold tracking-tight text-[#263238] sm:text-4xl">
                Start with your <span className="text-[#f06292]">product details.</span>
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-[#546e7a]">
                Have the package, model number, UPC or purchase details nearby. We will guide you
                through the relevant recall and available resolution options.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href={recallHref}
                  className="inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-[#f06292] to-[#ec407a] px-7 py-3 text-sm font-bold text-white shadow-md shadow-[#f06292]/30 transition-all hover:scale-105 hover:shadow-lg"
                >
                  Check my product
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/lookup"
                  className="inline-flex items-center gap-3 rounded-full border-2 border-[#f06292]/30 bg-white px-7 py-3 text-sm font-bold text-[#546e7a] transition-all hover:border-[#f06292] hover:bg-[#fce4ec]"
                >
                  Find an existing claim
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <div className="border-t border-[#fce4ec] bg-gradient-to-br from-[#fce4ec]/30 to-[#f3e5f5]/30 p-7 md:border-l md:border-t-0 sm:p-10">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#fce4ec]">
                <FileText className="h-6 w-6 text-[#f06292]" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-[#263238]">Keep your notice handy</h3>
              <p className="mt-2 text-sm leading-relaxed text-[#546e7a]">
                Your recall reference and claim ID make it easier to return to the correct record and
                track progress.
              </p>
              <div className="mt-4 rounded-xl border border-[#fce4ec] bg-white/70 p-3 backdrop-blur-sm">
                <p className="text-xs text-[#78909c]">Example reference</p>
                <p className="font-mono text-sm font-bold text-[#263238]">CPSC ML-DEMO-2026</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
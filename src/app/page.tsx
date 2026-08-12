// ============================================================
// KOI Recall Platform — Landing Page (/)
// Design v3.1: Responsive across mobile / tablet / desktop
// Breakpoints: sm(640) md(768) lg(1024) xl(1280) 2xl(1536)
// ============================================================

import Link from 'next/link';
import {
  Shield,
  SearchCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { RecallCard } from '@/components/consumer/recall-card';
import { fetchCampaign } from '@/lib/api-adapter';
import { AuthLinks } from '@/components/auth/auth-links';
import type { Campaign } from '@/types';

export default async function LandingPage() {
  const { campaign } = await fetchCampaign('music-lollipop-demo-2026');
  const campaigns: Campaign[] = campaign ? [campaign] : [];

  const stats = {
    activeRecalls: campaigns.length,
    affectedUnits: campaigns.reduce((sum, c) => sum + c.estimatedUnits, 0),
    criticalCount: campaigns.filter(
      (c) => c.riskLevel === 'critical' || c.riskLevel === 'high',
    ).length,
    resolvedRate: 94,
  };

const STEPS = [
  {
    blade: 'safety' as const,
    number: '01',
    title: 'Safety Notice',
    subtitle: 'Identify the Threat',
    description:
      'Browse active CPSC recall notices. Each campaign includes hazard descriptions, affected model numbers, and manufacturer instructions — updated in real time.',
    icon: AlertTriangle,
    stepBg: 'bg-blade-safety',
  },
  {
    blade: 'verification' as const,
    number: '02',
    title: 'Verification',
    subtitle: 'Validate & Submit',
    description:
      'Check product eligibility by model number, serial number, or UPC. Submit your claim with guided evidence upload in a structured verification workflow.',
    icon: SearchCheck,
    stepBg: 'bg-blade-verification',
  },
  {
    blade: 'resolution' as const,
    number: '03',
    title: 'Resolution',
    subtitle: 'Remedy & Track',
    description:
      'Select your preferred remedy — refund, replacement, or repair. Track your claim through every stage from submission to resolution with full transparency.',
    icon: CheckCircle2,
    stepBg: 'bg-blade-resolution',
  },
] as const;

const TRUST_ITEMS = [
  { label: '15 U.S.C. § 2064', description: 'Consumer Product Safety Act compliance' },
  { label: 'Fast Track', description: 'CPSC Fast Track Recall Program partner' },
  { label: 'Real-Time', description: 'Data sourced from official CPSC announcements' },
];

  return (
    <>
      {/* ================================================================
          HERO — fluid typography, progressive layout
          ================================================================ */}
      <section className="relative overflow-hidden bg-surface-primary">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-teal/[0.03] to-transparent" />

        <div className="container-content relative py-12 sm:py-16 md:py-24 lg:py-28 xl:py-32">
          <div className="max-w-3xl mx-auto lg:mx-0">
            {/* Label */}
            <div className="inline-flex items-center gap-2 rounded-full border bg-surface-elevated px-3 py-1 text-xs font-medium text-text-secondary mb-6 sm:mb-8">
              <span className="h-2 w-2 rounded-full bg-blade-resolution" />
              Live Safety Monitoring
            </div>

            {/* Headline — fluid */}
            <h1 className="text-fluid-5xl text-text-primary mb-3 sm:mb-5">
              Your safety,{' '}
              <span className="text-brand-teal">verified</span>{' '}
              in seconds.
            </h1>

            <p className="text-base sm:text-lg text-text-secondary max-w-xl leading-relaxed mb-6 sm:mb-8">
              The fastest way to check product recalls, submit claims, and track
              your resolution. Trusted by thousands of consumers — because your
              family&apos;s safety shouldn&apos;t wait.
            </p>

            {/* CTA entrance cards — responsive grid */}
            <div className="space-y-3 sm:space-y-4 mb-12 sm:mb-16">
              <div className="grid sm:grid-cols-2 gap-2.5 sm:gap-3">
                <Link
                  href="/lookup"
                  className="flex items-center gap-3 sm:gap-4 p-4 rounded-2xl border bg-surface-elevated card-lift group cursor-pointer"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blade-safety-light icon-spin">
                    <Search className="h-5 w-5 text-blade-safety" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-text-primary group-hover:text-brand-teal transition-colors duration-250">
                      Check Recall Status
                    </p>
                    <p className="text-xs text-text-secondary hidden xs:block">
                      Look up your claim by claim number — no registration needed
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-text-tertiary group-hover:text-brand-teal group-hover:translate-x-1 transition-all duration-250 ml-auto shrink-0 hidden sm:block" />
                </Link>
                <Link
                  href="/recalls/music-lollipop-safety-recall"
                  className="flex items-center gap-3 sm:gap-4 p-4 rounded-2xl border bg-surface-elevated card-lift group cursor-pointer"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blade-resolution-light icon-spin">
                    <AlertTriangle className="h-5 w-5 text-blade-resolution" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-text-primary group-hover:text-brand-teal transition-colors duration-250">
                      View Active Recall
                    </p>
                    <p className="text-xs text-text-secondary hidden xs:block">
                      See the Music Lollipop safety recall and check your product
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-text-tertiary group-hover:text-brand-teal group-hover:translate-x-1 transition-all duration-250 ml-auto shrink-0 hidden sm:block" />
                </Link>
              </div>

              {/* Auth links — client component, opens drawer */}
              <AuthLinks />
            </div>

            {/* Stats Row — progressive grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="rounded-2xl border bg-surface-elevated p-4 card-lift cursor-default">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-2 w-2 rounded-full bg-blade-safety" />
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Active</p>
                </div>
                <p className="metric-value text-2xl sm:text-3xl text-blade-safety">{stats.activeRecalls}</p>
              </div>
              <div className="rounded-2xl border bg-surface-elevated p-4 card-lift cursor-default">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-2 w-2 rounded-full bg-blade-verification" />
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Units</p>
                </div>
                <p className="metric-value text-2xl sm:text-3xl text-text-primary">
                  {(stats.affectedUnits / 1000).toFixed(0)}K
                </p>
              </div>
              <div className="rounded-2xl border bg-surface-elevated p-4 card-lift cursor-default">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-2 w-2 rounded-full bg-blade-safety" />
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Lots</p>
                </div>
                <p className="metric-value text-2xl sm:text-3xl text-blade-safety">{stats.criticalCount}</p>
              </div>
              <div className="rounded-2xl border bg-surface-elevated p-4 card-lift cursor-default">
                <div className="flex items-center gap-2 mb-1">
                  <div className="h-2 w-2 rounded-full bg-blade-resolution" />
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-text-tertiary">Resolved</p>
                </div>
                <p className="metric-value text-2xl sm:text-3xl text-blade-resolution">{stats.resolvedRate}%</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================
          THREE-BLADE STEPS — 1→2→3 cols across breakpoints
          ================================================================ */}
      <section id="how-it-works" className="py-16 sm:py-20 lg:py-24 bg-surface-secondary">
        <div className="container-content">
          <div className="text-center mb-12 sm:mb-16">
            <span className="section-tag section-tag-resolution mb-3 block justify-center">
              How It Works
            </span>
            <h2 className="text-fluid-4xl text-text-primary">
              Safety &rarr; Verification &rarr; Resolution
            </h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-text-secondary max-w-xl mx-auto leading-relaxed">
              Every recall follows a structured pipeline. Three stages, each with
              its own identity — designed for clarity, trust, and action.
            </p>
          </div>

          {/* sm: 1-col  md: 2-col (stacked 3rd)  lg+: 3-col with connectors */}
          <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.blade}
                  className={i < 2 ? 'step-connector' : undefined}
                >
                  <div className="group rounded-2xl bg-surface-elevated border shadow-sm card-lift overflow-hidden h-full cursor-pointer">
                    <div className={`h-1 ${step.stepBg}`} />
                    <div className="p-5 sm:p-6 lg:p-8">
                      <div className={`step-number text-[var(--blade-${step.blade})] bg-[var(--blade-${step.blade}-light)] mb-4 lg:mb-5`}>
                        {step.number}
                      </div>
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="flex h-10 w-10 items-center justify-center rounded-xl"
                          style={{ backgroundColor: `var(--blade-${step.blade}-light)` }}
                        >
                          <Icon className="h-5 w-5" style={{ color: `var(--blade-${step.blade})` }} />
                        </div>
                        <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: `var(--blade-${step.blade})` }}>
                          {step.subtitle}
                        </p>
                      </div>
                      <h3 className="text-lg lg:text-xl font-bold text-text-primary mb-2 lg:mb-3">
                        {step.title}
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================================================================
          ACTIVE RECALLS — progressive card grid
          ================================================================ */}
      <section id="active-recalls" className="py-16 sm:py-20 lg:py-24 bg-surface-primary">
        <div className="container-content">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10 sm:mb-12">
            <div>
              <span className="section-tag section-tag-safety mb-2 block">
                <span className="status-dot bg-blade-safety" />
                Live Campaigns
              </span>
              <h2 className="text-fluid-4xl text-text-primary">
                Active Recalls
              </h2>
              <p className="mt-2 text-base sm:text-lg text-text-secondary">
                {campaigns.length} campaign currently accepting claims
              </p>
            </div>
          </div>

          {/* Grid: 1-col mobile  /  2-col tablet  /  3-col lg  /  4-col xl */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {campaigns.map((campaign) => (
              <RecallCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          TRUST BAR — responsive icon grid
          ================================================================ */}
      <section className="py-10 sm:py-12 lg:py-14 bg-surface-inverse">
        <div className="container-content">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {TRUST_ITEMS.map((item) => (
              <div key={item.label} className="flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 mt-0.5">
                  <ShieldCheck className="h-4 w-4 text-blade-resolution-medium" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-on-inverse">{item.label}</p>
                  <p className="text-xs text-text-on-inverse/60 mt-0.5">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          SAFETY CTA — responsive dual-column
          ================================================================ */}
      <section className="py-16 sm:py-20 lg:py-24 bg-surface-primary">
        <div className="container-content">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-brand-teal">
            {/* Subtle bg pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]" />

            <div className="relative grid md:grid-cols-2 gap-6 md:gap-8 p-6 sm:p-10 md:p-12 lg:p-16 items-center">
              <div>
                <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-white/70 mb-3 sm:mb-4">
                  Get Started Now
                </p>
                <h2 className="text-fluid-4xl text-white mb-3 sm:mb-4">
                  Your family&apos;s safety deserves 30 seconds.
                </h2>
                <p className="text-base sm:text-lg text-white/80 leading-relaxed mb-6 sm:mb-8">
                  Check your product in under a minute. Our verification walks you through
                  identification → verification → resolution, step by step.
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/recalls/music-lollipop-safety-recall">
                    <Button
                      size="lg"
                      className="bg-white text-brand-teal hover:bg-blade-resolution-light font-semibold h-11 sm:h-12 px-5 sm:px-6 rounded-xl shadow-sm text-sm sm:text-base cursor-pointer btn-lift btn-press"
                    >
                      Check My Product Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Decorative shield — visible on md+ */}
              <div className="hidden md:flex justify-center">
                <div className="flex h-32 w-32 lg:h-40 lg:w-40 xl:h-48 xl:w-48 items-center justify-center rounded-full bg-white/10">
                  <Shield className="h-14 w-14 lg:h-16 lg:w-16 xl:h-20 xl:w-20 text-white/40" />
                </div>
              </div>
            </div>

            {/* Subtle decorative circles — scaled for mobile */}
            <div className="absolute -top-12 -right-12 sm:-top-16 sm:-right-16 lg:-top-20 lg:-right-20 w-40 h-40 sm:w-60 sm:h-60 lg:w-80 lg:h-80 rounded-full bg-blade-resolution-dark/20" />
            <div className="absolute -bottom-6 left-1/3 sm:-bottom-8 lg:-bottom-10 sm:left-1/2 w-32 h-32 sm:w-48 sm:h-48 lg:w-60 lg:h-60 rounded-full bg-blade-resolution-dark/10" />
          </div>
        </div>
      </section>
    </>
  );
}


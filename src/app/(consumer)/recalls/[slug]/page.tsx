// ============================================================
// KOI Recall Platform — Recall Detail v7.0
// Three-Blade: unified header zone → titles lock into place
// ============================================================

import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { fetchCampaign } from '@/lib/api-adapter';
import {
  AlertTriangle, Barcode, Calendar, Factory, Hash, Package,
  ShieldCheck, CheckCircle2, ArrowRight, Info, Phone, Mail,
} from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { RecallCheckCard } from '@/components/consumer/recall-check-card';
import { RemedyOptions } from '@/components/consumer/remedy-options';
import { RiskLevel } from '@/types';
import { cn } from '@/lib/utils';

interface RecallPageProps { params: Promise<{ slug: string }>; }

const RISK_CONFIG: Record<string, { bg: string; text: string; border: string; label: string }> = {
  [RiskLevel.CRITICAL]: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'CRITICAL RISK' },
  [RiskLevel.HIGH]:    { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200', label: 'HIGH RISK' },
  [RiskLevel.MODERATE]:{ bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', label: 'MODERATE RISK' },
  [RiskLevel.LOW]:     { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', label: 'LOW RISK' },
};

// ══════════════════════════════════════════════════════════════════
// Shared title block — same padding + width on every blade
// ══════════════════════════════════════════════════════════════════
const bladeColors = {
  safety:    { strip: 'var(--blade-safety)', iconBg: 'var(--blade-safety)', light: 'var(--blade-safety-light)', text: 'var(--blade-safety-text)' },
  verification: { strip: 'var(--blade-verification)', iconBg: 'var(--blade-verification)', light: 'var(--blade-verification-light)', text: 'var(--blade-verification-text)' },
  resolution: { strip: 'var(--blade-resolution)', iconBg: 'var(--blade-resolution)', light: 'var(--blade-resolution-light)', text: 'var(--blade-resolution-text)' },
};

const BLADE_H = 'min-h-[calc(100dvh-3.75rem)]';

const BLADES = [
  {
    key: 'safety' as const,
    number: '01',
    label: 'Safety Notice',
    title: 'Identify the Product',
    description: 'Check whether your product matches this recall. Locate the lot code, date code, shape, and flavor on your package.',
  },
  {
    key: 'verification' as const,
    number: '02',
    label: 'Verification',
    title: 'Check Your Product',
    description: 'Enter your codes below to verify whether your Music Lollipop is covered by this safety recall.',
  },
  {
    key: 'resolution' as const,
    number: '03',
    label: 'Resolution',
    title: 'Choose a Remedy',
    description: 'Select the resolution option that works best for you. Free replacement or full refund are available.',
  },
] as const;

function BladeHeader({ blade, campaignTitle, risk }: { blade: typeof BLADES[number]; campaignTitle?: string; risk?: { bg: string; text: string; border: string; label: string } }) {
  const c = bladeColors[blade.key];
  return (
    <header className="pt-12 sm:pt-16 pb-6 sm:pb-8 max-w-4xl mx-auto w-full px-0">
      {/* ── Thin color strip ── */}
      <div className="w-[72px] h-[4px] rounded-full mb-6" style={{ background: c.strip }} />

      {/* ── Number + label badge ── */}
      <div className="flex items-center gap-4 mb-4">
        <span
          className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl text-white text-base sm:text-lg font-bold"
          style={{ background: c.iconBg }}
        >
          {blade.number}
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.12em]" style={{ color: c.strip }}>
            {blade.label}
          </p>
          <h2 className="text-[1.75rem] sm:text-[2.25rem] lg:text-[2.75rem] font-bold tracking-[-0.02em] text-text-primary leading-[1.10]">
            {blade.title}
          </h2>
        </div>
      </div>

      {/* ── Status chips (Blade 1 only) ── */}
      {blade.key === 'safety' && campaignTitle && risk && (
        <div className="flex flex-wrap items-center gap-2 mt-3">
          <StatusBadge variant="active" />
          <span className={cn('inline-flex items-center gap-1 rounded-md border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider', risk.bg, risk.text, risk.border)}>
            <AlertTriangle className="h-3.5 w-3.5" />{risk.label}
          </span>
          <span className="text-[13px] text-text-tertiary">{campaignTitle}</span>
        </div>
      )}

      {/* ── Description ── */}
      <p className="mt-4 text-base sm:text-lg text-text-secondary max-w-2xl leading-relaxed">
        {blade.description}
      </p>
    </header>
  );
}

export async function generateMetadata({ params }: RecallPageProps): Promise<Metadata> {
  const { slug } = await params;
  const c = await fetchCampaign(slug);
  if (!c) return { title: 'Recall Not Found' };
  return { title: c.title, description: c.summary };
}

export default async function RecallPage({ params }: RecallPageProps) {
  const { slug } = await params;
  const campaign = await fetchCampaign(slug);
  if (!campaign) notFound();
  const p = campaign.affectedProducts[0];
  const risk = RISK_CONFIG[campaign.riskLevel];

  return (
    <div>

      {/* ── Global safety strip ── */}
      <div className="sticky top-[3.75rem] z-40 bg-blade-safety text-white py-2 px-5 text-center text-[13px] font-medium flex items-center justify-center gap-2">
        <AlertTriangle className="h-4 w-4" />
        Safety Recall — Stop using the product until you have checked the lot code below.
      </div>

      {/* ══════════════════════════════════════════════════════════════
          BLADE 1 · SAFETY
          ══════════════════════════════════════════════════════════════ */}
      <section className={cn(BLADE_H, 'flex flex-col blade-section-safety')}>
        <div className="container-content max-w-5xl w-full flex flex-col justify-center flex-1">
          <BladeHeader blade={BLADES[0]} campaignTitle={campaign.title} risk={risk} />

          {/* ── Content ── */}
          <div className="grid md:grid-cols-5 gap-8 lg:gap-12 max-w-5xl w-full mx-auto">
            <div className="md:col-span-2 flex flex-col gap-4">
              {campaign.images[0] && (
                <div className="rounded-2xl bg-surface-elevated border p-6 flex items-center justify-center flex-1">
                  <img src={campaign.images[0]} alt={campaign.title}
                    className="h-40 sm:h-48 object-contain mix-blend-multiply" />
                </div>
              )}
              {p && (
                <div className="text-xs text-text-tertiary space-y-0.5 text-center">
                  <p className="font-semibold text-text-secondary">{p.name}</p>
                  <p>{p.weight} · {p.brandName}</p>
                  <p>{p.shapes?.join(' · ')} · {p.flavors?.join(' · ')}</p>
                </div>
              )}
            </div>

            <div className="md:col-span-3 space-y-4">
              <div className="rounded-xl blade-accent-safety bg-blade-safety-light/50 p-5">
                <p className="text-xs font-bold uppercase tracking-widest text-blade-safety-text/60 mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" />Hazard Description
                </p>
                <p className="text-sm text-text-primary leading-relaxed">{campaign.hazardDescription}</p>
                <p className="text-xs font-semibold text-blade-safety-text mt-2.5">{campaign.instructions}</p>
              </div>

              <div className="rounded-xl border bg-surface-elevated p-5">
                <p className="text-xs font-bold text-text-tertiary uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Barcode className="h-4 w-4" />Affected Lot Codes
                </p>
                <div className="flex flex-wrap gap-2">
                  {(campaign.affectedLots || []).map((lot) => (
                    <code key={lot} className="px-3 py-1 rounded-lg bg-blade-safety-light text-blade-safety-text font-mono text-sm font-bold">{lot}</code>
                  ))}
                </div>
                {campaign.dateCodes && (
                  <p className="text-sm text-text-tertiary mt-2.5 flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />Date codes: {campaign.dateCodes.join(', ')}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { label: 'CPSC', value: campaign.cpscNumber, icon: Hash },
                  { label: 'Manufacturer', value: campaign.manufacturerName.split(' ').slice(0, 2).join(' '), icon: Factory },
                  { label: 'Units Affected', value: `${(campaign.estimatedUnits / 1000).toFixed(0)}K`, icon: Package },
                ].map((m) => (
                  <div key={m.label} className="rounded-lg border bg-surface-elevated p-3 text-center">
                    <m.icon className="h-4 w-4 mx-auto text-text-tertiary mb-1" />
                    <p className="text-[10px] text-text-tertiary uppercase tracking-wider">{m.label}</p>
                    <p className="text-xs font-bold text-text-primary mt-0.5">{m.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          BLADE 2 · VERIFICATION
          ══════════════════════════════════════════════════════════════ */}
      <section className={cn(BLADE_H, 'flex flex-col blade-section-verification')}>
        <div className="container-content max-w-4xl w-full flex flex-col justify-center flex-1">
          <BladeHeader blade={BLADES[1]} />

          {/* ── Content: 2-col balanced ── */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl w-full mx-auto">
            <div className="flex items-stretch">
              <RecallCheckCard campaign={campaign} product={p} />
            </div>
            <div className="flex flex-col justify-between gap-4">
              <div className="rounded-xl border bg-surface-elevated p-5">
                <h4 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-1.5">
                  <Info className="h-4 w-4 text-blade-verification" />
                  Where to Find the Codes
                </h4>
                <ul className="space-y-3 text-sm text-text-secondary">
                  {[
                    'Look near the package seal for the lot code (format ML-0000-X)',
                    'Find the date code below it in MM/YYYY format',
                    'Select the candy shape and flavor from the package label',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blade-verification text-white text-[11px] font-bold mt-0.5">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="rounded-xl border bg-surface-elevated p-5">
                <h4 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-1.5">
                  <ArrowRight className="h-4 w-4 text-blade-verification" />
                  After You Check
                </h4>
                <ul className="space-y-2.5 text-sm text-text-secondary">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blade-resolution shrink-0" />
                    If matched — choose a remedy in the next step
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blade-resolution shrink-0" />
                    If not matched — your product is safe to use
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          BLADE 3 · RESOLUTION
          ══════════════════════════════════════════════════════════════ */}
      <section className={cn(BLADE_H, 'flex flex-col blade-section-resolution')}>
        <div className="container-content max-w-4xl w-full flex flex-col justify-center flex-1">
          <BladeHeader blade={BLADES[2]} />

          {/* ── Content: 2-col balanced ── */}
          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl w-full mx-auto">
            <div className="flex items-stretch">
              <RemedyOptions remedies={campaign.remedies} />
            </div>
            <div className="flex flex-col justify-between gap-4">
              <div className="rounded-xl border bg-surface-elevated p-5">
                <h4 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-blade-resolution" />
                  Need Help?
                </h4>
                <div className="space-y-2.5 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-text-tertiary shrink-0" />
                    <span className="text-text-secondary">demo-support@example.invalid</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-text-tertiary shrink-0" />
                    <span className="text-text-secondary">(555) 010-2042</span>
                  </div>
                  <p className="text-xs text-text-tertiary">Monday–Friday, 9am–5pm ET</p>
                </div>
              </div>

              <div className="rounded-xl border bg-surface-elevated p-5">
                <h4 className="text-sm font-bold text-text-primary mb-3 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-blade-resolution" />
                  What to Expect
                </h4>
                <ol className="space-y-2.5 text-sm text-text-secondary">
                  {[
                    'Submit your claim with evidence (product photo + proof of purchase)',
                    'Review within 3–5 business days',
                    'Once approved, receive your replacement or refund within 7–14 business days',
                  ].map((step, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blade-resolution text-white text-[11px] font-bold mt-0.5">{i + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="flex items-center gap-3 rounded-xl border bg-surface-elevated p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blade-resolution-light">
                  <ShieldCheck className="h-5 w-5 text-blade-resolution" />
                </div>
                <div>
                  <p className="text-xs font-bold text-text-primary">CPSC Partner Platform</p>
                  <p className="text-[11px] text-text-tertiary">Recall #{campaign.cpscNumber} · Valid until Dec 2027</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

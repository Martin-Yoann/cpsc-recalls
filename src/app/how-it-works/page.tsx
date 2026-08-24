import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, FileText, SearchCheck, ShieldCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Learn how to review a recall, check your product, and submit and track a remedy claim with KOI.',
};

const STEPS = [
  { number: '01', title: 'Find the notice', description: 'Review the product name, recall number, hazard and affected lots before taking action.', icon: FileText },
  { number: '02', title: 'Check your product', description: 'Use the product details on your packaging to confirm whether your item is affected.', icon: SearchCheck },
  { number: '03', title: 'Submit and track', description: 'Choose an available remedy, send your claim securely, then follow its status online.', icon: CheckCircle2 },
] as const;

export default function HowItWorksPage() {
  return (
    <>
      <section className="border-b border-border bg-surface-elevated">
        <div className="container-content grid gap-8 py-14 sm:py-18 lg:grid-cols-[.8fr_1.2fr] lg:items-end lg:py-20">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-teal">How KOI helps</p>
            <h1 className="mt-3 text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">A clear path from notice to remedy.</h1>
          </div>
          <p className="max-w-2xl text-base leading-relaxed text-text-secondary">KOI organizes the information you need to make a safe decision, then keeps your claim and resolution updates in one place.</p>
        </div>
      </section>

      <section className="bg-surface-primary py-14 sm:py-18 lg:py-20">
        <div className="container-content">
          <div className="mb-8 flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-brand-teal" />
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-alert-orange">The process</p>
          </div>
          <ol className="grid divide-y divide-border border border-border bg-surface-elevated md:grid-cols-3 md:divide-x md:divide-y-0">
            {STEPS.map((step) => {
              const Icon = step.icon;
              return <li key={step.number} className="p-6 sm:p-7"><div className="flex items-center justify-between"><span className="font-mono text-xs font-bold tracking-widest text-alert-orange">STEP {step.number}</span><Icon className="h-5 w-5 text-brand-teal" /></div><h2 className="mt-8 text-lg font-bold text-text-primary">{step.title}</h2><p className="mt-2 text-sm leading-relaxed text-text-secondary">{step.description}</p></li>;
            })}
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/#active-recalls" className="inline-flex items-center gap-3 bg-brand-teal px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blade-resolution-dark">Browse active recalls <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/lookup" className="inline-flex items-center gap-3 border border-border bg-surface-elevated px-5 py-3 text-sm font-bold text-brand-teal transition-colors hover:bg-surface-secondary">Check a claim status <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/faq" className="inline-flex items-center gap-3 border border-border bg-surface-elevated px-5 py-3 text-sm font-bold text-brand-teal transition-colors hover:bg-surface-secondary">Read FAQs <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>
    </>
  );
}
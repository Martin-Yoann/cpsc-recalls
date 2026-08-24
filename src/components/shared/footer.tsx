// ============================================================
// KOI Recall Platform — Footer v3.0
// Lighter, warmer, cleaner
// ============================================================

import Link from 'next/link';
import { Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-surface-inverse border-t border-white/10">
      <div className="container-content py-10 sm:py-12 lg:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10">
          {/* Brand Column */}
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-teal">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-text-on-inverse">KOI</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-text-on-inverse/70">
              Consumer safety, verified. The KOI Recall Platform connects consumers,
              manufacturers, and regulators to resolve product recalls efficiently.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-text-on-inverse/60">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/#active-recalls"
                  className="text-sm text-text-on-inverse/70 transition-colors duration-200 hover:text-white"
                >
                  Active Recalls
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-sm text-text-on-inverse/70 transition-colors duration-200 hover:text-white"
                >
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-sm text-text-on-inverse/70 transition-colors duration-200 hover:text-white"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Compliance */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-wider text-text-on-inverse/60">
              Compliance
            </h4>
            <p className="max-w-xs text-sm leading-relaxed text-text-on-inverse/70">
              A CPSC partner platform. All recall data is sourced from official
              Consumer Product Safety Commission announcements and manufacturer
              submissions under 15 U.S.C. &sect; 2064.
            </p>
            <p className="pt-2 text-xs text-text-on-inverse/50">
              &copy; {new Date().getFullYear()} KOI Recall Platform. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

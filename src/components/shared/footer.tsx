// ============================================================
// KOI Recall Platform — Footer v3.0
// Lighter, warmer, cleaner
// ============================================================

import Link from 'next/link';
import { Shield } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full border-t border-white/60 bg-gradient-to-b from-[#FFF7F2] via-white to-[#FFF1F5]">
      <div className="container-content py-10 sm:py-12 lg:py-14">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 sm:gap-10">
          <div className="space-y-3 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-[#FF6B8A] via-[#FFB07C] to-[#F9E076] shadow-[0_10px_24px_rgba(255,107,138,0.22)]">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold tracking-tight text-[#4A2C2A]">KOI</span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-[#765F68]">
              Recall information and claim requirements are organized per campaign so users can review the applicable notice before submitting.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#B46B78]">
              Platform
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/#active-recalls" className="text-sm text-[#4A2C2A] transition-colors duration-200 hover:text-[#FF6B8A]">
                  Active Recalls
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="text-sm text-[#4A2C2A] transition-colors duration-200 hover:text-[#FF6B8A]">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-[#4A2C2A] transition-colors duration-200 hover:text-[#FF6B8A]">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-sm text-[#4A2C2A] transition-colors duration-200 hover:text-[#FF6B8A]">
                  Privacy notice
                </Link>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold uppercase tracking-[0.16em] text-[#B46B78]">
              Compliance
            </h4>
            <p className="max-w-xs text-sm leading-relaxed text-[#765F68]">
              Recall information and claim requirements are provided for each campaign. Review the applicable notice before submitting a claim.
            </p>
            <p className="pt-2 text-xs text-[#AA929B]">
              &copy; {new Date().getFullYear()} KOI Recall Platform. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

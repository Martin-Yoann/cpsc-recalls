import Link from "next/link";
import { ShieldCheck, Phone, Mail } from "lucide-react";

const FOOTER_LINKS = [
  { label: "Home", href: "/" },
  { label: "Check Claim Status", href: "/lookup" },
  { label: "Active Recalls", href: "/#active-recalls" },
  { label: "File a Claim", href: "/recalls/music-lollipop-demo-2026" },
  { label: "FAQ", href: "/faq" },
];

const FOOTER_LEGAL = [
  { label: "Privacy Policy", href: "/faq" },
  { label: "Terms of Service", href: "/faq" },
  { label: "Accessibility", href: "/faq" },
  { label: "Contact Support", href: "/faq" },
];

export function Footer() {
  return (
    <footer className="footer-band w-full">
      <div className="container-content py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr]">
          {/* Brand */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center bg-white text-black rounded-md">
                <ShieldCheck className="h-4 w-4" />
              </span>
              <span className="text-[16px] font-bold text-white">KOI Recall</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm">
              Official product recall portal. Verify, submit, and track recall claims
              with regulatory-grade security.
            </p>
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 shrink-0" />
                <span>1-800-555-SAFE</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 shrink-0" />
                <span>support@koi-recall.example</span>
              </div>
            </div>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5">
              {FOOTER_LEGAL.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="container-content py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} KOI Recall Platform. All rights reserved.
          </p>
          <p className="text-xs">
            Not affiliated with the U.S. Consumer Product Safety Commission.
          </p>
        </div>
      </div>
    </footer>
  );
}

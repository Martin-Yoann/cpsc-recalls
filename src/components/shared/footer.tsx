"use client";
import { useI18n } from "@/lib/i18n/provider";


import Link from "next/link";
import { ShieldCheck } from "lucide-react";

const FOOTER_LINKS = [
  { label: "nav.home", href: "/" },
  { label: "ui.check.claim.status.cf5234", href: "/lookup" },
  { label: "ui.active.recalls.f6dc50", href: "/#active-recalls" },
  { label: "ui.file.a.claim.49c6f3", href: "/recalls/music-lollipop-demo-2026" },
  { label: "nav.faq", href: "/faq" },
];

const FOOTER_LEGAL = [
  { label: "ui.privacy.policy.9db108", href: "/privacy" },
  { label: "ui.contact.support.fe1a29", href: "/#active-recalls" },
];

export function Footer() {
  const { t } = useI18n();
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
              <span className="text-[16px] font-bold text-white">{t("ui.koi.recall.ccd6c2")}</span>
            </Link>
            <p className="text-sm leading-relaxed max-w-sm">
              {t("ui.official.product.recall.portal.verify.submit.and.058d29")}</p>
            <p className="text-sm leading-relaxed max-w-sm">
              {t("ui.for.recall.assistance.use.the.contact.details.ffc6e6")}</p>
            <Link href="/#active-recalls" className="inline-flex text-sm underline underline-offset-4">
              {t("ui.find.recall.contact.information.c16fc8")}</Link>
          </div>

          {/* Platform */}
          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-wider mb-4">
              {t("ui.platform.123a7f")}</h4>
            <ul className="space-y-2.5">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm">
                    {t(link.label)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-[13px] font-semibold uppercase tracking-wider mb-4">
              {t("ui.legal.902c91")}</h4>
            <ul className="space-y-2.5">
              {FOOTER_LEGAL.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm">
                    {t(link.label)}
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
            &copy; {new Date().getFullYear()} {t("ui.koi.importer.inc.all.rights.reserved.732ee0")}</p>
          <p className="text-xs">
            {t("ui.not.affiliated.with.the.u.s.consumer.f3a791")}</p>
        </div>
      </div>
    </footer>
  );
}

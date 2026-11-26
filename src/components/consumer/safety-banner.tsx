"use client";
import { useI18n } from "@/lib/i18n/provider";


import Link from 'next/link';
import { AlertTriangle, ArrowRight } from 'lucide-react';

export function SafetyBanner() {
  const { t } = useI18n();
  return (
    <div className="bg-brand text-white">
      <div className="container-content flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm sm:flex-nowrap">
        <span className="flex items-center gap-2 min-w-0">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <strong className="shrink-0">{t("nav.productRecalls")}</strong>
          <span className="hidden sm:inline text-white/80 truncate">
            {t("ui.review.the.recall.notice.and.safety.instructions.058e69")}</span>
        </span>
        <Link
          href="/#active-recalls"
          className="group shrink-0 inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-white/80 bg-white px-2.5 text-sm font-semibold text-brand shadow-sm transition-colors hover:bg-white/90 hover:border-white active:bg-white/75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-brand"
          aria-label={t("ui.view.product.recall.information.b200b0")}
        >
          <span>{t("ui.view.recalls.286fa8")}</span>
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}

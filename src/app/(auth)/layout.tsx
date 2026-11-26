
import { getI18n } from "@/lib/i18n/server";
// ============================================================
// KOI Recall Platform — Auth Layout v4
// ============================================================

import Link from 'next/link';
import { ShieldCheck, Shield } from 'lucide-react';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = await getI18n();
  return (
    <div className="bg-background text-foreground min-h-screen flex flex-col">
      <header className="border-b border-border bg-white">
        <div className="container-content h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 text-foreground">
            <span className="flex h-8 w-8 items-center justify-center bg-foreground text-white rounded-md">
              <Shield className="h-4 w-4" />
            </span>
            <span className="text-base font-bold tracking-tight">{t("ui.koi.recall.ccd6c2")}</span>
          </Link>
          <span className="hidden sm:inline-flex items-center gap-2 label-eyebrow">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            {t("ui.private.secure.2f1e67")}</span>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-10 sm:py-16">
        <div className="w-full max-w-6xl">
          {children}
        </div>
      </main>

      <footer className="border-t border-border bg-white py-4 text-center text-xs text-secondary">
        {t("ui.koi.recall.keeps.every.next.step.clear.e6a926")}</footer>
    </div>
  );
}

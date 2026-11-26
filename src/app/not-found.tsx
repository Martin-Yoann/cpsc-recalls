
import { getI18n } from "@/lib/i18n/server";
import Link from "next/link";
import { Home } from "lucide-react";

export default async function NotFound() {
  const { t } = await getI18n();
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="w-full max-w-lg card-elevated p-10 text-center">
        <p className="label-eyebrow text-brand">{t("ui.error.404.157fc0")}</p>
        <h1 className="mt-3 text-[40px] leading-none font-bold tracking-[-0.02em] text-foreground">{t("ui.page.not.found.e637d9")}</h1>
        <p className="mt-4 text-secondary leading-relaxed">
          {t("ui.the.page.you.re.looking.for.doesn.c6fa01")}</p>
        <div className="mt-8">
          <Link href="/" className="btn-dark">
            <Home className="h-4 w-4" />
            {t("ui.back.to.home.ce7472")}</Link>
        </div>
      </div>
    </div>
  );
}

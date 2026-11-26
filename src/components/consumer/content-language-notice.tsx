'use client';
import { useI18n } from '@/lib/i18n/provider';
import { normalizeLocale } from '@/lib/i18n/locale';

export function ContentLanguageNotice({ contentLocale, instructions = false }: { contentLocale: string | undefined; instructions?: boolean }) {
  const { locale, t } = useI18n();
  if (!contentLocale || normalizeLocale(contentLocale) === locale) return null;
  return (
    <div role="note" className="my-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-sm leading-relaxed text-amber-950">
      {t(instructions
        ? "ui.these.approved.instructions.are.shown.in.their.b713a2"
        : "ui.this.recall.notice.is.currently.available.in.31e92b")}
    </div>
  );
}

'use client';
import { useI18n } from "@/lib/i18n/provider";


import { useAuth } from '@/lib/auth-context';

export function AuthLinks() {
  const { t } = useI18n();
  const { openAuthDrawer } = useAuth();

  return (
    <div className="flex flex-wrap items-center gap-x-1 gap-y-1 text-sm text-text-secondary">
      <span>{t("ui.already.have.an.account.855903")}</span>
      <button
        onClick={() => openAuthDrawer('signin')}
        className="font-semibold text-brand-teal hover:underline cursor-pointer bg-transparent border-0 p-0"
      >
        {t("auth.signIn")}</button>
      <span className="mx-1 hidden sm:inline">&middot;</span>
      <span className="hidden sm:inline">{t("ui.new.to.koi.67a97a")}</span>
      <button
        onClick={() => openAuthDrawer('register')}
        className="font-semibold text-brand-teal hover:underline cursor-pointer bg-transparent border-0 p-0 sm:inline"
      >
        <span className="sm:hidden"> · </span>{t("ui.create.free.account.91eafd")}</button>
    </div>
  );
}

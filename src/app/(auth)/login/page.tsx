'use client';
import { useI18n } from "@/lib/i18n/provider";


import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

export default function LoginRedirect() {
  const { t } = useI18n();
  const { isAuthenticated, openAuthDrawer } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/dashboard');
      return;
    }
    openAuthDrawer('signin');
  }, [isAuthenticated, openAuthDrawer, router]);

  if (isAuthenticated) return null;

  return (
    <div className="flex items-center justify-center min-h-[40vh] text-sm text-secondary">
      {t("ui.opening.sign.in.b6c888")}</div>
  );
}

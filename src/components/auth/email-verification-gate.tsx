'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MailCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n/provider';
import { problemMessage } from '@/lib/i18n/problem';
import type { MessageInput } from '@/lib/i18n/translate';
import { requestConsumerEmailVerification } from '@/lib/api-client';
import { Button } from '@/components/ui/button';

export function EmailVerificationGate() {
  const { user, refreshUser } = useAuth();
  const { t, locale } = useI18n();
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [error, setError] = useState<MessageInput | null>(null);
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = window.setTimeout(() => setCooldown(value => Math.max(0, value - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [cooldown]);
  if (!user?.token || user.claimsAccessVerified) return null;
  const send = async () => {
    setBusy(true); setError(null);
    try {
      const result = await requestConsumerEmailVerification(user.token!, locale);
      if (result.ok) {
        if (result.data.status === 'verified') await refreshUser();
        else { setSent(true); setCooldown(60); }
      } else {
        setError(problemMessage({ ...result.error, status: result.status }));
        if (result.status === 429) setCooldown(60);
      }
    } catch { setError(problemMessage({ status: 0 })); }
    finally { setBusy(false); }
  };
  return (
    <section aria-labelledby="verify-email-heading" className="mx-auto max-w-xl space-y-4 rounded-xl border border-border bg-white p-6 sm:p-8">
      <MailCheck aria-hidden="true" className="h-8 w-8 text-foreground" />
      <h1 id="verify-email-heading" className="text-xl font-semibold">{t('emailVerify.title')}</h1>
      <p className="text-sm leading-6 text-secondary">{t('emailVerify.description')}</p>
      <p className="break-all text-sm font-medium">{user.email}</p>
      <p className="text-sm leading-6 text-secondary">{t('emailVerify.sameSession')}</p>
      {sent && <p role="status" className="text-sm leading-6 text-green-800">{t('emailVerify.sent')}</p>}
      {error && <p role="alert" className="text-sm text-red-700">{t(error)}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <Button disabled={busy || cooldown > 0} onClick={() => void send()}>{t(busy ? 'emailVerify.sending' : sent ? 'emailVerify.resend' : 'emailVerify.send')}{cooldown > 0 && ` (${cooldown}s)`}</Button>
        <Link href="/lookup" className="text-sm underline underline-offset-4">{t('nav.checkStatus')}</Link>
      </div>
    </section>
  );
}

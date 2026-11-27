'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n/provider';
import { confirmConsumerEmailVerification } from '@/lib/api-client';
import { Button } from '@/components/ui/button';

export default function VerifyEmailPage() {
  const { user, isLoading, openAuthDrawer, refreshUser } = useAuth();
  const { t } = useI18n();
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const value = new URLSearchParams(window.location.hash.slice(1)).get('token');
    return value && /^[A-Za-z0-9_-]{43}$/.test(value) ? value : null;
  });
  const [busy, setBusy] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (location.hash) history.replaceState(history.state, '', location.pathname + location.search);
  }, []);
  const confirm = async () => {
    if (!user?.token || !token) return;
    setBusy(true); setError(null);
    try {
      const result = await confirmConsumerEmailVerification(user.token, token);
      if (result.ok) { await refreshUser(); setVerified(true); setToken(null); }
      else setError(result.status === 400 ? 'emailVerify.invalid' : result.status === 401 ? 'emailVerify.signIn' : 'emailVerify.failed');
    } catch { setError('emailVerify.failed'); }
    finally { setBusy(false); }
  };
  return (
    <section className="container-content py-12 sm:py-20">
      <div className="mx-auto max-w-xl space-y-5 rounded-xl border border-border bg-white p-6 sm:p-8">
        <h1 className="text-2xl font-semibold">{t(verified ? 'emailVerify.success' : 'emailVerify.title')}</h1>
        {isLoading ? <p role="status">{t('emailVerify.loading')}</p> : verified ? (
          // Re-read the session on entry even if the initial /me refresh had a transient failure.
          <Button onClick={() => window.location.assign('/dashboard/claims')}>{t('emailVerify.viewClaims')}</Button>
        ) : !token ? <p role="alert">{t('emailVerify.invalid')}</p> : !user?.token ? (
          <><p>{t('emailVerify.signIn')}</p><Button onClick={() => openAuthDrawer('signin')}>{t('auth.signIn')}</Button></>
        ) : (
          <><p className="text-sm leading-6 text-secondary">{t('emailVerify.sameSession')}</p><p className="break-all text-sm font-medium">{user.email}</p><Button disabled={busy} onClick={() => void confirm()}>{t(busy ? 'emailVerify.confirming' : 'emailVerify.confirm')}</Button></>
        )}
        {error && <p role="alert" className="text-sm text-red-700">{t(error)}</p>}
        <Link href="/lookup" className="inline-block text-sm underline underline-offset-4">{t('nav.checkStatus')}</Link>
      </div>
    </section>
  );
}

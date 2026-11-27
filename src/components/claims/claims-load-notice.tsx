'use client';
import { useAuth } from '@/lib/auth-context';
import { useI18n } from '@/lib/i18n/provider';
import { problemMessage } from '@/lib/i18n/problem';
import type { ProblemDetails } from '@/lib/api-client';

export function ClaimsLoadNotice({ loading, error, retry }: { loading: boolean; error: ProblemDetails | null; retry: () => void }) {
  const { t } = useI18n();
  const { openAuthDrawer } = useAuth();
  if (loading) return <p role="status" className="card-surface p-5">{t('claims.loading')}</p>;
  if (!error) return null;
  return <div role="alert" className="card-surface space-y-3 p-5">
    <p className="font-semibold">{t('claims.loadFailed')}</p>
    <p>{t(problemMessage(error))}</p>
    <button type="button" className="btn-outline" onClick={error.status === 401 ? () => openAuthDrawer('signin') : retry}>{t(error.status === 401 ? 'claims.signIn' : 'claims.retry')}</button>
  </div>;
}

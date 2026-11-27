'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { listConsumerClaims, type ConsumerClaim, type ProblemDetails } from '@/lib/api-client';
import { getGuestClaims } from '@/lib/claim-access';

export function useViewerClaims() {
  const { user, isLoading } = useAuth();
  const token = user?.token;
  const verified = user?.claimsAccessVerified;
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ owner?: string; claims: ConsumerClaim[]; loading: boolean; error: ProblemDetails | null }>({ claims: [], loading: true, error: null });
  useEffect(() => {
    if (isLoading || (token && !verified)) return;
    let cancelled = false;
    const owner = token ?? 'guest';
    Promise.resolve().then(async () => {
      if (cancelled) return;
      setState((previous) => ({ owner, claims: previous.owner === owner ? previous.claims : [], loading: true, error: null }));
      try {
        const response = token ? await listConsumerClaims(token) : { ok: true as const, data: { claims: getGuestClaims() } };
        if (cancelled) return;
        setState((previous) => response.ok
          ? { owner, claims: response.data.claims, loading: false, error: null }
          : { ...previous, loading: false, error: { ...response.error, status: response.status } });
      } catch {
        if (!cancelled) setState((previous) => ({ ...previous, loading: false, error: { status: 0, title: 'Network Error', detail: 'Could not load claims.', type: 'about:blank' } }));
      }
    });
    return () => { cancelled = true; };
  }, [token, verified, isLoading, attempt]);
  const matches = state.owner === (token ?? 'guest');
  return { claims: matches ? state.claims : [], loading: isLoading || !matches || state.loading, error: matches ? state.error : null, retry: () => setAttempt((value) => value + 1) };
}

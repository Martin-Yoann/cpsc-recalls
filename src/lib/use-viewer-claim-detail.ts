'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { getClaimDetailForViewer } from '@/lib/claim-access';
import type { ProblemDetails } from '@/lib/api-client';
import type { ClaimLookupPayload } from '@/types/claims';

export function useViewerClaimDetail(claimNumber: string) {
  const { user, isLoading } = useAuth();
  const token = user?.token;
  const verified = user?.claimsAccessVerified;
  const owner = JSON.stringify([token ?? null, claimNumber]);
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ owner: string; detail: ClaimLookupPayload | null; loading: boolean; error: ProblemDetails | null } | null>(null);
  useEffect(() => {
    if (isLoading || (token && !verified)) return;
    let cancelled = false;
    Promise.resolve().then(async () => {
      if (cancelled) return;
      setState({ owner, detail: null, loading: true, error: null });
      try {
        const detail = await getClaimDetailForViewer(claimNumber, token);
        if (!cancelled) setState({ owner, detail, loading: false, error: null });
      } catch (failure) {
        const problem = failure instanceof Error && 'problem' in failure ? failure.problem as ProblemDetails : { status: 0, type: 'about:blank', title: 'Network Error', detail: 'Could not load claim detail.' };
        if (!cancelled) setState({ owner, detail: null, loading: false, error: problem });
      }
    });
    return () => { cancelled = true; };
  }, [claimNumber, token, verified, isLoading, owner, attempt]);
  const current = state?.owner === owner ? state : null;
  return { detail: current?.detail ?? null, loading: isLoading || !current || current.loading, error: current?.error ?? null, retry: () => setAttempt((value) => value + 1) };
}

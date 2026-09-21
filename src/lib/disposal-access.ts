'use client';

/**
 * Visitor access to a disposal task.
 *
 * The token is the only thing standing between a stranger and another person's
 * private evidence photos, so where it is read from matters:
 *
 *  - `sessionStorage`, keyed by task id, so returning within the tab works with
 *    no URL surface at all.
 *  - The URL **fragment** (`#token=…`) for a link that arrives from elsewhere,
 *    such as a confirmation email. A fragment is never sent to a server and never
 *    written to an access log, unlike a query string — which matters when the
 *    value is a bearer credential.
 *
 * A token found in the fragment is immediately moved into sessionStorage and the
 * fragment is cleared from the address bar, so it does not linger in history.
 */

const STORAGE_PREFIX = 'koi_disposal_access:';
const FRAGMENT_KEY = 'token=';
const MIN_TOKEN_LENGTH = 32;

interface StoredAccess {
  token: string;
  savedAt: string;
}

function storageKey(taskId: string): string {
  return `${STORAGE_PREFIX}${taskId}`;
}

export function saveDisposalToken(taskId: string, token: string): void {
  if (typeof window === 'undefined') return;
  const record: StoredAccess = { token, savedAt: new Date().toISOString() };
  try {
    sessionStorage.setItem(storageKey(taskId), JSON.stringify(record));
  } catch {
    // A full or blocked sessionStorage is not fatal: the token still lives in
    // the URL fragment for this visit.
  }
}

export function readDisposalToken(taskId: string): string | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(storageKey(taskId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredAccess>;
    return typeof parsed.token === 'string' && parsed.token.length >= MIN_TOKEN_LENGTH
      ? parsed.token
      : null;
  } catch {
    return null;
  }
}

/**
 * Reads a token out of the URL fragment and consumes it.
 *
 * Accepts both `#token=<value>` and a bare `#<value>` so a link can be short.
 * The fragment is replaced with history rather than pushed, so the back button
 * does not walk onto a URL that still carries the credential.
 */
export function consumeTokenFromFragment(): string | null {
  if (typeof window === 'undefined') return null;
  const fragment = window.location.hash.replace(/^#/, '');
  if (!fragment) return null;

  const token = fragment.startsWith(FRAGMENT_KEY)
    ? fragment.slice(FRAGMENT_KEY.length)
    : fragment;
  if (token.length < MIN_TOKEN_LENGTH) return null;

  const { pathname, search } = window.location;
  window.history.replaceState(null, '', `${pathname}${search}`);
  return token;
}

/**
 * Resolves the token for a task: a stored one first, then the fragment (which is
 * persisted on the way through).
 */
export function resolveDisposalToken(taskId: string): string | null {
  const stored = readDisposalToken(taskId);
  if (stored) return stored;
  const fromFragment = consumeTokenFromFragment();
  if (!fromFragment) return null;
  saveDisposalToken(taskId, fromFragment);
  return fromFragment;
}

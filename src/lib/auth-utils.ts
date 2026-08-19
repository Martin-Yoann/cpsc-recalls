// ============================================================
// KOI Recall Platform — Auth Utilities (Phase 2, Neon-backed)
// Bridges the consumer auth API (/v1/consumer-auth) to the app's User type.
// Token + cached user are persisted in localStorage so reloads stay logged in;
// the token is revalidated against GET /me on app boot.
// ============================================================

import type { User, RegisterData } from '@/types/auth';

const STORAGE_KEY = 'koi_auth_user';

const LOCAL_API_BASE = 'http://localhost:3002';
const ONLINE_API_BASE = 'https://koi-recall-backend.vercel.app';

const configuredApi = (process.env.NEXT_PUBLIC_API_URL || '').trim().replace(/\/+$/, '');
const PRIMARY_API_BASE = configuredApi || LOCAL_API_BASE;
const isLocalPrimary = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(PRIMARY_API_BASE);
// Same transparent fallback as api-client.ts: local first, then online when the
// local backend isn't running (client-side auth calls hit this too).
const API_BASES: string[] =
  isLocalPrimary && PRIMARY_API_BASE !== ONLINE_API_BASE
    ? [PRIMARY_API_BASE, ONLINE_API_BASE]
    : [PRIMARY_API_BASE];

// ── API response shapes ──

interface ConsumerPublic {
  consumerUserId: string;
  email: string;
  displayName: string;
  avatarDataUrl: string | null;
  createdAt: string;
}

interface AuthSessionResponse {
  token: string;
  sessionId: string;
  expiresAt: string;
  user: ConsumerPublic;
}

// ── LocalStorage persistence ──

export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function storeUser(user: User): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function removeStoredUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}

function getToken(): string | null {
  return getStoredUser()?.token ?? null;
}

// ── Mapping ──

function mapUser(session: AuthSessionResponse, phone = ''): User {
  return {
    id: session.user.consumerUserId,
    email: session.user.email,
    name: session.user.displayName,
    phone,
    createdAt: session.user.createdAt,
    avatarDataUrl: session.user.avatarDataUrl,
    token: session.token,
    expiresAt: session.expiresAt,
  };
}

// ── API helpers ──

type AuthResult<T> = { ok: true; data: T } | { ok: false; status: number; detail: string };

async function authFetch<T>(path: string, init: RequestInit): Promise<AuthResult<T>> {
  for (const base of API_BASES) {
    try {
      const res = await fetch(`${base}${path}`, init);
      if (res.ok) return { ok: true, data: (await res.json()) as T };
      const errBody = await res.json().catch(() => null);
      return { ok: false, status: res.status, detail: errBody?.detail ?? `Request failed (${res.status})` };
    } catch {
      // Network error (e.g. local backend not running) — try the next base.
    }
  }
  return { ok: false, status: 0, detail: 'Cannot reach the server. Is the backend running?' };
}

async function postJson<T>(path: string, body: unknown, token?: string): Promise<AuthResult<T>> {
  return authFetch<T>(path, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });
}

async function patchJson<T>(path: string, body: unknown, token: string): Promise<AuthResult<T>> {
  return authFetch<T>(path, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(body),
  });
}

async function getJson<T>(path: string, token: string): Promise<AuthResult<T>> {
  return authFetch<T>(path, {
    headers: { Authorization: `Bearer ${token}` },
  });
}

// ── Auth actions ──

export async function login(email: string, password: string): Promise<User | null> {
  const result = await postJson<AuthSessionResponse>('/v1/consumer-auth/login', { email, password });
  if (!result.ok) return null;
  const user = mapUser(result.data);
  storeUser(user);
  return user;
}

export async function register(data: RegisterData): Promise<User | null> {
  const result = await postJson<AuthSessionResponse>('/v1/consumer-auth/register', {
    email: data.email,
    password: data.password,
    displayName: data.name,
  });
  if (!result.ok) return null;
  const user = mapUser(result.data, data.phone);
  storeUser(user);
  return user;
}

export async function logout(): Promise<void> {
  const token = getToken();
  if (token) {
    await postJson('/v1/consumer-auth/logout', {}, token).catch(() => {});
  }
  removeStoredUser();
}

/** Revalidate the stored token against GET /me; returns fresh user or null. */
export async function refreshSession(): Promise<User | null> {
  const stored = getStoredUser();
  if (!stored?.token) return null;
  if (stored.expiresAt && new Date(stored.expiresAt).getTime() < Date.now()) {
    removeStoredUser();
    return null;
  }
  const result = await getJson<{ user: ConsumerPublic }>('/v1/consumer-auth/me', stored.token);
  if (!result.ok) {
    removeStoredUser();
    return null;
  }
  const refreshed: User = {
    ...stored,
    id: result.data.user.consumerUserId,
    email: result.data.user.email,
    name: result.data.user.displayName,
    avatarDataUrl: result.data.user.avatarDataUrl,
    createdAt: result.data.user.createdAt,
  };
  storeUser(refreshed);
  return refreshed;
}

/** Update display name and/or avatar via PATCH /me; returns refreshed user or null. */
export async function updateProfile(updates: {
  displayName?: string;
  avatarDataUrl?: string | null;
}): Promise<User | null> {
  const stored = getStoredUser();
  if (!stored?.token) return null;
  const result = await patchJson<{ user: ConsumerPublic }>('/v1/consumer-auth/me', updates, stored.token);
  if (!result.ok) return null;
  const refreshed: User = {
    ...stored,
    name: result.data.user.displayName,
    avatarDataUrl: result.data.user.avatarDataUrl,
  };
  storeUser(refreshed);
  return refreshed;
}

// ── Validation (used by login/register forms) ──

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): boolean {
  // Backend enforces ≥ 12 characters (scrypt policy shared with staff accounts)
  return password.length >= 12;
}

export function validatePhone(phone: string): boolean {
  return phone.length === 0 || /^1[3-9]\d{9}$/.test(phone) || /^\+?[0-9\s\-()]{7,20}$/.test(phone);
}

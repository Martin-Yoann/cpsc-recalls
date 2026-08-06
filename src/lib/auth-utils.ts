// ============================================================
// KOI Recall Platform — Auth Utilities
// ============================================================

import type { User, RegisterData } from '@/types/auth';
import { findUserByEmail, mockUsers } from '@/data/mock-users';

const STORAGE_KEY = 'koi_auth_user';

// === LocalStorage persistence ===
export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function storeUser(user: User): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function removeStoredUser(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// === Auth actions ===
export function login(email: string, password: string): User | null {
  const user = findUserByEmail(email);
  if (!user) return null;
  if (user.password !== password) return null;
  const { password: _, ...safeUser } = user;
  storeUser(safeUser);
  return safeUser;
}

export function register(data: RegisterData): User | null {
  const existing = findUserByEmail(data.email);
  if (existing) return null;

  const newUser = {
    id: `u_${Date.now()}`,
    email: data.email,
    password: data.password,
    name: data.name,
    phone: data.phone,
    createdAt: new Date().toISOString(),
  };

  // In real app this would be a server call
  mockUsers.push(newUser);

  const { password: _, ...safeUser } = newUser;
  storeUser(safeUser);
  return safeUser;
}

export function logout(): void {
  removeStoredUser();
}

// === Validation ===
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validatePassword(password: string): boolean {
  return password.length >= 6;
}

export function validatePhone(phone: string): boolean {
  return /^1[3-9]\d{9}$/.test(phone);
}

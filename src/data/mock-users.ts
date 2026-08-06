// ============================================================
// KOI Recall Platform — Mock Users
// ============================================================

import type { User } from '@/types/auth';

export const mockUsers: (User & { password: string })[] = [
  {
    id: 'u_001',
    email: 'sarah.chen@email.com',
    password: '123456',
    name: 'Sarah Chen',
    phone: '13812341234',
    createdAt: '2025-12-14T08:30:00Z',
  },
  {
    id: 'u_002',
    email: 'emily.davis@email.com',
    password: 'recall2025',
    name: 'Emily Davis',
    phone: '13956785678',
    createdAt: '2025-12-18T14:20:00Z',
  },
  {
    id: 'u_003',
    email: 'jwilson@email.com',
    password: 'mypassword',
    name: 'James Wilson',
    phone: '18611223344',
    createdAt: '2026-01-25T10:15:00Z',
  },
];

export function findUserByEmail(email: string) {
  return mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export function findUserById(id: string) {
  return mockUsers.find((u) => u.id === id);
}

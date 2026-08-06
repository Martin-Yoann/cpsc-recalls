// ============================================================
// KOI Recall Platform — Mock Orders
// Music Lollipop related purchases
// ============================================================

import type { BoundOrder } from '@/types/auth';

export const mockOrders: BoundOrder[] = [
  {
    id: 'ord_001',
    userId: 'u_001',
    orderNumber: 'AMZ-2025-07821',
    productName: 'Candy Master Music Lollipop — Bear — Peach',
    retailerName: 'Amazon',
    purchaseDate: '2024-08-15',
    purchaseAmount: 5.99,
    claimId: 'cl_001',
    boundAt: '2025-12-15T09:00:00Z',
  },
  {
    id: 'ord_002',
    userId: 'u_001',
    orderNumber: 'WM-2025-11209',
    productName: 'Candy Master Music Lollipop — Dinosaur — Strawberry',
    retailerName: 'Walmart',
    purchaseDate: '2024-10-22',
    purchaseAmount: 4.99,
    boundAt: '2025-12-20T16:00:00Z',
  },
  {
    id: 'ord_003',
    userId: 'u_002',
    orderNumber: 'TG-2025-03456',
    productName: 'Candy Master Music Lollipop — Strawberry — Strawberry',
    retailerName: 'Target',
    purchaseDate: '2024-09-08',
    purchaseAmount: 3.99,
    claimId: 'cl_003',
    boundAt: '2025-12-20T08:30:00Z',
  },
  {
    id: 'ord_004',
    userId: 'u_002',
    orderNumber: 'CVS-2025-08912',
    productName: 'Candy Master Music Lollipop — Bear — Peach',
    retailerName: 'CVS',
    purchaseDate: '2024-11-15',
    purchaseAmount: 5.49,
    boundAt: '2026-01-05T14:00:00Z',
  },
  {
    id: 'ord_005',
    userId: 'u_003',
    orderNumber: 'KR-2025-15500',
    productName: 'Candy Master Music Lollipop — Heart — Peach',
    retailerName: 'Kroger',
    purchaseDate: '2024-12-20',
    purchaseAmount: 4.49,
    claimId: 'cl_004',
    boundAt: '2026-01-28T16:00:00Z',
  },
];

export function getOrdersByUserId(userId: string): BoundOrder[] {
  return mockOrders.filter((o) => o.userId === userId);
}

export function getOrderById(orderId: string): BoundOrder | undefined {
  return mockOrders.find((o) => o.id === orderId);
}

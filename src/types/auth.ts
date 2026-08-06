// ============================================================
// KOI Recall Platform — Auth Types
// ============================================================

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  createdAt: string;
}

export interface BoundOrder {
  id: string;
  userId: string;
  orderNumber: string;
  productName: string;
  retailerName: string;
  purchaseDate: string;
  purchaseAmount: number;
  claimId?: string;
  boundAt: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

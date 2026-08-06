'use client';

// ============================================================
// KOI Recall Platform — Linked Orders Page
// ============================================================

import Link from 'next/link';
import { Package, Plus, ShoppingBag, Calendar, Store, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/shared/status-badge';
import { useAuth } from '@/lib/auth-context';
import { getOrdersByUserId } from '@/data/mock-orders';
import { getClaimByNumber } from '@/data/mock-claims';

export default function OrdersPage() {
  const { user } = useAuth();
  const orders = user ? getOrdersByUserId(user.id) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Linked Orders</h1>
          <p className="text-sm text-text-secondary mt-1">
            {orders.length} order{orders.length !== 1 ? 's' : ''} &middot; Link your purchases to automatically track recall status
          </p>
        </div>
        <Button className="bg-brand-teal hover:bg-blade-resolution-dark text-white">
          <Plus className="mr-1.5 h-4 w-4" />
          Link New Order
        </Button>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((order) => {
            const claim = order.claimId ? getClaimByNumber(order.claimId) : undefined;
            return (
              <div
                key={order.id}
                className="rounded-xl border bg-surface-elevated p-5 space-y-4"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-surface-secondary">
                        <ShoppingBag className="h-4.5 w-4.5 text-text-tertiary" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary">{order.productName}</p>
                        <p className="text-xs text-text-secondary font-mono">Order #: {order.orderNumber}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-text-primary">${order.purchaseAmount.toFixed(2)}</p>
                    <p className="text-xs text-text-tertiary">{order.retailerName}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-text-tertiary">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Purchase Date: {order.purchaseDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <Store className="h-3 w-3" />
                    {order.retailerName}
                  </span>
                </div>

                {/* Associated claim */}
                {claim && (
                  <Link
                    href={`/dashboard/claims/${claim.claimNumber}`}
                    className="flex items-center justify-between p-3 rounded-lg bg-blade-resolution-light/30 border border-brand-teal/20 hover:border-brand-teal/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-teal/10">
                        <ExternalLink className="h-4 w-4 text-brand-teal" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-text-primary font-mono">{claim.claimNumber}</p>
                        <p className="text-xs text-text-secondary">Associated Claim</p>
                      </div>
                    </div>
                    <StatusBadge variant={claim.status as 'submitted' | 'under_review' | 'verified' | 'remedy_issued' | 'resolved' | 'rejected'} />
                  </Link>
                )}

                {!claim && (
                  <div className="p-3 rounded-lg bg-blade-safety-light/30 border border-orange-200 text-sm text-blade-safety-text flex items-center gap-2">
                    <Package className="h-4 w-4 shrink-0" />
                    This product has an active recall — we recommend filing a claim immediately.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-xl border bg-surface-elevated p-10 text-center">
          <ShoppingBag className="h-10 w-10 mx-auto text-text-tertiary mb-3" />
          <h3 className="text-base font-semibold text-text-primary mb-1">No Linked Orders</h3>
          <p className="text-sm text-text-secondary mb-4">Link your purchase orders to automatically match them with relevant product recall information.</p>
          <Button className="bg-brand-teal hover:bg-blade-resolution-dark text-white">
            <Plus className="mr-1.5 h-4 w-4" />
            Link New Order
          </Button>
        </div>
      )}
    </div>
  );
}

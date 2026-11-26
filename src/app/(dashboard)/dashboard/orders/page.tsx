'use client';
import { useI18n } from "@/lib/i18n/provider";


import Link from 'next/link';
import { Package, Plus, ShoppingBag, Calendar, Store, ExternalLink } from 'lucide-react';
import { StatusBadge } from '@/components/shared/status-badge';
import { useAuth } from '@/lib/auth-context';
import { getOrdersByUserId } from '@/data/mock-orders';
import { getClaimByNumber } from '@/lib/shared-claims-store';
import { DEMO_MODE } from '@/lib/demo-mode';

export default function OrdersPage() {
  const { t } = useI18n();
  const { user } = useAuth();
  // Design §9/§14: mock orders and the legacy shared store are demo-only.
  const orders = DEMO_MODE && user ? getOrdersByUserId(user.id) : [];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="label-eyebrow text-brand">{t(DEMO_MODE ? "ui.linked.orders.demo.data.9624ab" : "ui.linked.orders.d284cf")}</p>
          <h1 className="mt-2 text-[28px] leading-tight font-bold text-foreground">
            {t("ui.linked.orders.d284cf")}</h1>
          <p className="mt-1 text-secondary">
            {orders.length} {t("count.order.one")}{" "}{t(orders.length !== 1 ? 's' : '')} {t("ui.link.your.purchases.to.automatically.track.recall.63e216")}</p>
        </div>
        {DEMO_MODE && (
          <button className="btn-brand">
            <Plus className="h-4 w-4" />
            {t("ui.link.new.order.f3a99c")}</button>
        )}
      </div>

      {!DEMO_MODE ? (
        <div className="card-surface p-10 text-center">
          <Package className="h-10 w-10 mx-auto text-secondary mb-3" />
          <h3 className="text-base font-semibold text-foreground mb-1">{t("ui.no.linked.orders.d977f9")}</h3>
          <p className="text-sm text-secondary mb-5 max-w-md mx-auto">
            {t("ui.order.linking.is.not.part.of.the.1ce205")}</p>
          <Link href="/lookup" className="btn-dark inline-flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            {t("ui.check.claim.status.cf5234")}</Link>
        </div>
      ) : orders.length > 0? (
        <div className="space-y-3">
          {orders.map((order) => {
            const claim = order.claimId ? getClaimByNumber(order.claimId) : undefined;
            return (
              <div key={order.id} className="card-surface p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-surface-dim text-foreground">
                      <ShoppingBag className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-foreground truncate">{order.productName}</p>
                      <p className="text-xs text-secondary font-mono">{t("ui.order.3e8c4e")}{" "}{order.orderNumber}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-foreground">${order.purchaseAmount.toFixed(2)}</p>
                    <p className="text-xs text-secondary">{order.retailerName}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-secondary">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" />
                    {t("ui.purchase.date.44c49c")}{" "}{order.purchaseDate}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Store className="h-3 w-3" />
                    {order.retailerName}
                  </span>
                </div>

                {claim && (
                  <Link
                    href={`/dashboard/claims/${claim.claimNumber}`}
                    className="flex items-center justify-between p-3 rounded-md bg-surface-dim hover:bg-surface-dim-strong transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-foreground text-white">
                        <ExternalLink className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground font-mono">{claim.claimNumber}</p>
                        <p className="text-xs text-secondary">{t("ui.associated.claim.c47f10")}</p>
                      </div>
                    </div>
                    <StatusBadge variant={claim.status as 'submitted' | 'under_review' | 'verified' | 'remedy_issued' | 'resolved' | 'rejected'} />
                  </Link>
                )}

                {!claim && (
                  <div className="p-3 rounded-md bg-brand-light border border-brand/20 text-sm text-brand flex items-center gap-2">
                    <Package className="h-4 w-4 shrink-0" />
                    {t("ui.this.product.has.an.active.recall.we.d03839")}</div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card-surface p-10 text-center">
          <ShoppingBag className="h-10 w-10 mx-auto text-secondary mb-3" />
          <h3 className="text-base font-semibold text-foreground mb-1">{t("ui.no.linked.orders.bdc741")}</h3>
          <p className="text-sm text-secondary mb-5 max-w-md mx-auto">
            {t("ui.link.your.purchase.orders.to.automatically.match.1b38ee")}</p>
          <button className="btn-brand">
            <Plus className="h-4 w-4" />
            {t("ui.link.new.order.f3a99c")}</button>
        </div>
      )}
    </div>
  );
}

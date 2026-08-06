// ============================================================
// KOI Recall Platform — Product Identity Card v3.0
// Shows shapes, flavors, lots, and package identifiers
// ============================================================

import { Barcode, Calendar, Factory, Store, Package, Candy, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { Product } from '@/types';

interface ProductIdentityCardProps {
  product: Product;
  affectedLots?: string[];
  dateCodes?: string[];
}

export function ProductIdentityCard({ product, affectedLots, dateCodes }: ProductIdentityCardProps) {
  return (
    <div className="rounded-2xl border bg-surface-elevated shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 sm:px-6 py-4 sm:py-5 border-b bg-surface-secondary/50">
        <div className="flex items-start gap-4">
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-24 h-24 sm:w-28 sm:h-28 object-contain rounded-xl bg-surface-elevated border shrink-0"
            />
          )}
          <div>
            <h3 className="text-base font-bold text-text-primary flex items-center gap-2">
              <Package className="h-5 w-5 text-blade-safety" />
              {product.name}
            </h3>
            <p className="text-sm text-text-secondary mt-1">{product.brandName} · {product.weight}</p>
          </div>
        </div>
      </div>

      {/* Product details grid */}
      <div className="p-5 sm:p-6">
        <div className="grid sm:grid-cols-2 gap-x-8 gap-y-5">
          {/* Shapes */}
          {product.shapes && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-1">
                <Candy className="h-3 w-3" />
                Candy Shapes
              </label>
              <div className="flex flex-wrap gap-1.5">
                {product.shapes.map((shape) => (
                  <Badge key={shape} variant="secondary" className="font-medium text-xs">
                    {shape}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Flavors */}
          {product.flavors && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Flavors
              </label>
              <div className="flex flex-wrap gap-1.5">
                {product.flavors.map((flavor) => (
                  <Badge key={flavor} variant="secondary" className="font-medium text-xs">
                    {flavor}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Affected Lots */}
          {affectedLots && affectedLots.length > 0 && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-1">
                <Barcode className="h-3 w-3" />
                Affected Lot Codes
              </label>
              <p className="text-sm font-mono font-semibold text-blade-safety bg-blade-safety-light rounded-md px-3 py-2 border border-blade-safety-medium/30">
                {affectedLots.join(' · ')}
              </p>
            </div>
          )}

          {/* Date Codes */}
          {dateCodes && dateCodes.length > 0 && (
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Affected Date Codes
              </label>
              <p className="text-sm font-mono font-semibold text-text-primary bg-surface-secondary rounded-md px-3 py-2 border">
                {dateCodes.join(' · ')}
              </p>
            </div>
          )}

          {/* UPC */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-1">
              <Barcode className="h-3 w-3" />
              UPC Code
            </label>
            <p className="text-sm font-mono font-semibold text-text-primary bg-surface-secondary rounded-md px-3 py-2 border">
              {product.upc}
            </p>
          </div>

          {/* Manufacture Dates */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              Manufacture Date Range
            </label>
            <p className="text-sm font-mono font-semibold text-text-primary bg-surface-secondary rounded-md px-3 py-2 border">
              {product.manufactureDateStart} — {product.manufactureDateEnd}
            </p>
          </div>
        </div>

        {/* Retailers */}
        <div className="mt-5 pt-4 border-t">
          <label className="text-[10px] font-bold text-text-tertiary uppercase tracking-widest flex items-center gap-1 mb-2">
            <Store className="h-3 w-3" />
            Sold At
          </label>
          <div className="flex flex-wrap gap-1.5">
            {product.retailerNames.map((retailer) => (
              <Badge key={retailer} variant="secondary" className="font-medium text-xs">
                {retailer}
              </Badge>
            ))}
          </div>
        </div>

        {/* Description */}
        <div className="mt-5 pt-4 border-t">
          <p className="text-sm text-text-secondary leading-relaxed">
            {product.description}
          </p>
        </div>
      </div>
    </div>
  );
}

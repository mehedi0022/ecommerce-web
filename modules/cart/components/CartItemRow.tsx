"use client";

import Link from "next/link";
import { useState } from "react";
import { Trash2, Plus, Minus, AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import type { CartItem } from "../cart.types";

interface CartItemRowProps {
  item: CartItem;
  onUpdateQuantity: (itemId: number, quantity: number) => Promise<void>;
  onRemove: (itemId: number) => Promise<void>;
}

export function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
}: CartItemRowProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  const primaryImage =
    item.product.images?.find((img) => img.isPrimary) ??
    item.product.images?.[0];

  const maxAvailable = Math.max(1, item.inventory?.availableQuantity ?? 99);
  const isOutOfStock = !item.isAvailable || item.inventory?.availableQuantity <= 0;

  const handleDecrease = async () => {
    if (item.quantity <= 1 || isUpdating) return;
    setIsUpdating(true);
    try {
      await onUpdateQuantity(item.id, item.quantity - 1);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleIncrease = async () => {
    if (item.quantity >= maxAvailable || isUpdating) return;
    setIsUpdating(true);
    try {
      await onUpdateQuantity(item.id, item.quantity + 1);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    if (isRemoving) return;
    setIsRemoving(true);
    try {
      await onRemove(item.id);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200 sm:flex-row sm:items-center sm:gap-6",
        (isUpdating || isRemoving) && "opacity-60 pointer-events-none"
      )}
    >
      {/* ── Product Thumbnail ────────────────────────────────────────────── */}
      <Link
        href={`/products/${item.product.slug}`}
        className="relative size-20 shrink-0 overflow-hidden rounded-lg border bg-muted/40 sm:size-24"
      >
        {primaryImage ? (
          <img
            src={mediaUrl(primaryImage.imageUrl)}
            alt={primaryImage.altText ?? item.product.name}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-gradient-to-br from-muted to-muted/80 text-xs font-semibold text-muted-foreground uppercase">
            {item.product.name.slice(0, 2)}
          </div>
        )}
      </Link>

      {/* ── Info & Details ──────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col justify-between gap-2">
        <div>
          <Link
            href={`/products/${item.product.slug}`}
            className="font-medium text-foreground transition-colors hover:text-primary line-clamp-1 text-base sm:text-lg"
          >
            {item.product.name}
          </Link>

          {/* Variant Attribute Badges */}
          {item.variant.attributes?.length > 0 && (
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              {item.variant.attributes.map((attr, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 text-xs font-medium text-foreground/80"
                >
                  <span className="text-muted-foreground mr-1">{attr.attribute}:</span>
                  {attr.value}
                </span>
              ))}
              {item.variant.sku && (
                <span className="text-[11px] text-muted-foreground/60 hidden sm:inline ml-1">
                  SKU: {item.variant.sku}
                </span>
              )}
            </div>
          )}

          {/* Out of stock or inventory warning */}
          {isOutOfStock && (
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-destructive">
              <AlertCircle className="size-3.5" />
              <span>
                {item.availabilityIssue === "INSUFFICIENT_STOCK"
                  ? `Only ${item.inventory.availableQuantity} available`
                  : "Currently unavailable"}
              </span>
            </div>
          )}
        </div>

        {/* Unit Price */}
        <p className="text-xs text-muted-foreground">
          ৳{Number(item.variant.price).toFixed(2)} each
        </p>
      </div>

      {/* ── Actions: Stepper, Subtotal, Remove ────────────────────────────── */}
      <div className="flex items-center justify-between sm:flex-col sm:items-end sm:gap-3">
        {/* Quantity Stepper */}
        <div className="flex items-center rounded-lg border border-border bg-background shadow-xs">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={item.quantity <= 1 || isUpdating}
            aria-label="Decrease quantity"
            className="flex size-8 items-center justify-center rounded-l-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
          >
            <Minus className="size-3.5" />
          </button>

          <span className="flex min-w-9 items-center justify-center text-xs font-semibold">
            {isUpdating ? (
              <Loader2 className="size-3 animate-spin text-muted-foreground" />
            ) : (
              item.quantity
            )}
          </span>

          <button
            type="button"
            onClick={handleIncrease}
            disabled={item.quantity >= maxAvailable || isUpdating}
            aria-label="Increase quantity"
            className="flex size-8 items-center justify-center rounded-r-lg text-muted-foreground transition hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:pointer-events-none"
          >
            <Plus className="size-3.5" />
          </button>
        </div>

        {/* Line Total & Remove */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="block text-base font-bold text-foreground sm:text-lg">
              ৳{Number(item.lineTotal).toFixed(2)}
            </span>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            disabled={isRemoving}
            aria-label="Remove item"
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive disabled:opacity-40"
            title="Remove item"
          >
            {isRemoving ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Trash2 className="size-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}


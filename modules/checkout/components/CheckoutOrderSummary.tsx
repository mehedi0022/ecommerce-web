"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  ShoppingBag,
  ShieldCheck,
  Lock,
  Loader2,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import type { CartItem, CartSummary } from "@/modules/cart/cart.types";

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  summary: CartSummary;
  shippingFee: number;
  couponCode?: string;
  discountAmount?: number;
  onApplyCoupon: (code: string) => Promise<boolean>;
  onRemoveCoupon: () => void;
  onPlaceOrder: () => Promise<void>;
  isSubmitting?: boolean;
}

export function CheckoutOrderSummary({
  items,
  summary,
  shippingFee,
  couponCode,
  discountAmount = 0,
  onApplyCoupon,
  onRemoveCoupon,
  onPlaceOrder,
  isSubmitting = false,
}: CheckoutOrderSummaryProps) {
  const [showItems, setShowItems] = useState(false);
  const [inputCoupon, setInputCoupon] = useState("");
  const [isApplying, setIsApplying] = useState(false);

  const subtotal = Number(summary.subtotal || "0");
  const actualDiscount = Math.min(subtotal, Math.max(0, discountAmount));
  const grandTotal = Math.max(0, subtotal + shippingFee - actualDiscount);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputCoupon.trim().toUpperCase();
    if (!trimmed) return;
    setIsApplying(true);
    try {
      const ok = await onApplyCoupon(trimmed);
      if (ok) {
        setInputCoupon("");
      }
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          Order Summary
        </h2>
        <span className="text-xs text-muted-foreground font-medium">
          {summary.itemCount} {summary.itemCount === 1 ? "item" : "items"}
        </span>
      </div>

      {/* ── Collapsible Items List ───────────────────────────────────────── */}
      <div className="mt-4 border-y py-3">
        <button
          type="button"
          onClick={() => setShowItems(!showItems)}
          className="flex w-full items-center justify-between text-xs font-semibold text-foreground transition hover:text-primary"
        >
          <span className="flex items-center gap-1.5">
            <ShoppingBag className="size-3.5 text-muted-foreground" />
            {showItems ? "Hide item details" : "View item details"}
          </span>
          {showItems ? (
            <ChevronUp className="size-4" />
          ) : (
            <ChevronDown className="size-4" />
          )}
        </button>

        {showItems && (
          <div className="mt-3 space-y-3 pt-2">
            {items.map((item) => {
              const img =
                item.product.images?.find((i) => i.isPrimary) ??
                item.product.images?.[0];
              return (
                <div key={item.id} className="flex items-center gap-3">
                  <div className="relative size-12 shrink-0 overflow-hidden rounded-md border bg-muted/40">
                    {img ? (
                      <img
                        src={mediaUrl(img.imageUrl)}
                        alt={img.altText ?? item.product.name}
                        className="size-full object-cover"
                      />
                    ) : (
                      <div className="flex size-full items-center justify-center text-[10px] font-bold text-muted-foreground uppercase">
                        {item.product.name.slice(0, 2)}
                      </div>
                    )}
                    <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-foreground text-[9px] font-bold text-background shadow-xs">
                      {item.quantity}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">
                      {item.product.name}
                    </p>
                    {item.variant.attributes?.length > 0 && (
                      <p className="text-[11px] text-muted-foreground truncate">
                        {item.variant.attributes
                          .map((a) => `${a.attribute}: ${a.value}`)
                          .join(", ")}
                      </p>
                    )}
                  </div>

                  <span className="text-xs font-semibold text-foreground shrink-0">
                    ৳{Number(item.lineTotal).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Subtotal Breakdown ──────────────────────────────────────────── */}
      <div className="mt-4 space-y-2.5 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-semibold text-foreground">
            ৳{subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium text-foreground">
            {shippingFee === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                FREE
              </span>
            ) : (
              `৳${shippingFee.toFixed(2)}`
            )}
          </span>
        </div>

        {couponCode && actualDiscount > 0 && (
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="flex items-center gap-1">
              <Tag className="size-3.5" /> Coupon ({couponCode})
            </span>
            <span>-৳{actualDiscount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-muted-foreground text-xs">
          <span>Estimated Tax</span>
          <span>৳0.00</span>
        </div>
      </div>

      {/* ── Promo Code ──────────────────────────────────────────────────── */}
      <div className="mt-4 pt-3 border-t border-dashed">
        {couponCode ? (
          <div className="flex items-center justify-between rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-3.5" />
              Code {couponCode} applied (-৳{actualDiscount.toFixed(2)})
            </span>
            <button
              type="button"
              onClick={onRemoveCoupon}
              className="text-xs text-muted-foreground hover:text-destructive underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <form onSubmit={handleApply} className="flex gap-2">
            <Input
              type="text"
              placeholder="Promo or coupon code"
              value={inputCoupon}
              onChange={(e) => setInputCoupon(e.target.value)}
              className="h-9 text-xs"
            />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={!inputCoupon.trim() || isApplying}
              className="h-9 shrink-0 text-xs font-semibold px-3"
            >
              {isApplying ? "Applying..." : "Apply"}
            </Button>
          </form>
        )}
      </div>

      <Separator className="my-5" />

      {/* ── Grand Total ─────────────────────────────────────────────────── */}
      <div className="flex items-baseline justify-between">
        <span className="text-base font-bold text-foreground">Total to Pay</span>
        <div className="text-right">
          <span className="text-2xl font-black text-foreground">
            ৳{grandTotal.toFixed(2)}
          </span>
          <p className="text-[11px] text-muted-foreground">
            All taxes & delivery fees included
          </p>
        </div>
      </div>

      {/* ── Place Order CTA Button ──────────────────────────────────────── */}
      <div className="mt-6 space-y-3">
        <Button
          type="button"
          size="lg"
          onClick={onPlaceOrder}
          disabled={isSubmitting || items.length === 0}
          className="w-full h-12 text-base font-bold gap-2 shadow-sm transition-all"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-5 animate-spin" />
              Processing Order...
            </>
          ) : (
            <>
              <Lock className="size-4" />
              Place Order (৳{grandTotal.toFixed(2)})
            </>
          )}
        </Button>

        <p className="text-center text-[11px] text-muted-foreground">
          By clicking Place Order, you agree to our{" "}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      {/* ── Security Badge ──────────────────────────────────────────────── */}
      <div className="mt-5 flex items-center justify-center gap-2 rounded-lg bg-muted/40 p-2 text-center text-xs text-muted-foreground border">
        <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400" />
        <span>256-bit encrypted secure checkout</span>
      </div>
    </div>
  );
}


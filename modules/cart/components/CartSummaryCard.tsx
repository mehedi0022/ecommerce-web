"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Tag,
  CheckCircle2,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { CartSummary } from "../cart.types";

const FREE_SHIPPING_THRESHOLD = 50.0;
const STANDARD_SHIPPING_COST = 5.0;

interface CartSummaryCardProps {
  summary: CartSummary;
  hasUnavailableItems?: boolean;
}

export function CartSummaryCard({
  summary,
  hasUnavailableItems = false,
}: CartSummaryCardProps) {
  const [couponCode, setCouponCode] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  const subtotal = Number(summary.subtotal || "0");
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingFee =
    isFreeShipping || subtotal === 0 ? 0 : STANDARD_SHIPPING_COST;
  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotal,
  );
  const progressPercent = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100),
  );

  const discountAmount = appliedCoupon ? subtotal * 0.1 : 0; // 10% demo discount
  const finalTotal = Math.max(0, subtotal + shippingFee - discountAmount);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setTimeout(() => {
      setAppliedCoupon(couponCode.trim().toUpperCase());
      setIsApplyingCoupon(false);
    }, 600);
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-xs">
      <h2 className="text-xl font-bold tracking-tight text-foreground">
        Order Summary
      </h2>

      {/* ── Free Shipping Progress Bar ──────────────────────────────────── */}
      <div className="mt-4 rounded-xl bg-muted/60 p-3.5 border border-border/50">
        <div className="flex items-center justify-between text-xs font-medium">
          <span className="flex items-center gap-1.5 text-foreground">
            <Truck className="size-4 text-primary" />
            {isFreeShipping ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                You&apos;ve unlocked Free Shipping!
              </span>
            ) : (
              <span>
                Add{" "}
                <strong className="text-primary">
                  ${remainingForFreeShipping.toFixed(2)}
                </strong>{" "}
                more for free shipping
              </span>
            )}
          </span>
          <span className="text-muted-foreground">{progressPercent}%</span>
        </div>

        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isFreeShipping ? "bg-emerald-500" : "bg-primary",
            )}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* ── Subtotal & Line items ───────────────────────────────────────── */}
      <div className="mt-6 space-y-3 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">
            Subtotal ({summary.itemCount}{" "}
            {summary.itemCount === 1 ? "item" : "items"})
          </span>
          <span className="font-semibold text-foreground">
            ${subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Estimated Shipping</span>
          <span className="font-medium">
            {isFreeShipping ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                FREE
              </span>
            ) : (
              `$${STANDARD_SHIPPING_COST.toFixed(2)}`
            )}
          </span>
        </div>

        {appliedCoupon && (
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="flex items-center gap-1">
              <Tag className="size-3.5" /> Coupon ({appliedCoupon})
            </span>
            <span>-${discountAmount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-muted-foreground">
          <span>Estimated Tax</span>
          <span className="text-xs">Calculated at checkout</span>
        </div>
      </div>

      {/* ── Promo Code ──────────────────────────────────────────────────── */}
      <div className="mt-5 pt-4 border-t border-dashed">
        {appliedCoupon ? (
          <div className="flex items-center justify-between rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4" />
              Code {appliedCoupon} applied
            </span>
            <button
              type="button"
              onClick={() => setAppliedCoupon(null)}
              className="text-xs text-muted-foreground hover:text-destructive underline"
            >
              Remove
            </button>
          </div>
        ) : (
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <Input
              type="text"
              placeholder="Promo or coupon code"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              className="h-9 text-xs"
            />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={!couponCode.trim() || isApplyingCoupon}
              className="h-9 shrink-0 text-xs font-semibold px-3"
            >
              {isApplyingCoupon ? "Applying..." : "Apply"}
            </Button>
          </form>
        )}
      </div>

      <Separator className="my-5" />

      {/* ── Total ───────────────────────────────────────────────────────── */}
      <div className="flex items-baseline justify-between">
        <span className="text-base font-bold text-foreground">
          Estimated Total
        </span>
        <div className="text-right">
          <span className="text-2xl font-black text-foreground">
            ${finalTotal.toFixed(2)}
          </span>
          <p className="text-[11px] text-muted-foreground">
            USD, taxes & shipping included
          </p>
        </div>
      </div>

      {/* ── Checkout CTA Button ─────────────────────────────────────────── */}
      <div className="mt-6 space-y-2">
        {hasUnavailableItems ? (
          <div className="rounded-lg bg-destructive/10 p-3 text-xs text-destructive text-center font-medium">
            Please remove unavailable items before proceeding.
          </div>
        ) : null}

        <Link
          href="/checkout"
          className={cn(
            buttonVariants({ size: "lg" }),
            "w-full h-12 text-base font-bold gap-2 shadow-sm transition-all",
            hasUnavailableItems && "pointer-events-none opacity-50",
          )}
        >
          Proceed to Checkout
          <ArrowRight className="size-4" />
        </Link>
      </div>

      {/* ── Trust Badges ────────────────────────────────────────────────── */}
      <div className="mt-6 grid grid-cols-3 gap-2 border-t pt-5 text-center text-[11px] text-muted-foreground">
        <div className="flex flex-col items-center gap-1.5">
          <ShieldCheck className="size-4 text-foreground/70" />
          <span>Secure Checkout</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <RotateCcw className="size-4 text-foreground/70" />
          <span>30-Day Returns</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <Truck className="size-4 text-foreground/70" />
          <span>Fast Delivery</span>
        </div>
      </div>
    </div>
  );
}

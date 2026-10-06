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
import { toast } from "sonner";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useValidateCouponMutation } from "@/modules/coupon/couponApi";
import type { CartSummary } from "../cart.types";

interface CartSummaryCardProps {
  summary: CartSummary;
  hasUnavailableItems?: boolean;
}

export function CartSummaryCard({
  summary,
  hasUnavailableItems = false,
}: CartSummaryCardProps) {
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(() => {
    if (typeof window !== "undefined") {
      return sessionStorage.getItem("checkout_coupon_code") || null;
    }
    return null;
  });
  const [discountAmount, setDiscountAmount] = useState<number>(() => {
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("checkout_coupon_discount");
      return saved ? Number(saved) : 0;
    }
    return 0;
  });

  const [validateCoupon, { isLoading: isApplyingCoupon }] =
    useValidateCouponMutation();

  const FREE_SHIPPING_THRESHOLD = 2000; // Free shipping threshold in BDT (৳2000)

  const subtotal = Number(summary.subtotal || "0");
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const remainingForFreeShipping = Math.max(
    0,
    FREE_SHIPPING_THRESHOLD - subtotal,
  );
  const progressPercent = Math.min(
    100,
    Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100),
  );

  const actualDiscount = Math.min(subtotal, Math.max(0, discountAmount));
  const finalTotal = Math.max(0, subtotal - actualDiscount);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = couponInput.trim().toUpperCase();
    if (!trimmed) return;

    try {
      const res = await validateCoupon({ code: trimmed }).unwrap();
      const disc = Number(res.data?.discountAmount || "0");
      setAppliedCoupon(res.data?.code || trimmed);
      setDiscountAmount(disc);
      if (typeof window !== "undefined") {
        sessionStorage.setItem("checkout_coupon_code", res.data?.code || trimmed);
        sessionStorage.setItem("checkout_coupon_discount", String(disc));
      }
      setCouponInput("");
      toast.success(
        res.message || `Coupon ${res.data?.code} applied! Saved ৳${disc.toFixed(2)}`
      );
    } catch (err: any) {
      toast.error(err?.data?.message || err?.message || "Invalid coupon code");
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("checkout_coupon_code");
      sessionStorage.removeItem("checkout_coupon_discount");
    }
    toast.info("Coupon removed");
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
                  ৳{remainingForFreeShipping.toFixed(2)}
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
            ৳{subtotal.toFixed(2)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="text-xs text-muted-foreground">
            Calculated at checkout
          </span>
        </div>

        {appliedCoupon && actualDiscount > 0 && (
          <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-medium">
            <span className="flex items-center gap-1">
              <Tag className="size-3.5" /> Coupon ({appliedCoupon})
            </span>
            <span>-৳{actualDiscount.toFixed(2)}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-muted-foreground">
          <span>Estimated Tax</span>
          <span className="text-xs">৳0.00</span>
        </div>
      </div>

      {/* ── Promo Code ──────────────────────────────────────────────────── */}
      <div className="mt-5 pt-4 border-t border-dashed">
        {appliedCoupon ? (
          <div className="flex items-center justify-between rounded-lg bg-emerald-50 dark:bg-emerald-950/30 px-3 py-2 text-xs font-medium text-emerald-700 dark:text-emerald-300">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="size-4" />
              Code {appliedCoupon} applied (-৳{actualDiscount.toFixed(2)})
            </span>
            <button
              type="button"
              onClick={handleRemoveCoupon}
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
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value)}
              className="h-9 text-xs"
            />
            <Button
              type="submit"
              variant="outline"
              size="sm"
              disabled={!couponInput.trim() || isApplyingCoupon}
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
            ৳{finalTotal.toFixed(2)}
          </span>
          <p className="text-[11px] text-muted-foreground">
            Shipping calculated at checkout
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

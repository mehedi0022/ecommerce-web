"use client";

import { Banknote, CreditCard, Check, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckoutPaymentMethodProps {
  paymentMethod: "CASH_ON_DELIVERY" | "ONLINE";
  onSelectPaymentMethod: (method: "CASH_ON_DELIVERY" | "ONLINE") => void;
}

export function CheckoutPaymentMethod({
  paymentMethod,
  onSelectPaymentMethod,
}: CheckoutPaymentMethodProps) {
  return (
    <div className="space-y-3">
      {/* ── Cash on Delivery ──────────────────────────────────────────────── */}
      <div
        onClick={() => onSelectPaymentMethod("CASH_ON_DELIVERY")}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onSelectPaymentMethod("CASH_ON_DELIVERY");
          }
        }}
        className={cn(
          "group relative flex cursor-pointer items-start justify-between rounded-xl border p-4 transition-all duration-200",
          paymentMethod === "CASH_ON_DELIVERY"
            ? "border-primary bg-primary/5 shadow-xs"
            : "border-border bg-card hover:border-foreground/30"
        )}
      >
        <div className="flex items-start gap-3.5">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors mt-0.5",
              paymentMethod === "CASH_ON_DELIVERY"
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground"
            )}
          >
            <Banknote className="size-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground text-sm">
                Cash on Delivery (COD)
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                Recommended
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-md">
              Pay with cash when your package is delivered at your doorstep. No advance payment required.
            </p>
          </div>
        </div>

        <div
          className={cn(
            "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors mt-1",
            paymentMethod === "CASH_ON_DELIVERY"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-muted-foreground/30"
          )}
        >
          {paymentMethod === "CASH_ON_DELIVERY" && (
            <Check className="size-3 stroke-[3]" />
          )}
        </div>
      </div>

      {/* ── Online Payment (Card / Mobile Banking) ───────────────────────── */}
      <div className="relative flex cursor-not-allowed items-start justify-between rounded-xl border border-dashed border-border/80 bg-muted/20 p-4 opacity-70">
        <div className="flex items-start gap-3.5">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground mt-0.5">
            <CreditCard className="size-5" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-foreground/80 text-sm">
                Credit / Debit Card & Mobile Banking
              </span>
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground border">
                Coming soon
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Secure online payments via Visa, Mastercard, and Mobile Wallets are currently undergoing maintenance.
            </p>
          </div>
        </div>

        <div className="size-5 shrink-0 rounded-full border border-muted-foreground/20 mt-1" />
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground pt-1">
        <ShieldCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>Your order is protected by our 100% satisfaction guarantee.</span>
      </div>
    </div>
  );
}


"use client";

import { Truck, Zap, Check, AlertCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShippingMethod } from "../checkout.types";

interface CheckoutShippingMethodsProps {
  methods: ShippingMethod[];
  selectedMethodId: number | null;
  onSelectMethod: (methodId: number) => void;
  isLoading?: boolean;
  zoneName?: string;
}

export function CheckoutShippingMethods({
  methods,
  selectedMethodId,
  onSelectMethod,
  isLoading = false,
  zoneName,
}: CheckoutShippingMethodsProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="h-16 rounded-xl border border-border bg-muted/40 animate-pulse" />
        <div className="h-16 rounded-xl border border-border bg-muted/40 animate-pulse" />
      </div>
    );
  }

  if (methods.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/30 p-5 text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
        <AlertCircle className="size-4 text-muted-foreground shrink-0" />
        <span>Please select your District to calculate available shipping methods.</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {zoneName && (
        <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>Resolved Shipping Zone:</span>
          <span className="font-semibold text-foreground bg-primary/10 text-primary px-2.5 py-0.5 rounded-full">
            {zoneName}
          </span>
        </div>
      )}

      {methods.map((method) => {
        const isSelected = selectedMethodId === method.id;
        const isExpress = method.code.toUpperCase().includes("EXPRESS");
        const isFree = method.isFree || method.charge === "0.00" || method.finalCharge === "0.00";
        const finalChargeNum = Number(method.finalCharge ?? method.charge ?? 0);
        const regularChargeNum = Number(method.regularCharge ?? method.charge ?? 0);

        const deliveryEstimate =
          method.estimatedMinDays && method.estimatedMaxDays
            ? `${method.estimatedMinDays}–${method.estimatedMaxDays} business days`
            : method.estimatedMinDays
            ? `${method.estimatedMinDays} business days`
            : method.description || (isExpress ? "Next-day priority delivery" : "2-3 business days");

        return (
          <div
            key={method.id}
            onClick={() => onSelectMethod(method.id)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                onSelectMethod(method.id);
              }
            }}
            className={cn(
              "group relative flex cursor-pointer items-center justify-between rounded-xl border p-4 transition-all duration-200",
              isSelected
                ? "border-primary bg-primary/5 shadow-xs"
                : "border-border bg-card hover:border-foreground/30",
              method.isRecommended && !isSelected && "border-primary/40 bg-primary/[0.02]"
            )}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={cn(
                  "flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                  isSelected
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground group-hover:text-foreground"
                )}
              >
                {isExpress ? (
                  <Zap className="size-5" />
                ) : (
                  <Truck className="size-5" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-foreground text-sm">
                    {method.name}
                  </span>
                  {isFree && (
                    <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      Free Shipping
                    </span>
                  )}
                  {method.isRecommended && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                      <Sparkles className="size-2.5" /> Recommended
                    </span>
                  )}
                  {isExpress && !method.isRecommended && (
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      Fastest
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {deliveryEstimate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                {isFree ? (
                  <div className="flex items-center gap-1.5">
                    {regularChargeNum > 0 && (
                      <span className="text-xs text-muted-foreground line-through">
                        ৳{regularChargeNum.toFixed(0)}
                      </span>
                    )}
                    <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                      FREE
                    </span>
                  </div>
                ) : (
                  <span className="text-sm font-bold text-foreground">
                    ৳{finalChargeNum.toFixed(0)}
                  </span>
                )}
              </div>

              <div
                className={cn(
                  "flex size-5 items-center justify-center rounded-full border transition-colors",
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-muted-foreground/30"
                )}
              >
                {isSelected && <Check className="size-3 stroke-[3]" />}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

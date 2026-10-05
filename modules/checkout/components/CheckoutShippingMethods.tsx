"use client";

import { Truck, Zap, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShippingMethod } from "../checkout.types";

interface CheckoutShippingMethodsProps {
  methods: ShippingMethod[];
  selectedMethodId: number | null;
  onSelectMethod: (methodId: number) => void;
  isLoading?: boolean;
}

export function CheckoutShippingMethods({
  methods,
  selectedMethodId,
  onSelectMethod,
  isLoading = false,
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
      <div className="rounded-xl border border-border bg-muted/30 p-4 text-center text-xs text-muted-foreground">
        Standard delivery will be automatically applied.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {methods.map((method) => {
        const isSelected = selectedMethodId === method.id;
        const isExpress = method.code.toUpperCase().includes("EXPRESS");

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
                : "border-border bg-card hover:border-foreground/30"
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
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-foreground text-sm">
                    {method.name}
                  </span>
                  {isExpress && (
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                      Fastest
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {method.description || (isExpress ? "Next-day priority delivery" : "2-3 business days")}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-foreground">
                {isExpress ? "$10.00" : "$5.00"}
              </span>

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


"use client";

import { Truck, RotateCcw, ShieldCheck, CreditCard } from "lucide-react";
import { StoreContainer } from "./StoreContainer";

export function StoreTrustStrip() {
  const benefits = [
    {
      icon: Truck,
      title: "Fast Delivery",
      desc: "Nationwide in 24–72 hours",
      color: "bg-primary/10 text-primary",
    },
    {
      icon: CreditCard,
      title: "Cash on Delivery",
      desc: "Pay upon product arrival",
      color: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
    },
    {
      icon: RotateCcw,
      title: "7-Day Easy Return",
      desc: "Hassle-free replacement",
      color: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    },
    {
      icon: ShieldCheck,
      title: "100% Authentic",
      desc: "Guaranteed quality product",
      color: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
    },
  ];

  return (
    <section className="border-b bg-background/80 backdrop-blur-sm py-4 sm:py-5">
      <StoreContainer>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
          {benefits.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 p-2.5 sm:p-3 rounded-xl border border-border/60 bg-card/60 hover:bg-card hover:border-border transition-colors shadow-2xs"
              >
                <div
                  className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${item.color}`}
                >
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-foreground truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground truncate">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </StoreContainer>
    </section>
  );
}

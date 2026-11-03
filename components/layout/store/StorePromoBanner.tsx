"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, ShieldCheck, Truck, Percent } from "lucide-react";
import { StoreContainer } from "./StoreContainer";

export function StorePromoBanner() {
  return (
    <section className="border-b bg-muted/20 py-10 sm:py-14">
      <StoreContainer>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
          {/* Promo Card 1: Seasonal Deals */}
          <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-neutral-900 via-neutral-900 to-neutral-800 text-white p-6 sm:p-8 flex flex-col justify-between min-h-[220px] sm:min-h-[260px] shadow-sm">
            <div className="absolute -right-8 -bottom-8 size-48 rounded-full bg-primary/20 blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
            <div className="absolute top-4 right-4 flex items-center justify-center size-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-white">
              <Percent className="size-6 text-amber-400" />
            </div>

            <div className="relative z-10 max-w-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground mb-3">
                <Sparkles className="size-3" /> Special Deals
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Trending Summer Collection
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Handpicked quality styles, premium gadgets, and home essentials at unbeatable value.
              </p>
            </div>

            <div className="relative z-10 mt-6">
              <Link
                href="/products?isFeatured=true"
                className="inline-flex items-center gap-2 rounded-xl bg-white text-neutral-900 px-4 py-2.5 text-xs sm:text-sm font-bold hover:bg-neutral-100 active:scale-95 transition-all shadow-sm group-hover:gap-2.5"
              >
                <span>Shop Featured Deals</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>

          {/* Promo Card 2: Cash on Delivery & Express Delivery */}
          <div className="group relative overflow-hidden rounded-2xl sm:rounded-3xl border border-border/80 bg-gradient-to-br from-primary/95 via-primary to-primary/85 text-primary-foreground p-6 sm:p-8 flex flex-col justify-between min-h-[220px] sm:min-h-[260px] shadow-sm">
            <div className="absolute -right-10 -bottom-10 size-52 rounded-full bg-white/15 blur-2xl group-hover:scale-125 transition-transform duration-700 pointer-events-none" />
            <div className="absolute top-4 right-4 flex items-center justify-center size-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 text-white">
              <Truck className="size-6" />
            </div>

            <div className="relative z-10 max-w-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white mb-3 border border-white/20">
                <ShieldCheck className="size-3" /> 100% Risk Free
              </span>
              <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Cash on Delivery Nationwide
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-white/85 leading-relaxed">
                Inspect your parcel at your doorstep before paying. 24–72 hours courier shipping everywhere in Bangladesh.
              </p>
            </div>

            <div className="relative z-10 mt-6">
              <Link
                href="/products"
                className="inline-flex items-center gap-2 rounded-xl bg-white text-primary px-4 py-2.5 text-xs sm:text-sm font-bold hover:bg-white/90 active:scale-95 transition-all shadow-sm group-hover:gap-2.5"
              >
                <span>Browse All Products</span>
                <ArrowRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </StoreContainer>
    </section>
  );
}

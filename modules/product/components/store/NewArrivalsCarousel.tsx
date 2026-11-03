"use client";

import { useRef, useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Zap,
} from "lucide-react";
import { StoreContainer } from "@/components/layout/store/StoreContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "./ProductCard";
import { useListPublicProductsQuery } from "../../productApi";
import type { Product } from "../../types";

function CarouselSkeleton() {
  return (
    <div className="flex gap-4 sm:gap-5 overflow-hidden">
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="w-[240px] sm:w-[270px] shrink-0 flex flex-col rounded-2xl bg-card p-2.5 border border-border/80 shadow-xs"
        >
          <Skeleton className="aspect-[4/5] w-full rounded-xl" />
          <div className="mt-3 flex flex-1 flex-col gap-2 px-1">
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
            <div className="mt-1 flex items-center justify-between">
              <Skeleton className="h-5 w-20" />
            </div>
            <div className="mt-2.5 flex items-center gap-1.5">
              <Skeleton className="h-9 w-20 rounded-xl" />
              <Skeleton className="h-9 flex-1 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function NewArrivalsCarousel() {
  const { data, isLoading } = useListPublicProductsQuery({
    sortBy: "createdAt",
    sortOrder: "desc",
    limit: 12,
  });

  const products = data?.data || [];
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [products]);

  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const cardWidth = 280;
    const offset = direction === "left" ? -cardWidth * 2 : cardWidth * 2;
    scrollRef.current.scrollBy({ left: offset, behavior: "smooth" });
    setTimeout(checkScroll, 350);
  };

  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section className="border-b bg-background py-12 sm:py-16">
      <StoreContainer>
        {/* Section Header with Left/Right Arrows */}
        <div className="mb-6 sm:mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              <Zap className="size-3.5 fill-current" />
              <span>Fresh Off The Rack</span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              New Arrivals
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Discover the latest items newly added to our store
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Carousel Arrow Controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Scroll left"
                className="flex size-9 items-center justify-center rounded-xl border border-border/80 bg-card text-foreground transition-all hover:bg-muted active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-2xs"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Scroll right"
                className="flex size-9 items-center justify-center rounded-xl border border-border/80 bg-card text-foreground transition-all hover:bg-muted active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-2xs"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>

            <Link
              href="/products?sort=newest"
              className="hidden sm:flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:underline group ml-2"
            >
              <span>View all</span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Carousel Container */}
        {isLoading ? (
          <CarouselSkeleton />
        ) : (
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 scrollbar-none scroll-smooth snap-x select-none"
          >
            {products.map((product: Product) => (
              <div
                key={product.id}
                className="w-[240px] sm:w-[270px] shrink-0 snap-start"
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        )}

        {/* Mobile View All Link */}
        <div className="mt-4 sm:hidden text-center">
          <Link
            href="/products?sort=newest"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
          >
            <span>Browse all new arrivals</span>
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      </StoreContainer>
    </section>
  );
}

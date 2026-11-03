"use client";

import Link from "next/link";
import { Flame, ArrowRight } from "lucide-react";
import { StoreContainer } from "@/components/layout/store/StoreContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "./ProductCard";
import { useListPublicProductsQuery } from "../../productApi";
import type { Product } from "../../types";

function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl bg-card p-2.5 border border-border/80 shadow-xs">
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
  );
}

export function TopSellingSection() {
  // Query top rated / popular products first
  const { data: topData, isLoading: isTopLoading } = useListPublicProductsQuery({
    sortBy: "rating",
    sortOrder: "desc",
    limit: 8,
  });

  const hasTop = Boolean(topData?.data && topData.data.length > 0);

  // Fallback to featured or general if no rating data exists yet
  const { data: fallbackData, isLoading: isFallbackLoading } =
    useListPublicProductsQuery(
      { isFeatured: true, limit: 8 },
      { skip: hasTop }
    );

  const isLoading = isTopLoading || (!hasTop && isFallbackLoading);
  const products = hasTop
    ? (topData?.data ?? [])
    : (fallbackData?.data ?? []);

  if (!isLoading && products.length === 0) {
    return null;
  }

  return (
    <section className="border-b bg-muted/10 py-12 sm:py-16">
      <StoreContainer>
        {/* Section Header */}
        <div className="mb-6 sm:mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Flame className="size-4 fill-amber-500 text-amber-500" />
              <span>Customer Favorites</span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Top Selling Products
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Our highest rated and most loved products by shoppers
            </p>
          </div>

          <Link
            href="/products?sort=rating"
            className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:underline group"
          >
            <span>View all</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Product Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {products.slice(0, 8).map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </StoreContainer>
    </section>
  );
}

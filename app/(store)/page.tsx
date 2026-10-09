"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

import { StoreContainer } from "@/components/layout/store/StoreContainer";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/modules/product/components/store/ProductCard";
import { useListPublicProductsQuery } from "@/modules/product/productApi";
import { StorefrontHeroSlider } from "@/modules/slider/components/store/StorefrontHeroSlider";

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
          <Skeleton className="h-9 w-24 rounded-xl" />
          <Skeleton className="h-9 flex-1 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  // Query featured products first
  const { data: featuredData, isLoading: isFeaturedLoading } =
    useListPublicProductsQuery({ isFeatured: true, limit: 8 });

  const hasFeatured = Boolean(featuredData?.data && featuredData.data.length > 0);

  // Fallback to latest public products if no featured products are marked
  const { data: latestData, isLoading: isLatestLoading } =
    useListPublicProductsQuery(
      { limit: 8 },
      { skip: hasFeatured }
    );

  const isLoading = isFeaturedLoading || (!hasFeatured && isLatestLoading);
  const products = hasFeatured
    ? (featuredData?.data ?? [])
    : (latestData?.data ?? []);

  return (
    <>
      <StorefrontHeroSlider />

      <StoreContainer className="py-12 sm:py-16">
        <div className="mb-6 sm:mb-8 flex items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
              <Sparkles className="size-3.5" />
              <span>Curated for you</span>
            </div>
            <h2 className="mt-1 text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              Featured Products
            </h2>
          </div>
          <Link
            href="/products"
            className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-primary hover:underline group"
          >
            <span>View all</span>
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* Loading skeleton */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : products.length > 0 ? (
          /* Real Products Grid with the polished ProductCard */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-5">
            {products.slice(0, 8).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          /* Empty State if catalog has no products yet */
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 py-16 text-center">
            <Sparkles className="size-8 text-muted-foreground/40 mb-2" />
            <p className="text-base font-semibold text-foreground">
              No products found
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Check back soon for new arrivals!
            </p>
            <Link
              href="/products"
              className="mt-4 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:bg-primary/90"
            >
              Browse Catalog
            </Link>
          </div>
        )}
      </StoreContainer>
    </>
  );
}

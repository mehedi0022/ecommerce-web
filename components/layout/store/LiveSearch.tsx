"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Search,
  X,
  Loader2,
  TrendingUp,
  ArrowRight,
  Package,
  Star,
  Sparkles,
} from "lucide-react";
import { useListPublicProductsQuery } from "@/modules/product/productApi";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import { cn } from "@/lib/utils";

const TRENDING_SEARCHES = [
  "T-shirt",
  "Premium",
  "Polo",
  "Black",
  "Casual",
  "Formal",
  "Jeans",
  "Sneakers",
  "Jacket",
  "Watch",
];

export function LiveSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 250);
    return () => clearTimeout(timer);
  }, [query]);

  // Query matching products
  const { data, isFetching } = useListPublicProductsQuery(
    { search: debouncedQuery, limit: 6, status: "ACTIVE" },
    { skip: !debouncedQuery },
  );

  const products = data?.data ?? [];
  const totalCount = data?.meta?.total ?? products.length;

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectTrending = (term: string) => {
    setQuery(term);
    setDebouncedQuery(term);
    router.push(`/products?search=${encodeURIComponent(term)}`);
    setIsOpen(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIndex >= 0 && products[selectedIndex]) {
      router.push(`/products/${products[selectedIndex].slug}`);
      setIsOpen(false);
      return;
    }
    if (query.trim()) {
      router.push(`/products?search=${encodeURIComponent(query.trim())}`);
      setIsOpen(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < products.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const handleClear = () => {
    setQuery("");
    setDebouncedQuery("");
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      <form onSubmit={handleSubmit} className="relative w-full">
        <label htmlFor="store-live-search" className="sr-only">
          Search products
        </label>
        <div className="relative w-full">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            id="store-live-search"
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
              setSelectedIndex(-1);
            }}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search products by title, category, brand..."
            autoComplete="off"
            className="h-10 w-full rounded-full border border-border/80 bg-muted/40 pl-10 pr-9 text-sm outline-none transition-all placeholder:text-muted-foreground/70 focus:border-primary focus:bg-background focus:ring-3 focus:ring-primary/15"
          />

          {isFetching ? (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" />
            </div>
          ) : query ? (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3.5" />
            </button>
          ) : null}
        </div>
      </form>

      {/* ── Live Search Dropdown ────────────────────────────────────────── */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-[460px] overflow-y-auto rounded-2xl border border-border/70 bg-card p-3 shadow-xl backdrop-blur-md transition-all animate-in fade-in-0 zoom-in-95">
          {debouncedQuery ? (
            <div>
              {/* Header result count */}
              <div className="flex items-center justify-between px-2 pb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider border-b">
                <span>Products Suggestion</span>
                <span>{totalCount} results</span>
              </div>

              {/* Product items list */}
              {products.length > 0 ? (
                <div className="divide-y divide-border/40 py-1">
                  {products.map((product, idx) => {
                    const primaryImage =
                      product.images?.find((img) => img.isPrimary)?.imageUrl ||
                      product.images?.[0]?.imageUrl;
                    const activeVariant =
                      product.variants?.find((v) => v.isActive) ||
                      product.variants?.[0];
                    const price = activeVariant
                      ? Number(activeVariant.price)
                      : 0;
                    const isSelected = selectedIndex === idx;

                    return (
                      <Link
                        key={product.id}
                        href={`/products/${product.slug}`}
                        onClick={() => setIsOpen(false)}
                        className={cn(
                          "flex items-center gap-3.5 rounded-xl p-2.5 transition-colors",
                          isSelected
                            ? "bg-accent text-accent-foreground"
                            : "hover:bg-muted/60",
                        )}
                      >
                        {/* Thumbnail */}
                        <div className="size-12 shrink-0 rounded-lg border bg-muted/40 overflow-hidden flex items-center justify-center relative">
                          {primaryImage ? (
                            <img
                              src={mediaUrl(primaryImage)}
                              alt={product.name}
                              className="size-full object-cover"
                            />
                          ) : (
                            <Package className="size-5 text-muted-foreground/60" />
                          )}
                        </div>

                        {/* Product details */}
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-sm text-foreground truncate">
                            {product.name}
                          </p>

                          <div className="flex items-center gap-2 mt-0.5 text-xs">
                            {product.brand && (
                              <span className="text-[11px] font-medium text-muted-foreground">
                                {product.brand.name}
                              </span>
                            )}
                            {product.categories?.[0]?.category && (
                              <>
                                <span className="text-muted-foreground/40">
                                  •
                                </span>
                                <span className="text-[11px] text-muted-foreground truncate">
                                  {product.categories[0].category.name}
                                </span>
                              </>
                            )}

                            {product.averageRating !== undefined &&
                              product.averageRating > 0 && (
                                <>
                                  <span className="text-muted-foreground/40">
                                    •
                                  </span>
                                  <span className="flex items-center gap-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                                    <Star className="size-3 fill-amber-500 text-amber-500" />
                                    {product.averageRating}
                                  </span>
                                </>
                              )}
                          </div>
                        </div>

                        {/* Price */}
                        <div className="shrink-0 text-right">
                          <p className="font-bold text-sm text-foreground font-mono tabular-nums">
                            ৳ {price.toLocaleString()}
                          </p>
                          {activeVariant?.compareAtPrice &&
                            Number(activeVariant.compareAtPrice) > price && (
                              <p className="text-[10px] text-muted-foreground line-through font-mono">
                                ৳{" "}
                                {Number(
                                  activeVariant.compareAtPrice,
                                ).toLocaleString()}
                              </p>
                            )}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : !isFetching ? (
                <div className="py-8 text-center text-xs text-muted-foreground space-y-1">
                  <Package className="size-7 mx-auto text-muted-foreground/50 mb-2" />
                  <p className="font-medium text-foreground">
                    No products found
                  </p>
                  <p>Try searching with another keyword</p>
                </div>
              ) : null}

              {/* View all search results footer */}
              {products.length > 0 && (
                <div className="pt-2 border-t mt-1">
                  <Link
                    href={`/products?search=${encodeURIComponent(debouncedQuery)}`}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                  >
                    <span>
                      View all {totalCount} results for &ldquo;{debouncedQuery}
                      &rdquo;
                    </span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              )}
            </div>
          ) : (
            /* ── Default / Empty state: Trending & quick tags ── */
            <div className="space-y-3 p-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider px-1">
                <Sparkles className="size-3.5 text-amber-500" />
                <span>Popular Searches</span>
              </div>
              <div className="flex flex-wrap gap-1.5 px-1">
                {TRENDING_SEARCHES.map((term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => handleSelectTrending(term)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/30 px-3 py-1 text-xs font-medium text-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all cursor-pointer"
                  >
                    <TrendingUp className="size-3 text-muted-foreground group-hover:text-current" />
                    {term}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

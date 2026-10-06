"use client";

import React from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { X, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Category } from "@/modules/category/types";
import type { Brand } from "@/modules/brand/types";

interface ProductActiveFiltersProps {
  categories: Category[];
  brands: Brand[];
  totalResults: number;
}

export function ProductActiveFilters({
  categories,
  brands,
  totalResults,
}: ProductActiveFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const search = searchParams.get("search");
  const categorySlug = searchParams.get("category");
  const brandParam = searchParams.get("brand");
  const minPrice = searchParams.get("minPrice");
  const maxPrice = searchParams.get("maxPrice");
  const rating = searchParams.get("rating");
  const inStock = searchParams.get("inStock") === "true";
  const isFeatured = searchParams.get("isFeatured") === "true";

  const removeFilter = (key: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete(key);
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const removeBrand = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = (params.get("brand") || "").split(",").filter(Boolean);
    const updated = current.filter((b) => b !== slug);
    if (updated.length) {
      params.set("brand", updated.join(","));
    } else {
      params.delete("brand");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const clearAll = () => {
    router.push(pathname, { scroll: false });
  };

  const activeCategorySlugs = categorySlug ? categorySlug.split(",").filter(Boolean) : [];

  const removeCategory = (slug: string) => {
    const params = new URLSearchParams(searchParams.toString());
    const current = (params.get("category") || "").split(",").filter(Boolean);
    const updated = current.filter((c) => c !== slug);
    if (updated.length) {
      params.set("category", updated.join(","));
    } else {
      params.delete("category");
    }
    params.delete("page");
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const findCategoryName = (slug: string) => {
    const findInTree = (list: Category[]): string | undefined => {
      for (const item of list) {
        if (item.slug === slug) return item.name;
        if (item.children?.length) {
          const res = findInTree(item.children);
          if (res) return res;
        }
      }
      return undefined;
    };
    return findInTree(categories) || slug;
  };

  const activeBrandSlugs = brandParam ? brandParam.split(",").filter(Boolean) : [];

  const hasAnyFilter = Boolean(
    search ||
      activeCategorySlugs.length > 0 ||
      activeBrandSlugs.length > 0 ||
      minPrice ||
      maxPrice ||
      rating ||
      inStock ||
      isFeatured
  );

  if (!hasAnyFilter) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <span className="text-xs text-muted-foreground font-medium">
        Active Filters:
      </span>

      {/* Search query chip */}
      {search && (
        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 border border-primary/20 px-2.5 py-0.5 text-xs font-semibold text-primary">
          Search: &ldquo;{search}&rdquo;
          <button
            type="button"
            onClick={() => removeFilter("search")}
            className="hover:text-destructive"
            aria-label="Remove search filter"
          >
            <X className="size-3" />
          </button>
        </span>
      )}

      {/* Category chips */}
      {activeCategorySlugs.map((slug) => (
        <span
          key={slug}
          className="inline-flex items-center gap-1 rounded-full bg-muted border px-2.5 py-0.5 text-xs font-medium text-foreground"
        >
          Category: {findCategoryName(slug)}
          <button
            type="button"
            onClick={() => removeCategory(slug)}
            className="hover:text-destructive"
            aria-label={`Remove category ${slug}`}
          >
            <X className="size-3" />
          </button>
        </span>
      ))}

      {/* Brand chips */}
      {activeBrandSlugs.map((slug) => {
        const brandObj = brands.find((b) => b.slug === slug);
        return (
          <span
            key={slug}
            className="inline-flex items-center gap-1 rounded-full bg-muted border px-2.5 py-0.5 text-xs font-medium text-foreground"
          >
            Brand: {brandObj?.name || slug}
            <button
              type="button"
              onClick={() => removeBrand(slug)}
              className="hover:text-destructive"
              aria-label={`Remove brand ${slug}`}
            >
              <X className="size-3" />
            </button>
          </span>
        );
      })}

      {/* Price chip */}
      {(minPrice || maxPrice) && (
        <span className="inline-flex items-center gap-1 rounded-full bg-muted border px-2.5 py-0.5 text-xs font-medium text-foreground">
          Price: ৳{minPrice || "0"} – {maxPrice ? `৳${maxPrice}` : "Any"}
          <button
            type="button"
            onClick={() => {
              const params = new URLSearchParams(searchParams.toString());
              params.delete("minPrice");
              params.delete("maxPrice");
              params.delete("page");
              router.push(`${pathname}?${params.toString()}`, { scroll: false });
            }}
            className="hover:text-destructive"
            aria-label="Remove price filter"
          >
            <X className="size-3" />
          </button>
        </span>
      )}

      {/* Rating chip */}
      {rating && (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-700 dark:text-amber-400">
          Rating: {rating}★ & up
          <button
            type="button"
            onClick={() => removeFilter("rating")}
            className="hover:text-destructive"
            aria-label="Remove rating filter"
          >
            <X className="size-3" />
          </button>
        </span>
      )}

      {/* In-stock chip */}
      {inStock && (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
          In Stock
          <button
            type="button"
            onClick={() => removeFilter("inStock")}
            className="hover:text-destructive"
            aria-label="Remove in stock filter"
          >
            <X className="size-3" />
          </button>
        </span>
      )}

      {/* Featured chip */}
      {isFeatured && (
        <span className="inline-flex items-center gap-1 rounded-full bg-purple-500/10 border border-purple-500/20 px-2.5 py-0.5 text-xs font-semibold text-purple-700 dark:text-purple-400">
          Featured
          <button
            type="button"
            onClick={() => removeFilter("isFeatured")}
            className="hover:text-destructive"
            aria-label="Remove featured filter"
          >
            <X className="size-3" />
          </button>
        </span>
      )}

      {/* Reset all button */}
      <button
        type="button"
        onClick={clearAll}
        className="inline-flex items-center gap-1 text-xs font-bold text-destructive hover:underline ml-1 cursor-pointer"
      >
        <RotateCcw className="size-3" />
        Clear all
      </button>
    </div>
  );
}

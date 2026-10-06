"use client";

import Link from "next/link";
import { Heart, ShoppingCart, Star, Eye } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import { useWishlist } from "@/modules/wishlist/useWishlist";
import { useGetProductRatingSummaryQuery } from "@/modules/review/reviewApi";
import type { Product } from "../../types";

// ─── Helpers ────────────────────────────────────────────────────────────────

const placeholderGradients = [
  "from-amber-100 via-orange-50 to-stone-100",
  "from-slate-200 via-blue-50 to-indigo-100",
  "from-rose-100 via-pink-50 to-orange-50",
  "from-emerald-100 via-teal-50 to-stone-100",
  "from-violet-100 via-purple-50 to-indigo-100",
  "from-sky-100 via-cyan-50 to-teal-100",
];

function getDiscount(price: string, compareAtPrice: string | null): number | null {
  if (!compareAtPrice) return null;
  const p = Number(price);
  const c = Number(compareAtPrice);
  if (!p || !c || c <= p) return null;
  return Math.round(((c - p) / c) * 100);
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ProductCardProps {
  product: Product;
  /** Show a quick-add button on hover. Default: true */
  showQuickAdd?: boolean;
  /** Show wishlist button. Default: true */
  showWishlist?: boolean;
  /** Extra wrapper class */
  className?: string;
  /** Pre-calculated rating override */
  rating?: number;
  /** Pre-calculated review count override */
  reviewCount?: number;
  /** Called when "Add to cart" is clicked (prevents navigation) */
  onAddToCart?: (product: Product) => void;
  /** Called when wishlist button is clicked (prevents navigation) */
  onWishlist?: (product: Product) => void;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function ProductCard({
  product,
  showQuickAdd = true,
  showWishlist = true,
  className,
  rating: propRating,
  reviewCount: propReviewCount,
  onAddToCart,
  onWishlist,
}: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  // Fetch rating summary dynamically if not explicitly passed as prop
  const { data: ratingData } = useGetProductRatingSummaryQuery(product.slug, {
    skip: propRating !== undefined || !product.slug,
  });

  const rating = propRating ?? ratingData?.data?.averageRating ?? 0;
  const reviewCount = propReviewCount ?? ratingData?.data?.reviewCount ?? 0;

  const activeVariant =
    product.variants?.find((v) => v.isActive) ?? product.variants?.[0];
  const primaryImage =
    product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
  const gradientClass =
    placeholderGradients[Math.abs(product.id) % placeholderGradients.length];

  const price = activeVariant ? Number(activeVariant.price) : null;
  const compareAt = activeVariant?.compareAtPrice
    ? Number(activeVariant.compareAtPrice)
    : null;
  const discount = activeVariant
    ? getDiscount(activeVariant.price, activeVariant.compareAtPrice)
    : null;

  const isNew =
    product.isFeatured &&
    !discount; /* treat featured-only as "New" badge */

  return (
    <div className={cn("group relative flex flex-col", className)}>
      {/* ── Image area ─────────────────────────────── */}
      <Link
        href={`/products/${product.slug}`}
        className="relative block overflow-hidden rounded-xl"
        tabIndex={-1}
        aria-hidden="true"
      >
        <div
          className={cn(
            "relative flex aspect-[4/5] items-center justify-center overflow-hidden bg-gradient-to-br",
            gradientClass
          )}
        >
          {primaryImage ? (
            <img
              src={mediaUrl(primaryImage.imageUrl)}
              alt={primaryImage.altText ?? product.name}
              className="size-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            /* Stylised placeholder */
            <div className="flex flex-col items-center gap-3 px-6 text-center transition duration-500 group-hover:scale-105">
              <div className="size-16 rounded-full bg-white/60 shadow-sm" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/40">
                {product.name.split(" ")[0]}
              </span>
            </div>
          )}

          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-black/0 transition duration-300 group-hover:bg-black/8" />
        </div>

        {/* ── Badges (top-left) ─── */}
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {discount !== null && (
            <Badge className="bg-rose-500 text-white hover:bg-rose-500 rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide shadow-sm">
              -{discount}%
            </Badge>
          )}
          {isNew && (
            <Badge className="bg-emerald-500 text-white hover:bg-emerald-500 rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide shadow-sm">
              NEW
            </Badge>
          )}
          {product.status === "INACTIVE" && (
            <Badge variant="outline" className="text-[11px] bg-background/80 backdrop-blur-sm">
              Unavailable
            </Badge>
          )}
        </div>

        {/* ── Wishlist button (top-right) ─── */}
        {showWishlist && (
          <button
            type="button"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              if (onWishlist) {
                onWishlist(product);
              } else {
                toggleWishlist(product);
              }
            }}
            className={cn(
              "absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-background/80 backdrop-blur-sm shadow-sm transition-all duration-200 hover:bg-background hover:scale-110",
              isWishlisted
                ? "opacity-100 bg-background text-rose-500 shadow-sm"
                : "opacity-0 text-foreground/70 group-hover:opacity-100"
            )}
          >
            <Heart
              className={cn(
                "size-4 transition-colors",
                isWishlisted
                  ? "fill-rose-500 text-rose-500"
                  : "text-foreground/70 hover:text-rose-500"
              )}
            />
          </button>
        )}

        {/* ── Quick add (bottom, slide up) ─── */}
        {showQuickAdd && (
          <div className="absolute inset-x-3 bottom-3 translate-y-2 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                onAddToCart?.(product);
              }}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-background/90 backdrop-blur-sm border border-border/60 px-3 py-2 text-xs font-semibold shadow-md transition hover:bg-background"
            >
              <ShoppingCart className="size-3.5" />
              Quick Add
            </button>
          </div>
        )}
      </Link>

      {/* ── Card body ──────────────────────────────── */}
      <div className="mt-3 flex flex-1 flex-col gap-1 px-0.5">
        {/* Brand */}
        {product.brand && (
          <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground/70">
            {product.brand.name}
          </p>
        )}

        {/* Name */}
        <Link
          href={`/products/${product.slug}`}
          className="line-clamp-2 text-sm font-semibold leading-snug text-foreground hover:text-primary transition-colors"
        >
          {product.name}
        </Link>

        {/* Short description */}
        {product.shortDescription && (
          <p className="line-clamp-1 text-xs text-muted-foreground">
            {product.shortDescription}
          </p>
        )}

        {/* Rating */}
        <div className="mt-0.5 flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <Star
              key={s}
              className={cn(
                "size-3",
                reviewCount > 0 && s <= Math.round(rating)
                  ? "fill-amber-400 text-amber-400"
                  : "fill-muted text-muted-foreground/30"
              )}
            />
          ))}
          <span className="ml-1 text-[11px] text-muted-foreground">
            {reviewCount > 0 ? (
              <>
                <span className="font-semibold text-foreground/80">{rating.toFixed(1)}</span>
                <span className="ml-0.5">({reviewCount})</span>
              </>
            ) : (
              "(0)"
            )}
          </span>
        </div>

        {/* Price */}
        <div className="mt-1.5 flex items-center gap-2">
          {price !== null ? (
            <>
              <span className="text-base font-bold text-foreground">
                ${price.toFixed(2)}
              </span>
              {compareAt && compareAt > price && (
                <span className="text-sm text-muted-foreground line-through">
                  ${compareAt.toFixed(2)}
                </span>
              )}
            </>
          ) : (
            <span className="text-sm text-muted-foreground">Price unavailable</span>
          )}
        </div>
      </div>
    </div>
  );
}

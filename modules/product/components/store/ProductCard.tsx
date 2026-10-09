"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Heart,
  ShoppingCart,
  Star,
  Sparkles,
  Zap,
  Loader2,
  Minus,
  Plus,
  Truck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import { useWishlist } from "@/modules/wishlist/useWishlist";
import { useGetProductRatingSummaryQuery } from "@/modules/review/reviewApi";
import { useGetPublicProductBySlugQuery } from "@/modules/product/productApi";
import { useAddToCartMutation } from "@/modules/cart/cartApi";
import { VariantSelector } from "./VariantSelector";
import type { Product, ProductVariant } from "../../types";

// ─── Helpers ────────────────────────────────────────────────────────────────

const placeholderGradients = [
  "from-amber-100/60 via-orange-50/40 to-stone-100/80",
  "from-slate-200/60 via-blue-50/40 to-indigo-100/80",
  "from-rose-100/60 via-pink-50/40 to-orange-50/80",
  "from-emerald-100/60 via-teal-50/40 to-stone-100/80",
  "from-violet-100/60 via-purple-50/40 to-indigo-100/80",
  "from-sky-100/60 via-cyan-50/40 to-teal-100/80",
];

function getDiscount(
  price: string | number,
  compareAtPrice: string | number | null | undefined,
): number | null {
  if (!compareAtPrice) return null;
  const p = Number(price);
  const c = Number(compareAtPrice);
  if (!p || !c || c <= p) return null;
  return Math.round(((c - p) / c) * 100);
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ProductCardProps {
  product: Product;
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
  showWishlist = true,
  className,
  rating: propRating,
  reviewCount: propReviewCount,
  onAddToCart,
  onWishlist,
}: ProductCardProps) {
  const router = useRouter();
  const [addToCart] = useAddToCartMutation();

  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);

  // Dynamic rating summary if not passed via props
  const { data: ratingData } = useGetProductRatingSummaryQuery(product.slug, {
    skip: propRating !== undefined || !product.slug,
  });
  const rating = propRating ?? ratingData?.data?.averageRating ?? 0;
  const reviewCount = propReviewCount ?? ratingData?.data?.reviewCount ?? 0;

  // Variation Modal State
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [isDirectBuying, setIsDirectBuying] = useState(false);
  const [isCartLoading, setIsCartLoading] = useState(false);
  const [isModalAddingToCart, setIsModalAddingToCart] = useState(false);
  const [modalQuantity, setModalQuantity] = useState(1);

  // Lazy-load full details on modal open (ensuring 100% full attribute values & images)
  const { data: fullProductData } = useGetPublicProductBySlugQuery(
    product.slug,
    {
      skip: !isVariantModalOpen || !product.slug,
    },
  );
  const activeProduct = fullProductData?.data ?? product;

  const activeVariants = useMemo(
    () => (activeProduct.variants ?? []).filter((v) => v.isActive),
    [activeProduct.variants],
  );
  const hasMultipleVariants = activeVariants.length > 1;

  const defaultVariant =
    activeVariants.find((v) => v.isActive) ?? activeVariants[0] ?? null;

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    defaultVariant,
  );

  useEffect(() => {
    if (defaultVariant && !selectedVariant) {
      setSelectedVariant(defaultVariant);
    }
  }, [defaultVariant, selectedVariant]);

  // Card display values
  const cardVariant =
    product.variants?.find((v) => v.isActive) ?? product.variants?.[0];
  const primaryImage =
    product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
  const secondaryImage =
    product.images?.find((img) => !img.isPrimary) ?? product.images?.[1];

  const gradientClass =
    placeholderGradients[Math.abs(product.id) % placeholderGradients.length];

  const cardPrice = cardVariant ? Number(cardVariant.price) : null;
  const cardCompareAt = cardVariant?.compareAtPrice
    ? Number(cardVariant.compareAtPrice)
    : null;
  const cardDiscount = cardVariant
    ? getDiscount(cardVariant.price, cardVariant.compareAtPrice)
    : null;

  const isNew = product.isFeatured && !cardDiscount;

  // Modal variant matched image
  const modalVariantImage = useMemo(() => {
    if (!selectedVariant?.attributeValues?.length) {
      return (
        activeProduct.images?.find((img) => img.isPrimary) ??
        activeProduct.images?.[0]
      );
    }
    const variantAttrIds = new Set(
      selectedVariant.attributeValues
        .map((av) => av.attributeValue?.id)
        .filter(Boolean),
    );
    const match = activeProduct.images?.find((img) =>
      img.attributeValues?.some((iav) =>
        variantAttrIds.has(iav.attributeValueId),
      ),
    );
    return (
      match ??
      activeProduct.images?.find((img) => img.isPrimary) ??
      activeProduct.images?.[0]
    );
  }, [selectedVariant, activeProduct.images]);

  const modalPrice = selectedVariant
    ? Number(selectedVariant.price)
    : cardPrice;
  const modalCompareAt = selectedVariant?.compareAtPrice
    ? Number(selectedVariant.compareAtPrice)
    : cardCompareAt;
  const modalDiscount =
    modalPrice !== null ? getDiscount(modalPrice, modalCompareAt) : null;
  const modalTotal = modalPrice ? modalPrice * modalQuantity : 0;

  // ── Actions ──
  const handleAddToCartClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (onAddToCart) {
      onAddToCart(product);
      return;
    }

    if (hasMultipleVariants) {
      setSelectedVariant(selectedVariant ?? defaultVariant);
      setModalQuantity(1);
      setIsVariantModalOpen(true);
      return;
    }

    const targetVariant = cardVariant ?? defaultVariant;
    if (!targetVariant?.id) {
      toast.error("This product is currently unavailable");
      return;
    }

    try {
      setIsCartLoading(true);
      await addToCart({ variantId: targetVariant.id, quantity: 1 }).unwrap();
      toast.success("Added to cart!");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add to cart");
    } finally {
      setIsCartLoading(false);
    }
  };

  const handleBuyNowClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (hasMultipleVariants) {
      setSelectedVariant(selectedVariant ?? defaultVariant);
      setModalQuantity(1);
      setIsVariantModalOpen(true);
      return;
    }

    const targetVariant = cardVariant ?? defaultVariant;
    if (!targetVariant?.id) {
      toast.error("This product is currently unavailable");
      return;
    }

    try {
      setIsDirectBuying(true);
      await addToCart({ variantId: targetVariant.id, quantity: 1 }).unwrap();
      toast.success("Proceeding to checkout...");
      router.push("/checkout");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to proceed to checkout");
      setIsDirectBuying(false);
    }
  };

  const handleModalAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedVariant?.id) {
      toast.error("Please select an option");
      return;
    }

    try {
      setIsModalAddingToCart(true);
      await addToCart({
        variantId: selectedVariant.id,
        quantity: modalQuantity,
      }).unwrap();
      toast.success("Added to cart!");
      setIsVariantModalOpen(false);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add to cart");
    } finally {
      setIsModalAddingToCart(false);
    }
  };

  const handleModalBuyNow = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedVariant?.id) {
      toast.error("Please select an option");
      return;
    }

    try {
      setIsDirectBuying(true);
      await addToCart({
        variantId: selectedVariant.id,
        quantity: modalQuantity,
      }).unwrap();
      setIsVariantModalOpen(false);
      toast.success("Proceeding to checkout...");
      router.push("/checkout");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to proceed to checkout");
      setIsDirectBuying(false);
    }
  };

  return (
    <>
      <div
        className={cn(
          "group relative flex flex-col rounded-2xl bg-card p-2.5 transition-all duration-300 hover:shadow-xl hover:shadow-black/[0.04] border border-border/80 hover:border-primary/50 shadow-xs",
          className,
        )}
      >
        {/* ── Image area ─────────────────────────────── */}
        <div className="relative block overflow-hidden rounded-xl bg-muted/45">
          <Link
            href={`/products/${product.slug}`}
            className="relative block aspect-[4/5] overflow-hidden"
            tabIndex={-1}
            aria-hidden="true"
          >
            <div
              className={cn(
                "relative flex size-full items-center justify-center overflow-hidden bg-gradient-to-br transition-transform duration-700 group-hover:scale-105",
                gradientClass,
              )}
            >
              {primaryImage ? (
                <>
                  <Image
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    unoptimized={true}
                    priority={true}
                    quality={85}
                    src={mediaUrl(primaryImage.imageUrl)}
                    alt={primaryImage.altText ?? product.name}
                    className={cn(
                      "size-full object-cover object-center transition-opacity duration-500",
                      secondaryImage && "group-hover:opacity-0",
                    )}
                  />
                  {secondaryImage && (
                    <Image
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      unoptimized={true}
                      quality={85}
                      src={mediaUrl(secondaryImage.imageUrl)}
                      alt={secondaryImage.altText ?? product.name}
                      className="absolute inset-0 size-full object-cover object-center opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    />
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center gap-2.5 px-6 text-center">
                  <div className="flex size-14 items-center justify-center rounded-full bg-white/70 shadow-sm backdrop-blur-md">
                    <Sparkles className="size-5 text-muted-foreground/50" />
                  </div>
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-foreground/40">
                    BIXO Commerce
                  </span>
                </div>
              )}
            </div>
          </Link>

          {/* ── Badges (top-left) ─── */}
          <div className="absolute left-2.5 top-2.5 flex flex-col gap-1.5 z-10 pointer-events-none">
            {cardDiscount !== null && (
              <Badge className="bg-rose-500/90 backdrop-blur-md text-white hover:bg-rose-500 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider shadow-sm">
                -{cardDiscount}%
              </Badge>
            )}
            {isNew && (
              <Badge className="bg-foreground/90 backdrop-blur-md text-background hover:bg-foreground rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider shadow-sm">
                NEW
              </Badge>
            )}
            {product.isFreeShipping && (
              <Badge className="bg-emerald-600/90 backdrop-blur-md text-white hover:bg-emerald-600 rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm">
                Free Shipping
              </Badge>
            )}
            {product.requiresAdvancePayment && (
              <Badge className="bg-amber-600/90 backdrop-blur-md text-white hover:bg-amber-600 rounded-md px-2 py-0.5 text-[10px] font-semibold tracking-wide shadow-sm">
                Advance Req.
              </Badge>
            )}
            {product.status === "INACTIVE" && (
              <Badge
                variant="outline"
                className="text-[10px] bg-background/90 backdrop-blur-md"
              >
                Unavailable
              </Badge>
            )}
          </div>

          {/* ── Wishlist button (top-right) ─── */}
          {showWishlist && (
            <button
              type="button"
              aria-label={
                isWishlisted ? "Remove from wishlist" : "Add to wishlist"
              }
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
                "absolute right-2.5 top-2.5 flex size-9 items-center justify-center rounded-full bg-background/75 backdrop-blur-md shadow-sm transition-all duration-300 hover:bg-background hover:scale-105 active:scale-95 cursor-pointer z-10",
                isWishlisted
                  ? "opacity-100 text-rose-500 shadow-sm"
                  : "opacity-80 hover:opacity-100 text-foreground/70",
              )}
            >
              <Heart
                className={cn(
                  "size-4 transition-colors",
                  isWishlisted
                    ? "fill-rose-500 text-rose-500"
                    : "hover:text-rose-500",
                )}
              />
            </button>
          )}
        </div>

        {/* ── Card body ──────────────────────────────── */}
        <div className="mt-3 flex flex-1 flex-col gap-1 px-1">
          {/* Name */}
          <Link
            href={`/products/${product.slug}`}
            className="line-clamp-1 text-sm font-medium tracking-tight text-foreground hover:text-primary transition-colors mt-0.5"
          >
            {product.name}
          </Link>

          {/* Short description */}
          {product.shortDescription && (
            <p className="line-clamp-1 text-xs text-muted-foreground/80">
              {product.shortDescription}
            </p>
          )}

          {/* Rating and Reviews */}
          <div className="mt-1 flex items-center gap-1.5">
            <div className="flex items-center">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-xs font-semibold text-foreground/90">
              {reviewCount > 0 ? rating.toFixed(1) : "New"}
            </span>
            {reviewCount > 0 && (
              <span className="text-[11px] text-muted-foreground/60">
                ({reviewCount})
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mt-1.5 flex items-baseline justify-between">
            <div className="flex items-baseline gap-2">
              {cardPrice !== null ? (
                <>
                  <span className="text-base font-bold tracking-tight text-foreground">
                    ৳{cardPrice.toFixed(2)}
                  </span>
                  {cardCompareAt && cardCompareAt > cardPrice && (
                    <span className="text-xs text-muted-foreground/60 line-through">
                      ৳{cardCompareAt.toFixed(2)}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-xs text-muted-foreground">
                  Price unavailable
                </span>
              )}
            </div>
          </div>

          {/* ── Card Action Buttons ─── */}
          <div className="mt-3 flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddToCartClick}
              disabled={isCartLoading || !cardVariant}
              className="h-9 px-2.5 sm:px-3 rounded-xl border-border/80 hover:bg-muted text-foreground flex items-center gap-1.5 font-medium text-xs transition-all cursor-pointer"
              title="Add to Cart"
            >
              {isCartLoading ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <ShoppingCart className="size-3.5" />
              )}
              <span className="hidden sm:inline">Add to Cart</span>
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={handleBuyNowClick}
              disabled={isDirectBuying || !cardVariant}
              className="flex-1 h-9 rounded-xl font-bold text-xs sm:text-sm gap-1.5 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs active:scale-[0.98] transition-all cursor-pointer"
            >
              {isDirectBuying ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Zap className="size-3.5 fill-current" />
              )}
              <span>Buy Now</span>
            </Button>
          </div>
        </div>
      </div>

      {/* ── Variation Selection Dialog (Details Page Style) ─── */}
      {hasMultipleVariants && (
        <Dialog open={isVariantModalOpen} onOpenChange={setIsVariantModalOpen}>
          <DialogContent
            className="sm:max-w-lg p-5 sm:p-6 rounded-2xl gap-4 max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <DialogHeader className="gap-1 text-left pb-1">
              <DialogTitle className="text-base sm:text-lg font-bold">
                Select Options
              </DialogTitle>
            </DialogHeader>

            {/* Product Quick Overview */}
            <div className="flex gap-3.5 items-start">
              <div className="relative size-20 sm:size-24 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted/30">
                {modalVariantImage ? (
                  <Image
                    fill
                    sizes="96px"
                    unoptimized={true}
                    src={mediaUrl(modalVariantImage.imageUrl)}
                    alt={modalVariantImage.altText ?? activeProduct.name}
                    className="object-cover"
                  />
                ) : (
                  <div className="flex size-full items-center justify-center bg-muted">
                    <Sparkles className="size-6 text-muted-foreground/30" />
                  </div>
                )}
              </div>

              <div className="flex flex-col min-w-0 flex-1 gap-1">
                {activeProduct.brand && (
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {activeProduct.brand.name}
                  </span>
                )}
                <h3 className="text-sm sm:text-base font-bold leading-snug text-foreground line-clamp-2">
                  {activeProduct.name}
                </h3>

                {/* Price display matching details page */}
                <div className="mt-1 flex items-baseline gap-2 flex-wrap">
                  {modalPrice !== null ? (
                    <>
                      <span className="text-xl sm:text-2xl font-black text-foreground">
                        ৳{modalPrice.toFixed(2)}
                      </span>
                      {modalCompareAt && modalCompareAt > modalPrice && (
                        <>
                          <span className="text-sm text-muted-foreground line-through">
                            ৳{modalCompareAt.toFixed(2)}
                          </span>
                          <Badge className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5">
                            Save {modalDiscount}%
                          </Badge>
                        </>
                      )}
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Price unavailable
                    </span>
                  )}
                </div>

                {selectedVariant?.sku && (
                  <span className="text-[11px] text-muted-foreground font-mono">
                    SKU: {selectedVariant.sku}
                  </span>
                )}
              </div>
            </div>

            {/* Policy Badges */}
            {activeProduct.isFreeShipping && (
              <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-3 py-2 text-xs text-emerald-800 dark:text-emerald-300">
                <Truck className="size-3.5 shrink-0 text-emerald-600" />
                <span>ফ্রি ডেলিভারি প্রযোজ্য</span>
              </div>
            )}

            {activeProduct.requiresAdvancePayment && (
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-3 py-2 text-xs text-amber-900 dark:text-amber-200">
                <span>
                  ⚡ এই পণ্যের জন্য অগ্রিম পেমেন্ট আবশ্যক (৳
                  {activeProduct.advancePaymentAmount ?? "চার্জ"})
                </span>
              </div>
            )}

            <div className="h-px bg-border/60" />

            {/* Variant Selector (Exact same component as details page) */}
            <div className="py-1">
              <VariantSelector
                variants={activeVariants}
                selectedVariantId={selectedVariant?.id ?? null}
                onSelect={(v) => {
                  setSelectedVariant(v);
                  setModalQuantity(1);
                }}
              />
            </div>

            {/* Quantity Selector (Exact same design as details page) */}
            <div className="flex flex-col gap-2 pt-1">
              <span className="text-sm font-semibold">Quantity</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg border bg-muted/30">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setModalQuantity((q) => Math.max(1, q - 1))}
                    className="flex size-9 sm:size-10 items-center justify-center rounded-l-lg transition hover:bg-muted border-r border-border/50 cursor-pointer"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-12 text-center text-sm font-semibold">
                    {modalQuantity}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setModalQuantity((q) => q + 1)}
                    className="flex size-9 sm:size-10 items-center justify-center rounded-r-lg transition hover:bg-muted border-l border-border/50 cursor-pointer"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
                <div className="flex-1 text-right">
                  <span className="text-xs text-muted-foreground mr-1.5">
                    মোট / Total:
                  </span>
                  <span className="text-lg font-black text-foreground">
                    ৳{modalTotal.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            <div className="h-px bg-border/60" />

            {/* Modal CTA Buttons */}
            <div className="flex flex-col gap-2.5 sm:flex-row pt-1">
              <Button
                type="button"
                variant="outline"
                size="lg"
                disabled={
                  isDirectBuying || isModalAddingToCart || !selectedVariant
                }
                onClick={handleModalAddToCart}
                className="h-11 flex-1 font-bold text-sm gap-2 rounded-xl border-border hover:bg-muted cursor-pointer"
              >
                {isModalAddingToCart ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <ShoppingCart className="size-4" />
                )}
                Add to Cart
              </Button>

              <Button
                type="button"
                size="lg"
                disabled={
                  isDirectBuying || isModalAddingToCart || !selectedVariant
                }
                onClick={handleModalBuyNow}
                className="h-11 flex-1 font-bold text-sm gap-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
              >
                {isDirectBuying ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    <span>Proceeding...</span>
                  </>
                ) : (
                  <>
                    <Zap className="size-4 fill-current" />
                    <span>Buy Now</span>
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

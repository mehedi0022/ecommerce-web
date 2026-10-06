"use client";

import { useState, useCallback, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ShoppingCart,
  Heart,
  Share2,
  ChevronRight,
  Star,
  Truck,
  RotateCcw,
  ShieldCheck,
  Minus,
  Plus,
  Check,
  Tag,
  FileText,
  SlidersHorizontal,
  MessageSquare,
  CheckCircle2,
  Sparkles,
  User,
  PackageCheck,
  Award,
} from "lucide-react";

import { StoreContainer } from "@/components/layout/store/StoreContainer";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { RichTextContent } from "@/components/rich-text/RichTextContent";
import { cn } from "@/lib/utils";

import { useGetPublicProductBySlugQuery } from "@/modules/product/productApi";
import {
  useGetProductRatingSummaryQuery,
  useGetProductReviewsQuery,
} from "@/modules/review/reviewApi";
import { toast } from "sonner";
import { useAddToCartMutation } from "@/modules/cart/cartApi";
import { ProductGallery } from "@/modules/product/components/store/ProductGallery";
import { VariantSelector } from "@/modules/product/components/store/VariantSelector";
import { ProductCard } from "@/modules/product/components/store/ProductCard";
import { useListPublicProductsQuery } from "@/modules/product/productApi";
import { useWishlist } from "@/modules/wishlist/useWishlist";
import type { ProductVariant } from "@/modules/product/types";

// ─── Sub-components ──────────────────────────────────────────────────────────

function Breadcrumb({ name, category }: { name: string; category?: string }) {
  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
      <ChevronRight className="size-3" />
      <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
      {category && (
        <>
          <ChevronRight className="size-3" />
          <Link href={`/category/${category}`} className="hover:text-foreground transition-colors capitalize">
            {category}
          </Link>
        </>
      )}
      <ChevronRight className="size-3" />
      <span className="text-foreground font-medium line-clamp-1 max-w-[180px]">{name}</span>
    </nav>
  );
}

function StarRating({ rating = 0, size = "sm" }: { rating?: number; size?: "sm" | "md" | "lg" }) {
  const iconSize = size === "lg" ? "size-5" : size === "md" ? "size-4" : "size-3.5";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={cn(
            iconSize,
            s <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "fill-muted text-muted-foreground/25"
          )}
        />
      ))}
    </div>
  );
}

function RatingSummaryBadge({ count = 0, rating = 0, onClick }: { count?: number; rating?: number; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 hover:opacity-80 transition-opacity text-left cursor-pointer group"
    >
      <StarRating rating={rating} size="md" />
      <span className="text-sm font-semibold">{rating ? rating.toFixed(1) : "No ratings yet"}</span>
      <span className="text-sm text-muted-foreground group-hover:text-primary transition-colors">
        ({count} {count === 1 ? "review" : "reviews"})
      </span>
    </button>
  );
}

function TrustBadges() {
  const items = [
    { icon: Truck, title: "Free shipping", desc: "On orders over $50" },
    { icon: RotateCcw, title: "Easy returns", desc: "30-day return policy" },
    { icon: ShieldCheck, title: "Secure payment", desc: "SSL encrypted checkout" },
  ];
  return (
    <div className="grid grid-cols-3 divide-x divide-border rounded-xl border bg-muted/30 text-center">
      {items.map(({ icon: Icon, title, desc }) => (
        <div key={title} className="flex flex-col items-center gap-1 px-3 py-4">
          <Icon className="size-5 text-muted-foreground" />
          <p className="text-xs font-semibold text-foreground">{title}</p>
          <p className="text-[11px] text-muted-foreground">{desc}</p>
        </div>
      ))}
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <StoreContainer className="py-10">
      <div className="grid gap-10 md:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </StoreContainer>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function ProductDetailsPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug ?? "";

  const { data, isLoading, isError } = useGetPublicProductBySlugQuery(slug, { skip: !slug });
  const product = data?.data;

  const [activeTab, setActiveTab] = useState<"description" | "reviews" | "specs">("description");
  const [reviewSort, setReviewSort] = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const { data: ratingData } = useGetProductRatingSummaryQuery(slug, { skip: !slug });
  const { data: reviewsData, isLoading: isReviewsLoading } = useGetProductReviewsQuery(
    { slug, page: 1, limit: 20, sort: reviewSort },
    { skip: !slug }
  );

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = product ? isInWishlist(product.id) : false;

  // Reviews & ratings
  const ratingSummary = ratingData?.data;
  const reviewsList = reviewsData?.data ?? [];
  const averageRating = ratingSummary?.averageRating ?? 0;
  const reviewCount = ratingSummary?.reviewCount ?? reviewsList.length;

  // Related products
  const primaryCategory = product?.categories.find((c) => c.isPrimary) ?? product?.categories[0];
  const { data: relatedData } = useListPublicProductsQuery(
    { limit: 4, categoryId: primaryCategory?.categoryId },
    { skip: !product }
  );
  const relatedProducts = (relatedData?.data ?? []).filter(
    (p) => p.id !== product?.id
  ).slice(0, 4);

  // Init selected variant from product
  const activeVariant = selectedVariant ??
    (product?.variants?.find((v) => v.isActive) ?? product?.variants?.[0] ?? null);

  const price = activeVariant ? Number(activeVariant.price) : null;
  const compareAt = activeVariant?.compareAtPrice
    ? Number(activeVariant.compareAtPrice)
    : null;
  const discount =
    price && compareAt && compareAt > price
      ? Math.round(((compareAt - price) / compareAt) * 100)
      : null;

  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();

  const handleAddToCart = useCallback(async () => {
    if (!activeVariant?.id) {
      toast.error("Please select an available variant");
      return;
    }
    try {
      await addToCart({ variantId: activeVariant.id, quantity }).unwrap();
      setAddedToCart(true);
      toast.success("Added to cart!");
      setTimeout(() => setAddedToCart(false), 2000);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add to cart");
    }
  }, [activeVariant?.id, quantity, addToCart]);

  const images = useMemo(() => {
    return [...(product?.images ?? [])].sort(
      (a, b) => (a.isPrimary ? -1 : b.isPrimary ? 1 : a.sortOrder - b.sortOrder)
    );
  }, [product?.images]);

  const variants = product?.variants ?? [];
  const hasVariants = variants.length > 0;

  // Auto-match gallery photo when variant is changed
  const activeVariantImageId = useMemo(() => {
    if (!activeVariant?.attributeValues?.length) return null;
    const variantAttrIds = new Set(
      activeVariant.attributeValues.map((av) => av.attributeValue?.id).filter(Boolean)
    );
    const match = images.find((img) =>
      img.attributeValues?.some((iav) => variantAttrIds.has(iav.attributeValueId))
    );
    return match?.id ?? null;
  }, [activeVariant, images]);

  // ── Loading ──
  if (isLoading) return <ProductDetailSkeleton />;

  // ── Error ──
  if (isError || !product) {
    return (
      <StoreContainer className="py-20 text-center">
        <p className="text-2xl font-bold">Product not found</p>
        <p className="mt-2 text-muted-foreground">
          The product you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link href="/products" className={buttonVariants({ className: "mt-6" })}>
          Browse Products
        </Link>
      </StoreContainer>
    );
  }

  return (
    <>
      <StoreContainer className="py-6 md:py-10">
        {/* ── Breadcrumb ─── */}
        <Breadcrumb
          name={product.name}
          category={primaryCategory?.category?.slug}
        />

        <div className="mt-6 grid gap-10 lg:grid-cols-[1fr_1fr] lg:gap-16">
          {/* ════════════════════════════════════════
              LEFT — Gallery
          ════════════════════════════════════════ */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <ProductGallery
              images={images}
              productName={product.name}
              activeImageId={activeVariantImageId}
            />
          </div>

          {/* ════════════════════════════════════════
              RIGHT — Product Info
          ════════════════════════════════════════ */}
          <div className="flex flex-col gap-5">
            {/* Brand */}
            {product.brand && (
              <Link
                href={`/products?brandId=${product.brand.id}`}
                className="text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors"
              >
                {product.brand.name}
              </Link>
            )}

            {/* Name */}
            <div className="flex flex-col gap-2">
              <h1 className="text-3xl font-black leading-tight tracking-tight">
                {product.name}
              </h1>
              {product.isFeatured && (
                <Badge className="w-fit bg-emerald-500 text-white text-[11px] font-bold">
                  Featured
                </Badge>
              )}
            </div>

            {/* Rating */}
            <RatingSummaryBadge
              count={reviewCount}
              rating={averageRating}
              onClick={() => {
                setActiveTab("reviews");
                const el = document.getElementById("product-tabs");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
            />

            {/* Price */}
            <div className="flex items-center gap-3">
              {price !== null ? (
                <>
                  <span className="text-3xl font-black">
                    ${price.toFixed(2)}
                  </span>
                  {compareAt && compareAt > price && (
                    <>
                      <span className="text-xl text-muted-foreground line-through">
                        ${compareAt.toFixed(2)}
                      </span>
                      <Badge className="bg-rose-500 text-white text-xs font-bold">
                        Save {discount}%
                      </Badge>
                    </>
                  )}
                </>
              ) : (
                <span className="text-xl text-muted-foreground">
                  Select a variant to see price
                </span>
              )}
            </div>

            {/* Short description */}
            {product.shortDescription && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {product.shortDescription}
              </p>
            )}

            <Separator />

            {/* ── Variant selector ── */}
            {hasVariants && (
              <VariantSelector
                variants={variants}
                selectedVariantId={activeVariant?.id ?? null}
                onSelect={(v) => {
                  setSelectedVariant(v);
                  setQuantity(1);
                }}
              />
            )}

            {/* ── Quantity ── */}
            <div className="flex flex-col gap-2">
              <span className="text-sm font-semibold">Quantity</span>
              <div className="flex items-center gap-3">
                <div className="flex items-center rounded-lg border bg-muted/30">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex size-10 items-center justify-center rounded-l-lg transition hover:bg-muted"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-12 text-center text-sm font-semibold">{quantity}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="flex size-10 items-center justify-center rounded-r-lg transition hover:bg-muted"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
                <span className="text-xs text-muted-foreground">
                  {activeVariant?.sku ? `SKU: ${activeVariant.sku}` : ""}
                </span>
              </div>
            </div>

            {/* ── CTA buttons ── */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={!activeVariant || addedToCart || isAddingToCart}
                className={cn(
                  "h-12 flex-1 gap-2 text-base font-bold transition-all",
                  addedToCart && "bg-emerald-600 hover:bg-emerald-600"
                )}
              >
                {addedToCart ? (
                  <>
                    <Check className="size-5" />
                    Added to Cart
                  </>
                ) : (
                  <>
                    <ShoppingCart className="size-5" />
                    Add to Cart
                  </>
                )}
              </Button>

              <button
                type="button"
                aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
                onClick={() => toggleWishlist(product)}
                className={cn(
                  "flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border transition-all",
                  wishlisted
                    ? "border-rose-300 bg-rose-50 text-rose-500 dark:bg-rose-950/30"
                    : "border-border bg-background hover:bg-muted"
                )}
              >
                <Heart
                  className={cn("size-5", wishlisted && "fill-rose-500 text-rose-500")}
                />
              </button>

              <button
                type="button"
                aria-label="Share product"
                onClick={() => {
                  if (typeof navigator !== "undefined" && navigator.share) {
                    navigator.share({ title: product.name, url: window.location.href });
                  }
                }}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-background transition hover:bg-muted"
              >
                <Share2 className="size-5" />
              </button>
            </div>

            {/* Buy now */}
            <Link
              href="/checkout"
              className={buttonVariants({ variant: "outline", size: "lg", className: "h-12 w-full text-base font-bold" })}
            >
              Buy Now
            </Link>

            {/* Coupon hint */}
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-border bg-muted/30 px-4 py-2.5 text-sm">
              <Tag className="size-4 text-primary shrink-0" />
              <span className="text-muted-foreground">
                Have a coupon? Apply it at{" "}
                <Link href="/checkout" className="text-primary font-semibold hover:underline">
                  checkout
                </Link>
              </span>
            </div>

            {/* Trust badges */}
            <TrustBadges />

            {/* Categories */}
            {product.categories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span className="font-medium">Categories:</span>
                {product.categories.map((c) =>
                  c.category ? (
                    <Link
                      key={c.categoryId}
                      href={`/category/${c.category.slug}`}
                      className="rounded-full border px-2.5 py-0.5 text-xs font-medium hover:border-foreground/30 hover:text-foreground transition-colors"
                    >
                      {c.category.name}
                    </Link>
                  ) : null
                )}
              </div>
            )}
          </div>
        </div>

        {/* ════════════════════════════════════════
            TABS SECTION — Description / Reviews / Specs
        ════════════════════════════════════════ */}
        <div className="mt-16" id="product-tabs">
          {/* Tab Navigation Bar */}
          <div className="border-b border-border">
            <div className="flex gap-4 sm:gap-8 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab("description")}
                className={cn(
                  "relative flex items-center gap-2 pb-3.5 text-sm font-semibold transition-colors whitespace-nowrap",
                  activeTab === "description"
                    ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <FileText className="size-4" />
                Description
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("reviews")}
                className={cn(
                  "relative flex items-center gap-2 pb-3.5 text-sm font-semibold transition-colors whitespace-nowrap",
                  activeTab === "reviews"
                    ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Star className="size-4" />
                Customer Reviews
                <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-xs font-semibold text-muted-foreground">
                  {reviewCount}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("specs")}
                className={cn(
                  "relative flex items-center gap-2 pb-3.5 text-sm font-semibold transition-colors whitespace-nowrap",
                  activeTab === "specs"
                    ? "text-foreground after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-primary"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <SlidersHorizontal className="size-4" />
                Specifications
              </button>
            </div>
          </div>

          {/* ── TAB 1: Description Content ── */}
          {activeTab === "description" && (
            <div className="mt-8 space-y-8 animate-in fade-in-50 duration-200">
              {product.description ? (
                <div className="prose prose-sm max-w-none text-foreground/90 dark:prose-invert">
                  <RichTextContent value={product.description} />
                </div>
              ) : product.shortDescription ? (
                <div className="rounded-xl border bg-muted/15 p-6">
                  <p className="text-base leading-relaxed text-foreground/90">
                    {product.shortDescription}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                  No detailed description has been added for this product yet.
                </div>
              )}

              {/* Product Feature Highlights */}
              <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-2xs">
                  <Award className="size-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold">Authentic Guaranteed</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">100% genuine sourced pieces.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-2xs">
                  <PackageCheck className="size-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold">Carefully Packed</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Protected and quality-checked.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-2xs">
                  <Truck className="size-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold">Tracked Dispatch</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Real-time status updates.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border bg-card p-4 shadow-2xs">
                  <RotateCcw className="size-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold">30-Day Guarantee</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">Simple hassle-free returns.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: Reviews Content ── */}
          {activeTab === "reviews" && (
            <div className="mt-8 space-y-8 animate-in fade-in-50 duration-200">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_1fr]">
                {/* Rating Overview Card */}
                <div className="flex flex-col gap-6 rounded-2xl border bg-card p-6 shadow-2xs">
                  <div>
                    <h3 className="text-base font-bold tracking-tight">Customer Rating</h3>
                    <p className="text-xs text-muted-foreground mt-1">Based on verified purchases</p>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="text-5xl font-black text-foreground">
                      {averageRating ? averageRating.toFixed(1) : "0.0"}
                    </span>
                    <div className="flex flex-col">
                      <StarRating rating={averageRating} size="md" />
                      <span className="text-xs text-muted-foreground mt-1">
                        {reviewCount} total {reviewCount === 1 ? "review" : "reviews"}
                      </span>
                    </div>
                  </div>

                  {/* Distribution breakdown */}
                  <div className="space-y-2 text-xs">
                    {[5, 4, 3, 2, 1].map((stars) => {
                      const count = ratingSummary?.distribution?.[String(stars) as "1"] ?? 0;
                      const pct = reviewCount > 0 ? Math.round((count / reviewCount) * 100) : 0;
                      return (
                        <div key={stars} className="flex items-center gap-2">
                          <span className="w-5 font-semibold text-muted-foreground">{stars}★</span>
                          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-amber-400 transition-all duration-300"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="w-8 text-right text-muted-foreground">{count}</span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="rounded-xl border bg-muted/30 p-4 text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground mb-1">Want to review this product?</p>
                    <p>Verified buyers can submit reviews directly from their delivered orders in the account area.</p>
                    <Link href="/account/orders" className="mt-2 inline-block font-semibold text-primary hover:underline">
                      View My Orders →
                    </Link>
                  </div>
                </div>

                {/* Reviews List */}
                <div className="flex flex-col gap-4">
                  {/* Reviews Header and Sorting */}
                  <div className="flex items-center justify-between pb-1">
                    <p className="text-xs font-semibold text-muted-foreground">
                      Customer Feedback ({reviewsList.length})
                    </p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground hidden sm:inline">Sort by:</span>
                      <select
                        value={reviewSort}
                        onChange={(e) => setReviewSort(e.target.value as any)}
                        className="h-8 rounded-lg border border-border bg-card px-2.5 text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="highest">Highest Rating</option>
                        <option value="lowest">Lowest Rating</option>
                      </select>
                    </div>
                  </div>

                  {isReviewsLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-28 w-full rounded-xl" />
                      <Skeleton className="h-28 w-full rounded-xl" />
                    </div>
                  ) : reviewsList.length > 0 ? (
                    <div className="space-y-4">
                      {reviewsList.map((rev) => (
                        <div key={rev.id} className="rounded-2xl border bg-card p-5 shadow-2xs">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                                {rev.user?.fullName?.charAt(0) || rev.user?.userName?.charAt(0) || "U"}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-semibold text-foreground">
                                    {rev.user?.fullName || rev.user?.userName || "Verified Customer"}
                                  </span>
                                  {rev.isVerifiedPurchase && (
                                    <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-[10px] text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                                      <CheckCircle2 className="size-3 mr-0.5" /> Verified Buyer
                                    </Badge>
                                  )}
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(rev.createdAt).toLocaleDateString(undefined, {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                            <StarRating rating={rev.rating} size="sm" />
                          </div>

                          {rev.title && (
                            <h4 className="mt-3 text-sm font-semibold text-foreground">{rev.title}</h4>
                          )}
                          {rev.comment && (
                            <p className="mt-1 text-sm text-muted-foreground leading-relaxed">
                              {rev.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed py-14 text-center">
                      <MessageSquare className="size-10 text-muted-foreground/40 mb-3" />
                      <h4 className="text-base font-bold text-foreground">No customer reviews yet</h4>
                      <p className="text-sm text-muted-foreground mt-1 max-w-sm">
                        Be the first to share your experience with this item once your order is delivered.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: Specifications Content (Mock Data) ── */}
          {activeTab === "specs" && (
            <div className="mt-8 space-y-8 animate-in fade-in-50 duration-200">
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Group 1: General Information */}
                <div className="rounded-2xl border bg-card p-6 shadow-2xs">
                  <div className="flex items-center gap-2 mb-4 border-b pb-3">
                    <Sparkles className="size-4 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                      General Information
                    </h3>
                  </div>
                  <dl className="divide-y text-sm">
                    <div className="flex justify-between py-2.5">
                      <dt className="text-muted-foreground font-medium">Product Name</dt>
                      <dd className="font-semibold text-foreground text-right">{product.name}</dd>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <dt className="text-muted-foreground font-medium">Brand</dt>
                      <dd className="font-semibold text-foreground text-right">{product.brand?.name || "Independent Brand"}</dd>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <dt className="text-muted-foreground font-medium">Model / Item Code</dt>
                      <dd className="font-mono text-xs font-semibold text-foreground text-right">{activeVariant?.sku || "PRD-2026-X1"}</dd>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <dt className="text-muted-foreground font-medium">Category</dt>
                      <dd className="font-semibold text-foreground text-right">
                        {product.categories.map((c) => c.category?.name).filter(Boolean).join(", ") || "Fashion & Lifestyle"}
                      </dd>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <dt className="text-muted-foreground font-medium">Origin</dt>
                      <dd className="font-semibold text-foreground text-right">Imported (Designed in EU)</dd>
                    </div>
                  </dl>
                </div>

                {/* Group 2: Materials & Construction */}
                <div className="rounded-2xl border bg-card p-6 shadow-2xs">
                  <div className="flex items-center gap-2 mb-4 border-b pb-3">
                    <Award className="size-4 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                      Materials & Build
                    </h3>
                  </div>
                  <dl className="divide-y text-sm">
                    <div className="flex justify-between py-2.5">
                      <dt className="text-muted-foreground font-medium">Primary Material</dt>
                      <dd className="font-semibold text-foreground text-right">100% Organic Combed Cotton</dd>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <dt className="text-muted-foreground font-medium">Fabric Finish</dt>
                      <dd className="font-semibold text-foreground text-right">Pre-shrunk, Bio-washed</dd>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <dt className="text-muted-foreground font-medium">Stitching</dt>
                      <dd className="font-semibold text-foreground text-right">Reinforced Double Needle</dd>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <dt className="text-muted-foreground font-medium">Fit & Silhouette</dt>
                      <dd className="font-semibold text-foreground text-right">True to size / Regular Fit</dd>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <dt className="text-muted-foreground font-medium">Breathability</dt>
                      <dd className="font-semibold text-foreground text-right">High Airflow Weave</dd>
                    </div>
                  </dl>
                </div>

                {/* Group 3: Dimensions & Weight */}
                <div className="rounded-2xl border bg-card p-6 shadow-2xs">
                  <div className="flex items-center gap-2 mb-4 border-b pb-3">
                    <PackageCheck className="size-4 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                      Dimensions & Packaging
                    </h3>
                  </div>
                  <dl className="divide-y text-sm">
                    <div className="flex justify-between py-2.5">
                      <dt className="text-muted-foreground font-medium">Net Weight</dt>
                      <dd className="font-semibold text-foreground text-right">Approx. 380g</dd>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <dt className="text-muted-foreground font-medium">Package Dimensions</dt>
                      <dd className="font-semibold text-foreground text-right">30cm × 22cm × 5cm</dd>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <dt className="text-muted-foreground font-medium">Packaging Type</dt>
                      <dd className="font-semibold text-foreground text-right">Eco-Friendly Recyclable Box</dd>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <dt className="text-muted-foreground font-medium">Included in Box</dt>
                      <dd className="font-semibold text-foreground text-right">Product, Tag & Care Card</dd>
                    </div>
                  </dl>
                </div>

                {/* Group 4: Care & Warranty */}
                <div className="rounded-2xl border bg-card p-6 shadow-2xs">
                  <div className="flex items-center gap-2 mb-4 border-b pb-3">
                    <RotateCcw className="size-4 text-primary" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-foreground">
                      Care & Warranty
                    </h3>
                  </div>
                  <dl className="divide-y text-sm">
                    <div className="flex justify-between py-2.5">
                      <dt className="text-muted-foreground font-medium">Washing</dt>
                      <dd className="font-semibold text-foreground text-right">Machine wash cold (30°C)</dd>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <dt className="text-muted-foreground font-medium">Drying</dt>
                      <dd className="font-semibold text-foreground text-right">Tumble dry low / Air dry</dd>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <dt className="text-muted-foreground font-medium">Manufacturer Warranty</dt>
                      <dd className="font-semibold text-foreground text-right">12 Months Limited</dd>
                    </div>
                    <div className="flex justify-between py-2.5">
                      <dt className="text-muted-foreground font-medium">Return Period</dt>
                      <dd className="font-semibold text-emerald-600 text-right">30-Day Hassle-Free Returns</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center pt-2">
                * Note: Specifications and material measurements are subject to standard manufacturing tolerances (±2%).
              </p>
            </div>
          )}
        </div>

        {/* ════════════════════════════════════════
            Related Products
        ════════════════════════════════════════ */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 border-t pt-14">
            <div className="mb-8 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-primary">You might also like</p>
                <h2 className="mt-1 text-2xl font-bold tracking-tight">Related Products</h2>
              </div>
              <Link
                href="/products"
                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </StoreContainer>
    </>
  );
}

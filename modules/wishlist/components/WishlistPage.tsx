"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ShoppingBag,
  ArrowRight,
  Package,
  MapPin,
  RotateCcw,
  UserRound,
  LogOut,
  RefreshCw,
  ExternalLink,
  LogIn,
} from "lucide-react";
import { toast } from "sonner";
import { StoreContainer } from "@/components/layout/store/StoreContainer";
import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/modules/wishlist/useWishlist";
import { useAddToCartMutation } from "@/modules/cart/cartApi";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import type { WishlistItem } from "@/modules/wishlist/wishlist.types";

export function WishlistPage() {
  const router = useRouter();
  const { items, isLoading, isFetching, refetch, toggleWishlist, isAuthenticated } =
    useWishlist();
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation();
  const [addingId, setAddingId] = useState<number | null>(null);

  const handleMoveToCart = async (item: WishlistItem) => {
    const activeVariant =
      item.product.variants?.find((v) => v.isActive) ?? item.product.variants?.[0];

    if (!activeVariant) {
      toast.error("This product currently has no available variants.");
      return;
    }

    try {
      setAddingId(item.id);
      await addToCart({ variantId: activeVariant.id, quantity: 1 }).unwrap();
      toast.success(`"${item.product.name}" added to cart!`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add to cart");
    } finally {
      setAddingId(null);
    }
  };

  return (
    <main className="min-h-[calc(100vh-5rem)] bg-muted/30 py-8 sm:py-12">
      <StoreContainer>
        {/* ── Breadcrumb ─── */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span>/</span>
          {isAuthenticated ? (
            <>
              <Link href="/account" className="hover:text-foreground">
                Account
              </Link>
              <span>/</span>
            </>
          ) : null}
          <span className="font-medium text-foreground">Wishlist</span>
        </nav>

        {/* ── Header ─── */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground">
              My Wishlist
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Keep track of products you love and want to shop later.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {!isAuthenticated && (
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "default", size: "sm" }),
                  "gap-1.5 text-xs font-semibold"
                )}
              >
                <LogIn className="size-3.5" />
                Sign in to sync wishlist
              </Link>
            )}
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "gap-1.5 text-xs font-semibold"
              )}
            >
              <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
              Refresh
            </button>
          </div>
        </div>

        {/* Guest Banner if not logged in */}
        {!isAuthenticated && items.length > 0 && (
          <div className="mb-6 flex items-center justify-between gap-4 rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs sm:text-sm text-foreground">
            <div className="flex items-center gap-2.5">
              <Heart className="size-4 text-rose-500 shrink-0" />
              <span>
                These items are currently saved in your browser. <strong>Sign in</strong> to sync your wishlist across all devices.
              </span>
            </div>
            <Link
              href="/login"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "text-xs font-semibold shrink-0"
              )}
            >
              Sign In
            </Link>
          </div>
        )}

        {/* Wishlist Items Content */}
        <section className="space-y-6">
          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="overflow-hidden rounded-xl border border-border bg-card p-4 space-y-3"
                >
                  <Skeleton className="aspect-[4/3] w-full rounded-lg" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/3" />
                  <div className="flex gap-2 pt-2">
                    <Skeleton className="h-9 flex-1 rounded-md" />
                    <Skeleton className="size-9 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : items.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-rose-50 text-rose-500 dark:bg-rose-950/40">
                <Heart className="size-7" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-foreground">
                Your wishlist is empty
              </h3>
              <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
                You haven&apos;t added any items to your wishlist yet. Explore our
                catalog and click the heart icon on any product to save it here.
              </p>
              <Link
                href="/products"
                className={cn(buttonVariants({ size: "default" }), "mt-6 gap-2")}
              >
                <ShoppingBag className="size-4" />
                Explore Products
              </Link>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">
                  Showing <strong className="text-foreground">{items.length}</strong> {items.length === 1 ? "saved item" : "saved items"}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
                {items.map((item) => {
                  const product = item.product;
                  const primaryImage =
                    product.images?.find((img) => img.isPrimary) ?? product.images?.[0];
                  const activeVariant =
                    product.variants?.find((v) => v.isActive) ?? product.variants?.[0];
                  const price = activeVariant ? Number(activeVariant.price) : null;
                  const compareAt = activeVariant?.compareAtPrice
                    ? Number(activeVariant.compareAtPrice)
                    : null;
                  const isAvailable = product.status === "ACTIVE" && Boolean(activeVariant);

                  return (
                    <div
                      key={item.id}
                      className="group relative flex flex-col justify-between overflow-hidden rounded-xl border border-border bg-card shadow-xs transition hover:shadow-md"
                    >
                      {/* Image & Badges */}
                      <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/40">
                        <Link href={`/products/${product.slug}`} className="block size-full">
                          {primaryImage ? (
                            <img
                              src={mediaUrl(primaryImage.imageUrl)}
                              alt={product.name}
                              className="size-full object-cover transition duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex size-full items-center justify-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                              No image
                            </div>
                          )}
                        </Link>

                        {/* Quick remove from Wishlist Button */}
                        <button
                          type="button"
                          aria-label="Remove from wishlist"
                          onClick={() => toggleWishlist(product.id, product.name)}
                          className="absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-full bg-background/90 text-rose-500 shadow-sm backdrop-blur-xs transition hover:bg-rose-50 hover:text-rose-600"
                        >
                          <Trash2 className="size-4" />
                        </button>

                        {/* Status Badge */}
                        <div className="absolute left-2.5 top-2.5">
                          {!isAvailable ? (
                            <Badge variant="outline" className="bg-background/90 text-[10px]">
                              Out of Stock
                            </Badge>
                          ) : compareAt && price && compareAt > price ? (
                            <Badge className="bg-rose-500 text-white text-[10px] font-bold">
                              -{Math.round(((compareAt - price) / compareAt) * 100)}%
                            </Badge>
                          ) : null}
                        </div>
                      </div>

                      {/* Product Info */}
                      <div className="flex flex-1 flex-col p-4">
                        {product.brand && (
                          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                            {product.brand.name}
                          </p>
                        )}

                        <Link
                          href={`/products/${product.slug}`}
                          className="mt-1 line-clamp-2 text-sm font-bold text-foreground transition hover:text-primary"
                        >
                          {product.name}
                        </Link>

                        {/* Price */}
                        <div className="mt-2 flex items-baseline gap-2">
                          {price !== null ? (
                            <>
                              <span className="text-base font-extrabold text-foreground">
                                ${price.toFixed(2)}
                              </span>
                              {compareAt && compareAt > price && (
                                <span className="text-xs text-muted-foreground line-through">
                                  ${compareAt.toFixed(2)}
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-muted-foreground">Price unavailable</span>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-4 flex items-center gap-2 pt-2 border-t border-border/50">
                          <Button
                            type="button"
                            size="sm"
                            disabled={!isAvailable || addingId === item.id}
                            onClick={() => handleMoveToCart(item)}
                            className="flex-1 gap-1.5 text-xs font-semibold"
                          >
                            <ShoppingCart className="size-3.5" />
                            {addingId === item.id ? "Adding..." : "Add to Cart"}
                          </Button>

                          <Link
                            href={`/products/${product.slug}`}
                            className={cn(
                              buttonVariants({ variant: "outline", size: "sm" }),
                              "size-9 p-0 text-muted-foreground hover:text-foreground"
                            )}
                            title="View Details"
                          >
                            <ExternalLink className="size-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </StoreContainer>
    </main>
  );
}

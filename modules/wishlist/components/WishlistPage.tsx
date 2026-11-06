"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  Trash2,
  ShoppingBag,
  RefreshCw,
  ExternalLink,
  LogIn,
} from "lucide-react";
import { toast } from "sonner";
import { buttonVariants, Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useWishlist } from "@/modules/wishlist/useWishlist";
import { useAddToCartMutation } from "@/modules/cart/cartApi";
import { mediaUrl } from "@/modules/catalog/catalog.utils";
import { AccountLayoutShell } from "@/modules/account/components/AccountLayoutShell";
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

  const breadcrumbs = isAuthenticated
    ? [
        { label: "Home", href: "/" },
        { label: "Account", href: "/account" },
        { label: "Wishlist" },
      ]
    : [{ label: "Home", href: "/" }, { label: "Wishlist" }];

  const actions = (
    <>
      {!isAuthenticated && (
        <Link
          href="/login"
          className={cn(
            buttonVariants({ variant: "default", size: "sm" }),
            "gap-1.5 text-xs font-bold shadow-xs"
          )}
        >
          <LogIn className="size-3.5" />
          <span>Sign In to Sync</span>
        </Link>
      )}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => refetch()}
        disabled={isFetching}
        className="gap-1.5 text-xs font-semibold"
      >
        <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
        <span>Refresh</span>
      </Button>
    </>
  );

  return (
    <AccountLayoutShell
      hideSidebar={!isAuthenticated}
      title="My Wishlist"
      description="Keep track of products you love and want to shop later."
      breadcrumbs={breadcrumbs}
      actions={actions}
    >
      {/* Guest Mode Banner (When not logged in) */}
      {!isAuthenticated && items.length > 0 && (
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 rounded-2xl border border-primary/25 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-4 sm:p-5 text-xs sm:text-sm text-foreground shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shrink-0 shadow-xs">
              <Heart className="size-4.5 fill-current" />
            </div>
            <div>
              <p className="font-bold text-foreground">Guest Wishlist Mode</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                These items are currently stored locally in this browser.{" "}
                <strong>Sign in</strong> to sync your wishlist across all devices.
              </p>
            </div>
          </div>
          <Link
            href="/login"
            className={cn(
              buttonVariants({ size: "sm" }),
              "text-xs font-bold shrink-0 self-start sm:self-auto rounded-xl shadow-xs"
            )}
          >
            Sign In Now
          </Link>
        </div>
      )}

      {/* Wishlist Items Content */}
      <section className="space-y-6">
        {isLoading ? (
          <div
            className={cn(
              "grid gap-4 sm:grid-cols-2",
              isAuthenticated ? "lg:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-3 xl:grid-cols-4"
            )}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl border border-border bg-card p-4 space-y-3 shadow-2xs"
              >
                <Skeleton className="aspect-[4/3] w-full rounded-xl" />
                <Skeleton className="h-4 w-3/4 rounded-md" />
                <Skeleton className="h-4 w-1/3 rounded-md" />
                <div className="flex gap-2 pt-2">
                  <Skeleton className="h-9 flex-1 rounded-xl" />
                  <Skeleton className="size-9 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border/80 bg-card p-8 sm:p-14 text-center shadow-xs">
            <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-500 dark:bg-rose-950/40 shadow-xs">
              <Heart className="size-7" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-foreground">
              Your wishlist is empty
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto leading-relaxed">
              You haven&apos;t added any items to your wishlist yet. Explore our
              catalog and click the heart icon on any product to save it here.
            </p>
            <Link
              href="/products"
              className={cn(buttonVariants({ size: "default" }), "mt-6 gap-2 rounded-xl font-bold shadow-md")}
            >
              <ShoppingBag className="size-4" />
              <span>Explore Products</span>
            </Link>
          </div>
        ) : (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">
                Showing <strong className="text-foreground">{items.length}</strong>{" "}
                {items.length === 1 ? "saved item" : "saved items"}
              </p>
            </div>

            <div
              className={cn(
                "grid gap-4 sm:grid-cols-2",
                isAuthenticated ? "lg:grid-cols-2 xl:grid-cols-3" : "md:grid-cols-3 xl:grid-cols-4"
              )}
            >
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
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-border/80 bg-card shadow-xs transition-all duration-300 hover:shadow-md hover:border-primary/40"
                  >
                    {/* Image & Badges */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden bg-muted/40">
                      <Link href={`/products/${product.slug}`} className="block size-full">
                        {primaryImage ? (
                          <img
                            src={mediaUrl(primaryImage.imageUrl)}
                            alt={product.name}
                            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                        className="absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-full bg-background/90 text-rose-500 shadow-sm backdrop-blur-xs transition hover:bg-rose-50 hover:text-rose-600 cursor-pointer"
                        title="Remove from wishlist"
                      >
                        <Trash2 className="size-4" />
                      </button>

                      {/* Status Badge */}
                      <div className="absolute left-2.5 top-2.5">
                        {!isAvailable ? (
                          <Badge variant="outline" className="bg-background/90 text-[10px] font-bold">
                            Out of Stock
                          </Badge>
                        ) : compareAt && price && compareAt > price ? (
                          <Badge className="bg-destructive text-white text-[10px] font-bold border-0 shadow-xs">
                            -{Math.round(((compareAt - price) / compareAt) * 100)}%
                          </Badge>
                        ) : null}
                      </div>
                    </div>

                    {/* Details & Cart CTA */}
                    <div className="flex flex-1 flex-col justify-between p-4">
                      <div>
                        {product.brand && (
                          <p className="text-[11px] font-semibold text-muted-foreground tracking-wide uppercase truncate mb-1">
                            {product.brand.name}
                          </p>
                        )}
                        <h4 className="font-semibold text-sm leading-snug line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                          <Link href={`/products/${product.slug}`}>
                            {product.name}
                          </Link>
                        </h4>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border/50">
                        <div className="flex items-center gap-2 mb-3">
                          {price !== null ? (
                            <span className="text-base font-extrabold text-foreground">
                              ৳{price.toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-sm text-muted-foreground">
                              Unavailable
                            </span>
                          )}
                          {compareAt && compareAt > (price ?? 0) && (
                            <span className="text-xs text-muted-foreground line-through">
                              ৳{compareAt.toLocaleString()}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            disabled={!isAvailable || addingId === item.id}
                            onClick={() => handleMoveToCart(item)}
                            className="flex-1 gap-1.5 text-xs font-bold rounded-xl h-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs active:scale-95 transition-all cursor-pointer"
                          >
                            <ShoppingCart className="size-3.5" />
                            <span>{addingId === item.id ? "Adding..." : "Add to Cart"}</span>
                          </Button>

                          <Link
                            href={`/products/${product.slug}`}
                            className={cn(
                              buttonVariants({ variant: "outline", size: "sm" }),
                              "size-10 p-0 rounded-xl text-muted-foreground hover:text-foreground shrink-0"
                            )}
                            title="View Details"
                          >
                            <ExternalLink className="size-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </AccountLayoutShell>
  );
}

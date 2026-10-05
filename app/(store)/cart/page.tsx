"use client";

import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  Trash2,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { StoreContainer } from "@/components/layout/store/StoreContainer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
  useAddToCartMutation,
} from "@/modules/cart/cartApi";
import { CartItemRow } from "@/modules/cart/components/CartItemRow";
import { CartSummaryCard } from "@/modules/cart/components/CartSummaryCard";
import { CartEmptyState } from "@/modules/cart/components/CartEmptyState";
import { CartSkeleton } from "@/modules/cart/components/CartSkeleton";
import { ProductCard } from "@/modules/product/components/store/ProductCard";
import { useListPublicProductsQuery } from "@/modules/product/productApi";
import type { Product } from "@/modules/product/types";

export default function CartPage() {
  const { data: cartData, isLoading: isCartLoading, isFetching } = useGetCartQuery();
  const [updateCartItem] = useUpdateCartItemMutation();
  const [removeCartItem] = useRemoveCartItemMutation();
  const [clearCart, { isLoading: isClearing }] = useClearCartMutation();
  const [addToCart] = useAddToCartMutation();

  // Recommendations
  const { data: recommendationsData } = useListPublicProductsQuery({
    limit: 4,
    isFeatured: true,
  });
  const recommendedProducts = recommendationsData?.data ?? [];

  const cart = cartData?.data;
  const items = cart?.items ?? [];
  const summary = cart?.summary ?? {
    itemCount: 0,
    subtotal: "0.00",
  };

  const hasUnavailableItems = items.some((item) => !item.isAvailable);

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    try {
      await updateCartItem({ itemId, quantity }).unwrap();
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to update quantity");
    }
  };

  const handleRemoveItem = async (itemId: number) => {
    try {
      await removeCartItem(itemId).unwrap();
      toast.success("Item removed from cart");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to remove item");
    }
  };

  const handleClearCart = async () => {
    if (!confirm("Are you sure you want to remove all items from your cart?")) {
      return;
    }
    try {
      await clearCart().unwrap();
      toast.success("Cart cleared");
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to clear cart");
    }
  };

  const handleQuickAdd = async (product: Product) => {
    const defaultVariant = product.variants?.find((v) => v.isActive) ?? product.variants?.[0];
    if (!defaultVariant) {
      toast.error("No available options for this product");
      return;
    }
    try {
      await addToCart({ variantId: defaultVariant.id, quantity: 1 }).unwrap();
      toast.success(`Added ${product.name} to cart`);
    } catch (err: any) {
      toast.error(err?.data?.message || "Failed to add to cart");
    }
  };

  return (
    <StoreContainer className="py-8 md:py-12">
      {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
        <Link href="/" className="transition hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <span className="font-medium text-foreground">Cart</span>
      </nav>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            Shopping Cart
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {summary.itemCount === 0
              ? "Your cart is currently empty"
              : `You have ${summary.itemCount} ${
                  summary.itemCount === 1 ? "item" : "items"
                } in your cart`}
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={handleClearCart}
            disabled={isClearing}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition hover:text-destructive self-start sm:self-auto"
          >
            <Trash2 className="size-3.5" />
            Clear entire cart
          </button>
        )}
      </div>

      {/* ── Content ─────────────────────────────────────────────────────── */}
      {isCartLoading ? (
        <CartSkeleton />
      ) : items.length === 0 ? (
        <div className="space-y-16">
          <CartEmptyState />

          {/* Recommended products when cart is empty */}
          {recommendedProducts.length > 0 && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground">
                    Popular Products
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Top trending products you might like
                  </p>
                </div>
                <Link
                  href="/products"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View all
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {recommendedProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAddToCart={handleQuickAdd}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px] lg:items-start">
            {/* ── Left Column: Items List ────────────────────────────────── */}
            <div className="space-y-4">
              <div className="space-y-3">
                {items.map((item) => (
                  <CartItemRow
                    key={item.id}
                    item={item}
                    onUpdateQuantity={handleUpdateQuantity}
                    onRemove={handleRemoveItem}
                  />
                ))}
              </div>

              {/* Bottom Return CTA */}
              <div className="pt-4">
                <Link
                  href="/products"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "gap-2 text-muted-foreground hover:text-foreground"
                  )}
                >
                  <ArrowLeft className="size-4" />
                  Continue Shopping
                </Link>
              </div>
            </div>

            {/* ── Right Column: Order Summary ────────────────────────────── */}
            <div className="lg:sticky lg:top-24">
              <CartSummaryCard
                summary={summary}
                hasUnavailableItems={hasUnavailableItems}
              />
            </div>
          </div>

          {/* ── Recommended Products Upsell ──────────────────────────────── */}
          {recommendedProducts.length > 0 && (
            <div className="border-t pt-12">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                    <Sparkles className="size-5 text-amber-500" />
                    You May Also Like
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Curated items based on your shopping bag
                  </p>
                </div>
                <Link
                  href="/products"
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  View more
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
                {recommendedProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAddToCart={handleQuickAdd}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </StoreContainer>
  );
}


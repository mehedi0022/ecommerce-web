"use client";

import { useMemo, useCallback, useState, useEffect } from "react";
import { toast } from "sonner";
import { useAppSelector } from "@/redux/hooks";
import {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} from "./wishlistApi";
import type { WishlistItem, WishlistProduct } from "./wishlist.types";
import type { Product } from "@/modules/product/types";

const GUEST_WISHLIST_STORAGE_KEY = "guest_wishlist_items";

// Helper to convert full Product to WishlistProduct
function toWishlistProduct(product: Product | WishlistProduct): WishlistProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    status: product.status,
    brandId: product.brandId,
    brand: product.brand,
    variants: (product.variants ?? []).map((v) => ({
      id: v.id,
      price: String(v.price),
      compareAtPrice: v.compareAtPrice ? String(v.compareAtPrice) : null,
      isActive: Boolean(v.isActive),
    })),
    images: (product.images ?? []).map((img) => ({
      id: img.id,
      imageUrl: img.imageUrl,
      isPrimary: Boolean(img.isPrimary),
      sortOrder: img.sortOrder ?? 0,
    })),
  };
}

export function useWishlist() {
  const user = useAppSelector((state) => state.auth.user);
  const isAuthenticated = Boolean(user);

  // ── Server Wishlist (for authenticated users) ──
  const {
    data: serverData,
    isLoading: isServerLoading,
    isFetching,
    refetch,
  } = useGetWishlistQuery(undefined, {
    skip: !isAuthenticated,
  });

  const [addToWishlistMutation, { isLoading: isAdding }] =
    useAddToWishlistMutation();
  const [removeFromWishlistMutation, { isLoading: isRemoving }] =
    useRemoveFromWishlistMutation();

  // ── Guest Wishlist (stored in localStorage) ──
  const [guestItems, setGuestItems] = useState<WishlistItem[]>([]);
  const [isGuestLoaded, setIsGuestLoaded] = useState(false);

  // Load guest wishlist on mount or when storage updates
  useEffect(() => {
    if (typeof window === "undefined") return;

    const loadLocalWishlist = () => {
      try {
        const stored = localStorage.getItem(GUEST_WISHLIST_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            setGuestItems(parsed);
          }
        } else {
          setGuestItems([]);
        }
      } catch (err) {
        console.error("Failed to parse guest wishlist from localStorage:", err);
      } finally {
        setIsGuestLoaded(true);
      }
    };

    loadLocalWishlist();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === GUEST_WISHLIST_STORAGE_KEY) {
        loadLocalWishlist();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  // Sync guest wishlist items to server upon login if any exist
  useEffect(() => {
    if (!isAuthenticated || !isGuestLoaded || guestItems.length === 0) return;

    const syncGuestItems = async () => {
      try {
        for (const item of guestItems) {
          try {
            await addToWishlistMutation(item.productId).unwrap();
          } catch {
            // Ignore if already wishlisted
          }
        }
        localStorage.removeItem(GUEST_WISHLIST_STORAGE_KEY);
        setGuestItems([]);
      } catch (err) {
        console.error("Failed to sync guest wishlist:", err);
      }
    };

    syncGuestItems();
  }, [isAuthenticated, isGuestLoaded, guestItems, addToWishlistMutation]);

  // Unified items list
  const items = useMemo(() => {
    if (isAuthenticated) {
      return serverData?.data ?? [];
    }
    return guestItems;
  }, [isAuthenticated, serverData, guestItems]);

  const count = useMemo(() => {
    if (isAuthenticated) {
      return serverData?.wishlistCount ?? items.length;
    }
    return guestItems.length;
  }, [isAuthenticated, serverData, items.length, guestItems.length]);

  const wishlistProductIds = useMemo(() => {
    return new Set(items.map((item) => item.productId));
  }, [items]);

  const isInWishlist = useCallback(
    (productId: number) => {
      return wishlistProductIds.has(productId);
    },
    [wishlistProductIds]
  );

  const toggleWishlist = useCallback(
    async (
      productOrId: number | Product | WishlistProduct,
      fallbackName?: string
    ) => {
      const productId =
        typeof productOrId === "number" ? productOrId : productOrId.id;
      const productName =
        typeof productOrId === "number"
          ? fallbackName
          : productOrId.name || fallbackName;

      const isWishlisted = wishlistProductIds.has(productId);

      if (isAuthenticated) {
        // Logged-in user: sync with API
        try {
          if (isWishlisted) {
            await removeFromWishlistMutation(productId).unwrap();
            toast.success(
              productName
                ? `Removed "${productName}" from wishlist`
                : "Removed from wishlist"
            );
          } else {
            await addToWishlistMutation(productId).unwrap();
            toast.success(
              productName
                ? `Added "${productName}" to wishlist`
                : "Added to wishlist"
            );
          }
        } catch (err: any) {
          toast.error(
            err?.data?.message || "Failed to update wishlist. Please try again."
          );
        }
      } else {
        // Guest user: save to localStorage
        try {
          let updated: WishlistItem[];
          if (isWishlisted) {
            updated = guestItems.filter((i) => i.productId !== productId);
            toast.success(
              productName
                ? `Removed "${productName}" from wishlist`
                : "Removed from wishlist"
            );
          } else {
            // Build full or fallback item
            let wishProduct: WishlistProduct;
            if (typeof productOrId === "object" && productOrId !== null) {
              wishProduct = toWishlistProduct(productOrId);
            } else {
              wishProduct = {
                id: productId,
                name: productName || `Product #${productId}`,
                slug: `product-${productId}`,
                status: "ACTIVE",
                variants: [],
                images: [],
              };
            }

            const newItem: WishlistItem = {
              id: Date.now(),
              productId,
              createdAt: new Date().toISOString(),
              product: wishProduct,
            };

            updated = [newItem, ...guestItems];
            toast.success(
              productName
                ? `Added "${productName}" to wishlist`
                : "Added to wishlist"
            );
          }

          setGuestItems(updated);
          if (typeof window !== "undefined") {
            localStorage.setItem(
              GUEST_WISHLIST_STORAGE_KEY,
              JSON.stringify(updated)
            );
          }
        } catch (err) {
          console.error("Local wishlist storage failed:", err);
          toast.error("Could not save to local wishlist");
        }
      }
    },
    [
      isAuthenticated,
      wishlistProductIds,
      guestItems,
      addToWishlistMutation,
      removeFromWishlistMutation,
    ]
  );

  return {
    items,
    count,
    isLoading: isAuthenticated ? isServerLoading : !isGuestLoaded,
    isFetching,
    isUpdating: isAdding || isRemoving,
    isInWishlist,
    toggleWishlist,
    refetch,
    isAuthenticated,
  };
}

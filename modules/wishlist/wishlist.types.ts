import type { Product } from "@/modules/product/types";

export interface WishlistProductVariant {
  id: number;
  price: string;
  compareAtPrice: string | null;
  isActive: boolean;
}

export interface WishlistProductImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface WishlistProduct {
  id: number;
  name: string;
  slug: string;
  status: "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";
  brandId?: number | null;
  brand?: {
    id: number;
    name: string;
    slug: string;
  } | null;
  variants: WishlistProductVariant[];
  images: WishlistProductImage[];
}

export interface WishlistItem {
  id: number;
  userId?: number;
  productId: number;
  createdAt: string;
  product: WishlistProduct;
}

export interface WishlistPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface WishlistApiResponse {
  success: boolean;
  message: string;
  data: WishlistItem[];
  meta: WishlistPaginationMeta;
  wishlistCount: number;
}

export interface WishlistAddResponse {
  success: boolean;
  message: string;
  data: {
    id: number;
    userId: number;
    productId: number;
    createdAt: string;
  };
}

export interface WishlistRemoveResponse {
  success: boolean;
  message: string;
  data: null;
}

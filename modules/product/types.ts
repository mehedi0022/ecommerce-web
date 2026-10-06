import type {
  ApiMessageResponse,
  ApiResponse,
  PaginatedApiResponse,
} from "@/types/api.types";
export type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";
export interface ProductCategory {
  category?: { id: number; name: string; slug: string };
  categoryId: number;
  isPrimary?: boolean;
  sortOrder?: number;
}
export interface ProductImage {
  id: number;
  imageUrl: string;
  altText: string | null;
  isPrimary: boolean;
  sortOrder: number;
  attributeValues?: Array<{ attributeValueId: number }>;
}
export interface ProductAttributeValue {
  id: number;
  value: string;
  slug: string;
  attributeId: number;
  attribute?: { id: number; name: string; slug?: string };
}
export interface ProductVariant {
  id: number;
  productId: number;
  sku: string;
  price: string;
  compareAtPrice: string | null;
  costPrice: string | null;
  isActive: boolean;
  sortOrder: number;
  attributeValues?: Array<{ attributeValue: ProductAttributeValue }>;
}
export interface Product {
  brand?: { id: number; name: string; slug: string } | null;
  id: number;
  name: string;
  slug: string;
  shortDescription: string | null;
  description: string | null;
  brandId: number | null;
  status: ProductStatus;
  isFeatured: boolean;
  isFreeShipping?: boolean;
  isCodAvailable?: boolean;
  requiresAdvancePayment?: boolean;
  advancePaymentAmount?: string | number | null;
  categories: ProductCategory[];
  images?: ProductImage[];
  variants?: ProductVariant[];
  averageRating?: number;
  reviewCount?: number;
}
export interface ProductInput {
  name: string;
  shortDescription?: string | null;
  description?: string | null;
  brandId?: number | null;
  status?: ProductStatus;
  isFeatured?: boolean;
  isFreeShipping?: boolean;
  isCodAvailable?: boolean;
  requiresAdvancePayment?: boolean;
  advancePaymentAmount?: number | null;
  categories?: ProductCategory[];
}
export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductStatus;
  brandId?: number;
  brandIds?: string;
  categoryId?: number;
  categorySlug?: string;
  isFeatured?: boolean;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  inStock?: boolean;
  sortBy?: "id" | "name" | "createdAt" | "price" | "rating" | "isFeatured";
  sortOrder?: "asc" | "desc";
}
export interface VariantInput {
  sku: string;
  price: number;
  compareAtPrice?: number | null;
  costPrice?: number | null;
  isActive?: boolean;
  sortOrder?: number;
  attributeValueIds: number[];
}
export type ProductListResponse = PaginatedApiResponse<Product>;
export type ProductResponse = ApiResponse<Product>;
export type VariantResponse = ApiResponse<ProductVariant>;
export type MessageResponse = ApiMessageResponse;

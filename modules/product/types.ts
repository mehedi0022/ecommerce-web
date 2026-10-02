import type { ApiMessageResponse, ApiResponse, PaginatedApiResponse } from "@/types/api.types";
export type ProductStatus = "DRAFT" | "ACTIVE" | "INACTIVE" | "ARCHIVED";
export interface ProductCategory { categoryId: number; isPrimary?: boolean; sortOrder?: number; }
export interface ProductImage { id: number; imageUrl: string; altText: string | null; isPrimary: boolean; sortOrder: number; attributeValues?: Array<{ attributeValueId: number }>; }
export interface ProductAttributeValue { id: number; value: string; slug: string; attributeId: number; attribute?: { id: number; name: string; slug?: string }; }
export interface ProductVariant { id: number; productId: number; sku: string; price: string; compareAtPrice: string | null; costPrice: string | null; isActive: boolean; sortOrder: number; attributeValues?: Array<{ attributeValue: ProductAttributeValue }>; }
export interface Product { id: number; name: string; slug: string; shortDescription: string | null; description: string | null; brandId: number | null; status: ProductStatus; isFeatured: boolean; categories: ProductCategory[]; images?: ProductImage[]; variants?: ProductVariant[]; }
export interface ProductInput { name: string; shortDescription?: string | null; description?: string | null; brandId?: number | null; status?: ProductStatus; isFeatured?: boolean; categories?: ProductCategory[]; }
export interface ProductQuery { page?: number; limit?: number; search?: string; status?: ProductStatus; brandId?: number; categoryId?: number; }
export interface VariantInput { sku: string; price: number; compareAtPrice?: number | null; costPrice?: number | null; isActive?: boolean; sortOrder?: number; attributeValueIds: number[]; }
export type ProductListResponse = PaginatedApiResponse<Product>;
export type ProductResponse = ApiResponse<Product>;
export type VariantResponse = ApiResponse<ProductVariant>;
export type MessageResponse = ApiMessageResponse;

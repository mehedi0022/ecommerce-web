import type { ApiResponse, PaginatedApiResponse } from "@/types/api.types";

export type DiscountType = "PERCENTAGE" | "FIXED_AMOUNT";

export interface Coupon {
  id: number;
  code: string;
  name: string;
  description: string | null;
  discountType: DiscountType;
  discountValue: string | number;
  minimumOrderAmount: string | number | null;
  maximumDiscountAmount: string | number | null;
  usageLimit: number | null;
  usageLimitPerUser: number | null;
  startsAt: string | null;
  expiresAt: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CouponListQuery {
  page?: number;
  limit?: number;
  search?: string;
  discountType?: DiscountType;
  isActive?: boolean;
}

export interface CreateCouponInput {
  code: string;
  name: string;
  description?: string | null;
  discountType: DiscountType;
  discountValue: number;
  minimumOrderAmount?: number | null;
  maximumDiscountAmount?: number | null;
  usageLimit?: number | null;
  usageLimitPerUser?: number | null;
  startsAt?: string | null;
  expiresAt?: string | null;
  isActive?: boolean;
}

export type UpdateCouponInput = Partial<CreateCouponInput>;

export type CouponApiResponse = ApiResponse<Coupon>;
export type CouponListApiResponse = PaginatedApiResponse<Coupon>;

export interface ValidateCouponInput {
  code: string;
}

export interface CouponValidationData {
  code: string;
  discountType: DiscountType;
  discountValue: string;
  subtotal: string;
  discountAmount: string;
  message: string;
}

export type ValidateCouponApiResponse = ApiResponse<CouponValidationData>;

import type { ApiResponse, PaginatedApiResponse } from "@/types/api.types";

export interface ReviewUser {
  id: number;
  fullName: string | null;
  userName: string | null;
}

export interface ProductReview {
  id: number;
  productId: number;
  userId: number;
  orderItemId: number;
  rating: number;
  title: string | null;
  comment: string | null;
  status: "PENDING" | "APPROVED" | "REJECTED";
  isVerifiedPurchase: boolean;
  createdAt: string;
  updatedAt: string;
  approvedAt?: string | null;
  rejectedAt?: string | null;
  user?: ReviewUser;
  product?: {
    id: number;
    name: string;
    slug: string;
  };
  orderItem?: {
    id: number;
    orderId: number;
    productName: string;
    sku: string;
  };
}

export interface RatingSummary {
  averageRating: number;
  reviewCount: number;
  distribution: {
    "1": number;
    "2": number;
    "3": number;
    "4": number;
    "5": number;
  };
}

export interface CreateReviewInput {
  orderItemId: number;
  rating: number;
  title?: string | null;
  comment?: string | null;
}

export interface UpdateReviewInput {
  id: number;
  rating?: number;
  title?: string | null;
  comment?: string | null;
}

export type ReviewListResponse = PaginatedApiResponse<ProductReview>;
export type RatingSummaryResponse = ApiResponse<RatingSummary>;
export type CustomerReviewsResponse = ApiResponse<ProductReview[]>;
export type SingleReviewResponse = ApiResponse<ProductReview>;

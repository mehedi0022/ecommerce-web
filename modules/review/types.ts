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
  user?: ReviewUser;
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

export type ReviewListResponse = PaginatedApiResponse<ProductReview>;
export type RatingSummaryResponse = ApiResponse<RatingSummary>;


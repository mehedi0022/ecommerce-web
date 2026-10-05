import { baseApi } from "@/redux/baseApi";
import type { ApiResponse, PaginatedApiResponse } from "@/types/api.types";
import type {
  ProductReview,
  RatingSummary,
  RatingSummaryResponse,
} from "./types";

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductReviews: builder.query<
      PaginatedApiResponse<ProductReview>,
      { slug: string; page?: number; limit?: number }
    >({
      query: ({ slug, page = 1, limit = 10 }) => ({
        url: `/products/${slug}/reviews`,
        params: { page, limit },
      }),
      providesTags: ["Review"],
    }),
    getProductRatingSummary: builder.query<RatingSummaryResponse, string>({
      query: (slug) => `/products/${slug}/rating-summary`,
      providesTags: ["Review"],
    }),
  }),
});

export const { useGetProductReviewsQuery, useGetProductRatingSummaryQuery } =
  reviewApi;

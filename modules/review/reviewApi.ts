import { baseApi } from "@/redux/baseApi";
import type { ApiResponse, PaginatedApiResponse } from "@/types/api.types";
import type {
  ProductReview,
  RatingSummary,
  RatingSummaryResponse,
  CreateReviewInput,
  UpdateReviewInput,
  CustomerReviewsResponse,
  SingleReviewResponse,
} from "./types";

export const reviewApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProductReviews: builder.query<
      PaginatedApiResponse<ProductReview>,
      { slug: string; page?: number; limit?: number; sort?: "newest" | "oldest" | "highest" | "lowest" }
    >({
      query: ({ slug, page = 1, limit = 10, sort = "newest" }) => ({
        url: `/products/${slug}/reviews`,
        params: { page, limit, sort },
      }),
      providesTags: ["Review"],
    }),

    getProductRatingSummary: builder.query<RatingSummaryResponse, string>({
      query: (slug) => `/products/${slug}/rating-summary`,
      providesTags: ["Review"],
    }),

    getMyReviews: builder.query<CustomerReviewsResponse, void>({
      query: () => "/reviews/me",
      providesTags: ["Review"],
    }),

    createReview: builder.mutation<SingleReviewResponse, CreateReviewInput>({
      query: (body) => ({
        url: "/reviews",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Review"],
    }),

    updateReview: builder.mutation<SingleReviewResponse, UpdateReviewInput>({
      query: ({ id, ...body }) => ({
        url: `/reviews/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Review"],
    }),

    deleteReview: builder.mutation<ApiResponse<null>, number>({
      query: (id) => ({
        url: `/reviews/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Review"],
    }),
  }),
});

export const {
  useGetProductReviewsQuery,
  useGetProductRatingSummaryQuery,
  useGetMyReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewApi;

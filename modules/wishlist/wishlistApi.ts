import { baseApi } from "@/redux/baseApi";
import type {
  WishlistApiResponse,
  WishlistAddResponse,
  WishlistRemoveResponse,
} from "./wishlist.types";

export const wishlistApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getWishlist: builder.query<
      WishlistApiResponse,
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({
        url: "/wishlist",
        params: params || { page: 1, limit: 50 },
      }),
      transformResponse: (response: any) => {
        return {
          success: response?.success ?? true,
          message: response?.message ?? "",
          data: Array.isArray(response?.data)
            ? response.data
            : Array.isArray(response)
            ? response
            : [],
          meta: response?.meta ?? {
            page: 1,
            limit: 50,
            total: Array.isArray(response?.data) ? response.data.length : 0,
            totalPages: 1,
          },
          wishlistCount:
            typeof response?.wishlistCount === "number"
              ? response.wishlistCount
              : Array.isArray(response?.data)
              ? response.data.length
              : 0,
        };
      },
      providesTags: ["Wishlist"],
    }),

    addToWishlist: builder.mutation<WishlistAddResponse, number>({
      query: (productId) => ({
        url: `/wishlist/items/${productId}`,
        method: "POST",
      }),
      invalidatesTags: ["Wishlist"],
    }),

    removeFromWishlist: builder.mutation<WishlistRemoveResponse, number>({
      query: (productId) => ({
        url: `/wishlist/items/${productId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Wishlist"],
    }),
  }),
});

export const {
  useGetWishlistQuery,
  useAddToWishlistMutation,
  useRemoveFromWishlistMutation,
} = wishlistApi;

import { baseApi } from "@/redux/baseApi";
import type {
  CartApiResponse,
  AddCartItemInput,
  UpdateCartItemInput,
} from "./cart.types";

export const cartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCart: builder.query<CartApiResponse, void>({
      query: () => "/cart",
      providesTags: ["Cart"],
    }),

    addToCart: builder.mutation<CartApiResponse, AddCartItemInput>({
      query: (data) => ({
        url: "/cart/items",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Cart"],
    }),

    updateCartItem: builder.mutation<CartApiResponse, UpdateCartItemInput>({
      query: ({ itemId, quantity }) => ({
        url: `/cart/items/${itemId}`,
        method: "PATCH",
        body: { quantity },
      }),
      invalidatesTags: ["Cart"],
    }),

    removeCartItem: builder.mutation<CartApiResponse, number>({
      query: (itemId) => ({
        url: `/cart/items/${itemId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),

    clearCart: builder.mutation<CartApiResponse, void>({
      query: () => ({
        url: "/cart/items",
        method: "DELETE",
      }),
      invalidatesTags: ["Cart"],
    }),
  }),
});

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveCartItemMutation,
  useClearCartMutation,
} = cartApi;


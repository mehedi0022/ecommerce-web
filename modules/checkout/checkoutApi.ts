import { baseApi } from "@/redux/baseApi";
import type {
  AuthenticatedCheckoutInput,
  GuestCheckoutInput,
  CheckoutApiResponse,
  ShippingMethodsApiResponse,
  SavedAddressesApiResponse,
} from "./checkout.types";

export const checkoutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    checkoutAuthenticated: builder.mutation<
      CheckoutApiResponse,
      AuthenticatedCheckoutInput
    >({
      query: (body) => ({
        url: "/checkout",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cart", "Order"],
    }),

    checkoutGuest: builder.mutation<CheckoutApiResponse, GuestCheckoutInput>({
      query: (body) => ({
        url: "/checkout/guest",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Cart", "Order"],
    }),

    getPublicShippingMethods: builder.query<ShippingMethodsApiResponse, void>({
      query: () => "/shipping/public-methods",
      providesTags: ["Shipping"],
    }),

    getSavedAddresses: builder.query<SavedAddressesApiResponse, void>({
      query: () => "/addresses",
      providesTags: ["Address"],
    }),
  }),
});

export const {
  useCheckoutAuthenticatedMutation,
  useCheckoutGuestMutation,
  useGetPublicShippingMethodsQuery,
  useGetSavedAddressesQuery,
} = checkoutApi;


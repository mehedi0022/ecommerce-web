import { baseApi } from "@/redux/baseApi";
import type {
  AuthenticatedCheckoutInput,
  GuestCheckoutInput,
  CheckoutApiResponse,
  ShippingMethodsApiResponse,
  SavedAddressesApiResponse,
  CalculateShippingApiResponse,
  CalculateShippingInput,
  SavedAddress,
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

    createAddress: builder.mutation<
      { success: boolean; message: string; data: SavedAddress },
      Partial<SavedAddress>
    >({
      query: (body) => ({
        url: "/addresses",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Address"],
    }),

    updateAddress: builder.mutation<
      { success: boolean; message: string; data: SavedAddress },
      { addressId: number; data: Partial<SavedAddress> }
    >({
      query: ({ addressId, data }) => ({
        url: `/addresses/${addressId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Address"],
    }),

    deleteAddress: builder.mutation<
      { success: boolean; message: string; data: null },
      number
    >({
      query: (addressId) => ({
        url: `/addresses/${addressId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Address"],
    }),

    setDefaultShippingAddress: builder.mutation<
      { success: boolean; message: string; data: SavedAddress },
      number
    >({
      query: (addressId) => ({
        url: `/addresses/${addressId}/default-shipping`,
        method: "PATCH",
      }),
      invalidatesTags: ["Address"],
    }),

    setDefaultBillingAddress: builder.mutation<
      { success: boolean; message: string; data: SavedAddress },
      number
    >({
      query: (addressId) => ({
        url: `/addresses/${addressId}/default-billing`,
        method: "PATCH",
      }),
      invalidatesTags: ["Address"],
    }),

    calculateShipping: builder.mutation<
      CalculateShippingApiResponse,
      CalculateShippingInput
    >({
      query: (body) => ({
        url: "/shipping/calculate",
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useCheckoutAuthenticatedMutation,
  useCheckoutGuestMutation,
  useGetPublicShippingMethodsQuery,
  useGetSavedAddressesQuery,
  useCreateAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultShippingAddressMutation,
  useSetDefaultBillingAddressMutation,
  useCalculateShippingMutation,
} = checkoutApi;


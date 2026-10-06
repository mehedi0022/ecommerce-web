import { baseApi } from "@/redux/baseApi";
import type {
  ShippingZonesApiResponse,
  ShippingZoneApiResponse,
  ShippingZoneLocationsApiResponse,
  ShippingZoneMethodsApiResponse,
  ShippingMethodsApiResponse,
  ShippingMethodApiResponse,
  CreateZoneInput,
  UpdateZoneInput,
  CreateZoneLocationInput,
  CreateZoneMethodInput,
  UpdateZoneMethodInput,
  CreateMethodInput,
  UpdateMethodInput,
} from "./shipping.types";

export * from "./shipping.types";

export const shippingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ── Shipping Zones ──
    listShippingZones: builder.query<ShippingZonesApiResponse, void>({
      query: () => "/shipping-zones",
      providesTags: ["Shipping"],
    }),

    getShippingZone: builder.query<ShippingZoneApiResponse, number>({
      query: (zoneId) => `/shipping-zones/${zoneId}`,
      providesTags: ["Shipping"],
    }),

    createShippingZone: builder.mutation<ShippingZoneApiResponse, CreateZoneInput>({
      query: (body) => ({
        url: "/shipping-zones",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Shipping"],
    }),

    updateShippingZone: builder.mutation<
      ShippingZoneApiResponse,
      { zoneId: number; data: UpdateZoneInput }
    >({
      query: ({ zoneId, data }) => ({
        url: `/shipping-zones/${zoneId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Shipping"],
    }),

    deleteShippingZone: builder.mutation<
      { success: boolean; message: string },
      number
    >({
      query: (zoneId) => ({
        url: `/shipping-zones/${zoneId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Shipping"],
    }),

    // ── Shipping Zone Locations ──
    listZoneLocations: builder.query<ShippingZoneLocationsApiResponse, number>({
      query: (zoneId) => `/shipping-zones/${zoneId}/locations`,
      providesTags: ["Shipping"],
    }),

    createZoneLocation: builder.mutation<
      { success: boolean; message: string },
      { zoneId: number; data: CreateZoneLocationInput }
    >({
      query: ({ zoneId, data }) => ({
        url: `/shipping-zones/${zoneId}/locations`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Shipping"],
    }),

    deleteZoneLocation: builder.mutation<
      { success: boolean; message: string },
      { zoneId: number; locationId: number }
    >({
      query: ({ zoneId, locationId }) => ({
        url: `/shipping-zones/${zoneId}/locations/${locationId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Shipping"],
    }),

    // ── Shipping Zone Methods ──
    listZoneMethods: builder.query<ShippingZoneMethodsApiResponse, number>({
      query: (zoneId) => `/shipping-zones/${zoneId}/methods`,
      providesTags: ["Shipping"],
    }),

    createZoneMethod: builder.mutation<
      { success: boolean; message: string },
      { zoneId: number; data: CreateZoneMethodInput }
    >({
      query: ({ zoneId, data }) => ({
        url: `/shipping-zones/${zoneId}/methods`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Shipping"],
    }),

    updateZoneMethod: builder.mutation<
      { success: boolean; message: string },
      { zoneId: number; zoneMethodId: number; data: UpdateZoneMethodInput }
    >({
      query: ({ zoneId, zoneMethodId, data }) => ({
        url: `/shipping-zones/${zoneId}/methods/${zoneMethodId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Shipping"],
    }),

    deleteZoneMethod: builder.mutation<
      { success: boolean; message: string },
      { zoneId: number; zoneMethodId: number }
    >({
      query: ({ zoneId, zoneMethodId }) => ({
        url: `/shipping-zones/${zoneId}/methods/${zoneMethodId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Shipping"],
    }),

    // ── Shipping Methods ──
    listShippingMethods: builder.query<ShippingMethodsApiResponse, void>({
      query: () => "/shipping-methods",
      providesTags: ["Shipping"],
    }),

    createShippingMethod: builder.mutation<
      ShippingMethodApiResponse,
      CreateMethodInput
    >({
      query: (body) => ({
        url: "/shipping-methods",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Shipping"],
    }),

    updateShippingMethod: builder.mutation<
      ShippingMethodApiResponse,
      { methodId: number; data: UpdateMethodInput }
    >({
      query: ({ methodId, data }) => ({
        url: `/shipping-methods/${methodId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Shipping"],
    }),

    deleteShippingMethod: builder.mutation<
      { success: boolean; message: string },
      number
    >({
      query: (methodId) => ({
        url: `/shipping-methods/${methodId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Shipping"],
    }),
  }),
});

export const {
  useListShippingZonesQuery,
  useGetShippingZoneQuery,
  useCreateShippingZoneMutation,
  useUpdateShippingZoneMutation,
  useDeleteShippingZoneMutation,
  useListZoneLocationsQuery,
  useCreateZoneLocationMutation,
  useDeleteZoneLocationMutation,
  useListZoneMethodsQuery,
  useCreateZoneMethodMutation,
  useUpdateZoneMethodMutation,
  useDeleteZoneMethodMutation,
  useListShippingMethodsQuery,
  useCreateShippingMethodMutation,
  useUpdateShippingMethodMutation,
  useDeleteShippingMethodMutation,
} = shippingApi;

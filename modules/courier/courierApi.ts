import { baseApi } from "@/redux/baseApi";
import type { ApiResponse } from "@/types/api.types";
import type {
  CourierProviderConfig,
  UpdateCourierProviderInput,
  CourierBalanceResult,
  BookCourierOrderInput,
  BookCourierOrderResult,
  CourierTrackingResult,
} from "./types";

export const courierApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ─── Provider Management ──────────────────────────────────
    getCourierProviders: builder.query<ApiResponse<CourierProviderConfig[]>, void>({
      query: () => "/courier/providers",
      providesTags: ["Courier"],
    }),

    getCourierProviderById: builder.query<ApiResponse<CourierProviderConfig>, number>({
      query: (id) => `/courier/providers/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Courier", id }],
    }),

    updateCourierProvider: builder.mutation<
      ApiResponse<CourierProviderConfig>,
      { id: number; data: UpdateCourierProviderInput }
    >({
      query: ({ id, data }) => ({
        url: `/courier/providers/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Courier"],
    }),

    checkCourierBalance: builder.query<
      ApiResponse<CourierBalanceResult>,
      string
    >({
      query: (code) => `/courier/providers/${code}/balance`,
    }),

    bookCourierOrder: builder.mutation<
      ApiResponse<BookCourierOrderResult>,
      { orderNumber: string; data?: BookCourierOrderInput }
    >({
      query: ({ orderNumber, data }) => ({
        url: `/courier/orders/${orderNumber}/book`,
        method: "POST",
        body: data || {},
      }),
      invalidatesTags: ["Order", "Shipment"],
    }),

    bulkBookCourierOrders: builder.mutation<
      ApiResponse<import("./types").BulkBookCourierResult>,
      import("./types").BulkBookCourierInput
    >({
      query: (body) => ({
        url: "/courier/orders/bulk-book",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Order", "Shipment"],
    }),

    trackCourierOrder: builder.query<
      ApiResponse<CourierTrackingResult>,
      string
    >({
      query: (orderNumber) => `/courier/orders/${orderNumber}/track`,
      providesTags: (_res, _err, orderNumber) => [
        { type: "Shipment", id: orderNumber },
      ],
    }),

    getCourierStores: builder.query<
      ApiResponse<any[]>,
      string
    >({
      query: (code) => `/courier/providers/${code}/stores`,
    }),

    syncCourierOrderStatus: builder.mutation<
      ApiResponse<any>,
      string
    >({
      query: (orderNumber) => ({
        url: `/courier/orders/${orderNumber}/sync`,
        method: "POST",
      }),
      invalidatesTags: ["Order", "Shipment"],
    }),

    syncActiveCourierShipments: builder.mutation<
      ApiResponse<{ totalChecked: number; updatedCount: number; results: any[] }>,
      void
    >({
      query: () => ({
        url: "/courier/sync-active",
        method: "POST",
      }),
      invalidatesTags: ["Order", "Shipment"],
    }),
  }),
});

export const {
  useGetCourierProvidersQuery,
  useGetCourierProviderByIdQuery,
  useUpdateCourierProviderMutation,
  useLazyCheckCourierBalanceQuery,
  useBookCourierOrderMutation,
  useBulkBookCourierOrdersMutation,
  useTrackCourierOrderQuery,
  useLazyTrackCourierOrderQuery,
  useLazyGetCourierStoresQuery,
  useSyncCourierOrderStatusMutation,
  useSyncActiveCourierShipmentsMutation,
} = courierApi;

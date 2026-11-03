import { baseApi } from "@/redux/baseApi";
import type { ApiResponse, PaginatedApiResponse } from "@/types/api.types";
import type {
  IncompleteOrder,
  CaptureIncompleteOrderInput,
  UpdateIncompleteOrderInput,
  IncompleteOrderQuery,
  IncompleteOrderMetrics,
  ConvertIncompleteOrderInput,
} from "./types";

export const incompleteOrderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Public capture endpoint
    captureIncompleteOrder: builder.mutation<ApiResponse<IncompleteOrder>, CaptureIncompleteOrderInput>({
      query: (body) => ({
        url: "/incomplete-orders/capture",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "IncompleteOrder", id: "LIST" }],
    }),

    // Admin CRM endpoints
    listIncompleteOrders: builder.query<PaginatedApiResponse<IncompleteOrder>, IncompleteOrderQuery | void>({
      query: (params) => ({
        url: "/incomplete-orders",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "IncompleteOrder" as const, id })),
              { type: "IncompleteOrder", id: "LIST" },
            ]
          : [{ type: "IncompleteOrder", id: "LIST" }],
    }),

    getIncompleteOrderMetrics: builder.query<ApiResponse<IncompleteOrderMetrics>, void>({
      query: () => "/incomplete-orders/metrics",
      providesTags: [{ type: "IncompleteOrder", id: "METRICS" }],
    }),

    getIncompleteOrder: builder.query<ApiResponse<IncompleteOrder>, number>({
      query: (id) => `/incomplete-orders/${id}`,
      providesTags: (_res, _err, id) => [{ type: "IncompleteOrder", id }],
    }),

    updateIncompleteOrder: builder.mutation<
      ApiResponse<IncompleteOrder>,
      { id: number; body: UpdateIncompleteOrderInput }
    >({
      query: ({ id, body }) => ({
        url: `/incomplete-orders/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_res, _err, { id }) => [
        { type: "IncompleteOrder", id },
        { type: "IncompleteOrder", id: "LIST" },
        { type: "IncompleteOrder", id: "METRICS" },
      ],
    }),

    convertIncompleteOrder: builder.mutation<
      ApiResponse<any>,
      { id: number; body?: ConvertIncompleteOrderInput } | number
    >({
      query: (arg) => {
        const id = typeof arg === "number" ? arg : arg.id;
        const body = typeof arg === "number" ? undefined : arg.body;
        return {
          url: `/incomplete-orders/${id}/convert`,
          method: "POST",
          body,
        };
      },
      invalidatesTags: (_res, _err, arg) => {
        const id = typeof arg === "number" ? arg : arg.id;
        return [
          { type: "IncompleteOrder", id },
          { type: "IncompleteOrder", id: "LIST" },
          { type: "IncompleteOrder", id: "METRICS" },
          { type: "Order", id: "LIST" },
        ];
      },
    }),
  }),
});

export const {
  useCaptureIncompleteOrderMutation,
  useListIncompleteOrdersQuery,
  useGetIncompleteOrderMetricsQuery,
  useGetIncompleteOrderQuery,
  useUpdateIncompleteOrderMutation,
  useConvertIncompleteOrderMutation,
} = incompleteOrderApi;

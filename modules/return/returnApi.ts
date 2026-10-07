import { baseApi } from "@/redux/baseApi";
import type { ApiResponse } from "@/types/api.types";
import type {
  Return,
  CreateReturnInput,
  TransitionReturnInput,
  InspectReturnItemInput,
} from "./return.types";

export const returnApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ─── Customer Endpoints ─────────────────────────────────
    getUserReturns: builder.query<ApiResponse<Return[]>, { page?: number; limit?: number; status?: string } | void>({
      query: (params) => ({
        url: "/returns",
        params: params || {},
      }),
      providesTags: ["Return"],
    }),

    getUserReturnByNumber: builder.query<ApiResponse<Return>, string>({
      query: (returnNumber) => `/returns/${returnNumber}`,
      providesTags: (_res, _err, returnNumber) => [{ type: "Return", id: returnNumber }],
    }),

    createReturnRequest: builder.mutation<
      ApiResponse<Return>,
      { orderNumber: string; data: CreateReturnInput }
    >({
      query: ({ orderNumber, data }) => ({
        url: `/orders/${orderNumber}/returns`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Return", "Order"],
    }),

    // ─── Admin Endpoints ────────────────────────────────────
    getAdminReturns: builder.query<
      ApiResponse<Return[]>,
      { page?: number; limit?: number; status?: string } | void
    >({
      query: (params) => ({
        url: "/admin/returns",
        params: params || {},
      }),
      providesTags: ["Return"],
    }),

    getAdminReturnByNumber: builder.query<ApiResponse<Return>, string>({
      query: (returnNumber) => `/admin/returns/${returnNumber}`,
      providesTags: (_res, _err, returnNumber) => [{ type: "Return", id: returnNumber }],
    }),

    transitionAdminReturn: builder.mutation<
      ApiResponse<Return>,
      { returnNumber: string; data: TransitionReturnInput }
    >({
      query: ({ returnNumber, data }) => ({
        url: `/admin/returns/${returnNumber}/transition`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Return", "Order"],
    }),

    inspectAdminReturnItem: builder.mutation<
      ApiResponse<any>,
      { returnNumber: string; itemId: number; data: InspectReturnItemInput }
    >({
      query: ({ returnNumber, itemId, data }) => ({
        url: `/admin/returns/${returnNumber}/items/${itemId}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Return", "Inventory"],
    }),
  }),
});

export const {
  useGetUserReturnsQuery,
  useGetUserReturnByNumberQuery,
  useCreateReturnRequestMutation,
  useGetAdminReturnsQuery,
  useGetAdminReturnByNumberQuery,
  useTransitionAdminReturnMutation,
  useInspectAdminReturnItemMutation,
} = returnApi;

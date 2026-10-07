import { baseApi } from "@/redux/baseApi";
import type { ApiResponse } from "@/types/api.types";
import type {
  Refund,
  CreateRefundInput,
  TransitionRefundInput,
} from "./refund.types";

export const refundApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminRefunds: builder.query<
      ApiResponse<Refund[]>,
      { page?: number; limit?: number; status?: string; method?: string } | void
    >({
      query: (params) => ({
        url: "/admin/refunds",
        params: params || {},
      }),
      providesTags: ["Refund"],
    }),

    getAdminRefundByNumber: builder.query<ApiResponse<Refund>, string>({
      query: (refundNumber) => `/admin/refunds/${refundNumber}`,
      providesTags: (_res, _err, refundNumber) => [{ type: "Refund", id: refundNumber }],
    }),

    createRefundForReturn: builder.mutation<
      ApiResponse<Refund>,
      { returnNumber: string; data: CreateRefundInput }
    >({
      query: ({ returnNumber, data }) => ({
        url: `/admin/returns/${returnNumber}/refunds`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Refund", "Return", "Order"],
    }),

    transitionAdminRefund: builder.mutation<
      ApiResponse<Refund>,
      { refundNumber: string; data: TransitionRefundInput }
    >({
      query: ({ refundNumber, data }) => ({
        url: `/admin/refunds/${refundNumber}/transition`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Refund", "Order"],
    }),
  }),
});

export const {
  useGetAdminRefundsQuery,
  useGetAdminRefundByNumberQuery,
  useCreateRefundForReturnMutation,
  useTransitionAdminRefundMutation,
} = refundApi;

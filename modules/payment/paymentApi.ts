import { baseApi } from "@/redux/baseApi";
import type {
  PaymentMethodListResponse,
  PaymentMethodResponse,
  CreatePaymentMethodInput,
  UpdatePaymentMethodInput,
  OrderTransactionsResponse,
  VerifyPaymentInput,
} from "./types";
import type { ApiMessageResponse } from "@/types/api.types";

export const paymentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Public active payment methods for storefront
    getPublicPaymentMethods: builder.query<PaymentMethodListResponse, void>({
      query: () => "/payments/public",
      providesTags: ["Payment"],
    }),

    // Admin list of all configured payment methods
    getAdminPaymentMethods: builder.query<PaymentMethodListResponse, void>({
      query: () => "/payments",
      providesTags: ["Payment"],
    }),

    // Admin get payment method by ID
    getPaymentMethodById: builder.query<PaymentMethodResponse, number>({
      query: (id) => `/payments/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Payment", id }],
    }),

    // Admin create new payment method
    createPaymentMethod: builder.mutation<PaymentMethodResponse, CreatePaymentMethodInput>({
      query: (body) => ({
        url: "/payments",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Payment"],
    }),

    // Admin update payment method
    updatePaymentMethod: builder.mutation<
      PaymentMethodResponse,
      { id: number; body: UpdatePaymentMethodInput }
    >({
      query: ({ id, body }) => ({
        url: `/payments/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Payment"],
    }),

    // Admin delete payment method
    deletePaymentMethod: builder.mutation<ApiMessageResponse, number>({
      query: (id) => ({
        url: `/payments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Payment"],
    }),

    // Admin get transactions for an order
    getOrderTransactions: builder.query<OrderTransactionsResponse, number>({
      query: (orderId) => `/payments/orders/${orderId}/transactions`,
      providesTags: (_res, _err, orderId) => [
        { type: "Payment", id: `order-${orderId}` },
        { type: "Order", id: orderId },
      ],
    }),

    // Admin verify transaction (Approve or Reject)
    verifyPaymentTransaction: builder.mutation<
      PaymentMethodResponse,
      { transactionId: number; orderId: number; body: VerifyPaymentInput }
    >({
      query: ({ transactionId, body }) => ({
        url: `/payments/transactions/${transactionId}/verify`,
        method: "POST",
        body,
      }),
      invalidatesTags: (_res, _err, { orderId }) => [
        "Payment",
        { type: "Order", id: orderId },
        { type: "Payment", id: `order-${orderId}` },
      ],
    }),

    // Initiate automated gateway payment session
    initiateGatewayPayment: builder.mutation<
      { success: boolean; data: { gatewayUrl: string; sessionKey?: string } },
      number
    >({
      query: (orderId) => ({
        url: `/payments/orders/${orderId}/initiate-gateway`,
        method: "POST",
      }),
    }),
  }),
});

export const {
  useGetPublicPaymentMethodsQuery,
  useGetAdminPaymentMethodsQuery,
  useGetPaymentMethodByIdQuery,
  useCreatePaymentMethodMutation,
  useUpdatePaymentMethodMutation,
  useDeletePaymentMethodMutation,
  useGetOrderTransactionsQuery,
  useVerifyPaymentTransactionMutation,
  useInitiateGatewayPaymentMutation,
} = paymentApi;

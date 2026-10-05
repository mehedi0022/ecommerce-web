import { baseApi } from "@/redux/baseApi";
import type {
  Order,
  OrderResponse,
  OrderListResponse,
  OrderListQuery,
} from "./order.types";

export const orderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getOrderByNumber: builder.query<OrderResponse, string>({
      query: (orderNumber) => `/orders/${orderNumber}`,
      providesTags: ["Order"],
    }),

    getGuestOrderByNumber: builder.query<
      OrderResponse,
      { orderNumber: string; accessToken: string }
    >({
      query: ({ orderNumber, accessToken }) => ({
        url: `/orders/guest/${orderNumber}`,
        params: { accessToken },
      }),
      providesTags: ["Order"],
    }),

    listCustomerOrders: builder.query<OrderListResponse, OrderListQuery | void>({
      query: (params) => ({
        url: "/orders",
        params: params ?? {},
      }),
      providesTags: ["Order"],
    }),
  }),
});

export const {
  useGetOrderByNumberQuery,
  useGetGuestOrderByNumberQuery,
  useListCustomerOrdersQuery,
} = orderApi;


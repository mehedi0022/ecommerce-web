import { baseApi } from "@/redux/baseApi";
import type {
  Order,
  OrderResponse,
  OrderListResponse,
  OrderListQuery,
  OrderTrackResponse,
  OrderTransitionInput,
  OrderUpdateAdminInput,
  CreateShipmentInput,
  TransitionShipmentInput,
} from "./order.types";

export * from "./order.types";

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

    listCustomerOrders: builder.query<OrderListResponse, OrderListQuery | void>(
      {
        query: (params) => ({
          url: "/orders",
          params: params ?? {},
        }),
        providesTags: ["Order"],
      },
    ),

    trackOrder: builder.query<
      OrderTrackResponse,
      { orderNumber: string; phone?: string }
    >({
      query: (params) => ({
        url: "/orders/track",
        params,
      }),
      providesTags: ["Order"],
    }),

    // ── Admin Order Management ──
    listAdminOrders: builder.query<OrderListResponse, OrderListQuery | void>({
      query: (params) => ({
        url: "/admin/orders",
        params: params ?? {},
      }),
      providesTags: ["Order"],
    }),

    getAdminOrderStatusCounts: builder.query<
      {
        success: boolean;
        message: string;
        data: {
          ALL: number;
          PENDING: number;
          CONFIRMED: number;
          PROCESSING: number;
          READY_TO_SHIP: number;
          SHIPPED: number;
          DELIVERED: number;
          CANCELLED: number;
          RETURNED: number;
        };
      },
      void
    >({
      query: () => "/admin/orders/counts",
      providesTags: ["Order"],
    }),

    getAdminOrder: builder.query<OrderResponse, string>({
      query: (orderNumber) => `/admin/orders/${orderNumber}`,
      providesTags: ["Order"],
    }),

    transitionOrderStatus: builder.mutation<
      OrderResponse,
      { orderNumber: string; data: OrderTransitionInput }
    >({
      query: ({ orderNumber, data }) => ({
        url: `/admin/orders/${orderNumber}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Order"],
    }),

    updateAdminOrder: builder.mutation<
      OrderResponse,
      { orderNumber: string; data: OrderUpdateAdminInput }
    >({
      query: ({ orderNumber, data }) => ({
        url: `/admin/orders/${orderNumber}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Order"],
    }),

    createOrderShipment: builder.mutation<
      { success: boolean; message: string; data: any },
      { orderNumber: string; data: CreateShipmentInput }
    >({
      query: ({ orderNumber, data }) => ({
        url: `/admin/orders/${orderNumber}/shipment`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Order", "Shipment"],
    }),

    transitionOrderShipment: builder.mutation<
      { success: boolean; message: string; data: any },
      { orderNumber: string; data: TransitionShipmentInput }
    >({
      query: ({ orderNumber, data }) => ({
        url: `/admin/orders/${orderNumber}/shipment/transition`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Order", "Shipment"],
    }),
  }),
});

export const {
  useGetOrderByNumberQuery,
  useGetGuestOrderByNumberQuery,
  useListCustomerOrdersQuery,
  useTrackOrderQuery,
  useLazyTrackOrderQuery,
  useListAdminOrdersQuery,
  useGetAdminOrderStatusCountsQuery,
  useGetAdminOrderQuery,
  useTransitionOrderStatusMutation,
  useUpdateAdminOrderMutation,
  useCreateOrderShipmentMutation,
  useTransitionOrderShipmentMutation,
} = orderApi;

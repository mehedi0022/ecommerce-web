import { baseApi } from "@/redux/baseApi";
import type {
  DashboardAnalyticsResponse,
  DashboardPeriod,
} from "./dashboard.types";

export const dashboardApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getDashboardAnalytics: builder.query<
      DashboardAnalyticsResponse,
      { period?: DashboardPeriod; startDate?: string; endDate?: string } | void
    >({
      query: (params) => ({
        url: "/analytics/dashboard",
        params: params || undefined,
      }),
      providesTags: ["Analytics", "Order", "Inventory", "Customer"],
    }),
  }),
});

export const { useGetDashboardAnalyticsQuery } = dashboardApi;

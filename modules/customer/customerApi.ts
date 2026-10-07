import { baseApi } from "@/redux/baseApi";
import type {
  CustomerListResponse,
  CustomerDetailResponse,
  CustomerListQuery,
} from "./customer.types";

export const customerApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getCustomers: builder.query<CustomerListResponse, CustomerListQuery | void>({
      query: (params) => ({
        url: "/customers",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data?.items
          ? [
              ...result.data.items.map(({ id }) => ({ type: "Customer" as const, id })),
              { type: "Customer", id: "LIST" },
            ]
          : [{ type: "Customer", id: "LIST" }],
    }),

    getCustomerById: builder.query<CustomerDetailResponse, number>({
      query: (id) => `/customers/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Customer", id }],
    }),

    changeCustomerStatus: builder.mutation<
      { success: boolean; message: string },
      { id: number; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/customers/${id}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Customer", id },
        { type: "Customer", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetCustomersQuery,
  useGetCustomerByIdQuery,
  useChangeCustomerStatusMutation,
} = customerApi;

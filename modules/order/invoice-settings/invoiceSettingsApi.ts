import { baseApi } from "@/redux/baseApi";
import type { ApiResponse } from "@/types/api.types";
import type { InvoiceSettings } from "./invoiceSettings";

export const invoiceSettingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInvoiceSettings: builder.query<ApiResponse<InvoiceSettings>, void>({
      query: () => "/settings/invoice",
      providesTags: ["Setting"],
    }),

    updateInvoiceSettings: builder.mutation<
      ApiResponse<InvoiceSettings>,
      Partial<InvoiceSettings>
    >({
      query: (data) => ({
        url: "/settings/invoice",
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Setting"],
    }),

    resetInvoiceSettings: builder.mutation<ApiResponse<InvoiceSettings>, void>({
      query: () => ({
        url: "/settings/invoice/reset",
        method: "POST",
      }),
      invalidatesTags: ["Setting"],
    }),
  }),
});

export const {
  useGetInvoiceSettingsQuery,
  useUpdateInvoiceSettingsMutation,
  useResetInvoiceSettingsMutation,
} = invoiceSettingsApi;

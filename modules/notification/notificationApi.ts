import { baseApi } from "@/redux/baseApi";
import type {
  SmsProviderConfig,
  NotificationTemplate,
  SmsLog,
  CreateSmsProviderInput,
  UpdateSmsProviderInput,
  UpdateNotificationTemplateInput,
  ProviderBalanceResult,
  SendTestSmsResult,
} from "./types";
import type { ApiResponse, ApiMessageResponse } from "@/types/api.types";

export const notificationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // ─── Providers ──────────────────────────────────────────
    getProviders: builder.query<ApiResponse<SmsProviderConfig[]>, void>({
      query: () => "/notifications/providers",
      providesTags: ["Notification"],
    }),

    getProviderById: builder.query<ApiResponse<SmsProviderConfig>, number>({
      query: (id) => `/notifications/providers/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Notification", id }],
    }),

    createProvider: builder.mutation<
      ApiResponse<SmsProviderConfig>,
      CreateSmsProviderInput
    >({
      query: (body) => ({
        url: "/notifications/providers",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notification"],
    }),

    updateProvider: builder.mutation<
      ApiResponse<SmsProviderConfig>,
      { id: number; body: UpdateSmsProviderInput }
    >({
      query: ({ id, body }) => ({
        url: `/notifications/providers/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Notification"],
    }),

    deleteProvider: builder.mutation<ApiMessageResponse, number>({
      query: (id) => ({
        url: `/notifications/providers/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Notification"],
    }),

    checkProviderBalance: builder.query<
      ApiResponse<ProviderBalanceResult>,
      number
    >({
      query: (id) => `/notifications/providers/${id}/balance`,
    }),

    // ─── Templates ──────────────────────────────────────────
    getTemplates: builder.query<ApiResponse<NotificationTemplate[]>, void>({
      query: () => "/notifications/templates",
      providesTags: ["Notification"],
    }),

    updateTemplate: builder.mutation<
      ApiResponse<NotificationTemplate>,
      { event: string; body: UpdateNotificationTemplateInput }
    >({
      query: ({ event, body }) => ({
        url: `/notifications/templates/${event}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Notification"],
    }),

    // ─── Test SMS ───────────────────────────────────────────
    sendTestSms: builder.mutation<
      ApiResponse<SendTestSmsResult>,
      { phone: string }
    >({
      query: (body) => ({
        url: "/notifications/test-sms",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Notification"],
    }),

    // ─── Logs ───────────────────────────────────────────────
    getSmsLogs: builder.query<ApiResponse<SmsLog[]>, { limit?: number } | void>({
      query: (params) => ({
        url: "/notifications/logs",
        params: params ? { limit: params.limit } : undefined,
      }),
      providesTags: ["Notification"],
    }),
  }),
});

export const {
  useGetProvidersQuery,
  useGetProviderByIdQuery,
  useCreateProviderMutation,
  useUpdateProviderMutation,
  useDeleteProviderMutation,
  useLazyCheckProviderBalanceQuery,
  useGetTemplatesQuery,
  useUpdateTemplateMutation,
  useSendTestSmsMutation,
  useGetSmsLogsQuery,
} = notificationApi;

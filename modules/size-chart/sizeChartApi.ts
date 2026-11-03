import { baseApi } from "@/redux/baseApi";
import type { ApiResponse } from "@/types/api.types";
import type { SizeChart, CreateSizeChartInput, UpdateSizeChartInput } from "./types";

export const sizeChartApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listSizeCharts: builder.query<ApiResponse<SizeChart[]>, void>({
      query: () => "/size-charts",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "SizeChart" as const, id })),
              { type: "SizeChart", id: "LIST" },
            ]
          : [{ type: "SizeChart", id: "LIST" }],
    }),

    listPublicSizeCharts: builder.query<ApiResponse<SizeChart[]>, void>({
      query: () => "/size-charts/public",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "SizeChart" as const, id })),
              { type: "SizeChart", id: "LIST" },
            ]
          : [{ type: "SizeChart", id: "LIST" }],
    }),

    getSizeChart: builder.query<ApiResponse<SizeChart>, number>({
      query: (id) => `/size-charts/${id}`,
      providesTags: (_result, _err, id) => [{ type: "SizeChart", id }],
    }),

    getPublicSizeChart: builder.query<ApiResponse<SizeChart>, number>({
      query: (id) => `/size-charts/public/${id}`,
      providesTags: (_result, _err, id) => [{ type: "SizeChart", id }],
    }),

    createSizeChart: builder.mutation<ApiResponse<SizeChart>, CreateSizeChartInput>({
      query: (body) => ({
        url: "/size-charts",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "SizeChart", id: "LIST" }],
    }),

    updateSizeChart: builder.mutation<
      ApiResponse<SizeChart>,
      { id: number; body: UpdateSizeChartInput }
    >({
      query: ({ id, body }) => ({
        url: `/size-charts/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: "SizeChart", id },
        { type: "SizeChart", id: "LIST" },
      ],
    }),

    deleteSizeChart: builder.mutation<ApiResponse<null>, number>({
      query: (id) => ({
        url: `/size-charts/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "SizeChart", id: "LIST" }],
    }),
  }),
});

export const {
  useListSizeChartsQuery,
  useListPublicSizeChartsQuery,
  useGetSizeChartQuery,
  useGetPublicSizeChartQuery,
  useCreateSizeChartMutation,
  useUpdateSizeChartMutation,
  useDeleteSizeChartMutation,
} = sizeChartApi;

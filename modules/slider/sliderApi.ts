import { baseApi } from "@/redux/baseApi";
import type { ApiResponse } from "@/types/api.types";
import type { Slider, CreateSliderInput, UpdateSliderInput } from "./types";

export const sliderApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listPublicSliders: builder.query<ApiResponse<Slider[]>, void>({
      query: () => "/sliders/public",
      providesTags: ["Slider"],
    }),

    listAdminSliders: builder.query<
      ApiResponse<Slider[]>,
      { activeOnly?: "true" | "false" } | void
    >({
      query: (params) => ({
        url: "/sliders",
        params: params || {},
      }),
      providesTags: ["Slider"],
    }),

    getSlider: builder.query<ApiResponse<Slider>, number>({
      query: (id) => `/sliders/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Slider", id }],
    }),

    createSlider: builder.mutation<ApiResponse<Slider>, CreateSliderInput>({
      query: (data) => ({
        url: "/sliders",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Slider"],
    }),

    updateSlider: builder.mutation<
      ApiResponse<Slider>,
      { id: number; data: UpdateSliderInput }
    >({
      query: ({ id, data }) => ({
        url: `/sliders/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Slider"],
    }),

    updateSliderStatus: builder.mutation<
      ApiResponse<Slider>,
      { id: number; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/sliders/${id}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: ["Slider"],
    }),

    reorderSlider: builder.mutation<
      ApiResponse<Slider>,
      { id: number; sortOrder: number }
    >({
      query: ({ id, sortOrder }) => ({
        url: `/sliders/${id}/reorder`,
        method: "PATCH",
        body: { sortOrder },
      }),
      invalidatesTags: ["Slider"],
    }),

    uploadSliderImage: builder.mutation<
      ApiResponse<Slider>,
      { id: number; file: File }
    >({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append("image", file);
        return {
          url: `/sliders/${id}/image`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Slider"],
    }),

    uploadSliderMobileImage: builder.mutation<
      ApiResponse<Slider>,
      { id: number; file: File }
    >({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append("image", file);
        return {
          url: `/sliders/${id}/mobile-image`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Slider"],
    }),

    deleteSlider: builder.mutation<ApiResponse<null>, number>({
      query: (id) => ({
        url: `/sliders/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Slider"],
    }),
  }),
});

export const {
  useListPublicSlidersQuery,
  useListAdminSlidersQuery,
  useGetSliderQuery,
  useCreateSliderMutation,
  useUpdateSliderMutation,
  useUpdateSliderStatusMutation,
  useReorderSliderMutation,
  useUploadSliderImageMutation,
  useUploadSliderMobileImageMutation,
  useDeleteSliderMutation,
} = sliderApi;

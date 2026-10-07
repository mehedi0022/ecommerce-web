import { baseApi } from "@/redux/baseApi";
import type { ApiResponse } from "@/types/api.types";
import type { Popup, CreatePopupInput, UpdatePopupInput } from "./types";

export const popupApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listPublicPopups: builder.query<ApiResponse<Popup[]>, void>({
      query: () => "/popups/public",
      providesTags: ["Popup"],
    }),

    listAdminPopups: builder.query<
      ApiResponse<Popup[]>,
      { activeOnly?: "true" | "false" } | void
    >({
      query: (params) => ({
        url: "/popups",
        params: params || {},
      }),
      providesTags: ["Popup"],
    }),

    getPopup: builder.query<ApiResponse<Popup>, number>({
      query: (id) => `/popups/${id}`,
      providesTags: (_res, _err, id) => [{ type: "Popup", id }],
    }),

    createPopup: builder.mutation<ApiResponse<Popup>, CreatePopupInput>({
      query: (data) => ({
        url: "/popups",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Popup"],
    }),

    updatePopup: builder.mutation<
      ApiResponse<Popup>,
      { id: number; data: UpdatePopupInput }
    >({
      query: ({ id, data }) => ({
        url: `/popups/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: ["Popup"],
    }),

    updatePopupStatus: builder.mutation<
      ApiResponse<Popup>,
      { id: number; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: `/popups/${id}/status`,
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: ["Popup"],
    }),

    uploadPopupImage: builder.mutation<
      ApiResponse<Popup>,
      { id: number; file: File }
    >({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append("image", file);
        return {
          url: `/popups/${id}/image`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: ["Popup"],
    }),

    deletePopup: builder.mutation<ApiResponse<null>, number>({
      query: (id) => ({
        url: `/popups/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Popup"],
    }),
  }),
});

export const {
  useListPublicPopupsQuery,
  useListAdminPopupsQuery,
  useGetPopupQuery,
  useCreatePopupMutation,
  useUpdatePopupMutation,
  useUpdatePopupStatusMutation,
  useUploadPopupImageMutation,
  useDeletePopupMutation,
} = popupApi;

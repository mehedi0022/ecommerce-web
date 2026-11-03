import { baseApi } from "@/redux/baseApi";
import type { ApiResponse, PaginatedApiResponse } from "@/types/api.types";
import type {
  LandingPage,
  CreateLandingPageInput,
  UpdateLandingPageInput,
  LandingPageQuery,
} from "./types";

export const landingPageApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listLandingPages: builder.query<PaginatedApiResponse<LandingPage>, LandingPageQuery | void>({
      query: (params) => ({
        url: "/landing-pages",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "LandingPage" as const, id })),
              { type: "LandingPage", id: "LIST" },
            ]
          : [{ type: "LandingPage", id: "LIST" }],
    }),

    getLandingPage: builder.query<ApiResponse<LandingPage>, number>({
      query: (id) => `/landing-pages/${id}`,
      providesTags: (_result, _err, id) => [{ type: "LandingPage", id }],
    }),

    getPublicLandingPage: builder.query<ApiResponse<LandingPage>, string>({
      query: (slug) => `/landing-pages/public/slug/${slug}`,
      providesTags: (result) => (result?.data ? [{ type: "LandingPage", id: result.data.id }] : []),
    }),

    createLandingPage: builder.mutation<ApiResponse<LandingPage>, CreateLandingPageInput>({
      query: (body) => ({
        url: "/landing-pages",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "LandingPage", id: "LIST" }],
    }),

    updateLandingPage: builder.mutation<
      ApiResponse<LandingPage>,
      { id: number; body: UpdateLandingPageInput }
    >({
      query: ({ id, body }) => ({
        url: `/landing-pages/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _err, { id }) => [
        { type: "LandingPage", id },
        { type: "LandingPage", id: "LIST" },
      ],
    }),

    deleteLandingPage: builder.mutation<ApiResponse<null>, number>({
      query: (id) => ({
        url: `/landing-pages/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "LandingPage", id: "LIST" }],
    }),

    uploadLandingPageImage: builder.mutation<ApiResponse<{ url: string; key: string }>, File>({
      query: (file) => {
        const body = new FormData();
        body.append("image", file);
        return {
          url: "/landing-pages/upload-image",
          method: "POST",
          body,
        };
      },
    }),
  }),
});

export const {
  useListLandingPagesQuery,
  useGetLandingPageQuery,
  useGetPublicLandingPageQuery,
  useCreateLandingPageMutation,
  useUpdateLandingPageMutation,
  useDeleteLandingPageMutation,
  useUploadLandingPageImageMutation,
} = landingPageApi;

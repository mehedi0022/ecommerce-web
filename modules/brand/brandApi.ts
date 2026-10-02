import { baseApi } from "@/redux/baseApi";
import type { ApiMessageResponse, ApiResponse, PaginatedApiResponse } from "@/types/api.types";
import type { Brand, BrandInput, BrandQuery } from "./types";
export const brandApi = baseApi.injectEndpoints({ endpoints: (builder) => ({
  uploadBrandLogo: builder.mutation<ApiResponse<Brand>, { id: number; file: File }>({ query: ({ id, file }) => { const body = new FormData(); body.append("image", file); return { url: `/brands/${id}/logo`, method: "POST", body }; }, invalidatesTags: ["Brand"] }),
  listBrands: builder.query<PaginatedApiResponse<Brand>, BrandQuery | void>({ query: (params) => ({ url: "/brands", params: params ?? {} }), providesTags: ["Brand"] }),
  getBrand: builder.query<ApiResponse<Brand>, number>({ query: (id) => "/brands/" + id, providesTags: ["Brand"] }),
  createBrand: builder.mutation<ApiResponse<Brand>, BrandInput>({ query: (body) => ({ url: "/brands", method: "POST", body }), invalidatesTags: ["Brand"] }),
  updateBrand: builder.mutation<ApiResponse<Brand>, { id: number; body: Partial<BrandInput> }>({ query: ({ id, body }) => ({ url: "/brands/" + id, method: "PATCH", body }), invalidatesTags: ["Brand"] }),
  updateBrandStatus: builder.mutation<ApiResponse<Brand>, { id: number; isActive: boolean }>({ query: ({ id, isActive }) => ({ url: "/brands/" + id + "/status", method: "PATCH", body: { isActive } }), invalidatesTags: ["Brand"] }),
  reorderBrand: builder.mutation<ApiResponse<Brand>, { id: number; sortOrder: number }>({ query: ({ id, sortOrder }) => ({ url: "/brands/" + id + "/reorder", method: "PATCH", body: { sortOrder } }), invalidatesTags: ["Brand"] }),
  deleteBrand: builder.mutation<ApiMessageResponse, number>({ query: (id) => ({ url: "/brands/" + id, method: "DELETE" }), invalidatesTags: ["Brand"] }),
}) });
export const { useListBrandsQuery, useGetBrandQuery, useCreateBrandMutation, useUpdateBrandMutation, useUpdateBrandStatusMutation, useReorderBrandMutation, useDeleteBrandMutation, useUploadBrandLogoMutation } = brandApi;


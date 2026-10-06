import { baseApi } from "@/redux/baseApi";
import type { ApiMessageResponse, ApiResponse } from "@/types/api.types";
import type {
  Category,
  CategoryInput,
  CategoryListResponse,
  CategoryQuery,
} from "./types";
export const categoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listPublicCategories: builder.query<CategoryListResponse, CategoryQuery | void>({
      query: (params) => ({ url: "/categories/public", params: params ?? {} }),
      providesTags: ["Category"],
    }),
    getPublicCategoryTree: builder.query<ApiResponse<Category[]>, void>({
      query: () => "/categories/public/tree",
      providesTags: ["Category"],
    }),
    listCategories: builder.query<CategoryListResponse, CategoryQuery | void>({
      query: (params) => ({ url: "/categories", params: params ?? {} }),
      providesTags: ["Category"],
    }),
    getCategoryTree: builder.query<ApiResponse<Category[]>, void>({
      query: () => "/categories/tree",
      providesTags: ["Category"],
    }),
    getCategory: builder.query<ApiResponse<Category>, number>({
      query: (id) => "/categories/" + id,
      providesTags: ["Category"],
    }),
    createCategory: builder.mutation<ApiResponse<Category>, CategoryInput>({
      query: (body) => ({ url: "/categories", method: "POST", body }),
      invalidatesTags: ["Category"],
    }),
    updateCategory: builder.mutation<
      ApiResponse<Category>,
      { id: number; body: Partial<CategoryInput> }
    >({
      query: ({ id, body }) => ({
        url: "/categories/" + id,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Category"],
    }),
    updateCategoryStatus: builder.mutation<
      ApiResponse<Category>,
      { id: number; isActive: boolean }
    >({
      query: ({ id, isActive }) => ({
        url: "/categories/" + id + "/status",
        method: "PATCH",
        body: { isActive },
      }),
      invalidatesTags: ["Category"],
    }),
    reorderCategory: builder.mutation<ApiResponse<Category>, { id: number; sortOrder: number }>({
      query: ({ id, sortOrder }) => ({ url: "/categories/" + id + "/reorder", method: "PATCH", body: { sortOrder } }),
      invalidatesTags: ["Category"],
    }),
    uploadCategoryImage: builder.mutation<ApiResponse<Category>, { id: number; file: File }>({
      query: ({ id, file }) => {
        const body = new FormData();
        body.append("image", file);
        return { url: "/categories/" + id + "/image", method: "POST", body };
      },
      invalidatesTags: ["Category"],
    }),
    deleteCategory: builder.mutation<ApiMessageResponse, number>({
      query: (id) => ({ url: "/categories/" + id, method: "DELETE" }),
      invalidatesTags: ["Category"],
    }),
  }),
});
export const {
  useListPublicCategoriesQuery,
  useGetPublicCategoryTreeQuery,
  useListCategoriesQuery,
  useGetCategoryTreeQuery,
  useGetCategoryQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useUpdateCategoryStatusMutation,
  useReorderCategoryMutation,
  useUploadCategoryImageMutation,
  useDeleteCategoryMutation,
} = categoryApi;

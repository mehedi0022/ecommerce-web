import { baseApi } from "@/redux/baseApi";
import type { ApiMessageResponse, ApiResponse, PaginatedApiResponse } from "@/types/api.types";
import type { Attribute, AttributeValue, CategoryAttribute } from "@/modules/attribute/types";

export const catalogApi = baseApi.injectEndpoints({ endpoints: b => ({
  catalogAttributes: b.query<Attribute[], void>({
    async queryFn(_arg, _api, _extra, query) {
      const rows: Attribute[] = [];
      for (let page = 1; ; page++) {
        const response = await query({ url: "/attributes", params: { page, limit: 100, sortOrder: "asc" } });
        if (response.error) return { error: response.error };
        const data = response.data as PaginatedApiResponse<Attribute>;
        rows.push(...data.data); if (page >= data.meta.totalPages) break;
      }
      return { data: rows };
    }, providesTags: ["Attribute"],
  }),
  createCatalogAttribute: b.mutation<ApiResponse<Attribute>, { name: string; sortOrder?: number }>({ query: body => ({ url: "/attributes", method: "POST", body }), invalidatesTags: ["Attribute"] }),
  updateCatalogAttribute: b.mutation<ApiResponse<Attribute>, { id: number; name: string; sortOrder?: number }>({ query: ({ id, ...body }) => ({ url: `/attributes/${id}`, method: "PATCH", body }), invalidatesTags: ["Attribute", "Category", "Product"] }),
  setCatalogAttributeStatus: b.mutation<ApiResponse<Attribute>, { id: number; isActive: boolean }>({ query: ({ id, isActive }) => ({ url: `/attributes/${id}/status`, method: "PATCH", body: { isActive } }), invalidatesTags: ["Attribute", "Category"] }),
  deleteCatalogAttribute: b.mutation<ApiMessageResponse, number>({ query: id => ({ url: `/attributes/${id}`, method: "DELETE" }), invalidatesTags: ["Attribute", "Category"] }),
  createCatalogValue: b.mutation<ApiResponse<AttributeValue>, { attributeId: number; value: string; sortOrder?: number }>({ query: ({ attributeId, ...body }) => ({ url: `/attributes/${attributeId}/values`, method: "POST", body }), invalidatesTags: ["Attribute", "Category"] }),
  updateCatalogValue: b.mutation<ApiResponse<AttributeValue>, { attributeId: number; id: number; value?: string; isActive?: boolean; sortOrder?: number }>({ query: ({ attributeId, id, ...body }) => ({ url: `/attributes/${attributeId}/values/${id}`, method: "PATCH", body }), invalidatesTags: ["Attribute", "Category", "Product"] }),
  deleteCatalogValue: b.mutation<ApiMessageResponse, { attributeId: number; id: number }>({ query: ({ attributeId, id }) => ({ url: `/attributes/${attributeId}/values/${id}`, method: "DELETE" }), invalidatesTags: ["Attribute", "Category"] }),
  categoryAssignments: b.query<ApiResponse<CategoryAttribute[]>, number>({ query: id => `/categories/${id}/attributes`, providesTags: ["Category", "Attribute"] }),
  replaceCategoryAssignments: b.mutation<ApiResponse<CategoryAttribute[]>, { id: number; attributes: CategoryAttribute[] }>({ query: ({ id, attributes }) => ({ url: `/categories/${id}/attributes`, method: "PUT", body: { attributes: attributes.map(({ attributeId, isRequired, sortOrder }) => ({ attributeId, isRequired, sortOrder })) } }), invalidatesTags: ["Category", "Product"] }),
}) });
export const { useCatalogAttributesQuery, useCreateCatalogAttributeMutation, useUpdateCatalogAttributeMutation, useSetCatalogAttributeStatusMutation, useDeleteCatalogAttributeMutation, useCreateCatalogValueMutation, useUpdateCatalogValueMutation, useDeleteCatalogValueMutation, useCategoryAssignmentsQuery, useReplaceCategoryAssignmentsMutation } = catalogApi;

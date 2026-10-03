import { baseApi } from "@/redux/baseApi";
import type { ApiResponse, PaginatedApiResponse } from "@/types/api.types";
import type { Category } from "@/modules/category/types";
import type { Brand } from "@/modules/brand/types";
import type { Attribute, AttributeValue } from "@/modules/attribute/types";
import type { Product, ProductImage, ProductVariant } from "./types";
import type { AttributeOption, EditorInitial, InventorySnapshot } from "./editor.types";

export const editorApi = baseApi.injectEndpoints({
  endpoints: b => ({
    uploadDescriptionImage: b.mutation<ApiResponse<{ url: string }>, File>({ query: file => { const body = new FormData(); body.append("image", file); return { url: "/products/description-images", method: "POST", body }; } }),
    editorOptions: b.query<{ categories: Category[]; brands: Brand[] }, void>({
      async queryFn(_arg, _api, _extra, query) {
        const result: { categories: Category[]; brands: Brand[] } = { categories: [], brands: [] };
        for (const resource of ["categories", "brands"] as const) {
          for (let page = 1; ; page++) {
            const response = await query({ url: `/${resource}`, params: { status: "ACTIVE", limit: 100, page } });
            if (response.error) return { error: response.error };
            const data = response.data as PaginatedApiResponse<Category & Brand>;
            result[resource].push(...data.data);
            if (page >= data.meta.totalPages) break;
          }
        }
        return { data: result };
      },
      providesTags: ["Category", "Brand"],
    }),
    editorAttributes: b.query<AttributeOption[], number>({
      async queryFn(categoryId, _api, _extra, query) {
        const response = await query(`/categories/${categoryId}/attributes`);
        if (response.error) return { error: response.error };
        const assignments = (response.data as ApiResponse<{ attributeId: number; isRequired: boolean }[]>).data;
        const result: AttributeOption[] = [];
        for (const assignment of assignments) {
          const [attribute, values] = await Promise.all([query(`/attributes/${assignment.attributeId}`), query(`/attributes/${assignment.attributeId}/values`)]);
          if (attribute.error) return { error: attribute.error };
          if (values.error) return { error: values.error };
          const item = (attribute.data as ApiResponse<Attribute>).data;
          // Keep a disabled required attribute visible as an empty selector, rather than silently ignoring the rule.
          if (!item.isActive && !assignment.isRequired) continue;
          result.push({ id: item.id, name: item.name, isRequired: assignment.isRequired, values: item.isActive ? (values.data as ApiResponse<AttributeValue[]>).data.filter(v => v.isActive) : [] });
        }
        return { data: result };
      },
      providesTags: ["Attribute", "Category"],
    }),
    editorInitial: b.query<EditorInitial, number>({
      async queryFn(id, _api, _extra, query) {
        const [product, variants, images] = await Promise.all([query(`/products/${id}`), query(`/products/${id}/variants`), query(`/products/${id}/images`)]);
        if (product.error) return { error: product.error };
        if (variants.error) return { error: variants.error };
        if (images.error) return { error: images.error };
        const rows = (variants.data as ApiResponse<ProductVariant[]>).data;
        const inventory: Record<number, InventorySnapshot | null> = {};
        for (const row of rows) {
          const stock = await query(`/variants/${row.id}/inventory`);
          if (stock.error) {
            if (stock.error.status !== 404 || (stock.error.data as { message?: string })?.message !== "Inventory is not initialized") return { error: stock.error };
            inventory[row.id] = null;
          } else inventory[row.id] = (stock.data as ApiResponse<InventorySnapshot>).data;
        }
        return { data: { product: (product.data as ApiResponse<Product>).data, variants: rows, images: (images.data as ApiResponse<ProductImage[]>).data, inventory } };
      },
      // Deliberately refreshed on editor entry, not on every intermediate save.
    }),
    getEditorInventory: b.query<ApiResponse<InventorySnapshot>, number>({ query: id => `/variants/${id}/inventory` }),
    initializeEditorInventory: b.mutation<ApiResponse<InventorySnapshot>, { variantId: number; quantity: number; lowStockThreshold: number }>({
      query: ({ variantId, ...body }) => ({ url: `/variants/${variantId}/inventory/initialize`, method: "POST", body }),
      invalidatesTags: ["Inventory"],
    }),
    updateEditorImage: b.mutation<ApiResponse<ProductImage>, { productId: number; imageId: number; body: { altText: string; isPrimary: boolean; sortOrder: number; attributeValueIds: number[] } }>({
      query: ({ productId, imageId, body }) => ({ url: `/products/${productId}/images/${imageId}`, method: "PATCH", body }),
      invalidatesTags: ["Product"],
    }),
  }),
});
export const { useUploadDescriptionImageMutation, useEditorOptionsQuery, useEditorAttributesQuery, useEditorInitialQuery, useLazyGetEditorInventoryQuery, useInitializeEditorInventoryMutation, useUpdateEditorImageMutation } = editorApi;

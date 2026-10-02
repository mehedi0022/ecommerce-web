import { baseApi } from "@/redux/baseApi";
import type { ApiResponse, PaginatedApiResponse } from "@/types/api.types";
import type { Attribute, AttributeValue } from "./types";
export const attributeApi = baseApi.injectEndpoints({ endpoints: b => ({
  listAttributes: b.query<PaginatedApiResponse<Attribute>, void>({ query: () => ({ url: "/attributes", params: { page: 1, limit: 100, status: "ACTIVE" } }), providesTags: ["Attribute"] }),
  listAttributeValues: b.query<ApiResponse<AttributeValue[]>, number>({ query: id => "/attributes/" + id + "/values", providesTags: ["Attribute"] }),
})});
export const { useListAttributesQuery, useListAttributeValuesQuery } = attributeApi;

import { baseApi } from "@/redux/baseApi";
import type {
  ApiMessageResponse,
  ApiResponse,
} from "@/types/api.types";
import type {
  Product,
  ProductImage,
  ProductInput,
  ProductListResponse,
  ProductQuery,
  ProductStatus,
  ProductVariant,
  VariantInput,
} from "./types";
export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listPublicProducts: builder.query<ProductListResponse, ProductQuery | void>({
      query: params => ({ url: "/products/public", params: params ?? {} }),
      providesTags: ["Product"],
    }),
    listProducts: builder.query<ProductListResponse, ProductQuery | void>({
      query: (params) => ({ url: "/products", params: params ?? {} }),
      providesTags: ["Product"],
    }),
    getProduct: builder.query<ApiResponse<Product>, number>({
      query: (id) => "/products/" + id,
      providesTags: ["Product"],
    }),
    getPublicProductBySlug: builder.query<ApiResponse<Product>, string>({
      query: (slug) => "/products/public/slug/" + slug,
      providesTags: ["Product"],
    }),
    createProduct: builder.mutation<ApiResponse<Product>, ProductInput>({
      query: (body) => ({ url: "/products", method: "POST", body }),
      invalidatesTags: ["Product"],
    }),
    updateProduct: builder.mutation<
      ApiResponse<Product>,
      { id: number; body: Partial<ProductInput> }
    >({
      query: ({ id, body }) => ({
        url: "/products/" + id,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Product"],
    }),
    updateProductStatus: builder.mutation<
      ApiResponse<Product>,
      { id: number; status: ProductStatus }
    >({
      query: ({ id, status }) => ({
        url: "/products/" + id + "/status",
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["Product"],
    }),
    deleteProduct: builder.mutation<ApiMessageResponse, number>({
      query: (id) => ({ url: "/products/" + id, method: "DELETE" }),
      invalidatesTags: ["Product"],
    }),
    listVariants: builder.query<ApiResponse<ProductVariant[]>, number>({
      query: (productId) => "/products/" + productId + "/variants",
      providesTags: ["Product"],
    }),
    getVariant: builder.query<
      ApiResponse<ProductVariant>,
      { productId: number; variantId: number }
    >({
      query: ({ productId, variantId }) =>
        "/products/" + productId + "/variants/" + variantId,
      providesTags: ["Product"],
    }),
    createVariant: builder.mutation<
      ApiResponse<ProductVariant>,
      { productId: number; body: VariantInput }
    >({
      query: ({ productId, body }) => ({
        url: "/products/" + productId + "/variants",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Product", "Inventory"],
    }),
    updateVariant: builder.mutation<
      ApiResponse<ProductVariant>,
      { productId: number; variantId: number; body: Partial<VariantInput> }
    >({
      query: ({ productId, variantId, body }) => ({
        url: "/products/" + productId + "/variants/" + variantId,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Product", "Inventory"],
    }),
    deleteVariant: builder.mutation<
      ApiMessageResponse,
      { productId: number; variantId: number }
    >({
      query: ({ productId, variantId }) => ({
        url: "/products/" + productId + "/variants/" + variantId,
        method: "DELETE",
      }),
      invalidatesTags: ["Product", "Inventory"],
    }),
    listProductImages: builder.query<ApiResponse<ProductImage[]>, number>({
      query: (productId) => "/products/" + productId + "/images",
      providesTags: ["Product"],
    }),
    uploadProductImage: builder.mutation<
      ApiResponse<ProductImage>,
      {
        productId: number;
        file: File;
        altText?: string;
        isPrimary?: boolean;
        sortOrder?: number;
        attributeValueIds?: number[];
      }
    >({
      query: ({ productId, file, altText, isPrimary, sortOrder, attributeValueIds }) => {
        const body = new FormData();
        body.append("image", file);
        if (altText) body.append("altText", altText);
        body.append("isPrimary", String(Boolean(isPrimary)));
        body.append("sortOrder", String(sortOrder ?? 0));
        body.append("attributeValueIds", JSON.stringify(attributeValueIds ?? []));
        return {
          url: "/products/" + productId + "/images",
          method: "POST",
          body,
        };
      },
      invalidatesTags: ["Product"],
    }),
    deleteProductImage: builder.mutation<
      ApiMessageResponse,
      { productId: number; imageId: number }
    >({
      query: ({ productId, imageId }) => ({
        url: "/products/" + productId + "/images/" + imageId,
        method: "DELETE",
      }),
      invalidatesTags: ["Product"],
    }),
  }),
});
export const {
  useListPublicProductsQuery,
  useListProductsQuery,
  useGetProductQuery,
  useGetPublicProductBySlugQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useUpdateProductStatusMutation,
  useDeleteProductMutation,
  useListVariantsQuery,
  useGetVariantQuery,
  useCreateVariantMutation,
  useUpdateVariantMutation,
  useDeleteVariantMutation,
  useListProductImagesQuery,
  useUploadProductImageMutation,
  useDeleteProductImageMutation,
} = productApi;

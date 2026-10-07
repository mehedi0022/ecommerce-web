import { baseApi } from "@/redux/baseApi";
import type {
  InventoryListResponse,
  GlobalMovementsResponse,
  RestockInput,
  DamageInput,
  AdjustInput,
  UpdateThresholdInput,
} from "./inventory.types";

export const inventoryApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Get all variants inventory list with summary KPIs
    getInventoryList: builder.query<
      InventoryListResponse,
      { page?: number; limit?: number; search?: string; status?: string }
    >({
      query: (params) => ({
        url: "/inventory",
        params,
      }),
      providesTags: ["Inventory"],
    }),

    // Get global stock movements audit log
    getGlobalMovements: builder.query<
      GlobalMovementsResponse,
      { page?: number; limit?: number; type?: string; variantId?: number; search?: string }
    >({
      query: (params) => ({
        url: "/inventory/movements",
        params,
      }),
      providesTags: ["InventoryMovement"],
    }),

    // Get movements for a specific variant
    getVariantMovements: builder.query<
      GlobalMovementsResponse,
      { variantId: number; page?: number; limit?: number; type?: string }
    >({
      query: ({ variantId, ...params }) => ({
        url: `/variants/${variantId}/inventory/movements`,
        params,
      }),
      providesTags: (_res, _err, { variantId }) => [
        { type: "InventoryMovement", id: variantId },
      ],
    }),

    // Restock variant
    restockInventory: builder.mutation<
      { success: boolean; message: string; data: any },
      RestockInput
    >({
      query: ({ variantId, ...body }) => ({
        url: `/variants/${variantId}/inventory/restock`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Inventory", "InventoryMovement", "Product"],
    }),

    // Record damaged stock
    recordDamage: builder.mutation<
      { success: boolean; message: string; data: any },
      DamageInput
    >({
      query: ({ variantId, ...body }) => ({
        url: `/variants/${variantId}/inventory/damage`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Inventory", "InventoryMovement", "Product"],
    }),

    // Adjust inventory
    adjustInventory: builder.mutation<
      { success: boolean; message: string; data: any },
      AdjustInput
    >({
      query: ({ variantId, ...body }) => ({
        url: `/variants/${variantId}/inventory/adjust`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Inventory", "InventoryMovement", "Product"],
    }),

    // Update low stock alert threshold
    updateThreshold: builder.mutation<
      { success: boolean; message: string; data: any },
      UpdateThresholdInput
    >({
      query: ({ variantId, ...body }) => ({
        url: `/variants/${variantId}/inventory/threshold`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: ["Inventory"],
    }),
  }),
});

export const {
  useGetInventoryListQuery,
  useGetGlobalMovementsQuery,
  useGetVariantMovementsQuery,
  useRestockInventoryMutation,
  useRecordDamageMutation,
  useAdjustInventoryMutation,
  useUpdateThresholdMutation,
} = inventoryApi;

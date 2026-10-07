export type StockStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK";

export interface InventoryItem {
  id: number | null;
  variantId: number;
  productId: number;
  productName: string;
  productSlug: string;
  productImage: string | null;
  sku: string;
  price: string;
  isActive: boolean;
  attributes: Array<{ name: string; value: string }>;
  quantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  lowStockThreshold: number;
  status: StockStatus;
  updatedAt: string;
}

export interface InventorySummary {
  totalVariants: number;
  inStockCount: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalOnHand: number;
  totalReserved: number;
  totalAvailable: number;
}

export interface InventoryListPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface InventoryListResponse {
  success: boolean;
  message: string;
  data: {
    summary: InventorySummary;
    items: InventoryItem[];
    pagination: InventoryListPagination;
  };
}

export type InventoryMovementType =
  | "INITIAL_STOCK"
  | "RESTOCK"
  | "ORDER"
  | "ORDER_CANCELLED"
  | "RETURN"
  | "DAMAGED"
  | "ADJUSTMENT";

export interface InventoryMovement {
  id: number;
  inventoryId: number;
  variantId: number | null;
  productId: number | null;
  productName: string;
  productSlug: string;
  sku: string;
  variantName: string;
  type: InventoryMovementType;
  quantity: number;
  referenceType: string | null;
  referenceId: string | null;
  note: string | null;
  createdAt: string;
}

export interface GlobalMovementsResponse {
  success: boolean;
  message: string;
  data: InventoryMovement[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface RestockInput {
  variantId: number;
  quantity: number;
  note?: string;
  referenceType?: string;
  referenceId?: string;
}

export interface DamageInput {
  variantId: number;
  quantity: number;
  note?: string;
  referenceType?: string;
  referenceId?: string;
}

export interface AdjustInput {
  variantId: number;
  quantity: number;
  note: string;
  referenceType?: string;
  referenceId?: string;
}

export interface UpdateThresholdInput {
  variantId: number;
  lowStockThreshold: number;
}

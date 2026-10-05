export interface CartItemAttribute {
  attribute: string;
  value: string;
}

export interface CartProductImage {
  id: number;
  imageUrl: string;
  altText?: string | null;
  isPrimary?: boolean;
  sortOrder?: number;
}

export interface CartProduct {
  id: number;
  name: string;
  slug: string;
  status: string;
  images?: CartProductImage[];
}

export interface CartVariant {
  id: number;
  sku: string;
  price: string;
  isActive: boolean;
  attributes: CartItemAttribute[];
}

export interface CartItemInventory {
  availableQuantity: number;
}

export type CartAvailabilityIssue =
  | "VARIANT_INACTIVE"
  | "PRODUCT_INACTIVE"
  | "INVENTORY_UNAVAILABLE"
  | "INSUFFICIENT_STOCK"
  | null;

export interface CartItem {
  id: number;
  quantity: number;
  variant: CartVariant;
  product: CartProduct;
  inventory: CartItemInventory;
  lineTotal: string;
  isAvailable: boolean;
  availabilityIssue: CartAvailabilityIssue;
}

export interface CartSummary {
  itemCount: number;
  subtotal: string;
}

export interface CartData {
  id: number | null;
  type: "user" | "guest";
  items: CartItem[];
  summary: CartSummary;
}

export interface CartApiResponse {
  success: boolean;
  message: string;
  data: CartData;
}

export interface AddCartItemInput {
  variantId: number;
  quantity: number;
}

export interface UpdateCartItemInput {
  itemId: number;
  quantity: number;
}


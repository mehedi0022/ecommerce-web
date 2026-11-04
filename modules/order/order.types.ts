import type { ApiResponse, PaginatedApiResponse } from "@/types/api.types";

export interface OrderItemAttribute {
  id: number;
  attributeName: string;
  attributeValue: string;
}

export interface OrderItemProductImage {
  id: number;
  imageUrl: string;
  isPrimary: boolean;
  sortOrder: number;
}

export interface OrderItemProduct {
  id: number;
  name: string;
  slug: string;
  images?: OrderItemProductImage[];
}

export interface OrderItemReturnItem {
  id: number;
  quantity: number;
  reason: string;
  restockStatus: string;
  return?: {
    id: number;
    returnNumber: string;
    status: string;
    requestedAt?: string;
  } | null;
}

export interface OrderItem {
  id: number;
  productId: number;
  variantId: number | null;
  productName: string;
  productSlug: string;
  sku: string;
  quantity: number;
  unitPrice: string;
  lineTotal: string;
  createdAt: string;
  attributes?: OrderItemAttribute[];
  product?: OrderItemProduct | null;
  returnItems?: OrderItemReturnItem[];
}

export interface OrderAddress {
  id: number;
  type: "SHIPPING" | "BILLING";
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  division?: string | null;
  district: string;
  upazila?: string | null;
  thana?: string | null;
  area?: string | null;
  postalCode?: string | null;
  countryCode: string;
}

export interface OrderStatusHistory {
  id: number;
  fromStatus: string | null;
  toStatus: string;
  note?: string | null;
  changedById?: number | null;
  createdAt: string;
}

export type OrderSource =
  | "WEBSITE"
  | "LANDING_PAGE"
  | "PHONE_CALL"
  | "WHATSAPP"
  | "MESSENGER"
  | "OUTLET_POS"
  | "MANUAL_OTHER";

export interface OrderShipment {
  id: number;
  status: string;
  courierName: string | null;
  courierCode?: string | null;
  consignmentId?: string | null;
  codAmount?: string | number | null;
  courierStatus?: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  lastDispatchError?: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
}

export interface Order {
  id: number;
  orderNumber: string;
  userId: number | null;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string;
  source?: OrderSource;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "RETURNED"
    | string;
  paymentMethod: "CASH_ON_DELIVERY" | "ONLINE" | "PARTIAL_COD" | string;
  paymentStatus: "UNPAID" | "PENDING" | "PAID" | "PARTIALLY_PAID" | "FAILED" | "REFUNDED" | string;
  couponId: number | null;
  couponCode: string | null;
  subtotal: string;
  shippingCharge: string;
  discountAmount: string;
  taxAmount: string;
  grandTotal: string;
  advanceAmount?: string | number | null;
  dueAmount?: string | number | null;
  isAdvanceRequired?: boolean;
  isFreeShipping?: boolean;
  shippingZoneId: number;
  shippingMethodId: number;
  shippingZoneName: string;
  shippingMethodName: string;
  customerNote: string | null;
  adminNote?: string | null;
  placedAt: string;
  confirmedAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  addresses: OrderAddress[];
  statusHistory: OrderStatusHistory[];
  shipment?: OrderShipment | null;
  returns?: Array<{
    id: number;
    returnNumber: string;
    status: string;
    requestedAt?: string;
    createdAt?: string;
  }>;
}

export interface OrderListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  paymentStatus?: string;
  orderNumber?: string;
  customerPhone?: string;
  customerEmail?: string;
  source?: OrderSource;
}

export interface OrderTrackData {
  orderNumber: string;
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  placedAt: string;
  confirmedAt?: string | null;
  shippedAt?: string | null;
  deliveredAt?: string | null;
  cancelledAt?: string | null;
  customerName: string;
  itemCount: number;
  grandTotal: string;
  shippingMethodName: string;
  shippingZoneName: string;
  deliveryDistrict: string;
  shipment?: OrderShipment | null;
  items: Array<{
    id: number;
    productName: string;
    productSlug?: string;
    imageUrl?: string | null;
    quantity: number;
    unitPrice: string;
    lineTotal: string;
    attributes?: OrderItemAttribute[];
  }>;
}

export type OrderResponse = ApiResponse<Order>;
export type OrderListResponse = PaginatedApiResponse<Order>;
export type OrderTrackResponse = ApiResponse<OrderTrackData>;

export interface OrderTransitionInput {
  status:
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  note?: string;
}

export interface OrderUpdateAdminInput {
  paymentStatus?: "UNPAID" | "PAID" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED";
  adminNote?: string | null;
}

export interface CreateShipmentInput {
  courierName?: string | null;
  trackingNumber?: string | null;
  trackingUrl?: string | null;
  note?: string | null;
}

export interface TransitionShipmentInput {
  status:
    | "READY_TO_SHIP"
    | "SHIPPED"
    | "IN_TRANSIT"
    | "OUT_FOR_DELIVERY"
    | "DELIVERED"
    | "FAILED"
    | "RETURNED"
    | "CANCELLED";
  note?: string | null;
}

export interface PosProductVariant {
  id: number;
  productId?: number;
  sku: string;
  barcode?: string | null;
  price: string;
  compareAtPrice?: string | null;
  isActive: boolean;
  inventory?: {
    availableQuantity: number;
    reservedQuantity: number;
  };
  attributeValues?: Array<{
    id: number;
    attributeValue: {
      id: number;
      value: string;
      attribute?: {
        name: string;
      };
    };
  }>;
}

export interface PosProduct {
  id: number;
  name: string;
  slug: string;
  status: string;
  images?: Array<{
    id: number;
    imageUrl: string;
    isPrimary: boolean;
    sortOrder: number;
  }>;
  variants: PosProductVariant[];
}

export interface PosCustomerAddress {
  id: number;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string | null;
  divisionId?: string | null;
  districtId?: string | null;
  upazilaId?: string | null;
  unionId?: string | null;
  division?: string | null;
  district?: string | null;
  upazila?: string | null;
  thana?: string | null;
  area?: string | null;
  postalCode?: string | null;
  countryCode?: string | null;
  isDefaultShipping?: boolean;
}

export interface PosCustomer {
  id: number;
  fullName: string;
  phone: string;
  email?: string | null;
  addresses?: PosCustomerAddress[];
}

export interface ManualOrderItemInput {
  productId?: number;
  variantId: number;
  sku?: string;
  productName?: string;
  quantity: number;
  unitPrice: number | string;
}

export interface CreateManualOrderInput {
  source: OrderSource;
  fulfillmentType: "DELIVERY" | "STORE_PICKUP";
  customerId?: number | null;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  shippingAddress?: {
    fullName?: string;
    phone?: string;
    divisionId?: string;
    districtId?: string;
    upazilaId?: string;
    unionId?: string;
    division?: string;
    district?: string;
    upazila?: string;
    thana?: string;
    area?: string;
    addressLine1?: string;
    addressLine2?: string;
    postalCode?: string;
    countryCode?: string;
  } | null;
  items: ManualOrderItemInput[];
  shippingFee: number | string;
  discountAmount: number | string;
  advanceAmount: number | string;
  paymentMethod: "CASH_ON_DELIVERY" | "ONLINE" | "PARTIAL_COD";
  paymentMethodCode?: string;
  paymentStatus?: "UNPAID" | "PAID" | "PARTIALLY_PAID";
  orderStatus?: "PENDING" | "CONFIRMED" | "PROCESSING" | "DELIVERED";
  customerNote?: string;
  adminNote?: string;
}


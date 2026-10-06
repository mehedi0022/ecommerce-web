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

export interface OrderShipment {
  id: number;
  status: string;
  courierName: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
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
  status:
    | "PENDING"
    | "CONFIRMED"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  paymentMethod: "CASH_ON_DELIVERY" | "ONLINE";
  paymentStatus: "UNPAID" | "PAID" | "REFUNDED";
  couponId: number | null;
  couponCode: string | null;
  subtotal: string;
  shippingCharge: string;
  discountAmount: string;
  taxAmount: string;
  grandTotal: string;
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


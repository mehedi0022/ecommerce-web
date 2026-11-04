export interface IncompleteCartItem {
  variantId?: number;
  productId?: number;
  name: string;
  sku?: string;
  price: number | string;
  quantity: number;
  image?: string;
  attributes?: Record<string, string>;
}

export interface IncompleteOrderAddress {
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
}

export interface IncompleteOrder {
  id: number;
  sessionId: string;
  customerName: string | null;
  customerPhone: string;
  customerEmail: string | null;
  shippingAddress: IncompleteOrderAddress | null;
  cartItems: IncompleteCartItem[];
  subtotal: string;
  shippingFee: string;
  totalAmount: string;
  source: string;
  status: "PENDING" | "CALLED_NO_RESPONSE" | "CONTACTED" | "CONVERTED" | "CANCELLED";
  crmNotes: string | null;
  convertedOrderId: number | null;
  convertedOrder?: {
    id: number;
    orderNumber: string;
    status: string;
    paymentStatus: string;
    grandTotal?: string;
    totalAmount?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CaptureIncompleteOrderInput {
  sessionId: string;
  customerName?: string | null;
  customerPhone: string;
  customerEmail?: string | null;
  shippingAddress?: IncompleteOrderAddress | null;
  cartItems: IncompleteCartItem[];
  subtotal?: number | string;
  shippingFee?: number | string;
  totalAmount?: number | string;
  source?: string;
}

export interface UpdateIncompleteOrderInput {
  status?: "PENDING" | "CALLED_NO_RESPONSE" | "CONTACTED" | "CONVERTED" | "CANCELLED";
  crmNotes?: string | null;
}

export interface IncompleteOrderQuery {
  page?: number;
  limit?: number;
  status?: string;
  search?: string;
  source?: string;
}

export interface IncompleteOrderMetrics {
  totalLeads: number;
  pendingCalls: number;
  contactedCount: number;
  convertedCount: number;
  statusCounts?: Record<string, number>;
  potentialRevenue: string;
  recoveredRevenue: string;
  conversionRate: string;
}

export interface ConvertIncompleteOrderInput {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string | null;
  shippingAddress?: IncompleteOrderAddress | null;
  cartItems?: IncompleteCartItem[];
  paymentMethod?: "CASH_ON_DELIVERY" | "ONLINE";
  shippingFee?: number | string;
  advanceAmount?: number | string;
  discountAmount?: number | string;
  adminNote?: string;
}

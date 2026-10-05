import type { ApiResponse } from "@/types/api.types";

export interface CheckoutAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  division?: string;
  district: string;
  upazila?: string;
  thana?: string;
  area?: string;
  postalCode?: string;
  countryCode: string;
}

export interface CheckoutCustomer {
  name: string;
  email?: string;
  phone: string;
}

export interface AuthenticatedCheckoutInput {
  shippingAddressId: number;
  billingSameAsShipping: boolean;
  billingAddressId?: number;
  shippingMethodId: number;
  paymentMethod: "CASH_ON_DELIVERY" | "ONLINE";
  couponCode?: string;
  customerNote?: string;
}

export interface GuestCheckoutInput {
  customer: CheckoutCustomer;
  shippingAddress: CheckoutAddress;
  billingSameAsShipping: boolean;
  billingAddress?: CheckoutAddress;
  shippingMethodId: number;
  paymentMethod: "CASH_ON_DELIVERY" | "ONLINE";
  couponCode?: string;
  customerNote?: string;
}

export interface CheckoutResponseData {
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: string;
  shippingCharge: string;
  discountAmount: string;
  taxAmount: string;
  grandTotal: string;
  guestAccessToken?: string;
}

export type CheckoutApiResponse = ApiResponse<CheckoutResponseData>;

export interface ShippingMethod {
  id: number;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}

export type ShippingMethodsApiResponse = ApiResponse<ShippingMethod[]>;

export interface SavedAddress extends CheckoutAddress {
  id: number;
  label?: string | null;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

export type SavedAddressesApiResponse = ApiResponse<SavedAddress[]>;


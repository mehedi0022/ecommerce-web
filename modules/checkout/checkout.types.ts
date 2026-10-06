import type { ApiResponse } from "@/types/api.types";

export interface CheckoutAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;

  // Canonical Bangladesh structured IDs
  divisionId?: string;
  districtId: string;
  upazilaId?: string;
  unionId?: string;

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
  paymentMethodCode?: string;
  senderNumber?: string;
  transactionId?: string;
  couponCode?: string;
  customerNote?: string;
  paidInFull?: boolean;
}

export interface GuestCheckoutInput {
  customer: CheckoutCustomer;
  shippingAddress: CheckoutAddress;
  billingSameAsShipping: boolean;
  billingAddress?: CheckoutAddress;
  shippingMethodId: number;
  paymentMethod: "CASH_ON_DELIVERY" | "ONLINE";
  paymentMethodCode?: string;
  senderNumber?: string;
  transactionId?: string;
  couponCode?: string;
  customerNote?: string;
  paidInFull?: boolean;
}

export interface CheckoutResponseData {
  id?: number;
  orderNumber: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  paymentMethodCode?: string;
  paymentMethodType?: string;
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
  charge?: string;
  regularCharge?: string;
  finalCharge?: string;
  isFree?: boolean;
  isRecommended?: boolean;
  freeShippingThreshold?: string | null;
  estimatedMinDays?: number | null;
  estimatedMaxDays?: number | null;
}

export type ShippingMethodsApiResponse = ApiResponse<ShippingMethod[]>;

export interface CalculateShippingInput {
  divisionId?: string;
  districtId?: string;
  upazilaId?: string;
  unionId?: string;
  countryCode?: string;
  division?: string;
  district?: string;
  upazila?: string;
  thana?: string;
  area?: string;
  postalCode?: string;
  subtotal?: number;
  isAllFreeShipping?: boolean;
}

export interface CalculateShippingResponseData {
  zone: {
    id: number;
    name: string;
  };
  methods: ShippingMethod[];
}

export type CalculateShippingApiResponse = ApiResponse<CalculateShippingResponseData>;

export interface SavedAddress extends CheckoutAddress {
  id: number;
  label?: string | null;
  isDefaultShipping?: boolean;
  isDefaultBilling?: boolean;
}

export type SavedAddressesApiResponse = ApiResponse<SavedAddress[]>;

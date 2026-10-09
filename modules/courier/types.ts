export interface CourierProviderConfig {
  id: number;
  code: string;
  name: string;
  apiKey: string | null;
  apiSecret: string | null;
  apiUrl: string | null;
  isActive: boolean;
  isDefault: boolean;
  isLive: boolean;
  settings: Record<string, any> | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateCourierProviderInput {
  name?: string;
  apiKey?: string | null;
  apiSecret?: string | null;
  apiUrl?: string | null;
  isActive?: boolean;
  isDefault?: boolean;
  isLive?: boolean;
  settings?: Record<string, any> | null;
}

export interface CourierBalanceResult {
  balance: number;
  currency: string;
}

export interface BookCourierOrderInput {
  courierCode?: string;
  weight?: number;
  itemWeightKg?: number;
  note?: string;
  customNote?: string;
  forceRebook?: boolean;
}

export interface BookCourierOrderResult {
  success: boolean;
  consignmentId: string | number;
  trackingCode: string;
  trackingUrl?: string;
  codAmount: number;
  courierCode: string;
  courierName?: string;
  courierStatus?: string;
  booking?: any;
  shipment?: any;
  isDuplicate?: boolean;
}

export interface BulkBookCourierInput {
  orderNumbers: string[];
  courierCode?: string;
  customNote?: string;
  itemWeightKg?: number;
}

export interface BulkBookCourierResult {
  total: number;
  succeeded: number;
  failed: number;
  results: Array<{
    orderNumber: string;
    success: boolean;
    consignmentId?: string;
    trackingCode?: string;
    trackingUrl?: string | null;
    courierName?: string;
    error?: string;
  }>;
}

export interface CourierTrackingResult {
  status: string;
  rawStatus?: string;
  courierName?: string;
  trackingCode?: string;
  consignmentId?: string | number;
  trackingUrl?: string;
  updatedAt?: string;
  details?: any;
}

export interface CourierStoreItem {
  store_id: number;
  store_name: string;
  store_address: string;
  city_id?: number;
  zone_id?: number;
  is_active?: number;
}

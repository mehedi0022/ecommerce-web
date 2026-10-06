import type { ApiResponse } from "@/types/api.types";

export interface ShippingZone {
  id: number;
  name: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface ShippingZoneLocation {
  id: number;
  zoneId: number;
  divisionId: string | null;
  districtId: string | null;
  upazilaId: string | null;
  unionId: string | null;
  divisionName?: string | null;
  districtName?: string | null;
  upazilaName?: string | null;
  unionName?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShippingMethod {
  id: number;
  name: string;
  code: string;
  description: string | null;
  isActive: boolean;
  sortOrder: number;
}

export interface ShippingZoneMethod {
  id: number;
  zoneId: number;
  methodId: number;
  charge: string;
  freeShippingThreshold: string | null;
  estimatedMinDays: number | null;
  estimatedMaxDays: number | null;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
  method?: ShippingMethod;
}

// Input Types
export interface CreateZoneInput {
  name: string;
  description?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateZoneInput = Partial<CreateZoneInput>;

export interface CreateZoneLocationInput {
  divisionId?: string | null;
  districtId?: string | null;
  upazilaId?: string | null;
  unionId?: string | null;
}

export interface CreateZoneMethodInput {
  methodId: number;
  charge: number;
  freeShippingThreshold?: number | null;
  estimatedMinDays?: number | null;
  estimatedMaxDays?: number | null;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateZoneMethodInput = Partial<Omit<CreateZoneMethodInput, "methodId">>;

export interface CreateMethodInput {
  name: string;
  code: string;
  description?: string | null;
  isActive?: boolean;
  sortOrder?: number;
}

export type UpdateMethodInput = Partial<CreateMethodInput>;

// API Responses
export type ShippingZonesApiResponse = ApiResponse<ShippingZone[]>;
export type ShippingZoneApiResponse = ApiResponse<ShippingZone>;
export type ShippingZoneLocationsApiResponse = ApiResponse<ShippingZoneLocation[]>;
export type ShippingZoneMethodsApiResponse = ApiResponse<ShippingZoneMethod[]>;
export type ShippingMethodsApiResponse = ApiResponse<ShippingMethod[]>;
export type ShippingMethodApiResponse = ApiResponse<ShippingMethod>;

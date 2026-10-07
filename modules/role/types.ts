import type { ApiResponse } from "@/types/api.types";

export interface PermissionItem {
  id: number;
  key: string;
  module: string;
  action: string;
  description: string | null;
}

export interface RoleItem {
  id: number;
  key: string;
  name: string;
  rank: number;
  isSystem: boolean;
  userCount: number;
  permissionCount: number;
  permissions: string[];
  createdAt: string;
  updatedAt: string;
}

export interface RoleDetail {
  id: number;
  key: string;
  name: string;
  rank: number;
  isSystem: boolean;
  userCount: number;
  users: Array<{
    id: number;
    fullName: string;
    email: string;
    isActive: boolean;
  }>;
  permissions: PermissionItem[];
  permissionIds: number[];
  permissionKeys: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleInput {
  key: string;
  name: string;
  rank: number;
  permissionIds?: number[];
}

export interface UpdateRoleInput {
  name?: string;
  rank?: number;
}

export interface UpdateRolePermissionsInput {
  permissionIds: number[];
}

export interface PermissionsListResponse {
  permissions: PermissionItem[];
  grouped: Record<string, PermissionItem[]>;
}

export type RolesResponse = ApiResponse<RoleItem[]>;
export type SingleRoleResponse = ApiResponse<RoleDetail>;
export type AllPermissionsResponse = ApiResponse<PermissionsListResponse>;

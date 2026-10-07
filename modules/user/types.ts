import type { ApiResponse, PaginatedApiResponse } from "@/types/api.types";

export interface RoleSummary {
  id: number;
  key: string;
  name: string;
  rank: number;
  isSystem: boolean;
}

export interface UserItem {
  id: number;
  email: string;
  userName: string | null;
  fullName: string | null;
  roleId: number;
  role: RoleSummary;
  isActive: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  roleId?: number;
  status?: "ACTIVE" | "INACTIVE";
  search?: string;
  sortBy?: "id" | "email" | "userName" | "fullName" | "roleId" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface CreateUserInput {
  userName?: string;
  fullName: string;
  email: string;
  password: string;
  roleId: number;
}

export interface UpdateUserInput {
  userName?: string;
  fullName?: string;
}

export interface ChangeUserRoleInput {
  roleId: number;
}

export interface ChangeUserStatusInput {
  isActive: boolean;
}

export interface ResetUserPasswordInput {
  newPassword: string;
}

export type UsersResponse = PaginatedApiResponse<UserItem>;
export type SingleUserResponse = ApiResponse<UserItem>;

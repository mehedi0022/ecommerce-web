import type { ApiMessageResponse, ApiResponse } from "@/types/api.types";

export interface LoginInput {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterInput {
  userName: string;
  fullName: string;
  email: string;
  password: string;
}

export interface AuthRole {
  id: number;
  key: string;
  name: string;
  rank: number;
  isSystem: boolean;
}

export interface PublicUser {
  id: number;
  email: string;
  userName: string | null;
  fullName: string | null;
  roleId: number;
  role: AuthRole;
  isActive: boolean;
  emailVerifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser extends PublicUser {
  permissions: string[];
}

export type LoginResponse = ApiResponse<{
  user: AuthUser;
}>;

export type RegisterResponse = ApiResponse<PublicUser>;

export type RefreshResponse = ApiMessageResponse;

export type LogoutResponse = ApiMessageResponse;

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface VerifyEmailInput {
  token: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}
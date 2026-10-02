import { baseApi } from "@/redux/baseApi";
import type { ApiMessageResponse, ApiResponse } from "@/types/api.types";
import type {
  AuthUser,
  ForgotPasswordInput,
  LoginInput,
  LoginResponse,
  LogoutResponse,
  RefreshResponse,
  RegisterInput,
  RegisterResponse,
  ResetPasswordInput,
  VerifyEmailInput,
  ChangePasswordInput,
} from "./auth.types";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    me: builder.query<ApiResponse<AuthUser>, void>({
      query: () => "/auth/me",
      providesTags: ["Auth"],
    }),
    login: builder.mutation<LoginResponse, LoginInput>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      invalidatesTags: ["Auth"],
    }),
    register: builder.mutation<RegisterResponse, RegisterInput>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      invalidatesTags: ["Auth"],
    }),
    refresh: builder.mutation<RefreshResponse, void>({
      query: () => ({ url: "/auth/refresh", method: "POST" }),
    }),
    logout: builder.mutation<LogoutResponse, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      invalidatesTags: ["Auth"],
    }),
    forgotPassword: builder.mutation<ApiMessageResponse, ForgotPasswordInput>({
      query: (body) => ({ url: "/auth/forgot-password", method: "POST", body }),
    }),
    resetPassword: builder.mutation<ApiMessageResponse, ResetPasswordInput>({
      query: (body) => ({ url: "/auth/reset-password", method: "POST", body }),
      invalidatesTags: ["Auth"],
    }),
    verifyEmail: builder.mutation<ApiMessageResponse, VerifyEmailInput>({
      query: (body) => ({ url: "/auth/verify-email", method: "POST", body }),
    }),
    changePassword: builder.mutation<ApiMessageResponse, ChangePasswordInput>({
      query: (body) => ({ url: "/auth/change-password", method: "POST", body }),
      invalidatesTags: ["Auth"],
    }),
    logoutAll: builder.mutation<ApiMessageResponse, void>({
      query: () => ({ url: "/auth/logout-all", method: "POST" }),
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useRefreshMutation,
  useLogoutMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerifyEmailMutation,
  useChangePasswordMutation,
  useLogoutAllMutation,
} = authApi;

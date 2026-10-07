import { baseApi } from "@/redux/baseApi";
import type { ApiMessageResponse } from "@/types/api.types";
import type {
  ChangeUserRoleInput,
  ChangeUserStatusInput,
  CreateUserInput,
  ResetUserPasswordInput,
  SingleUserResponse,
  UpdateUserInput,
  UserListQuery,
  UsersResponse,
} from "./types";

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<UsersResponse, UserListQuery | void>({
      query: (params) => ({
        url: "/users",
        params: params || {},
      }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "User" as const, id })),
              { type: "User", id: "LIST" },
            ]
          : [{ type: "User", id: "LIST" }],
    }),

    getUserById: builder.query<SingleUserResponse, number>({
      query: (id) => `/users/${id}`,
      providesTags: (_result, _error, id) => [{ type: "User", id }],
    }),

    createUser: builder.mutation<SingleUserResponse, CreateUserInput>({
      query: (body) => ({
        url: "/users",
        method: "POST",
        body,
      }),
      invalidatesTags: [
        { type: "User", id: "LIST" },
        { type: "Role", id: "LIST" },
      ],
    }),

    updateUser: builder.mutation<
      SingleUserResponse,
      { id: number; data: UpdateUserInput }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    changeUserRole: builder.mutation<
      SingleUserResponse,
      { id: number; data: ChangeUserRoleInput }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}/role`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
        { type: "Role", id: "LIST" },
      ],
    }),

    changeUserStatus: builder.mutation<
      SingleUserResponse,
      { id: number; data: ChangeUserStatusInput }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}/status`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "User", id },
        { type: "User", id: "LIST" },
      ],
    }),

    resetUserPassword: builder.mutation<
      ApiMessageResponse,
      { id: number; data: ResetUserPasswordInput }
    >({
      query: ({ id, data }) => ({
        url: `/users/${id}/reset-password`,
        method: "POST",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [{ type: "User", id }],
    }),
  }),
});

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useChangeUserRoleMutation,
  useChangeUserStatusMutation,
  useResetUserPasswordMutation,
} = userApi;

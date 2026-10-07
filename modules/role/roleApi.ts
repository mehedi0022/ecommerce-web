import { baseApi } from "@/redux/baseApi";
import type { ApiMessageResponse } from "@/types/api.types";
import type {
  AllPermissionsResponse,
  CreateRoleInput,
  RolesResponse,
  SingleRoleResponse,
  UpdateRoleInput,
  UpdateRolePermissionsInput,
} from "./types";

export const roleApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getRoles: builder.query<RolesResponse, void>({
      query: () => "/roles",
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map(({ id }) => ({ type: "Role" as const, id })),
              { type: "Role", id: "LIST" },
            ]
          : [{ type: "Role", id: "LIST" }],
    }),

    getRoleById: builder.query<SingleRoleResponse, number>({
      query: (id) => `/roles/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Role", id }],
    }),

    getAllPermissions: builder.query<AllPermissionsResponse, void>({
      query: () => "/roles/permissions",
    }),

    createRole: builder.mutation<SingleRoleResponse, CreateRoleInput>({
      query: (body) => ({
        url: "/roles",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Role", id: "LIST" }],
    }),

    updateRole: builder.mutation<
      SingleRoleResponse,
      { id: number; data: UpdateRoleInput }
    >({
      query: ({ id, data }) => ({
        url: `/roles/${id}`,
        method: "PATCH",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Role", id },
        { type: "Role", id: "LIST" },
      ],
    }),

    updateRolePermissions: builder.mutation<
      SingleRoleResponse,
      { id: number; data: UpdateRolePermissionsInput }
    >({
      query: ({ id, data }) => ({
        url: `/roles/${id}/permissions`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Role", id },
        { type: "Role", id: "LIST" },
        { type: "Auth" },
      ],
    }),

    deleteRole: builder.mutation<ApiMessageResponse, number>({
      query: (id) => ({
        url: `/roles/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Role", id: "LIST" }],
    }),
  }),
});

export const {
  useGetRolesQuery,
  useGetRoleByIdQuery,
  useGetAllPermissionsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useUpdateRolePermissionsMutation,
  useDeleteRoleMutation,
} = roleApi;

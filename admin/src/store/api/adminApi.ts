import { baseApi } from "./baseApi";
import type { PaginatedResponse } from "./productApi";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
  avatar?: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminListParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface CreateAdminPayload {
  name: string;
  email: string;
  password: string;
  role: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
  phone?: string;
  isActive?: boolean;
}

export interface UpdateAdminPayload {
  id: string;
  name?: string;
  email?: string;
  password?: string;
  role?: "SUPER_ADMIN" | "ADMIN" | "EDITOR";
  phone?: string;
  isActive?: boolean;
}

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdmins: builder.query<PaginatedResponse<AdminUser>, AdminListParams>({
      query: (params) => ({ url: "/admins", params }),
      providesTags: ["Admins"],
    }),

    createAdmin: builder.mutation<{ data: AdminUser }, CreateAdminPayload>({
      query: (body) => ({ url: "/admins", method: "POST", body }),
      invalidatesTags: ["Admins"],
    }),

    updateAdmin: builder.mutation<{ data: AdminUser }, UpdateAdminPayload>({
      query: ({ id, ...body }) => ({ url: `/admins/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Admins"],
    }),

    toggleAdminActive: builder.mutation<{ data: AdminUser }, string>({
      query: (id) => ({ url: `/admins/${id}/toggle-active`, method: "PATCH" }),
      invalidatesTags: ["Admins"],
    }),

    deleteAdmin: builder.mutation<{ data: AdminUser }, string>({
      query: (id) => ({ url: `/admins/${id}`, method: "DELETE" }),
      invalidatesTags: ["Admins"],
    }),
  }),
});

export const {
  useGetAdminsQuery,
  useCreateAdminMutation,
  useUpdateAdminMutation,
  useToggleAdminActiveMutation,
  useDeleteAdminMutation,
} = adminApi;

import { baseApi } from "./baseApi";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  avatar?: string;
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<{ data: User[]; pagination: object }, { page?: number; role?: string; search?: string }>({
      query: (params) => ({ url: "/users", params }),
      providesTags: ["Users"],
    }),
    updateUser: builder.mutation<{ data: User }, Partial<User> & { id: string }>({
      query: ({ id, ...body }) => ({ url: `/users/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Users"],
    }),
    deleteUser: builder.mutation<void, string>({
      query: (id) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: ["Users"],
    }),
  }),
});

export const { useGetUsersQuery, useUpdateUserMutation, useDeleteUserMutation } = userApi;

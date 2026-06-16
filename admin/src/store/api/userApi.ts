import { baseApi } from "./baseApi";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  avatar?: string;
  phone?: string;
}

export interface UserPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const userApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<
      { data: User[]; pagination: UserPagination },
      { page?: number; limit?: number; role?: string; search?: string; isActive?: string }
    >({
      query: (params) => ({ url: "/users", params }),
      providesTags: ["Users"],
    }),
    getUserById: builder.query<{ data: User }, string>({
      query: (id) => ({ url: `/users/${id}` }),
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

export const {
  useGetUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;

import { baseApi } from "./baseApi";

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  comparePrice?: number;
  stock: number;
  sku?: string;
  images: string[];
  categoryId: string;
  category?: { id: string; name: string; slug: string };
  isActive: boolean;
  isFeatured: boolean;
  tags: string[];
  seoTitle?: string;
  seoDesc?: string;
  seoKeywords?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  sortOrder?: number;
  seoTitle?: string;
  seoDesc?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface AdminProductParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  isActive?: string;
  isFeatured?: string;
  date_from?: string;
  date_to?: string;
  sortBy?: string;
  sortOrder?: string;
}

export interface AdminCategoryParams {
  search?: string;
  isActive?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const productApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminProducts: builder.query<PaginatedResponse<Product>, AdminProductParams>({
      query: (params) => ({ url: "/products/admin/all", params }),
      providesTags: ["Products"],
    }),
    createProduct: builder.mutation<{ data: Product }, Partial<Product>>({
      query: (body) => ({ url: "/products", method: "POST", body }),
      invalidatesTags: ["Products"],
    }),
    updateProduct: builder.mutation<{ data: Product }, Partial<Product> & { id: string }>({
      query: ({ id, ...body }) => ({ url: `/products/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Products"],
    }),
    deleteProduct: builder.mutation<void, string>({
      query: (id) => ({ url: `/products/${id}`, method: "DELETE" }),
      invalidatesTags: ["Products"],
    }),
    getCategories: builder.query<{ data: Category[] }, void>({
      query: () => "/categories",
      providesTags: ["Categories"],
    }),
    getAdminCategories: builder.query<{ data: Category[] }, AdminCategoryParams | void>({
      query: (params) => ({ url: "/categories/admin", params }),
      providesTags: ["Categories"],
    }),
    createCategory: builder.mutation<{ data: Category }, Partial<Category>>({
      query: (body) => ({ url: "/categories", method: "POST", body }),
      invalidatesTags: ["Categories"],
    }),
    updateCategory: builder.mutation<{ data: Category }, Partial<Category> & { id: string }>({
      query: ({ id, ...body }) => ({ url: `/categories/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Categories"],
    }),
    deleteCategory: builder.mutation<void, string>({
      query: (id) => ({ url: `/categories/${id}`, method: "DELETE" }),
      invalidatesTags: ["Categories"],
    }),
  }),
});

export const {
  useGetAdminProductsQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetAdminCategoriesQuery,
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
  useDeleteCategoryMutation,
} = productApi;

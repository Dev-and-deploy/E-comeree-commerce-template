import { baseApi } from "./baseApi";

export interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  status: "DRAFT" | "PUBLISHED" | "SCHEDULED";
  author: string;
  category?: string;
  tags: string[];
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  focusKeyword?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex: boolean;
  noFollow: boolean;
  structuredData?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedBlogs {
  data: Blog[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface AdminBlogParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  category?: string;
  date_from?: string;
  date_to?: string;
  sortBy?: string;
  sortOrder?: string;
}

export type BlogPayload = {
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  status: "draft" | "published" | "scheduled";
  author: string;
  category?: string;
  tags?: string[];
  featuredImage?: string;
  metaTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  focusKeyword?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  structuredData?: string;
};

export const blogApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAdminBlogs: builder.query<PaginatedBlogs, AdminBlogParams>({
      query: (params) => ({ url: "/blogs/admin/all", params }),
      providesTags: ["Blogs"],
    }),
    createBlog: builder.mutation<{ data: Blog }, BlogPayload>({
      query: (body) => ({ url: "/blogs", method: "POST", body }),
      invalidatesTags: ["Blogs"],
    }),
    updateBlog: builder.mutation<{ data: Blog }, Partial<BlogPayload> & { id: string }>({
      query: ({ id, ...body }) => ({ url: `/blogs/${id}`, method: "PATCH", body }),
      invalidatesTags: ["Blogs"],
    }),
    deleteBlog: builder.mutation<void, string>({
      query: (id) => ({ url: `/blogs/${id}`, method: "DELETE" }),
      invalidatesTags: ["Blogs"],
    }),
  }),
});

export const {
  useGetAdminBlogsQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = blogApi;

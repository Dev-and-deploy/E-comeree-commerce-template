import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  mockCampaigns,
  mockDiscounts,
  mockBlogs,
  mockDashboard,
  Campaign,
  Discount,
  BlogPost,
  DashboardStats,
} from "./mockData";

// Simulate network delay
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

let campaigns = [...mockCampaigns];
let discounts = [...mockDiscounts];
let blogs = [...mockBlogs];

export const mockApi = createApi({
  reducerPath: "mockApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Dashboard", "Campaigns", "Discounts", "Blogs"],
  endpoints: (builder) => ({
    // Dashboard
    getDashboard: builder.query<DashboardStats, void>({
      queryFn: async () => {
        await delay();
        return { data: mockDashboard };
      },
      providesTags: ["Dashboard"],
    }),

    // Campaigns
    getCampaigns: builder.query<Campaign[], void>({
      queryFn: async () => {
        await delay();
        return { data: campaigns };
      },
      providesTags: ["Campaigns"],
    }),
    createCampaign: builder.mutation<Campaign, Partial<Campaign>>({
      queryFn: async (body) => {
        await delay();
        const c: Campaign = { id: Date.now().toString(), ...body } as Campaign;
        campaigns.push(c);
        return { data: c };
      },
      invalidatesTags: ["Campaigns"],
    }),
    updateCampaign: builder.mutation<
      Campaign,
      Partial<Campaign> & { id: string }
    >({
      queryFn: async (body) => {
        await delay();
        campaigns = campaigns.map((c) =>
          c.id === body.id ? { ...c, ...body } : c,
        );
        return { data: campaigns.find((c) => c.id === body.id)! };
      },
      invalidatesTags: ["Campaigns"],
    }),
    deleteCampaign: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay();
        campaigns = campaigns.filter((c) => c.id !== id);
        return { data: undefined };
      },
      invalidatesTags: ["Campaigns"],
    }),

    // Discounts
    getDiscounts: builder.query<Discount[], void>({
      queryFn: async () => {
        await delay();
        return { data: discounts };
      },
      providesTags: ["Discounts"],
    }),
    createDiscount: builder.mutation<Discount, Partial<Discount>>({
      queryFn: async (body) => {
        await delay();
        const d: Discount = {
          id: Date.now().toString(),
          usedCount: 0,
          ...body,
        } as Discount;
        discounts.push(d);
        return { data: d };
      },
      invalidatesTags: ["Discounts"],
    }),
    updateDiscount: builder.mutation<
      Discount,
      Partial<Discount> & { id: string }
    >({
      queryFn: async (body) => {
        await delay();
        discounts = discounts.map((d) =>
          d.id === body.id ? { ...d, ...body } : d,
        );
        return { data: discounts.find((d) => d.id === body.id)! };
      },
      invalidatesTags: ["Discounts"],
    }),
    deleteDiscount: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay();
        discounts = discounts.filter((d) => d.id !== id);
        return { data: undefined };
      },
      invalidatesTags: ["Discounts"],
    }),

    // Blogs
    getBlogs: builder.query<BlogPost[], void>({
      queryFn: async () => {
        await delay();
        return { data: blogs };
      },
      providesTags: ["Blogs"],
    }),
    getBlog: builder.query<BlogPost, string>({
      queryFn: async (id) => {
        await delay();
        const blog = blogs.find((b) => b.id === id);
        return blog
          ? { data: blog }
          : { error: { status: 404, data: "Not found" } };
      },
      providesTags: ["Blogs"],
    }),
    createBlog: builder.mutation<BlogPost, Partial<BlogPost>>({
      queryFn: async (body) => {
        await delay();
        const b: BlogPost = {
          id: Date.now().toString(),
          createdAt: new Date().toISOString().split("T")[0],
          publishedAt: "",
          seo: {
            metaTitle: "",
            metaDescription: "",
            canonicalUrl: "",
            ogTitle: "",
            ogDescription: "",
            ogImage: "",
            focusKeyword: "",
            noIndex: false,
            noFollow: false,
            structuredData: "",
          },
          tags: [],
          ...body,
        } as BlogPost;
        blogs.push(b);
        return { data: b };
      },
      invalidatesTags: ["Blogs"],
    }),
    updateBlog: builder.mutation<BlogPost, Partial<BlogPost> & { id: string }>({
      queryFn: async (body) => {
        await delay();
        blogs = blogs.map((b) => (b.id === body.id ? { ...b, ...body } : b));
        return { data: blogs.find((b) => b.id === body.id)! };
      },
      invalidatesTags: ["Blogs"],
    }),
    deleteBlog: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay();
        blogs = blogs.filter((b) => b.id !== id);
        return { data: undefined };
      },
      invalidatesTags: ["Blogs"],
    }),
  }),
});

export const {
  useGetDashboardQuery,
  useGetCampaignsQuery,
  useCreateCampaignMutation,
  useUpdateCampaignMutation,
  useDeleteCampaignMutation,
  useGetDiscountsQuery,
  useCreateDiscountMutation,
  useUpdateDiscountMutation,
  useDeleteDiscountMutation,
  useGetBlogsQuery,
  useGetBlogQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
} = mockApi;

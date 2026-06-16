import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import {
  mockCampaigns,
  mockDiscounts,
  mockBlogs,
  mockDashboard,
  mockFlashSales,
  mockAbandonedCarts,
  mockPopUps,
  mockReferrals,
  mockLoyaltyMembers,
  mockTrackingLinks,
  Campaign,
  Discount,
  BlogPost,
  DashboardStats,
  FlashSale,
  AbandonedCart,
  PopUp,
  Referral,
  LoyaltyMember,
  TrackingLink,
} from "./mockData";

// Simulate network delay
const delay = (ms = 300) => new Promise((r) => setTimeout(r, ms));

let campaigns = [...mockCampaigns];
let trackingLinks = [...mockTrackingLinks];
let discounts = [...mockDiscounts];
let blogs = [...mockBlogs];
let flashSales = [...mockFlashSales];
let abandonedCarts = [...mockAbandonedCarts];
let popUps = [...mockPopUps];
let referrals = [...mockReferrals];
let loyaltyMembers = [...mockLoyaltyMembers];

export const mockApi = createApi({
  reducerPath: "mockApi",
  baseQuery: fakeBaseQuery(),
  tagTypes: ["Dashboard", "Campaigns", "Discounts", "Blogs", "FlashSales", "AbandonedCarts", "PopUps", "Referrals", "LoyaltyMembers", "TrackingLinks"],
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
    updateCampaign: builder.mutation<Campaign, Partial<Campaign> & { id: string }>({
      queryFn: async (body) => {
        await delay();
        campaigns = campaigns.map((c) => (c.id === body.id ? { ...c, ...body } : c));
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
        const d: Discount = { id: Date.now().toString(), usedCount: 0, ...body } as Discount;
        discounts.push(d);
        return { data: d };
      },
      invalidatesTags: ["Discounts"],
    }),
    updateDiscount: builder.mutation<Discount, Partial<Discount> & { id: string }>({
      queryFn: async (body) => {
        await delay();
        discounts = discounts.map((d) => (d.id === body.id ? { ...d, ...body } : d));
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
        return blog ? { data: blog } : { error: { status: 404, data: "Not found" } };
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

    // Flash Sales
    getFlashSales: builder.query<FlashSale[], void>({
      queryFn: async () => {
        await delay();
        return { data: flashSales };
      },
      providesTags: ["FlashSales"],
    }),
    createFlashSale: builder.mutation<FlashSale, Partial<FlashSale>>({
      queryFn: async (body) => {
        await delay();
        const fs: FlashSale = {
          id: Date.now().toString(),
          ordersGenerated: 0,
          revenue: 0,
          ...body,
        } as FlashSale;
        flashSales.push(fs);
        return { data: fs };
      },
      invalidatesTags: ["FlashSales"],
    }),
    updateFlashSale: builder.mutation<FlashSale, Partial<FlashSale> & { id: string }>({
      queryFn: async (body) => {
        await delay();
        flashSales = flashSales.map((fs) => (fs.id === body.id ? { ...fs, ...body } : fs));
        return { data: flashSales.find((fs) => fs.id === body.id)! };
      },
      invalidatesTags: ["FlashSales"],
    }),
    deleteFlashSale: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay();
        flashSales = flashSales.filter((fs) => fs.id !== id);
        return { data: undefined };
      },
      invalidatesTags: ["FlashSales"],
    }),

    // Abandoned Carts
    getAbandonedCarts: builder.query<AbandonedCart[], void>({
      queryFn: async () => {
        await delay();
        return { data: abandonedCarts };
      },
      providesTags: ["AbandonedCarts"],
    }),
    updateAbandonedCart: builder.mutation<AbandonedCart, Partial<AbandonedCart> & { id: string }>({
      queryFn: async (body) => {
        await delay();
        abandonedCarts = abandonedCarts.map((ac) => (ac.id === body.id ? { ...ac, ...body } : ac));
        return { data: abandonedCarts.find((ac) => ac.id === body.id)! };
      },
      invalidatesTags: ["AbandonedCarts"],
    }),
    deleteAbandonedCart: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay();
        abandonedCarts = abandonedCarts.filter((ac) => ac.id !== id);
        return { data: undefined };
      },
      invalidatesTags: ["AbandonedCarts"],
    }),

    // Pop-ups
    getPopUps: builder.query<PopUp[], void>({
      queryFn: async () => {
        await delay();
        return { data: popUps };
      },
      providesTags: ["PopUps"],
    }),
    createPopUp: builder.mutation<PopUp, Partial<PopUp>>({
      queryFn: async (body) => {
        await delay();
        const p: PopUp = {
          id: Date.now().toString(),
          impressions: 0,
          conversions: 0,
          createdAt: new Date().toISOString().split("T")[0],
          ...body,
        } as PopUp;
        popUps.push(p);
        return { data: p };
      },
      invalidatesTags: ["PopUps"],
    }),
    updatePopUp: builder.mutation<PopUp, Partial<PopUp> & { id: string }>({
      queryFn: async (body) => {
        await delay();
        popUps = popUps.map((p) => (p.id === body.id ? { ...p, ...body } : p));
        return { data: popUps.find((p) => p.id === body.id)! };
      },
      invalidatesTags: ["PopUps"],
    }),
    deletePopUp: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay();
        popUps = popUps.filter((p) => p.id !== id);
        return { data: undefined };
      },
      invalidatesTags: ["PopUps"],
    }),

    // Referrals
    getReferrals: builder.query<Referral[], void>({
      queryFn: async () => {
        await delay();
        return { data: referrals };
      },
      providesTags: ["Referrals"],
    }),
    createReferral: builder.mutation<Referral, Partial<Referral>>({
      queryFn: async (body) => {
        await delay();
        const r: Referral = {
          id: Date.now().toString(),
          referralsSent: 0,
          successfulReferrals: 0,
          totalEarned: 0,
          joinedAt: new Date().toISOString().split("T")[0],
          ...body,
        } as Referral;
        referrals.push(r);
        return { data: r };
      },
      invalidatesTags: ["Referrals"],
    }),
    updateReferral: builder.mutation<Referral, Partial<Referral> & { id: string }>({
      queryFn: async (body) => {
        await delay();
        referrals = referrals.map((r) => (r.id === body.id ? { ...r, ...body } : r));
        return { data: referrals.find((r) => r.id === body.id)! };
      },
      invalidatesTags: ["Referrals"],
    }),
    deleteReferral: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay();
        referrals = referrals.filter((r) => r.id !== id);
        return { data: undefined };
      },
      invalidatesTags: ["Referrals"],
    }),

    // Tracking Links
    getTrackingLinks: builder.query<TrackingLink[], void>({
      queryFn: async () => {
        await delay();
        return { data: trackingLinks };
      },
      providesTags: ["TrackingLinks"],
    }),
    createTrackingLink: builder.mutation<TrackingLink, Partial<TrackingLink>>({
      queryFn: async (body) => {
        await delay();
        const tl: TrackingLink = {
          id: Date.now().toString(),
          visits: 0,
          orders: 0,
          revenue: 0,
          createdAt: new Date().toISOString().split("T")[0],
          ...body,
        } as TrackingLink;
        trackingLinks.push(tl);
        return { data: tl };
      },
      invalidatesTags: ["TrackingLinks"],
    }),
    updateTrackingLink: builder.mutation<TrackingLink, Partial<TrackingLink> & { id: string }>({
      queryFn: async (body) => {
        await delay();
        trackingLinks = trackingLinks.map((tl) => (tl.id === body.id ? { ...tl, ...body } : tl));
        return { data: trackingLinks.find((tl) => tl.id === body.id)! };
      },
      invalidatesTags: ["TrackingLinks"],
    }),
    deleteTrackingLink: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay();
        trackingLinks = trackingLinks.filter((tl) => tl.id !== id);
        return { data: undefined };
      },
      invalidatesTags: ["TrackingLinks"],
    }),

    // Loyalty Members
    getLoyaltyMembers: builder.query<LoyaltyMember[], void>({
      queryFn: async () => {
        await delay();
        return { data: loyaltyMembers };
      },
      providesTags: ["LoyaltyMembers"],
    }),
    updateLoyaltyMember: builder.mutation<LoyaltyMember, Partial<LoyaltyMember> & { id: string }>({
      queryFn: async (body) => {
        await delay();
        loyaltyMembers = loyaltyMembers.map((m) => (m.id === body.id ? { ...m, ...body } : m));
        return { data: loyaltyMembers.find((m) => m.id === body.id)! };
      },
      invalidatesTags: ["LoyaltyMembers"],
    }),
    deleteLoyaltyMember: builder.mutation<void, string>({
      queryFn: async (id) => {
        await delay();
        loyaltyMembers = loyaltyMembers.filter((m) => m.id !== id);
        return { data: undefined };
      },
      invalidatesTags: ["LoyaltyMembers"],
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
  useGetFlashSalesQuery,
  useCreateFlashSaleMutation,
  useUpdateFlashSaleMutation,
  useDeleteFlashSaleMutation,
  useGetAbandonedCartsQuery,
  useUpdateAbandonedCartMutation,
  useDeleteAbandonedCartMutation,
  useGetPopUpsQuery,
  useCreatePopUpMutation,
  useUpdatePopUpMutation,
  useDeletePopUpMutation,
  useGetReferralsQuery,
  useCreateReferralMutation,
  useUpdateReferralMutation,
  useDeleteReferralMutation,
  useGetLoyaltyMembersQuery,
  useUpdateLoyaltyMemberMutation,
  useDeleteLoyaltyMemberMutation,
  useGetTrackingLinksQuery,
  useCreateTrackingLinkMutation,
  useUpdateTrackingLinkMutation,
  useDeleteTrackingLinkMutation,
} = mockApi;

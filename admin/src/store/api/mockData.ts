export interface Campaign {
  id: string;
  name: string;
  type: "email" | "sms" | "push" | "social";
  status: "active" | "paused" | "completed" | "draft";
  reach: number;
  clicks: number;
  conversions: number;
  budget: number;
  startDate: string;
  endDate: string;
}

export interface Discount {
  id: string;
  code: string;
  type: "percentage" | "fixed" | "free_shipping" | "buy_x_get_y";
  value: number;
  minOrder: number;
  maxUses: number;
  usedCount: number;
  status: "active" | "expired" | "disabled";
  startDate: string;
  endDate: string;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: "published" | "draft" | "scheduled";
  author: string;
  category: string;
  tags: string[];
  featuredImage: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    canonicalUrl: string;
    ogTitle: string;
    ogDescription: string;
    ogImage: string;
    focusKeyword: string;
    noIndex: boolean;
    noFollow: boolean;
    structuredData: string;
  };
  publishedAt: string;
  createdAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  conversionRate: number;
  revenueChange: number;
  ordersChange: number;
  customersChange: number;
  conversionChange: number;
  recentOrders: {
    id: string;
    customer: string;
    amount: number;
    status: string;
    date: string;
  }[];
  salesChart: { month: string; revenue: number; orders: number }[];
}

export interface FlashSale {
  id: string;
  name: string;
  discountPercent: number;
  productCount: number;
  startDate: string;
  endDate: string;
  status: "active" | "scheduled" | "ended";
  ordersGenerated: number;
  revenue: number;
}

export interface AbandonedCart {
  id: string;
  customer: string;
  email: string;
  cartValue: number;
  itemCount: number;
  abandonedAt: string;
  recoveryStatus: "recovered" | "pending" | "lost";
  emailsSent: number;
}

export interface PopUp {
  id: string;
  name: string;
  trigger: "exit_intent" | "time_delay" | "scroll" | "page_load";
  goal: "email_capture" | "discount" | "announcement";
  status: "active" | "paused" | "draft";
  impressions: number;
  conversions: number;
  createdAt: string;
}

export interface Referral {
  id: string;
  referrerName: string;
  referrerEmail: string;
  referralCode: string;
  referralsSent: number;
  successfulReferrals: number;
  totalEarned: number;
  status: "active" | "suspended";
  joinedAt: string;
}

export interface LoyaltyMember {
  id: string;
  name: string;
  email: string;
  tier: "bronze" | "silver" | "gold" | "platinum";
  points: number;
  totalSpent: number;
  redemptions: number;
  joinedAt: string;
}

export const mockCampaigns: Campaign[] = [
  {
    id: "1",
    name: "Summer Sale Blast",
    type: "email",
    status: "active",
    reach: 45200,
    clicks: 3200,
    conversions: 890,
    budget: 5000,
    startDate: "2026-01-15",
    endDate: "2026-03-15",
  },
  {
    id: "2",
    name: "Flash Deal Push",
    type: "push",
    status: "active",
    reach: 28000,
    clicks: 4100,
    conversions: 1200,
    budget: 2000,
    startDate: "2026-02-01",
    endDate: "2026-02-28",
  },
  {
    id: "3",
    name: "VIP SMS Campaign",
    type: "sms",
    status: "paused",
    reach: 5000,
    clicks: 800,
    conversions: 320,
    budget: 1500,
    startDate: "2026-01-20",
    endDate: "2026-02-20",
  },
  {
    id: "4",
    name: "Instagram Promo",
    type: "social",
    status: "completed",
    reach: 120000,
    clicks: 8900,
    conversions: 2100,
    budget: 8000,
    startDate: "2025-12-01",
    endDate: "2026-01-31",
  },
  {
    id: "5",
    name: "New Arrivals Email",
    type: "email",
    status: "draft",
    reach: 0,
    clicks: 0,
    conversions: 0,
    budget: 3000,
    startDate: "2026-03-01",
    endDate: "2026-04-01",
  },
];

export const mockDiscounts: Discount[] = [
  {
    id: "1",
    code: "SUMMER25",
    type: "percentage",
    value: 25,
    minOrder: 50,
    maxUses: 1000,
    usedCount: 432,
    status: "active",
    startDate: "2026-01-01",
    endDate: "2026-03-31",
  },
  {
    id: "2",
    code: "FLAT10",
    type: "fixed",
    value: 10,
    minOrder: 30,
    maxUses: 500,
    usedCount: 289,
    status: "active",
    startDate: "2026-01-15",
    endDate: "2026-02-28",
  },
  {
    id: "3",
    code: "FREESHIP",
    type: "free_shipping",
    value: 0,
    minOrder: 75,
    maxUses: 2000,
    usedCount: 1456,
    status: "active",
    startDate: "2026-01-01",
    endDate: "2026-06-30",
  },
  {
    id: "4",
    code: "BOGO50",
    type: "buy_x_get_y",
    value: 50,
    minOrder: 100,
    maxUses: 300,
    usedCount: 300,
    status: "expired",
    startDate: "2025-11-01",
    endDate: "2025-12-31",
  },
  {
    id: "5",
    code: "WELCOME15",
    type: "percentage",
    value: 15,
    minOrder: 0,
    maxUses: 10000,
    usedCount: 3201,
    status: "active",
    startDate: "2025-01-01",
    endDate: "2026-12-31",
  },
];

export const mockBlogs: BlogPost[] = [
  {
    id: "1",
    title: "10 Summer Fashion Trends You Can't Miss",
    slug: "summer-fashion-trends-2026",
    excerpt:
      "Discover the hottest fashion trends for summer 2026 that will transform your wardrobe.",
    content: "<p>Summer is here and fashion is evolving...</p>",
    status: "published",
    author: "Jane Smith",
    category: "Fashion",
    tags: ["summer", "trends", "fashion"],
    featuredImage: "/placeholder.svg",
    seo: {
      metaTitle: "10 Summer Fashion Trends 2026 | Style Guide",
      metaDescription:
        "Discover the top 10 summer fashion trends for 2026. Stay stylish with our expert picks.",
      canonicalUrl: "https://store.com/blog/summer-fashion-trends-2026",
      ogTitle: "Summer Fashion Trends 2026",
      ogDescription: "The hottest fashion trends for summer 2026",
      ogImage: "/placeholder.svg",
      focusKeyword: "summer fashion trends 2026",
      noIndex: false,
      noFollow: false,
      structuredData: '{"@type":"BlogPosting"}',
    },
    publishedAt: "2026-02-01",
    createdAt: "2026-01-25",
  },
  {
    id: "2",
    title: "Ultimate Guide to Sustainable Shopping",
    slug: "sustainable-shopping-guide",
    excerpt:
      "How to shop sustainably without compromising on style or quality.",
    content: "<p>Sustainability is the future of fashion...</p>",
    status: "published",
    author: "John Admin",
    category: "Lifestyle",
    tags: ["sustainability", "eco-friendly", "shopping"],
    featuredImage: "/placeholder.svg",
    seo: {
      metaTitle: "Sustainable Shopping Guide | Eco-Friendly Tips",
      metaDescription:
        "Learn how to shop sustainably with our complete guide to eco-friendly fashion.",
      canonicalUrl: "",
      ogTitle: "Sustainable Shopping Guide",
      ogDescription: "Shop sustainably without compromise",
      ogImage: "",
      focusKeyword: "sustainable shopping",
      noIndex: false,
      noFollow: false,
      structuredData: "",
    },
    publishedAt: "2026-01-20",
    createdAt: "2026-01-15",
  },
  {
    id: "3",
    title: "How to Style Your Winter Accessories",
    slug: "winter-accessories-styling",
    excerpt:
      "Make the most of your winter accessories with these expert styling tips.",
    content: "<p>Winter accessories can make or break an outfit...</p>",
    status: "draft",
    author: "Jane Smith",
    category: "Fashion",
    tags: ["winter", "accessories", "styling"],
    featuredImage: "/placeholder.svg",
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
    publishedAt: "",
    createdAt: "2026-02-05",
  },
];

export const mockDashboard: DashboardStats = {
  totalRevenue: 124500,
  totalOrders: 1847,
  totalCustomers: 3420,
  conversionRate: 3.2,
  revenueChange: 12.5,
  ordersChange: 8.3,
  customersChange: 15.2,
  conversionChange: -0.8,
  recentOrders: [
    {
      id: "ORD-001",
      customer: "Alice Johnson",
      amount: 129.99,
      status: "completed",
      date: "2026-02-11",
    },
    {
      id: "ORD-002",
      customer: "Bob Williams",
      amount: 89.5,
      status: "processing",
      date: "2026-02-11",
    },
    {
      id: "ORD-003",
      customer: "Carol Davis",
      amount: 245.0,
      status: "shipped",
      date: "2026-02-10",
    },
    {
      id: "ORD-004",
      customer: "David Brown",
      amount: 67.25,
      status: "completed",
      date: "2026-02-10",
    },
    {
      id: "ORD-005",
      customer: "Eva Martinez",
      amount: 180.0,
      status: "pending",
      date: "2026-02-09",
    },
  ],
  salesChart: [
    { month: "Sep", revenue: 85000, orders: 1200 },
    { month: "Oct", revenue: 92000, orders: 1350 },
    { month: "Nov", revenue: 110000, orders: 1600 },
    { month: "Dec", revenue: 145000, orders: 2100 },
    { month: "Jan", revenue: 118000, orders: 1750 },
    { month: "Feb", revenue: 124500, orders: 1847 },
  ],
};

export const mockFlashSales: FlashSale[] = [
  {
    id: "1",
    name: "24-Hour Blowout",
    discountPercent: 40,
    productCount: 52,
    startDate: "2026-05-13",
    endDate: "2026-05-14",
    status: "active",
    ordersGenerated: 318,
    revenue: 28400,
  },
  {
    id: "2",
    name: "Weekend Clearance",
    discountPercent: 30,
    productCount: 120,
    startDate: "2026-05-17",
    endDate: "2026-05-19",
    status: "scheduled",
    ordersGenerated: 0,
    revenue: 0,
  },
  {
    id: "3",
    name: "New Year Kickoff Sale",
    discountPercent: 50,
    productCount: 80,
    startDate: "2026-01-01",
    endDate: "2026-01-03",
    status: "ended",
    ordersGenerated: 892,
    revenue: 67500,
  },
  {
    id: "4",
    name: "Valentine's Day Special",
    discountPercent: 20,
    productCount: 35,
    startDate: "2026-02-12",
    endDate: "2026-02-15",
    status: "ended",
    ordersGenerated: 445,
    revenue: 32100,
  },
];

export const mockAbandonedCarts: AbandonedCart[] = [
  {
    id: "1",
    customer: "Sarah Thompson",
    email: "sarah.t@email.com",
    cartValue: 189.5,
    itemCount: 3,
    abandonedAt: "2026-05-13T08:42:00Z",
    recoveryStatus: "pending",
    emailsSent: 1,
  },
  {
    id: "2",
    customer: "James Keller",
    email: "jkeller@mail.com",
    cartValue: 64.99,
    itemCount: 1,
    abandonedAt: "2026-05-12T14:15:00Z",
    recoveryStatus: "recovered",
    emailsSent: 2,
  },
  {
    id: "3",
    customer: "Priya Nair",
    email: "priya.n@webmail.com",
    cartValue: 312.0,
    itemCount: 5,
    abandonedAt: "2026-05-12T09:30:00Z",
    recoveryStatus: "pending",
    emailsSent: 2,
  },
  {
    id: "4",
    customer: "Marcus Green",
    email: "marcus.g@inbox.com",
    cartValue: 47.25,
    itemCount: 2,
    abandonedAt: "2026-05-11T21:00:00Z",
    recoveryStatus: "lost",
    emailsSent: 3,
  },
  {
    id: "5",
    customer: "Olivia Chen",
    email: "o.chen@email.com",
    cartValue: 529.0,
    itemCount: 4,
    abandonedAt: "2026-05-11T16:45:00Z",
    recoveryStatus: "recovered",
    emailsSent: 1,
  },
  {
    id: "6",
    customer: "Rafael Costa",
    email: "rafael.c@promail.com",
    cartValue: 93.75,
    itemCount: 2,
    abandonedAt: "2026-05-10T11:20:00Z",
    recoveryStatus: "pending",
    emailsSent: 3,
  },
  {
    id: "7",
    customer: "Nina Patel",
    email: "nina.p@fastmail.com",
    cartValue: 210.0,
    itemCount: 3,
    abandonedAt: "2026-05-09T18:00:00Z",
    recoveryStatus: "lost",
    emailsSent: 3,
  },
];

export const mockPopUps: PopUp[] = [
  {
    id: "1",
    name: "Exit Intent Newsletter",
    trigger: "exit_intent",
    goal: "email_capture",
    status: "active",
    impressions: 12400,
    conversions: 1488,
    createdAt: "2026-03-01",
  },
  {
    id: "2",
    name: "Welcome 10% Off",
    trigger: "page_load",
    goal: "discount",
    status: "active",
    impressions: 34200,
    conversions: 5814,
    createdAt: "2026-02-15",
  },
  {
    id: "3",
    name: "Summer Collection Reveal",
    trigger: "scroll",
    goal: "announcement",
    status: "paused",
    impressions: 8900,
    conversions: 623,
    createdAt: "2026-04-01",
  },
  {
    id: "4",
    name: "30s Delay Promo",
    trigger: "time_delay",
    goal: "discount",
    status: "draft",
    impressions: 0,
    conversions: 0,
    createdAt: "2026-05-10",
  },
];

export const mockReferrals: Referral[] = [
  {
    id: "1",
    referrerName: "Alice Johnson",
    referrerEmail: "alice.j@email.com",
    referralCode: "ALICE20",
    referralsSent: 18,
    successfulReferrals: 11,
    totalEarned: 220,
    status: "active",
    joinedAt: "2025-11-01",
  },
  {
    id: "2",
    referrerName: "Bob Williams",
    referrerEmail: "bob.w@mail.com",
    referralCode: "BOBW15",
    referralsSent: 7,
    successfulReferrals: 4,
    totalEarned: 80,
    status: "active",
    joinedAt: "2026-01-10",
  },
  {
    id: "3",
    referrerName: "Carol Davis",
    referrerEmail: "carol.d@inbox.com",
    referralCode: "CAROL25",
    referralsSent: 32,
    successfulReferrals: 19,
    totalEarned: 380,
    status: "active",
    joinedAt: "2025-09-15",
  },
  {
    id: "4",
    referrerName: "David Brown",
    referrerEmail: "d.brown@webmail.com",
    referralCode: "DAVID10",
    referralsSent: 3,
    successfulReferrals: 1,
    totalEarned: 20,
    status: "suspended",
    joinedAt: "2026-03-20",
  },
  {
    id: "5",
    referrerName: "Eva Martinez",
    referrerEmail: "eva.m@fastmail.com",
    referralCode: "EVAM30",
    referralsSent: 45,
    successfulReferrals: 29,
    totalEarned: 580,
    status: "active",
    joinedAt: "2025-07-01",
  },
];

export type TrackingChannel =
  | "google"
  | "facebook"
  | "instagram"
  | "tiktok"
  | "youtube"
  | "twitter"
  | "influencer"
  | "email"
  | "other";

export interface TrackingLink {
  id: string;
  name: string;
  channel: TrackingChannel;
  influencerHandle?: string;
  baseUrl: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  generatedUrl: string;
  visits: number;
  orders: number;
  revenue: number;
  status: "active" | "paused";
  createdAt: string;
}

export const mockTrackingLinks: TrackingLink[] = [
  {
    id: "1",
    name: "Google – Summer Sale Search",
    channel: "google",
    baseUrl: "https://store.com/sale",
    utmSource: "google",
    utmMedium: "cpc",
    utmCampaign: "summer_sale_2026",
    utmContent: "search_banner",
    utmTerm: "summer fashion sale",
    generatedUrl:
      "https://store.com/sale?utm_source=google&utm_medium=cpc&utm_campaign=summer_sale_2026&utm_content=search_banner&utm_term=summer+fashion+sale",
    visits: 12400,
    orders: 312,
    revenue: 28080,
    status: "active",
    createdAt: "2026-04-01",
  },
  {
    id: "2",
    name: "Facebook – Retargeting Ad",
    channel: "facebook",
    baseUrl: "https://store.com/products",
    utmSource: "facebook",
    utmMedium: "paid_social",
    utmCampaign: "retargeting_q2",
    utmContent: "carousel_v2",
    utmTerm: "",
    generatedUrl:
      "https://store.com/products?utm_source=facebook&utm_medium=paid_social&utm_campaign=retargeting_q2&utm_content=carousel_v2",
    visits: 8900,
    orders: 178,
    revenue: 16020,
    status: "active",
    createdAt: "2026-03-15",
  },
  {
    id: "3",
    name: "Instagram – Story Swipe-Up",
    channel: "instagram",
    baseUrl: "https://store.com/new-arrivals",
    utmSource: "instagram",
    utmMedium: "paid_social",
    utmCampaign: "new_arrivals_may",
    utmContent: "story_swipe",
    utmTerm: "",
    generatedUrl:
      "https://store.com/new-arrivals?utm_source=instagram&utm_medium=paid_social&utm_campaign=new_arrivals_may&utm_content=story_swipe",
    visits: 6200,
    orders: 89,
    revenue: 8010,
    status: "active",
    createdAt: "2026-05-01",
  },
  {
    id: "4",
    name: "TikTok – Viral Product Drop",
    channel: "tiktok",
    baseUrl: "https://store.com/trending",
    utmSource: "tiktok",
    utmMedium: "paid_social",
    utmCampaign: "viral_drop_may",
    utmContent: "short_video",
    utmTerm: "",
    generatedUrl:
      "https://store.com/trending?utm_source=tiktok&utm_medium=paid_social&utm_campaign=viral_drop_may&utm_content=short_video",
    visits: 22000,
    orders: 440,
    revenue: 39600,
    status: "active",
    createdAt: "2026-05-05",
  },
  {
    id: "5",
    name: "Influencer – @fashionista_maya",
    channel: "influencer",
    influencerHandle: "@fashionista_maya",
    baseUrl: "https://store.com/maya",
    utmSource: "fashionista_maya",
    utmMedium: "influencer",
    utmCampaign: "maya_collab_may",
    utmContent: "ig_post",
    utmTerm: "",
    generatedUrl:
      "https://store.com/maya?utm_source=fashionista_maya&utm_medium=influencer&utm_campaign=maya_collab_may&utm_content=ig_post",
    visits: 5400,
    orders: 162,
    revenue: 14580,
    status: "active",
    createdAt: "2026-05-01",
  },
  {
    id: "6",
    name: "Influencer – @style_by_leo",
    channel: "influencer",
    influencerHandle: "@style_by_leo",
    baseUrl: "https://store.com/leo",
    utmSource: "style_by_leo",
    utmMedium: "influencer",
    utmCampaign: "leo_collab_q2",
    utmContent: "youtube_review",
    utmTerm: "",
    generatedUrl:
      "https://store.com/leo?utm_source=style_by_leo&utm_medium=influencer&utm_campaign=leo_collab_q2&utm_content=youtube_review",
    visits: 3100,
    orders: 93,
    revenue: 8370,
    status: "active",
    createdAt: "2026-04-20",
  },
  {
    id: "7",
    name: "Email – Weekly Newsletter",
    channel: "email",
    baseUrl: "https://store.com/sale",
    utmSource: "newsletter",
    utmMedium: "email",
    utmCampaign: "weekly_digest_may",
    utmContent: "top_banner",
    utmTerm: "",
    generatedUrl:
      "https://store.com/sale?utm_source=newsletter&utm_medium=email&utm_campaign=weekly_digest_may&utm_content=top_banner",
    visits: 9100,
    orders: 364,
    revenue: 32760,
    status: "active",
    createdAt: "2026-05-10",
  },
  {
    id: "8",
    name: "YouTube – Pre-roll Ad",
    channel: "youtube",
    baseUrl: "https://store.com/brand",
    utmSource: "youtube",
    utmMedium: "video",
    utmCampaign: "brand_awareness_q2",
    utmContent: "preroll_15s",
    utmTerm: "",
    generatedUrl:
      "https://store.com/brand?utm_source=youtube&utm_medium=video&utm_campaign=brand_awareness_q2&utm_content=preroll_15s",
    visits: 3200,
    orders: 48,
    revenue: 4320,
    status: "paused",
    createdAt: "2026-03-01",
  },
  {
    id: "9",
    name: "Twitter/X – Promoted Post",
    channel: "twitter",
    baseUrl: "https://store.com/promo",
    utmSource: "twitter",
    utmMedium: "paid_social",
    utmCampaign: "promoted_may",
    utmContent: "text_ad",
    utmTerm: "",
    generatedUrl:
      "https://store.com/promo?utm_source=twitter&utm_medium=paid_social&utm_campaign=promoted_may&utm_content=text_ad",
    visits: 1800,
    orders: 27,
    revenue: 2430,
    status: "active",
    createdAt: "2026-05-08",
  },
];

export const mockLoyaltyMembers: LoyaltyMember[] = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice.j@email.com",
    tier: "platinum",
    points: 12400,
    totalSpent: 6200,
    redemptions: 14,
    joinedAt: "2024-06-01",
  },
  {
    id: "2",
    name: "Bob Williams",
    email: "bob.w@mail.com",
    tier: "gold",
    points: 5800,
    totalSpent: 2900,
    redemptions: 6,
    joinedAt: "2025-01-15",
  },
  {
    id: "3",
    name: "Carol Davis",
    email: "carol.d@inbox.com",
    tier: "gold",
    points: 4200,
    totalSpent: 2100,
    redemptions: 4,
    joinedAt: "2025-03-10",
  },
  {
    id: "4",
    name: "David Brown",
    email: "d.brown@webmail.com",
    tier: "silver",
    points: 1900,
    totalSpent: 950,
    redemptions: 2,
    joinedAt: "2025-07-20",
  },
  {
    id: "5",
    name: "Eva Martinez",
    email: "eva.m@fastmail.com",
    tier: "platinum",
    points: 18700,
    totalSpent: 9350,
    redemptions: 21,
    joinedAt: "2024-02-28",
  },
  {
    id: "6",
    name: "Frank Lee",
    email: "frank.l@promail.com",
    tier: "bronze",
    points: 420,
    totalSpent: 210,
    redemptions: 0,
    joinedAt: "2026-02-01",
  },
  {
    id: "7",
    name: "Grace Kim",
    email: "grace.k@email.com",
    tier: "silver",
    points: 2300,
    totalSpent: 1150,
    redemptions: 3,
    joinedAt: "2025-10-05",
  },
];

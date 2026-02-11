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
  recentOrders: { id: string; customer: string; amount: number; status: string; date: string }[];
  salesChart: { month: string; revenue: number; orders: number }[];
}

export const mockCampaigns: Campaign[] = [
  { id: "1", name: "Summer Sale Blast", type: "email", status: "active", reach: 45200, clicks: 3200, conversions: 890, budget: 5000, startDate: "2026-01-15", endDate: "2026-03-15" },
  { id: "2", name: "Flash Deal Push", type: "push", status: "active", reach: 28000, clicks: 4100, conversions: 1200, budget: 2000, startDate: "2026-02-01", endDate: "2026-02-28" },
  { id: "3", name: "VIP SMS Campaign", type: "sms", status: "paused", reach: 5000, clicks: 800, conversions: 320, budget: 1500, startDate: "2026-01-20", endDate: "2026-02-20" },
  { id: "4", name: "Instagram Promo", type: "social", status: "completed", reach: 120000, clicks: 8900, conversions: 2100, budget: 8000, startDate: "2025-12-01", endDate: "2026-01-31" },
  { id: "5", name: "New Arrivals Email", type: "email", status: "draft", reach: 0, clicks: 0, conversions: 0, budget: 3000, startDate: "2026-03-01", endDate: "2026-04-01" },
];

export const mockDiscounts: Discount[] = [
  { id: "1", code: "SUMMER25", type: "percentage", value: 25, minOrder: 50, maxUses: 1000, usedCount: 432, status: "active", startDate: "2026-01-01", endDate: "2026-03-31" },
  { id: "2", code: "FLAT10", type: "fixed", value: 10, minOrder: 30, maxUses: 500, usedCount: 289, status: "active", startDate: "2026-01-15", endDate: "2026-02-28" },
  { id: "3", code: "FREESHIP", type: "free_shipping", value: 0, minOrder: 75, maxUses: 2000, usedCount: 1456, status: "active", startDate: "2026-01-01", endDate: "2026-06-30" },
  { id: "4", code: "BOGO50", type: "buy_x_get_y", value: 50, minOrder: 100, maxUses: 300, usedCount: 300, status: "expired", startDate: "2025-11-01", endDate: "2025-12-31" },
  { id: "5", code: "WELCOME15", type: "percentage", value: 15, minOrder: 0, maxUses: 10000, usedCount: 3201, status: "active", startDate: "2025-01-01", endDate: "2026-12-31" },
];

export const mockBlogs: BlogPost[] = [
  {
    id: "1", title: "10 Summer Fashion Trends You Can't Miss", slug: "summer-fashion-trends-2026",
    excerpt: "Discover the hottest fashion trends for summer 2026 that will transform your wardrobe.",
    content: "<p>Summer is here and fashion is evolving...</p>",
    status: "published", author: "Jane Smith", category: "Fashion", tags: ["summer", "trends", "fashion"],
    featuredImage: "/placeholder.svg",
    seo: { metaTitle: "10 Summer Fashion Trends 2026 | Style Guide", metaDescription: "Discover the top 10 summer fashion trends for 2026. Stay stylish with our expert picks.", canonicalUrl: "https://store.com/blog/summer-fashion-trends-2026", ogTitle: "Summer Fashion Trends 2026", ogDescription: "The hottest fashion trends for summer 2026", ogImage: "/placeholder.svg", focusKeyword: "summer fashion trends 2026", noIndex: false, noFollow: false, structuredData: '{"@type":"BlogPosting"}' },
    publishedAt: "2026-02-01", createdAt: "2026-01-25",
  },
  {
    id: "2", title: "Ultimate Guide to Sustainable Shopping", slug: "sustainable-shopping-guide",
    excerpt: "How to shop sustainably without compromising on style or quality.",
    content: "<p>Sustainability is the future of fashion...</p>",
    status: "published", author: "John Admin", category: "Lifestyle", tags: ["sustainability", "eco-friendly", "shopping"],
    featuredImage: "/placeholder.svg",
    seo: { metaTitle: "Sustainable Shopping Guide | Eco-Friendly Tips", metaDescription: "Learn how to shop sustainably with our complete guide to eco-friendly fashion.", canonicalUrl: "", ogTitle: "Sustainable Shopping Guide", ogDescription: "Shop sustainably without compromise", ogImage: "", focusKeyword: "sustainable shopping", noIndex: false, noFollow: false, structuredData: "" },
    publishedAt: "2026-01-20", createdAt: "2026-01-15",
  },
  {
    id: "3", title: "How to Style Your Winter Accessories", slug: "winter-accessories-styling",
    excerpt: "Make the most of your winter accessories with these expert styling tips.",
    content: "<p>Winter accessories can make or break an outfit...</p>",
    status: "draft", author: "Jane Smith", category: "Fashion", tags: ["winter", "accessories", "styling"],
    featuredImage: "/placeholder.svg",
    seo: { metaTitle: "", metaDescription: "", canonicalUrl: "", ogTitle: "", ogDescription: "", ogImage: "", focusKeyword: "", noIndex: false, noFollow: false, structuredData: "" },
    publishedAt: "", createdAt: "2026-02-05",
  },
];

export const mockDashboard: DashboardStats = {
  totalRevenue: 124500, totalOrders: 1847, totalCustomers: 3420, conversionRate: 3.2,
  revenueChange: 12.5, ordersChange: 8.3, customersChange: 15.2, conversionChange: -0.8,
  recentOrders: [
    { id: "ORD-001", customer: "Alice Johnson", amount: 129.99, status: "completed", date: "2026-02-11" },
    { id: "ORD-002", customer: "Bob Williams", amount: 89.50, status: "processing", date: "2026-02-11" },
    { id: "ORD-003", customer: "Carol Davis", amount: 245.00, status: "shipped", date: "2026-02-10" },
    { id: "ORD-004", customer: "David Brown", amount: 67.25, status: "completed", date: "2026-02-10" },
    { id: "ORD-005", customer: "Eva Martinez", amount: 180.00, status: "pending", date: "2026-02-09" },
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

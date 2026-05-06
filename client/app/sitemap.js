const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6000/api";

export default async function sitemap() {
  const staticRoutes = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
  ];

  try {
    const res = await fetch(`${API_URL}/products?limit=1000&page=1`, { next: { revalidate: 3600 } });
    const { data: products } = await res.json();
    const productRoutes = (products || []).map((p) => ({
      url: `${BASE_URL}/products/${p.slug}`,
      lastModified: new Date(p.updatedAt),
      changeFrequency: "weekly",
      priority: 0.8,
    }));
    return [...staticRoutes, ...productRoutes];
  } catch {
    return staticRoutes;
  }
}

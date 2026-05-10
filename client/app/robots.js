const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function robots() {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/checkout", "/auth/", "/account/"] },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}

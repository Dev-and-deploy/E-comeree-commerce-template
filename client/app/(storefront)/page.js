import { fetchActiveTheme, fetchProducts } from "../../lib/api.js";
import { getTemplateName } from "../../lib/theme.js";
import FashionHome from "../../templates/fashion/HomePage.jsx";
import ElectronicsHome from "../../templates/electronics/HomePage.jsx";
import MinimalHome from "../../templates/minimal/HomePage.jsx";
import ModernHome from "../../templates/modern/HomePage.jsx";

export const revalidate = 300;

const TEMPLATES = {
  fashion: FashionHome,
  electronics: ElectronicsHome,
  minimal: MinimalHome,
  modern: ModernHome,
};

export async function generateMetadata() {
  try {
    const res = await fetchActiveTheme();
    const theme = res?.data;
    return {
      title: theme?.storeName || "MyStore",
      description: "Shop the latest collection",
      openGraph: { title: theme?.storeName, type: "website" },
    };
  } catch {
    return { title: "MyStore" };
  }
}

export default async function HomePage() {
  let themeConfig = null;
  let featuredProducts = [];

  try {
    const [themeRes, productsRes] = await Promise.all([
      fetchActiveTheme(),
      fetchProducts("featured=true&limit=8"),
    ]);
    themeConfig = themeRes?.data || null;
    featuredProducts = productsRes?.data || [];
  } catch {}

  const templateName = getTemplateName(themeConfig);
  const HomeComponent = TEMPLATES[templateName] || FashionHome;

  return <HomeComponent theme={themeConfig} featuredProducts={featuredProducts} />;
}

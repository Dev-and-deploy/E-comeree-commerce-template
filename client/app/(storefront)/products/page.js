import { fetchProducts, fetchCategories } from "../../../lib/api.js";
import ProductGrid from "../../../components/product/ProductGrid.jsx";
import ProductFilters from "../../../components/product/ProductFilters.jsx";

export const revalidate = 0;

export async function generateMetadata({ searchParams }) {
  const resolved = await searchParams;
  const category = resolved?.category;
  const search = resolved?.search;

  let title = "Products";
  let description = "Browse our full product catalogue";

  if (search) {
    title = `Search: ${search}`;
    description = `Search results for "${search}"`;
  } else if (category) {
    title = `${category.charAt(0).toUpperCase() + category.slice(1)} Products`;
    description = `Browse ${category} products`;
  }

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function ProductsPage({ searchParams }) {
  const resolved = await searchParams;

  const params = new URLSearchParams();
  if (resolved?.category) params.set("category", resolved.category);
  if (resolved?.search) params.set("search", resolved.search);
  if (resolved?.sort) params.set("sort", resolved.sort);
  if (resolved?.page) params.set("page", resolved.page);
  if (resolved?.minPrice) params.set("minPrice", resolved.minPrice);
  if (resolved?.maxPrice) params.set("maxPrice", resolved.maxPrice);
  params.set("limit", "24");

  const [productsRes, categoriesRes] = await Promise.all([
    fetchProducts(params.toString()),
    fetchCategories(),
  ]);

  const products = productsRes?.data || [];
  const pagination = productsRes?.pagination || {};
  const categories = categoriesRes?.data || [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {resolved?.search
            ? `Results for "${resolved.search}"`
            : resolved?.category
              ? categories.find((c) => c.slug === resolved.category)?.name ?? "Products"
              : "All Products"}
        </h1>
        {pagination?.total !== undefined && (
          <p className="text-sm text-gray-500 mt-1">
            {pagination.total} product{pagination.total !== 1 ? "s" : ""} found
          </p>
        )}
      </div>

      <div className="flex gap-8">
        <aside className="w-64 shrink-0 hidden lg:block">
          <div className="sticky top-24 bg-white rounded-xl border p-5 shadow-sm">
            <ProductFilters categories={categories} />
          </div>
        </aside>
        <div className="flex-1 min-w-0">
          <ProductGrid products={products} pagination={pagination} currentParams={params.toString()} />
        </div>
      </div>
    </div>
  );
}

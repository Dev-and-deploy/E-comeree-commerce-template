import Link from "next/link";
import ProductCard from "./ProductCard.jsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

function getPageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, "…", total];
  if (current >= total - 3)
    return [1, "…", total - 4, total - 3, total - 2, total - 1, total];
  return [1, "…", current - 1, current, current + 1, "…", total];
}

export default function ProductGrid({ products, pagination, currentParams = "" }) {
  function buildPageUrl(page) {
    const p = new URLSearchParams(currentParams);
    p.set("page", String(page));
    return `/products?${p.toString()}`;
  }

  if (!products.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
        <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
        </svg>
        <p className="text-sm font-medium">No products found</p>
        <p className="text-xs">Try adjusting your filters or search</p>
      </div>
    );
  }

  const currentPage = pagination?.page ?? 1;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div>
      {pagination?.total !== undefined && (
        <p className="text-sm text-gray-500 mb-4">
          {pagination.total} product{pagination.total !== 1 ? "s" : ""} found
        </p>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>

      {totalPages > 1 && (
        <nav className="flex items-center justify-center gap-1 mt-10" aria-label="Pagination">
          <Link
            href={currentPage > 1 ? buildPageUrl(currentPage - 1) : "#"}
            aria-disabled={currentPage <= 1}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage <= 1
                ? "text-gray-300 pointer-events-none"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <ChevronLeft size={14} />
            Prev
          </Link>

          {getPageNumbers(currentPage, totalPages).map((page, i) =>
            page === "…" ? (
              <span key={`e-${i}`} className="px-2 text-gray-400 text-sm">…</span>
            ) : (
              <Link
                key={page}
                href={buildPageUrl(page)}
                aria-current={page === currentPage ? "page" : undefined}
                className={`h-9 w-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                  page === currentPage
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                {page}
              </Link>
            )
          )}

          <Link
            href={currentPage < totalPages ? buildPageUrl(currentPage + 1) : "#"}
            aria-disabled={currentPage >= totalPages}
            className={`flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              currentPage >= totalPages
                ? "text-gray-300 pointer-events-none"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Next
            <ChevronRight size={14} />
          </Link>
        </nav>
      )}
    </div>
  );
}

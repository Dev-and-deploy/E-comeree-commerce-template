"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Search, X, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";

const SORT_OPTIONS = [
  { value: "", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export default function ProductFilters({ categories }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get("category") ?? "";
  const currentSort = searchParams.get("sort") ?? "";
  const currentSearch = searchParams.get("search") ?? "";
  const currentMinPrice = searchParams.get("minPrice") ?? "";
  const currentMaxPrice = searchParams.get("maxPrice") ?? "";

  const [searchValue, setSearchValue] = useState(currentSearch);
  const [priceOpen, setPriceOpen] = useState(!!(currentMinPrice || currentMaxPrice));
  const [minPrice, setMinPrice] = useState(currentMinPrice);
  const [maxPrice, setMaxPrice] = useState(currentMaxPrice);
  const searchTimer = useRef();

  useEffect(() => {
    setSearchValue(searchParams.get("search") ?? "");
  }, [searchParams]);

  const setFilter = (key, value) => {
    const params = new URLSearchParams(searchParams.toString());
    value ? params.set(key, value) : params.delete(key);
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const handleSearch = (val) => {
    setSearchValue(val);
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      val ? params.set("search", val) : params.delete("search");
      params.delete("page");
      router.push(`/products?${params.toString()}`);
    }, 400);
  };

  const applyPrice = () => {
    const params = new URLSearchParams(searchParams.toString());
    minPrice ? params.set("minPrice", minPrice) : params.delete("minPrice");
    maxPrice ? params.set("maxPrice", maxPrice) : params.delete("maxPrice");
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const clearPrice = () => {
    setMinPrice("");
    setMaxPrice("");
    const params = new URLSearchParams(searchParams.toString());
    params.delete("minPrice");
    params.delete("maxPrice");
    params.delete("page");
    router.push(`/products?${params.toString()}`);
  };

  const clearAll = () => {
    setSearchValue("");
    setMinPrice("");
    setMaxPrice("");
    router.push("/products");
  };

  const hasFilters = currentCategory || currentSort || currentSearch || currentMinPrice || currentMaxPrice;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <SlidersHorizontal size={15} />
          Filters
        </div>
        {hasFilters && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors"
          >
            <X size={12} />
            Clear all
          </button>
        )}
      </div>

      {/* Search */}
      <div>
        <label className="text-xs font-medium text-gray-600 uppercase tracking-wider block mb-2">
          Search
        </label>
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
          {searchValue && (
            <button
              onClick={() => handleSearch("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Sort */}
      <div>
        <label className="text-xs font-medium text-gray-600 uppercase tracking-wider block mb-2">
          Sort By
        </label>
        <div className="space-y-1">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilter("sort", opt.value)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                currentSort === opt.value
                  ? "bg-primary text-white font-medium"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div>
        <label className="text-xs font-medium text-gray-600 uppercase tracking-wider block mb-2">
          Categories
        </label>
        <div className="space-y-1">
          <button
            onClick={() => setFilter("category", "")}
            className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
              !currentCategory
                ? "bg-primary text-white font-medium"
                : "hover:bg-gray-100 text-gray-700"
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setFilter("category", c.slug)}
              className={`w-full flex items-center justify-between text-sm px-3 py-2 rounded-lg transition-colors ${
                currentCategory === c.slug
                  ? "bg-primary text-white font-medium"
                  : "hover:bg-gray-100 text-gray-700"
              }`}
            >
              <span>{c.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Price Range */}
      <div>
        <button
          onClick={() => setPriceOpen((o) => !o)}
          className="flex items-center justify-between w-full text-xs font-medium text-gray-600 uppercase tracking-wider mb-2"
        >
          <span>Price Range</span>
          {priceOpen ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
        {priceOpen && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Min ($)</label>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  min="0"
                  placeholder="0"
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Max ($)</label>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  min="0"
                  placeholder="∞"
                  className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={applyPrice}
                className="flex-1 py-1.5 text-xs font-medium bg-primary text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Apply
              </button>
              {(currentMinPrice || currentMaxPrice) && (
                <button
                  onClick={clearPrice}
                  className="px-3 py-1.5 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

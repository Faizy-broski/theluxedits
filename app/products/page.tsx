"use client";

import Link from "next/link";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/shared/Header";
import Footer from "@/components/homePage/Footer";
import ProductCard from "@/components/shared/ProductCard";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import api from "@/lib/api";

interface ApiProduct {
  id: number;
  title: string;
  brand: string;
  price: string;
  currency: string;
  category: string;
  image_url: string;
  product_url: string;
  sku?: string;
  description?: string;
}


const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "name_asc", label: "Name A–Z" },
];

function ProductsInner() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "All");
  const [activeBrand, setActiveBrand] = useState(searchParams.get("brand") || "");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  // Sync state when URL params change (e.g. mega menu navigation)
  useEffect(() => {
    setActiveCategory(searchParams.get("category") || "All");
    setActiveBrand(searchParams.get("brand") || "");
    setPage(1);
  }, [searchParams]);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, per_page: 24, sort };
      if (activeCategory !== "All") params.category = activeCategory;
      if (activeBrand) params.brand = activeBrand;
      if (search) params.search = search;
      if (minPrice) params.min_price = minPrice;
      if (maxPrice) params.max_price = maxPrice;

      const { data } = await api.get("/products", { params });
      const withImages = (data.data as ApiProduct[]).filter(
        (p) => p.image_url && p.image_url.trim() !== ""
      );
      setProducts(withImages);
      setLastPage(data.last_page);
      setTotal(data.total);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [page, sort, activeCategory, activeBrand, search, minPrice, maxPrice]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    api.get("/products/categories").then(({ data }) => setCategories(data)).catch(() => {});
    api.get("/products/brands").then(({ data }) => setBrands(data)).catch(() => {});
  }, []);

  function resetFilters() {
    setActiveCategory("All");
    setActiveBrand("");
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
    setPage(1);
  }

  function handleCategoryChange(cat: string) {
    setActiveCategory(cat);
    setPage(1);
  }

  return (
    <main>
      <Header />

      {/* Page header */}
      <section className="bg-white pt-24 pb-10 md:pt-32 md:pb-14">
        <div className="mx-auto max-w-6xl px-5 lg:px-0">
          <p className="mb-4 font-jet text-[10px] uppercase tracking-[0.35em] text-black/45">— The Edit</p>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <h1 className="font-fraunces text-4xl font-light leading-none tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              All <em className="italic">Products.</em>
            </h1>

            {/* Search + Sort */}
            <div className="flex flex-wrap items-center gap-3">
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search products…"
                className="h-9 border border-black/20 bg-transparent px-3 font-jet text-[10px] uppercase tracking-[0.15em] text-black placeholder-black/30 outline-none focus:border-black w-48"
              />
              <select
                value={sort}
                onChange={(e) => { setSort(e.target.value); setPage(1); }}
                className="h-9 border border-black/20 bg-white px-3 font-jet text-[10px] uppercase tracking-[0.1em] text-black outline-none focus:border-black"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <button
                onClick={() => setShowFilters((p) => !p)}
                className="flex h-9 items-center gap-2 border border-black/20 px-3 font-jet text-[10px] uppercase tracking-[0.15em] text-black/60 hover:border-black hover:text-black"
              >
                <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={1.5} />
                Filters
              </button>
            </div>
          </div>

          {/* Category pills */}
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={() => handleCategoryChange("All")}
              className={`rounded-full px-3.5 py-1.5 font-jet text-[10px] uppercase tracking-[0.2em] transition-colors ${activeCategory === "All" ? "bg-black text-white" : "border border-black/20 text-black/60 hover:border-black hover:text-black"}`}
            >
              All
            </button>
            {categories.slice(0, 12).map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`rounded-full px-3.5 py-1.5 font-jet text-[10px] uppercase tracking-[0.2em] transition-colors ${activeCategory === cat ? "bg-black text-white" : "border border-black/20 text-black/60 hover:border-black hover:text-black"}`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Advanced filters panel */}
          {showFilters && (
            <div className="mt-4 border border-black/10 p-5">
              <div className="flex flex-wrap items-end gap-5">
                <div>
                  <label className="mb-1.5 block font-jet text-[9px] uppercase tracking-[0.3em] text-black/40">Brand</label>
                  <select
                    value={activeBrand}
                    onChange={(e) => { setActiveBrand(e.target.value); setPage(1); }}
                    className="h-9 border border-black/20 bg-white px-3 font-jet text-[10px] text-black outline-none focus:border-black min-w-[160px]"
                  >
                    <option value="">All Brands</option>
                    {brands.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1.5 block font-jet text-[9px] uppercase tracking-[0.3em] text-black/40">Min Price</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                    placeholder="0"
                    className="h-9 w-24 border border-black/20 bg-transparent px-3 font-jet text-[10px] text-black outline-none focus:border-black"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-jet text-[9px] uppercase tracking-[0.3em] text-black/40">Max Price</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                    placeholder="9999"
                    className="h-9 w-24 border border-black/20 bg-transparent px-3 font-jet text-[10px] text-black outline-none focus:border-black"
                  />
                </div>
                <button
                  onClick={resetFilters}
                  className="flex h-9 items-center gap-1.5 font-jet text-[10px] uppercase tracking-[0.2em] text-black/40 hover:text-black"
                >
                  <X className="h-3 w-3" strokeWidth={1.5} />
                  Clear all
                </button>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-center gap-2">
            <div className="h-px flex-1 bg-black/10" />
            <span className="font-jet text-[10px] uppercase tracking-[0.2em] text-black/35">
              {loading ? "Loading…" : `${total} pieces`}
            </span>
          </div>
        </div>
      </section>

      {/* Product grid */}
      <section className="bg-white pb-20 md:pb-28">
        <div className="mx-auto max-w-6xl px-5 lg:px-0">
          {loading ? (
            <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] bg-neutral-100" />
                  <div className="mt-3 space-y-2">
                    <div className="h-3 w-20 bg-neutral-100 rounded" />
                    <div className="h-4 w-full bg-neutral-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="py-24 text-center">
              <p className="font-jet text-[10px] uppercase tracking-[0.3em] text-black/35">No pieces found</p>
              <button onClick={resetFilters} className="mt-4 font-jet text-[10px] uppercase tracking-[0.2em] text-black underline">
                Clear filters
              </button>
            </div>
          ) : (
            <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} variant="listing" />
              ))}
            </div>
          )}

          {/* Pagination */}
          {lastPage > 1 && (
            <div className="mt-16 flex items-center justify-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-9 px-4 border border-black/20 font-jet text-[10px] uppercase tracking-[0.2em] text-black/60 disabled:opacity-30 hover:border-black hover:text-black"
              >
                Prev
              </button>
              <span className="font-jet text-[10px] uppercase tracking-[0.2em] text-black/40">
                {page} / {lastPage}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(lastPage, p + 1))}
                disabled={page === lastPage}
                className="h-9 px-4 border border-black/20 font-jet text-[10px] uppercase tracking-[0.2em] text-black/60 disabled:opacity-30 hover:border-black hover:text-black"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<main><div className="flex min-h-screen items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-2 border-black/20 border-t-black" /></div></main>}>
      <ProductsInner />
    </Suspense>
  );
}

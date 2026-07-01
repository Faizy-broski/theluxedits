"use client";

import { SlidersHorizontal, X, ChevronRight } from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/homePage/Footer";
import ProductCard from "@/components/shared/ProductCard";
import { useState, useEffect, useCallback, Suspense } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
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
  { value: "newest",     label: "Newest"            },
  { value: "price_asc",  label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
  { value: "name_asc",   label: "Name A–Z"          },
];

// ── Static category pills ────────────────────────────────────────────────────
// Hardcoded so the pills always reflect your real top-level taxonomy, not
// whatever mixed brand/category strings the DB happens to return.
//
// `label`  — what the user sees on the pill
// `value`  — the category string sent to the API (must match DB values exactly)
//
// Edit this list to add, remove, or rename pills. Max 12 shown.
const PILL_CATEGORIES: { label: string; value: string }[] = [
   { label: "Jewellery", value: "Jewellery" },
  // { label: "Women",       value: "Women"       },
  // { label: "Men",         value: "Men"         },
  { label: "Shoes",       value: "Shoes"       },
  { label: "Bags",        value: "Bags"        },
  { label: "Watches",     value: "Accessories" }, // DB stores watches as "Accessories"
  { label: "Perfumes",    value: "Perfumes"    },
  { label: "Electronics", value: "Electronics" },
  // Add up to 5 more here if needed, e.g.:
  // { label: "Jewellery", value: "Jewellery" },
  // { label: "Sunglasses", value: "Sunglasses" },
];

function splitHeading(label: string): { rest: string; last: string } {
  const words = label.trim().split(" ");
  if (words.length === 1) return { rest: "", last: label };
  return { rest: words.slice(0, -1).join(" "), last: words[words.length - 1] };
}

function ProductsInner() {
  const router      = useRouter();
  const pathname    = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [brands, setBrands]     = useState<string[]>([]);
  const [loading, setLoading]   = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  // URL is the single source of truth — /products?category=Women&brand=Nike
  const activeCategory = searchParams.get("category") || "All";
  const activeBrand    = searchParams.get("brand")    || "";

  const [search, setSearch]     = useState("");
  const [sort, setSort]         = useState("newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage]         = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal]       = useState(0);

  useEffect(() => { setPage(1); }, [activeCategory, activeBrand]);

  // Push category / brand changes onto the URL, preserving the other param.
  const updateUrl = useCallback(
    (updates: { category?: string; brand?: string }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.category !== undefined) {
        updates.category === "All"
          ? params.delete("category")
          : params.set("category", updates.category);
      }
      if (updates.brand !== undefined) {
        !updates.brand
          ? params.delete("brand")
          : params.set("brand", updates.brand);
      }

      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  // Products fetch.
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, per_page: 24, sort };
      if (activeCategory !== "All") params.category = activeCategory;
      if (activeBrand)              params.brand     = activeBrand;
      if (search)                   params.search    = search;
      if (minPrice)                 params.min_price = minPrice;
      if (maxPrice)                 params.max_price = maxPrice;

      const { data } = await api.get("/products", { params });
      const withImages = (data.data as ApiProduct[]).filter(
        (p) => p.image_url && p.image_url.trim() !== "",
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

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // Brands scoped to the active category — filter panel only shows brands
  // that actually exist within the selected category.
  useEffect(() => {
    const params = activeCategory !== "All" ? { category: activeCategory } : {};

    api
      .get("/products/brands", { params })
      .then(({ data }) => {
        console.log(
          `[Brands] ${activeCategory !== "All" ? `scoped to "${activeCategory}"` : "all categories"} →`,
          `${data.length} brands:`,
          data,
        );
        setBrands(data);

        // Drop the active brand from the URL if it doesn't exist in the
        // new category's brand list.
        if (activeBrand && !data.includes(activeBrand)) {
          updateUrl({ brand: "" });
        }
      })
      .catch(() => setBrands([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeCategory]);

  function resetFilters() {
    router.push(pathname, { scroll: false });
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    setSort("newest");
  }

  // ── Heading / breadcrumb ─────────────────────────────────────────────────
  const hasCategory = activeCategory !== "All";
  const hasBrand    = !!activeBrand;

  // Use the human-readable pill label for the heading when possible,
  // falling back to the raw DB value (e.g. "Accessories" → "Watches").
  const categoryLabel =
    PILL_CATEGORIES.find((c) => c.value === activeCategory)?.label ?? activeCategory;

  const headingLabel =
    hasCategory && hasBrand ? `${categoryLabel} · ${activeBrand}` :
    hasBrand                ? activeBrand                          :
    hasCategory             ? categoryLabel                        :
                              "All Products";

  const { rest: headingRest, last: headingLast } = splitHeading(headingLabel);

  const breadcrumbTrail: string[] = [];
  if (hasCategory) breadcrumbTrail.push(categoryLabel);
  if (hasBrand)    breadcrumbTrail.push(activeBrand);

  return (
    <main>
      <Header />

      {/* Page header */}
      <section className="bg-white pt-24 pb-10 md:pt-32 md:pb-14">
        <div className="mx-auto max-w-6xl px-5 lg:px-0">

          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-1.5 font-jet text-[10px] uppercase tracking-[0.35em]">
            <span className="text-black/45">— The Edit</span>
            {breadcrumbTrail.map((segment) => (
              <span key={segment} className="flex items-center gap-1.5">
                <ChevronRight className="h-2.5 w-2.5 text-black/25" strokeWidth={2} />
                <span className="text-black/60">{segment}</span>
              </span>
            ))}
          </div>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            {/* Dynamic heading — last word italic */}
            <h1 className="font-fraunces text-4xl font-light leading-none tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              {headingRest && <>{headingRest} </>}
              <em className="italic">{headingLast}.</em>
            </h1>

            {/* Search + Sort + Filter toggle */}
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
                className="h-9 border border-black/20 bg-white px-3 font-jet text-[10px] uppercase tracking-widest text-black outline-none focus:border-black"
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
                {hasBrand && (
                  <span className="flex h-4 w-4 items-center justify-center rounded-full bg-black font-jet text-[8px] leading-none text-white">
                    1
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ── Category pills — hardcoded, max 12 ────────────────────────── */}
          <div className="mt-5 flex flex-wrap gap-2">
            {/* "All" pill */}
            <button
              onClick={() => updateUrl({ category: "All" })}
              className={`rounded-full px-3.5 py-1.5 font-jet text-[10px] uppercase tracking-[0.2em] transition-colors ${
                activeCategory === "All"
                  ? "bg-black text-white"
                  : "border border-black/20 text-black/60 hover:border-black hover:text-black"
              }`}
            >
              All
            </button>

            {/* Static category pills */}
            {PILL_CATEGORIES.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => updateUrl({ category: value })}
                className={`rounded-full px-3.5 py-1.5 font-jet text-[10px] uppercase tracking-[0.2em] transition-colors ${
                  activeCategory === value
                    ? "bg-black text-white"
                    : "border border-black/20 text-black/60 hover:border-black hover:text-black"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Advanced filters panel */}
          {showFilters && (
            <div className="mt-4 border border-black/10 p-5">
              <div className="flex flex-wrap items-end gap-5">
                {/* Brand — scoped to the active category */}
                <div>
                  <label className="mb-1.5 block font-jet text-[9px] uppercase tracking-[0.3em] text-black/40">
                    Brand{hasCategory ? ` (in ${categoryLabel})` : ""}
                  </label>
                  <select
                    value={activeBrand}
                    onChange={(e) => updateUrl({ brand: e.target.value })}
                    className="h-9 border border-black/20 bg-white px-3 font-jet text-[10px] text-black outline-none focus:border-black min-w-40"
                  >
                    <option value="">All Brands</option>
                    {brands.map((b) => (
                      <option key={b} value={b}>{b}</option>
                    ))}
                  </select>
                </div>

                {/* Price range */}
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

              {hasBrand && hasCategory && (
                <p className="mt-4 font-jet text-[9px] uppercase tracking-[0.25em] text-black/35">
                  Showing <span className="text-black/60">{activeBrand}</span> within{" "}
                  <span className="text-black/60">{categoryLabel}</span>
                </p>
              )}
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
                  <div className="aspect-4/5 bg-neutral-100" />
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
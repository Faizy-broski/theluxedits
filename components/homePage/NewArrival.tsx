"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

const filters = [
  { label: "All",         category: "" },
  { label: "Shoes",       category: "Shoes" },
  { label: "Bags",        category: "Bags" },
  { label: "Watches",     category: "Accessories" },
  { label: "Perfumes",    category: "Perfumes" },
  { label: "Electronics", category: "Electronics" },
];

interface Product {
  id: number;
  title: string;
  brand: string;
  price: number;
  currency: string;
  image_url: string | null;
  category: string;
  quantity?: number;
}

const DISPLAY_COUNT = 4;

export default function NewArrivals() {
  const [activeIndex, setActiveIndex]   = useState(0);
  const [pool, setPool]                 = useState<Product[]>([]);
  const [brokenIds, setBrokenIds]       = useState<Set<number>>(new Set());
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    setLoading(true);
    setBrokenIds(new Set());
    const category = filters[activeIndex].category;
    api
      .get("/products", {
        params: { sort: "newest", per_page: 50, ...(category ? { category } : {}) },
      })
      .then((res) => {
        const all: Product[] = res.data.data ?? res.data;
        // Keep only products that have an image_url and are in stock (quantity > 0 or unknown)
        const valid = all.filter(
          (p) => p.image_url && p.image_url.trim() !== ""
        );
        setPool(valid);
      })
      .catch(() => setPool([]))
      .finally(() => setLoading(false));
  }, [activeIndex]);

  const handleBrokenImage = useCallback((id: number) => {
    setBrokenIds((prev) => new Set(prev).add(id));
  }, []);

  // From the pool, skip any whose image errored — take first DISPLAY_COUNT
  const displayed = pool
    .filter((p) => !brokenIds.has(p.id))
    .slice(0, DISPLAY_COUNT);

  return (
    <section className="py-16 text-black md:py-20 lg:py-24">
      <div className="max-w-6xl mx-auto px-5 lg:px-0">
        <div className="mb-16 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-5 font-jet text-[10px] uppercase text-black/55">
              — New Arrivals
            </p>
            <h2 className="font-fraunces text-4xl font-light leading-none tracking-[-0.055em] sm:text-5xl lg:text-6xl">
              New <em className="italic">arrivals.</em>
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {filters.map((filter, index) => (
              <Button
                key={filter.label}
                onClick={() => setActiveIndex(index)}
                variant={activeIndex === index ? "default" : "outline"}
                className={[
                  "px-3 py-2 rounded-full text-xs font-normal",
                  activeIndex === index
                    ? "bg-black text-white hover:bg-black/85"
                    : "border-black/20 bg-transparent text-black hover:bg-black hover:text-white",
                ].join(" ")}
              >
                {filter.label}
              </Button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-neutral-100" />
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-1/3 bg-neutral-100 rounded" />
                  <div className="h-3 w-2/3 bg-neutral-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-jet text-[10px] uppercase tracking-[0.3em] text-black/35">
              No products available
            </p>
            <Link
              href="/products"
              className="mt-4 font-jet text-[10px] uppercase tracking-[0.2em] text-black underline"
            >
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {displayed.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group block"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                  {/* Use plain <img> so onError fires reliably */}
                  <img
                    src={product.image_url!}
                    alt={product.title}
                    onError={() => handleBrokenImage(product.id)}
                    className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-white px-2 py-1 text-[10px] text-black">
                    New
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-[1fr_auto] gap-4">
                  <div>
                    <p className="font-jet text-[10px] uppercase text-black/55 truncate">
                      {product.brand || product.category}
                    </p>
                    <h3 className="font-sans text-xs font-normal text-black line-clamp-1">
                      {product.title}
                    </h3>
                  </div>
                  <p className="font-fraunces text-sm font-normal text-black shrink-0">
                    ${Number(product.price).toFixed(2)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/products"
            className="font-jet text-[10px] uppercase tracking-[0.3em] text-black/50 underline hover:text-black"
          >
            View All Products
          </Link>
        </div>
      </div>
    </section>
  );
}

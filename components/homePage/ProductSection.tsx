"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/shared/ProductCard";
import api from "@/lib/api";

interface Filter {
  label: string;
  category: string;
}

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

interface Props {
  sectionLabel: string;
  heading: string;
  headingItalic: string;
  filters: Filter[];
  badge?: string; // kept for compat but no longer rendered on card
}

export default function ProductSection({
  sectionLabel,
  heading,
  headingItalic,
  filters,
  badge = "New",
}: Props) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [pool, setPool]               = useState<Product[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    setLoading(true);
    const category = filters[activeIndex].category;
    api
      .get("/products", {
        params: { sort: "newest", per_page: 80, ...(category ? { category } : {}) },
      })
      .then((res) => {
        const all: Product[] = res.data.data ?? res.data;
        setPool(all.filter((p) => p.image_url && p.image_url.trim() !== ""));
      })
      .catch(() => setPool([]))
      .finally(() => setLoading(false));
  }, [activeIndex, filters]);

  const displayed = pool.slice(0, 8);

  return (
    <section className="py-16 text-black md:py-20 lg:py-24">
      <div className="max-w-6xl mx-auto px-5 lg:px-0">

        {/* Header */}
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-4 font-jet text-[10px] uppercase tracking-[0.3em] text-black/45">
              — {sectionLabel}
            </p>
            <h2 className="font-fraunces text-4xl font-light leading-none tracking-[-0.055em] sm:text-5xl lg:text-6xl">
              {heading} <em className="italic">{headingItalic}</em>
            </h2>
          </div>

          <div className="flex flex-wrap gap-2">
            {filters.map((filter, index) => (
              <Button
                key={filter.label}
                onClick={() => setActiveIndex(index)}
                variant={activeIndex === index ? "default" : "outline"}
                className={[
                  "rounded-full px-4 py-2 text-[11px] font-normal",
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

        {/* Grid */}
        {loading ? (
          <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[4/5] bg-neutral-100" />
                <div className="mt-3 space-y-2">
                  <div className="h-2.5 w-1/3 rounded bg-neutral-100" />
                  <div className="h-2.5 w-2/3 rounded bg-neutral-100" />
                </div>
              </div>
            ))}
          </div>
        ) : displayed.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="font-jet text-[10px] uppercase tracking-[0.3em] text-black/35">
              No products available
            </p>
            <Link href="/products" className="mt-4 font-jet text-[10px] uppercase tracking-[0.2em] text-black underline">
              Browse all products
            </Link>
          </div>
        ) : (
          <div className="grid gap-x-4 gap-y-8 grid-cols-2 md:grid-cols-4">
            {displayed.map((product) => (
              <ProductCard key={product.id} product={product} variant="home" />
            ))}
          </div>
        )}

        {/* View all link */}
        <div className="mt-10 text-center">
          <Link
            href={`/products${filters[activeIndex].category ? `?category=${filters[activeIndex].category}` : ""}`}
            className="inline-block border-b border-black/30 pb-0.5 font-jet text-[10px] uppercase tracking-[0.3em] text-black/50 transition-colors hover:border-black hover:text-black"
          >
            View All {filters[activeIndex].label === "All" ? "Products" : filters[activeIndex].label}
          </Link>
        </div>

      </div>
    </section>
  );
}

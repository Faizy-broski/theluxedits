"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";

interface Product {
  id: number;
  title: string;
  brand: string;
  price: number;
  image_url: string | null;
  category: string;
}

const categoryData = [
  {
    label: "Shoes",
    apiCategory: "Shoes",
    featured: {
      image: "/Categories/Gucci.png",
      label: "Featured / Footwear",
      title: "Shop Shoes",
      desc: "Premium sneakers, heels, loafers & boots from top brands.",
      href: "/products?category=Shoes",
    },
  },
  {
    label: "Bags",
    apiCategory: "Bags",
    featured: {
      image: "/Categories/Gucci%20(1).png",
      label: "Featured / Bags",
      title: "Shop Bags",
      desc: "Luxury totes, clutches, shoulder bags & wallets.",
      href: "/products?category=Bags",
    },
  },
  {
    label: "Watches",
    apiCategory: "Accessories",
    featured: {
      image: "/Categories/Nike%20Lab.png",
      label: "Featured / Timepieces",
      title: "Shop Watches",
      desc: "Expert-authenticated luxury timepieces from iconic houses.",
      href: "/products?category=Accessories",
    },
  },
  {
    label: "Perfumes",
    apiCategory: "Perfumes",
    featured: {
      image: "/Categories/Louis%20Vuitton.png",
      label: "Featured / Fragrance",
      title: "Shop Perfumes",
      desc: "Fine fragrances from the world's most celebrated houses.",
      href: "/products?category=Perfumes",
    },
  },
  {
    label: "Electronics",
    apiCategory: "Electronics",
    featured: {
      image: "/Categories/Prada.png",
      label: "Featured / Technology",
      title: "Shop Electronics",
      desc: "Premium headphones, gadgets & tech accessories.",
      href: "/products?category=Electronics",
    },
  },
];

export default function Category() {
  const [activeIndex, setActiveIndex]   = useState(0);
  const [products, setProducts]         = useState<Product[]>([]);
  const [brokenIds, setBrokenIds]       = useState<Set<number>>(new Set());
  const [loadingCards, setLoadingCards] = useState(false);

  const active = categoryData[activeIndex];

  useEffect(() => {
    setLoadingCards(true);
    setBrokenIds(new Set());
    api
      .get("/products", {
        params: { category: active.apiCategory, per_page: 30, sort: "newest" },
      })
      .then((res) => {
        const all: Product[] = res.data.data ?? res.data;
        const withImages = all.filter((p) => p.image_url && p.image_url.trim() !== "");
        setProducts(withImages);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoadingCards(false));
  }, [activeIndex, active.apiCategory]);

  const displayed = products.filter((p) => !brokenIds.has(p.id)).slice(0, 3);

  return (
    <section className="py-12 text-black md:py-16 lg:py-20">
      <div className="max-w-6xl mx-auto px-5 lg:px-0">
        {/* Section header */}
        <div className="mb-8 md:mb-10">
          <p className="mb-3 text-[10px] uppercase font-jet text-black/55">
            — Shop by Category
          </p>
          <h2 className="font-fraunces text-4xl font-light leading-none tracking-tight sm:text-5xl lg:text-6xl">
            Discover by <em className="italic">category.</em>
          </h2>
        </div>

        {/* Mobile horizontal scroll tabs */}
        <div className="mb-8 lg:hidden">
          <div className="-mx-5 overflow-x-auto scrollbar-hide px-5">
            <div className="flex min-w-max gap-2 pb-1">
              {categoryData.map((item, index) => (
                <button
                  key={item.label}
                  onClick={() => setActiveIndex(index)}
                  className={`h-9 rounded-full border px-4 text-[11px] font-medium uppercase tracking-[0.2em] whitespace-nowrap transition ${
                    activeIndex === index
                      ? "border-black bg-black text-white"
                      : "border-neutral-300 bg-transparent text-neutral-500 hover:border-black hover:text-black"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main layout */}
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <p className="mb-4 text-[10px] uppercase font-jet text-black/55">Categories</p>
            <div className="border-t border-neutral-200">
              {categoryData.map((item, index) => (
                <button
                  key={item.label}
                  onClick={() => setActiveIndex(index)}
                  className={`flex w-full items-center justify-between border-b border-neutral-200 py-3 text-left transition-all duration-200 ${
                    activeIndex === index ? "text-black" : "text-neutral-400 hover:text-black"
                  }`}
                >
                  <span className="font-fraunces font-medium text-xl">
                    {activeIndex === index && <span className="mr-2">•</span>}
                    {item.label}
                  </span>
                  <span className="text-[9px] font-jet font-medium">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </button>
              ))}
            </div>
            <p className="mt-8 text-[10px] text-neutral-500">
              Authentic products · <span className="text-black">Expert Verified</span>
            </p>
          </aside>

          {/* Main content */}
          <main>
            {/* Featured banner */}
            <div className="relative mb-3 aspect-[16/9] overflow-hidden bg-neutral-900 sm:aspect-[21/9] md:aspect-[21/10]">
              <Image
                key={active.featured.image}
                src={active.featured.image}
                alt={active.featured.title}
                fill
                priority
                className="object-cover object-center opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

              <div className="absolute left-6 top-1/2 -translate-y-1/2 md:left-10">
                <p className="mb-3 text-[10px] font-jet uppercase text-white/60">
                  {active.featured.label}
                </p>
                <h3 className="font-fraunces text-3xl font-light leading-[0.9] tracking-tight text-white sm:text-4xl md:text-5xl">
                  {active.featured.title}
                </h3>
                <p className="mt-4 hidden max-w-xs text-[11px] text-white/65 sm:block">
                  {active.featured.desc}
                </p>
                <Button
                  asChild
                  className="mt-5 h-10 rounded-full bg-white font-light px-5 text-xs text-black hover:bg-white/90"
                >
                  <Link href={active.featured.href}>
                    View All <ArrowRight className="h-3 w-3 stroke-1" />
                  </Link>
                </Button>
              </div>
            </div>

            {/* Real product cards */}
            {loadingCards ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="aspect-[4/3] animate-pulse bg-neutral-100 sm:aspect-[4/5]" />
                ))}
              </div>
            ) : displayed.length === 0 ? (
              <div className="grid gap-3 sm:grid-cols-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="aspect-[4/3] bg-neutral-100 sm:aspect-[4/5] flex items-center justify-center">
                    <span className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/25">No image</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-3">
                {displayed.map((product) => (
                  <Link
                    key={product.id}
                    href={`/products/${product.id}`}
                    className="group relative aspect-[4/3] overflow-hidden bg-neutral-900 sm:aspect-[4/5]"
                  >
                    <img
                      src={product.image_url!}
                      alt={product.title}
                      onError={() => setBrokenIds((prev) => new Set(prev).add(product.id))}
                      className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105 opacity-90"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute inset-x-4 bottom-4">
                      <p className="font-jet text-[8px] uppercase tracking-[0.2em] text-white/55 mb-0.5 truncate">
                        {product.brand || product.category}
                      </p>
                      <div className="flex items-end justify-between gap-2">
                        <span className="font-fraunces text-base font-light text-white tracking-[-0.02em] leading-tight line-clamp-2">
                          {product.title}
                        </span>
                        <span className="shrink-0 rounded-full border border-white/50 px-3 py-1 font-jet text-[9px] uppercase tracking-[0.15em] text-white/80 transition group-hover:border-white group-hover:text-white">
                          View
                        </span>
                      </div>
                      <p className="mt-1 font-fraunces text-sm text-white/70">
                        ${Number(product.price).toFixed(2)}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}

            <p className="mt-6 text-[10px] text-neutral-500 lg:hidden">
              Free shipping on orders over <span className="text-black">$200</span> · 30-day returns
            </p>
          </main>
        </div>
      </div>
    </section>
  );
}

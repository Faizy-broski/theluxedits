"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import api from "@/lib/api";

interface Product {
  id: number;
  title: string;
  brand: string;
  price: number;
  image_url: string | null;
}

export default function TheEdit() {
  const [pool, setPool]         = useState<Product[]>([]);
  const [brokenIds, setBrokenIds] = useState<Set<number>>(new Set());
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api
      .get("/products", { params: { sort: "newest", per_page: 60 } })
      .then((res) => {
        const all: Product[] = res.data.data ?? res.data;
        setPool(all.filter((p) => p.image_url && p.image_url.trim() !== ""));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const displayed = pool.filter((p) => !brokenIds.has(p.id));

  if (loading || displayed.length < 2) return null;

  const [hero, ...rest] = displayed;

  return (
    <section className="bg-[#080808] py-16 text-white md:py-20 lg:py-24">
      <div className="max-w-6xl mx-auto px-5 lg:px-0">

        {/* Section header */}
        <div className="mb-10 flex items-end justify-between gap-6 border-b border-white/10 pb-8">
          <div>
            <p className="mb-4 font-jet text-[10px] uppercase tracking-[0.35em] text-white/35">
              — Curated Selection
            </p>
            <h2 className="font-fraunces text-5xl font-light leading-none tracking-[-0.045em] sm:text-6xl lg:text-7xl">
              The <em className="italic text-white/70">Edit.</em>
            </h2>
            <p className="mt-4 max-w-sm text-[11px] leading-relaxed text-white/40">
              A handpicked selection of the finest pieces — authenticated,
              curated, and delivered to you.
            </p>
          </div>

          <div className="hidden flex-col items-end gap-4 md:flex">
            <span className="font-jet text-[9px] uppercase tracking-[0.4em] text-white/20">
              001 / The Collection
            </span>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 font-jet text-[10px] uppercase tracking-[0.2em] text-white/60 transition hover:border-white hover:text-white"
            >
              View all products <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
            </Link>
          </div>
        </div>

        {/* Editorial grid */}
        <div className="grid gap-[3px] md:grid-cols-3 md:grid-rows-[420px_auto]">

          {/* Hero card — spans 2 cols */}
          <Link
            href={`/products/${hero.id}`}
            className="group relative h-72 overflow-hidden md:col-span-2 md:h-auto"
          >
            <img
              src={hero.image_url!}
              alt={hero.title}
              onError={() => setBrokenIds((prev) => new Set(prev).add(hero.id))}
              className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

            {/* Top badge */}
            <div className="absolute left-6 top-6 flex items-center gap-2">
              <span className="rounded-full bg-white/10 px-3 py-1 font-jet text-[8px] uppercase tracking-[0.3em] text-white/70 backdrop-blur-sm">
                Featured
              </span>
            </div>

            {/* Bottom info */}
            <div className="absolute inset-x-6 bottom-6 sm:inset-x-8 sm:bottom-8">
              <p className="mb-1 font-jet text-[8px] uppercase tracking-[0.3em] text-white/50">
                {hero.brand}
              </p>
              <h3 className="font-fraunces text-2xl font-light leading-tight text-white sm:text-3xl md:text-4xl">
                {hero.title}
              </h3>
              <div className="mt-4 flex items-center gap-4">
                <span className="font-fraunces text-lg text-white/75">
                  ${Number(hero.price).toFixed(2)}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-white/30 px-4 py-2 font-jet text-[9px] uppercase tracking-[0.2em] text-white/60 transition group-hover:border-white group-hover:bg-white group-hover:text-black">
                  View Product <ArrowRight className="h-2.5 w-2.5" />
                </span>
              </div>
            </div>
          </Link>

          {/* P2 — right column, row 1 */}
          {rest[0] && (
            <Link
              href={`/products/${rest[0].id}`}
              className="group relative h-72 overflow-hidden md:h-auto"
            >
              <img
                src={rest[0].image_url!}
                alt={rest[0].title}
                onError={() => setBrokenIds((prev) => new Set(prev).add(rest[0].id))}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/20 to-transparent" />
              <div className="absolute inset-x-5 bottom-5">
                <p className="mb-0.5 font-jet text-[8px] uppercase tracking-[0.25em] text-white/45 truncate">
                  {rest[0].brand}
                </p>
                <p className="font-fraunces text-lg font-light leading-tight text-white line-clamp-2">
                  {rest[0].title}
                </p>
                <p className="mt-2 font-fraunces text-sm text-white/55">
                  ${Number(rest[0].price).toFixed(2)}
                </p>
              </div>
              {/* Hover arrow */}
              <div className="absolute right-5 top-5 flex h-8 w-8 translate-y-2 items-center justify-center rounded-full border border-white/20 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
              </div>
            </Link>
          )}

          {/* P3, P4, P5 — row 2, 3 equal cols */}
          {rest.slice(1, 4).map((p, i) => (
            <Link
              key={p.id}
              href={`/products/${p.id}`}
              className="group relative aspect-[4/3] overflow-hidden"
            >
              <img
                src={p.image_url!}
                alt={p.title}
                onError={() => setBrokenIds((prev) => new Set(prev).add(p.id))}
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

              {/* Card number */}
              <span className="absolute right-4 top-4 font-jet text-[9px] text-white/30">
                {String(i + 2).padStart(2, "0")}
              </span>

              <div className="absolute inset-x-4 bottom-4">
                <p className="mb-0.5 font-jet text-[8px] uppercase tracking-[0.2em] text-white/45 truncate">
                  {p.brand}
                </p>
                <p className="font-fraunces text-base font-light leading-tight text-white line-clamp-2">
                  {p.title}
                </p>
                <p className="mt-1.5 font-fraunces text-xs text-white/50">
                  ${Number(p.price).toFixed(2)}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile CTA */}
        <div className="mt-8 flex items-center justify-between border-t border-white/10 pt-6 md:hidden">
          <p className="font-jet text-[9px] uppercase tracking-[0.25em] text-white/30">
            Authenticated · Verified
          </p>
          <Link
            href="/products"
            className="flex items-center gap-2 font-jet text-[10px] uppercase tracking-[0.2em] text-white/50 transition hover:text-white"
          >
            View all <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
          </Link>
        </div>
      </div>
    </section>
  );
}

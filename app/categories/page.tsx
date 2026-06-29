import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/homePage/Footer";
import { Metadata } from "next";

export const metadata: Metadata = { title: "All Categories" };

const categories = [
  {
    name: "Shoes",
    subtitle: "Sneakers, heels, loafers & more",
    count: "Footwear",
    href: "/products?category=Shoes",
    image:
      "/Categories/Gucci.png",
  },
  {
    name: "Bags",
    subtitle: "Totes, clutches, shoulder bags & wallets",
    count: "Accessories",
    href: "/products?category=Bags",
    image:
      "/Categories/Gucci%20(1).png",
  },
  {
    name: "Watches",
    subtitle: "Luxury timepieces, expert-authenticated",
    count: "Timepieces",
    href: "/products?category=Accessories",
    image:
      "/Categories/Nike%20Lab.png",
  },
  {
    name: "Perfumes",
    subtitle: "Fine fragrances from the world's best houses",
    count: "Fragrance",
    href: "/products?category=Perfumes",
    image:
      "/Categories/Louis%20Vuitton.png",
  },
  {
    name: "Electronics",
    subtitle: "Premium tech — headphones, gadgets & more",
    count: "Technology",
    href: "/products?category=Electronics",
    image:
      "/Categories/Prada.png",
  },
];

export default function CategoriesPage() {
  return (
    <main>
      <Header />

      {/* Page hero */}
      <section className="bg-black pt-32 pb-12 px-5 md:px-16">
        <div className="max-w-6xl mx-auto">
          <p className="mb-4 font-jet text-[10px] uppercase tracking-[0.35em] text-white/40">
            — Browse
          </p>
          <div className="flex items-end justify-between gap-6">
            <h1 className="font-fraunces text-5xl font-light leading-none tracking-[-0.045em] text-white md:text-7xl">
              All <em className="italic">Categories.</em>
            </h1>
            <Link
              href="/products"
              className="hidden shrink-0 items-center gap-2 font-jet text-[10px] uppercase tracking-[0.2em] text-white/40 transition hover:text-white md:flex"
            >
              All Products <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
            </Link>
          </div>
        </div>
      </section>

      {/* Categories grid */}
      <section className="bg-black px-5 pb-20 md:px-16">
        <div className="max-w-6xl mx-auto">

          {/* Top 2 large cards */}
          <div className="grid gap-3 sm:grid-cols-2 mb-3">
            {categories.slice(0, 2).map((cat, i) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group relative overflow-hidden aspect-[4/3]"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

                {/* Number */}
                <span className="absolute left-5 top-5 font-jet text-[10px] text-white/50">
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                  <p className="mb-1 font-jet text-[9px] uppercase tracking-[0.3em] text-white/50">
                    {cat.count}
                  </p>
                  <h2 className="font-fraunces text-4xl font-light leading-none tracking-[-0.04em] text-white sm:text-5xl">
                    {cat.name}
                  </h2>
                  <p className="mt-2 text-[11px] text-white/55">{cat.subtitle}</p>
                  <div className="mt-5 inline-flex items-center gap-2 border-b border-white/40 pb-1 font-jet text-[9px] uppercase tracking-[0.25em] text-white/60 transition group-hover:border-white group-hover:text-white">
                    Shop {cat.name} <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Bottom 3 cards */}
          <div className="grid gap-3 sm:grid-cols-3">
            {categories.slice(2).map((cat, i) => (
              <Link
                key={cat.name}
                href={cat.href}
                className="group relative overflow-hidden aspect-[3/4]"
              >
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-105"
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-black/10" />

                {/* Number */}
                <span className="absolute left-5 top-5 font-jet text-[10px] text-white/50">
                  {String(i + 3).padStart(2, "0")}
                </span>

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <p className="mb-1 font-jet text-[9px] uppercase tracking-[0.3em] text-white/50">
                    {cat.count}
                  </p>
                  <h2 className="font-fraunces text-3xl font-light leading-none tracking-[-0.04em] text-white">
                    {cat.name}
                  </h2>
                  <p className="mt-1.5 text-[10px] text-white/50 leading-relaxed">{cat.subtitle}</p>
                  <div className="mt-4 inline-flex items-center gap-2 border-b border-white/40 pb-1 font-jet text-[9px] uppercase tracking-[0.25em] text-white/60 transition group-hover:border-white group-hover:text-white">
                    Shop Now <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

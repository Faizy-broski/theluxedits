import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const categories = [
  {
    name: "Shoes",
    subtitle: "Sneakers & Heels",
    image: "/Categories/Gucci.png",
    href: "/products?category=Shoes",
  },
  {
    name: "Bags",
    subtitle: "Totes & Clutches",
    image: "/Categories/Gucci%20(1).png",
    href: "/products?category=Bags",
  },
  {
    name: "Watches",
    subtitle: "Luxury Timepieces",
    image: "/Categories/Nike%20Lab.png",
    href: "/products?category=Accessories",
  },
  {
    name: "Perfumes",
    subtitle: "Fine Fragrances",
    image: "/Categories/Louis%20Vuitton.png",
    href: "/products?category=Perfumes",
  },
  {
    name: "Electronics",
    subtitle: "Tech & Gadgets",
    image: "/Categories/Prada.png",
    href: "/products?category=Electronics",
  },
];

export default function Houses() {
  return (
    <section className="bg-white py-16 text-black md:py-20 lg:py-24">
      <div className="max-w-6xl mx-auto px-5 lg:px-0">
        {/* Header */}
        <div className="mb-12 flex items-end justify-between gap-6 md:mb-16">
          <div>
            <p className="mb-5 font-jet text-[10px] uppercase text-black/55">
              — Categories
            </p>
            <h2 className="font-fraunces text-4xl font-light leading-none tracking-[-0.055em] sm:text-5xl lg:text-6xl">
              Top{" "}
              <em className="italic tracking-[-0.06em]">Categories.</em>
            </h2>
          </div>

          <Link
            href="/categories"
            className="hidden shrink-0 items-center gap-2 text-xs text-black transition-opacity hover:opacity-60 md:flex"
          >
            All categories
            <ArrowRight className="h-3 w-3" strokeWidth={1.5} />
          </Link>
        </div>

        {/* Cards grid */}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {categories.map((cat, index) => (
            <Link
              key={cat.name}
              href={cat.href}
              className="group relative aspect-[3/4] overflow-hidden bg-neutral-900"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                className="object-cover transition duration-700 group-hover:scale-105 opacity-90"
              />

              {/* Dark overlay for text legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />

              <span className="absolute left-5 top-5 font-jet text-[10px] text-white/60">
                {String(index + 1).padStart(2, "0")}
              </span>

              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <h3 className="font-fraunces text-2xl font-light leading-none tracking-[-0.04em]">
                  {cat.name}
                </h3>
                <div className="mt-2 flex items-center justify-between gap-4 text-[10px] text-white/65">
                  <p>{cat.subtitle}</p>
                  <ArrowRight className="h-3 w-3 shrink-0 transition-transform group-hover:translate-x-1" strokeWidth={1.5} />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Mobile link */}
        <Link
          href="/categories"
          className="mt-8 flex items-center gap-2 text-base text-black transition-opacity hover:opacity-60 md:hidden"
        >
          All categories
          <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
        </Link>
      </div>
    </section>
  );
}

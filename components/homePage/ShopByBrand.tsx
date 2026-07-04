import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const brands = [
  {
    num: "01",
    name: "Gucci",
    tagline: "Italian Luxury Since 1921",
    image: "/shop_by_brands/dima-pechurin-qguUJmzGqyQ-unsplash.jpg",
    href: "/products?brand=Gucci",
    size: "large",
  },
  {
    num: "02",
    name: "Louis Vuitton",
    tagline: "The Art of Travel",
    image: "/shop_by_brands/christian-wiediger-sRF-FoyPQss-unsplash.jpg",
    href: "/products?brand=Louis+Vuitton",
    size: "large",
  },
  {
    num: "03",
    name: "Chanel",
    tagline: "Timeless Elegance",
    image: "/shop_by_brands/kin-shing-lai-gtmLyka2u4o-unsplash.jpg",
    href: "/products?brand=Chanel",
    size: "small",
  },
  {
    num: "04",
    name: "Dior",
    tagline: "Haute Couture Maison",
    image: "/shop_by_brands/genri-kura-uGrAVY1VS68-unsplash.jpg",
    href: "/products?brand=Dior",
    size: "small",
  },
  {
    num: "05",
    name: "Prada",
    tagline: "Milanese Sophistication",
    image: "/shop_by_brands/stock-birken-syWircGf7ck-unsplash.jpg",
    href: "/products?brand=Prada",
    size: "small",
  },
];

function BrandCard({ item, tall }: { item: typeof brands[0]; tall?: boolean }) {
  return (
    <Link
      href={item.href}
      className={`group relative overflow-hidden bg-neutral-900 block w-full ${tall ? "min-h-[300px]" : "min-h-[220px]"} sm:h-full sm:min-h-0`}
    >
      <Image
        src={item.image}
        alt={item.name}
        fill
        className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 50vw"
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55 transition-opacity duration-300 group-hover:bg-black/45" />

      {/* Top label */}
      <p className="absolute left-4 top-4 font-jet text-[9px] uppercase tracking-[0.28em] text-white/50">
        {item.num} · Brand
      </p>

      {/* Bottom content */}
      <div className="absolute bottom-0 inset-x-0 flex items-end justify-between p-5">
        <div>
          <h3 className="font-fraunces text-2xl font-light text-white leading-none tracking-[-0.03em] sm:text-3xl">
            {item.name}
          </h3>
        </div>
        <div className="flex-shrink-0 flex h-9 w-9 items-center justify-center bg-white transition-all duration-300 group-hover:bg-black">
          <ArrowUpRight
            className="h-4 w-4 text-black transition-colors group-hover:text-white"
            strokeWidth={1.5}
          />
        </div>
      </div>
    </Link>
  );
}

export default function ShopByBrand() {
  const [card1, card2, ...rest] = brands;

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <div className="max-w-6xl mx-auto px-5 lg:px-0">

        {/* Heading */}
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="mb-4 font-jet text-[10px] uppercase tracking-[0.35em] text-black/40">
              — Featured Maisons
            </p>
            <h2 className="font-fraunces text-4xl font-light leading-none tracking-[-0.05em] sm:text-5xl lg:text-6xl">
              Shop by <em className="italic">Brand.</em>
            </h2>
          </div>
          <Link
            href="/products"
            className="hidden md:flex items-center gap-2 font-jet text-[10px] uppercase tracking-[0.25em] text-black/40 transition-colors hover:text-black"
          >
            All Brands
            <ArrowUpRight className="h-3 w-3" strokeWidth={1.5} />
          </Link>
        </div>

        {/* Grid */}
        <div className="flex flex-col gap-2">

          {/* Row 1 — 2 large cards */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 sm:h-[420px]">
            <BrandCard item={card1} tall />
            <BrandCard item={card2} tall />
          </div>

          {/* Row 2 — 3 smaller cards */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:h-[300px]">
            {rest.map((item) => (
              <BrandCard key={item.num} item={item} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

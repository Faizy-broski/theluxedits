"use client";

import Link from "next/link";

const brands = [
  { name: "Gucci",             logo: "/brands/gucci-seeklogo.png",             href: "/products?brand=Gucci" },
  { name: "Louis Vuitton",     logo: "/brands/louis-vuitton-seeklogo.png",     href: "/products?brand=Louis+Vuitton" },
  { name: "Chanel",            logo: "/brands/chanel-seeklogo.png",            href: "/products?brand=Chanel" },
  { name: "Hermès",            logo: "/brands/hermes-seeklogo.png",            href: "/products?brand=Hermes" },
  { name: "Dior",              logo: "/brands/dior-seeklogo.png",              href: "/products?brand=Dior" },
  { name: "Fendi",             logo: "/brands/fendi-seeklogo.png",             href: "/products?brand=Fendi" },
  { name: "Burberry",          logo: "/brands/burberry-seeklogo.png",          href: "/products?brand=Burberry" },
  { name: "Off-White",         logo: "/brands/off-white-seeklogo.png",         href: "/products?brand=Off-White" },
  { name: "Alexander McQueen", logo: "/brands/alexander-mcqueen-seeklogo.png", href: "/products?brand=Alexander+McQueen" },
  { name: "Ami Paris",         logo: "/brands/ami-paris-seeklogo.png",         href: "/products?brand=Ami+Paris" },
  { name: "Nike",              logo: "/brands/nike-seeklogo.png",              href: "/products?brand=Nike" },
];

// Double for seamless -50% loop
const ticker = [...brands, ...brands];

export default function BrandTicker() {
  return (
    <section
      aria-label="Featured brands"
      className="w-full overflow-hidden border-y border-black/8 bg-white py-10"
    >
      <div
        className="flex animate-brand-marquee items-center gap-20"
        style={{ width: "max-content" }}
      >
        {ticker.map((brand, i) => (
          <Link
            key={`${brand.name}-${i}`}
            href={brand.href}
            aria-label={brand.name}
            className="group flex-shrink-0 flex items-center justify-center"
            style={{ width: 160, height: 72 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={brand.logo}
              alt={brand.name}
              style={{ maxHeight: 58, maxWidth: 150, width: "auto", height: "auto", objectFit: "contain" }}
              className="opacity-50 transition-opacity duration-300 group-hover:opacity-100"
            />
          </Link>
        ))}
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const collections = [
  {
    title: "Shop Bags",
    subtitle: "Designer totes, clutches & more",
    image: "/banner/Rectangle%201000002152.png",
    href: "/products?category=Bags",
  },
  {
    title: "Shop Watches",
    subtitle: "Luxury timepieces, authenticated",
    image: "/banner/Rectangle%201000002153.png",
    href: "/products?category=Accessories",
  },
];

export default function WearCollections() {
  return (
    <section className="bg-white text-white">
      <div className="grid grid-cols-1 md:grid-cols-2">
        {collections.map((item) => (
          <Link
            key={item.title}
            href={item.href}
            className="group relative min-h-[320px] overflow-hidden bg-neutral-200 sm:min-h-[420px] md:min-h-[750px]"
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover transition duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />

            <div className="absolute bottom-8 left-6 sm:bottom-12 sm:left-10">
              <p className="mb-2 font-jet text-[9px] uppercase tracking-[0.25em] text-white/60">
                {item.subtitle}
              </p>
              <h2 className="font-fraunces text-3xl font-light tracking-[-0.04em] sm:text-4xl">
                {item.title}
              </h2>

              <div className="mt-5 inline-flex items-center gap-3 border-b border-white/70 pb-2 font-mono text-[10px] uppercase tracking-[0.2em] text-white transition-opacity group-hover:opacity-80 sm:mt-7 sm:pb-3">
                Shop Now
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

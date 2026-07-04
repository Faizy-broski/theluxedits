import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const edits = [
  {
    no: "01",
    label: "Tailoring",
    title: "Modern Tailoring",
    image: "/mt.svg",
    href: "/categories/tailoring",
    colClass: "md:col-span-7",
    aspectClass: "aspect-[16/9] md:aspect-auto md:h-[340px]",
  },
  {
    no: "02",
    label: "Leather",
    title: "Signature Bags",
    image: "/sb.svg",
    href: "/categories/bags",
    colClass: "md:col-span-5",
    aspectClass: "aspect-[4/3] md:aspect-auto md:h-[340px]",
  },
  {
    no: "03",
    label: "Timepieces",
    title: "Luxury Watches",
    image: "/lw.svg",
    href: "/categories/watches",
    colClass: "md:col-span-3",
    aspectClass: "aspect-[3/4] md:aspect-auto md:h-[340px]",
  },
  {
    no: "04",
    label: "Footwear",
    title: "Exclusive Sneakers",
    image: "/es.svg",
    href: "/categories/sneakers",
    colClass: "md:col-span-5",
    aspectClass: "aspect-[4/3] md:aspect-auto md:h-[340px]",
  },
  {
    no: "05",
    label: "Outerwear",
    title: "New Season Coats",
    image: "/nsc.svg",
    href: "/categories/outerwear",
    colClass: "md:col-span-4",
    aspectClass: "aspect-[4/3] md:aspect-auto md:h-[340px]",
  },
];

export default function Exhibition() {
  return (
    <section className="bg-white py-16 text-black md:py-20 lg:py-24">
      <div className="max-w-6xl mx-auto px-5 lg:px-0">
        <p className="mb-4 text-[10px] font-jet uppercase text-black/55">
          — 03 The Edit
        </p>

        <h2 className="mb-8 font-fraunces text-4xl font-light leading-none tracking-[-0.055em] sm:text-5xl lg:text-6xl md:mb-12">
          Exhibition <em className="italic tracking-[-0.06em]">in motion.</em>
        </h2>

        {/* Mobile: 2-col grid. Desktop: 12-col editorial mosaic */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-12">
          {edits.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className={`group relative overflow-hidden bg-neutral-100 ${item.colClass} ${item.aspectClass}`}
            >
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition duration-700 group-hover:scale-105"
              />

              {/* <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-black/15" /> */}

              <p className="absolute left-4 top-4 font-mono text-[10px] uppercase tracking-[0.35em] text-white/80">
                {item.no} · {item.label}
              </p>

              <h3 className="absolute bottom-5 left-4 pr-12 font-fraunces leading-none text-white text-lg sm:text-2xl">
                {item.title}
              </h3>

              <span className="absolute bottom-4 right-4 grid h-9 w-9 place-items-center bg-white text-black transition duration-300 group-hover:bg-black group-hover:text-white md:h-10 md:w-10">
                <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

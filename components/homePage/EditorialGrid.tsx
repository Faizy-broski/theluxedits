import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";

const items = [
  {
    num: "01",
    label: "Footwear",
    title: "Luxury Shoes",
    image: "/Categories/Gucci.png",
    href: "/products?category=Shoes",
    size: "large",
  },
  {
    num: "02",
    label: "Handbags",
    title: "Signature Bags",
    image: "/banner/Rectangle%201000002152.png",
    href: "/products?category=Bags",
    size: "large",
  },
  {
    num: "03",
    label: "Timepieces",
    title: "Luxury Watches",
    image: "/banner/Rectangle%201000002153.png",
    href: "/products?category=Accessories",
    size: "small",
  },
  {
    num: "04",
    label: "Fragrance",
    title: "Fine Perfumes",
    image: "/Categories/Louis%20Vuitton.png",
    href: "/products?category=Perfumes",
    size: "small",
  },
  {
    num: "05",
    label: "Technology",
    title: "Tech & Gadgets",
    image: "/Categories/Prada.png",
    href: "/products?category=Electronics",
    size: "small",
  },
];

function Card({ item }: { item: typeof items[0] }) {
  return (
    <Link
      href={item.href}
      className="group relative overflow-hidden bg-neutral-900 block w-full h-full"
    >
      <Image
        src={item.image}
        alt={item.title}
        fill
        className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 50vw"
      />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-black/20" />

      {/* Top label */}
      <p className="absolute left-4 top-4 font-jet text-[9px] uppercase tracking-[0.25em] text-white/60">
        {item.num} · {item.label}
      </p>

      {/* Bottom content */}
      <div className="absolute bottom-0 inset-x-0 flex items-end justify-between p-4">
        <h3 className="font-fraunces text-xl font-light text-white leading-tight sm:text-2xl">
          {item.title}
        </h3>
        <div className="flex-shrink-0 flex h-8 w-8 items-center justify-center bg-white transition-colors group-hover:bg-black">
          <ArrowUpRight
            className="h-3.5 w-3.5 text-black transition-colors group-hover:text-white"
            strokeWidth={1.5}
          />
        </div>
      </div>
    </Link>
  );
}

export default function EditorialGrid() {
  const [top1, top2, ...bottom] = items;

  return (
    <section className="bg-white py-16 md:py-20 lg:py-24">
      <div className="max-w-6xl mx-auto px-5 lg:px-0">

        {/* Heading */}
        <div className="mb-10">
          <p className="mb-4 font-jet text-[10px] uppercase tracking-[0.35em] text-black/40">
            — The Edit
          </p>
          <h2 className="font-fraunces text-4xl font-light leading-none tracking-[-0.05em] sm:text-5xl lg:text-6xl">
            Exhibition <em className="italic">in motion.</em>
          </h2>
        </div>

        {/* Grid */}
        <div className="flex flex-col gap-2">

          {/* Row 1 — 2 large cards */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2" style={{ height: 420 }}>
            <Card item={top1} />
            <Card item={top2} />
          </div>

          {/* Row 2 — 3 small cards */}
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3" style={{ height: 300 }}>
            {bottom.map((item) => (
              <Card key={item.num} item={item} />
            ))}
          </div>

        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const editions = [
  { no: "N°01", name: "Jackets", pieces: "12 pieces", slug: "jackets" },
  { no: "N°02", name: "Hoodies", pieces: "19 pieces", slug: "hoodies" },
  { no: "N°03", name: "Shirts", pieces: "26 pieces", slug: "shirts", italic: true },
  { no: "N°04", name: "Pants", pieces: "33 pieces", slug: "pants" },
  { no: "N°05", name: "Blazers", pieces: "40 pieces", slug: "blazers" },
  { no: "N°06", name: "Outerwear", pieces: "47 pieces", slug: "outerwear" },
];

export default function ExclusiveEditions() {
  return (
    <section className="py-16 text-black md:py-20 lg:py-24">
      <div className="max-w-6xl mx-auto px-5 lg:px-0">
      {/* Mobile intro header (visible only on mobile) */}
      <div className="mb-8 lg:hidden">
        <p className="mb-3 text-[10px] uppercase font-jet text-black/55">
          — 05 Vault Access
        </p>
        <h2 className="font-against text-3xl font-light tracking-tight">
          Exclusive Editions
        </h2>
        <p className="mt-3 text-[11px] leading-relaxed text-neutral-500">
          A members-only vault of pieces produced in counted quantities.
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[250px_1fr_250px] lg:gap-12">
        {/* Left intro — desktop only */}
        <aside className="hidden pt-1 lg:block">
          <p className="mb-4 text-[10px] uppercase font-jet text-black/55">
            — 05 Vault Access
          </p>
          <h2 className="font-fraunces text-3xl font-light tracking-tight">
            Exclusive Editions
          </h2>
          <p className="mt-4  text-[10px] leading-relaxed text-neutral-500">
            A members-only vault of pieces produced in counted quantities.
          </p>
        </aside>

        {/* Centre edition list */}
        <main className="border-t border-neutral-200">
          {editions.map((item) => (
            <Link
              key={item.no}
              href={`/categories/${item.slug}`}
              className="group grid grid-cols-[40px_1fr_auto] items-center gap-4 border-b border-neutral-200 py-5 sm:grid-cols-[48px_1fr_auto] sm:py-6"
            >
              <span className="text-[8px] uppercase font-jet text-neutral-400">
                {item.no}
              </span>

              <h3
                className={`font-fraunces font-light leading-none tracking-tight transition-opacity group-hover:opacity-60 ${
                  item.italic ? "italic" : ""
                } text-6xl`}
              >
                {item.name}
              </h3>

              <span className="text-[8px] text-neutral-500 whitespace-nowrap">
                {item.pieces}
              </span>
            </Link>
          ))}

          {/* Mobile vault CTA */}
          <div className="mt-8 lg:hidden">
            <Link
              href="/products"
              className="group inline-flex items-center gap-3 border-b border-black pb-2 text-[11px] font-semibold uppercase tracking-[0.25em] text-black"
            >
              Access the Vault
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </main>

        {/* Right preview card — desktop only */}
        <aside className="hidden lg:block">
          <div className="relative overflow-hidden bg-white shadow-sm">
            <div className="relative aspect-[3/4] w-full">
              <Image
                src="/outerwear.svg"
                alt="Vault exclusive — Chrome Series preview"
                fill
                className="object-cover object-top"
              />
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-white/90 px-4 py-3 backdrop-blur">
              <p className="text-[9px] uppercase tracking-[0.2em] text-neutral-500">
                Vault · 32 remaining
              </p>
              <p className="mt-1 text-[10px] text-black">
                Chrome Series — by invitation
              </p>
            </div>
          </div>
        </aside>
      </div>
      </div>
    </section>
  );
}

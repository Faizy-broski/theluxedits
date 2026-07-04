"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function LuxuryHero() {
  return (
    <section
      aria-label="Hero"
      className="relative min-h-[100svh] overflow-hidden bg-black text-white"
    >
      {/* Background image */}
      <Image
        src="/hero/hero.png"
        alt="Luxury accessories — watches, bags, shoes, perfumes & electronics"
        fill
        priority
        className="object-cover object-center"
      />

      {/* Dark overlay for text legibility */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/30"
      />

      {/* Hero content — sits at the bottom of the full-viewport section */}
      <div className="relative z-10 flex min-h-[100svh] flex-col justify-end px-5 pb-12 sm:pb-16 md:px-16 md:pb-20 lg:pb-24">
        <div className="grid w-full grid-cols-1 items-end gap-6 lg:grid-cols-[1fr_280px] lg:gap-14 xl:grid-cols-[1fr_320px]">
          {/* ── Left: heading + CTAs ── */}
          <div>
            {/* Pre-heading label */}

            <h1 className="pt-8 md:pt-4 lg:pt-12 lg:mt-36 font-fraunces text-[clamp(52px,11vw,118px)] font-light leading-none tracking-tight">
              The New <br className="hidden xs:block" />
              <em className="italic">Couture</em>
              <br />
              Marketplace.
            </h1>

            {/* CTAs */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5 md:mt-10">
              <Button
                asChild
                className="group h-12 w-full rounded-none bg-white px-7 text-[11px] font-semibold uppercase tracking-[0.28em] text-black transition-colors hover:bg-white/90 sm:w-auto md:h-14 md:px-9"
              >
                <Link href="/products">
                  Shop The Edit
                  <ArrowUpRight
                    className="ml-3 h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                    strokeWidth={1.8}
                  />
                </Link>
              </Button>

              <Link
                href="/categories"
                className="group flex h-12 w-fit items-center gap-3 border-b border-white/40 px-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-white/80 transition-colors hover:border-white/80 hover:text-white md:h-14"
              >
                Discover More
                <ArrowRight
                  className="h-4 w-4 transition-transform group-hover:translate-x-1"
                  strokeWidth={1.8}
                />
              </Link>
            </div>
          </div>

          {/* ── Right: editorial blurb — desktop only ── */}
          <div className="hidden pb-1 lg:block">
            <p className="mb-6 font-mono text-[10px] uppercase tracking-[0.35em] text-white/50 md:mb-8">
              — Issue 026 · FW 26
            </p>
            <div className="mb-5 h-px w-20 bg-white/30" />
            <p className="max-w-[280px] text-[10px] leading-[1.9] text-white/55">
              A curated index of the season&apos;s most exceptional objects.
              Shipped in luxury packaging from authorized ateliers.
            </p>

          </div>
        </div>
      </div>
    </section>
  );
}

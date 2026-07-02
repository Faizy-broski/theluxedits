"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export interface Testimonial {
  quote: string;
  role: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    quote:
      "Managing our luxury catalogue has never been easier. Every product, every order — all in one view.",
    role: "Boutique Owner",
  },
  {
    quote:
      "From inventory to checkout, TheLuxEdits gives us complete control over the entire brand experience.",
    role: "Store Manager",
  },
  {
    quote:
      "Clean interface, real-time order tracking, and effortless product management. Absolutely essential.",
    role: "Retail Director",
  },
];

interface TestimonialCarouselProps {
  testimonials?: Testimonial[];
}

export function TestimonialCarousel({
  testimonials = DEFAULT_TESTIMONIALS,
}: TestimonialCarouselProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index >= testimonials.length) {
      setIndex(0);
    }
  }, [index, testimonials.length]);

  useEffect(() => {
    const t = setInterval(() => {
      setIndex((i) => (i + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(t);
  }, [testimonials.length]);

  const active = testimonials[index];

  return (
    <div>
      <p aria-hidden="true" className="font-against mb-3 text-[40px] leading-none text-[#B08D57]">
        &ldquo;
      </p>
      <p
        key={index}
        className="font-fraunces text-[15px] italic leading-relaxed text-[#EFE9DA] transition-opacity duration-500"
      >
        {active.quote}
      </p>
      <p className="font-jet mt-3 text-[11px] uppercase tracking-[0.15em] text-[#9FB3A4]">
        — {active.role}
      </p>

      <div className="mt-5 flex gap-1.5">
        {testimonials.map((t, i) => (
          <button
            key={t.role}
            type="button"
            onClick={() => setIndex(i)}
            aria-label={`Show testimonial ${i + 1}`}
            className={cn(
              "h-1 rounded-full transition-all duration-300",
              i === index ? "w-6 bg-[#B08D57]" : "w-1.5 bg-white/20 hover:bg-white/35"
            )}
          />
        ))}
      </div>
    </div>
  );
}
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Membership() {
  return (
    <section className="bg-white px-5 py-16 text-white md:px-12 md:py-20 lg:px-16">
      <div className="relative mx-auto min-h-[380px] max-w-[1700px] overflow-hidden sm:min-h-[460px] md:min-h-[560px]">
        <Image
          src="/banner/newsletter-bg-CEM-AEFD.jpg.png"
          alt="Stay updated with TheLuxEdits"
          fill
          className="object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-black/10" />

        {/* Content */}
        <div className="relative z-10 flex h-full min-h-[380px] max-w-[760px] flex-col justify-center px-6 py-12 sm:min-h-[460px] sm:px-12 md:min-h-[560px] md:px-24">
          <p className="mb-5 font-jet text-[10px] uppercase text-white/70">
            — Stay Updated
          </p>

          <h2 className="font-fraunces text-4xl font-light leading-none tracking-[-0.055em] sm:text-5xl lg:text-6xl">
            Get the latest <em className="italic">drops.</em>
          </h2>

          <p className="mt-6 max-w-sm text-white/75 text-xs">
            Be the first to know about new arrivals, exclusive deals, and
            special offers on shoes, bags, watches, perfumes and electronics.
          </p>

          {/* Email form */}
          <div className="mt-8 flex max-w-md flex-col gap-3 sm:flex-row sm:items-center sm:rounded-full sm:bg-white/75 sm:p-2 sm:backdrop-blur-md md:mt-10">
            <Input
              type="email"
              placeholder="your@email.com"
              aria-label="Email address"
              className="h-12 rounded-full bg-transparent text-black px-5 placeholder:text-black/45 caret-black sm:h-12 sm:flex-1 sm:border-0"
            />
            <Button
              type="button"
              className="h-10 w-full rounded-full bg-white px-6 text-sm font-normal text-black shadow-none hover:bg-black hover:text-white sm:h-12 sm:w-auto sm:px-8 sm:text-sm"
            >
              Subscribe
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <p className="mt-5 font-jet text-[10px] uppercase text-white/55">
            No spam · unsubscribe anytime
          </p>
        </div>
      </div>
    </section>
  );
}

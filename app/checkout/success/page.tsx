import Link from "next/link";
import { Check } from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/homePage/Footer";

export default function CheckoutSuccessPage() {
  return (
    <main>
      <Header />

      <section className="flex min-h-[80vh] flex-col items-center justify-center bg-white px-5 pt-24 text-center">
        <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full border border-black/15">
          <Check className="h-6 w-6 text-black" strokeWidth={1.4} />
        </div>

        <p className="mb-3 font-jet text-[10px] uppercase tracking-[0.35em] text-black/40">
          — Order Confirmed
        </p>

        <h1 className="font-fraunces text-4xl font-light leading-tight tracking-[-0.04em] sm:text-5xl">
          Thank you for <br />
          <em className="italic">your order.</em>
        </h1>

        <p className="mt-5 max-w-sm text-sm leading-relaxed text-black/50">
          Your pieces are being prepared with care. You will receive a
          confirmation shortly. White-glove delivery within 3–5 business days.
        </p>

        <div className="mt-4 h-px w-16 bg-black/15" />

        <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
  <Link
    href="/portal/orders"
    className="inline-flex h-12 w-full items-center justify-center bg-black px-8 font-jet text-[10px] uppercase tracking-[0.3em] text-white transition-colors hover:bg-black/80 sm:h-14 sm:w-64"
  >
    View My Orders
  </Link>

  <Link
    href="/products"
    className="inline-flex h-12 w-full items-center justify-center border border-black/20 px-8 font-jet text-[10px] uppercase tracking-[0.3em] text-black transition-colors hover:bg-black hover:text-white sm:h-14 sm:w-64"
  >
    Continue Shopping
  </Link>
</div>

        <div className="mt-12 space-y-1.5">
          <p className="font-jet text-[9px] uppercase tracking-[0.25em] text-black/25">
            — Complimentary shipping included
          </p>
          <p className="font-jet text-[9px] uppercase tracking-[0.25em] text-black/25">
            — White-glove returns within 30 days
          </p>
          <p className="font-jet text-[9px] uppercase tracking-[0.25em] text-black/25">
            — Authenticated by experts
          </p>
        </div>
      </section>

      <Footer />
    </main>
  );
}

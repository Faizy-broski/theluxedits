import Header from "@/components/shared/Header";
import Footer from "@/components/homePage/Footer";
import { Metadata } from "next";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <main>
      <Header />
      <section className="bg-white pt-32 pb-20 px-5 md:px-16">
        <div className="max-w-3xl mx-auto">
          <p className="mb-4 font-jet text-[10px] uppercase tracking-[0.35em] text-black/45">— About Us</p>
          <h1 className="mb-10 font-fraunces text-5xl font-light leading-none tracking-[-0.045em] md:text-6xl">
            Who We <em className="italic">Are.</em>
          </h1>

          <div className="space-y-8 text-black/65 leading-[1.85] text-[15px]">
            <p>
              <strong className="text-black font-medium">TheLuxEdits</strong> is a premium ecommerce destination
              for authentic luxury goods — spanning shoes, bags, watches, perfumes, and electronics.
              We partner with verified sellers and authorized sources to bring you the finest products
              from the world&apos;s most coveted brands.
            </p>
            <p>
              Every item listed on TheLuxEdits goes through a rigorous expert-verification process
              before it reaches you. We believe that luxury should come with complete confidence —
              in the product, the seller, and the experience.
            </p>
            <p>
              With free shipping on orders over $200 and a hassle-free 30-day return policy,
              we make it easy to shop the world&apos;s finest without compromise.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-3">
            {[
              { stat: "100%", label: "Authentic Products" },
              { stat: "30 Days", label: "Easy Returns" },
              { stat: "$200+", label: "Free Shipping" },
            ].map((item) => (
              <div key={item.label} className="border-t border-black/10 pt-6">
                <p className="font-fraunces text-4xl font-light tracking-[-0.04em]">{item.stat}</p>
                <p className="mt-2 font-jet text-[10px] uppercase tracking-[0.25em] text-black/45">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

import Link from "next/link";
import Header from "@/components/shared/Header";
import Footer from "@/components/homePage/Footer";

export default function ProductNotFound() {
  return (
    <main>
      <Header />

      <section className="flex min-h-[70vh] flex-col items-center justify-center bg-white px-5 pt-24 text-center">
        <p className="mb-4 font-jet text-[10px] uppercase tracking-[0.35em] text-black/35">
          — 404
        </p>
        <h1 className="font-fraunces text-4xl font-light tracking-[-0.04em] sm:text-5xl">
          Piece not found.
        </h1>
        <p className="mt-4 max-w-sm text-sm text-black/50">
          This piece may have sold out or been moved. Explore the full edit below.
        </p>
        <Link
          href="/products"
          className="mt-10 inline-flex h-12 items-center bg-black px-8 font-jet text-[10px] uppercase tracking-[0.3em] text-white transition-colors hover:bg-black/80 sm:h-14"
        >
          Browse All Products
        </Link>
      </section>

      <Footer />
    </main>
  );
}

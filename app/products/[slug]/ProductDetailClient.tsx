"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/shared/Header";
import Footer from "@/components/homePage/Footer";
import { type Product, formatPrice } from "@/lib/mock-products";
import { useCart } from "@/lib/cart-context";

export default function ProductDetailClient({ product }: { product: Product }) {
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(
    product.sizes?.[0]
  );
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    addToCart({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image,
      price: product.price,
      quantity,
      brand: product.brand,
      selectedSize,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  const stockLabel =
    product.stock === 0
      ? "Out of Stock"
      : product.stock <= 3
      ? `Only ${product.stock} left`
      : "In Stock";

  const stockColor =
    product.stock === 0
      ? "text-red-500"
      : product.stock <= 3
      ? "text-amber-600"
      : "text-black/40";

  return (
    <main>
      <Header />

      <section className="bg-white pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="mx-auto max-w-6xl px-5 lg:px-0">
          {/* Breadcrumb */}
          <Link
            href="/products"
            className="mb-8 inline-flex items-center gap-2 font-jet text-[10px] uppercase tracking-[0.3em] text-black/40 transition-colors hover:text-black"
          >
            <ArrowLeft className="h-3 w-3" strokeWidth={1.6} />
            All Products
          </Link>

          <div className="grid gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
            {/* Image */}
            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
              <Image
                src={product.image}
                alt={product.name}
                fill
                priority
                className="object-cover"
              />
              {product.badge && (
                <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-1 font-jet text-[9px] uppercase tracking-[0.15em] text-black">
                  {product.badge}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center">
              <p className="font-jet text-[10px] uppercase tracking-[0.35em] text-black/45">
                {product.brand} · {product.category}
              </p>

              <h1 className="mt-3 font-fraunces text-3xl font-light leading-tight tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                {product.name}
              </h1>

              <p className="mt-4 font-fraunces text-2xl font-light text-black">
                {formatPrice(product.price)}
              </p>

              <div className="my-6 h-px bg-black/10" />

              <p className="text-sm leading-relaxed text-black/65">
                {product.description}
              </p>

              {/* Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mt-6">
                  <p className="mb-2.5 font-jet text-[10px] uppercase tracking-[0.3em] text-black/45">
                    Size
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`h-9 min-w-[44px] px-3 font-jet text-[10px] uppercase tracking-[0.15em] transition-colors ${
                          selectedSize === size
                            ? "bg-black text-white"
                            : "border border-black/20 text-black hover:border-black"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Quantity */}
              <div className="mt-6">
                <p className="mb-2.5 font-jet text-[10px] uppercase tracking-[0.3em] text-black/45">
                  Quantity
                </p>
                <div className="inline-flex items-center border border-black/20">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex h-10 w-10 items-center justify-center text-black transition-colors hover:bg-black/5"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="h-3.5 w-3.5" strokeWidth={1.6} />
                  </button>
                  <span className="flex h-10 w-10 items-center justify-center font-jet text-sm">
                    {quantity}
                  </span>
                  <button
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    className="flex h-10 w-10 items-center justify-center text-black transition-colors hover:bg-black/5"
                    aria-label="Increase quantity"
                  >
                    <Plus className="h-3.5 w-3.5" strokeWidth={1.6} />
                  </button>
                </div>
              </div>

              {/* Stock status */}
              <p className={`mt-3 font-jet text-[10px] uppercase tracking-[0.25em] ${stockColor}`}>
                {stockLabel}
              </p>

              {/* Add to cart */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={`h-12 flex-1 rounded-none text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors sm:h-14 ${
                    added
                      ? "bg-black/70 text-white"
                      : "bg-black text-white hover:bg-black/80"
                  }`}
                >
                  {added ? (
                    <>
                      <Check className="mr-2 h-4 w-4" strokeWidth={1.8} />
                      Added to Bag
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="mr-2 h-4 w-4" strokeWidth={1.6} />
                      Add to Bag
                    </>
                  )}
                </Button>

                <Button
                  asChild
                  variant="outline"
                  className="h-12 rounded-none border-black/20 bg-transparent text-[11px] font-semibold uppercase tracking-[0.25em] text-black hover:bg-black hover:text-white sm:h-14 sm:px-8"
                >
                  <Link href="/cart">View Bag</Link>
                </Button>
              </div>

              {/* Details */}
              <div className="mt-8 space-y-2 border-t border-black/10 pt-6">
                <p className="font-jet text-[10px] uppercase tracking-[0.3em] text-black/40">
                  — Complimentary shipping over €250
                </p>
                <p className="font-jet text-[10px] uppercase tracking-[0.3em] text-black/40">
                  — White-glove returns within 30 days
                </p>
                <p className="font-jet text-[10px] uppercase tracking-[0.3em] text-black/40">
                  — Authenticated by experts
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

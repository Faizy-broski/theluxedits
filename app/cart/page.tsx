"use client";

import Link from "next/link";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/shared/Header";
import Footer from "@/components/homePage/Footer";
import { useCart } from "@/lib/cart-context";

function formatPrice(price: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(price);
}

export default function CartPage() {
  const {
    items,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    cartTotal,
    cartCount,
  } = useCart();

  const shipping = 0;
  const total = cartTotal;

  if (items.length === 0) {
    return (
      <main>
        <Header />
        <section className="flex min-h-[70vh] flex-col items-center justify-center bg-white px-5 pt-24 text-center">
          <ShoppingBag className="mb-6 h-10 w-10 text-black/20" strokeWidth={1.2} />
          <p className="mb-2 font-jet text-[10px] uppercase tracking-[0.35em] text-black/35">
            — Your bag
          </p>
          <h1 className="font-fraunces text-3xl font-light tracking-[-0.04em] sm:text-4xl">
            Your bag is empty.
          </h1>
          <p className="mt-3 max-w-xs text-sm text-black/45">
            Discover the edit and add pieces you love.
          </p>
          <Link
            href="/products"
            className="mt-10 inline-flex h-12 items-center gap-2 bg-black px-8 font-jet text-[10px] uppercase tracking-[0.3em] text-white transition-colors hover:bg-black/80 sm:h-14"
          >
            Browse Products
            <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
          </Link>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Header />

      <section className="bg-white pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="mx-auto max-w-6xl px-5 lg:px-0">
          <p className="mb-4 font-jet text-[10px] uppercase tracking-[0.35em] text-black/45">
            — Your bag
          </p>
          <h1 className="font-fraunces text-4xl font-light leading-none tracking-[-0.045em] sm:text-5xl">
            Shopping <em className="italic">Bag.</em>
          </h1>

          <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_340px] lg:gap-16">
            {/* Cart items */}
            <div>
              <div className="mb-4 flex items-center justify-between border-b border-black/10 pb-4">
                <span className="font-jet text-[10px] uppercase tracking-[0.25em] text-black/40">
                  {cartCount} {cartCount === 1 ? "item" : "items"}
                </span>
                <Link
                  href="/products"
                  className="font-jet text-[10px] uppercase tracking-[0.25em] text-black/40 transition-colors hover:text-black"
                >
                  Continue Shopping
                </Link>
              </div>

              <ul className="space-y-6">
                {items.map((item) => (
                  <li
                    key={item.id}
                    className="grid grid-cols-[80px_1fr] gap-4 border-b border-black/8 pb-6 sm:grid-cols-[100px_1fr] sm:gap-6"
                  >
                    {/* Image */}
                    <Link href={`/products/${item.slug}`}>
                      <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
                        {item.image ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center text-black/15">
                            <ShoppingBag className="h-6 w-6" strokeWidth={1} />
                          </div>
                        )}
                      </div>
                    </Link>

                    {/* Details */}
                    <div className="flex flex-col justify-between">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-jet text-[10px] uppercase tracking-[0.2em] text-black/45">
                            {item.brand}
                          </p>
                          <Link
                            href={`/products/${item.slug}`}
                            className="mt-0.5 block text-sm text-black transition-opacity hover:opacity-60"
                          >
                            {item.name}
                          </Link>
                          {item.selectedSize && (
                            <p className="mt-1 font-jet text-[10px] uppercase tracking-[0.15em] text-black/35">
                              Size: {item.selectedSize}
                            </p>
                          )}
                        </div>
                        <p className="font-fraunces text-sm text-black">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>

                      <div className="mt-3 flex items-center justify-between">
                        {/* Quantity controls */}
                        <div className="inline-flex items-center border border-black/20">
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            className="flex h-8 w-8 items-center justify-center text-black transition-colors hover:bg-black/5"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3 w-3" strokeWidth={1.6} />
                          </button>
                          <span className="flex h-8 w-8 items-center justify-center font-jet text-xs">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => increaseQuantity(item.id)}
                            className="flex h-8 w-8 items-center justify-center text-black transition-colors hover:bg-black/5"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3 w-3" strokeWidth={1.6} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="flex items-center gap-1.5 font-jet text-[9px] uppercase tracking-[0.2em] text-black/35 transition-colors hover:text-black"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-3 w-3" strokeWidth={1.6} />
                          Remove
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Order summary */}
            <div className="lg:sticky lg:top-32 lg:self-start">
              <div className="border border-black/10 p-6">
                <h2 className="mb-6 font-fraunces text-xl font-light">
                  Order Summary
                </h2>

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-black/60">Subtotal</span>
                    <span>{formatPrice(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-black/60">Shipping</span>
                    <span className="font-jet text-[10px] uppercase tracking-[0.15em] text-black/50">
                      Free
                    </span>
                  </div>

                  <div className="my-4 h-px bg-black/10" />

                  <div className="flex justify-between">
                    <span className="font-medium">Total</span>
                    <span className="font-fraunces text-lg">
                      {formatPrice(total)}
                    </span>
                  </div>
                </div>

                <Button
                  asChild
                  className="mt-6 h-12 w-full rounded-none bg-black text-[11px] font-semibold uppercase tracking-[0.25em] text-white hover:bg-black/80 sm:h-14"
                >
                  <Link href="/checkout">
                    Proceed to Checkout
                    <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.6} />
                  </Link>
                </Button>

                <div className="mt-5 space-y-1.5">
                  <p className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/30">
                    — Complimentary shipping on all orders
                  </p>
                  <p className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/30">
                    — White-glove returns within 30 days
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Minus, Plus, ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/shared/Header";
import Footer from "@/components/homePage/Footer";
import { useCart } from "@/lib/cart-context";
import api from "@/lib/api";
import { resolveImageUrl } from "@/lib/image-url";

interface ApiProduct {
  id: number;
  title: string;
  brand: string;
  price: string;
  currency: string;
  category: string;
  image_url: string;
  product_url: string;
  quantity?: number;
  sku?: string;
  description?: string;
}

function formatPrice(price: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(price);
}

export default function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    api.get(`/products/${slug}`)
      .then(({ data }) => setProduct(data))
      .catch(() => router.replace("/products"))
      .finally(() => setLoading(false));
  }, [slug, router]);

  const outOfStock = product !== null && typeof product.quantity === "number" && product.quantity === 0;
  const maxQty     = product?.quantity && product.quantity > 0 ? product.quantity : 999;

  function handleAddToCart() {
    if (!product || outOfStock) return;
    addToCart({
      id: String(product.id),
      name: product.title,
      slug: String(product.id),
      image: product.image_url || "",
      price: parseFloat(product.price),
      quantity,
      brand: product.brand || "",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) {
    return (
      <main>
        <Header />
        <section className="flex min-h-[60vh] items-center justify-center bg-white pt-24">
          <div className="text-center">
            <div className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-black/20 border-t-black" />
            <p className="font-jet text-[10px] uppercase tracking-[0.3em] text-black/35">Loading…</p>
          </div>
        </section>
        <Footer />
      </main>
    );
  }

  if (!product) return null;

  return (
    <main>
      <Header />
      <section className="bg-white pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="mx-auto max-w-6xl px-5 lg:px-0">
          <Link href="/products" className="mb-8 inline-flex items-center gap-2 font-jet text-[10px] uppercase tracking-[0.3em] text-black/40 transition-colors hover:text-black">
            <ArrowLeft className="h-3 w-3" strokeWidth={1.6} />
            All Products
          </Link>

          <div className="grid gap-10 md:grid-cols-2 md:gap-16 lg:gap-24">
            {/* Image */}
            <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
              {resolveImageUrl(product.image_url) && !imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveImageUrl(product.image_url)!}
                  alt={product.title}
                  onError={() => setImgError(true)}
                  className="h-full w-full object-contain bg-[#f5f5f5]"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-black/15">
                  <ShoppingBag className="h-16 w-16" strokeWidth={0.8} />
                </div>
              )}
              {product.category && (
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 font-jet text-[9px] uppercase tracking-[0.15em] text-black backdrop-blur-sm">
                  {product.category}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center">
              <p className="font-jet text-[10px] uppercase tracking-[0.35em] text-black/45">
                {product.brand}{product.category ? ` · ${product.category}` : ""}
              </p>

              <h1 className="mt-3 font-fraunces text-3xl font-light leading-tight tracking-[-0.04em] sm:text-4xl lg:text-5xl">
                {product.title}
              </h1>

              <p className="mt-4 font-fraunces text-2xl font-light text-black">
                {formatPrice(parseFloat(product.price), product.currency || "USD")}
              </p>

              <div className="my-6 h-px bg-black/10" />

              {product.description && (
                <p className="text-sm leading-relaxed text-black/65">{product.description}</p>
              )}

              {product.sku && (
                <p className="mt-3 font-jet text-[9px] uppercase tracking-[0.25em] text-black/30">
                  SKU: {product.sku}
                </p>
              )}

              {/* Stock badge */}
              {outOfStock && (
                <div className="mt-4 inline-block border border-red-200 bg-red-50 px-3 py-1.5">
                  <p className="font-jet text-[9px] uppercase tracking-[0.25em] text-red-500">
                    Out of Stock
                  </p>
                </div>
              )}

              {/* Quantity — hidden when out of stock */}
              {!outOfStock && (
                <div className="mt-6">
                  <p className="mb-2.5 font-jet text-[10px] uppercase tracking-[0.3em] text-black/45">Quantity</p>
                  <div className="inline-flex items-center border border-black/20">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      className="flex h-10 w-10 items-center justify-center text-black transition-colors hover:bg-black/5"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="h-3.5 w-3.5" strokeWidth={1.6} />
                    </button>
                    <span className="flex h-10 w-10 items-center justify-center font-jet text-sm">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
                      disabled={quantity >= maxQty}
                      className="flex h-10 w-10 items-center justify-center text-black transition-colors hover:bg-black/5 disabled:opacity-30"
                      aria-label="Increase quantity"
                    >
                      <Plus className="h-3.5 w-3.5" strokeWidth={1.6} />
                    </button>
                  </div>
                  {product?.quantity && product.quantity <= 5 && (
                    <p className="mt-1.5 font-jet text-[9px] uppercase tracking-[0.2em] text-amber-600">
                      Only {product.quantity} left
                    </p>
                  )}
                </div>
              )}

              {/* Add to cart */}
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                  className={`h-12 flex-1 rounded-none text-[11px] font-semibold uppercase tracking-[0.25em] transition-colors sm:h-14 ${
                    outOfStock
                      ? "cursor-not-allowed bg-black/25 text-white"
                      : added
                      ? "bg-black/70 text-white"
                      : "bg-black text-white hover:bg-black/80"
                  }`}
                >
                  {outOfStock ? (
                    "Out of Stock"
                  ) : added ? (
                    <><Check className="mr-2 h-4 w-4" strokeWidth={1.8} />Added to Bag</>
                  ) : (
                    <><ShoppingBag className="mr-2 h-4 w-4" strokeWidth={1.6} />Add to Bag</>
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

              {product.product_url && (
                <a href={product.product_url} target="_blank" rel="noopener noreferrer" className="mt-3 block text-center font-jet text-[9px] uppercase tracking-[0.2em] text-black/30 underline hover:text-black">
                  View on original site
                </a>
              )}

              <div className="mt-8 space-y-2 border-t border-black/10 pt-6">
                <p className="font-jet text-[10px] uppercase tracking-[0.3em] text-black/40">— Complimentary shipping over $100</p>
                <p className="font-jet text-[10px] uppercase tracking-[0.3em] text-black/40">— White-glove returns within 30 days</p>
                <p className="font-jet text-[10px] uppercase tracking-[0.3em] text-black/40">— Authenticated by experts</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

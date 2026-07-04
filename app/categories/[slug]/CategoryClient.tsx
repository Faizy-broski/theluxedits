"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/shared/Header";
import Footer from "@/components/homePage/Footer";
import { useCart } from "@/lib/cart-context";
import api from "@/lib/api";

interface ApiProduct {
  id: number;
  title: string;
  brand: string;
  price: string;
  currency: string;
  category: string;
  image_url: string;
}

function formatPrice(price: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(price);
}

function ProductCard({ product }: { product: ApiProduct }) {
  const { addToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [imgError, setImgError] = useState(false);

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    addToCart({
      id: String(product.id),
      name: product.title,
      slug: String(product.id),
      image: product.image_url || "",
      price: parseFloat(product.price),
      quantity: 1,
      brand: product.brand || "",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="group">
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-neutral-100">
          {product.image_url && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.image_url} alt={product.title} onError={() => setImgError(true)} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 text-black/15">
              <ShoppingBag className="h-10 w-10" strokeWidth={0.8} />
            </div>
          )}
        </div>
      </Link>
      <div className="mt-3 space-y-3">
        <div className="grid grid-cols-[1fr_auto] items-start gap-4">
          <div>
            <p className="font-jet text-[10px] uppercase tracking-[0.2em] text-black/50">{product.brand}</p>
            <Link href={`/products/${product.id}`} className="mt-0.5 block text-sm text-black transition-opacity hover:opacity-60">
              {product.title}
            </Link>
          </div>
          <p className="font-fraunces text-sm text-black">{formatPrice(parseFloat(product.price), product.currency)}</p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline" className="flex-1 h-8 rounded-none border-black/20 bg-transparent text-[10px] uppercase tracking-[0.2em] text-black hover:bg-black hover:text-white">
            <Link href={`/products/${product.id}`}>
              View <ArrowUpRight className="ml-1 h-3 w-3" strokeWidth={1.6} />
            </Link>
          </Button>
          <Button
            onClick={handleAddToCart}
            className={`h-8 flex-1 rounded-none text-[10px] uppercase tracking-[0.2em] transition-colors ${added ? "bg-black/70 text-white" : "bg-black text-white hover:bg-black/80"}`}
          >
            {added ? "Added" : <><ShoppingBag className="mr-1 h-3 w-3" strokeWidth={1.6} />Add</>}
          </Button>
        </div>
      </div>
    </div>
  );
}

interface Props {
  slug: string;
  label: string;
  category: string;
}

export default function CategoryClient({ label, category }: Props) {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    api.get("/products", { params: { category, per_page: 48 } })
      .then(({ data }) => { setProducts(data.data); setTotal(data.total); })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [category]);

  return (
    <main>
      <Header />
      <section className="bg-white pt-24 pb-10 md:pt-32 md:pb-14">
        <div className="mx-auto max-w-6xl px-5 lg:px-0">
          <Link href="/products" className="mb-6 inline-flex items-center gap-2 font-jet text-[10px] uppercase tracking-[0.3em] text-black/40 transition-colors hover:text-black">
            <ArrowLeft className="h-3 w-3" strokeWidth={1.6} />
            All Products
          </Link>
          <p className="mb-4 font-jet text-[10px] uppercase tracking-[0.35em] text-black/45">— Category</p>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h1 className="font-fraunces text-4xl font-light leading-none tracking-[-0.045em] sm:text-5xl lg:text-6xl">
              <em className="italic">{label}.</em>
            </h1>
            <p className="font-jet text-[10px] uppercase tracking-[0.25em] text-black/35">
              {loading ? "Loading…" : `${total} ${total === 1 ? "piece" : "pieces"}`}
            </p>
          </div>
          <div className="mt-6 h-px bg-black/10" />
        </div>
      </section>

      <section className="bg-white pb-20 md:pb-28">
        <div className="mx-auto max-w-6xl px-5 lg:px-0">
          {loading ? (
            <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[4/5] bg-neutral-100" />
                  <div className="mt-3 space-y-2">
                    <div className="h-3 w-20 bg-neutral-100 rounded" />
                    <div className="h-4 w-full bg-neutral-100 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid gap-x-5 gap-y-10 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-24 text-center">
              <p className="mb-6 font-jet text-[10px] uppercase tracking-[0.3em] text-black/35">No pieces in this category yet</p>
              <Link href="/products" className="inline-flex h-12 items-center bg-black px-8 font-jet text-[10px] uppercase tracking-[0.3em] text-white transition-colors hover:bg-black/80">
                Browse All Products
              </Link>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

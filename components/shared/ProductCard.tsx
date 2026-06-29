"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Eye } from "lucide-react";
import { useCart } from "@/lib/cart-context";

interface Product {
  id: number | string;
  title: string;
  brand?: string;
  category?: string;
  price: number | string;
  currency?: string;
  image_url?: string | null;
}

interface Props {
  product: Product;
  /** "listing" shows buttons always; "home" shows them on hover */
  variant?: "listing" | "home";
}

function formatPrice(price: number | string, currency = "USD") {
  const n = typeof price === "string" ? parseFloat(price) : price;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(n);
}

export default function ProductCard({ product, variant = "home" }: Props) {
  const { addToCart } = useCart();
  const [added, setAdded]       = useState(false);
  const [imgError, setImgError] = useState(false);

  if (imgError) return null;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    addToCart({
      id:       String(product.id),
      name:     product.title,
      slug:     String(product.id),
      image:    product.image_url || "",
      price:    typeof product.price === "string" ? parseFloat(product.price) : product.price,
      quantity: 1,
      brand:    product.brand || "",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  const alwaysShow = variant === "listing";

  return (
    <div className="group flex flex-col">

      {/* ── Image container ── */}
      <Link href={`/products/${product.id}`} className="block">
        <div
          className="relative overflow-hidden"
          style={{ backgroundColor: "#dadada", aspectRatio: "4/5" }}
        >
          {product.image_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url}
              alt={product.title}
              onError={() => setImgError(true)}
              className="absolute inset-0 h-full w-full object-contain transition-transform duration-500 group-hover:scale-[1.03]"
              style={{ mixBlendMode: "multiply" }}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="font-jet text-[9px] uppercase tracking-widest text-black/20">
                No image
              </span>
            </div>
          )}

          {/* Action buttons — slide up on hover */}
          <div
            className={[
              "absolute inset-x-0 bottom-0 flex gap-px transition-all duration-300",
              alwaysShow
                ? "translate-y-0 opacity-100"
                : "translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100",
            ].join(" ")}
          >
            <Link
              href={`/products/${product.id}`}
              className="flex flex-1 items-center justify-center gap-1.5 bg-white/95 py-3 font-jet text-[9px] uppercase tracking-[0.18em] text-black backdrop-blur-sm transition-colors hover:bg-white"
            >
              <Eye className="h-3 w-3" strokeWidth={1.4} />
              View
            </Link>
            <button
              type="button"
              onClick={handleAddToCart}
              className={[
                "flex flex-1 items-center justify-center gap-1.5 py-3 font-jet text-[9px] uppercase tracking-[0.18em] transition-colors",
                added
                  ? "bg-black/60 text-white"
                  : "bg-black text-white hover:bg-black/80",
              ].join(" ")}
            >
              {added ? (
                "Added ✓"
              ) : (
                <>
                  <ShoppingBag className="h-3 w-3" strokeWidth={1.4} />
                  Add
                </>
              )}
            </button>
          </div>
        </div>
      </Link>

      {/* ── Info ── */}
      <div className="mt-3 flex flex-col gap-0.5 border-b border-black/8 pb-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            {product.brand && (
              <p className="font-jet text-[9px] uppercase tracking-[0.25em] text-black/35">
                {product.brand}
              </p>
            )}
            <Link
              href={`/products/${product.id}`}
              className="mt-1 block line-clamp-2 text-[13px] leading-snug text-black/80 transition-colors hover:text-black"
            >
              {product.title}
            </Link>
          </div>
          <p className="shrink-0 font-fraunces text-[15px] font-light text-black">
            {formatPrice(product.price, product.currency || "USD")}
          </p>
        </div>
      </div>

    </div>
  );
}

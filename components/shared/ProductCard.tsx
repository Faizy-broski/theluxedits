"use client";

import { useState } from "react";
import Link from "next/link";
import { ShoppingBag, Eye } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { resolveImageUrl } from "@/lib/image-url";

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
  const resolvedSrc = resolveImageUrl(product.image_url);

  return (
    <div className="group flex flex-col">

      {/* ── Image container ── */}
      <Link href={`/products/${product.id}`} className="block">
        <div className="relative overflow-hidden bg-[#f5f5f5]">
          {resolvedSrc && !imgError ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={resolvedSrc}
              alt={product.title}
              onError={() => setImgError(true)}
              loading="lazy"
              className="block w-full h-auto object-contain transition-transform duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex aspect-[4/5] items-center justify-center">
              <svg className="h-12 w-12 text-black/10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="0.8">
                <path d="M6 2h12l4 5v13a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7l4-5z"/>
                <path d="M9 22V12h6v10M3 7h18"/>
              </svg>
            </div>
          )}

          {/* Action buttons — slide up on hover (home variant only) */}
          {!alwaysShow && (
            <div className="absolute inset-x-0 bottom-0 flex gap-px translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
              <span className="flex flex-1 items-center justify-center gap-1.5 bg-white/95 py-3 font-jet text-[9px] uppercase tracking-[0.18em] text-black backdrop-blur-sm transition-colors hover:bg-white">
                <Eye className="h-3 w-3" strokeWidth={1.4} />
                View
              </span>
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
          )}
        </div>
      </Link>

      {/* Action buttons — sit below the image, don't overlap it (listing variant) */}
      {alwaysShow && (
        <div className="mt-2 flex gap-px">
          <Link
            href={`/products/${product.id}`}
            className="flex flex-1 items-center justify-center gap-1.5 border border-black/10 bg-[#f5f5f5] py-2.5 font-jet text-[9px] uppercase tracking-[0.18em] text-black transition-colors hover:bg-[#efefef]"
          >
            <Eye className="h-3 w-3" strokeWidth={1.4} />
            View
          </Link>
          <button
            type="button"
            onClick={handleAddToCart}
            className={[
              "flex flex-1 items-center justify-center gap-1.5 py-2.5 font-jet text-[9px] uppercase tracking-[0.18em] transition-colors",
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
      )}

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

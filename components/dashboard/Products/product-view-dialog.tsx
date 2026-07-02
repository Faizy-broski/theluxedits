"use client";

import Image from "next/image";
import {
  Eye,
  Building2,
  Package,
  Coins,
  Barcode,
  Link as LinkIcon,
  FileText,
  ExternalLink,
  ImageOff,
  Pencil,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ProductRecord } from "@/lib/types";

interface ProductViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductRecord | null;
  onEdit: (product: ProductRecord) => void;
}

export function ProductViewDialog({
  open,
  onOpenChange,
  product,
  onEdit,
}: ProductViewDialogProps) {
  if (!product) return null;

  const qty = product.quantity;
  const qtyClass =
    qty === null
      ? "bg-muted text-muted-foreground"
      : qty <= 0
      ? "bg-destructive text-white"
      : qty <= 5
      ? "bg-amber-500 text-white"
      : "bg-emerald-600 text-white";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Eye className="h-4 w-4 text-primary" />
            Product Details
          </DialogTitle>
          <DialogDescription>Full product information</DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-12">
          <div className="sm:col-span-5">
            <div className="flex h-[220px] items-center justify-center overflow-hidden rounded-lg border bg-muted">
              {product.image_url ? (
                <div className="relative h-full w-full">
                  <Image
                    src={product.image_url}
                    alt={product.title}
                    fill
                    sizes="300px"
                    className="object-contain"
                    unoptimized={product.image_url.startsWith("data:")}
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageOff className="h-10 w-10" />
                  <span className="text-sm">No image</span>
                </div>
              )}
            </div>
          </div>

          <div className="sm:col-span-7">
            {product.website && (
              <Badge className="mb-2 bg-sky-600 text-white hover:bg-sky-600">
                {product.website.name}
              </Badge>
            )}
            <h3 className="text-lg font-bold leading-tight">{product.title}</h3>
            {product.brand && (
              <p className="mb-3 mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                {product.brand}
              </p>
            )}

            <div className="mb-4 flex flex-wrap items-center gap-2">
              {product.price !== null && (
                <Badge className="bg-emerald-600 px-3 py-1 text-sm text-white hover:bg-emerald-600">
                  {product.currency} {product.price.toFixed(2)}
                </Badge>
              )}
              {product.category && <Badge variant="outline">{product.category}</Badge>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-muted p-3">
                <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <Package className="h-3.5 w-3.5" />
                  Stock
                </p>
                {qty !== null ? (
                  <Badge className={cn("px-3 py-1", qtyClass)}>{qty} in stock</Badge>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </div>
              <div className="rounded-lg bg-muted p-3">
                <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <Coins className="h-3.5 w-3.5" />
                  Currency
                </p>
                <p className="text-sm font-semibold">{product.currency ?? "—"}</p>
              </div>
              <div className="col-span-2 rounded-lg bg-muted p-3">
                <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <Barcode className="h-3.5 w-3.5" />
                  SKU
                </p>
                <p className="text-sm font-semibold">{product.sku ?? "—"}</p>
              </div>
              <div className="col-span-2 rounded-lg bg-muted p-3">
                <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
                  <LinkIcon className="h-3.5 w-3.5" />
                  Product URL
                </p>
                {product.product_url ? (
                  <a
                    href={product.product_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 break-all text-sm text-primary hover:underline"
                  >
                    {product.product_url}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {product.description && (
          <div className="border-t pt-4">
            <p className="mb-2 flex items-center gap-1 text-xs font-semibold text-muted-foreground">
              <FileText className="h-3.5 w-3.5" />
              Description
            </p>
            <p className="text-sm">{product.description}</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={() => {
              onOpenChange(false);
              onEdit(product);
            }}
          >
            <Pencil className="mr-1 h-4 w-4" />
            Edit Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

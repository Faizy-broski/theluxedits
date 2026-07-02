"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Loader2,
  Save,
  X,
  Info,
  PlusCircle,
  Pencil,
  Wand2,
  ImagePlus,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createProduct, updateProduct } from "@/lib/actions/products/actions";
import type { ProductFormValues, ProductRecord } from "@/lib/types";

const EMPTY_FORM: ProductFormValues = {
  title: "",
  brand: "",
  category: "",
  price: "",
  quantity: "10",
  currency: "USD",
  sku: "",
  product_url: "",
  source_website_id: "",
  image_url: "",
  description: "",
};

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: ProductRecord | null;
  brands: string[];
  categories: string[];
  websites: { id: number; name: string }[];
  onSaved: (message: string) => void;
}

export function ProductFormDialog({
  open,
  onOpenChange,
  product,
  brands,
  categories,
  websites,
  onSaved,
}: ProductFormDialogProps) {
  const isEdit = Boolean(product);
  const [values, setValues] = useState<ProductFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof ProductFormValues, string>>>({});
  const [previewSrc, setPreviewSrc] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const initial = product
      ? {
          title: product.title,
          brand: product.brand ?? "",
          category: product.category ?? "",
          price: product.price?.toString() ?? "",
          quantity: product.quantity?.toString() ?? "10",
          currency: product.currency ?? "USD",
          sku: product.sku ?? "",
          product_url: product.product_url,
          source_website_id: String(product.source_website_id ?? ""),
          image_url: product.image_url ?? "",
          description: product.description ?? "",
        }
      : EMPTY_FORM;
    setValues(initial);
    setPreviewSrc(initial.image_url);
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [open, product]);

  function setField<K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleImageUrlChange(url: string) {
    setField("image_url", url);
    setPreviewSrc(url);
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setPreviewSrc(dataUrl);
      // No backend upload endpoint in this stub — store the data URL directly.
      // Point this at a real upload route and use the returned URL instead.
      setField("image_url", dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setField("image_url", "");
    setPreviewSrc("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function generateSku() {
    const source = values.brand || values.title;
    const prefix = source
      ? source.replace(/[^a-zA-Z0-9]/g, "").substring(0, 4).toUpperCase() || "PRD"
      : "PRD";
    const rand = Math.random().toString(36).substring(2, 8).toUpperCase();
    setField("sku", `${prefix}-${rand}`);
  }

  function validateClientSide() {
    const next: typeof errors = {};
    if (!values.title.trim()) next.title = "Product title is required.";
    if (!values.product_url.trim()) next.product_url = "Please enter a valid URL.";
    if (!values.source_website_id) next.source_website_id = "Please select a source website.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateClientSide()) return;

    startTransition(async () => {
      const result = isEdit
        ? await updateProduct(product!.id, values)
        : await createProduct(values);

      if (result.success) {
        onOpenChange(false);
        onSaved(result.message ?? "Product saved.");
      } else if (result.errors) {
        setErrors(result.errors);
        toast.error("Please fix the highlighted fields.");
      } else {
        toast.error("Something went wrong.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEdit ? (
                <Pencil className="h-4 w-4 text-amber-500" />
              ) : (
                <PlusCircle className="h-4 w-4 text-primary" />
              )}
              {isEdit ? "Edit Product" : "Add Product"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-start gap-2 rounded-md bg-accent px-3 py-2.5 text-sm text-accent-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Fields marked <span className="font-bold text-destructive">*</span>{" "}
                are required. Paste an Image URL for a live preview, or
                upload a file. Use <strong>Generate</strong> to auto-create a
                SKU.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">
                Product Title <span className="text-destructive">*</span>
              </Label>
              <Input
                id="title"
                placeholder="Enter full product title…"
                value={values.title}
                onChange={(e) => setField("title", e.target.value)}
                aria-invalid={Boolean(errors.title)}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Brand</Label>
                <Select value={values.brand || "none"} onValueChange={(v) => setField("brand", v === "none" ? "" : v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="— Select brand —" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Select brand —</SelectItem>
                    {brands.map((b) => (
                      <SelectItem key={b} value={b}>
                        {b}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={values.category || "none"} onValueChange={(v) => setField("category", v === "none" ? "" : v)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="— Select category —" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Select category —</SelectItem>
                    {categories.map((c) => (
                      <SelectItem key={c} value={c}>
                        {c}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min={0}
                  placeholder="0.00"
                  value={values.price}
                  onChange={(e) => setField("price", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  type="number"
                  min={0}
                  placeholder="10"
                  value={values.quantity}
                  onChange={(e) => setField("quantity", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Input id="currency" value={values.currency} readOnly className="bg-muted" />
              </div>
              <div className="col-span-2 space-y-2 sm:col-span-1">
                <Label htmlFor="sku">SKU</Label>
                <div className="flex gap-1.5">
                  <Input
                    id="sku"
                    placeholder="e.g. NIK-ABC123"
                    value={values.sku}
                    onChange={(e) => setField("sku", e.target.value)}
                  />
                  <Button type="button" variant="outline" size="icon" onClick={generateSku} title="Generate SKU">
                    <Wand2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <div className="space-y-2 sm:col-span-7">
                <Label htmlFor="product_url">
                  Product URL <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="product_url"
                  type="url"
                  placeholder="https://example.com/product"
                  value={values.product_url}
                  onChange={(e) => setField("product_url", e.target.value)}
                  aria-invalid={Boolean(errors.product_url)}
                />
                {errors.product_url && (
                  <p className="text-xs text-destructive">{errors.product_url}</p>
                )}
              </div>
              <div className="space-y-2 sm:col-span-5">
                <Label>
                  Source Website <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={values.source_website_id || undefined}
                  onValueChange={(v) => setField("source_website_id", v)}
                >
                  <SelectTrigger className="w-full" aria-invalid={Boolean(errors.source_website_id)}>
                    <SelectValue placeholder="— Select —" />
                  </SelectTrigger>
                  <SelectContent>
                    {websites.map((w) => (
                      <SelectItem key={w.id} value={String(w.id)}>
                        {w.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.source_website_id && (
                  <p className="text-xs text-destructive">{errors.source_website_id}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="image_url">Image URL</Label>
              <div className="flex items-start gap-3">
                <div className="flex-1 space-y-2">
                  <Input
                    id="image_url"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={values.image_url.startsWith("data:") ? "" : values.image_url}
                    onChange={(e) => handleImageUrlChange(e.target.value)}
                  />
                  <Label htmlFor="image_file" className="text-xs font-normal text-muted-foreground">
                    Upload File (overrides URL)
                  </Label>
                  <Input
                    id="image_file"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                  />
                </div>

                <div className="shrink-0">
                  <div className="relative flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-md border bg-muted">
                    {previewSrc ? (
                      <Image
                        src={previewSrc}
                        alt="preview"
                        fill
                        sizes="100px"
                        className="object-contain"
                        unoptimized={previewSrc.startsWith("data:")}
                      />
                    ) : (
                      <ImagePlus className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  {previewSrc && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-1 w-full text-destructive hover:text-destructive"
                      onClick={clearImage}
                    >
                      <Trash2 className="mr-1 h-3.5 w-3.5" />
                      Clear
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="font-normal text-muted-foreground">(optional)</span>
              </Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Write a short product description…"
                value={values.description}
                onChange={(e) => setField("description", e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isPending}>
              <X className="mr-1 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-1 h-4 w-4" />
              )}
              Save Product
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

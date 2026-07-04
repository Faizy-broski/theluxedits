"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, ImageOff, Upload, Link2,
  CheckCircle2, X, Loader2,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import adminApi from "@/lib/admin-api";
import { resolveImageUrl } from "@/lib/image-url";
import { toastSuccess, toastError } from "@/lib/swal";

interface Website { id: number; name: string }

const CURRENCIES = ["USD", "EUR", "GBP", "SAR", "AED", "CHF", "JPY", "PKR"];

function formatPrice(price: string, currency: string) {
  const n = parseFloat(price);
  if (isNaN(n)) return "";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

export default function AddProductPage() {
  const router = useRouter();

  const [saving,      setSaving]      = useState(false);
  const [error,       setError]       = useState<string | Record<string, string[]>>("");
  const [imgError,    setImgError]    = useState(false);
  const [imgMode,     setImgMode]     = useState<"url" | "upload">("url");
  const [uploading,   setUploading]   = useState(false);
  const [websites,    setWebsites]    = useState<Website[]>([]);
  const [categories,  setCategories]  = useState<string[]>([]);
  const [brands,      setBrands]      = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title:             "",
    brand:             "",
    category:          "",
    price:             "",
    currency:          "USD",
    image_url:         "",
    product_url:       "",
    description:       "",
    sku:               "",
    quantity:          "",
    source_website_id: "",
  });

  useEffect(() => {
    adminApi.get("/admin/websites").then(({ data }) => setWebsites(data)).catch(() => {});
    adminApi.get("/admin/products/categories").then(({ data }) => setCategories(data)).catch(() => {});
    adminApi.get("/admin/products/brands").then(({ data }) => setBrands(data)).catch(() => {});
  }, []);

  function field(key: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
    if (key === "image_url") setImgError(false);
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    const fd = new FormData();
    fd.append("image", file);
    try {
      const { data } = await adminApi.post("/admin/products/upload-image", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setForm((f) => ({ ...f, image_url: data.url }));
      setImgError(false);
    } catch {
      toastError("Image upload failed. Try pasting a URL instead.");
    } finally { setUploading(false); }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required."); return; }
    setSaving(true);
    setError("");
    try {
      const payload: Record<string, string | number | null> = {
        title:    form.title,
        brand:    form.brand    || null,
        category: form.category || null,
        price:    form.price    ? parseFloat(form.price)   : null,
        currency: form.currency || "USD",
        image_url:   form.image_url   || null,
        product_url: form.product_url || null,
        description: form.description || null,
        sku:         form.sku         || null,
        quantity:    form.quantity    ? parseInt(form.quantity) : null,
        source_website_id: form.source_website_id ? parseInt(form.source_website_id) : null,
      };
      const { data } = await adminApi.post("/admin/products", payload);
      toastSuccess("Product created successfully.");
      router.replace(`/admin/products/${data.id}`);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
      setError(e.response?.data?.errors ?? e.response?.data?.message ?? "Failed to create product.");
    } finally { setSaving(false); }
  }

  const resolvedPreview = resolveImageUrl(form.image_url);
  const currencySymbol = { USD: "$", EUR: "€", GBP: "£", SAR: "﷼", AED: "د.إ", CHF: "₣", JPY: "¥", PKR: "₨" }[form.currency] ?? form.currency;

  function getFieldError(key: string): string | undefined {
    if (typeof error === "object") return error[key]?.[0];
  }

  return (
    <AdminShell>

      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2.5">
        <Link href="/admin/products"
          className="flex items-center gap-1.5 font-jet text-[10px] uppercase tracking-[0.15em] text-black/40 hover:text-black transition">
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
          Products
        </Link>
        <span className="text-black/20">/</span>
        <span className="font-jet text-[10px] uppercase tracking-[0.15em] text-black/60">Add New</span>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">

        {/* ── Left: form ── */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Global error */}
          {typeof error === "string" && error && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
              <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" strokeWidth={1.5} />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Basic info */}
          <div className="rounded-xl border border-black/8 bg-white p-6">
            <h2 className="mb-5 font-jet text-[10px] uppercase tracking-[0.25em] text-black/40">Basic Information</h2>
            <div className="space-y-4">

              <div>
                <label className="mb-1.5 flex items-center justify-between font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">
                  <span>Product Title <span className="text-red-400">*</span></span>
                  {getFieldError("title") && <span className="text-red-500 normal-case tracking-normal">{getFieldError("title")}</span>}
                </label>
                <input required value={form.title} onChange={(e) => field("title", e.target.value)}
                  placeholder="e.g. Gucci Ophidia GG Small Shoulder Bag"
                  className={`w-full rounded-lg border px-4 py-2.5 text-sm text-black placeholder-black/25 outline-none transition ${getFieldError("title") ? "border-red-300 focus:border-red-400" : "border-black/15 focus:border-black/40"}`} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Brand</label>
                  <input value={form.brand} onChange={(e) => field("brand", e.target.value)}
                    placeholder="e.g. Gucci"
                    list="brand-suggestions"
                    className="w-full rounded-lg border border-black/15 px-4 py-2.5 text-sm text-black placeholder-black/25 outline-none focus:border-black/40 transition" />
                  <datalist id="brand-suggestions">
                    {brands.slice(0, 50).map((b) => <option key={b} value={b} />)}
                  </datalist>
                </div>
                <div>
                  <label className="mb-1.5 block font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Category</label>
                  <input value={form.category} onChange={(e) => field("category", e.target.value)}
                    placeholder="e.g. Women's Bags"
                    list="category-suggestions"
                    className="w-full rounded-lg border border-black/15 px-4 py-2.5 text-sm text-black placeholder-black/25 outline-none focus:border-black/40 transition" />
                  <datalist id="category-suggestions">
                    {categories.slice(0, 80).map((c) => <option key={c} value={c} />)}
                  </datalist>
                </div>
              </div>

            </div>
          </div>

          {/* Pricing */}
          <div className="rounded-xl border border-black/8 bg-white p-6">
            <h2 className="mb-5 font-jet text-[10px] uppercase tracking-[0.25em] text-black/40">Pricing & Stock</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Price</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-jet text-[11px] text-black/30">{currencySymbol}</span>
                  <input type="number" step="0.01" min="0" value={form.price}
                    onChange={(e) => field("price", e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-lg border border-black/15 py-2.5 pl-8 pr-4 text-sm text-black placeholder-black/25 outline-none focus:border-black/40 transition" />
                </div>
              </div>
              <div>
                <label className="mb-1.5 block font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Currency</label>
                <select value={form.currency} onChange={(e) => field("currency", e.target.value)}
                  className="w-full rounded-lg border border-black/15 px-4 py-2.5 text-sm text-black outline-none focus:border-black/40 transition">
                  {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Quantity</label>
                <input type="number" min="0" value={form.quantity}
                  onChange={(e) => field("quantity", e.target.value)}
                  placeholder="Leave blank = unlimited"
                  className="w-full rounded-lg border border-black/15 px-4 py-2.5 text-sm text-black placeholder-black/25 outline-none focus:border-black/40 transition" />
              </div>
            </div>
            {form.price && (
              <p className="mt-2.5 font-jet text-[10px] text-black/35">
                Display: <span className="text-black/60">{formatPrice(form.price, form.currency)}</span>
              </p>
            )}
          </div>

          {/* Image */}
          <div className="rounded-xl border border-black/8 bg-white p-6">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-jet text-[10px] uppercase tracking-[0.25em] text-black/40">Product Image</h2>
              <div className="flex gap-1 rounded-lg border border-black/10 p-0.5">
                <button type="button" onClick={() => setImgMode("url")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-jet text-[9px] uppercase tracking-[0.12em] transition ${imgMode === "url" ? "bg-black text-white" : "text-black/40 hover:text-black"}`}>
                  <Link2 className="h-3 w-3" strokeWidth={1.5} />URL
                </button>
                <button type="button" onClick={() => setImgMode("upload")}
                  className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 font-jet text-[9px] uppercase tracking-[0.12em] transition ${imgMode === "upload" ? "bg-black text-white" : "text-black/40 hover:text-black"}`}>
                  <Upload className="h-3 w-3" strokeWidth={1.5} />Upload
                </button>
              </div>
            </div>

            {imgMode === "url" ? (
              <div>
                <input value={form.image_url} onChange={(e) => field("image_url", e.target.value)}
                  placeholder="https://… or /uploads/products/…"
                  className="w-full rounded-lg border border-black/15 px-4 py-2.5 text-sm text-black placeholder-black/25 outline-none focus:border-black/40 transition" />
                <p className="mt-1.5 font-jet text-[9px] text-black/25">Paste an absolute URL or relative path</p>
              </div>
            ) : (
              <div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
                <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
                  className="flex w-full flex-col items-center justify-center gap-2.5 rounded-xl border-2 border-dashed border-black/15 bg-neutral-50 py-8 hover:border-black/30 hover:bg-neutral-100 transition disabled:opacity-50">
                  {uploading
                    ? <Loader2 className="h-7 w-7 animate-spin text-black/30" strokeWidth={1.2} />
                    : <Upload className="h-7 w-7 text-black/25" strokeWidth={1} />}
                  <div className="text-center">
                    <p className="text-[13px] font-medium text-black/50">{uploading ? "Uploading…" : "Click to upload image"}</p>
                    <p className="mt-0.5 font-jet text-[9px] text-black/25">JPG, PNG, WEBP · Max 8 MB</p>
                  </div>
                </button>
                {form.image_url && (
                  <p className="mt-2 truncate font-jet text-[9px] text-emerald-600">✓ Uploaded: {form.image_url}</p>
                )}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="rounded-xl border border-black/8 bg-white p-6">
            <h2 className="mb-5 font-jet text-[10px] uppercase tracking-[0.25em] text-black/40">Description</h2>
            <textarea value={form.description} onChange={(e) => field("description", e.target.value)}
              rows={5} placeholder="Describe the product in detail…"
              className="w-full rounded-lg border border-black/15 px-4 py-3 text-sm text-black placeholder-black/25 outline-none focus:border-black/40 transition resize-none" />
          </div>

          {/* Additional details */}
          <div className="rounded-xl border border-black/8 bg-white p-6">
            <h2 className="mb-5 font-jet text-[10px] uppercase tracking-[0.25em] text-black/40">Additional Details</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">SKU</label>
                <input value={form.sku} onChange={(e) => field("sku", e.target.value)}
                  placeholder="e.g. GG-123456"
                  className="w-full rounded-lg border border-black/15 px-4 py-2.5 text-sm text-black placeholder-black/25 outline-none focus:border-black/40 transition" />
              </div>
              <div>
                <label className="mb-1.5 block font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Source Website</label>
                <select value={form.source_website_id} onChange={(e) => field("source_website_id", e.target.value)}
                  className="w-full rounded-lg border border-black/15 px-4 py-2.5 text-sm text-black outline-none focus:border-black/40 transition">
                  <option value="">— None —</option>
                  {websites.map((w) => <option key={w.id} value={w.id}>{w.name}</option>)}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Source / Product URL</label>
                <input value={form.product_url} onChange={(e) => field("product_url", e.target.value)}
                  placeholder="https://original-site.com/product/…"
                  className="w-full rounded-lg border border-black/15 px-4 py-2.5 text-sm text-black placeholder-black/25 outline-none focus:border-black/40 transition" />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center gap-3 pb-2">
            <button type="submit" disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white hover:bg-black/80 disabled:opacity-60 transition">
              {saving
                ? <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                : <Save className="h-4 w-4" strokeWidth={1.8} />}
              {saving ? "Creating…" : "Create Product"}
            </button>
            <Link href="/admin/products"
              className="rounded-lg border border-black/15 px-5 py-3 text-sm text-black/60 hover:text-black transition">
              Cancel
            </Link>
          </div>
        </form>

        {/* ── Right: preview ── */}
        <div className="space-y-4">

          {/* Image preview */}
          <div className="rounded-xl border border-black/8 bg-white p-5">
            <h2 className="mb-4 font-jet text-[10px] uppercase tracking-[0.25em] text-black/40">Live Preview</h2>
            <div className="overflow-hidden rounded-lg bg-[#f5f5f5]" style={{ aspectRatio: "4/5" }}>
              {resolvedPreview && !imgError ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={resolvedPreview} src={resolvedPreview} alt={form.title}
                  onError={() => setImgError(true)}
                  className="h-full w-full object-contain" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 text-center p-6">
                  <ImageOff className="h-10 w-10 text-black/10" strokeWidth={0.8} />
                  <p className="font-jet text-[9px] uppercase tracking-[0.15em] text-black/20">
                    {imgError ? "Failed to load image" : "Image preview"}
                  </p>
                </div>
              )}
            </div>

            {/* Product card preview */}
            <div className="mt-4 border-t border-black/8 pt-4">
              {form.brand && (
                <p className="font-jet text-[9px] uppercase tracking-[0.25em] text-black/35">{form.brand}</p>
              )}
              <p className={`mt-1 text-[13px] font-medium leading-snug ${form.title ? "text-black" : "text-black/20"}`}>
                {form.title || "Product title will appear here"}
              </p>
              {form.category && (
                <span className="mt-1.5 inline-block rounded-full border border-black/10 px-2 py-0.5 font-jet text-[8px] uppercase tracking-[0.1em] text-black/40">
                  {form.category}
                </span>
              )}
              <p className={`mt-2 font-fraunces text-lg font-light ${form.price ? "text-black" : "text-black/20"}`}>
                {form.price ? formatPrice(form.price, form.currency) : "Price"}
              </p>
            </div>
          </div>

          {/* Checklist */}
          <div className="rounded-xl border border-black/8 bg-white p-5">
            <h2 className="mb-3 font-jet text-[10px] uppercase tracking-[0.25em] text-black/40">Checklist</h2>
            <div className="space-y-2">
              {[
                { label: "Title",       done: !!form.title },
                { label: "Brand",       done: !!form.brand },
                { label: "Category",    done: !!form.category },
                { label: "Price",       done: !!form.price },
                { label: "Image",       done: !!form.image_url },
                { label: "Description", done: !!form.description },
              ].map(({ label, done }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <CheckCircle2 className={`h-4 w-4 transition ${done ? "text-emerald-500" : "text-black/15"}`} strokeWidth={1.5} />
                  <span className={`text-[13px] transition ${done ? "text-black/70" : "text-black/30"}`}>{label}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </AdminShell>
  );
}

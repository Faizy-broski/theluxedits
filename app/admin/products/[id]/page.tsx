"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Save, ExternalLink, Trash2, ImageOff,
  CheckCircle2, Upload, Link2, Loader2,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import adminApi from "@/lib/admin-api";
import { resolveImageUrl } from "@/lib/image-url";
import { confirmDelete, toastSuccess, toastError } from "@/lib/swal";

interface Product {
  id: number;
  title: string;
  brand: string | null;
  category: string | null;
  price: string;
  currency: string;
  image_url: string | null;
  description: string | null;
  sku: string | null;
  product_url: string | null;
  source_website_id: number | null;
  quantity: number | null;
}

interface Website { id: number; name: string }

const CURRENCIES = ["USD", "EUR", "GBP", "SAR", "AED", "CHF", "JPY", "PKR"];

function formatPrice(price: string, currency: string) {
  const n = parseFloat(price);
  if (isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

export default function AdminProductEditPage() {
  const { id }  = useParams<{ id: string }>();
  const router  = useRouter();

  const [product,    setProduct]    = useState<Product | null>(null);
  const [websites,   setWebsites]   = useState<Website[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands,     setBrands]     = useState<string[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [saving,     setSaving]     = useState(false);
  const [saved,      setSaved]      = useState(false);
  const [deleting,   setDeleting]   = useState(false);
  const [error,      setError]      = useState("");
  const [imgError,   setImgError]   = useState(false);
  const [imgMode,    setImgMode]    = useState<"url" | "upload">("url");
  const [uploading,  setUploading]  = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "", brand: "", category: "", price: "", currency: "USD",
    image_url: "", description: "", sku: "", product_url: "",
    source_website_id: "", quantity: "",
  });

  useEffect(() => {
    adminApi.get(`/admin/products/${id}`)
      .then(({ data }) => {
        setProduct(data);
        setForm({
          title:             data.title       || "",
          brand:             data.brand       || "",
          category:          data.category    || "",
          price:             data.price       || "",
          currency:          data.currency    || "USD",
          image_url:         data.image_url   || "",
          description:       data.description || "",
          sku:               data.sku         || "",
          product_url:       data.product_url || "",
          source_website_id: data.source_website_id ? String(data.source_website_id) : "",
          quantity:          data.quantity    != null ? String(data.quantity) : "",
        });
      })
      .catch(() => setError("Product not found."))
      .finally(() => setLoading(false));

    adminApi.get("/admin/websites").then(({ data }) => setWebsites(data)).catch(() => {});
    adminApi.get("/admin/products/categories").then(({ data }) => setCategories(data)).catch(() => {});
    adminApi.get("/admin/products/brands").then(({ data }) => setBrands(data)).catch(() => {});
  }, [id]);

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
      field("image_url", data.url);
    } catch {
      toastError("Image upload failed. Try pasting a URL instead.");
    } finally { setUploading(false); }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      const payload: Record<string, string | number | null> = {
        title:             form.title,
        brand:             form.brand      || null,
        category:          form.category   || null,
        price:             form.price      ? parseFloat(form.price)   : null,
        currency:          form.currency   || "USD",
        image_url:         form.image_url  || null,
        description:       form.description || null,
        sku:               form.sku        || null,
        product_url:       form.product_url || null,
        source_website_id: form.source_website_id ? parseInt(form.source_website_id) : null,
        quantity:          form.quantity   ? parseInt(form.quantity) : null,
      };
      const { data } = await adminApi.put(`/admin/products/${id}`, payload);
      setProduct(data);
      setSaved(true);
      toastSuccess("Product saved successfully.");
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setError("Failed to save. Please check your inputs and try again.");
      toastError("Failed to save product.");
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    const ok = await confirmDelete(
      `Delete this product?`,
      `"${product?.title}" will be permanently removed.`
    );
    if (!ok) return;
    setDeleting(true);
    try {
      await adminApi.delete(`/admin/products/${id}`);
      toastSuccess("Product deleted.");
      router.replace("/admin/products");
    } catch {
      toastError("Failed to delete. Please try again.");
      setDeleting(false);
    }
  }

  const currencySymbol = { USD: "$", EUR: "€", GBP: "£", SAR: "﷼", AED: "د.إ", CHF: "₣", JPY: "¥", PKR: "₨" }[form.currency] ?? form.currency;
  const resolvedPreview = resolveImageUrl(form.image_url);

  return (
    <AdminShell>

      {/* ── Breadcrumb ── */}
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2.5">
          <Link href="/admin/products"
            className="flex items-center gap-1.5 font-jet text-[10px] uppercase tracking-[0.15em] text-black/40 hover:text-black transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            Products
          </Link>
          <span className="text-black/20">/</span>
          <span className="font-jet text-[10px] uppercase tracking-[0.15em] text-black/60">
            {loading ? "Loading…" : `Edit #${id}`}
          </span>
        </div>
        {product && (
          <div className="flex items-center gap-2">
            <a href={`/products/${product.id}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-lg border border-black/15 bg-white px-3 py-2 text-[12px] text-black/50 hover:text-black transition">
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.4} />
              View on site
            </a>
            <button onClick={handleDelete} disabled={deleting}
              className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-[12px] text-red-500 hover:bg-red-50 hover:border-red-300 transition disabled:opacity-40">
              {deleting
                ? <span className="h-3 w-3 animate-spin rounded-full border border-red-300 border-t-red-500" />
                : <Trash2 className="h-3.5 w-3.5" strokeWidth={1.4} />}
              Delete
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
          <div className="space-y-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-12 animate-pulse rounded-xl bg-neutral-100" />)}
          </div>
          <div className="h-80 animate-pulse rounded-xl bg-neutral-100" />
        </div>
      ) : error && !product ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-red-600">{error}</p>
          <Link href="/admin/products" className="mt-3 inline-block font-jet text-[10px] uppercase tracking-[0.15em] text-red-500 underline">
            Back to products
          </Link>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">

          {/* ── Left: form ── */}
          <form onSubmit={handleSave} className="space-y-5">

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
            )}
            {saved && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" strokeWidth={1.5} />
                Product saved successfully.
              </div>
            )}

            {/* Basic info */}
            <div className="rounded-xl border border-black/8 bg-white p-6">
              <h2 className="mb-5 font-jet text-[10px] uppercase tracking-[0.25em] text-black/40">Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1.5 block font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">
                    Product Title <span className="text-red-400">*</span>
                  </label>
                  <input required value={form.title} onChange={(e) => field("title", e.target.value)}
                    className="w-full rounded-lg border border-black/15 px-4 py-2.5 text-sm text-black outline-none focus:border-black/40 transition" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Brand</label>
                    <input value={form.brand} onChange={(e) => field("brand", e.target.value)}
                      placeholder="e.g. Gucci" list="edit-brand-suggestions"
                      className="w-full rounded-lg border border-black/15 px-4 py-2.5 text-sm text-black placeholder-black/25 outline-none focus:border-black/40 transition" />
                    <datalist id="edit-brand-suggestions">
                      {brands.slice(0, 50).map((b) => <option key={b} value={b} />)}
                    </datalist>
                  </div>
                  <div>
                    <label className="mb-1.5 block font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Category</label>
                    <input value={form.category} onChange={(e) => field("category", e.target.value)}
                      placeholder="e.g. Men's Watches" list="edit-category-suggestions"
                      className="w-full rounded-lg border border-black/15 px-4 py-2.5 text-sm text-black placeholder-black/25 outline-none focus:border-black/40 transition" />
                    <datalist id="edit-category-suggestions">
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
                      className="w-full rounded-lg border border-black/15 py-2.5 pl-8 pr-4 text-sm text-black outline-none focus:border-black/40 transition" />
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
                    placeholder="Unlimited"
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
                  <p className="mt-1.5 font-jet text-[9px] text-black/25">Paste a direct image URL. Preview updates automatically.</p>
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
                    <p className="mt-2 truncate font-jet text-[9px] text-emerald-600">✓ {form.image_url}</p>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div className="rounded-xl border border-black/8 bg-white p-6">
              <h2 className="mb-5 font-jet text-[10px] uppercase tracking-[0.25em] text-black/40">Description</h2>
              <textarea value={form.description} onChange={(e) => field("description", e.target.value)}
                rows={5} placeholder="Product description…"
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

            {/* Save */}
            <div className="flex items-center gap-3 pb-2">
              <button type="submit" disabled={saving}
                className={`flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition ${saved ? "bg-emerald-600 text-white" : "bg-black text-white hover:bg-black/80"} disabled:opacity-60`}>
                {saving
                  ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  : saved
                  ? <CheckCircle2 className="h-4 w-4" strokeWidth={1.8} />
                  : <Save className="h-4 w-4" strokeWidth={1.8} />}
                {saved ? "Saved!" : saving ? "Saving…" : "Save Changes"}
              </button>
              <Link href="/admin/products"
                className="rounded-lg border border-black/15 px-5 py-3 text-sm text-black/60 hover:text-black transition">
                Cancel
              </Link>
            </div>
          </form>

          {/* ── Right: preview ── */}
          <div className="space-y-4">
            <div className="rounded-xl border border-black/8 bg-white p-5">
              <h2 className="mb-4 font-jet text-[10px] uppercase tracking-[0.25em] text-black/40">Image Preview</h2>
              <div className="overflow-hidden rounded-lg bg-[#f5f5f5]" style={{ aspectRatio: "4/5" }}>
                {resolvedPreview && !imgError ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={form.image_url} src={resolvedPreview} alt={form.title}
                    onError={() => setImgError(true)}
                    className="h-full w-full object-contain" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <ImageOff className="mx-auto mb-2 h-8 w-8 text-black/15" strokeWidth={1} />
                      <p className="font-jet text-[9px] uppercase tracking-[0.15em] text-black/20">
                        {imgError ? "Image failed to load" : "No image URL"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-xl border border-black/8 bg-white p-5">
              <h2 className="mb-4 font-jet text-[10px] uppercase tracking-[0.25em] text-black/40">Product Info</h2>
              <div className="space-y-2.5">
                <div className="flex justify-between gap-3">
                  <span className="text-[12px] text-black/40">ID</span>
                  <span className="font-jet text-[11px] text-black/70">#{product?.id}</span>
                </div>
                {(form.sku || product?.sku) && (
                  <div className="flex justify-between gap-3">
                    <span className="text-[12px] text-black/40">SKU</span>
                    <span className="font-jet text-[11px] text-black/70">{form.sku || product?.sku}</span>
                  </div>
                )}
                <div className="flex justify-between gap-3">
                  <span className="text-[12px] text-black/40">Brand</span>
                  <span className="text-[12px] text-black/70">{form.brand || "—"}</span>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-[12px] text-black/40">Category</span>
                  <span className="text-[12px] text-black/70">{form.category || "—"}</span>
                </div>
                {form.quantity && (
                  <div className="flex justify-between gap-3">
                    <span className="text-[12px] text-black/40">Quantity</span>
                    <span className="text-[12px] text-black/70">{form.quantity}</span>
                  </div>
                )}
                <div className="flex justify-between gap-3 border-t border-black/5 pt-2.5">
                  <span className="text-[12px] text-black/40">Price</span>
                  <span className="font-fraunces text-[15px] font-light text-black">
                    {form.price ? formatPrice(form.price, form.currency) : "—"}
                  </span>
                </div>
              </div>
            </div>

            {form.product_url && (
              <div className="rounded-xl border border-black/8 bg-white p-5">
                <h2 className="mb-3 font-jet text-[10px] uppercase tracking-[0.25em] text-black/40">Source</h2>
                <a href={form.product_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-lg border border-black/10 px-3 py-2.5 text-[12px] text-black/60 hover:border-black/25 hover:text-black transition truncate">
                  <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" strokeWidth={1.4} />
                  <span className="truncate">{form.product_url}</span>
                </a>
              </div>
            )}
          </div>

        </div>
      )}
    </AdminShell>
  );
}

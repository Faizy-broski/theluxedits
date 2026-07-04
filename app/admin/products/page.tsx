"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import {
  Search, Pencil, Trash2, ChevronLeft, ChevronRight,
  Package, ImageOff, Tag, Layers, ExternalLink, Plus,
  ChevronDown, BarChart2, DollarSign, RefreshCw, Eye, X,
  Edit3, Zap, CheckCircle, AlertTriangle, ChevronUp,
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
  sku: string | null;
  description?: string | null;
  product_url?: string | null;
}

interface ProductStats {
  total: number;
  with_images: number;
  categories: number;
  brands: number;
  avg_price: number;
}

/* ── helpers ── */
function fmt(price: string, currency = "USD") {
  const n = parseFloat(price);
  if (isNaN(n) || n === 0) return <span className="text-black/25">$0</span>;
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}

function ProductThumb({ src, alt }: { src: string | null | undefined; alt: string }) {
  const [err, setErr] = useState(false);
  const resolved = resolveImageUrl(src);
  if (!resolved || err) {
    return (
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100 border border-black/5">
        <ImageOff className="h-3.5 w-3.5 text-black/20" strokeWidth={1.2} />
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={resolved} alt={alt} onError={() => setErr(true)} loading="lazy"
      className="h-11 w-11 flex-shrink-0 rounded-lg object-contain bg-[#f5f5f5] border border-black/5" />
  );
}

/* ══════════════════════════════════════════════════════════
   TYPE 2 — Bulk Field Edit Modal
   Full modal with per-field toggles: brand, category, price, currency
══════════════════════════════════════════════════════════ */
interface BulkEditState {
  applyBrand: boolean;    brand: string;
  applyCategory: boolean; category: string;
  applyPrice: boolean;    price: string; priceMode: "set" | "increase" | "decrease";
  applyCurrency: boolean; currency: string;
}

/* ── FieldToggle: top-level so React never remounts it on parent re-render ── */
function FieldToggle({ label, checked, onChange, children }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; children: ReactNode;
}) {
  return (
    <div className={`rounded-xl border p-4 transition-all ${checked ? "border-black/25 bg-neutral-50" : "border-black/8 opacity-60"}`}>
      <label className="mb-3 flex cursor-pointer items-center gap-2.5">
        <div onClick={() => onChange(!checked)}
          className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border-2 transition
            ${checked ? "border-black bg-black" : "border-black/25 bg-white"}`}>
          {checked && <CheckCircle className="h-3 w-3 text-white" strokeWidth={3} />}
        </div>
        <span className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/60 select-none">{label}</span>
      </label>
      <div className={`transition-all ${checked ? "" : "pointer-events-none select-none"}`}>{children}</div>
    </div>
  );
}

function BulkEditModal({
  count, categories, brands, onClose, onSubmit, saving,
}: {
  count: number;
  categories: string[];
  brands: string[];
  onClose: () => void;
  onSubmit: (s: BulkEditState) => void;
  saving: boolean;
}) {
  const [f, setF] = useState<BulkEditState>({
    applyBrand: false,    brand: "",
    applyCategory: false, category: "",
    applyPrice: false,    price: "", priceMode: "set",
    applyCurrency: false, currency: "USD",
  });

  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", esc);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", esc); document.body.style.overflow = ""; };
  }, [onClose]);

  const anyApplied = f.applyBrand || f.applyCategory || f.applyPrice || f.applyCurrency;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">

        {/* Header — fixed */}
        <div className="flex flex-shrink-0 items-center justify-between border-b border-black/8 px-6 py-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-100">
                <Edit3 className="h-3.5 w-3.5 text-violet-600" strokeWidth={1.8} />
              </div>
              <h2 className="font-semibold text-black">Bulk Edit Fields</h2>
            </div>
            <p className="mt-1 pl-9 font-jet text-[9px] uppercase tracking-[0.15em] text-black/35">
              Applying to <span className="text-black font-bold">{count}</span> selected product{count !== 1 ? "s" : ""}
            </p>
          </div>
          <button onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-neutral-100 text-black/40 hover:bg-neutral-200 hover:text-black transition">
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        {/* Scrollable body — banner + fields */}
        <div className="flex-1 overflow-y-auto">

        {/* Info banner */}
        <div className="mx-6 mt-4 flex items-start gap-2.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2.5">
          <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-amber-500" strokeWidth={1.8} />
          <p className="text-[12px] text-amber-700">
            Only <span className="font-semibold">checked fields</span> will be updated. Unchecked fields are left untouched.
          </p>
        </div>

        {/* Fields */}
        <div className="space-y-3 p-6">

          {/* Brand */}
          <FieldToggle label="Brand" checked={f.applyBrand} onChange={(v) => setF((s) => ({ ...s, applyBrand: v }))}>
            <input list="bulk-brands" value={f.brand} onChange={(e) => setF((s) => ({ ...s, brand: e.target.value }))}
              placeholder="e.g. Gucci"
              className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm text-black placeholder-black/25 outline-none focus:border-black/40 transition" />
            <datalist id="bulk-brands">{brands.map((b) => <option key={b} value={b} />)}</datalist>
            <p className="mt-1 font-jet text-[9px] text-black/35">Leave empty to clear brand on selected products</p>
          </FieldToggle>

          {/* Category */}
          <FieldToggle label="Category" checked={f.applyCategory} onChange={(v) => setF((s) => ({ ...s, applyCategory: v }))}>
            <input list="bulk-cats" value={f.category} onChange={(e) => setF((s) => ({ ...s, category: e.target.value }))}
              placeholder="e.g. Bags"
              className="w-full rounded-lg border border-black/15 px-3 py-2 text-sm text-black placeholder-black/25 outline-none focus:border-black/40 transition" />
            <datalist id="bulk-cats">{categories.map((c) => <option key={c} value={c} />)}</datalist>
            <p className="mt-1 font-jet text-[9px] text-black/35">Leave empty to clear category on selected products</p>
          </FieldToggle>

          {/* Price */}
          <FieldToggle label="Price" checked={f.applyPrice} onChange={(v) => setF((s) => ({ ...s, applyPrice: v }))}>
            <div className="flex gap-2">
              {/* Mode pills */}
              <div className="flex rounded-lg border border-black/12 overflow-hidden">
                {(["set", "increase", "decrease"] as const).map((m) => (
                  <button key={m} type="button"
                    onClick={() => setF((s) => ({ ...s, priceMode: m }))}
                    className={`px-2.5 py-1.5 font-jet text-[8.5px] uppercase tracking-[0.1em] transition
                      ${f.priceMode === m ? "bg-black text-white" : "text-black/40 hover:text-black"}`}>
                    {m === "set" ? "Set to" : m === "increase" ? "↑ %" : "↓ %"}
                  </button>
                ))}
              </div>
              <input type="number" min="0" step={f.priceMode === "set" ? "0.01" : "1"}
                value={f.price} onChange={(e) => setF((s) => ({ ...s, price: e.target.value }))}
                placeholder={f.priceMode === "set" ? "e.g. 299.99" : "e.g. 10"}
                className="flex-1 rounded-lg border border-black/15 px-3 py-2 text-sm text-black placeholder-black/25 outline-none focus:border-black/40 transition" />
            </div>
            <p className="mt-1 font-jet text-[9px] text-black/35">
              {f.priceMode === "set" ? "Exact price for all selected" :
               f.priceMode === "increase" ? "Increase current price by this %" :
               "Decrease current price by this %"}
            </p>
          </FieldToggle>

          {/* Currency */}
          <FieldToggle label="Currency" checked={f.applyCurrency} onChange={(v) => setF((s) => ({ ...s, applyCurrency: v }))}>
            <div className="relative">
              <select value={f.currency} onChange={(e) => setF((s) => ({ ...s, currency: e.target.value }))}
                className="w-full appearance-none rounded-lg border border-black/15 px-3 py-2 text-sm text-black outline-none focus:border-black/40 transition">
                {["USD", "EUR", "GBP", "SAR", "AED", "CHF", "CAD"].map((c) => <option key={c}>{c}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/35" strokeWidth={1.5} />
            </div>
          </FieldToggle>

        </div>

        </div>{/* end scrollable body */}

        {/* Footer — fixed */}
        <div className="flex flex-shrink-0 items-center justify-between border-t border-black/8 px-6 py-4">
          <button onClick={onClose} className="text-sm text-black/40 hover:text-black transition">Cancel</button>
          <button
            onClick={() => onSubmit(f)}
            disabled={!anyApplied || saving}
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-violet-700 disabled:opacity-40 transition">
            {saving
              ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              : <Edit3 className="h-3.5 w-3.5" strokeWidth={2} />}
            {saving ? "Applying…" : `Apply to ${count} Product${count !== 1 ? "s" : ""}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   TYPE 1 — Quick Set Popover (inline in action bar)
   Set a single field (brand or category) instantly
══════════════════════════════════════════════════════════ */
function QuickSetPopover({
  field, options, onApply, onClose,
}: {
  field: "brand" | "category";
  options: string[];
  onApply: (value: string) => void;
  onClose: () => void;
}) {
  const [val, setVal] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  return (
    <div className="flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-3 py-2">
      <span className="font-jet text-[9px] uppercase tracking-[0.12em] text-white/60">
        Set {field}:
      </span>
      <input
        ref={inputRef}
        list={`qs-${field}`}
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") onApply(val); if (e.key === "Escape") onClose(); }}
        placeholder={field === "brand" ? "e.g. Gucci" : "e.g. Bags"}
        className="w-36 rounded-lg border border-white/20 bg-white/10 px-2.5 py-1.5 text-[12px] text-white placeholder-white/30 outline-none focus:border-white/40 transition"
      />
      <datalist id={`qs-${field}`}>{options.map((o) => <option key={o} value={o} />)}</datalist>
      <button onClick={() => onApply(val)}
        className="flex items-center gap-1 rounded-lg bg-white/15 px-2.5 py-1.5 font-jet text-[10px] uppercase tracking-[0.1em] text-white hover:bg-white/25 transition">
        Apply
      </button>
      <button onClick={onClose}
        className="flex h-6 w-6 items-center justify-center rounded-md text-white/40 hover:text-white transition">
        <X className="h-3.5 w-3.5" strokeWidth={1.5} />
      </button>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   Preview modal (unchanged)
══════════════════════════════════════════════════════════ */
function PreviewModal({ product, onClose, onEdit, onDelete }: {
  product: Product; onClose: () => void; onEdit: () => void; onDelete: () => void;
}) {
  const [imgErr, setImgErr] = useState(false);
  const resolved = resolveImageUrl(product.image_url);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", handler); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <button onClick={onClose}
          className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-black/8 text-black/50 hover:bg-black/15 hover:text-black transition">
          <X className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <div className="grid sm:grid-cols-[280px_1fr]">
          <div className="flex items-center justify-center bg-[#f5f5f5] min-h-[260px] sm:min-h-[380px]">
            {resolved && !imgErr ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resolved} alt={product.title} onError={() => setImgErr(true)}
                className="max-h-[380px] w-full object-contain p-4" />
            ) : (
              <div className="flex flex-col items-center gap-2 p-8 text-center">
                <ImageOff className="h-12 w-12 text-black/15" strokeWidth={0.8} />
                <p className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/25">No image</p>
              </div>
            )}
          </div>
          <div className="flex flex-col p-6 overflow-y-auto max-h-[480px]">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {product.category && (
                <span className="rounded-full border border-black/10 px-2.5 py-0.5 font-jet text-[9px] uppercase tracking-[0.12em] text-black/55">{product.category}</span>
              )}
              {product.brand && (
                <span className="rounded-full bg-neutral-100 px-2.5 py-0.5 font-jet text-[9px] uppercase tracking-[0.12em] text-black/45">{product.brand}</span>
              )}
            </div>
            <h2 className="text-[17px] font-semibold leading-snug text-black">{product.title}</h2>
            <p className="mt-2 font-fraunces text-2xl font-light text-black">{fmt(product.price, product.currency || "USD")}</p>
            <div className="my-4 h-px bg-black/8" />
            {product.description && (
              <p className="text-[13px] leading-relaxed text-black/60 line-clamp-4 mb-4">{product.description}</p>
            )}
            <div className="mt-auto space-y-1.5">
              <div className="flex justify-between">
                <span className="font-jet text-[9px] uppercase tracking-[0.15em] text-black/35">Product ID</span>
                <span className="font-jet text-[10px] text-black/60">#{product.id}</span>
              </div>
              {product.sku && (
                <div className="flex justify-between">
                  <span className="font-jet text-[9px] uppercase tracking-[0.15em] text-black/35">SKU</span>
                  <span className="font-jet text-[10px] text-black/60">{product.sku}</span>
                </div>
              )}
            </div>
            <div className="mt-5 flex gap-2">
              <button onClick={onEdit}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-black px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-black/80 transition">
                <Pencil className="h-3.5 w-3.5" strokeWidth={1.5} />Edit Product
              </button>
              {product.product_url && (
                <a href={product.product_url} target="_blank" rel="noopener noreferrer"
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-black/15 text-black/40 hover:border-black/30 hover:text-black transition flex-shrink-0">
                  <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.4} />
                </a>
              )}
              <button onClick={onDelete}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-200 text-red-400 hover:bg-red-50 hover:border-red-300 hover:text-red-600 transition flex-shrink-0">
                <Trash2 className="h-3.5 w-3.5" strokeWidth={1.4} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Checkbox: top-level so React never remounts it on parent re-render ── */
function Checkbox({ checked, indeterminate, onChange }: {
  checked: boolean; indeterminate?: boolean; onChange: () => void;
}) {
  return (
    <button type="button" onClick={onChange}
      className={`flex flex-shrink-0 items-center justify-center rounded border-2 transition
        ${checked || indeterminate ? "border-black bg-black" : "border-black/20 bg-white hover:border-black/40"}`}
      style={{ height: 18, width: 18 }}>
      {indeterminate && !checked && <span className="h-0.5 w-2.5 rounded-full bg-white" />}
      {checked && <CheckCircle className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
    </button>
  );
}

/* ══════════════════════════════════════════════════════════
   Main page component
══════════════════════════════════════════════════════════ */
export default function AdminProductsPage() {
  const [products,     setProducts]     = useState<Product[]>([]);
  const [stats,        setStats]        = useState<ProductStats | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [search,       setSearch]       = useState("");
  const [searchInput,  setSearchInput]  = useState("");
  const [category,     setCategory]     = useState("");
  const [brand,        setBrand]        = useState("");
  const [sort,         setSort]         = useState("newest");
  const [page,         setPage]         = useState(1);
  const [lastPage,     setLastPage]     = useState(1);
  const [total,        setTotal]        = useState(0);
  const [categories,   setCategories]   = useState<string[]>([]);
  const [brands,       setBrands]       = useState<string[]>([]);
  const [deleting,     setDeleting]     = useState<number | null>(null);
  const [deletedId,    setDeletedId]    = useState<number | null>(null);
  const [preview,      setPreview]      = useState<Product | null>(null);

  // ── Bulk state ──
  const [selectedIds,    setSelectedIds]    = useState<Set<number>>(new Set());
  const [bulkEditOpen,   setBulkEditOpen]   = useState(false);
  const [bulkSaving,     setBulkSaving]     = useState(false);
  const [bulkDeleting,   setBulkDeleting]   = useState(false);
  const [quickSet,       setQuickSet]       = useState<"brand" | "category" | null>(null);

  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(null!);

  useEffect(() => {
    adminApi.get("/admin/products/stats").then(({ data }) => setStats(data)).catch(() => {}).finally(() => setStatsLoading(false));
    adminApi.get("/admin/products/categories").then(({ data }) => setCategories(data)).catch(() => {});
    adminApi.get("/admin/products/brands").then(({ data }) => setBrands(data)).catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, sort, per_page: 25 };
      if (search)   params.search   = search;
      if (category) params.category = category;
      if (brand)    params.brand    = brand;
      const { data } = await adminApi.get("/admin/products", { params });
      setProducts(data.data);
      setLastPage(data.last_page);
      setTotal(data.total);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [page, sort, search, category, brand]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  // clear selection on page change
  useEffect(() => { setSelectedIds(new Set()); }, [page, search, category, brand, sort]);

  function handleSearchChange(val: string) {
    setSearchInput(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => { setSearch(val); setPage(1); }, 400);
  }

  /* ── Single delete ── */
  async function handleDelete(id: number, title?: string) {
    const ok = await confirmDelete(`Delete "${title || `Product #${id}`}"?`, "This will permanently remove the product.");
    if (!ok) return;
    setDeleting(id);
    setPreview(null);
    try {
      await adminApi.delete(`/admin/products/${id}`);
      setDeletedId(id);
      setTimeout(() => { setProducts((p) => p.filter((x) => x.id !== id)); setTotal((t) => t - 1); setDeletedId(null); }, 350);
      if (stats) setStats((s) => s ? { ...s, total: s.total - 1 } : s);
      toastSuccess("Product deleted.");
    } catch { toastError("Failed to delete product."); }
    finally { setDeleting(null); }
  }

  /* ── TYPE 1: Bulk Delete ── */
  async function handleBulkDelete() {
    const count = selectedIds.size;
    const ok = await confirmDelete(
      `Delete ${count} product${count !== 1 ? "s" : ""}?`,
      "This will permanently remove all selected products."
    );
    if (!ok) return;
    setBulkDeleting(true);
    try {
      await adminApi.post("/admin/products/bulk-delete", { ids: [...selectedIds] });
      setProducts((p) => p.filter((x) => !selectedIds.has(x.id)));
      setTotal((t) => t - count);
      if (stats) setStats((s) => s ? { ...s, total: Math.max(0, s.total - count) } : s);
      setSelectedIds(new Set());
      toastSuccess(`${count} product${count !== 1 ? "s" : ""} deleted.`);
    } catch { toastError("Failed to delete products. Please try again."); }
    finally { setBulkDeleting(false); }
  }

  /* ── TYPE 1: Quick Set (brand or category) ── */
  async function handleQuickSet(field: "brand" | "category", value: string) {
    const count = selectedIds.size;
    setQuickSet(null);
    setBulkSaving(true);
    try {
      await adminApi.patch("/admin/products/bulk-update", {
        ids: [...selectedIds],
        [field]: value || null,
        [`apply_${field}`]: true,
      });
      setProducts((p) =>
        p.map((x) => selectedIds.has(x.id) ? { ...x, [field]: value || null } : x)
      );
      setSelectedIds(new Set());
      toastSuccess(`${field.charAt(0).toUpperCase() + field.slice(1)} updated for ${count} product${count !== 1 ? "s" : ""}.`);
    } catch { toastError("Failed to update. Please try again."); }
    finally { setBulkSaving(false); }
  }

  /* ── TYPE 2: Bulk Field Edit ── */
  async function handleBulkEdit(f: BulkEditState) {
    const payload: Record<string, unknown> = { ids: [...selectedIds] };
    if (f.applyBrand)    { payload.apply_brand    = true; payload.brand    = f.brand    || null; }
    if (f.applyCategory) { payload.apply_category = true; payload.category = f.category || null; }
    if (f.applyCurrency) { payload.apply_currency = true; payload.currency = f.currency; }
    if (f.applyPrice && f.price) {
      payload.apply_price = true;
      payload.price       = f.price;
      payload.price_mode  = f.priceMode;
    }
    setBulkSaving(true);
    try {
      await adminApi.patch("/admin/products/bulk-update", payload);
      const count = selectedIds.size;
      setBulkEditOpen(false);
      setSelectedIds(new Set());
      await fetchProducts(); // refresh to get updated prices
      toastSuccess(`${count} product${count !== 1 ? "s" : ""} updated.`);
    } catch { toastError("Failed to update products. Please try again."); }
    finally { setBulkSaving(false); }
  }

  /* ── Selection helpers ── */
  const allSelected   = products.length > 0 && products.every((p) => selectedIds.has(p.id));
  const someSelected  = products.some((p) => selectedIds.has(p.id)) && !allSelected;

  function toggleAll() {
    if (allSelected) {
      setSelectedIds((prev) => { const next = new Set(prev); products.forEach((p) => next.delete(p.id)); return next; });
    } else {
      setSelectedIds((prev) => { const next = new Set(prev); products.forEach((p) => next.add(p.id)); return next; });
    }
  }

  function toggleOne(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  const withImgPct = stats ? Math.round((stats.with_images / stats.total) * 100) : 0;

  const pageNumbers = (() => {
    const pages: (number | "…")[] = [];
    if (lastPage <= 7) { for (let i = 1; i <= lastPage; i++) pages.push(i); }
    else {
      pages.push(1);
      if (page > 3) pages.push("…");
      for (let i = Math.max(2, page - 1); i <= Math.min(lastPage - 1, page + 1); i++) pages.push(i);
      if (page < lastPage - 2) pages.push("…");
      pages.push(lastPage);
    }
    return pages;
  })();

  return (
    <AdminShell>

      {/* ── Header ── */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-black">Products</h1>
          <p className="mt-0.5 text-sm text-black/40">Manage your product catalogue</p>
        </div>
        <div className="flex items-center gap-2.5">
          <button onClick={fetchProducts}
            className="flex items-center gap-1.5 rounded-lg border border-black/15 bg-white px-3 py-2.5 text-[12px] text-black/60 hover:text-black transition">
            <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />Refresh
          </button>
          <Link href="/admin/products/new"
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-black/80 transition">
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />Add Product
          </Link>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="mb-6 grid gap-3 grid-cols-2 lg:grid-cols-5">
        <div className="col-span-2 lg:col-span-1 rounded-xl border border-black/8 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <Package className="h-4 w-4 text-blue-600" strokeWidth={1.5} />
            </div>
            <span className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Total</span>
          </div>
          <p className="text-2xl font-bold text-black">
            {statsLoading ? <span className="inline-block h-7 w-16 animate-pulse rounded bg-neutral-100" /> : stats?.total.toLocaleString()}
          </p>
          <p className="mt-0.5 text-[11px] text-black/35">products</p>
        </div>
        <div className="rounded-xl border border-black/8 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
              <BarChart2 className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
            </div>
            <span className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Images</span>
          </div>
          <p className="text-2xl font-bold text-black">
            {statsLoading ? <span className="inline-block h-7 w-14 animate-pulse rounded bg-neutral-100" /> : `${withImgPct}%`}
          </p>
          <p className="mt-0.5 text-[11px] text-black/35">{stats?.with_images.toLocaleString()} with images</p>
          {!statsLoading && stats && (
            <div className="mt-2 h-1 rounded-full bg-neutral-100 overflow-hidden">
              <div className="h-full rounded-full bg-emerald-500" style={{ width: `${withImgPct}%` }} />
            </div>
          )}
        </div>
        <div className="rounded-xl border border-black/8 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
              <Layers className="h-4 w-4 text-violet-600" strokeWidth={1.5} />
            </div>
            <span className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Categories</span>
          </div>
          <p className="text-2xl font-bold text-black">
            {statsLoading ? <span className="inline-block h-7 w-10 animate-pulse rounded bg-neutral-100" /> : stats?.categories}
          </p>
          <p className="mt-0.5 text-[11px] text-black/35">unique categories</p>
        </div>
        <div className="rounded-xl border border-black/8 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-50">
              <Tag className="h-4 w-4 text-orange-500" strokeWidth={1.5} />
            </div>
            <span className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Brands</span>
          </div>
          <p className="text-2xl font-bold text-black">
            {statsLoading ? <span className="inline-block h-7 w-10 animate-pulse rounded bg-neutral-100" /> : stats?.brands}
          </p>
          <p className="mt-0.5 text-[11px] text-black/35">unique brands</p>
        </div>
        <div className="rounded-xl border border-black/8 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
              <DollarSign className="h-4 w-4 text-amber-600" strokeWidth={1.5} />
            </div>
            <span className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Avg Price</span>
          </div>
          <p className="text-2xl font-bold text-black">
            {statsLoading ? <span className="inline-block h-7 w-16 animate-pulse rounded bg-neutral-100" /> : `$${Math.round(stats?.avg_price ?? 0).toLocaleString()}`}
          </p>
          <p className="mt-0.5 text-[11px] text-black/35">average price</p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="mb-4 flex flex-wrap gap-2.5 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/30" strokeWidth={1.5} />
          <input type="text" value={searchInput} onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search title, brand, SKU…"
            className="h-9 w-full rounded-lg border border-black/15 bg-white pl-9 pr-3 text-sm text-black placeholder-black/30 outline-none focus:border-black/40" />
        </div>
        <div className="relative">
          <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}
            className="h-9 appearance-none rounded-lg border border-black/15 bg-white pl-3 pr-7 text-sm text-black outline-none focus:border-black/40">
            <option value="">All Categories</option>
            {categories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/35" strokeWidth={1.5} />
        </div>
        <div className="relative">
          <select value={brand} onChange={(e) => { setBrand(e.target.value); setPage(1); }}
            className="h-9 appearance-none rounded-lg border border-black/15 bg-white pl-3 pr-7 text-sm text-black outline-none focus:border-black/40">
            <option value="">All Brands</option>
            {brands.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/35" strokeWidth={1.5} />
        </div>
        <div className="relative">
          <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
            className="h-9 appearance-none rounded-lg border border-black/15 bg-white pl-3 pr-7 text-sm text-black outline-none focus:border-black/40">
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
            <option value="name_asc">Name A–Z</option>
          </select>
          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/35" strokeWidth={1.5} />
        </div>
        {(search || category || brand) && (
          <button onClick={() => { setSearch(""); setSearchInput(""); setCategory(""); setBrand(""); setPage(1); }}
            className="h-9 rounded-lg border border-black/15 bg-white px-3 text-sm text-black/50 hover:text-black transition">
            Clear
          </button>
        )}
        <span className="ml-auto font-jet text-[10px] uppercase tracking-[0.15em] text-black/35">
          {loading ? "Loading…" : `${total.toLocaleString()} results`}
        </span>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-xl border border-black/8 bg-white">
        <table className="w-full min-w-[940px]">
          <thead>
            <tr className="border-b border-black/8 bg-neutral-50/80">
              {/* Checkbox col */}
              <th className="w-[44px] pl-4 pr-1 py-3">
                <Checkbox checked={allSelected} indeterminate={someSelected} onChange={toggleAll} />
              </th>
              <th className="w-[52px] px-1 py-3" />
              <th className="px-3 py-3 text-left font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Product</th>
              <th className="px-3 py-3 text-left font-jet text-[9px] uppercase tracking-[0.2em] text-black/40 w-[130px]">Brand</th>
              <th className="px-3 py-3 text-left font-jet text-[9px] uppercase tracking-[0.2em] text-black/40 w-[130px]">Category</th>
              <th className="px-3 py-3 text-left font-jet text-[9px] uppercase tracking-[0.2em] text-black/40 w-[110px]">SKU</th>
              <th className="px-3 py-3 text-right font-jet text-[9px] uppercase tracking-[0.2em] text-black/40 w-[100px]">Price</th>
              <th className="px-3 py-3 text-right font-jet text-[9px] uppercase tracking-[0.2em] text-black/40 w-[120px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-black/5">
                  <td className="pl-4 pr-1 py-3"><div className="h-4.5 w-4.5 animate-pulse rounded bg-neutral-100" style={{ height: 18, width: 18 }} /></td>
                  <td className="px-1 py-3"><div className="h-11 w-11 animate-pulse rounded-lg bg-neutral-100" /></td>
                  <td className="px-3 py-3"><div className="space-y-1.5"><div className="h-3 animate-pulse rounded bg-neutral-100 w-48" /><div className="h-2.5 animate-pulse rounded bg-neutral-100 w-16" /></div></td>
                  <td className="px-3 py-3"><div className="h-5 animate-pulse rounded-full bg-neutral-100 w-20" /></td>
                  <td className="px-3 py-3"><div className="h-5 animate-pulse rounded-full bg-neutral-100 w-20" /></td>
                  <td className="px-3 py-3"><div className="h-3 animate-pulse rounded bg-neutral-100 w-16" /></td>
                  <td className="px-3 py-3 text-right"><div className="h-3 animate-pulse rounded bg-neutral-100 w-12 ml-auto" /></td>
                  <td className="px-3 py-3" />
                </tr>
              ))
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-16 text-center">
                  <Package className="mx-auto mb-3 h-10 w-10 text-black/10" strokeWidth={0.8} />
                  <p className="font-jet text-[10px] uppercase tracking-[0.2em] text-black/30">No products found</p>
                  {(search || category || brand) && (
                    <button onClick={() => { setSearch(""); setSearchInput(""); setCategory(""); setBrand(""); setPage(1); }}
                      className="mt-3 font-jet text-[10px] uppercase tracking-[0.15em] text-black underline">Clear filters</button>
                  )}
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const isSelected = selectedIds.has(p.id);
                return (
                  <tr key={p.id}
                    className={`border-b border-black/5 transition-all duration-300 group
                      ${deletedId === p.id ? "opacity-0 scale-95" : ""}
                      ${isSelected ? "bg-violet-50/60" : "hover:bg-neutral-50/70"}`}>

                    {/* Checkbox */}
                    <td className="pl-4 pr-1 py-2.5">
                      <Checkbox checked={isSelected} onChange={() => toggleOne(p.id)} />
                    </td>

                    {/* Thumbnail */}
                    <td className="px-1 py-2.5">
                      <div className="relative">
                        <ProductThumb src={p.image_url} alt={p.title} />
                        <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${p.image_url ? "bg-emerald-400" : "bg-neutral-300"}`} />
                      </div>
                    </td>

                    <td className="px-3 py-2.5">
                      <p className="line-clamp-1 text-[13px] font-medium text-black/85 group-hover:text-black transition-colors max-w-[260px]">{p.title}</p>
                      <p className="mt-0.5 font-jet text-[9px] text-black/25">#{p.id}</p>
                    </td>
                    <td className="px-3 py-2.5">
                      {p.brand
                        ? <span className="inline-block max-w-[120px] truncate rounded-full bg-neutral-100 px-2.5 py-0.5 font-jet text-[9px] uppercase tracking-[0.1em] text-black/50">{p.brand}</span>
                        : <span className="text-[12px] text-black/18">—</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      {p.category
                        ? <span className="inline-block max-w-[120px] truncate rounded-full border border-black/10 px-2.5 py-0.5 font-jet text-[9px] uppercase tracking-[0.1em] text-black/55">{p.category}</span>
                        : <span className="text-[12px] text-black/18">—</span>}
                    </td>
                    <td className="px-3 py-2.5">
                      {p.sku ? <span className="font-jet text-[10px] text-black/40">{p.sku}</span>
                             : <span className="text-[12px] text-black/18">—</span>}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="font-fraunces text-[14px] font-light text-black">{fmt(p.price, p.currency || "USD")}</span>
                      {p.currency && p.currency !== "USD" && (
                        <p className="font-jet text-[8px] text-black/25 uppercase">{p.currency}</p>
                      )}
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setPreview(p)} title="Quick preview"
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-black/10 text-black/30 transition hover:border-black/25 hover:bg-neutral-50 hover:text-black">
                          <Eye className="h-3 w-3" strokeWidth={1.4} />
                        </button>
                        <Link href={`/admin/products/${p.id}`} title="Edit product"
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-black/10 text-black/30 transition hover:border-black/25 hover:bg-neutral-50 hover:text-black">
                          <Pencil className="h-3 w-3" strokeWidth={1.4} />
                        </Link>
                        {p.product_url && (
                          <a href={p.product_url} target="_blank" rel="noopener noreferrer" title="View source"
                            className="flex h-7 w-7 items-center justify-center rounded-md border border-black/10 text-black/30 transition hover:border-black/25 hover:bg-neutral-50 hover:text-black">
                            <ExternalLink className="h-3 w-3" strokeWidth={1.4} />
                          </a>
                        )}
                        <button onClick={() => handleDelete(p.id, p.title)} disabled={deleting === p.id} title="Delete product"
                          className="flex h-7 w-7 items-center justify-center rounded-md border border-red-200/60 text-red-400 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 disabled:opacity-30">
                          {deleting === p.id
                            ? <span className="h-2.5 w-2.5 animate-spin rounded-full border border-red-300 border-t-red-500" />
                            : <Trash2 className="h-3 w-3" strokeWidth={1.4} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {lastPage > 1 && (
        <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-black/40">
            Page <span className="font-medium text-black">{page}</span> of {lastPage} · {total.toLocaleString()} products
          </p>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/15 bg-white text-black/50 disabled:opacity-30 hover:border-black/30 transition">
              <ChevronLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
            {pageNumbers.map((p, i) =>
              p === "…" ? (
                <span key={`e-${i}`} className="flex h-8 w-8 items-center justify-center font-jet text-[10px] text-black/30">…</span>
              ) : (
                <button key={p} onClick={() => setPage(p as number)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg font-jet text-[11px] transition ${page === p ? "bg-black text-white" : "border border-black/15 bg-white text-black/60 hover:border-black/30"}`}>
                  {p}
                </button>
              )
            )}
            <button onClick={() => setPage((p) => Math.min(lastPage, p + 1))} disabled={page === lastPage}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-black/15 bg-white text-black/50 disabled:opacity-30 hover:border-black/30 transition">
              <ChevronRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </button>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          FLOATING ACTION BAR — appears when rows are selected
          TYPE 1 (left): Quick actions — Set Brand, Set Category, Delete
          TYPE 2 (right): Full field edit modal button
      ══════════════════════════════════════════════════════ */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-40 -translate-x-1/2 animate-in slide-in-from-bottom-4 duration-200">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl bg-black px-4 py-3 shadow-2xl shadow-black/30">

            {/* Count */}
            <div className="flex items-center gap-2 mr-1">
              <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-white/15 px-1.5 font-jet text-[10px] font-bold text-white">
                {selectedIds.size}
              </span>
              <span className="text-[12px] text-white/60">selected</span>
            </div>

            <div className="h-5 w-px bg-white/15" />

            {/* ── TYPE 1: Quick Set Brand / Category ── */}
            {quickSet ? (
              <QuickSetPopover
                field={quickSet}
                options={quickSet === "brand" ? brands : categories}
                onApply={(val) => handleQuickSet(quickSet, val)}
                onClose={() => setQuickSet(null)}
              />
            ) : (
              <>
                <button onClick={() => setQuickSet("brand")}
                  className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 font-jet text-[10px] uppercase tracking-[0.1em] text-white/70 hover:border-white/30 hover:text-white transition">
                  <Zap className="h-3 w-3" strokeWidth={1.8} />
                  Set Brand
                </button>
                <button onClick={() => setQuickSet("category")}
                  className="flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 font-jet text-[10px] uppercase tracking-[0.1em] text-white/70 hover:border-white/30 hover:text-white transition">
                  <Zap className="h-3 w-3" strokeWidth={1.8} />
                  Set Category
                </button>

                <div className="h-5 w-px bg-white/15" />

                {/* ── TYPE 1: Bulk Delete ── */}
                <button onClick={handleBulkDelete} disabled={bulkDeleting}
                  className="flex items-center gap-1.5 rounded-lg bg-red-500 px-3 py-1.5 font-jet text-[10px] uppercase tracking-[0.1em] text-white hover:bg-red-600 disabled:opacity-50 transition">
                  {bulkDeleting
                    ? <span className="h-3 w-3 animate-spin rounded-full border border-white/30 border-t-white" />
                    : <Trash2 className="h-3 w-3" strokeWidth={2} />}
                  Delete
                </button>

                <div className="h-5 w-px bg-white/15" />

                {/* ── TYPE 2: Full Bulk Edit Modal ── */}
                <button onClick={() => setBulkEditOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg bg-violet-500 px-3 py-1.5 font-jet text-[10px] uppercase tracking-[0.1em] text-white hover:bg-violet-600 transition">
                  <Edit3 className="h-3 w-3" strokeWidth={2} />
                  Edit Fields
                </button>
              </>
            )}

            {/* Deselect all */}
            {!quickSet && (
              <button onClick={() => setSelectedIds(new Set())}
                className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg text-white/35 hover:text-white transition">
                <X className="h-3.5 w-3.5" strokeWidth={1.5} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Preview modal ── */}
      {preview && (
        <PreviewModal
          product={preview}
          onClose={() => setPreview(null)}
          onEdit={() => { setPreview(null); window.location.href = `/admin/products/${preview.id}`; }}
          onDelete={() => { const p = preview; setPreview(null); handleDelete(p.id, p.title); }}
        />
      )}

      {/* ── TYPE 2: Bulk Edit Modal ── */}
      {bulkEditOpen && (
        <BulkEditModal
          count={selectedIds.size}
          categories={categories}
          brands={brands}
          onClose={() => setBulkEditOpen(false)}
          onSubmit={handleBulkEdit}
          saving={bulkSaving}
        />
      )}

    </AdminShell>
  );
}

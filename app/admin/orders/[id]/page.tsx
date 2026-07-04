"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, Package, MapPin, User, Mail, Phone,
  Hash, Clock, Truck, Save, ExternalLink,
  CheckCircle, Circle, ChevronDown,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import adminApi from "@/lib/admin-api";
import { resolveImageUrl } from "@/lib/image-url";
import { toastSuccess, toastError } from "@/lib/swal";

interface OrderItem {
  id: number;
  product_id: number;
  title: string;
  brand: string;
  price: string;
  currency: string;
  quantity: number;
  image_url: string | null;
}

interface Order {
  id: number;
  ship_name: string;
  ship_email: string;
  ship_phone: string;
  ship_address: string;
  ship_city: string;
  ship_state: string;
  ship_zip: string;
  ship_country: string;
  status: string;
  payment_status: string;
  tracking_number: string | null;
  subtotal: string;
  shipping: string;
  total: string;
  currency: string;
  notes: string | null;
  created_at: string;
  items: OrderItem[];
  user?: { name: string; email: string } | null;
}

/* ── helpers ── */
function fmt(amount: string, currency = "USD") {
  const n = parseFloat(amount);
  if (isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(n);
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
function cap(s: string) { return s.charAt(0).toUpperCase() + s.slice(1); }

const ORDER_STEPS = ["pending", "processing", "shipped", "delivered"] as const;

const STATUS_COLORS: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700 border-yellow-200",
  processing: "bg-blue-100 text-blue-700 border-blue-200",
  shipped:    "bg-violet-100 text-violet-700 border-violet-200",
  delivered:  "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled:  "bg-red-100 text-red-600 border-red-200",
};
const PAY_COLORS: Record<string, string> = {
  paid:     "bg-emerald-100 text-emerald-700 border-emerald-200",
  unpaid:   "bg-red-100 text-red-600 border-red-200",
  refunded: "bg-orange-100 text-orange-600 border-orange-200",
};

/* ── auto-save select ── */
function AutoSelect({
  orderId, field, value, options, colors,
}: {
  orderId: number;
  field: "status" | "payment_status";
  value: string;
  options: string[];
  colors: Record<string, string>;
}) {
  const [current, setCurrent] = useState(value);
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null!);

  useEffect(() => { setCurrent(value); }, [value]);

  async function handleChange(next: string) {
    setCurrent(next);
    setSaved(false);
    clearTimeout(timerRef.current);
    setSaving(true);
    try {
      await adminApi.patch(`/admin/orders/${orderId}/status`, { [field]: next });
      setSaved(true);
      toastSuccess(field === "status" ? "Order status updated." : "Payment status updated.");
      timerRef.current = setTimeout(() => setSaved(false), 2500);
    } catch {
      setCurrent(value);
      toastError("Failed to update. Please try again.");
    } finally { setSaving(false); }
  }

  const color = colors[current] ?? "bg-neutral-100 text-black/50 border-black/10";

  return (
    <div className="relative flex items-center gap-2">
      <div className="relative flex-1">
        <select
          value={current}
          onChange={(e) => handleChange(e.target.value)}
          disabled={saving}
          className={`w-full appearance-none rounded-lg border px-3 py-2.5 pr-8 text-sm font-medium outline-none cursor-pointer transition disabled:opacity-60 ${color}`}>
          {options.map((o) => <option key={o} value={o}>{cap(o)}</option>)}
        </select>
        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 opacity-60" strokeWidth={1.8} />
      </div>
      {saving && (
        <span className="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-black/15 border-t-black/60" />
      )}
      {saved && !saving && (
        <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-500" strokeWidth={2} />
      )}
    </div>
  );
}

export default function AdminOrderDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [order,    setOrder]    = useState<Order | null>(null);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [tracking, setTracking] = useState("");
  const [savingT,  setSavingT]  = useState(false);

  useEffect(() => {
    adminApi.get(`/admin/orders/${id}`)
      .then(({ data }) => { setOrder(data); setTracking(data.tracking_number || ""); })
      .catch(() => setError("Order not found."))
      .finally(() => setLoading(false));
  }, [id]);

  async function saveTracking(e: React.FormEvent) {
    e.preventDefault();
    if (!order) return;
    setSavingT(true);
    try {
      const { data } = await adminApi.patch(`/admin/orders/${id}/status`, {
        tracking_number: tracking || null,
      });
      setOrder(data);
      toastSuccess("Tracking number saved.");
    } catch { toastError("Failed to save tracking number."); }
    finally { setSavingT(false); }
  }

  const isCancelled = order?.status === "cancelled";
  const currentStep = isCancelled ? -1 : ORDER_STEPS.indexOf(order?.status as typeof ORDER_STEPS[number]);

  return (
    <AdminShell>

      {/* ── Breadcrumb ── */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/admin/orders"
            className="flex items-center gap-1.5 rounded-lg border border-black/12 bg-white px-3 py-2 text-[12px] text-black/50 hover:text-black transition">
            <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.5} />
            Orders
          </Link>
          <span className="text-black/20">/</span>
          <span className="text-sm font-medium text-black/60">Order #{id}</span>
        </div>
        {order && (
          <div className="flex items-center gap-3">
            <span className={`rounded-full border px-3 py-1 font-jet text-[9px] uppercase tracking-[0.15em] ${STATUS_COLORS[order.status] ?? "bg-neutral-100 text-black/40 border-black/10"}`}>
              {order.status}
            </span>
            <span className={`rounded-full border px-3 py-1 font-jet text-[9px] uppercase tracking-[0.15em] ${PAY_COLORS[order.payment_status] ?? "bg-neutral-100 text-black/40 border-black/10"}`}>
              {order.payment_status}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-xl bg-neutral-100" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center text-red-600">{error}</div>
      ) : order && (
        <div className="grid gap-5 lg:grid-cols-[1fr_300px]">

          {/* ════════════════ LEFT COLUMN ════════════════ */}
          <div className="space-y-5">

            {/* ── Status timeline ── */}
            {!isCancelled && (
              <div className="rounded-xl border border-black/8 bg-white px-6 py-5">
                <p className="mb-4 font-jet text-[9px] uppercase tracking-[0.2em] text-black/35">Order Progress</p>
                <div className="relative flex items-start justify-between">
                  {/* connecting line */}
                  <div className="absolute top-4 left-0 right-0 h-px bg-black/8" />
                  <div
                    className="absolute top-4 left-0 h-px bg-black transition-all duration-500"
                    style={{ width: currentStep >= 0 ? `${(currentStep / (ORDER_STEPS.length - 1)) * 100}%` : "0%" }}
                  />
                  {ORDER_STEPS.map((step, i) => {
                    const done    = i < currentStep;
                    const current = i === currentStep;
                    return (
                      <div key={step} className="relative z-10 flex flex-col items-center gap-2 w-1/4">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full border-2 transition
                          ${done    ? "border-black bg-black text-white"
                          : current ? "border-black bg-white shadow-sm"
                          :           "border-black/15 bg-white text-black/20"}`}>
                          {done ? (
                            <CheckCircle className="h-3.5 w-3.5" strokeWidth={2.5} />
                          ) : (
                            <Circle className={`h-3 w-3 ${current ? "fill-black text-black" : ""}`} strokeWidth={2} />
                          )}
                        </div>
                        <span className={`font-jet text-[8.5px] uppercase tracking-[0.12em] text-center
                          ${current ? "font-bold text-black" : done ? "text-black/60" : "text-black/25"}`}>
                          {step}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isCancelled && (
              <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-5 py-3.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-red-100">
                  <span className="font-jet text-[10px] text-red-500">✕</span>
                </div>
                <p className="font-jet text-[10px] uppercase tracking-[0.15em] text-red-600">Order Cancelled</p>
              </div>
            )}

            {/* ── Order Items ── */}
            <div className="rounded-xl border border-black/8 bg-white">
              <div className="flex items-center justify-between border-b border-black/8 px-5 py-4">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4 text-black/30" strokeWidth={1.4} />
                  <span className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">
                    Items ({order.items.length})
                  </span>
                </div>
              </div>

              <div className="divide-y divide-black/5">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-4 px-5 py-3.5">
                    {item.image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={resolveImageUrl(item.image_url)} alt={item.title}
                        className="h-14 w-14 flex-shrink-0 rounded-lg bg-neutral-50 object-contain border border-black/6" />
                    ) : (
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                        <Package className="h-5 w-5 text-black/15" strokeWidth={1} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <Link href={`/admin/products/${item.product_id}`}
                        className="flex items-center gap-1.5 group">
                        <span className="text-[13px] font-medium text-black line-clamp-1 group-hover:underline">
                          {item.title}
                        </span>
                        <ExternalLink className="h-3 w-3 text-black/25 opacity-0 group-hover:opacity-100 flex-shrink-0 transition" strokeWidth={1.5} />
                      </Link>
                      <p className="mt-0.5 font-jet text-[9px] uppercase tracking-[0.12em] text-black/30">{item.brand}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-[14px] font-semibold text-black">{fmt(item.price, item.currency)}</p>
                      <p className="mt-0.5 font-jet text-[9px] text-black/35">× {item.quantity}</p>
                    </div>
                    <div className="w-20 flex-shrink-0 text-right">
                      <p className="text-[13px] font-medium text-black/70">
                        {fmt((parseFloat(item.price) * item.quantity).toString(), item.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-black/8 px-5 py-4 space-y-2">
                <div className="flex justify-between text-sm text-black/45">
                  <span>Subtotal</span>
                  <span>{fmt(order.subtotal, order.currency)}</span>
                </div>
                <div className="flex justify-between text-sm text-black/45">
                  <span>Shipping</span>
                  <span>{parseFloat(order.shipping) === 0 ? <span className="text-emerald-600 text-xs font-medium">Free</span> : fmt(order.shipping, order.currency)}</span>
                </div>
                <div className="flex justify-between border-t border-black/8 pt-2 text-base font-semibold text-black">
                  <span>Total</span>
                  <span>{fmt(order.total, order.currency)}</span>
                </div>
              </div>
            </div>

            {/* ── Shipping Address ── */}
            <div className="rounded-xl border border-black/8 bg-white px-5 py-4">
              <div className="mb-3 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-black/25" strokeWidth={1.4} />
                <span className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Shipping Address</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-3.5 w-3.5 text-black/25 flex-shrink-0" strokeWidth={1.4} />
                      <span className="font-medium text-black">{order.ship_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3.5 w-3.5 text-black/25 flex-shrink-0" strokeWidth={1.4} />
                      <span className="text-black/60">{order.ship_email}</span>
                    </div>
                    {order.ship_phone && (
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-3.5 w-3.5 text-black/25 flex-shrink-0" strokeWidth={1.4} />
                        <span className="text-black/60">{order.ship_phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-black/70 leading-relaxed">
                    {order.ship_address}<br />
                    {[order.ship_city, order.ship_state, order.ship_zip].filter(Boolean).join(", ")}<br />
                    {order.ship_country}
                  </p>
                </div>
              </div>
            </div>

            {/* ── Notes ── */}
            {order.notes && (
              <div className="rounded-xl border border-black/8 bg-amber-50/60 px-5 py-4">
                <p className="mb-2 font-jet text-[9px] uppercase tracking-[0.2em] text-amber-700/60">Customer Note</p>
                <p className="text-sm text-black/70 leading-relaxed italic">"{order.notes}"</p>
              </div>
            )}
          </div>

          {/* ════════════════ RIGHT COLUMN ════════════════ */}
          <div className="space-y-5">

            {/* ── Order Meta ── */}
            <div className="rounded-xl border border-black/8 bg-white divide-y divide-black/5">
              <div className="px-5 py-4">
                <p className="mb-3 font-jet text-[9px] uppercase tracking-[0.2em] text-black/35">Order Details</p>
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-black/40">
                      <Hash className="h-3.5 w-3.5" strokeWidth={1.4} />
                      <span className="text-[12px]">Order ID</span>
                    </div>
                    <span className="font-jet text-[12px] font-semibold text-black">#{order.id}</span>
                  </div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-2 text-black/40">
                      <Clock className="h-3.5 w-3.5" strokeWidth={1.4} />
                      <span className="text-[12px]">Date</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] text-black/70">{fmtDate(order.created_at)}</p>
                      <p className="font-jet text-[9px] text-black/35">{fmtTime(order.created_at)}</p>
                    </div>
                  </div>
                  {order.user && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-black/40">
                        <User className="h-3.5 w-3.5" strokeWidth={1.4} />
                        <span className="text-[12px]">Account</span>
                      </div>
                      <span className="text-[12px] text-black/70">{order.user.name}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Update Status ── */}
            <div className="rounded-xl border border-black/8 bg-white px-5 py-4">
              <p className="mb-4 font-jet text-[9px] uppercase tracking-[0.2em] text-black/35">Update Status</p>
              <div className="space-y-3.5">
                <div>
                  <label className="mb-1.5 block font-jet text-[9px] uppercase tracking-[0.15em] text-black/35">Order Status</label>
                  <AutoSelect
                    orderId={order.id}
                    field="status"
                    value={order.status}
                    options={["pending","processing","shipped","delivered","cancelled"]}
                    colors={STATUS_COLORS}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-jet text-[9px] uppercase tracking-[0.15em] text-black/35">Payment Status</label>
                  <AutoSelect
                    orderId={order.id}
                    field="payment_status"
                    value={order.payment_status}
                    options={["unpaid","paid","refunded"]}
                    colors={PAY_COLORS}
                  />
                </div>
              </div>
            </div>

            {/* ── Tracking Number ── */}
            <form onSubmit={saveTracking} className="rounded-xl border border-black/8 bg-white px-5 py-4">
              <div className="mb-3 flex items-center gap-2">
                <Truck className="h-4 w-4 text-black/25" strokeWidth={1.4} />
                <p className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/35">Tracking</p>
              </div>
              <input
                type="text"
                value={tracking}
                onChange={(e) => setTracking(e.target.value)}
                placeholder="e.g. 1Z999AA10123456784"
                className="w-full rounded-lg border border-black/15 px-3 py-2.5 text-sm text-black placeholder-black/25 outline-none focus:border-black/40 transition mb-3"
              />
              <button type="submit" disabled={savingT}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-black py-2.5 text-sm font-semibold text-white hover:bg-black/80 disabled:opacity-60 transition">
                {savingT
                  ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  : <Save className="h-3.5 w-3.5" strokeWidth={2} />
                }
                {savingT ? "Saving…" : "Save Tracking"}
              </button>
            </form>

          </div>
        </div>
      )}
    </AdminShell>
  );
}

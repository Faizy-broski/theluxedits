"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Search, ChevronLeft, ChevronRight, Eye, Package,
  Clock, DollarSign, CheckCircle, RefreshCw, ChevronDown,
  ShoppingBag, Truck, X, CalendarDays,
} from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import adminApi from "@/lib/admin-api";
import { toastError } from "@/lib/swal";

interface Order {
  id: number;
  ship_name: string;
  ship_email: string;
  ship_city: string;
  ship_country: string;
  total: string;
  currency: string;
  status: string;
  payment_status: string;
  tracking_number: string | null;
  items_count: number;
  created_at: string;
}

interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  revenue: number;
  unpaid: number;
}

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

function fmt(amount: string, currency = "USD") {
  const n = parseFloat(amount);
  if (isNaN(n)) return "—";
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

/* ── Inline status selector ── */
function StatusSelect({
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
      timerRef.current = setTimeout(() => setSaved(false), 2500);
    } catch {
      setCurrent(value); // revert
      toastError("Failed to update status.");
    } finally { setSaving(false); }
  }

  const color = colors[current] ?? "bg-neutral-100 text-black/50 border-black/10";

  return (
    <div className="relative inline-flex items-center gap-1">
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        disabled={saving}
        className={`appearance-none rounded-full border pl-2.5 pr-6 py-1 font-jet text-[9px] uppercase tracking-[0.1em] outline-none cursor-pointer transition disabled:opacity-60 ${color}`}>
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-1.5 h-2.5 w-2.5 opacity-50" strokeWidth={2} />
      {saving && (
        <span className="ml-1 h-2.5 w-2.5 animate-spin rounded-full border border-black/20 border-t-black/60 flex-shrink-0" />
      )}
      {saved && !saving && (
        <CheckCircle className="ml-1 h-3 w-3 text-emerald-500 flex-shrink-0" strokeWidth={2} />
      )}
    </div>
  );
}

export default function AdminOrdersPage() {
  const [orders,       setOrders]       = useState<Order[]>([]);
  const [stats,        setStats]        = useState<OrderStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [searchInput,  setSearchInput]  = useState("");
  const [status,       setStatus]       = useState("");
  const [payStatus,    setPayStatus]    = useState("");
  const [sort,         setSort]         = useState("newest");
  const [dateFrom,     setDateFrom]     = useState("");
  const [dateTo,       setDateTo]       = useState("");
  const [page,         setPage]         = useState(1);
  const [lastPage,     setLastPage]     = useState(1);
  const [total,        setTotal]        = useState(0);
  const searchTimeout = useRef<ReturnType<typeof setTimeout>>(null!);

  useEffect(() => {
    adminApi.get("/admin/orders/stats")
      .then(({ data }) => setStats(data))
      .catch(() => {})
      .finally(() => setStatsLoading(false));
  }, []);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, per_page: 25, sort };
      if (search)    params.search         = search;
      if (status)    params.status         = status;
      if (payStatus) params.payment_status = payStatus;
      if (dateFrom)  params.date_from      = dateFrom;
      if (dateTo)    params.date_to        = dateTo;
      const { data } = await adminApi.get("/admin/orders", { params });
      setOrders(data.data);
      setLastPage(data.last_page);
      setTotal(data.total);
    } catch { setOrders([]); }
    finally { setLoading(false); }
  }, [page, search, status, payStatus, sort, dateFrom, dateTo]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  function handleSearchChange(val: string) {
    setSearchInput(val);
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => { setSearch(val); setPage(1); }, 400);
  }

  function clearFilters() {
    setSearch(""); setSearchInput(""); setStatus(""); setPayStatus("");
    setDateFrom(""); setDateTo(""); setPage(1);
  }

  const hasFilters = search || status || payStatus || dateFrom || dateTo;

  const pageNumbers = (() => {
    const pages: (number | "…")[] = [];
    if (lastPage <= 7) {
      for (let i = 1; i <= lastPage; i++) pages.push(i);
    } else {
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
          <h1 className="text-2xl font-semibold text-black">Orders</h1>
          <p className="mt-0.5 text-sm text-black/40">Manage and track customer orders</p>
        </div>
        <button onClick={fetchOrders}
          className="flex items-center gap-1.5 self-start rounded-lg border border-black/15 bg-white px-3 py-2.5 text-[12px] text-black/60 hover:text-black transition sm:self-auto">
          <RefreshCw className="h-3.5 w-3.5" strokeWidth={1.5} />
          Refresh
        </button>
      </div>

      {/* ── Stat widgets ── */}
      <div className="mb-6 grid gap-3 grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-black/8 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
              <ShoppingBag className="h-4 w-4 text-blue-600" strokeWidth={1.5} />
            </div>
            <span className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Total Orders</span>
          </div>
          <p className="text-2xl font-bold text-black">
            {statsLoading ? <span className="inline-block h-7 w-16 animate-pulse rounded bg-neutral-100" /> : stats?.total.toLocaleString()}
          </p>
          <p className="mt-0.5 text-[11px] text-black/35">all time</p>
        </div>

        <div className="rounded-xl border border-black/8 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-50">
              <Clock className="h-4 w-4 text-yellow-600" strokeWidth={1.5} />
            </div>
            <span className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Pending</span>
          </div>
          <p className="text-2xl font-bold text-black">
            {statsLoading ? <span className="inline-block h-7 w-12 animate-pulse rounded bg-neutral-100" /> : stats?.pending.toLocaleString()}
          </p>
          <p className="mt-0.5 text-[11px] text-black/35">{stats?.processing ?? "—"} processing</p>
        </div>

        <div className="rounded-xl border border-black/8 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50">
              <DollarSign className="h-4 w-4 text-emerald-600" strokeWidth={1.5} />
            </div>
            <span className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Revenue</span>
          </div>
          <p className="text-2xl font-bold text-black">
            {statsLoading ? <span className="inline-block h-7 w-20 animate-pulse rounded bg-neutral-100" />
              : `$${Math.round(stats?.revenue ?? 0).toLocaleString()}`}
          </p>
          <p className="mt-0.5 text-[11px] text-black/35">{stats?.unpaid ?? "—"} unpaid</p>
        </div>

        <div className="rounded-xl border border-black/8 bg-white p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50">
              <CheckCircle className="h-4 w-4 text-violet-600" strokeWidth={1.5} />
            </div>
            <span className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Delivered</span>
          </div>
          <p className="text-2xl font-bold text-black">
            {statsLoading ? <span className="inline-block h-7 w-12 animate-pulse rounded bg-neutral-100" /> : stats?.delivered.toLocaleString()}
          </p>
          <p className="mt-0.5 text-[11px] text-black/35">{stats?.cancelled ?? "—"} cancelled</p>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="mb-4 space-y-2.5">
        {/* Row 1: search + status + payment + sort */}
        <div className="flex flex-wrap gap-2.5 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/30" strokeWidth={1.5} />
            <input type="text" value={searchInput} onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Name, email, order #…"
              className="h-9 w-full rounded-lg border border-black/15 bg-white pl-9 pr-3 text-sm text-black placeholder-black/30 outline-none focus:border-black/40" />
          </div>

          {/* Status filter pills */}
          <div className="flex items-center gap-1 flex-wrap">
            {["", "pending","processing","shipped","delivered","cancelled"].map((s) => (
              <button key={s || "all"} onClick={() => { setStatus(s); setPage(1); }}
                className={`h-7 rounded-full border px-3 font-jet text-[9px] uppercase tracking-[0.1em] transition
                  ${status === s
                    ? s ? `${STATUS_COLORS[s]} font-semibold` : "bg-black text-white border-black"
                    : "border-black/12 bg-white text-black/45 hover:border-black/25 hover:text-black"}`}>
                {s || "All"}
              </button>
            ))}
          </div>
        </div>

        {/* Row 2: payment + date range + sort + clear */}
        <div className="flex flex-wrap gap-2.5 items-center">
          {/* Payment filter */}
          <div className="relative">
            <select value={payStatus} onChange={(e) => { setPayStatus(e.target.value); setPage(1); }}
              className="h-9 appearance-none rounded-lg border border-black/15 bg-white pl-3 pr-7 text-sm text-black outline-none focus:border-black/40">
              <option value="">All Payments</option>
              {["paid","unpaid","refunded"].map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/35" strokeWidth={1.5} />
          </div>

          {/* Date from */}
          <div className="relative flex items-center">
            <CalendarDays className="absolute left-3 h-3.5 w-3.5 text-black/30 pointer-events-none" strokeWidth={1.5} />
            <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
              className="h-9 rounded-lg border border-black/15 bg-white pl-9 pr-3 text-sm text-black outline-none focus:border-black/40"
              title="From date" />
          </div>
          <span className="text-black/30 text-sm">→</span>
          <div className="relative flex items-center">
            <CalendarDays className="absolute left-3 h-3.5 w-3.5 text-black/30 pointer-events-none" strokeWidth={1.5} />
            <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
              className="h-9 rounded-lg border border-black/15 bg-white pl-9 pr-3 text-sm text-black outline-none focus:border-black/40"
              title="To date" />
          </div>

          {/* Sort */}
          <div className="relative">
            <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}
              className="h-9 appearance-none rounded-lg border border-black/15 bg-white pl-3 pr-7 text-sm text-black outline-none focus:border-black/40">
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="amount_desc">Amount ↓</option>
              <option value="amount_asc">Amount ↑</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/35" strokeWidth={1.5} />
          </div>

          {hasFilters && (
            <button onClick={clearFilters}
              className="flex items-center gap-1.5 h-9 rounded-lg border border-black/15 bg-white px-3 text-sm text-black/50 hover:text-black transition">
              <X className="h-3.5 w-3.5" strokeWidth={1.5} />
              Clear
            </button>
          )}

          <span className="ml-auto font-jet text-[10px] uppercase tracking-[0.15em] text-black/35">
            {loading ? "Loading…" : `${total.toLocaleString()} orders`}
          </span>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto rounded-xl border border-black/8 bg-white">
        <table className="w-full min-w-[860px]">
          <thead>
            <tr className="border-b border-black/8 bg-neutral-50/80">
              <th className="px-4 py-3 text-left font-jet text-[9px] uppercase tracking-[0.2em] text-black/40 w-[100px]">Order</th>
              <th className="px-3 py-3 text-left font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">Customer</th>
              <th className="px-3 py-3 text-left font-jet text-[9px] uppercase tracking-[0.2em] text-black/40 w-[110px]">Location</th>
              <th className="px-3 py-3 text-left font-jet text-[9px] uppercase tracking-[0.2em] text-black/40 w-[105px]">Date</th>
              <th className="px-3 py-3 text-left font-jet text-[9px] uppercase tracking-[0.2em] text-black/40 w-[130px]">Status</th>
              <th className="px-3 py-3 text-left font-jet text-[9px] uppercase tracking-[0.2em] text-black/40 w-[110px]">Payment</th>
              <th className="px-3 py-3 text-left font-jet text-[9px] uppercase tracking-[0.2em] text-black/40 w-[120px]">Tracking</th>
              <th className="px-3 py-3 text-right font-jet text-[9px] uppercase tracking-[0.2em] text-black/40 w-[90px]">Total</th>
              <th className="px-3 py-3 w-[44px]" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="border-b border-black/5">
                  <td className="px-4 py-3"><div className="h-3 animate-pulse rounded bg-neutral-100 w-12" /></td>
                  <td className="px-3 py-3"><div className="space-y-1.5"><div className="h-3 animate-pulse rounded bg-neutral-100 w-32" /><div className="h-2.5 animate-pulse rounded bg-neutral-100 w-40" /></div></td>
                  <td className="px-3 py-3"><div className="h-3 animate-pulse rounded bg-neutral-100 w-20" /></td>
                  <td className="px-3 py-3"><div className="h-3 animate-pulse rounded bg-neutral-100 w-24" /></td>
                  <td className="px-3 py-3"><div className="h-5 animate-pulse rounded-full bg-neutral-100 w-20" /></td>
                  <td className="px-3 py-3"><div className="h-5 animate-pulse rounded-full bg-neutral-100 w-16" /></td>
                  <td className="px-3 py-3"><div className="h-3 animate-pulse rounded bg-neutral-100 w-24" /></td>
                  <td className="px-3 py-3 text-right"><div className="h-3 animate-pulse rounded bg-neutral-100 w-12 ml-auto" /></td>
                  <td />
                </tr>
              ))
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-5 py-16 text-center">
                  <Package className="mx-auto mb-3 h-10 w-10 text-black/10" strokeWidth={0.8} />
                  <p className="font-jet text-[10px] uppercase tracking-[0.2em] text-black/30">No orders found</p>
                  {hasFilters && (
                    <button onClick={clearFilters}
                      className="mt-3 font-jet text-[10px] uppercase tracking-[0.15em] text-black underline">
                      Clear filters
                    </button>
                  )}
                </td>
              </tr>
            ) : (
              orders.map((o) => (
                <tr key={o.id} className="border-b border-black/5 hover:bg-neutral-50/60 transition-colors">

                  {/* Order */}
                  <td className="px-4 py-3">
                    <p className="font-jet text-[12px] font-semibold text-black">#{o.id}</p>
                    <div className="mt-0.5 flex items-center gap-1">
                      <Package className="h-2.5 w-2.5 text-black/25" strokeWidth={1.3} />
                      <span className="font-jet text-[9px] text-black/35">{o.items_count} item{o.items_count !== 1 ? "s" : ""}</span>
                    </div>
                  </td>

                  {/* Customer */}
                  <td className="px-3 py-3">
                    <p className="text-[13px] font-medium text-black/85">{o.ship_name}</p>
                    <p className="font-jet text-[9px] text-black/35 truncate max-w-[180px]">{o.ship_email}</p>
                  </td>

                  {/* Location */}
                  <td className="px-3 py-3">
                    <p className="text-[12px] text-black/65">{o.ship_city || "—"}</p>
                    {o.ship_country && <p className="font-jet text-[9px] text-black/30">{o.ship_country}</p>}
                  </td>

                  {/* Date */}
                  <td className="px-3 py-3">
                    <p className="text-[12px] text-black/65">{fmtDate(o.created_at)}</p>
                    <p className="font-jet text-[9px] text-black/30">{fmtTime(o.created_at)}</p>
                  </td>

                  {/* Status — auto-save on change */}
                  <td className="px-3 py-3">
                    <StatusSelect
                      orderId={o.id}
                      field="status"
                      value={o.status}
                      options={["pending","processing","shipped","delivered","cancelled"]}
                      colors={STATUS_COLORS}
                    />
                  </td>

                  {/* Payment — auto-save on change */}
                  <td className="px-3 py-3">
                    <StatusSelect
                      orderId={o.id}
                      field="payment_status"
                      value={o.payment_status}
                      options={["unpaid","paid","refunded"]}
                      colors={PAY_COLORS}
                    />
                  </td>

                  {/* Tracking */}
                  <td className="px-3 py-3">
                    {o.tracking_number ? (
                      <div className="flex items-center gap-1">
                        <Truck className="h-3 w-3 text-black/30 flex-shrink-0" strokeWidth={1.3} />
                        <span className="font-jet text-[9px] text-black/50 truncate max-w-[90px]">{o.tracking_number}</span>
                      </div>
                    ) : (
                      <span className="text-[12px] text-black/18">—</span>
                    )}
                  </td>

                  {/* Total */}
                  <td className="px-3 py-3 text-right">
                    <span className="font-fraunces text-[14px] font-light text-black">{fmt(o.total, o.currency)}</span>
                  </td>

                  {/* View */}
                  <td className="px-3 py-3 text-right">
                    <Link href={`/admin/orders/${o.id}`}
                      className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-black/10 text-black/30 transition hover:border-black/25 hover:bg-neutral-50 hover:text-black">
                      <Eye className="h-3 w-3" strokeWidth={1.4} />
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {lastPage > 1 && (
        <div className="mt-5 flex items-center justify-between flex-wrap gap-3">
          <p className="text-sm text-black/40">
            Page <span className="font-medium text-black">{page}</span> of {lastPage} · {total.toLocaleString()} orders
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

    </AdminShell>
  );
}

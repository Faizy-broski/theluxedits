"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Package, ShoppingCart, DollarSign, Users,
  ArrowUpRight, ArrowRight, Plus, TrendingUp,
  Clock, AlertCircle,
} from "lucide-react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import AdminShell from "@/components/admin/AdminShell";
import adminApi from "@/lib/admin-api";
import { useAdminAuth } from "@/lib/admin-auth-context";

interface DashboardData {
  stats: {
    total_products: number;
    total_orders: number;
    total_revenue: number;
    total_customers: number;
  };
  order_stats: Record<string, number>;
  recent_orders: {
    id: number;
    ship_name: string;
    ship_email: string;
    total: string;
    currency: string;
    status: string;
    payment_status: string;
    created_at: string;
  }[];
  category_stats: { category: string; total: number }[];
  revenue_by_month: { month: string; revenue: string; orders: number }[];
}

const STATUS_COLORS: Record<string, { pill: string; dot: string }> = {
  pending:    { pill: "bg-amber-100 text-amber-700",   dot: "#f59e0b" },
  processing: { pill: "bg-blue-100 text-blue-700",     dot: "#3b82f6" },
  shipped:    { pill: "bg-violet-100 text-violet-700", dot: "#8b5cf6" },
  delivered:  { pill: "bg-emerald-100 text-emerald-700", dot: "#10b981" },
  cancelled:  { pill: "bg-red-100 text-red-600",       dot: "#ef4444" },
};

function fmt(n: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
}
function fmtShort(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`;
  return `$${n}`;
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
function fmtMonth(m: string) {
  const [y, mo] = m.split("-");
  return new Date(Number(y), Number(mo) - 1, 1).toLocaleDateString("en-US", { month: "short" });
}

// Custom tooltip for area chart
function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-black/8 bg-white px-3 py-2 shadow-lg">
      <p className="font-jet text-[9px] uppercase tracking-[0.15em] text-black/40">{label}</p>
      <p className="mt-0.5 text-[15px] font-semibold text-black">{fmtShort(payload[0].value)}</p>
    </div>
  );
}

function CategoryTooltip({ active, payload }: { active?: boolean; payload?: { value: number; name: string }[] }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-black/8 bg-white px-3 py-2 shadow-lg">
      <p className="font-jet text-[9px] uppercase tracking-[0.15em] text-black/40">{payload[0].name}</p>
      <p className="mt-0.5 text-[15px] font-semibold text-black">{payload[0].value.toLocaleString()} products</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const { admin } = useAdminAuth();
  const [data, setData]       = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.get("/admin/dashboard")
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const revenueData = (data?.revenue_by_month ?? []).map((r) => ({
    month: fmtMonth(r.month),
    revenue: parseFloat(r.revenue as unknown as string),
    orders: r.orders,
  }));

  // Pad to 6 months if empty (show skeleton bars)
  const chartData = revenueData.length
    ? revenueData
    : Array.from({ length: 6 }, (_, i) => ({
        month: new Date(Date.now() - (5 - i) * 30 * 86400000).toLocaleDateString("en-US", { month: "short" }),
        revenue: 0, orders: 0,
      }));

  const orderPieData = data
    ? Object.entries(data.order_stats)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => ({ name: k, value: v, color: STATUS_COLORS[k]?.dot ?? "#999" }))
    : [];

  const totalOrdersForPie = orderPieData.reduce((a, b) => a + b.value, 0);

  const topCategories = (data?.category_stats ?? []).slice(0, 6).map((c) => ({
    name: c.category.length > 18 ? c.category.slice(0, 18) + "…" : c.category,
    fullName: c.category,
    count: c.total,
  }));

  const pendingCount = data?.order_stats?.pending ?? 0;

  return (
    <AdminShell>

      {/* ── Page header ── */}
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-jet text-[10px] uppercase tracking-[0.25em] text-black/35">{greeting}</p>
          <h1 className="mt-0.5 text-2xl font-semibold text-black">{admin?.name ?? "Admin"}</h1>
          <p className="mt-1 text-sm text-black/40">
            Here&apos;s what&apos;s happening with your store today.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <Link href="/admin/orders?status=pending"
            className="flex items-center gap-2 rounded-lg border border-black/15 bg-white px-4 py-2.5 text-[12px] font-medium text-black/70 hover:border-black hover:text-black transition">
            <ShoppingCart className="h-3.5 w-3.5" strokeWidth={1.5} />
            View Orders
          </Link>
          <Link href="/admin/products"
            className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-[12px] font-semibold text-white hover:bg-black/80 transition">
            <Plus className="h-3.5 w-3.5" strokeWidth={2} />
            Add Product
          </Link>
        </div>
      </div>

      {/* ── Alert banner (pending orders) ── */}
      {!loading && pendingCount > 0 && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-amber-200 bg-amber-50 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0" strokeWidth={1.5} />
            <p className="text-sm text-amber-800">
              You have <span className="font-semibold">{pendingCount} pending order{pendingCount > 1 ? "s" : ""}</span> waiting for action.
            </p>
          </div>
          <Link href="/admin/orders?status=pending"
            className="flex items-center gap-1 font-jet text-[10px] uppercase tracking-[0.15em] text-amber-700 hover:text-amber-900">
            Review <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      )}

      {loading ? (
        <div className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-neutral-100" />)}
          </div>
          <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
            <div className="h-72 animate-pulse rounded-xl bg-neutral-100" />
            <div className="h-72 animate-pulse rounded-xl bg-neutral-100" />
          </div>
        </div>
      ) : !data ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="font-jet text-[10px] uppercase tracking-[0.2em] text-red-500">Failed to load dashboard</p>
          <p className="mt-1 text-sm text-red-400">Please refresh the page.</p>
        </div>
      ) : (
        <>

          {/* ── Stat cards ── */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {/* Products */}
            <div className="group rounded-xl border border-black/8 bg-white p-5 transition hover:border-black/20 hover:shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <Package className="h-5 w-5 text-blue-600" strokeWidth={1.5} />
                </div>
                <Link href="/admin/products" className="flex items-center gap-1 font-jet text-[9px] uppercase tracking-[0.15em] text-black/30 hover:text-black transition">
                  View <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-black">
                {data.stats.total_products.toLocaleString()}
              </p>
              <p className="mt-1 font-jet text-[10px] uppercase tracking-[0.2em] text-black/40">Total Products</p>
              <div className="mt-3 h-px bg-black/5" />
              <p className="mt-2.5 text-[11px] text-black/35">Across all categories & brands</p>
            </div>

            {/* Orders */}
            <div className="group rounded-xl border border-black/8 bg-white p-5 transition hover:border-black/20 hover:shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50">
                  <ShoppingCart className="h-5 w-5 text-violet-600" strokeWidth={1.5} />
                </div>
                <Link href="/admin/orders" className="flex items-center gap-1 font-jet text-[9px] uppercase tracking-[0.15em] text-black/30 hover:text-black transition">
                  View <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-black">
                {data.stats.total_orders.toLocaleString()}
              </p>
              <p className="mt-1 font-jet text-[10px] uppercase tracking-[0.2em] text-black/40">Total Orders</p>
              <div className="mt-3 h-px bg-black/5" />
              <p className="mt-2.5 text-[11px] text-black/35">
                {pendingCount > 0
                  ? <span className="font-medium text-amber-600">{pendingCount} pending review</span>
                  : "All orders up to date"}
              </p>
            </div>

            {/* Revenue */}
            <div className="group rounded-xl border border-black/8 bg-white p-5 transition hover:border-black/20 hover:shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                  <DollarSign className="h-5 w-5 text-emerald-600" strokeWidth={1.5} />
                </div>
                <span className="flex items-center gap-1 font-jet text-[9px] uppercase tracking-[0.15em] text-emerald-600">
                  <TrendingUp className="h-3 w-3" strokeWidth={2} /> Paid
                </span>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-black">
                {fmtShort(data.stats.total_revenue)}
              </p>
              <p className="mt-1 font-jet text-[10px] uppercase tracking-[0.2em] text-black/40">Total Revenue</p>
              <div className="mt-3 h-px bg-black/5" />
              <p className="mt-2.5 text-[11px] text-black/35">From paid orders only</p>
            </div>

            {/* Customers */}
            <div className="group rounded-xl border border-black/8 bg-white p-5 transition hover:border-black/20 hover:shadow-sm">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
                  <Users className="h-5 w-5 text-orange-500" strokeWidth={1.5} />
                </div>
                <span className="font-jet text-[9px] uppercase tracking-[0.15em] text-black/30">Registered</span>
              </div>
              <p className="mt-4 text-3xl font-bold tracking-tight text-black">
                {data.stats.total_customers.toLocaleString()}
              </p>
              <p className="mt-1 font-jet text-[10px] uppercase tracking-[0.2em] text-black/40">Customers</p>
              <div className="mt-3 h-px bg-black/5" />
              <p className="mt-2.5 text-[11px] text-black/35">Total registered accounts</p>
            </div>

          </div>

          {/* ── Revenue chart + Order donut ── */}
          <div className="mt-5 grid gap-5 lg:grid-cols-[1fr_300px]">

            {/* Revenue area chart */}
            <div className="rounded-xl border border-black/8 bg-white p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-black">Revenue Overview</h2>
                  <p className="mt-0.5 text-[12px] text-black/40">Last 6 months · paid orders</p>
                </div>
                <Link href="/admin/orders?payment_status=paid"
                  className="flex items-center gap-1 font-jet text-[9px] uppercase tracking-[0.15em] text-black/35 hover:text-black transition">
                  Details <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#000000" stopOpacity={0.12} />
                      <stop offset="95%" stopColor="#000000" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", fill: "#00000066" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fontFamily: "JetBrains Mono, monospace", fill: "#00000066" }} axisLine={false} tickLine={false} tickFormatter={fmtShort} />
                  <Tooltip content={<RevenueTooltip />} />
                  <Area type="monotone" dataKey="revenue" stroke="#000000" strokeWidth={2} fill="url(#revGrad)" dot={false} activeDot={{ r: 4, strokeWidth: 0, fill: "#000" }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Order status donut */}
            <div className="rounded-xl border border-black/8 bg-white p-5">
              <div className="mb-4">
                <h2 className="font-semibold text-black">Order Status</h2>
                <p className="mt-0.5 text-[12px] text-black/40">{totalOrdersForPie} orders total</p>
              </div>
              {orderPieData.length > 0 ? (
                <>
                  <div className="flex justify-center">
                    <div className="relative">
                      <ResponsiveContainer width={180} height={180}>
                        <PieChart>
                          <Pie data={orderPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                            dataKey="value" paddingAngle={3} strokeWidth={0}>
                            {orderPieData.map((entry, i) => (
                              <Cell key={i} fill={entry.color} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-black">{totalOrdersForPie}</span>
                        <span className="font-jet text-[8px] uppercase tracking-[0.15em] text-black/35">orders</span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 space-y-2">
                    {orderPieData.map((d) => (
                      <div key={d.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                          <span className="font-jet text-[10px] uppercase tracking-[0.1em] text-black/60 capitalize">{d.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-semibold text-black">{d.value}</span>
                          <span className="font-jet text-[9px] text-black/30">
                            {totalOrdersForPie > 0 ? Math.round((d.value / totalOrdersForPie) * 100) : 0}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <ShoppingCart className="mb-3 h-10 w-10 text-black/10" strokeWidth={1} />
                  <p className="font-jet text-[10px] uppercase tracking-[0.2em] text-black/30">No orders yet</p>
                  <Link href="/admin/orders" className="mt-3 font-jet text-[9px] uppercase tracking-[0.15em] text-black underline">
                    Go to orders
                  </Link>
                </div>
              )}
            </div>

          </div>

          {/* ── Category chart + Recent orders ── */}
          <div className="mt-5 grid gap-5 lg:grid-cols-2">

            {/* Category bar chart */}
            <div className="rounded-xl border border-black/8 bg-white p-5">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-black">Top Categories</h2>
                  <p className="mt-0.5 text-[12px] text-black/40">Products by category</p>
                </div>
                <Link href="/admin/products"
                  className="flex items-center gap-1 font-jet text-[9px] uppercase tracking-[0.15em] text-black/35 hover:text-black transition">
                  Browse <ArrowUpRight className="h-3 w-3" />
                </Link>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topCategories} layout="vertical" margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 9, fontFamily: "JetBrains Mono, monospace", fill: "#00000055" }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="name" width={110} tick={{ fontSize: 10, fill: "#000000aa" }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CategoryTooltip />} cursor={{ fill: "#f5f5f5" }} />
                  <Bar dataKey="count" fill="#000000" radius={[0, 4, 4, 0]} maxBarSize={16} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent orders */}
            <div className="rounded-xl border border-black/8 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-black">Recent Orders</h2>
                  <p className="mt-0.5 text-[12px] text-black/40">Latest customer orders</p>
                </div>
                <Link href="/admin/orders"
                  className="flex items-center gap-1 font-jet text-[9px] uppercase tracking-[0.15em] text-black/35 hover:text-black transition">
                  All orders <ArrowRight className="h-3 w-3" />
                </Link>
              </div>

              {data.recent_orders.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Clock className="mb-3 h-10 w-10 text-black/10" strokeWidth={1} />
                  <p className="font-jet text-[10px] uppercase tracking-[0.2em] text-black/30">No orders yet</p>
                </div>
              ) : (
                <div className="space-y-0">
                  {data.recent_orders.map((order, idx) => (
                    <Link key={order.id} href={`/admin/orders/${order.id}`}
                      className={`flex items-center justify-between gap-4 py-3 transition hover:bg-neutral-50 -mx-5 px-5 ${idx !== 0 ? "border-t border-black/5" : ""}`}>
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-neutral-100 font-medium text-[11px] text-black/60">
                          {order.ship_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-[13px] font-medium text-black">{order.ship_name}</p>
                          <p className="font-jet text-[9px] text-black/30">#{order.id} · {fmtDate(order.created_at)}</p>
                        </div>
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-2.5">
                        <span className={`rounded-full px-2 py-0.5 font-jet text-[8px] uppercase tracking-[0.1em] ${STATUS_COLORS[order.status]?.pill ?? "bg-neutral-100 text-black/50"}`}>
                          {order.status}
                        </span>
                        <span className="text-[13px] font-semibold text-black min-w-[56px] text-right">
                          {fmt(parseFloat(order.total), order.currency)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* ── Quick actions ── */}
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <Link href="/admin/products"
              className="group flex items-center justify-between rounded-xl border border-black/8 bg-white p-5 transition hover:border-black/20 hover:shadow-sm">
              <div>
                <p className="font-semibold text-black">Manage Products</p>
                <p className="mt-0.5 text-[12px] text-black/40">Edit, filter, delete products</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-black/40 transition group-hover:bg-black group-hover:text-white">
                <Package className="h-4 w-4" strokeWidth={1.5} />
              </div>
            </Link>
            <Link href="/admin/orders"
              className="group flex items-center justify-between rounded-xl border border-black/8 bg-white p-5 transition hover:border-black/20 hover:shadow-sm">
              <div>
                <p className="font-semibold text-black">Process Orders</p>
                <p className="mt-0.5 text-[12px] text-black/40">Update status & tracking</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-black/40 transition group-hover:bg-black group-hover:text-white">
                <ShoppingCart className="h-4 w-4" strokeWidth={1.5} />
              </div>
            </Link>
            <Link href="/admin/websites"
              className="group flex items-center justify-between rounded-xl border border-black/8 bg-white p-5 transition hover:border-black/20 hover:shadow-sm">
              <div>
                <p className="font-semibold text-black">Source Websites</p>
                <p className="mt-0.5 text-[12px] text-black/40">Manage scraper sources</p>
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-black/40 transition group-hover:bg-black group-hover:text-white">
                <TrendingUp className="h-4 w-4" strokeWidth={1.5} />
              </div>
            </Link>
          </div>

        </>
      )}
    </AdminShell>
  );
}

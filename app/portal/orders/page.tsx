"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package } from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/homePage/Footer";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";

interface Order {
  id: number;
  status: string;
  total: string;
  currency: string;
  payment_status: string;
  ship_name: string;
  ship_city: string;
  tracking_number?: string;
  items_count: number;
  created_at: string;
}

const STATUS_COLOR: Record<string, string> = {
  pending:    "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped:    "bg-purple-100 text-purple-700",
  delivered:  "bg-green-100 text-green-700",
  cancelled:  "bg-red-100 text-red-600",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function formatPrice(amount: string, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(parseFloat(amount));
}

export default function OrdersPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    api.get("/orders")
      .then(({ data }) => setOrders(data.data || []))
      .catch(() => {})
      .finally(() => setFetching(false));
  }, [user]);

  if (loading || !user) {
    return (
      <main><Header />
        <section className="flex min-h-[60vh] items-center justify-center bg-white pt-24">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-black/20 border-t-black" />
        </section><Footer />
      </main>
    );
  }

  return (
    <main>
      <Header />
      <section className="bg-white pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="mx-auto max-w-4xl px-5 lg:px-0">
          <Link href="/portal" className="mb-8 inline-flex items-center gap-2 font-jet text-[10px] uppercase tracking-[0.3em] text-black/40 hover:text-black">
            <ArrowLeft className="h-3 w-3" strokeWidth={1.6} />
            Back to Portal
          </Link>

          <p className="mb-4 font-jet text-[10px] uppercase tracking-[0.35em] text-black/45">— My Account</p>
          <h1 className="mb-10 font-fraunces text-4xl font-light leading-none tracking-[-0.045em] sm:text-5xl">
            My <em className="italic">Orders.</em>
          </h1>

          {fetching ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 animate-pulse bg-neutral-100 rounded" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="py-24 text-center">
              <Package className="mx-auto mb-4 h-12 w-12 text-black/15" strokeWidth={1} />
              <p className="font-jet text-[10px] uppercase tracking-[0.3em] text-black/35">No orders yet</p>
              <Link href="/products" className="mt-6 inline-block font-jet text-[10px] uppercase tracking-[0.25em] text-black underline">
                Start Shopping
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  href={`/portal/orders/${order.id}`}
                  className="group flex items-center justify-between border border-black/10 p-5 transition-colors hover:border-black"
                >
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="font-jet text-[11px] uppercase tracking-[0.15em]">
                        Order #{order.id}
                      </span>
                      <span className={`rounded-full px-2.5 py-0.5 font-jet text-[9px] uppercase tracking-[0.15em] ${STATUS_COLOR[order.status] || "bg-neutral-100 text-black/50"}`}>
                        {order.status}
                      </span>
                      {order.payment_status === "paid" && (
                        <span className="rounded-full bg-green-50 px-2.5 py-0.5 font-jet text-[9px] uppercase tracking-[0.15em] text-green-600">
                          Paid
                        </span>
                      )}
                    </div>
                    <p className="mt-1.5 font-jet text-[9px] uppercase tracking-[0.15em] text-black/35">
                      {formatDate(order.created_at)} · {order.items_count} item{order.items_count !== 1 ? "s" : ""} · {order.ship_city}
                    </p>
                    {order.tracking_number && (
                      <p className="mt-1 font-jet text-[9px] uppercase tracking-[0.15em] text-black/40">
                        Tracking: {order.tracking_number}
                      </p>
                    )}
                  </div>
                  <div className="ml-4 text-right">
                    <p className="font-fraunces text-lg font-light">{formatPrice(order.total, order.currency)}</p>
                    <p className="font-jet text-[9px] uppercase tracking-[0.15em] text-black/30 group-hover:text-black">
                      View Details →
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

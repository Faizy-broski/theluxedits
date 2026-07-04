"use client";

import { useEffect, useState } from "react";
import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Package, Truck, CheckCircle, Clock, XCircle } from "lucide-react";
import Header from "@/components/shared/Header";
import Footer from "@/components/homePage/Footer";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";

interface OrderItem {
  id: number;
  product_name: string;
  product_image?: string;
  product_sku?: string;
  quantity: number;
  unit_price: string;
  total_price: string;
  currency: string;
}

interface Order {
  id: number;
  status: string;
  subtotal: string;
  shipping: string;
  total: string;
  currency: string;
  payment_status: string;
  payment_intent_id?: string;
  ship_name: string;
  ship_email: string;
  ship_phone?: string;
  ship_address: string;
  ship_city: string;
  ship_state?: string;
  ship_zip?: string;
  ship_country: string;
  tracking_number?: string;
  notes?: string;
  created_at: string;
  items: OrderItem[];
}

const TRACKING_STEPS = [
  { key: "pending",    label: "Order Placed",    icon: Clock },
  { key: "processing", label: "Processing",       icon: Package },
  { key: "shipped",    label: "Shipped",          icon: Truck },
  { key: "delivered",  label: "Delivered",        icon: CheckCircle },
];

const STATUS_ORDER = ["pending", "processing", "shipped", "delivered"];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function formatPrice(amount: string, currency = "USD") {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(parseFloat(amount));
}

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user, loading } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    api.get(`/orders/${id}`)
      .then(({ data }) => setOrder(data))
      .catch(() => router.replace("/portal/orders"))
      .finally(() => setFetching(false));
  }, [id, user, router]);

  if (loading || fetching || !order) {
    return (
      <main><Header />
        <section className="flex min-h-[60vh] items-center justify-center bg-white pt-24">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-black/20 border-t-black" />
        </section><Footer />
      </main>
    );
  }

  const currentStep = order.status === "cancelled" ? -1 : STATUS_ORDER.indexOf(order.status);

  return (
    <main>
      <Header />
      <section className="bg-white pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="mx-auto max-w-4xl px-5 lg:px-0">
          <Link href="/portal/orders" className="mb-8 inline-flex items-center gap-2 font-jet text-[10px] uppercase tracking-[0.3em] text-black/40 hover:text-black">
            <ArrowLeft className="h-3 w-3" strokeWidth={1.6} />
            All Orders
          </Link>

          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 font-jet text-[10px] uppercase tracking-[0.35em] text-black/45">— Order Detail</p>
              <h1 className="font-fraunces text-4xl font-light leading-none tracking-[-0.045em]">
                Order <em className="italic">#{order.id}</em>
              </h1>
              <p className="mt-2 font-jet text-[9px] uppercase tracking-[0.15em] text-black/35">
                Placed {formatDate(order.created_at)}
              </p>
            </div>
            {order.status === "cancelled" ? (
              <div className="flex items-center gap-2 text-red-500">
                <XCircle className="h-4 w-4" strokeWidth={1.5} />
                <span className="font-jet text-[10px] uppercase tracking-[0.2em]">Cancelled</span>
              </div>
            ) : null}
          </div>

          {/* Tracking stepper */}
          {order.status !== "cancelled" && (
            <div className="mb-10 border border-black/10 p-6">
              <p className="mb-5 font-jet text-[10px] uppercase tracking-[0.3em] text-black/45">Order Tracking</p>
              <div className="flex items-start gap-0">
                {TRACKING_STEPS.map((step, i) => {
                  const done = i <= currentStep;
                  const Icon = step.icon;
                  return (
                    <div key={step.key} className="flex flex-1 flex-col items-center">
                      <div className="flex w-full items-center">
                        {i > 0 && <div className={`h-px flex-1 transition-colors ${done ? "bg-black" : "bg-black/15"}`} />}
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${done ? "border-black bg-black text-white" : "border-black/20 text-black/25"}`}>
                          <Icon className="h-4 w-4" strokeWidth={1.5} />
                        </div>
                        {i < TRACKING_STEPS.length - 1 && <div className={`h-px flex-1 transition-colors ${i < currentStep ? "bg-black" : "bg-black/15"}`} />}
                      </div>
                      <p className={`mt-2 text-center font-jet text-[8px] uppercase tracking-[0.15em] ${done ? "text-black" : "text-black/25"}`}>
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>
              {order.tracking_number && (
                <p className="mt-5 text-center font-jet text-[10px] uppercase tracking-[0.2em] text-black/40">
                  Tracking #: <span className="text-black">{order.tracking_number}</span>
                </p>
              )}
            </div>
          )}

          <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
            {/* Items */}
            <div>
              <h2 className="mb-4 font-fraunces text-xl font-light">Items Ordered</h2>
              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b border-black/5 pb-4">
                    <div className="relative h-20 w-16 shrink-0 overflow-hidden bg-neutral-100">
                      {item.product_image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.product_image} alt={item.product_name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-black/20">
                          <Package className="h-5 w-5" strokeWidth={1} />
                        </div>
                      )}
                    </div>
                    <div className="flex flex-1 justify-between gap-3">
                      <div>
                        <p className="text-sm text-black">{item.product_name}</p>
                        {item.product_sku && (
                          <p className="font-jet text-[9px] uppercase tracking-[0.1em] text-black/35">SKU: {item.product_sku}</p>
                        )}
                        <p className="mt-1 font-jet text-[9px] uppercase tracking-[0.15em] text-black/40">
                          Qty: {item.quantity} × {formatPrice(item.unit_price, item.currency)}
                        </p>
                      </div>
                      <p className="font-fraunces text-sm text-black shrink-0">{formatPrice(item.total_price, item.currency)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary + Shipping */}
            <div className="space-y-6">
              <div className="border border-black/10 p-5">
                <h2 className="mb-4 font-fraunces text-base font-light">Order Summary</h2>
                <div className="space-y-2.5 text-sm">
                  <div className="flex justify-between"><span className="text-black/55">Subtotal</span><span>{formatPrice(order.subtotal, order.currency)}</span></div>
                  <div className="flex justify-between"><span className="text-black/55">Shipping</span><span>{parseFloat(order.shipping) === 0 ? <span className="font-jet text-[9px] uppercase tracking-[0.1em] text-black/40">Free</span> : formatPrice(order.shipping, order.currency)}</span></div>
                  <div className="flex justify-between border-t border-black/10 pt-2.5 font-medium"><span>Total</span><span className="font-fraunces text-base">{formatPrice(order.total, order.currency)}</span></div>
                </div>
              </div>

              <div className="border border-black/10 p-5">
                <h2 className="mb-3 font-fraunces text-base font-light">Shipping To</h2>
                <div className="space-y-1 font-jet text-[10px] uppercase tracking-[0.15em] text-black/55">
                  <p className="text-black">{order.ship_name}</p>
                  <p>{order.ship_address}</p>
                  <p>{order.ship_city}{order.ship_state ? `, ${order.ship_state}` : ""} {order.ship_zip}</p>
                  <p>{order.ship_country}</p>
                  <p>{order.ship_email}</p>
                  {order.ship_phone && <p>{order.ship_phone}</p>}
                </div>
              </div>

              {order.notes && (
                <div className="border border-black/10 p-5">
                  <h2 className="mb-2 font-fraunces text-base font-light">Notes</h2>
                  <p className="text-sm text-black/60">{order.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}

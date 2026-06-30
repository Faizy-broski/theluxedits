"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Lock, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/shared/Header";
import Footer from "@/components/homePage/Footer";
import { useCart } from "@/lib/cart-context";
import { useAuth } from "@/lib/auth-context";
import api from "@/lib/api";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardNumberElement,
  CardExpiryElement,
  CardCvcElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);

function fmtPrice(price: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(price);
}

interface FormData {
  fullName: string; email: string; phone: string;
  address: string; city: string; state: string; zip: string;
  country: string; notes: string;
}

const FIELD_STYLE = {
  base: {
    fontSize: "14px",
    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
    color: "#000000",
    "::placeholder": { color: "#a3a3a3" },
    iconColor: "#000000",
  },
  invalid: { color: "#ef4444", iconColor: "#ef4444" },
};

function Field({
  label, error, children,
}: {
  label: string; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block font-jet text-[10px] uppercase tracking-[0.3em] text-black/50">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 font-jet text-[9px] uppercase tracking-[0.15em] text-red-500">{error}</p>
      )}
    </div>
  );
}

// ─── Inner form rendered inside <Elements> ───────────────────────────────────
function CheckoutForm({
  form, errors, onChange, total, subtotal, shipping, clientSecret,
}: {
  form: FormData;
  errors: Partial<Record<keyof FormData, string>>;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  total: number;
  subtotal: number;
  shipping: number;
  clientSecret: string;
}) {
  const stripe   = useStripe();
  const elements = useElements();
  const router   = useRouter();
  const { items, clearCart } = useCart();
  const { user, autoLogin }  = useAuth();
  const [paying, setPaying]   = useState(false);
  const [payError, setPayError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setPaying(true);
    setPayError("");

    const cardNumber = elements.getElement(CardNumberElement);
    if (!cardNumber) { setPaying(false); return; }

    // Create payment method from card number element
    const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
      type: "card",
      card: cardNumber,
      billing_details: {
        name:  form.fullName,
        email: form.email,
        phone: form.phone || undefined,
      },
    });

    if (pmError) {
      setPayError(pmError.message || "Please check your card details.");
      setPaying(false);
      return;
    }

    // Confirm the payment intent with the card
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethod.id,
    });

    if (error) {
      setPayError(error.message || "Payment failed. Please try again.");
      setPaying(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      try {
        const { data } = await api.post("/orders", {
          ship_name:         form.fullName,
          ship_email:        form.email,
          ship_phone:        form.phone || null,
          ship_address:      form.address,
          ship_city:         form.city,
          ship_state:        form.state || null,
          ship_zip:          form.zip   || null,
          ship_country:      form.country,
          notes:             form.notes || null,
          payment_intent_id: paymentIntent.id,
          items: items.map((i) => ({
            product_id: parseInt(i.id),
            quantity:   i.quantity,
            name:       i.name,
            image:      i.image || null,
            price:      i.price,
          })),
        });
        if (data.token && data.user) autoLogin(data.user, data.token);
      } catch { /* payment succeeded — still proceed */ }

      clearCart();
      router.push("/checkout/success");
    }

    setPaying(false);
  }

  const inputClass =
    "h-11 w-full border border-black/20 bg-transparent px-3 font-jet text-sm text-black placeholder-black/30 outline-none transition-colors focus:border-black";

  const stripeBoxClass =
    "h-11 w-full border border-black/20 bg-transparent px-3 py-3 transition-colors focus-within:border-black";

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">

        {/* ── Left column: Shipping + Card ── */}
        <div className="space-y-6">

          {/* Shipping */}
          <div>
            <p className="mb-4 font-jet text-[10px] uppercase tracking-[0.35em] text-black/45">
              — Shipping Information
            </p>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Full Name" error={errors.fullName}>
                  <input
                    name="fullName" value={form.fullName} onChange={onChange}
                    placeholder="Jean Dupont"
                    className={`${inputClass} ${errors.fullName ? "border-red-400" : ""}`}
                  />
                </Field>
                <Field label="Email" error={errors.email}>
                  <input
                    name="email" type="email" value={form.email} onChange={onChange}
                    placeholder="you@example.com"
                    className={`${inputClass} ${errors.email ? "border-red-400" : ""}`}
                  />
                </Field>
              </div>

              <Field label="Phone (optional)">
                <input
                  name="phone" type="tel" value={form.phone} onChange={onChange}
                  placeholder="+1 555 000 0000" className={inputClass}
                />
              </Field>

              <Field label="Delivery Address" error={errors.address}>
                <input
                  name="address" value={form.address} onChange={onChange}
                  placeholder="123 Main St"
                  className={`${inputClass} ${errors.address ? "border-red-400" : ""}`}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="City" error={errors.city}>
                  <input
                    name="city" value={form.city} onChange={onChange}
                    placeholder="New York"
                    className={`${inputClass} ${errors.city ? "border-red-400" : ""}`}
                  />
                </Field>
                <Field label="State">
                  <input
                    name="state" value={form.state} onChange={onChange}
                    placeholder="NY" className={inputClass}
                  />
                </Field>
                <Field label="ZIP">
                  <input
                    name="zip" value={form.zip} onChange={onChange}
                    placeholder="10001" className={inputClass}
                  />
                </Field>
              </div>

              <Field label="Country">
                <select name="country" value={form.country} onChange={onChange} className={inputClass}>
                  <option value="US">United States</option>
                  <option value="GB">United Kingdom</option>
                  <option value="FR">France</option>
                  <option value="DE">Germany</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                  <option value="AE">UAE</option>
                  <option value="SA">Saudi Arabia</option>
                  <option value="PK">Pakistan</option>
                </select>
              </Field>

              <Field label="Notes (optional)">
                <textarea
                  name="notes" value={form.notes} onChange={onChange} rows={2}
                  placeholder="Special delivery instructions…"
                  className="w-full resize-none border border-black/20 bg-transparent px-3 py-2.5 font-jet text-sm text-black placeholder-black/30 outline-none transition-colors focus:border-black"
                />
              </Field>
            </div>
          </div>

          {/* Card payment */}
          <div>
            <p className="mb-4 font-jet text-[10px] uppercase tracking-[0.35em] text-black/45">
              — Payment
            </p>

            <div className="space-y-3 border border-black/10 p-5">
              {/* Card number */}
              <div>
                <p className="mb-1.5 font-jet text-[9px] uppercase tracking-[0.25em] text-black/40">
                  Card Number
                </p>
                <div className={stripeBoxClass}>
                  <CardNumberElement options={{ style: FIELD_STYLE, showIcon: true }} />
                </div>
              </div>

              {/* Expiry + CVC */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-1.5 font-jet text-[9px] uppercase tracking-[0.25em] text-black/40">
                    Expiry Date
                  </p>
                  <div className={stripeBoxClass}>
                    <CardExpiryElement options={{ style: FIELD_STYLE }} />
                  </div>
                </div>
                <div>
                  <p className="mb-1.5 font-jet text-[9px] uppercase tracking-[0.25em] text-black/40">
                    Security Code
                  </p>
                  <div className={stripeBoxClass}>
                    <CardCvcElement options={{ style: FIELD_STYLE }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {payError && (
            <div className="border border-red-300 bg-red-50 px-4 py-3 font-jet text-[10px] uppercase tracking-[0.15em] text-red-600">
              {payError}
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={paying || !stripe || !elements}
            className="h-14 w-full rounded-none bg-black text-[11px] font-semibold uppercase tracking-[0.3em] text-white hover:bg-black/80 disabled:opacity-50"
          >
            {paying ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Processing Payment…
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Lock className="h-3.5 w-3.5" strokeWidth={1.6} />
                Pay {fmtPrice(total)} — Place Order
                <ArrowRight className="h-4 w-4" strokeWidth={1.6} />
              </span>
            )}
          </Button>

          <p className="text-center font-jet text-[9px] uppercase tracking-[0.2em] text-black/30">
            Secured by Stripe · Your card is never stored
          </p>
        </div>

        {/* ── Right column: Order summary ── */}
        <div className="lg:sticky lg:top-32 lg:self-start">
          <div className="border border-black/10 p-6">
            <h2 className="mb-5 font-fraunces text-xl font-light">Order Summary</h2>

            <ul className="mb-5 max-h-72 space-y-4 overflow-y-auto pr-1">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="relative h-16 w-12 shrink-0 overflow-hidden bg-neutral-100">
                    {item.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-black/15">
                        <ShoppingBag className="h-4 w-4" strokeWidth={1} />
                      </div>
                    )}
                    <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-black text-[9px] text-white">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex flex-1 items-center justify-between gap-2">
                    <div>
                      <p className="line-clamp-2 text-xs text-black">{item.name}</p>
                      {item.brand && (
                        <p className="font-jet text-[9px] uppercase tracking-widest text-black/35">
                          {item.brand}
                        </p>
                      )}
                    </div>
                    <p className="shrink-0 font-fraunces text-sm">
                      {fmtPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="my-4 h-px bg-black/10" />

            <div className="space-y-2.5 text-sm">
              <div className="flex justify-between">
                <span className="text-black/55">Subtotal</span>
                <span>{fmtPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-black/55">Shipping</span>
                <span className="font-jet text-[10px] uppercase tracking-widest text-black/40">
                  {shipping === 0 ? "Free" : fmtPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between border-t border-black/10 pt-3 font-medium">
                <span>Total</span>
                <span className="font-fraunces text-lg">{fmtPrice(total)}</span>
              </div>
            </div>

            <div className="mt-5 space-y-1.5 border-t border-black/10 pt-4">
              <p className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/30">
                — Complimentary shipping on all orders
              </p>
              <p className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/30">
                — Secure Stripe payment
              </p>
              <p className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/30">
                — 30-day returns
              </p>
            </div>

            {user && (
              <p className="mt-4 font-jet text-[9px] uppercase tracking-[0.15em] text-black/35">
                Signed in as {user.email}
              </p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { items, cartTotal } = useCart();
  const { user } = useAuth();

  const [clientSecret, setClientSecret] = useState("");
  const [intentError, setIntentError]   = useState("");

  const [form, setForm] = useState<FormData>({
    fullName: "", email: "", phone: "",
    address: "", city: "", state: "", zip: "",
    country: "US", notes: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const shipping = 0;
  const total    = cartTotal;

  useEffect(() => {
    if (user) {
      setForm((p) => ({
        ...p,
        fullName: p.fullName || user.name  || "",
        email:    p.email    || user.email || "",
      }));
    }
  }, [user]);

  const createIntent = useCallback(async () => {
    if (!items.length) return;
    setIntentError("");
    try {
      const { data } = await api.post("/checkout/intent", {
        items: items.map((i) => ({
          product_id: parseInt(i.id),
          quantity:   i.quantity,
        })),
      });
      setClientSecret(data.client_secret);
    } catch (err: unknown) {
      const e = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const msg =
        e.response?.data?.message ||
        Object.values(e.response?.data?.errors || {}).flat()[0] ||
        "Could not connect to payment service. Make sure the server is running.";
      setIntentError(msg);
    }
  }, [items]);

  useEffect(() => { createIntent(); }, [createIntent]);

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name as keyof FormData]) {
      setErrors((p) => { const n = { ...p }; delete n[name as keyof FormData]; return n; });
    }
  }

  if (items.length === 0) {
    return (
      <main>
        <Header />
        <section className="flex min-h-[70vh] flex-col items-center justify-center bg-white px-5 pt-24 text-center">
          <p className="mb-3 font-jet text-[10px] uppercase tracking-[0.35em] text-black/35">— Checkout</p>
          <h1 className="font-fraunces text-3xl font-light tracking-[-0.04em]">Your bag is empty.</h1>
          <Link
            href="/products"
            className="mt-8 inline-flex h-12 items-center gap-2 bg-black px-8 font-jet text-[10px] uppercase tracking-[0.3em] text-white transition-colors hover:bg-black/80"
          >
            Browse Products <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
          </Link>
        </section>
        <Footer />
      </main>
    );
  }

  return (
    <main>
      <Header />

      <section className="bg-white pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="mx-auto max-w-6xl px-5 lg:px-0">
          <Link
            href="/cart"
            className="mb-8 inline-flex items-center gap-2 font-jet text-[10px] uppercase tracking-[0.3em] text-black/40 transition-colors hover:text-black"
          >
            <ArrowLeft className="h-3 w-3" strokeWidth={1.6} />
            Back to Bag
          </Link>

          <p className="mb-4 font-jet text-[10px] uppercase tracking-[0.35em] text-black/45">— Checkout</p>
          <h1 className="mb-10 font-fraunces text-4xl font-light leading-none tracking-[-0.045em] sm:text-5xl">
            Your <em className="italic">Order.</em>
          </h1>

          {intentError && (
            <div className="mb-8 flex items-start gap-3 border border-red-300 bg-red-50 px-5 py-4">
              <div className="flex-1">
                <p className="font-jet text-[10px] uppercase tracking-[0.2em] text-red-700">{intentError}</p>
              </div>
              <button
                onClick={createIntent}
                className="shrink-0 font-jet text-[9px] uppercase tracking-[0.2em] text-red-600 underline hover:text-red-800"
              >
                Retry
              </button>
            </div>
          )}

          {!clientSecret && !intentError && (
            <div className="grid gap-12 lg:grid-cols-[1fr_360px] lg:gap-16">
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-11 animate-pulse rounded bg-neutral-100" />
                ))}
                <div className="mt-4 h-32 animate-pulse rounded border border-black/10 bg-neutral-50" />
                <div className="h-14 animate-pulse rounded bg-neutral-200" />
              </div>
              <div className="h-80 animate-pulse rounded bg-neutral-100" />
            </div>
          )}

          {clientSecret && (
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "flat",
                  variables: {
                    fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
                    colorPrimary: "#000000",
                    colorBackground: "#ffffff",
                    colorText: "#000000",
                    colorDanger: "#ef4444",
                    borderRadius: "0px",
                    spacingUnit: "4px",
                  },
                },
              }}
            >
              <CheckoutForm
                form={form}
                errors={errors}
                onChange={handleChange}
                total={total}
                subtotal={cartTotal}
                shipping={shipping}
                clientSecret={clientSecret}
              />
            </Elements>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

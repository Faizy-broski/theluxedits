"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/shared/Header";
import Footer from "@/components/homePage/Footer";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setMessage("");
    setLoading(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email });
      setMessage(data.message || "Password reset link sent to your email.");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setError(axiosErr.response?.data?.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "h-11 w-full border border-black/20 bg-transparent px-3 font-sans text-sm text-black placeholder-black/30 outline-none transition-colors focus:border-black";

  return (
    <main>
      <Header />
      <section className="flex min-h-[80vh] items-center justify-center bg-white px-5 pt-24 pb-20">
        <div className="w-full max-w-sm">
          <p className="mb-4 font-jet text-[10px] uppercase tracking-[0.35em] text-black/45">— Account</p>
          <h1 className="mb-3 font-fraunces text-3xl font-light leading-none tracking-[-0.045em]">
            Reset <em className="italic">Password.</em>
          </h1>
          <p className="mb-8 font-jet text-[10px] uppercase tracking-[0.15em] text-black/40">
            Enter your email and we&apos;ll send a reset link.
          </p>

          {message && (
            <div className="mb-5 border border-green-300 bg-green-50 px-4 py-3 font-jet text-[10px] uppercase tracking-[0.15em] text-green-700">
              {message}
            </div>
          )}
          {error && (
            <div className="mb-5 border border-red-300 bg-red-50 px-4 py-3 font-jet text-[10px] uppercase tracking-[0.15em] text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div>
              <label className="mb-1.5 block font-jet text-[10px] uppercase tracking-[0.3em] text-black/50">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className={inputClass}
                required
              />
            </div>
            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-12 w-full rounded-none bg-black text-[11px] font-semibold uppercase tracking-[0.25em] text-white hover:bg-black/80 disabled:opacity-60"
            >
              {loading ? "Sending…" : (
                <>Send Reset Link <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.6} /></>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">
            Remembered it?{" "}
            <Link href="/auth/login" className="underline hover:text-black">Sign in</Link>
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}

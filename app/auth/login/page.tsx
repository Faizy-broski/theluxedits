"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/shared/Header";
import Footer from "@/components/homePage/Footer";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(form.email, form.password);
      router.push("/portal");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } };
      const msg = axiosErr.response?.data?.errors?.email?.[0]
        || axiosErr.response?.data?.message
        || "Login failed. Check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "h-11 w-full border border-black/20 bg-transparent px-3 font-sans text-sm text-black placeholder-black/30 outline-none transition-colors focus:border-black";

  return (
    <main>
      <Header />
      <section className="flex min-h-[80vh] items-center justify-center bg-white px-5 pt-24 pb-20">
        <div className="w-full max-w-sm">
          <p className="mb-4 font-jet text-[10px] uppercase tracking-[0.35em] text-black/45">— Account</p>
          <h1 className="mb-8 font-fraunces text-3xl font-light leading-none tracking-[-0.045em]">
            Sign <em className="italic">In.</em>
          </h1>

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
                value={form.email}
                onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                placeholder="you@example.com"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block font-jet text-[10px] uppercase tracking-[0.3em] text-black/50">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                className={inputClass}
                required
              />
            </div>

            <div className="flex justify-end">
              <Link href="/auth/forgot-password" className="font-jet text-[9px] uppercase tracking-[0.2em] text-black/40 hover:text-black">
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-12 w-full rounded-none bg-black text-[11px] font-semibold uppercase tracking-[0.25em] text-white hover:bg-black/80 disabled:opacity-60"
            >
              {loading ? "Signing in…" : (
                <>Sign In <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.6} /></>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">
            No account?{" "}
            <Link href="/auth/signup" className="underline hover:text-black">
              Create one
            </Link>
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}

"use client";

import { useState, useEffect, type FormEvent } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { useAdminAuth } from "@/lib/admin-auth-context";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, admin, loading } = useAdminAuth();

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && admin) router.replace("/admin/dashboard");
  }, [admin, loading, router]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/admin/dashboard");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { errors?: { email?: string[] } } } })
          ?.response?.data?.errors?.email?.[0] ||
        "Invalid credentials.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-neutral-950">
      {/* Left panel */}
      <div className="hidden w-1/2 flex-col justify-between bg-black p-12 lg:flex">
        <Image
          src="/logo/TheLuxEdits.png"
          alt="TheLuxEdits"
          width={160}
          height={40}
          className="h-8 w-auto object-contain brightness-0 invert"
        />
        <div>
          <h1 className="font-fraunces text-5xl font-light leading-tight text-white">
            Manage smarter.<br />
            <em className="italic">Sell better.</em>
          </h1>
          <p className="mt-4 text-sm text-white/45">
            Control your luxury product catalogue, orders, and inventory — all from one dashboard.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4">
            {[
              { label: "Products", desc: "Manage catalogue" },
              { label: "Orders",   desc: "Track fulfilment" },
              { label: "Revenue",  desc: "Live analytics" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/10 p-4">
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="mt-1 text-[11px] text-white/40">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-[11px] text-white/20">© {new Date().getFullYear()} TheLuxEdits. Admin Panel.</p>
      </div>

      {/* Right panel — login form */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 lg:hidden">
            <Image
              src="/logo/TheLuxEdits.png"
              alt="TheLuxEdits"
              width={140}
              height={36}
              className="h-7 w-auto object-contain brightness-0 invert"
            />
          </div>

          <h2 className="mb-1 text-2xl font-semibold text-white">Welcome back</h2>
          <p className="mb-8 text-sm text-white/40">Sign in to your admin account</p>

          {error && (
            <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 block font-jet text-[10px] uppercase tracking-[0.2em] text-white/40">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="admin@theluxedits.com"
                className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-white/30 focus:bg-white/8"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-jet text-[10px] uppercase tracking-[0.2em] text-white/40">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 pr-11 text-sm text-white placeholder-white/25 outline-none transition focus:border-white/30 focus:bg-white/8"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((p) => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-white py-3 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-60"
            >
              {submitting ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-black" />
              ) : (
                <>
                  <LogIn className="h-4 w-4" strokeWidth={1.8} />
                  Sign In
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

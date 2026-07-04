"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/shared/Header";
import Footer from "@/components/homePage/Footer";
import api from "@/lib/api";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    password: "",
    password_confirmation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = searchParams.get("token") ?? "";
  const email = searchParams.get("email") ?? "";

  useEffect(() => {
    if (!token || !email) {
      setError("Invalid or expired reset link. Please request a new one.");
    }
  }, [token, email]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (form.password !== form.password_confirmation) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/auth/reset-password", {
        token,
        email,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      setMessage(data.message || "Password reset successfully.");
      setTimeout(() => router.push("/auth/login"), 2500);
    } catch (err: unknown) {
      const axiosErr = err as {
        response?: { data?: { message?: string; errors?: Record<string, string[]> } };
      };
      const msg =
        axiosErr.response?.data?.errors?.email?.[0] ||
        axiosErr.response?.data?.message ||
        "Failed to reset password. The link may have expired.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "h-11 w-full border border-black/20 bg-transparent px-3 font-sans text-sm text-black placeholder-black/30 outline-none transition-colors focus:border-black";

  return (
    <section className="flex min-h-[80vh] items-center justify-center bg-white px-5 pt-24 pb-20">
      <div className="w-full max-w-sm">
        <p className="mb-4 font-jet text-[10px] uppercase tracking-[0.35em] text-black/45">— Account</p>
        <h1 className="mb-3 font-fraunces text-3xl font-light leading-none tracking-[-0.045em]">
          New <em className="italic">Password.</em>
        </h1>
        <p className="mb-8 font-jet text-[10px] uppercase tracking-[0.15em] text-black/40">
          Choose a new password for your account.
        </p>

        {message && (
          <div className="mb-5 border border-green-300 bg-green-50 px-4 py-3 font-jet text-[10px] uppercase tracking-[0.15em] text-green-700">
            {message} Redirecting to sign in…
          </div>
        )}
        {error && (
          <div className="mb-5 border border-red-300 bg-red-50 px-4 py-3 font-jet text-[10px] uppercase tracking-[0.15em] text-red-600">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label className="mb-1.5 block font-jet text-[10px] uppercase tracking-[0.3em] text-black/50">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={form.password}
                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                placeholder="Min. 8 characters"
                className={inputClass + " pr-10"}
                required
                disabled={!token || !email}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-jet text-[10px] uppercase tracking-[0.3em] text-black/50">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                value={form.password_confirmation}
                onChange={(e) => setForm((p) => ({ ...p, password_confirmation: e.target.value }))}
                placeholder="Repeat password"
                className={inputClass + " pr-10"}
                required
                disabled={!token || !email}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black"
                tabIndex={-1}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading || !token || !email}
            className="mt-2 h-12 w-full rounded-none bg-black text-[11px] font-semibold uppercase tracking-[0.25em] text-white hover:bg-black/80 disabled:opacity-60"
          >
            {loading ? "Saving…" : (
              <>Set New Password <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.6} /></>
            )}
          </Button>
        </form>

        <p className="mt-6 text-center font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">
          Remembered it?{" "}
          <Link href="/auth/login" className="underline hover:text-black">
            Sign in
          </Link>
        </p>
      </div>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <main>
      <Header />
      <Suspense
        fallback={
          <section className="flex min-h-[80vh] items-center justify-center bg-white px-5 pt-24 pb-20">
            <p className="font-jet text-[10px] uppercase tracking-[0.3em] text-black/40">Loading…</p>
          </section>
        }
      >
        <ResetPasswordForm />
      </Suspense>
      <Footer />
    </main>
  );
}

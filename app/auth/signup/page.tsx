"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/shared/Header";
import Footer from "@/components/homePage/Footer";
import { useAuth } from "@/lib/auth-context";

export default function SignupPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", password_confirmation: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function setField(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: "Passwords do not match" });
      return;
    }
    setLoading(true);
    try {
      await register(form);
      router.push("/portal");
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
      const apiErrors = axiosErr.response?.data?.errors;
      if (apiErrors) {
        const flat: Record<string, string> = {};
        Object.entries(apiErrors).forEach(([k, v]) => { flat[k] = v[0]; });
        setErrors(flat);
      } else {
        setErrors({ general: axiosErr.response?.data?.message || "Registration failed." });
      }
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
          <h1 className="mb-8 font-fraunces text-3xl font-light leading-none tracking-[-0.045em]">
            Create <em className="italic">Account.</em>
          </h1>

          {errors.general && (
            <div className="mb-5 border border-red-300 bg-red-50 px-4 py-3 font-jet text-[10px] uppercase tracking-[0.15em] text-red-600">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {[
              { field: "name", label: "Full Name", type: "text", placeholder: "Jean Dupont" },
              { field: "email", label: "Email", type: "email", placeholder: "you@example.com" },
              { field: "phone", label: "Phone (optional)", type: "tel", placeholder: "+1 555 000 0000" },
              { field: "password", label: "Password", type: "password", placeholder: "••••••••" },
              { field: "password_confirmation", label: "Confirm Password", type: "password", placeholder: "••••••••" },
            ].map(({ field, label, type, placeholder }) => (
              <div key={field}>
                <label className="mb-1.5 block font-jet text-[10px] uppercase tracking-[0.3em] text-black/50">{label}</label>
                <input
                  type={type}
                  value={form[field as keyof typeof form]}
                  onChange={(e) => setField(field, e.target.value)}
                  placeholder={placeholder}
                  className={`${inputClass} ${errors[field] ? "border-red-400" : ""}`}
                />
                {errors[field] && (
                  <p className="mt-1 font-jet text-[9px] uppercase tracking-[0.15em] text-red-500">{errors[field]}</p>
                )}
              </div>
            ))}

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-12 w-full rounded-none bg-black text-[11px] font-semibold uppercase tracking-[0.25em] text-white hover:bg-black/80 disabled:opacity-60"
            >
              {loading ? "Creating account…" : (
                <>Create Account <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.6} /></>
              )}
            </Button>
          </form>

          <p className="mt-6 text-center font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">
            Already have an account?{" "}
            <Link href="/auth/login" className="underline hover:text-black">Sign in</Link>
          </p>
        </div>
      </section>
      <Footer />
    </main>
  );
}

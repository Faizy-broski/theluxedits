"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import Header from "@/components/shared/Header";
import Footer from "@/components/homePage/Footer";
import { useAuth } from "@/lib/auth-context";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: "", phone: "", password: "", password_confirmation: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/auth/login");
    if (user) setForm((p) => ({ ...p, name: user.name, phone: user.phone || "" }));
  }, [user, loading, router]);

  function setField(field: string, value: string) {
    setForm((p) => ({ ...p, [field]: value }));
    if (errors[field]) setErrors((p) => { const n = { ...p }; delete n[field]; return n; });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    if (form.password && form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: "Passwords do not match" });
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, string> = { name: form.name };
      if (form.phone) payload.phone = form.phone;
      if (form.password) { payload.password = form.password; payload.password_confirmation = form.password_confirmation; }
      await updateProfile(payload);
      setSaved(true);
      setForm((p) => ({ ...p, password: "", password_confirmation: "" }));
      setTimeout(() => setSaved(false), 3000);
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { errors?: Record<string, string[]>; message?: string } } };
      const apiErrors = axiosErr.response?.data?.errors;
      if (apiErrors) {
        const flat: Record<string, string> = {};
        Object.entries(apiErrors).forEach(([k, v]) => { flat[k] = v[0]; });
        setErrors(flat);
      } else {
        setErrors({ general: axiosErr.response?.data?.message || "Update failed." });
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading || !user) {
    return (
      <main><Header />
        <section className="flex min-h-[60vh] items-center justify-center bg-white pt-24">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-black/20 border-t-black" />
        </section><Footer />
      </main>
    );
  }

  const inputClass = "h-11 w-full border border-black/20 bg-transparent px-3 font-sans text-sm text-black placeholder-black/30 outline-none transition-colors focus:border-black";

  return (
    <main>
      <Header />
      <section className="bg-white pt-24 pb-20 md:pt-32 md:pb-28">
        <div className="mx-auto max-w-lg px-5 lg:px-0">
          <Link href="/portal" className="mb-8 inline-flex items-center gap-2 font-jet text-[10px] uppercase tracking-[0.3em] text-black/40 hover:text-black">
            <ArrowLeft className="h-3 w-3" strokeWidth={1.6} />
            Back to Portal
          </Link>

          <p className="mb-4 font-jet text-[10px] uppercase tracking-[0.35em] text-black/45">— My Account</p>
          <h1 className="mb-8 font-fraunces text-4xl font-light leading-none tracking-[-0.045em] sm:text-5xl">
            Edit <em className="italic">Profile.</em>
          </h1>

          {errors.general && (
            <div className="mb-5 border border-red-300 bg-red-50 px-4 py-3 font-jet text-[10px] uppercase tracking-[0.15em] text-red-600">
              {errors.general}
            </div>
          )}

          {saved && (
            <div className="mb-5 flex items-center gap-2 border border-green-300 bg-green-50 px-4 py-3 font-jet text-[10px] uppercase tracking-[0.15em] text-green-700">
              <Check className="h-3.5 w-3.5" strokeWidth={2} />
              Profile updated successfully
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="mb-1.5 block font-jet text-[10px] uppercase tracking-[0.3em] text-black/50">Email</label>
              <input type="email" value={user.email} disabled className={`${inputClass} cursor-not-allowed opacity-40`} />
              <p className="mt-1 font-jet text-[9px] uppercase tracking-[0.15em] text-black/30">Email cannot be changed</p>
            </div>

            {[
              { field: "name", label: "Full Name", type: "text", placeholder: "Jean Dupont" },
              { field: "phone", label: "Phone", type: "tel", placeholder: "+1 555 000 0000" },
            ].map(({ field, label, type, placeholder }) => (
              <div key={field}>
                <label className="mb-1.5 block font-jet text-[10px] uppercase tracking-[0.3em] text-black/50">{label}</label>
                <input type={type} value={form[field as keyof typeof form]} onChange={(e) => setField(field, e.target.value)} placeholder={placeholder} className={`${inputClass} ${errors[field] ? "border-red-400" : ""}`} />
                {errors[field] && <p className="mt-1 font-jet text-[9px] uppercase tracking-[0.15em] text-red-500">{errors[field]}</p>}
              </div>
            ))}

            <div className="border-t border-black/10 pt-5">
              <p className="mb-4 font-jet text-[10px] uppercase tracking-[0.3em] text-black/45">Change Password</p>
              {[
                { field: "password", label: "New Password", placeholder: "Leave blank to keep current" },
                { field: "password_confirmation", label: "Confirm New Password", placeholder: "••••••••" },
              ].map(({ field, label, placeholder }) => (
                <div key={field} className="mb-4">
                  <label className="mb-1.5 block font-jet text-[10px] uppercase tracking-[0.3em] text-black/50">{label}</label>
                  <input type="password" value={form[field as keyof typeof form]} onChange={(e) => setField(field, e.target.value)} placeholder={placeholder} className={`${inputClass} ${errors[field] ? "border-red-400" : ""}`} />
                  {errors[field] && <p className="mt-1 font-jet text-[9px] uppercase tracking-[0.15em] text-red-500">{errors[field]}</p>}
                </div>
              ))}
            </div>

            <Button
              type="submit"
              disabled={saving}
              className="h-12 w-full rounded-none bg-black text-[11px] font-semibold uppercase tracking-[0.25em] text-white hover:bg-black/80 disabled:opacity-60 sm:h-14"
            >
              {saving ? "Saving…" : (
                <>{saved ? <><Check className="mr-2 h-4 w-4" strokeWidth={1.8} />Saved</> : <>Save Changes <ArrowRight className="ml-2 h-4 w-4" strokeWidth={1.6} /></>}</>
              )}
            </Button>
          </form>
        </div>
      </section>
      <Footer />
    </main>
  );
}

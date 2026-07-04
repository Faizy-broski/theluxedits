"use client";

import { useState, useEffect, type FormEvent, type ReactNode } from "react";
import { Save, User, Mail, CreditCard, Eye, EyeOff } from "lucide-react";
import AdminShell from "@/components/admin/AdminShell";
import adminApi from "@/lib/admin-api";
import { useAdminAuth } from "@/lib/admin-auth-context";
import { toastSuccess, toastError } from "@/lib/swal";

type Tab = "profile" | "smtp" | "stripe";

function FieldRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block font-jet text-[9px] uppercase tracking-[0.2em] text-black/40">{label}</label>
      {children}
    </div>
  );
}

function Input({ type = "text", value, onChange, placeholder, className = "" }: {
  type?: string; value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  return (
    <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className={`w-full rounded-lg border border-black/15 px-4 py-2.5 text-sm text-black placeholder-black/25 outline-none focus:border-black/40 transition ${className}`} />
  );
}

function PasswordInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input type={show ? "text" : "password"} value={value} onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-black/15 px-4 py-2.5 pr-10 text-sm text-black placeholder-black/25 outline-none focus:border-black/40 transition" />
      <button type="button" onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-black/30 hover:text-black transition">
        {show ? <EyeOff className="h-4 w-4" strokeWidth={1.4} /> : <Eye className="h-4 w-4" strokeWidth={1.4} />}
      </button>
    </div>
  );
}

export default function AdminSettingsPage() {
  const { admin, updateAdmin } = useAdminAuth();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // ── Profile ──
  const [profile, setProfile] = useState({ name: "", password: "", password_confirmation: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  useEffect(() => {
    if (admin) setProfile((f) => ({ ...f, name: admin.name }));
  }, [admin]);

  async function saveProfile(e: FormEvent) {
    e.preventDefault();
    if (profile.password && profile.password !== profile.password_confirmation) {
      toastError("Passwords do not match.");
      return;
    }
    setProfileSaving(true);
    try {
      const payload: Record<string, string> = { name: profile.name };
      if (profile.password) {
        payload.password = profile.password;
        payload.password_confirmation = profile.password_confirmation;
      }
      const { data } = await adminApi.put("/admin/profile", payload);
      updateAdmin(data);
      setProfile((f) => ({ ...f, password: "", password_confirmation: "" }));
      toastSuccess("Profile updated successfully.");
    } catch { toastError("Failed to update profile."); }
    finally { setProfileSaving(false); }
  }

  // ── SMTP ──
  const [smtp, setSmtp] = useState({
    host: "", port: "587", username: "", password: "",
    from_email: "", from_name: "", encryption: "tls",
  });
  const [smtpLoaded, setSmtpLoaded] = useState(false);
  const [smtpSaving, setSmtpSaving] = useState(false);

  // ── Stripe ──
  const [stripe, setStripe] = useState({
    publishable_key: "", secret_key: "", webhook_secret: "", currency: "USD", mode: "test",
  });
  const [stripeLoaded, setStripeLoaded] = useState(false);
  const [stripeSaving, setStripeSaving] = useState(false);

  useEffect(() => {
    adminApi.get("/admin/settings").then(({ data }) => {
      setSmtp((s) => ({ ...s, ...data.smtp }));
      setStripe((s) => ({ ...s, ...data.stripe }));
      setSmtpLoaded(true);
      setStripeLoaded(true);
    }).catch(() => { setSmtpLoaded(true); setStripeLoaded(true); });
  }, []);

  async function saveSmtp(e: FormEvent) {
    e.preventDefault();
    setSmtpSaving(true);
    try {
      await adminApi.put("/admin/settings/smtp", smtp);
      toastSuccess("SMTP settings saved.");
    } catch { toastError("Failed to save SMTP settings."); }
    finally { setSmtpSaving(false); }
  }

  async function saveStripe(e: FormEvent) {
    e.preventDefault();
    setStripeSaving(true);
    try {
      await adminApi.put("/admin/settings/stripe", stripe);
      toastSuccess("Stripe settings saved.");
    } catch { toastError("Failed to save Stripe settings."); }
    finally { setStripeSaving(false); }
  }

  const tabs: { id: Tab; label: string; icon: ReactNode }[] = [
    { id: "profile", label: "Profile",  icon: <User className="h-4 w-4" strokeWidth={1.4} /> },
    { id: "smtp",    label: "Email / SMTP", icon: <Mail className="h-4 w-4" strokeWidth={1.4} /> },
    { id: "stripe",  label: "Stripe",   icon: <CreditCard className="h-4 w-4" strokeWidth={1.4} /> },
  ];

  return (
    <AdminShell>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-black">Settings</h1>
        <p className="mt-0.5 text-sm text-black/40">Manage admin profile and application configuration</p>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">

        {/* ── Sidebar tabs ── */}
        <div className="flex gap-1 lg:w-52 lg:flex-col lg:gap-0.5">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={`flex flex-1 items-center gap-2.5 rounded-lg px-4 py-2.5 text-left text-[13px] transition lg:flex-none
                ${activeTab === t.id ? "bg-black text-white" : "text-black/50 hover:bg-neutral-100 hover:text-black"}`}>
              {t.icon}
              <span className="hidden sm:inline lg:inline">{t.label}</span>
            </button>
          ))}
        </div>

        {/* ── Content panel ── */}
        <div className="flex-1 max-w-xl">

          {/* ── Profile tab ── */}
          {activeTab === "profile" && (
            <div className="rounded-xl border border-black/8 bg-white p-6">
              <div className="mb-6 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-xl font-bold text-black/30">
                  {admin?.name?.charAt(0)?.toUpperCase() || "A"}
                </div>
                <div>
                  <p className="font-semibold text-black">{admin?.name}</p>
                  <p className="text-sm text-black/40">{admin?.email}</p>
                </div>
              </div>

              <form onSubmit={saveProfile} className="space-y-4">
                <FieldRow label="Display Name">
                  <Input value={profile.name} onChange={(v) => setProfile((f) => ({ ...f, name: v }))} />
                </FieldRow>

                <div className="border-t border-black/8 pt-4">
                  <p className="mb-3 font-jet text-[9px] uppercase tracking-[0.2em] text-black/30">
                    Change Password — leave blank to keep current
                  </p>
                  <div className="space-y-3">
                    <FieldRow label="New Password">
                      <PasswordInput value={profile.password} onChange={(v) => setProfile((f) => ({ ...f, password: v }))} placeholder="••••••••" />
                    </FieldRow>
                    <FieldRow label="Confirm Password">
                      <PasswordInput value={profile.password_confirmation} onChange={(v) => setProfile((f) => ({ ...f, password_confirmation: v }))} placeholder="••••••••" />
                    </FieldRow>
                  </div>
                </div>

                <button type="submit" disabled={profileSaving}
                  className="flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-black/80 disabled:opacity-60 transition">
                  {profileSaving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    : <Save className="h-4 w-4" strokeWidth={1.8} />}
                  Save Profile
                </button>
              </form>
            </div>
          )}

          {/* ── SMTP tab ── */}
          {activeTab === "smtp" && (
            <div className="rounded-xl border border-black/8 bg-white p-6">
              <div className="mb-5">
                <h2 className="font-semibold text-black">Email / SMTP</h2>
                <p className="mt-1 text-sm text-black/40">Configure outgoing email for order confirmations and notifications.</p>
              </div>

              {!smtpLoaded ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-neutral-100" />)}
                </div>
              ) : (
                <form onSubmit={saveSmtp} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldRow label="SMTP Host">
                      <Input value={smtp.host} onChange={(v) => setSmtp((s) => ({ ...s, host: v }))} placeholder="smtp.gmail.com" />
                    </FieldRow>
                    <FieldRow label="Port">
                      <Input value={smtp.port} onChange={(v) => setSmtp((s) => ({ ...s, port: v }))} placeholder="587" />
                    </FieldRow>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldRow label="Username / Email">
                      <Input value={smtp.username} onChange={(v) => setSmtp((s) => ({ ...s, username: v }))} placeholder="you@gmail.com" />
                    </FieldRow>
                    <FieldRow label="Password / App Password">
                      <PasswordInput value={smtp.password} onChange={(v) => setSmtp((s) => ({ ...s, password: v }))} placeholder="••••••••" />
                    </FieldRow>
                  </div>

                  <FieldRow label="Encryption">
                    <select value={smtp.encryption} onChange={(e) => setSmtp((s) => ({ ...s, encryption: e.target.value }))}
                      className="w-full rounded-lg border border-black/15 px-4 py-2.5 text-sm text-black outline-none focus:border-black/40 transition">
                      <option value="tls">TLS (recommended)</option>
                      <option value="ssl">SSL</option>
                      <option value="none">None</option>
                    </select>
                  </FieldRow>

                  <div className="border-t border-black/8 pt-4">
                    <p className="mb-3 font-jet text-[9px] uppercase tracking-[0.2em] text-black/30">From Address</p>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <FieldRow label="From Email">
                        <Input value={smtp.from_email} onChange={(v) => setSmtp((s) => ({ ...s, from_email: v }))} placeholder="noreply@theluxedits.com" />
                      </FieldRow>
                      <FieldRow label="From Name">
                        <Input value={smtp.from_name} onChange={(v) => setSmtp((s) => ({ ...s, from_name: v }))} placeholder="TheLuxEdits" />
                      </FieldRow>
                    </div>
                  </div>

                  <button type="submit" disabled={smtpSaving}
                    className="flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-black/80 disabled:opacity-60 transition">
                    {smtpSaving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      : <Save className="h-4 w-4" strokeWidth={1.8} />}
                    Save SMTP Settings
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ── Stripe tab ── */}
          {activeTab === "stripe" && (
            <div className="rounded-xl border border-black/8 bg-white p-6">
              <div className="mb-5">
                <h2 className="font-semibold text-black">Stripe / Payments</h2>
                <p className="mt-1 text-sm text-black/40">Configure Stripe keys for payment processing.</p>
              </div>

              {!stripeLoaded ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-neutral-100" />)}
                </div>
              ) : (
                <form onSubmit={saveStripe} className="space-y-4">
                  <FieldRow label="Mode">
                    <div className="flex gap-2">
                      {(["test", "live"] as const).map((m) => (
                        <button key={m} type="button" onClick={() => setStripe((s) => ({ ...s, mode: m }))}
                          className={`flex-1 rounded-lg border py-2.5 text-sm font-medium transition capitalize
                            ${stripe.mode === m ? "border-black bg-black text-white" : "border-black/15 text-black/50 hover:border-black/30 hover:text-black"}`}>
                          {m}
                        </button>
                      ))}
                    </div>
                    {stripe.mode === "live" && (
                      <p className="mt-1.5 font-jet text-[9px] text-red-500">Live mode — real charges will be made</p>
                    )}
                  </FieldRow>

                  <FieldRow label="Publishable Key">
                    <Input value={stripe.publishable_key} onChange={(v) => setStripe((s) => ({ ...s, publishable_key: v }))}
                      placeholder={stripe.mode === "test" ? "pk_test_…" : "pk_live_…"} />
                  </FieldRow>

                  <FieldRow label="Secret Key">
                    <PasswordInput value={stripe.secret_key} onChange={(v) => setStripe((s) => ({ ...s, secret_key: v }))}
                      placeholder={stripe.mode === "test" ? "sk_test_…" : "sk_live_…"} />
                  </FieldRow>

                  <FieldRow label="Webhook Secret">
                    <PasswordInput value={stripe.webhook_secret} onChange={(v) => setStripe((s) => ({ ...s, webhook_secret: v }))}
                      placeholder="whsec_…" />
                  </FieldRow>

                  <FieldRow label="Default Currency">
                    <select value={stripe.currency} onChange={(e) => setStripe((s) => ({ ...s, currency: e.target.value }))}
                      className="w-full rounded-lg border border-black/15 px-4 py-2.5 text-sm text-black outline-none focus:border-black/40 transition">
                      {["USD", "EUR", "GBP", "SAR", "AED", "CHF"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </FieldRow>

                  <button type="submit" disabled={stripeSaving}
                    className="flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-black/80 disabled:opacity-60 transition">
                    {stripeSaving ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      : <Save className="h-4 w-4" strokeWidth={1.8} />}
                    Save Stripe Settings
                  </button>
                </form>
              )}
            </div>
          )}

        </div>
      </div>
    </AdminShell>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  AlertCircle,
  FileText,
  ShoppingBag,
  BarChart3,
  Boxes,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthShell } from "@/components/dashboard/Auth/AuthShell";
import { TestimonialCarousel } from "@/components/dashboard/Auth/testimonial-carousel";
import { login } from "@/lib/actions/login/actions";

const FEATURE_CHIPS = [
  { icon: FileText, label: "Orders" },
  { icon: ShoppingBag, label: "Products" },
  { icon: BarChart3, label: "Analytics" },
];

export function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setErrors({});

    startTransition(async () => {
      const result = await login({ email, password, remember });
      if (result.success) {
        router.push("/dashboard");
      } else if (result.errors) {
        setErrors(result.errors);
      } else {
        setFormError(result.message ?? "Something went wrong. Please try again.");
      }
    });
  }

  const left = (
    <>
      <span className="font-against text-[26px] tracking-wide text-[#F7F3EA]">TheLuxEdits</span>

      <div className="my-auto max-w-sm py-14">
        <h1 className="font-fraunces text-[34px] font-light leading-[1.15] text-[#F7F3EA]">
          Manage smarter.
          <br />
          Sell better.
        </h1>
        <p className="mt-4 text-[14.5px] leading-relaxed text-[#C9CFC7]">
          Control your luxury product catalogue, orders, pricing, and
          inventory — all from one powerful dashboard.
        </p>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {FEATURE_CHIPS.map(({ icon: Icon, label }) => (
            <div
              key={label}
              className="rounded-lg border border-white/10 bg-white/[0.04] px-3 py-4 text-center"
            >
              <Icon className="mx-auto mb-1.5 h-4 w-4 text-[#B08D57]" />
              <p className="font-jet text-[10px] uppercase tracking-wider text-[#C9CFC7]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <TestimonialCarousel />
    </>
  );

  const right = (
    <>
      <span className="font-against mb-8 block text-[22px] tracking-wide text-[#0E1B16] lg:hidden">
        TheLuxEdits
      </span>

      <p className="font-jet mb-1 text-[11px] uppercase tracking-[0.2em] text-[#B08D57]">
        Welcome back
      </p>
      <h2 className="font-fraunces text-[26px] font-normal text-[#26302B]">Sign in</h2>
      <p className="mt-2 text-sm text-[#6B7568]">
        Sign in to your TheLuxEdits admin account to continue.
      </p>

      {formError && (
        <div className="mt-5 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {formError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-7 space-y-5">
        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="font-jet text-[11px] uppercase tracking-wider text-[#6B7568]"
          >
            Email Address
          </label>
          <div
            className={cn(
              "flex items-center gap-2.5 rounded-lg border bg-white px-3.5 py-2.5 transition-colors focus-within:border-[#B08D57] focus-within:ring-1 focus-within:ring-[#B08D57]",
              errors.email ? "border-red-400" : "border-[#E1DBCB]"
            )}
          >
            <Mail className="h-4 w-4 shrink-0 text-[#9A8F76]" />
            <input
              id="email"
              type="email"
              autoFocus
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-sm text-[#26302B] outline-none placeholder:text-[#B4AC98]"
            />
          </div>
          {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="password"
              className="font-jet text-[11px] uppercase tracking-wider text-[#6B7568]"
            >
              Password
            </label>
            <a href="/admin/forgot-password" className="text-xs text-[#6B7568] hover:text-[#B08D57]">
              Forgot password?
            </a>
          </div>
          <div
            className={cn(
              "flex items-center gap-2.5 rounded-lg border bg-white px-3.5 py-2.5 transition-colors focus-within:border-[#B08D57] focus-within:ring-1 focus-within:ring-[#B08D57]",
              errors.password ? "border-red-400" : "border-[#E1DBCB]"
            )}
          >
            <Lock className="h-4 w-4 shrink-0 text-[#9A8F76]" />
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent text-sm text-[#26302B] outline-none placeholder:text-[#B4AC98]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="shrink-0 text-[#9A8F76] hover:text-[#26302B]"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-sm text-[#6B7568]">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-[#D6CFB8] text-[#B08D57] accent-[#B08D57]"
          />
          Keep me signed in
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0E1B16] py-3 text-sm font-medium text-[#F7F3EA] transition-colors hover:bg-[#16281F] disabled:opacity-70"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <div className="my-7 flex items-center gap-3">
        <div className="h-px flex-1 bg-[#E1DBCB]" />
        <p className="font-jet text-[10px] uppercase tracking-wider text-[#B4AC98]">
          Dashboard features
        </p>
        <div className="h-px flex-1 bg-[#E1DBCB]" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        {[
          { icon: FileText, label: "Orders" },
          { icon: BarChart3, label: "Analytics" },
          { icon: Boxes, label: "Inventory" },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="rounded-lg border border-dashed border-[#D6CFB8] px-2 py-3 text-center"
          >
            <Icon className="mx-auto mb-1 h-4 w-4 text-[#8C9A8F]" />
            <p className="text-[11px] text-[#6B7568]">{label}</p>
          </div>
        ))}
      </div>
    </>
  );

  return <AuthShell left={left} right={right} />;
}
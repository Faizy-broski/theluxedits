"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, ShieldCheck, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthShell } from "@/components/dashboard/Auth/AuthShell";
import { AuthBrandHeader } from "@/components/dashboard/Auth/auth-brand-header";
import { TestimonialCarousel } from "@/components/dashboard/Auth/testimonial-carousel";
import { PasswordInput } from "@/components/dashboard/Settings/password-input";
import { resetPassword } from "@/lib/actions/reset-password/actions";

const TESTIMONIALS = [
  {
    quote: "Managing our luxury catalogue has never been easier. Every product, every order — all in one view.",
    role: "Boutique Owner",
  },
  {
    quote: "The order dashboard alone saved us hours every week. Absolutely worth it.",
    role: "Online Retailer",
  },
  {
    quote: "Everything is manageable and easy to understand. Highly recommended!",
    role: "Product Analyst",
  },
];

const REQUIREMENTS = [
  "At least 8 characters long",
  "Mix of letters, numbers & symbols",
  "Avoid using your email or name",
];

interface ResetPasswordScreenProps {
  token: string;
  email: string;
}

export function ResetPasswordScreen({ token, email: initialEmail }: ResetPasswordScreenProps) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string; token?: string }>({});
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    startTransition(async () => {
      const result = await resetPassword({
        token,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });
      if (result.success) {
        router.push("/login?reset=success");
      } else if (result.errors) {
        setErrors(result.errors);
      }
    });
  }

  const left = (
    <>
      <AuthBrandHeader />

      <div className="my-auto max-w-sm py-14">
        <h1 className="font-fraunces text-[32px] font-light leading-[1.15] text-[#F7F3EA]">
          Set a new password
          <br />
          and get back in.
        </h1>
        <p className="mt-4 text-[14.5px] leading-relaxed text-[#C9CFC7]">
          Choose a strong password to keep your TheLuxEdits account and all
          your data secure.
        </p>

        <div className="mt-7 space-y-2.5">
          {REQUIREMENTS.map((req) => (
            <div key={req} className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-[#B08D57]" />
              <p className="text-[13px] text-[#C9CFC7]">{req}</p>
            </div>
          ))}
        </div>
      </div>

      <TestimonialCarousel testimonials={TESTIMONIALS} />
    </>
  );

  const right = (
    <>
      <span className="font-against mb-8 block text-[22px] tracking-wide text-[#0E1B16] lg:hidden">
        TheLuxEdits
      </span>

      <p className="font-jet mb-1 text-[11px] uppercase tracking-[0.2em] text-[#B08D57]">
        Account recovery
      </p>
      <h2 className="font-fraunces text-[26px] font-normal text-[#26302B]">Create new password</h2>
      <p className="mt-2 text-sm text-[#6B7568]">
        Your new password must be different from your previously used
        passwords.
      </p>

      {errors.token && (
        <div className="mt-5 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {errors.token}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
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
              required
              placeholder="Your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-sm text-[#26302B] outline-none placeholder:text-[#B4AC98]"
            />
          </div>
          {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password"
            className="font-jet text-[11px] uppercase tracking-wider text-[#6B7568]"
          >
            New Password
          </label>
          <PasswordInput
            id="password"
            value={password}
            onChange={setPassword}
            placeholder="Enter new password"
            ariaInvalid={Boolean(errors.password)}
          />
          {errors.password && <p className="text-xs text-red-600">{errors.password}</p>}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="password_confirmation"
            className="font-jet text-[11px] uppercase tracking-wider text-[#6B7568]"
          >
            Confirm New Password
          </label>
          <PasswordInput
            id="password_confirmation"
            value={passwordConfirmation}
            onChange={setPasswordConfirmation}
            placeholder="Re-enter new password"
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#0E1B16] py-3 text-sm font-medium text-[#F7F3EA] transition-colors hover:bg-[#16281F] disabled:opacity-70"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              Reset Password
              <ShieldCheck className="h-4 w-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[#6B7568]">
        Remember your password?{" "}
        <Link href="/admin/login" className="font-semibold text-[#B08D57] underline underline-offset-2">
          Back to Sign In
        </Link>
      </p>
    </>
  );

  return <AuthShell left={left} right={right} />;
}
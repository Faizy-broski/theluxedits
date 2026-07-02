"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import {
  Mail,
  Send,
  Loader2,
  AlertCircle,
  Info,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AuthShell } from "@/components/dashboard/Auth/AuthShell";
import { AuthBrandHeader } from "@/components/dashboard/Auth/auth-brand-header";
import { TestimonialCarousel } from "@/components/dashboard/Auth/testimonial-carousel";
import { sendResetLink } from "@/lib/actions/forgot-password/actions";

const TESTIMONIALS = [
  { quote: "Secure and easy to use. I never worry about my data anymore.", role: "eCommerce Manager" },
  { quote: "The platform is rock-solid. Support team is incredibly responsive.", role: "Online Retailer" },
  { quote: "Everything is manageable and easy to understand. Highly recommended!", role: "Product Analyst" },
];

export function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    startTransition(async () => {
      const result = await sendResetLink(email);
      if (result.success) {
        setStatus(result.message ?? "We've emailed your password reset link.");
      } else {
        setError(result.errors?.email ?? "Something went wrong. Please try again.");
      }
    });
  }

  const left = (
    <>
      <AuthBrandHeader />

      <div className="my-auto max-w-sm py-14">
        <h1 className="font-fraunces text-[32px] font-light leading-[1.15] text-[#F7F3EA]">
          Account recovery
          <br />
          made simple.
        </h1>
        <p className="mt-4 text-[14.5px] leading-relaxed text-[#C9CFC7]">
          We&apos;ll send a secure reset link to your registered email
          address so you can get back to managing your products.
        </p>

        <div className="mt-7 flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#B08D57]" />
          <div>
            <p className="text-[13px] font-medium text-[#F7F3EA]">Secure Reset Process</p>
            <p className="mt-1 text-[12px] leading-relaxed text-[#9FB3A4]">
              Your reset link expires in 60 minutes and can only be used
              once. Your account data remains fully protected.
            </p>
          </div>
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
      <h2 className="font-fraunces text-[26px] font-normal text-[#26302B]">
        Forgot your password?
      </h2>
      <p className="mt-2 text-sm text-[#6B7568]">
        No worries — enter your email and we&apos;ll send you a password
        reset link.
      </p>

      {status ? (
        <div className="mt-5 flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {status}
        </div>
      ) : (
        <div className="mt-5 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          Enter your registered email to receive reset instructions.
        </div>
      )}

      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-md border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-800">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
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
              error ? "border-red-400" : "border-[#E1DBCB]"
            )}
          >
            <Mail className="h-4 w-4 shrink-0 text-[#9A8F76]" />
            <input
              id="email"
              type="email"
              autoFocus
              required
              placeholder="Enter your registered email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent text-sm text-[#26302B] outline-none placeholder:text-[#B4AC98]"
            />
          </div>
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
              Send Reset Link
              <Send className="h-4 w-4" />
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
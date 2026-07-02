"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface PasswordInputProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  prefix?: string;
  className?: string;
  ariaInvalid?: boolean;
}

/**
 * Reused for every "secret" field across Settings (SMTP password, Stripe
 * secret key, Stripe webhook secret) — a monospace input with a fixed
 * prefix badge and a show/hide toggle.
 */
export function PasswordInput({
  id,
  value,
  onChange,
  placeholder,
  prefix,
  className,
  ariaInvalid,
}: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="flex">
      {prefix && (
        <span className="flex items-center rounded-l-md border border-r-0 bg-muted px-3 font-mono text-sm text-muted-foreground">
          {prefix}
        </span>
      )}
      <Input
        id={id}
        type={visible ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-invalid={ariaInvalid}
        className={cn("font-mono", prefix ? "rounded-l-none" : "", "rounded-r-none", className)}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="flex items-center rounded-r-md border border-l-0 bg-background px-3 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        aria-label={visible ? "Hide value" : "Show value"}
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
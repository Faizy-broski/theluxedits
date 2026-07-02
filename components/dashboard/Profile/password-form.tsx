"use client";

import { useState, useTransition } from "react";
import { LockKeyhole, ShieldCheck, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PasswordInput } from "@/components/dashboard/Settings/password-input";
import { updatePassword } from "@/lib/actions/profile/actions";
import type { PasswordFormValues } from "@/lib/types";

const EMPTY_VALUES: PasswordFormValues = {
  current_password: "",
  password: "",
  password_confirmation: "",
};

export function PasswordForm() {
  const [values, setValues] = useState<PasswordFormValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<Partial<Record<keyof PasswordFormValues, string>>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function setField<K extends keyof PasswordFormValues>(key: K, value: PasswordFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMessage("");
    startTransition(async () => {
      const result = await updatePassword(values);
      if (result.success) {
        setSuccessMessage(result.message ?? "Password updated successfully.");
        setValues(EMPTY_VALUES);
      } else if (result.errors) {
        setErrors(result.errors);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LockKeyhole className="h-4 w-4 text-amber-500" />
          Change Password
        </CardTitle>
        <CardDescription>Use a strong password with at least 8 characters</CardDescription>
      </CardHeader>
      <CardContent>
        {successMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current_password">
              Current Password <span className="text-destructive">*</span>
            </Label>
            <PasswordInput
              id="current_password"
              value={values.current_password}
              onChange={(v: string) => setField("current_password", v)}
              placeholder="Enter current password"
              ariaInvalid={Boolean(errors.current_password)}
            />
            {errors.current_password && (
              <p className="text-xs text-destructive">{errors.current_password}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              New Password <span className="text-destructive">*</span>
            </Label>
            <PasswordInput
              id="password"
              value={values.password}
              onChange={(v: string) => setField("password", v)}
              placeholder="Min. 8 characters"
              ariaInvalid={Boolean(errors.password)}
            />
            {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password_confirmation">
              Confirm New Password <span className="text-destructive">*</span>
            </Label>
            <PasswordInput
              id="password_confirmation"
              value={values.password_confirmation}
              onChange={(v: string) => setField("password_confirmation", v)}
              placeholder="Repeat new password"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isPending}
              className="bg-amber-500 px-6 text-white hover:bg-amber-600"
            >
              {isPending ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <ShieldCheck className="mr-1 h-4 w-4" />
              )}
              Update Password
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
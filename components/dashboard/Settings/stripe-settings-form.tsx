"use client";

import { useState, useTransition } from "react";
import {
  CreditCard,
  KeyRound,
  Lock,
  Webhook,
  AlertTriangle,
  Info,
  Loader2,
  Save,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PasswordInput } from "@/components/dashboard/Settings/password-input";
import { saveStripeSettings } from "@/lib/actions/settings/actions";
import type { StripeFormValues, StripeSettings } from "@/lib/types";

interface StripeSettingsFormProps {
  settings: StripeSettings;
}

export function StripeSettingsForm({ settings }: StripeSettingsFormProps) {
  const [values, setValues] = useState<StripeFormValues>({
    publishable_key: settings.publishable_key,
    secret_key: "",
    webhook_secret: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function setField<K extends keyof StripeFormValues>(key: K, value: StripeFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMessage("");
    startTransition(async () => {
      const result = await saveStripeSettings(values);
      if (result.success) {
        setSuccessMessage(result.message ?? "Stripe settings saved successfully.");
        setValues((prev) => ({ ...prev, secret_key: "", webhook_secret: "" }));
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" />
          Stripe Settings
        </CardTitle>
        <CardDescription>Configure payment gateway keys for accepting online payments</CardDescription>
      </CardHeader>
      <CardContent>
        {successMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {successMessage}
          </div>
        )}

        <div className="mb-4 flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <strong>Important:</strong> Keep your Secret Key private — never
            share it. Use <strong>Test</strong> keys during development and
            switch to <strong>Live</strong> keys in production.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="stripe_pk" className="flex items-center gap-1.5">
              <KeyRound className="h-3.5 w-3.5 text-muted-foreground" />
              Publishable Key
              <Badge variant="secondary" className="bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                Public
              </Badge>
            </Label>
            <div className="flex">
              <span className="flex items-center rounded-l-md border border-r-0 bg-muted px-3 font-mono text-sm text-muted-foreground">
                pk_
              </span>
              <Input
                id="stripe_pk"
                className="rounded-l-none font-mono"
                placeholder="test_… or live_…"
                value={values.publishable_key}
                onChange={(e) => setField("publishable_key", e.target.value)}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Starts with <code className="rounded bg-muted px-1 py-0.5">pk_test_</code> or{" "}
              <code className="rounded bg-muted px-1 py-0.5">pk_live_</code>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="stripe_sk" className="flex items-center gap-1.5">
              <Lock className="h-3.5 w-3.5 text-muted-foreground" />
              Secret Key
              <Badge variant="secondary" className="bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                Private
              </Badge>
              <span className="font-normal text-muted-foreground">(leave blank to keep current)</span>
            </Label>
            <PasswordInput
              id="stripe_sk"
              prefix="sk_"
              value={values.secret_key}
              onChange={(v: string) => setField("secret_key", v)}
              placeholder={settings.hasSecretKey ? "••••••••••••••••••••" : "test_… or live_…"}
            />
            {settings.hasSecretKey ? (
              <p className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Secret key saved — leave blank to keep unchanged
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                Starts with <code className="rounded bg-muted px-1 py-0.5">sk_test_</code> or{" "}
                <code className="rounded bg-muted px-1 py-0.5">sk_live_</code>
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="stripe_wh" className="flex items-center gap-1.5">
              <Webhook className="h-3.5 w-3.5 text-muted-foreground" />
              Webhook Secret
              <Badge variant="secondary">Optional</Badge>
              <span className="font-normal text-muted-foreground">(leave blank to keep current)</span>
            </Label>
            <PasswordInput
              id="stripe_wh"
              prefix="whsec_"
              value={values.webhook_secret}
              onChange={(v: string) => setField("webhook_secret", v)}
              placeholder={settings.hasWebhookSecret ? "••••••••••••••••••••" : "whsec_…"}
            />
            {settings.hasWebhookSecret && (
              <p className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3 w-3" />
                Webhook secret saved — leave blank to keep unchanged
              </p>
            )}
          </div>

          <div className="flex flex-col items-start justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center">
            <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              Find your keys in the{" "}
              <a
                href="https://dashboard.stripe.com/apikeys"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 inline-flex items-center gap-1 font-semibold text-foreground hover:underline"
              >
                Stripe Dashboard
                <ExternalLink className="h-3 w-3" />
              </a>
            </p>
            <Button type="submit" disabled={isPending} className="shrink-0 px-6">
              {isPending ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-1 h-4 w-4" />
              )}
              Save Stripe Settings
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
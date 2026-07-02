"use client";

import { useState, useTransition } from "react";
import {
  Server,
  Plug,
  ShieldCheck,
  User,
  Lock,
  Send,
  Smile,
  Info,
  Loader2,
  Save,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { PasswordInput } from "@/components/dashboard/Settings/password-input";
import { saveSmtpSettings } from "@/lib/actions/settings/actions";
import type { SmtpFormValues, SmtpSettings } from "@/lib/types";

interface SmtpSettingsFormProps {
  settings: SmtpSettings;
}

export function SmtpSettingsForm({ settings }: SmtpSettingsFormProps) {
  const [values, setValues] = useState<SmtpFormValues>({
    host: settings.host,
    port: String(settings.port),
    encryption: settings.encryption,
    username: settings.username,
    password: "",
    from_address: settings.from_address,
    from_name: settings.from_name,
  });
  const [errors, setErrors] = useState<Partial<Record<keyof SmtpFormValues, string>>>({});
  const [successMessage, setSuccessMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  function setField<K extends keyof SmtpFormValues>(key: K, value: SmtpFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSuccessMessage("");
    startTransition(async () => {
      const result = await saveSmtpSettings(values);
      if (result.success) {
        setSuccessMessage(result.message ?? "SMTP settings saved successfully.");
        setValues((prev) => ({ ...prev, password: "" }));
      } else if (result.errors) {
        setErrors(result.errors);
      }
    });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Server className="h-4 w-4" />
          SMTP Settings
        </CardTitle>
        <CardDescription>Configure outgoing mail server for sending emails</CardDescription>
      </CardHeader>
      <CardContent>
        {successMessage && (
          <div className="mb-4 flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
            <div className="space-y-2 md:col-span-8">
              <Label htmlFor="smtp_host" className="flex items-center gap-1">
                <Server className="h-3.5 w-3.5 text-muted-foreground" />
                SMTP Host <span className="text-destructive">*</span>
              </Label>
              <Input
                id="smtp_host"
                placeholder="e.g. smtp.gmail.com"
                value={values.host}
                onChange={(e) => setField("host", e.target.value)}
                aria-invalid={Boolean(errors.host)}
              />
              {errors.host && <p className="text-xs text-destructive">{errors.host}</p>}
            </div>

            <div className="space-y-2 md:col-span-4">
              <Label htmlFor="smtp_port" className="flex items-center gap-1">
                <Plug className="h-3.5 w-3.5 text-muted-foreground" />
                Port <span className="text-destructive">*</span>
              </Label>
              <Input
                id="smtp_port"
                type="number"
                placeholder="587"
                value={values.port}
                onChange={(e) => setField("port", e.target.value)}
                aria-invalid={Boolean(errors.port)}
              />
              {errors.port && <p className="text-xs text-destructive">{errors.port}</p>}
            </div>

            <div className="space-y-2 md:col-span-4">
              <Label className="flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                Encryption <span className="text-destructive">*</span>
              </Label>
              <Select
                value={values.encryption}
                onValueChange={(v) => setField("encryption", v as SmtpFormValues["encryption"])}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tls">TLS (recommended)</SelectItem>
                  <SelectItem value="ssl">SSL</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-8">
              <Label htmlFor="smtp_username" className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                Username / Email <span className="text-destructive">*</span>
              </Label>
              <Input
                id="smtp_username"
                placeholder="your@email.com"
                value={values.username}
                onChange={(e) => setField("username", e.target.value)}
                aria-invalid={Boolean(errors.username)}
              />
              {errors.username && <p className="text-xs text-destructive">{errors.username}</p>}
            </div>

            <div className="space-y-2 md:col-span-12">
              <Label htmlFor="smtp_password" className="flex items-center gap-1">
                <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                Password / App Password{" "}
                <span className="font-normal text-muted-foreground">(leave blank to keep current)</span>
              </Label>
              <PasswordInput
                id="smtp_password"
                value={values.password}
                onChange={(v) => setField("password", v)}
                placeholder={settings.hasPassword ? "••••••••••••" : "Enter SMTP password"}
              />
              {settings.hasPassword && (
                <p className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3 w-3" />
                  Password saved — leave blank to keep unchanged
                </p>
              )}
            </div>

            <div className="space-y-2 md:col-span-6">
              <Label htmlFor="smtp_from_address" className="flex items-center gap-1">
                <Send className="h-3.5 w-3.5 text-muted-foreground" />
                From Address <span className="text-destructive">*</span>
              </Label>
              <Input
                id="smtp_from_address"
                type="email"
                placeholder="noreply@yoursite.com"
                value={values.from_address}
                onChange={(e) => setField("from_address", e.target.value)}
                aria-invalid={Boolean(errors.from_address)}
              />
              {errors.from_address && (
                <p className="text-xs text-destructive">{errors.from_address}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-6">
              <Label htmlFor="smtp_from_name" className="flex items-center gap-1">
                <Smile className="h-3.5 w-3.5 text-muted-foreground" />
                From Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="smtp_from_name"
                placeholder="TheLuxEdits"
                value={values.from_name}
                onChange={(e) => setField("from_name", e.target.value)}
                aria-invalid={Boolean(errors.from_name)}
              />
              {errors.from_name && <p className="text-xs text-destructive">{errors.from_name}</p>}
            </div>
          </div>

          <div className="flex flex-col items-start justify-between gap-3 border-t pt-4 sm:flex-row sm:items-center">
            <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              For Gmail use port <strong className="mx-1 text-foreground">587</strong> with{" "}
              <strong className="mx-1 text-foreground">TLS</strong> and an App Password.
            </p>
            <Button type="submit" disabled={isPending} className="shrink-0 px-6">
              {isPending ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-1 h-4 w-4" />
              )}
              Save SMTP Settings
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
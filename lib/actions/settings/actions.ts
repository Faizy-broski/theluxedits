"use server";

import { revalidatePath } from "next/cache";
import type {
  SmtpFormValues,
  SmtpSettings,
  StripeFormValues,
  StripeSettings,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Mock data layer. Replace every function body below with real persistence
// (DB table, encrypted secrets store, etc). Never return raw secret values
// to the client — getSmtpSettings/getStripeSettings only expose booleans
// (hasPassword / hasSecretKey / hasWebhookSecret) for that reason.
// ---------------------------------------------------------------------------

let smtpStore = {
  host: "smtp.gmail.com",
  port: 587,
  encryption: "tls" as "tls" | "ssl" | "none",
  username: "noreply@example.com",
  password: "app-specific-password", // never sent to the client
  from_address: "noreply@example.com",
  from_name: "TheLuxEdits",
};

let stripeStore = {
  publishable_key: "pk_test_51PabcXYZ0000000000000000",
  secret_key: "sk_test_51PabcXYZ0000000000000000", // never sent to the client
  webhook_secret: "whsec_abcXYZ0000000000000000", // never sent to the client
};

export async function getSmtpSettings(): Promise<SmtpSettings> {
  return {
    host: smtpStore.host,
    port: smtpStore.port,
    encryption: smtpStore.encryption,
    username: smtpStore.username,
    hasPassword: Boolean(smtpStore.password),
    from_address: smtpStore.from_address,
    from_name: smtpStore.from_name,
  };
}

export async function getStripeSettings(): Promise<StripeSettings> {
  return {
    publishable_key: stripeStore.publishable_key,
    hasSecretKey: Boolean(stripeStore.secret_key),
    hasWebhookSecret: Boolean(stripeStore.webhook_secret),
  };
}

export interface SmtpActionResult {
  success: boolean;
  message?: string;
  errors?: Partial<Record<keyof SmtpFormValues, string>>;
}

function validateSmtp(values: SmtpFormValues): SmtpActionResult["errors"] {
  const errors: SmtpActionResult["errors"] = {};
  if (!values.host.trim()) errors.host = "The host field is required.";
  if (!values.port.trim() || Number(values.port) <= 0) errors.port = "Please enter a valid port.";
  if (!values.encryption) errors.encryption = "The encryption field is required.";
  if (!values.username.trim()) errors.username = "The username field is required.";
  if (!values.from_address.trim()) errors.from_address = "The from address field is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.from_address)) {
    errors.from_address = "Please enter a valid email address.";
  }
  if (!values.from_name.trim()) errors.from_name = "The from name field is required.";
  return Object.keys(errors).length ? errors : undefined;
}

export async function saveSmtpSettings(values: SmtpFormValues): Promise<SmtpActionResult> {
  const errors = validateSmtp(values);
  if (errors) return { success: false, errors };

  smtpStore = {
    host: values.host,
    port: Number(values.port),
    encryption: values.encryption,
    username: values.username,
    // Blank password means "keep the current one" — same as the Blade form.
    password: values.password ? values.password : smtpStore.password,
    from_address: values.from_address,
    from_name: values.from_name,
  };

  revalidatePath("/settings");
  return { success: true, message: "SMTP settings saved successfully." };
}

export interface StripeActionResult {
  success: boolean;
  message?: string;
}

export async function saveStripeSettings(values: StripeFormValues): Promise<StripeActionResult> {
  stripeStore = {
    publishable_key: values.publishable_key,
    secret_key: values.secret_key ? values.secret_key : stripeStore.secret_key,
    webhook_secret: values.webhook_secret ? values.webhook_secret : stripeStore.webhook_secret,
  };

  revalidatePath("/settings");
  return { success: true, message: "Stripe settings saved successfully." };
}
"use server";

// ---------------------------------------------------------------------------
// Mock auth. Replace with your real password-reset flow: generate a signed
// token, store its hash + expiry, and email a reset link
// (e.g. `${APP_URL}/reset-password?token=...&email=...`).
// ---------------------------------------------------------------------------

export interface ForgotPasswordResult {
  success: boolean;
  message?: string;
  errors?: Partial<Record<"email", string>>;
}

export async function sendResetLink(email: string): Promise<ForgotPasswordResult> {
  if (!email.trim()) {
    return { success: false, errors: { email: "The email field is required." } };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, errors: { email: "Please enter a valid email address." } };
  }

  // Simulate network latency.
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Always report success regardless of whether the email exists, so this
  // endpoint can't be used to enumerate registered accounts — same
  // practice Laravel's password broker follows.
  return {
    success: true,
    message: "We've emailed your password reset link.",
  };
}
"use server";

// ---------------------------------------------------------------------------
// Mock auth. Replace with your real password-reset flow: verify the token
// against its stored hash + expiry for the given email, then update the
// user's password (hashed) and invalidate the token.
// ---------------------------------------------------------------------------

export interface ResetPasswordValues {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface ResetPasswordResult {
  success: boolean;
  message?: string;
  errors?: Partial<Record<"email" | "password" | "token", string>>;
}

export async function resetPassword(values: ResetPasswordValues): Promise<ResetPasswordResult> {
  const errors: ResetPasswordResult["errors"] = {};

  if (!values.token) {
    errors.token = "This password reset link is invalid or has expired.";
  }
  if (!values.email.trim()) {
    errors.email = "The email field is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (!values.password) {
    errors.password = "The password field is required.";
  } else if (values.password.length < 8) {
    errors.password = "The password must be at least 8 characters.";
  } else if (values.password !== values.password_confirmation) {
    errors.password = "The password confirmation does not match.";
  }

  if (Object.keys(errors).length) return { success: false, errors };

  // Simulate network latency.
  await new Promise((resolve) => setTimeout(resolve, 500));

  return { success: true, message: "Your password has been reset successfully." };
}
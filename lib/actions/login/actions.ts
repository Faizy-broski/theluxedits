"use server";

// ---------------------------------------------------------------------------
// Mock auth. Replace with your real auth provider (NextAuth, Lucia, Supabase,
// a custom session/cookie flow, etc). This only validates shape + checks
// against one seed credential so the form has something real to do.
// ---------------------------------------------------------------------------

const MOCK_CREDENTIALS = {
  email: "faizan@example.com",
  password: "password123",
};

export interface LoginFormValues {
  email: string;
  password: string;
  remember: boolean;
}

export interface LoginActionResult {
  success: boolean;
  message?: string;
  errors?: Partial<Record<"email" | "password", string>>;
}

export async function login(values: LoginFormValues): Promise<LoginActionResult> {
  const errors: LoginActionResult["errors"] = {};
  if (!values.email.trim()) errors.email = "The email field is required.";
  if (!values.password) errors.password = "The password field is required.";
  if (Object.keys(errors).length) return { success: false, errors };

  // Simulate network/auth latency.
  await new Promise((resolve) => setTimeout(resolve, 500));

  const matches =
    values.email.trim().toLowerCase() === MOCK_CREDENTIALS.email &&
    values.password === MOCK_CREDENTIALS.password;

  if (!matches) {
    return { success: false, message: "These credentials do not match our records." };
  }

  // In a real app: set a session cookie / JWT here before returning.
  return { success: true };
}
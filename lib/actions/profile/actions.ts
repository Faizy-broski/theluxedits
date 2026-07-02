"use server";

import { revalidatePath } from "next/cache";
import type {
  PasswordFormValues,
  ProfileFormValues,
  UserProfile,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Mock data layer. Replace every function body below with real persistence
// (session/DB user record, hashed password comparison, etc).
// ---------------------------------------------------------------------------

let userStore = {
  name: "Faizan Ahmed",
  email: "faizan@example.com",
  role: "Administrator",
  // Never returned to the client — stand-in for a hashed password check.
  password: "password123",
};

export async function getCurrentUser(): Promise<UserProfile> {
  return { name: userStore.name, email: userStore.email, role: userStore.role };
}

export interface ProfileActionResult {
  success: boolean;
  message?: string;
  errors?: Partial<Record<keyof ProfileFormValues, string>>;
}

export async function updateProfile(values: ProfileFormValues): Promise<ProfileActionResult> {
  const errors: ProfileActionResult["errors"] = {};
  if (!values.name.trim()) errors.name = "The name field is required.";
  if (!values.email.trim()) errors.email = "The email field is required.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) {
    errors.email = "Please enter a valid email address.";
  }
  if (Object.keys(errors).length) return { success: false, errors };

  userStore = { ...userStore, name: values.name, email: values.email };

  revalidatePath("/profile");
  return { success: true, message: "Profile updated successfully." };
}

export interface PasswordActionResult {
  success: boolean;
  message?: string;
  errors?: Partial<Record<keyof PasswordFormValues, string>>;
}

export async function updatePassword(values: PasswordFormValues): Promise<PasswordActionResult> {
  const errors: PasswordActionResult["errors"] = {};

  if (!values.current_password) {
    errors.current_password = "The current password field is required.";
  } else if (values.current_password !== userStore.password) {
    errors.current_password = "The provided password does not match your current password.";
  }

  if (!values.password) {
    errors.password = "The password field is required.";
  } else if (values.password.length < 8) {
    errors.password = "The password must be at least 8 characters.";
  } else if (values.password !== values.password_confirmation) {
    errors.password = "The password confirmation does not match.";
  }

  if (Object.keys(errors).length) return { success: false, errors };

  userStore = { ...userStore, password: values.password };

  revalidatePath("/profile");
  return { success: true, message: "Password updated successfully." };
}
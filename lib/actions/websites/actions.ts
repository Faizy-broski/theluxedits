"use server";

import { revalidatePath } from "next/cache";
import type { WebsiteFormValues } from "@/lib/types";

export interface ActionResult {
  success: boolean;
  errors?: Partial<Record<keyof WebsiteFormValues, string>>;
}

const URL_PATTERN = /^https?:\/\/.+/i;

function validate(values: WebsiteFormValues): ActionResult["errors"] {
  const errors: ActionResult["errors"] = {};
  if (!values.name.trim()) errors.name = "Please enter the website name.";
  if (!values.url.trim() || !URL_PATTERN.test(values.url.trim())) {
    errors.url = "Please enter a valid URL (https://...).";
  }
  return Object.keys(errors).length ? errors : undefined;
}

// Replace the body of each action with a real DB call (Prisma/Drizzle/etc).
// The validate() + revalidatePath() calls stay the same either way.

export async function createWebsite(
  values: WebsiteFormValues
): Promise<ActionResult> {
  const errors = validate(values);
  if (errors) return { success: false, errors };

  // await db.website.create({ data: { ...values } });

  revalidatePath("/websites");
  return { success: true };
}

export async function updateWebsite(
  id: number,
  values: WebsiteFormValues
): Promise<ActionResult> {
  const errors = validate(values);
  if (errors) return { success: false, errors };

  // await db.website.update({ where: { id }, data: { ...values } });

  revalidatePath("/websites");
  return { success: true };
}

export async function deleteWebsite(id: number): Promise<ActionResult> {
  // await db.website.delete({ where: { id } });

  revalidatePath("/websites");
  return { success: true };
}
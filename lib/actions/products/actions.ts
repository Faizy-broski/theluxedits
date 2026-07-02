"use server";

import { revalidatePath } from "next/cache";
import type {
  ProductFilters,
  ProductFormValues,
  ProductRecord,
  ProductsPage,
  BulkRuleType,
  PriceRounding,
  BulkEditableField,
  BulkFieldValues,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Mock data layer. Replace every function body below with a real DB query
// (Prisma/Drizzle/etc). The function signatures are the contract the UI
// components rely on, so keep those the same.
// ---------------------------------------------------------------------------

const WEBSITES = [
  { id: 1, name: "Walsall Tyre World" },
  { id: 2, name: "Smart Autos London" },
  { id: 3, name: "XU Atelier" },
  { id: 4, name: "TSN Store" },
];

let PRODUCTS: ProductRecord[] = [
  {
    id: 1,
    title: "Continental EcoContact 6 205/55 R16",
    brand: "Continental",
    category: "Tyres",
    price: 89.99,
    currency: "GBP",
    quantity: 24,
    sku: "CONT-EC6-001",
    product_url: "https://walsalltyreworld.co.uk/products/1",
    image_url: null,
    description: "Fuel-efficient touring tyre with strong wet grip.",
    source_website_id: 1,
    website: WEBSITES[0],
  },
  {
    id: 2,
    title: "2022 BMW 3 Series 320d M Sport",
    brand: "BMW",
    category: "Vehicles",
    price: 24950,
    currency: "GBP",
    quantity: 1,
    sku: "SAL-BMW-320D",
    product_url: "https://smartautoslondon.co.uk/products/2",
    image_url: null,
    description: "Low-mileage example, full service history.",
    source_website_id: 2,
    website: WEBSITES[1],
  },
  {
    id: 3,
    title: "Quilted Leather Top Handle Bag",
    brand: "XU Atelier",
    category: "Handbags",
    price: 1250,
    currency: "GBP",
    quantity: 6,
    sku: "XU-QLT-014",
    product_url: "https://xuatelier.com/products/3",
    image_url: null,
    description: "Hand-finished quilted lambskin with gold hardware.",
    source_website_id: 3,
    website: WEBSITES[2],
  },
  {
    id: 4,
    title: "Michelin Primacy 4 225/45 R17",
    brand: "Michelin",
    category: "Tyres",
    price: 112.5,
    currency: "GBP",
    quantity: 0,
    sku: "MICH-P4-017",
    product_url: "https://walsalltyreworld.co.uk/products/4",
    image_url: null,
    description: null,
    source_website_id: 1,
    website: WEBSITES[0],
  },
  {
    id: 5,
    title: "Mini Structured Crossbody",
    brand: "XU Atelier",
    category: "Handbags",
    price: 620,
    currency: "GBP",
    quantity: 3,
    sku: "XU-MSC-022",
    product_url: "https://xuatelier.com/products/5",
    image_url: null,
    description: null,
    source_website_id: 3,
    website: WEBSITES[2],
  },
];

let nextId = 6;

export async function getCategoryCounts(): Promise<
  { category: string; total: number }[]
> {
  const counts = new Map<string, number>();
  for (const p of PRODUCTS) {
    if (!p.category) continue;
    counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  }
  return Array.from(counts.entries())
    .map(([category, total]) => ({ category, total }))
    .sort((a, b) => b.total - a.total);
}

export async function getWebsitesWithCounts(): Promise<
  { id: number; name: string; products_count: number }[]
> {
  return WEBSITES.map((w) => ({
    ...w,
    products_count: PRODUCTS.filter((p) => p.source_website_id === w.id).length,
  }));
}

export async function getProductStats() {
  const totalProducts = PRODUCTS.length;
  const totalCategories = new Set(PRODUCTS.map((p) => p.category).filter(Boolean)).size;
  const websitesWithProds = new Set(PRODUCTS.map((p) => p.source_website_id)).size;
  const priced = PRODUCTS.filter((p) => p.price !== null) as (ProductRecord & { price: number })[];
  const avgPrice = priced.length
    ? priced.reduce((sum, p) => sum + p.price, 0) / priced.length
    : 0;

  return { totalProducts, totalCategories, websitesWithProds, avgPrice };
}

export async function getTotalProductCount(): Promise<number> {
  return PRODUCTS.length;
}

function roundPrice(value: number, rounding: PriceRounding): number {
  switch (rounding) {
    case "nearest_99": {
      const whole = Math.floor(value);
      return value - whole >= 0.5 ? whole + 0.99 : Math.max(0, whole - 1 + 0.99);
    }
    case "nearest_00":
      return Math.round(value);
    case "none":
      return value;
    case "round":
    default:
      return Math.round(value * 100) / 100;
  }
}

export interface BulkApplyResult {
  success: boolean;
  updated: number;
  message?: string;
}

export async function applyBulkPriceRule(
  ids: number[],
  ruleType: BulkRuleType,
  value: number,
  rounding: PriceRounding
): Promise<BulkApplyResult> {
  if (!ids.length) return { success: false, updated: 0, message: "No products selected." };
  if (!value || value <= 0) {
    return { success: false, updated: 0, message: "Please enter a valid value greater than 0." };
  }

  let updated = 0;
  PRODUCTS = PRODUCTS.map((p) => {
    if (!ids.includes(p.id) || p.price === null) return p;

    let next = p.price;
    switch (ruleType) {
      case "increase_pct":
        next = p.price * (1 + value / 100);
        break;
      case "decrease_pct":
        next = p.price * (1 - value / 100);
        break;
      case "add_fixed":
        next = p.price + value;
        break;
      case "subtract_fixed":
        next = p.price - value;
        break;
      case "set_fixed":
        next = value;
        break;
    }
    next = Math.max(0, roundPrice(next, rounding));
    updated += 1;
    return { ...p, price: next };
  });

  revalidatePath("/products");
  revalidatePath("/products/bulk-edit");
  return { success: true, updated, message: `Rule applied to ${updated} product(s).` };
}

export interface BulkFieldApplyResult {
  success: boolean;
  updated: number;
  message?: string;
}

export async function applyBulkFieldUpdate(
  ids: number[],
  fields: BulkEditableField[],
  values: BulkFieldValues
): Promise<BulkFieldApplyResult> {
  if (!ids.length) {
    return { success: false, updated: 0, message: "Please select at least one product." };
  }
  if (!fields.length) {
    return { success: false, updated: 0, message: "Please tick at least one field to update." };
  }

  const website =
    fields.includes("source_website_id") && values.source_website_id
      ? WEBSITES.find((w) => w.id === Number(values.source_website_id)) ?? null
      : null;

  let updated = 0;
  PRODUCTS = PRODUCTS.map((p) => {
    if (!ids.includes(p.id)) return p;
    const next: ProductRecord = { ...p };

    if (fields.includes("price") && values.price !== "") next.price = Number(values.price);
    if (fields.includes("quantity") && values.quantity !== "") next.quantity = Number(values.quantity);
    if (fields.includes("category") && values.category !== "") next.category = values.category;
    if (fields.includes("brand") && values.brand !== "") next.brand = values.brand;
    if (fields.includes("source_website_id") && values.source_website_id) {
      next.source_website_id = Number(values.source_website_id);
      next.website = website;
    }

    updated += 1;
    return next;
  });

  revalidatePath("/products");
  revalidatePath("/products/bulk-edit-fields");
  return { success: true, updated, message: `Updated ${updated} product(s) successfully.` };
}

export async function getBrandOptions(): Promise<string[]> {
  return Array.from(new Set(PRODUCTS.map((p) => p.brand).filter(Boolean))) as string[];
}

export async function getCategoryOptions(): Promise<string[]> {
  return Array.from(new Set(PRODUCTS.map((p) => p.category).filter(Boolean))) as string[];
}

export async function getWebsiteOptions(): Promise<{ id: number; name: string }[]> {
  return WEBSITES;
}

export async function searchProducts(
  filters: ProductFilters
): Promise<ProductsPage> {
  let results = [...PRODUCTS];

  if (filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    results = results.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.brand ?? "").toLowerCase().includes(q) ||
        (p.sku ?? "").toLowerCase().includes(q)
    );
  }
  if (filters.category) {
    results = results.filter((p) => p.category === filters.category);
  }
  if (filters.website_id) {
    results = results.filter(
      (p) => String(p.source_website_id) === filters.website_id
    );
  }
  if (filters.currency.trim()) {
    results = results.filter(
      (p) =>
        (p.currency ?? "").toLowerCase() === filters.currency.trim().toLowerCase()
    );
  }
  if (filters.price_min) {
    const min = Number(filters.price_min);
    results = results.filter((p) => (p.price ?? 0) >= min);
  }
  if (filters.price_max) {
    const max = Number(filters.price_max);
    results = results.filter((p) => (p.price ?? 0) <= max);
  }

  const total = results.length;
  const start = (filters.page - 1) * filters.pageSize;
  const page = results.slice(start, start + filters.pageSize);

  return { data: page, total };
}

export async function getProduct(id: number): Promise<ProductRecord | null> {
  return PRODUCTS.find((p) => p.id === id) ?? null;
}

export interface ProductActionResult {
  success: boolean;
  message?: string;
  errors?: Partial<Record<keyof ProductFormValues, string>>;
}

function validate(values: ProductFormValues): ProductActionResult["errors"] {
  const errors: ProductActionResult["errors"] = {};
  if (!values.title.trim()) errors.title = "Product title is required.";
  if (!values.product_url.trim()) errors.product_url = "Please enter a valid URL.";
  if (!values.source_website_id) errors.source_website_id = "Please select a source website.";
  return Object.keys(errors).length ? errors : undefined;
}

export async function createProduct(
  values: ProductFormValues
): Promise<ProductActionResult> {
  const errors = validate(values);
  if (errors) return { success: false, errors };

  const website =
    WEBSITES.find((w) => w.id === Number(values.source_website_id)) ?? null;

  const record: ProductRecord = {
    id: nextId++,
    title: values.title,
    brand: values.brand || null,
    category: values.category || null,
    price: values.price ? Number(values.price) : null,
    currency: values.currency || "USD",
    quantity: values.quantity ? Number(values.quantity) : null,
    sku: values.sku || null,
    product_url: values.product_url,
    image_url: values.image_url || null,
    description: values.description || null,
    source_website_id: Number(values.source_website_id),
    website,
  };
  PRODUCTS = [record, ...PRODUCTS];

  revalidatePath("/products");
  return { success: true, message: "Product saved." };
}

export async function updateProduct(
  id: number,
  values: ProductFormValues
): Promise<ProductActionResult> {
  const errors = validate(values);
  if (errors) return { success: false, errors };

  const website =
    WEBSITES.find((w) => w.id === Number(values.source_website_id)) ?? null;

  PRODUCTS = PRODUCTS.map((p) =>
    p.id === id
      ? {
          ...p,
          title: values.title,
          brand: values.brand || null,
          category: values.category || null,
          price: values.price ? Number(values.price) : null,
          currency: values.currency || "USD",
          quantity: values.quantity ? Number(values.quantity) : null,
          sku: values.sku || null,
          product_url: values.product_url,
          image_url: values.image_url || null,
          description: values.description || null,
          source_website_id: Number(values.source_website_id),
          website,
        }
      : p
  );

  revalidatePath("/products");
  return { success: true, message: "Product saved." };
}

export async function deleteProduct(id: number): Promise<ProductActionResult> {
  PRODUCTS = PRODUCTS.filter((p) => p.id !== id);
  revalidatePath("/products");
  return { success: true, message: "Product deleted." };
}
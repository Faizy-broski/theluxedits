const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "https://testing2.reshortai.com/api")
  .replace(/\/api\/?$/, "");

/**
 * Resolves a product image_url to an absolute URL.
 * - Absolute URLs (http/https) are returned as-is (e.g. Supabase)
 * - Relative paths (/uploads/...) get the Laravel backend base prepended
 */
export function resolveImageUrl(url: string | null | undefined): string | null {
  if (!url || url.trim() === "") return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${API_BASE}${url.startsWith("/") ? url : `/${url}`}`;
}

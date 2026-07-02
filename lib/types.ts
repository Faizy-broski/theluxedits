export interface Website {
  id: number;
  name: string;
}

export interface Product {
  id: number;
  title: string;
  brand?: string | null;
  image_url?: string | null;
  category?: string | null;
  price?: number | null;
  currency?: string | null;
  website?: Website | null;
}

export interface WebsiteStat {
  id: number;
  name: string;
  products_count: number;
}

export interface CategoryStat {
  category: string | null;
  total: number;
}

// Full record used on the Websites management page (distinct from the
// lightweight `WebsiteStat` used on the dashboard's charts/breakdown).
export interface WebsiteRecord {
  id: number;
  name: string;
  url: string;
  scraper_class: string | null;
  is_active: boolean;
  products_count: number;
}

// Shape submitted from the Add/Edit form.
export interface WebsiteFormValues {
  name: string;
  url: string;
  scraper_class: string;
  is_active: boolean;
}

// Full product record for the Products management page.
export interface ProductRecord {
  id: number;
  title: string;
  brand: string | null;
  category: string | null;
  price: number | null;
  currency: string | null;
  quantity: number | null;
  sku: string | null;
  product_url: string;
  image_url: string | null;
  description: string | null;
  source_website_id: number;
  website: Website | null;
}

export interface ProductFormValues {
  title: string;
  brand: string;
  category: string;
  price: string;
  quantity: string;
  currency: string;
  sku: string;
  product_url: string;
  source_website_id: string;
  image_url: string;
  description: string;
}

export interface CategoryCount {
  category: string;
  total: number;
}

export interface ProductFilters {
  search: string;
  category: string;
  website_id: string;
  currency: string;
  price_min: string;
  price_max: string;
  page: number;
  pageSize: number;
}

export interface ProductsPage {
  data: ProductRecord[];
  total: number;
}

export type BulkRuleType =
  | "increase_pct"
  | "decrease_pct"
  | "add_fixed"
  | "subtract_fixed"
  | "set_fixed";

export type PriceRounding = "round" | "nearest_99" | "nearest_00" | "none";

export interface BulkRuleValues {
  ruleType: BulkRuleType;
  value: string;
  rounding: PriceRounding;
}

export type BulkEditableField =
  | "price"
  | "quantity"
  | "category"
  | "brand"
  | "source_website_id";

export interface BulkFieldValues {
  price: string;
  quantity: string;
  category: string;
  brand: string;
  source_website_id: string;
}

export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "paid" | "unpaid" | "refunded";

export interface OrderItem {
  id: number;
  product_name: string;
  product_sku: string | null;
  product_image: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface OrderCustomer {
  name: string;
  email: string;
  phone: string | null;
}

export interface OrderRecord {
  id: number;
  ship_name: string;
  ship_email: string;
  ship_phone?: string | null;
  ship_address?: string;
  ship_city: string;
  ship_state?: string | null;
  ship_zip?: string | null;
  ship_country?: string;
  items_count: number;
  items?: OrderItem[];
  subtotal?: number;
  shipping?: number;
  total: number;
  currency: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_intent_id?: string | null;
  tracking_number: string | null;
  notes?: string | null;
  customer?: OrderCustomer | null;
  created_at: string;
}

export interface OrderFilters {
  status: OrderStatus | "";
  payment: PaymentStatus | "";
  customer: string;
  orderId: string;
  page: number;
  pageSize: number;
}

export interface OrdersPage {
  data: OrderRecord[];
  total: number;
}

export interface OrderStats {
  total: number;
  pending: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  revenue: number;
}

export interface OrderStatusUpdate {
  status: OrderStatus;
  payment_status: PaymentStatus;
  tracking_number: string;
}

export type SmtpEncryption = "tls" | "ssl" | "none";

export interface SmtpSettings {
  host: string;
  port: number;
  encryption: SmtpEncryption;
  username: string;
  hasPassword: boolean;
  from_address: string;
  from_name: string;
}

export interface SmtpFormValues {
  host: string;
  port: string;
  encryption: SmtpEncryption;
  username: string;
  password: string;
  from_address: string;
  from_name: string;
}

export interface StripeSettings {
  publishable_key: string;
  hasSecretKey: boolean;
  hasWebhookSecret: boolean;
}

export interface StripeFormValues {
  publishable_key: string;
  secret_key: string;
  webhook_secret: string;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
}

export interface ProfileFormValues {
  name: string;
  email: string;
}

export interface PasswordFormValues {
  current_password: string;
  password: string;
  password_confirmation: string;
}

export interface DashboardData {
  totalProducts: number;
  totalWebsites: number;
  activeWebsites: number;
  websiteStats: WebsiteStat[];
  categoryStats: CategoryStat[];
  recentProducts: Product[];
}
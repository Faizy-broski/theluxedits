"use server";

import { revalidatePath } from "next/cache";
import type {
  OrderFilters,
  OrderRecord,
  OrdersPage,
  OrderStats,
  OrderStatusUpdate,
} from "@/lib/types";

// ---------------------------------------------------------------------------
// Mock data layer. Replace every function body below with a real DB query
// (Prisma/Drizzle/etc). The function signatures are the contract the UI
// components rely on, so keep those the same.
// ---------------------------------------------------------------------------

let ORDERS: OrderRecord[] = [
  {
    id: 1042,
    ship_name: "Amelia Clarke",
    ship_email: "amelia.clarke@example.com",
    ship_phone: "+44 20 7946 0958",
    ship_address: "14 Baker Street",
    ship_city: "London",
    ship_state: null,
    ship_zip: "NW1 6XE",
    ship_country: "United Kingdom",
    items_count: 3,
    items: [
      {
        id: 1,
        product_name: "Continental EcoContact 6 205/55 R16",
        product_sku: "CONT-EC6-001",
        product_image: null,
        quantity: 2,
        unit_price: 89.99,
        total_price: 179.98,
      },
      {
        id: 2,
        product_name: "Valve Cap Set (4-pack)",
        product_sku: "ACC-VCS-004",
        product_image: null,
        quantity: 1,
        unit_price: 5.5,
        total_price: 5.5,
      },
      {
        id: 3,
        product_name: "Tyre Pressure Gauge",
        product_sku: "ACC-TPG-012",
        product_image: null,
        quantity: 1,
        unit_price: 12.99,
        total_price: 12.99,
      },
    ],
    subtotal: 198.47,
    shipping: 0,
    total: 214.5,
    currency: "USD",
    status: "delivered",
    payment_status: "paid",
    payment_intent_id: "pi_3PabcXYZ0001",
    tracking_number: "1Z999AA10123456784",
    notes: "Leave with neighbour at #12 if not in.",
    customer: {
      name: "Amelia Clarke",
      email: "amelia.clarke@example.com",
      phone: "+44 20 7946 0958",
    },
    created_at: "2026-06-28T14:32:00Z",
  },
  {
    id: 1041,
    ship_name: "James Whitfield",
    ship_email: "j.whitfield@example.com",
    ship_phone: null,
    ship_address: "27 Deansgate",
    ship_city: "Manchester",
    ship_state: null,
    ship_zip: "M3 2FN",
    ship_country: "United Kingdom",
    items_count: 1,
    items: [
      {
        id: 4,
        product_name: "Michelin Primacy 4 225/45 R17",
        product_sku: "MICH-P4-017",
        product_image: null,
        quantity: 1,
        unit_price: 89.99,
        total_price: 89.99,
      },
    ],
    subtotal: 89.99,
    shipping: 0,
    total: 89.99,
    currency: "USD",
    status: "shipped",
    payment_status: "paid",
    payment_intent_id: "pi_3PabcXYZ0002",
    tracking_number: "1Z999AA10123456785",
    notes: null,
    customer: {
      name: "James Whitfield",
      email: "j.whitfield@example.com",
      phone: null,
    },
    created_at: "2026-06-29T09:12:00Z",
  },
  {
    id: 1040,
    ship_name: "Priya Nair",
    ship_email: "priya.nair@example.com",
    ship_phone: "+44 121 496 0022",
    ship_address: "8 Colmore Row",
    ship_city: "Birmingham",
    ship_state: null,
    ship_zip: "B3 2QD",
    ship_country: "United Kingdom",
    items_count: 2,
    items: [
      {
        id: 5,
        product_name: "Quilted Leather Top Handle Bag",
        product_sku: "XU-QLT-014",
        product_image: null,
        quantity: 1,
        unit_price: 1250,
        total_price: 1250,
      },
      {
        id: 6,
        product_name: "Mini Structured Crossbody",
        product_sku: "XU-MSC-022",
        product_image: null,
        quantity: 1,
        unit_price: 620,
        total_price: 620,
      },
    ],
    subtotal: 1870,
    shipping: 0,
    total: 156.0,
    currency: "USD",
    status: "processing",
    payment_status: "paid",
    payment_intent_id: "pi_3PabcXYZ0003",
    tracking_number: null,
    notes: "Gift wrap both items separately.",
    customer: {
      name: "Priya Nair",
      email: "priya.nair@example.com",
      phone: "+44 121 496 0022",
    },
    created_at: "2026-06-30T11:47:00Z",
  },
  {
    id: 1039,
    ship_name: "Tom Hargreaves",
    ship_email: "tom.h@example.com",
    ship_phone: null,
    ship_address: "3 Briggate",
    ship_city: "Leeds",
    ship_state: null,
    ship_zip: "LS1 6HD",
    ship_country: "United Kingdom",
    items_count: 4,
    items: [
      {
        id: 7,
        product_name: "Continental EcoContact 6 205/55 R16",
        product_sku: "CONT-EC6-001",
        product_image: null,
        quantity: 4,
        unit_price: 89.99,
        total_price: 359.96,
      },
    ],
    subtotal: 359.96,
    shipping: 52.29,
    total: 412.25,
    currency: "USD",
    status: "pending",
    payment_status: "unpaid",
    payment_intent_id: null,
    tracking_number: null,
    notes: null,
    customer: null,
    created_at: "2026-07-01T08:05:00Z",
  },
  {
    id: 1038,
    ship_name: "Sofia Marchetti",
    ship_email: "sofia.m@example.com",
    ship_phone: null,
    ship_address: "56 Park Street",
    ship_city: "Bristol",
    ship_state: null,
    ship_zip: "BS1 5JG",
    ship_country: "United Kingdom",
    items_count: 1,
    items: [
      {
        id: 8,
        product_name: "Tyre Pressure Gauge",
        product_sku: "ACC-TPG-012",
        product_image: null,
        quantity: 1,
        unit_price: 62.0,
        total_price: 62.0,
      },
    ],
    subtotal: 62.0,
    shipping: 0,
    total: 62.0,
    currency: "USD",
    status: "cancelled",
    payment_status: "refunded",
    payment_intent_id: "pi_3PabcXYZ0005",
    tracking_number: null,
    notes: "Customer requested cancellation — ordered by mistake.",
    customer: {
      name: "Sofia Marchetti",
      email: "sofia.m@example.com",
      phone: null,
    },
    created_at: "2026-07-01T16:20:00Z",
  },
  {
    id: 1037,
    ship_name: "Daniel Osei",
    ship_email: "daniel.osei@example.com",
    ship_phone: "+44 151 233 0087",
    ship_address: "22 Bold Street",
    ship_city: "Liverpool",
    ship_state: null,
    ship_zip: "L1 4DN",
    ship_country: "United Kingdom",
    items_count: 2,
    items: [
      {
        id: 9,
        product_name: "Michelin Primacy 4 225/45 R17",
        product_sku: "MICH-P4-017",
        product_image: null,
        quantity: 2,
        unit_price: 89.2,
        total_price: 178.4,
      },
    ],
    subtotal: 178.4,
    shipping: 0,
    total: 178.4,
    currency: "USD",
    status: "delivered",
    payment_status: "paid",
    payment_intent_id: "pi_3PabcXYZ0006",
    tracking_number: "1Z999AA10123456786",
    notes: null,
    customer: {
      name: "Daniel Osei",
      email: "daniel.osei@example.com",
      phone: "+44 151 233 0087",
    },
    created_at: "2026-07-02T10:00:00Z",
  },
];

export async function getOrder(id: number): Promise<OrderRecord | null> {
  return ORDERS.find((o) => o.id === id) ?? null;
}

export async function getOrderStats(): Promise<OrderStats> {
  return {
    total: ORDERS.length,
    pending: ORDERS.filter((o) => o.status === "pending").length,
    processing: ORDERS.filter((o) => o.status === "processing").length,
    shipped: ORDERS.filter((o) => o.status === "shipped").length,
    delivered: ORDERS.filter((o) => o.status === "delivered").length,
    cancelled: ORDERS.filter((o) => o.status === "cancelled").length,
    revenue: ORDERS.filter((o) => o.payment_status === "paid").reduce(
      (sum, o) => sum + o.total,
      0
    ),
  };
}

export async function searchOrders(filters: OrderFilters): Promise<OrdersPage> {
  let results = [...ORDERS];

  if (filters.status) {
    results = results.filter((o) => o.status === filters.status);
  }
  if (filters.payment) {
    results = results.filter((o) => o.payment_status === filters.payment);
  }
  if (filters.customer.trim()) {
    const q = filters.customer.trim().toLowerCase();
    results = results.filter(
      (o) =>
        o.ship_name.toLowerCase().includes(q) ||
        o.ship_email.toLowerCase().includes(q)
    );
  }
  if (filters.orderId.trim()) {
    results = results.filter((o) => String(o.id).includes(filters.orderId.trim()));
  }

  results.sort((a, b) => b.id - a.id);

  const total = results.length;
  const start = (filters.page - 1) * filters.pageSize;
  const page = results.slice(start, start + filters.pageSize);

  return { data: page, total };
}

export async function updateOrderStatus(
  id: number,
  values: OrderStatusUpdate
): Promise<{ success: boolean; message?: string }> {
  let found = false;
  ORDERS = ORDERS.map((o) => {
    if (o.id !== id) return o;
    found = true;
    return {
      ...o,
      status: values.status,
      payment_status: values.payment_status,
      tracking_number: values.tracking_number || null,
    };
  });

  if (!found) return { success: false, message: "Order not found." };

  revalidatePath("/orders");
  revalidatePath(`/orders/${id}`);
  return { success: true, message: "Order updated." };
}
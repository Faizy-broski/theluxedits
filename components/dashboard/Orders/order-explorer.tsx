"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  Eye,
  Pencil,
  RefreshCw,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { StatusUpdateDialog } from "@/components/dashboard/Orders/status-update-dialog";
import { searchOrders } from "@/lib/actions/orders/actions";
import type { OrderFilters, OrderRecord, OrderStatus, PaymentStatus } from "@/lib/types";

const PAGE_SIZE = 25;

const EMPTY_FILTERS: OrderFilters = {
  status: "",
  payment: "",
  customer: "",
  orderId: "",
  page: 1,
  pageSize: PAGE_SIZE,
};

const STATUS_BADGE_CLASS: Record<OrderStatus, string> = {
  pending: "bg-amber-500 text-white hover:bg-amber-500",
  processing: "bg-sky-600 text-white hover:bg-sky-600",
  shipped: "bg-slate-500 text-white hover:bg-slate-500",
  delivered: "bg-emerald-600 text-white hover:bg-emerald-600",
  cancelled: "bg-destructive text-white hover:bg-destructive",
};

const PAYMENT_BADGE_CLASS: Record<PaymentStatus, string> = {
  paid: "bg-emerald-600 text-white hover:bg-emerald-600",
  unpaid: "bg-destructive text-white hover:bg-destructive",
  refunded: "bg-slate-500 text-white hover:bg-slate-500",
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return {
    date: d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }),
    time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }),
  };
}

interface OrdersExplorerProps {
  totalOrders: number;
}

export function OrdersExplorer({ totalOrders }: OrdersExplorerProps) {
  const [filters, setFilters] = useState<OrderFilters>(EMPTY_FILTERS);
  const [customerDraft, setCustomerDraft] = useState("");
  const [orderIdDraft, setOrderIdDraft] = useState("");
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, startLoad] = useTransition();

  const [statusOpen, setStatusOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderRecord | null>(null);

  function load(nextFilters: OrderFilters) {
    startLoad(async () => {
      const result = await searchOrders(nextFilters);
      setOrders(result.data);
      setTotal(result.total);
    });
  }

  useEffect(() => {
    load(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Debounce the free-text customer/order-id inputs, matching the original's 400ms delay.
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((prev) =>
        prev.customer === customerDraft && prev.orderId === orderIdDraft
          ? prev
          : { ...prev, customer: customerDraft, orderId: orderIdDraft, page: 1 }
      );
    }, 400);
    return () => clearTimeout(t);
  }, [customerDraft, orderIdDraft]);

  function clearFilters() {
    setCustomerDraft("");
    setOrderIdDraft("");
    setFilters(EMPTY_FILTERS);
  }

  function openStatusDialog(order: OrderRecord) {
    setEditingOrder(order);
    setStatusOpen(true);
  }

  function handleSaved(message: string) {
    toast.success(message);
    load(filters);
  }

  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const rangeStart = total === 0 ? 0 : (filters.page - 1) * filters.pageSize + 1;
  const rangeEnd = Math.min(filters.page * filters.pageSize, total);

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Orders</CardTitle>
        <CardDescription>{totalOrders.toLocaleString()} total orders</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4 xl:grid-cols-5">
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Status</Label>
            <Select
              value={filters.status || "all"}
              onValueChange={(v) =>
                setFilters((prev) => ({
                  ...prev,
                  status: v === "all" ? "" : (v as OrderStatus),
                  page: 1,
                }))
              }
            >
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Payment</Label>
            <Select
              value={filters.payment || "all"}
              onValueChange={(v) =>
                setFilters((prev) => ({
                  ...prev,
                  payment: v === "all" ? "" : (v as PaymentStatus),
                  page: 1,
                }))
              }
            >
              <SelectTrigger size="sm" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-xs text-muted-foreground">
              Customer (Name / Email / Phone)
            </Label>
            <Input
              placeholder="Search customer…"
              value={customerDraft}
              onChange={(e) => setCustomerDraft(e.target.value)}
              className="h-8"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Order ID</Label>
            <div className="flex gap-2">
              <Input
                placeholder="#ID"
                value={orderIdDraft}
                onChange={(e) => setOrderIdDraft(e.target.value)}
                className="h-8"
              />
              <Button variant="secondary" size="sm" className="h-8 shrink-0" onClick={clearFilters}>
                <RefreshCw className="mr-1 h-3.5 w-3.5" />
                Clear
              </Button>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead>ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-24 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((o) => {
                const { date, time } = formatDate(o.created_at);
                return (
                  <TableRow key={o.id}>
                    <TableCell>
                      <span className="font-semibold text-primary">#{o.id}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{o.ship_name || "—"}</p>
                        <p className="text-xs text-muted-foreground">{o.ship_email}</p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {o.ship_city}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="rounded-full">
                        {o.items_count} item{o.items_count !== 1 ? "s" : ""}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">${o.total.toFixed(2)}</span>{" "}
                      <span className="text-xs text-muted-foreground">{o.currency}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(STATUS_BADGE_CLASS[o.status])}>{o.status}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={cn(PAYMENT_BADGE_CLASS[o.payment_status])}>
                        {o.payment_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <p className="text-sm">{date}</p>
                      <p className="text-xs text-muted-foreground">{time}</p>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button asChild variant="ghost" size="icon" className="h-8 w-8" title="View Detail">
                          <Link href={`/dashboard/orders/${o.id}`}>
                            <Eye className="h-4 w-4 text-sky-600" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          title="Update Status"
                          onClick={() => openStatusDialog(o)}
                        >
                          <Pencil className="h-4 w-4 text-primary" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}

              {!isLoading && orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                      <Inbox className="h-8 w-8" />
                      <p className="text-sm">No orders match your filters.</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            {total === 0 ? "No orders" : `Showing ${rangeStart} to ${rangeEnd} of ${total} orders`}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={filters.page <= 1}
              onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-sm text-muted-foreground">
              Page {filters.page} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={filters.page >= totalPages}
              onClick={() =>
                setFilters((prev) => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))
              }
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      <StatusUpdateDialog
        open={statusOpen}
        onOpenChange={setStatusOpen}
        order={editingOrder}
        onSaved={handleSaved}
      />
    </Card>
  );
}
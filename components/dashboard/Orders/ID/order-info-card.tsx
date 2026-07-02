"use client";

import { useEffect, useState, useTransition } from "react";
import { Check, Loader2, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { updateOrderStatus } from "@/lib/actions/orders/actions";
import type { OrderRecord, OrderStatus, PaymentStatus } from "@/lib/types";

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

interface OrderInfoCardProps {
  order: OrderRecord;
}

export function OrderInfoCard({ order }: OrderInfoCardProps) {
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(order.payment_status);
  const [tracking, setTracking] = useState(order.tracking_number ?? "");
  const [showSaved, setShowSaved] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!showSaved) return;
    const t = setTimeout(() => setShowSaved(false), 3000);
    return () => clearTimeout(t);
  }, [showSaved]);

  function handleSave() {
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, {
        status,
        payment_status: paymentStatus,
        tracking_number: tracking,
      });
      if (result.success) {
        setShowSaved(true);
      } else {
        alert(result.message ?? "Failed to save. Please try again.");
      }
    });
  }

  const formattedDate = new Date(order.created_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const formattedTime = new Date(order.created_at).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Order Info</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Order ID</dt>
            <dd className="font-semibold text-primary">#{order.id}</dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Status</dt>
            <dd>
              <Badge className={cn("text-[10px] uppercase", STATUS_BADGE_CLASS[order.status])}>
                {order.status}
              </Badge>
            </dd>
          </div>
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Payment</dt>
            <dd>
              <Badge className={cn("text-[10px] uppercase", PAYMENT_BADGE_CLASS[order.payment_status])}>
                {order.payment_status}
              </Badge>
            </dd>
          </div>
          {order.payment_intent_id && (
            <div className="flex items-center justify-between gap-3">
              <dt className="shrink-0 text-muted-foreground">Stripe PI</dt>
              <dd className="break-all text-right text-[11px]">{order.payment_intent_id}</dd>
            </div>
          )}
          {order.tracking_number && (
            <div className="flex items-center justify-between">
              <dt className="text-muted-foreground">Tracking</dt>
              <dd className="text-xs">{order.tracking_number}</dd>
            </div>
          )}
          <div className="flex items-center justify-between">
            <dt className="text-muted-foreground">Date</dt>
            <dd className="text-xs">
              {formattedDate}, {formattedTime}
            </dd>
          </div>
        </dl>

        <div className="my-4 border-t" />

        <p className="mb-3 text-xs font-semibold">Update Status</p>
        <div className="space-y-2">
          <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          <Select value={paymentStatus} onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}>
            <SelectTrigger size="sm" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>

          <Input
            placeholder="Tracking number…"
            value={tracking}
            onChange={(e) => setTracking(e.target.value)}
            className="h-8"
          />
        </div>

        <Button className="mt-3 w-full" size="sm" onClick={handleSave} disabled={isPending}>
          {isPending ? (
            <Loader2 className="mr-1 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-1 h-4 w-4" />
          )}
          Save Changes
        </Button>

        {showSaved && (
          <p className="mt-2 flex items-center gap-1 text-sm text-emerald-600">
            <Check className="h-3.5 w-3.5" />
            Saved successfully
          </p>
        )}
      </CardContent>
    </Card>
  );
}

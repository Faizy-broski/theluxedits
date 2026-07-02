"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Save, X, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { updateOrderStatus } from "@/lib/actions/orders/actions";
import type { OrderRecord, OrderStatus, PaymentStatus } from "@/lib/types";

interface StatusUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order: OrderRecord | null;
  onSaved: (message: string) => void;
}

export function StatusUpdateDialog({
  open,
  onOpenChange,
  order,
  onSaved,
}: StatusUpdateDialogProps) {
  const [status, setStatus] = useState<OrderStatus>("pending");
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("unpaid");
  const [tracking, setTracking] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!open || !order) return;
    setStatus(order.status);
    setPaymentStatus(order.payment_status);
    setTracking(order.tracking_number ?? "");
  }, [open, order]);

  function handleSave() {
    if (!order) return;
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, {
        status,
        payment_status: paymentStatus,
        tracking_number: tracking,
      });
      if (result.success) {
        onOpenChange(false);
        onSaved(result.message ?? "Order updated.");
      } else {
        toast.error(result.message ?? "Failed to update. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4 text-primary" />
            Update Order {order ? `#${order.id}` : ""}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Order Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as OrderStatus)}>
              <SelectTrigger className="w-full">
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
          </div>

          <div className="space-y-2">
            <Label>Payment Status</Label>
            <Select
              value={paymentStatus}
              onValueChange={(v) => setPaymentStatus(v as PaymentStatus)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="tracking">
              Tracking Number <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Input
              id="tracking"
              placeholder="e.g. 1Z999AA10123456784"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => onOpenChange(false)} disabled={isPending}>
            <X className="mr-1 h-4 w-4" />
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? (
              <Loader2 className="mr-1 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-1 h-4 w-4" />
            )}
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
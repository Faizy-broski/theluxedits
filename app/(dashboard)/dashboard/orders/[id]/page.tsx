import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OrderTrackingStepper } from "@/components/dashboard/Orders/ID/order-tracking-stepper";
import { OrderItemsTable } from "@/components/dashboard/Orders/ID/order-items-table";
import { OrderInfoCard } from "@/components/dashboard/Orders/ID/order-info-card";
import {
  ShippingAddressCard,
  CustomerCard,
  OrderNotesCard,
} from "@/components/dashboard/Orders/ID/order-sidebar-cards";
import { getOrder } from "@/lib/actions/orders/actions";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  const order = await getOrder(Number(id));

  if (!order) notFound();

  const items = order.items ?? [];
  const subtotal = order.subtotal ?? order.total;
  const shipping = order.shipping ?? 0;

  const placedAt = new Date(order.created_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const placedTime = new Date(order.created_at).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold">
            Order <span className="text-primary">#{order.id}</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Placed {placedAt}, {placedTime}
          </p>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href="/dashboard/orders">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Orders
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="space-y-4 xl:col-span-8">
          <OrderTrackingStepper status={order.status} trackingNumber={order.tracking_number} />
          <OrderItemsTable
            items={items}
            subtotal={subtotal}
            shipping={shipping}
            total={order.total}
            currency={order.currency}
          />
        </div>

        <div className="space-y-4 xl:col-span-4">
          <OrderInfoCard order={order} />
          <ShippingAddressCard order={order} />
          {order.customer && <CustomerCard customer={order.customer} />}
          {order.notes && <OrderNotesCard notes={order.notes} />}
        </div>
      </div>
    </div>
  );
}
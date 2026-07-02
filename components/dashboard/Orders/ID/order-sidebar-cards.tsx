import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import type { OrderCustomer, OrderRecord } from "@/lib/types";

interface ShippingAddressCardProps {
  order: OrderRecord;
}

export function ShippingAddressCard({ order }: ShippingAddressCardProps) {
  const locationLine = [order.ship_city, order.ship_state].filter(Boolean).join(", ");

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Shipping Address</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p className="font-semibold">{order.ship_name}</p>
        <p className="text-muted-foreground">{order.ship_email}</p>
        {order.ship_phone && <p className="text-muted-foreground">{order.ship_phone}</p>}
        {order.ship_address && <p className="text-muted-foreground">{order.ship_address}</p>}
        <p className="text-muted-foreground">
          {locationLine}
          {order.ship_zip ? ` ${order.ship_zip}` : ""}
        </p>
        {order.ship_country && <p className="text-muted-foreground">{order.ship_country}</p>}
      </CardContent>
    </Card>
  );
}

interface CustomerCardProps {
  customer: OrderCustomer;
}

export function CustomerCard({ customer }: CustomerCardProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Customer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-1 text-sm">
        <p className="font-semibold">{customer.name}</p>
        <p className="text-muted-foreground">{customer.email}</p>
        {customer.phone && <p className="text-muted-foreground">{customer.phone}</p>}
      </CardContent>
    </Card>
  );
}

interface OrderNotesCardProps {
  notes: string;
}

export function OrderNotesCard({ notes }: OrderNotesCardProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Notes</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{notes}</p>
      </CardContent>
    </Card>
  );
}

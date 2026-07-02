import Image from "next/image";
import { ImageOff } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { OrderItem } from "@/lib/types";

interface OrderItemsTableProps {
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
}

export function OrderItemsTable({ items, subtotal, shipping, total, currency }: OrderItemsTableProps) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          Items Ordered
          <Badge variant="secondary">{items.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Product</TableHead>
              <TableHead className="text-center">Qty</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-md border bg-muted">
                      {item.product_image ? (
                        <Image
                          src={item.product_image}
                          alt={item.product_name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <ImageOff className="h-4 w-4 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="text-[13px] font-medium">{item.product_name}</p>
                      {item.product_sku && (
                        <p className="text-xs text-muted-foreground">SKU: {item.product_sku}</p>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Badge variant="outline">{item.quantity}</Badge>
                </TableCell>
                <TableCell className="text-right">${item.unit_price.toFixed(2)}</TableCell>
                <TableCell className="text-right font-semibold">
                  ${item.total_price.toFixed(2)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter className="bg-transparent">
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={3} className="text-right text-sm text-muted-foreground">
                Subtotal
              </TableCell>
              <TableCell className="text-right">${subtotal.toFixed(2)}</TableCell>
            </TableRow>
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={3} className="text-right text-sm text-muted-foreground">
                Shipping
              </TableCell>
              <TableCell className="text-right">
                {shipping === 0 ? (
                  <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">Free</Badge>
                ) : (
                  `$${shipping.toFixed(2)}`
                )}
              </TableCell>
            </TableRow>
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={3} className="text-right font-semibold">
                Total
              </TableCell>
              <TableCell className="text-right font-bold text-primary">
                ${total.toFixed(2)}{" "}
                <span className="text-xs font-normal text-muted-foreground">
                  {currency.toUpperCase()}
                </span>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </CardContent>
    </Card>
  );
}

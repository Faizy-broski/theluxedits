import Image from "next/image";
import { ImageOff } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import type { Product } from "@/lib/types";

interface RecentProductsTableProps {
  data: Product[];
  viewAllHref?: string;
}

export function RecentProductsTable({
  data,
  viewAllHref = "#",
}: RecentProductsTableProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Recent Products</CardTitle>
        <CardAction>
          <Button asChild size="sm" variant="secondary">
            <a href={viewAllHref}>View All</a>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Product</TableHead>
              <TableHead>Website</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {product.image_url ? (
                      <div className="relative h-9 w-9 shrink-0 overflow-hidden rounded-md border">
                        <Image
                          src={product.image_url}
                          alt={product.title}
                          fill
                          sizes="36px"
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-secondary-foreground">
                        <ImageOff className="h-4 w-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p
                        className="max-w-45 truncate text-sm font-medium"
                        title={product.title}
                      >
                        {product.title}
                      </p>
                      {product.brand && (
                        <p className="text-xs text-muted-foreground">
                          {product.brand}
                        </p>
                      )}
                    </div>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="outline">
                    {product.website?.name ?? "N/A"}
                  </Badge>
                </TableCell>

                <TableCell>
                  {product.category ? (
                    <Badge variant="secondary">{product.category}</Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>

                <TableCell>
                  {product.price ? (
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {product.currency} {product.price.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-sm text-muted-foreground">—</span>
                  )}
                </TableCell>
              </TableRow>
            ))}

            {data.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No products yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
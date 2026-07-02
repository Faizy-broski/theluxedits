import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BulkEditExplorer } from "@/components/dashboard/Products/Bulk-Edit-Price-Rule/bulk-edit-explorer";
import { getTotalProductCount, getWebsitesWithCounts } from "@/lib/actions/products/actions";

export default async function BulkEditProductsPage() {
  const [totalProducts, websites] = await Promise.all([
    getTotalProductCount(),
    getWebsitesWithCounts(),
  ]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Bulk Price Rules</h1>
          <p className="text-sm text-muted-foreground">
            Select products from the table, define a price rule, then apply — all changes are instant.
          </p>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href="/dashboard/products">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </div>

      <BulkEditExplorer totalProducts={totalProducts} websites={websites} />
    </div>
  );
}
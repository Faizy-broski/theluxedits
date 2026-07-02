import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BulkFieldEditExplorer } from "@/components/dashboard/Products/Bulk-Edit-Field-Explorer/bulk-field-edit-explorer";
import {
  getTotalProductCount,
  getWebsitesWithCounts,
  getCategoryOptions,
  getBrandOptions,
} from "@/lib/actions/products/actions";

export default async function BulkEditFieldsPage() {
  const [totalProducts, websites, categories, brands] = await Promise.all([
    getTotalProductCount(),
    getWebsitesWithCounts(),
    getCategoryOptions(),
    getBrandOptions(),
  ]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Bulk Edit Products</h1>
          <p className="text-sm text-muted-foreground">
            Select products from the table, choose which fields to update, then apply.
          </p>
        </div>
        <Button asChild variant="secondary" size="sm">
          <Link href="/dashboard/products">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </div>

      <BulkFieldEditExplorer
        totalProducts={totalProducts}
        websites={websites}
        categories={categories}
        brands={brands}
      />
    </div>
  );
}
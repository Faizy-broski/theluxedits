import { ProductStats } from "@/components/dashboard/Products/product-stats";
import { ProductsExplorer } from "@/components/dashboard/Products/products-explorer";
import {
  getCategoryCounts,
  getWebsitesWithCounts,
  getBrandOptions,
  getCategoryOptions,
  getProductStats,
} from "@/lib/actions/products/actions";

export default async function ProductsPage() {
  const [categoryCounts, websites, brands, categories, stats] = await Promise.all([
    getCategoryCounts(),
    getWebsitesWithCounts(),
    getBrandOptions(),
    getCategoryOptions(),
    getProductStats(),
  ]);

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
        <p className="text-sm text-muted-foreground">
          Browse, filter, and manage scraped products.
        </p>
      </div>

      <ProductStats
        totalProducts={stats.totalProducts}
        totalCategories={stats.totalCategories}
        websitesWithProducts={stats.websitesWithProds}
        avgPrice={stats.avgPrice}
      />

      <ProductsExplorer
        categoryCounts={categoryCounts}
        websites={websites}
        brands={brands}
        categories={categories}
      />
    </div>
  );
}
import { ShoppingBag, Tags, Globe, CircleDollarSign } from "lucide-react";
import { KpiCard } from "@/components/dashboard/MainPage/kpi-card";

interface ProductStatsProps {
  totalProducts: number;
  totalCategories: number;
  websitesWithProducts: number;
  avgPrice: number;
}

export function ProductStats({
  totalProducts,
  totalCategories,
  websitesWithProducts,
  avgPrice,
}: ProductStatsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 xl:grid-cols-4">
      <KpiCard
        label="Total Products"
        value={totalProducts}
        icon={ShoppingBag}
        helperText="All scraped products"
        accent="chart-1"
      />
      <KpiCard
        label="Categories"
        value={totalCategories}
        icon={Tags}
        helperText="Unique product categories"
        accent="chart-2"
      />
      <KpiCard
        label="Websites"
        value={websitesWithProducts}
        icon={Globe}
        helperText="Sources with products"
        accent="chart-3"
      />
      <KpiCard
        label="Avg. Price"
        value={avgPrice.toFixed(2)}
        icon={CircleDollarSign}
        helperText="Average product price"
        accent="chart-4"
      />
    </div>
  );
}

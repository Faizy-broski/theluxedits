import { ShoppingBag, Globe, CheckCircle2, Tags } from "lucide-react";
import { KpiCard } from "@/components/dashboard/MainPage/kpi-card";
import type { DashboardData } from "@/lib/types";

interface KpiSectionProps {
  data: Pick<
    DashboardData,
    "totalProducts" | "totalWebsites" | "activeWebsites" | "categoryStats"
  >;
}

export function KpiSection({ data }: KpiSectionProps) {
  const { totalProducts, totalWebsites, activeWebsites, categoryStats } = data;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 xl:grid-cols-4">
      <KpiCard
        label="Total Products"
        value={totalProducts}
        icon={ShoppingBag}
        helperText={`From ${totalWebsites} sites`}
        accent="chart-1"
      />
      <KpiCard
        label="Total Websites"
        value={totalWebsites}
        icon={Globe}
        helperText="Registered data sources"
        accent="chart-2"
      />
      <KpiCard
        label="Active Websites"
        value={activeWebsites}
        icon={CheckCircle2}
        badgeText="Live"
        helperText="Currently scraping"
        accent="chart-3"
      />
      <KpiCard
        label="Categories"
        value={categoryStats.length}
        icon={Tags}
        helperText="Unique product categories"
        accent="chart-4"
      />
    </div>
  );
}
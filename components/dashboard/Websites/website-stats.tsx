import { Globe, CheckCircle2, PauseCircle, ShoppingBag } from "lucide-react";
import { KpiCard } from "@/components/dashboard/MainPage/kpi-card";
import type { WebsiteRecord } from "@/lib/types";

interface WebsiteStatsProps {
  websites: WebsiteRecord[];
}

export function WebsiteStats({ websites }: WebsiteStatsProps) {
  const total = websites.length;
  const active = websites.filter((w) => w.is_active).length;
  const inactive = total - active;
  const totalProducts = websites.reduce((sum, w) => sum + w.products_count, 0);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 xl:grid-cols-4">
      <KpiCard
        label="Total Websites"
        value={total}
        icon={Globe}
        helperText="Registered data sources"
        accent="chart-1"
      />
      <KpiCard
        label="Active"
        value={active}
        icon={CheckCircle2}
        helperText="Currently scraping"
        accent="chart-2"
      />
      <KpiCard
        label="Inactive"
        value={inactive}
        icon={PauseCircle}
        helperText="Paused sources"
        accent="chart-3"
      />
      <KpiCard
        label="Total Products"
        value={totalProducts}
        icon={ShoppingBag}
        helperText="Across all websites"
        accent="chart-4"
      />
    </div>
  );
}

import {
  FileText,
  Clock,
  Loader,
  Truck,
  CheckCircle2,
  XCircle,
  DollarSign,
} from "lucide-react";
import { KpiCard } from "@/components/dashboard/MainPage/kpi-card";
import type { OrderStats } from "@/lib/types";

interface OrderStatsSectionProps {
  stats: OrderStats;
}

export function OrderStatsSection({ stats }: OrderStatsSectionProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4 xl:grid-cols-4">
        <KpiCard
          label="Total Orders"
          value={stats.total}
          icon={FileText}
          helperText="All orders placed"
          accent="chart-1"
        />
        <KpiCard
          label="Pending"
          value={stats.pending}
          icon={Clock}
          helperText="Awaiting confirmation"
          accent="chart-3"
        />
        <KpiCard
          label="Processing"
          value={stats.processing}
          icon={Loader}
          helperText="Being prepared"
          accent="chart-2"
        />
        <KpiCard
          label="Shipped"
          value={stats.shipped}
          icon={Truck}
          helperText="On the way"
          accent="chart-4"
        />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-3">
        <KpiCard
          label="Delivered"
          value={stats.delivered}
          icon={CheckCircle2}
          helperText="Successfully delivered"
          accent="chart-2"
        />
        <KpiCard
          label="Cancelled"
          value={stats.cancelled}
          icon={XCircle}
          helperText="Cancelled orders"
          accent="chart-3"
        />
        <KpiCard
          label="Total Revenue"
          value={`$${stats.revenue.toFixed(2)}`}
          icon={DollarSign}
          helperText="From paid orders"
          accent="chart-5"
        />
      </div>
    </div>
  );
}
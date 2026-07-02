"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { PieChart as PieChartIcon } from "lucide-react";
import type { CategoryStat } from "@/lib/types";

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

interface CategoriesDonutChartProps {
  data: CategoryStat[];
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-popover-foreground">{item.name}</p>
      <p className="text-muted-foreground">
        {item.value.toLocaleString()} products
      </p>
    </div>
  );
}

export function CategoriesDonutChart({ data }: CategoriesDonutChartProps) {
  const chartData = data.map((c) => ({
    name: c.category ?? "Uncategorized",
    value: c.total,
  }));
  const total = chartData.reduce((sum, c) => sum + c.value, 0);
  const hasData = chartData.length > 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Top Categories</CardTitle>
        <CardDescription>By product count</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center pt-0" style={{ minHeight: 320 }}>
        {hasData ? (
          <div className="relative w-full" style={{ height: 320 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius="62%"
                  outerRadius="88%"
                  paddingAngle={2}
                  strokeWidth={0}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={entry.name} fill={PALETTE[index % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold tracking-tight">
                {total.toLocaleString()}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                Products
              </span>
            </div>
          </div>
        ) : (
          <div className="flex h-full flex-col items-center justify-center py-16 text-muted-foreground">
            <PieChartIcon className="mb-2 h-10 w-10 opacity-50" />
            <p className="text-sm">No category data available yet</p>
          </div>
        )}

        {hasData && (
          <div className="mt-4 flex w-full flex-wrap justify-center gap-x-4 gap-y-2">
            {chartData.map((entry, index) => (
              <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: PALETTE[index % PALETTE.length] }}
                />
                <span className="text-muted-foreground">{entry.name}</span>
                <span className="font-semibold">{entry.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
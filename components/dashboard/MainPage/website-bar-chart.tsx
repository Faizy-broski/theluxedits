"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart2 } from "lucide-react";
import type { WebsiteStat } from "@/lib/types";

const PALETTE = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

function formatCompact(value: number) {
  return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : `${value}`;
}

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { payload: WebsiteStat }[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  return (
    <div className="rounded-md border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-popover-foreground">{item.name}</p>
      <p className="text-muted-foreground">
        {item.products_count.toLocaleString()} products
      </p>
    </div>
  );
}

interface WebsiteBarChartProps {
  data: WebsiteStat[];
  viewAllHref?: string;
}

export function WebsiteBarChart({ data, viewAllHref = "#" }: WebsiteBarChartProps) {
  const hasData = data.length > 0;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Products by Website</CardTitle>
        <CardDescription>Distribution across all sources</CardDescription>
        <CardAction>
          <Button asChild size="sm" variant="secondary">
            <a href={viewAllHref}>View All</a>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="pt-0" style={{ minHeight: 340 }}>
        {hasData ? (
          <ResponsiveContainer width="100%" height={340}>
            <BarChart
              data={data}
              layout="vertical"
              margin={{ top: 8, right: 24, bottom: 8, left: 8 }}
              barCategoryGap="30%"
            >
              <CartesianGrid
                horizontal={false}
                strokeDasharray="4 4"
                stroke="var(--border)"
              />
              <XAxis
                type="number"
                tickFormatter={formatCompact}
                tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="name"
                width={110}
                tick={{ fill: "var(--foreground)", fontSize: 12, fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: "var(--accent)" }}
                content={<ChartTooltip />}
              />
              <Bar
                dataKey="products_count"
                radius={[0, 6, 6, 0]}
                barSize={22}
                label={{
                  position: "insideRight",
                  fill: "#fff",
                  fontSize: 11,
                  fontWeight: 600,
                  formatter: (v) => typeof v === "number" ? formatCompact(v) : v,
                }}
              >
                {data.map((entry, index) => (
                  <Cell
                    key={entry.id}
                    fill={PALETTE[index % PALETTE.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <EmptyState
            icon={BarChart2}
            message="Add websites to see distribution chart"
          />
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState({
  icon: Icon,
  message,
}: {
  icon: typeof BarChart2;
  message: string;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center py-16 text-muted-foreground">
      <Icon className="mb-2 h-10 w-10 opacity-50" />
      <p className="text-sm">{message}</p>
    </div>
  );
}
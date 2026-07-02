import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type KpiAccent = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5";

// Written out as literal class strings (not built dynamically) so Tailwind's
// static scanner can pick them up at build time.
const ACCENT_CLASSES: Record<KpiAccent, { tint: string; badge: string; icon: string }> = {
  "chart-1": { tint: "bg-[var(--chart-1)]/15", badge: "bg-[var(--chart-1)]/15", icon: "text-[var(--chart-1)]" },
  "chart-2": { tint: "bg-[var(--chart-2)]/15", badge: "bg-[var(--chart-2)]/15", icon: "text-[var(--chart-2)]" },
  "chart-3": { tint: "bg-[var(--chart-3)]/15", badge: "bg-[var(--chart-3)]/15", icon: "text-[var(--chart-3)]" },
  "chart-4": { tint: "bg-[var(--chart-4)]/15", badge: "bg-[var(--chart-4)]/15", icon: "text-[var(--chart-4)]" },
  "chart-5": { tint: "bg-[var(--chart-5)]/15", badge: "bg-[var(--chart-5)]/15", icon: "text-[var(--chart-5)]" },
};

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  helperText?: string;
  badgeText?: string;
  accent?: KpiAccent;
  className?: string;
}

/**
 * Single KPI / stat card. Reused across the dashboard for every top-line
 * metric — pass a different icon, label and accent to reuse it anywhere.
 */
export function KpiCard({
  label,
  value,
  icon: Icon,
  helperText,
  badgeText,
  accent = "chart-1",
  className,
}: KpiCardProps) {
  const formattedValue =
    typeof value === "number" ? value.toLocaleString() : value;
  const accentClasses = ACCENT_CLASSES[accent];

  return (
    <Card className={cn("border-0 shadow-sm", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <h3 className="text-2xl font-semibold tracking-tight">
              {formattedValue}
            </h3>

            {(badgeText || helperText) && (
              <div className="mt-3 flex items-center gap-2">
                {badgeText && (
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium text-foreground",
                      accentClasses.badge
                    )}
                  >
                    {badgeText}
                  </span>
                )}
                {helperText && (
                  <span className="text-xs text-muted-foreground">
                    {helperText}
                  </span>
                )}
              </div>
            )}
          </div>

          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
              accentClasses.tint
            )}
          >
            <Icon className={cn("h-5 w-5", accentClasses.icon)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
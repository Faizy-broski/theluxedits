import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import type { WebsiteStat } from "@/lib/types";

interface WebsiteBreakdownProps {
  data: WebsiteStat[];
  totalProducts: number;
  manageHref?: string;
}

export function WebsiteBreakdown({
  data,
  totalProducts,
  manageHref = "#",
}: WebsiteBreakdownProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Website Breakdown</CardTitle>
        <CardAction>
          <Button asChild size="sm" variant="secondary">
            <a href={manageHref}>Manage</a>
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent className="space-y-5 pt-0">
        {data.map((site) => {
          const pct =
            totalProducts > 0
              ? Math.round((site.products_count / totalProducts) * 1000) / 10
              : 0;

          return (
            <div key={site.id} className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-semibold text-primary-foreground">
                {site.name.charAt(0).toUpperCase()}
              </div>

              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <span className="truncate text-sm font-medium">
                    {site.name}
                  </span>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {site.products_count.toLocaleString()}
                  </span>
                </div>
                <Progress value={pct} className="h-1.5" />
              </div>

              <Badge variant="secondary" className="shrink-0">
                {pct}%
              </Badge>
            </div>
          );
        })}

        {data.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No websites yet.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
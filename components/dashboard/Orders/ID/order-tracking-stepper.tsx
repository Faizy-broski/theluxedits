import { Check, Truck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

const STEPS: OrderStatus[] = ["pending", "processing", "shipped", "delivered"];

interface OrderTrackingStepperProps {
  status: OrderStatus;
  trackingNumber: string | null;
}

export function OrderTrackingStepper({ status, trackingNumber }: OrderTrackingStepperProps) {
  if (status === "cancelled") return null;

  const currentStep = STEPS.indexOf(status);

  return (
    <Card className="border-0 shadow-sm">
      <CardContent>
        <p className="mb-6 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          Order Tracking
        </p>

        <div className="flex items-start">
          {STEPS.map((step, i) => {
            const done = i <= currentStep;
            return (
              <div key={step} className="flex-1 text-center">
                <div className="flex items-center">
                  {i > 0 && (
                    <div
                      className={cn("h-0.5 flex-1", done ? "bg-emerald-500" : "bg-border")}
                    />
                  )}
                  <div
                    className={cn(
                      "flex h-9 w-9 min-w-9 shrink-0 items-center justify-center rounded-full text-[13px] font-bold",
                      done ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"
                    )}
                  >
                    {done ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  {i < STEPS.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1",
                        i < currentStep ? "bg-emerald-500" : "bg-border"
                      )}
                    />
                  )}
                </div>
                <p
                  className={cn(
                    "mt-2 text-[11px] capitalize",
                    done ? "font-semibold text-emerald-600" : "text-muted-foreground"
                  )}
                >
                  {step}
                </p>
              </div>
            );
          })}
        </div>

        {trackingNumber && (
          <div className="mt-4 text-center">
            <Badge variant="outline" className="gap-1">
              <Truck className="h-3.5 w-3.5" />
              Tracking: {trackingNumber}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

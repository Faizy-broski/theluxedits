import { OrderStatsSection } from "@/components/dashboard/Orders/order-stats";
import { OrdersExplorer } from "@/components/dashboard/Orders/order-explorer";
import { getOrderStats } from "@/lib/actions/orders/actions";

export default async function OrdersPage() {
  const stats = await getOrderStats();

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Orders</h1>
        <p className="text-sm text-muted-foreground">
          Track and manage customer orders.
        </p>
      </div>

      <OrderStatsSection stats={stats} />
      <OrdersExplorer totalOrders={stats.total} />
    </div>
  );
}
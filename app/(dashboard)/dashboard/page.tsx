import { KpiSection } from "@/components/dashboard/MainPage/kpi-section";
import { WebsiteBarChart } from "@/components/dashboard/MainPage/website-bar-chart";
import { CategoriesDonutChart } from "@/components/dashboard/MainPage/categories-donut";
import { WebsiteBreakdown } from "@/components/dashboard/MainPage/website-breakdown";
import { RecentProductsTable } from "@/components/dashboard/MainPage/recent-products-table";
import type { DashboardData } from "@/lib/types";

// Replace this with a real fetch/query (e.g. a server action, Prisma call,
// or `fetch` to your API) that returns data shaped like `DashboardData`.
async function getDashboardData(): Promise<DashboardData> {
  return {
    totalProducts: 128430,
    totalWebsites: 6,
    activeWebsites: 4,
    websiteStats: [
      { id: 1, name: "Walsall Tyre World", products_count: 42310 },
      { id: 2, name: "Smart Autos London", products_count: 35870 },
      { id: 3, name: "XU Atelier", products_count: 21200 },
      { id: 4, name: "TSN Store", products_count: 15600 },
      { id: 5, name: "AutoParts Direct", products_count: 13450 },
    ],
    categoryStats: [
      { category: "Tyres", total: 42310 },
      { category: "Vehicles", total: 35870 },
      { category: "Handbags", total: 21200 },
      { category: "Accessories", total: 15600 },
      { category: null, total: 13450 },
    ],
    recentProducts: [
      {
        id: 1,
        title: "Continental EcoContact 6 205/55 R16",
        brand: "Continental",
        image_url: null,
        category: "Tyres",
        price: 89.99,
        currency: "GBP",
        website: { id: 1, name: "Walsall Tyre World" },
      },
      {
        id: 2,
        title: "2022 BMW 3 Series 320d M Sport",
        brand: "BMW",
        image_url: null,
        category: "Vehicles",
        price: 24950,
        currency: "GBP",
        website: { id: 2, name: "Smart Autos London" },
      },
      {
        id: 3,
        title: "Quilted Leather Top Handle Bag",
        brand: "XU Atelier",
        image_url: null,
        category: "Handbags",
        price: 1250,
        currency: "GBP",
        website: { id: 3, name: "XU Atelier" },
      },
    ],
  };
}

export default async function DashboardPage() {
  const data = await getDashboardData();

  return (
    <div className="mx-auto max-w-350 space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of products, websites and categories.
        </p>
      </div>

      <KpiSection data={data} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <WebsiteBarChart data={data.websiteStats} viewAllHref="/websites" />
        </div>
        <div className="xl:col-span-4">
          <CategoriesDonutChart data={data.categoryStats} />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <WebsiteBreakdown
            data={data.websiteStats}
            totalProducts={data.totalProducts}
            manageHref="/websites"
          />
        </div>
        <div className="xl:col-span-7">
          <RecentProductsTable
            data={data.recentProducts}
            viewAllHref="/products"
          />
        </div>
      </div>
    </div>
  );
}
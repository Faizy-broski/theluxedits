import { WebsiteStats } from "@/components/dashboard/Websites/website-stats";
import { WebsitesTable } from "@/components/dashboard/Websites/websites-table";
import type { WebsiteRecord } from "@/lib/types";

// Replace with a real fetch/query that returns WebsiteRecord[].
async function getWebsites(): Promise<WebsiteRecord[]> {
  return [
    {
      id: 1,
      name: "Walsall Tyre World",
      url: "https://walsalltyreworld.co.uk",
      scraper_class: "WalsallTyreWorldScraper",
      is_active: true,
      products_count: 42310,
    },
    {
      id: 2,
      name: "Smart Autos London",
      url: "https://smartautoslondon.co.uk",
      scraper_class: "SmartAutosLondonScraper",
      is_active: true,
      products_count: 35870,
    },
    {
      id: 3,
      name: "XU Atelier",
      url: "https://xuatelier.com",
      scraper_class: null,
      is_active: true,
      products_count: 21200,
    },
    {
      id: 4,
      name: "TSN Store",
      url: "https://thesocialnexus.co.uk",
      scraper_class: "TsnStoreScraper",
      is_active: false,
      products_count: 15600,
    },
    {
      id: 5,
      name: "AutoParts Direct",
      url: "https://autopartsdirect.example.com",
      scraper_class: "AutoPartsDirectScraper",
      is_active: true,
      products_count: 13450,
    },
  ];
}

export default async function WebsitesPage() {
  const websites = await getWebsites();

  return (
    <div className="mx-auto max-w-350 space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Manage Websites
        </h1>
        <p className="text-sm text-muted-foreground">
          Register and manage your scraping sources.
        </p>
      </div>

      <WebsiteStats websites={websites} />
      <WebsitesTable websites={websites} />
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { Filter, RotateCcw, Tag, Globe, DollarSign, Coins, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { CategoryCount, ProductFilters } from "@/lib/types";

const VISIBLE_CATEGORIES = 8;
const VISIBLE_WEBSITES = 6;

interface WebsiteOption {
  id: number;
  name: string;
  products_count: number;
}

interface FilterSidebarProps {
  categoryCounts: CategoryCount[];
  websites: WebsiteOption[];
  filters: ProductFilters;
  onToggleCategory: (category: string) => void;
  onToggleWebsite: (id: string, name: string) => void;
  onApplyPriceAndCurrency: (values: {
    currency: string;
    price_min: string;
    price_max: string;
  }) => void;
  onClearAll: () => void;
}

export function FilterSidebar({
  categoryCounts,
  websites,
  filters,
  onToggleCategory,
  onToggleWebsite,
  onApplyPriceAndCurrency,
  onClearAll,
}: FilterSidebarProps) {
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [showAllWebsites, setShowAllWebsites] = useState(false);

  // Draft values for price/currency — only committed to the real filters
  // when "Apply Filters" is pressed, matching the Blade behavior.
  const [draftCurrency, setDraftCurrency] = useState(filters.currency);
  const [draftMin, setDraftMin] = useState(filters.price_min);
  const [draftMax, setDraftMax] = useState(filters.price_max);

  useEffect(() => {
    setDraftCurrency(filters.currency);
    setDraftMin(filters.price_min);
    setDraftMax(filters.price_max);
  }, [filters.currency, filters.price_min, filters.price_max]);

  const visibleCategories = showAllCategories
    ? categoryCounts
    : categoryCounts.slice(0, VISIBLE_CATEGORIES);
  const hiddenCategoryCount = categoryCounts.length - VISIBLE_CATEGORIES;

  const visibleWebsites = showAllWebsites
    ? websites
    : websites.slice(0, VISIBLE_WEBSITES);
  const hiddenWebsiteCount = websites.length - VISIBLE_WEBSITES;

  const tags: { key: string; label: string; onRemove: () => void }[] = [];
  if (filters.category) {
    tags.push({
      key: "category",
      label: filters.category,
      onRemove: () => onToggleCategory(filters.category),
    });
  }
  if (filters.website_id) {
    const site = websites.find((w) => String(w.id) === filters.website_id);
    tags.push({
      key: "website",
      label: site?.name ?? "Website",
      onRemove: () => onToggleWebsite(filters.website_id, site?.name ?? ""),
    });
  }
  if (filters.currency) {
    tags.push({
      key: "currency",
      label: `Currency: ${filters.currency}`,
      onRemove: () => onApplyPriceAndCurrency({ currency: "", price_min: filters.price_min, price_max: filters.price_max }),
    });
  }
  if (filters.price_min) {
    tags.push({
      key: "price_min",
      label: `Min: ${filters.price_min}`,
      onRemove: () => onApplyPriceAndCurrency({ currency: filters.currency, price_min: "", price_max: filters.price_max }),
    });
  }
  if (filters.price_max) {
    tags.push({
      key: "price_max",
      label: `Max: ${filters.price_max}`,
      onRemove: () => onApplyPriceAndCurrency({ currency: filters.currency, price_min: filters.price_min, price_max: "" }),
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Filter className="h-4 w-4 text-primary" />
          Filters
        </CardTitle>
        <Button variant="ghost" size="sm" onClick={onClearAll}>
          <RotateCcw className="mr-1 h-3.5 w-3.5" />
          Clear All
        </Button>
      </CardHeader>

      <CardContent className="space-y-5">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 border-b pb-4">
            {tags.map((tag) => (
              <Badge
                key={tag.key}
                className="flex items-center gap-1 pr-1.5"
              >
                {tag.label}
                <button
                  type="button"
                  onClick={tag.onRemove}
                  className="rounded-full p-0.5 hover:bg-white/20"
                  aria-label={`Remove ${tag.label} filter`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}

        {/* Categories */}
        <div>
          <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Tag className="h-3.5 w-3.5" />
            Categories
          </p>
          {categoryCounts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories found</p>
          ) : (
            <>
              <ul className="space-y-0.5">
                {visibleCategories.map((cat) => (
                  <li key={cat.category}>
                    <button
                      type="button"
                      onClick={() => onToggleCategory(cat.category)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent",
                        filters.category === cat.category &&
                          "bg-primary text-primary-foreground hover:bg-primary"
                      )}
                    >
                      <span className="max-w-[135px] truncate" title={cat.category}>
                        {cat.category}
                      </span>
                      <Badge
                        variant={filters.category === cat.category ? "outline" : "secondary"}
                        className={cn(
                          "shrink-0",
                          filters.category === cat.category &&
                            "border-primary-foreground/40 bg-white/15 text-primary-foreground"
                        )}
                      >
                        {cat.total}
                      </Badge>
                    </button>
                  </li>
                ))}
              </ul>
              {categoryCounts.length > VISIBLE_CATEGORIES && (
                <button
                  type="button"
                  onClick={() => setShowAllCategories((v) => !v)}
                  className="mt-2 pl-2 text-xs font-medium text-primary hover:underline"
                >
                  {showAllCategories ? "Show Less" : `${hiddenCategoryCount} MORE`}
                </button>
              )}
            </>
          )}
        </div>

        <div className="border-t" />

        {/* Websites */}
        <div>
          <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Globe className="h-3.5 w-3.5" />
            Websites
          </p>
          {websites.length === 0 ? (
            <p className="text-sm text-muted-foreground">No websites found</p>
          ) : (
            <>
              <ul className="space-y-0.5">
                {visibleWebsites.map((w) => (
                  <li key={w.id}>
                    <button
                      type="button"
                      onClick={() => onToggleWebsite(String(w.id), w.name)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent",
                        filters.website_id === String(w.id) &&
                          "bg-primary text-primary-foreground hover:bg-primary"
                      )}
                    >
                      <span className="max-w-[135px] truncate" title={w.name}>
                        {w.name}
                      </span>
                      <Badge
                        variant={filters.website_id === String(w.id) ? "outline" : "secondary"}
                        className={cn(
                          "shrink-0",
                          filters.website_id === String(w.id) &&
                            "border-primary-foreground/40 bg-white/15 text-primary-foreground"
                        )}
                      >
                        {w.products_count}
                      </Badge>
                    </button>
                  </li>
                ))}
              </ul>
              {websites.length > VISIBLE_WEBSITES && (
                <button
                  type="button"
                  onClick={() => setShowAllWebsites((v) => !v)}
                  className="mt-2 pl-2 text-xs font-medium text-primary hover:underline"
                >
                  {showAllWebsites ? "Show Less" : `${hiddenWebsiteCount} MORE`}
                </button>
              )}
            </>
          )}
        </div>

        <div className="border-t" />

        {/* Price range */}
        <div>
          <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <DollarSign className="h-3.5 w-3.5" />
            Price Range
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center rounded-md border">
              <span className="px-2 text-xs text-muted-foreground">Min</span>
              <Input
                type="number"
                min={0}
                placeholder="0"
                value={draftMin}
                onChange={(e) => setDraftMin(e.target.value)}
                className="h-8 rounded-l-none border-0 border-l"
              />
            </div>
            <div className="flex items-center rounded-md border">
              <span className="px-2 text-xs text-muted-foreground">Max</span>
              <Input
                type="number"
                min={0}
                placeholder="∞"
                value={draftMax}
                onChange={(e) => setDraftMax(e.target.value)}
                className="h-8 rounded-l-none border-0 border-l"
              />
            </div>
          </div>
        </div>

        {/* Currency */}
        <div>
          <p className="mb-2 flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Coins className="h-3.5 w-3.5" />
            Currency
          </p>
          <Input
            placeholder="e.g. USD, SAR"
            value={draftCurrency}
            onChange={(e) => setDraftCurrency(e.target.value)}
          />
        </div>

        <Button
          className="w-full"
          onClick={() =>
            onApplyPriceAndCurrency({
              currency: draftCurrency,
              price_min: draftMin,
              price_max: draftMax,
            })
          }
        >
          <Filter className="mr-1 h-4 w-4" />
          Apply Filters
        </Button>
      </CardContent>
    </Card>
  );
}

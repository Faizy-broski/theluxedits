"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  PlusCircle,
  MinusCircle,
  Equal,
  Settings2,
  AlertTriangle,
  Globe,
  ListChecks,
  CheckSquare,
  Square,
  Search,
  Info,
  ImageOff,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { KpiCard } from "@/components/dashboard/MainPage/kpi-card";
import { cn } from "@/lib/utils";
import { searchProducts, applyBulkPriceRule } from "@/lib/actions/products/actions";
import type { BulkRuleType, PriceRounding, ProductFilters, ProductRecord } from "@/lib/types";

const PAGE_SIZE = 15;

const EMPTY_FILTERS: ProductFilters = {
  search: "",
  category: "",
  website_id: "",
  currency: "",
  price_min: "",
  price_max: "",
  page: 1,
  pageSize: PAGE_SIZE,
};

const RULE_TYPES: {
  value: BulkRuleType;
  label: string;
  icon: typeof ArrowUpCircle;
  colorClass: string;
  unit: string;
  span: string;
}[] = [
  { value: "increase_pct", label: "Increase %", icon: ArrowUpCircle, colorClass: "text-primary", unit: "%", span: "col-span-3" },
  { value: "decrease_pct", label: "Decrease %", icon: ArrowDownCircle, colorClass: "text-destructive", unit: "%", span: "col-span-3" },
  { value: "add_fixed", label: "Add Fixed", icon: PlusCircle, colorClass: "text-emerald-600", unit: "amount", span: "col-span-2" },
  { value: "subtract_fixed", label: "Subtract", icon: MinusCircle, colorClass: "text-amber-500", unit: "amount", span: "col-span-2" },
  { value: "set_fixed", label: "Set Fixed", icon: Equal, colorClass: "text-sky-600", unit: "amount", span: "col-span-2" },
];

const RULE_LABELS: Record<BulkRuleType, (value: number) => string> = {
  increase_pct: (v) => `Increase by ${v}%`,
  decrease_pct: (v) => `Decrease by ${v}%`,
  add_fixed: (v) => `Add ${v} fixed`,
  subtract_fixed: (v) => `Subtract ${v} fixed`,
  set_fixed: (v) => `Set price to ${v}`,
};

interface BulkEditExplorerProps {
  totalProducts: number;
  websites: { id: number; name: string; products_count: number }[];
}

export function BulkEditExplorer({ totalProducts, websites }: BulkEditExplorerProps) {
  const [filters, setFilters] = useState<ProductFilters>(EMPTY_FILTERS);
  const [searchDraft, setSearchDraft] = useState("");
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, startLoad] = useTransition();
  const [isApplying, startApply] = useTransition();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [ruleType, setRuleType] = useState<BulkRuleType>("increase_pct");
  const [value, setValue] = useState("");
  const [valueError, setValueError] = useState("");
  const [rounding, setRounding] = useState<PriceRounding>("round");
  const [confirmOpen, setConfirmOpen] = useState(false);

  function load(nextFilters: ProductFilters) {
    startLoad(async () => {
      const result = await searchProducts(nextFilters);
      setProducts(result.data);
      setTotal(result.total);
    });
  }

  useEffect(() => {
    load(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((prev) =>
        prev.search === searchDraft ? prev : { ...prev, search: searchDraft, page: 1 }
      );
    }, 300);
    return () => clearTimeout(t);
  }, [searchDraft]);

  function handleWebsiteChange(id: string) {
    setSelectedIds(new Set());
    setFilters((prev) => ({ ...prev, website_id: id === "all" ? "" : id, page: 1 }));
  }

  function toggleRow(id: number, checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  const allVisibleSelected = products.length > 0 && products.every((p) => selectedIds.has(p.id));

  function toggleAllVisible(checked: boolean) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      products.forEach((p) => (checked ? next.add(p.id) : next.delete(p.id)));
      return next;
    });
  }

  function selectAllVisible() {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      products.forEach((p) => next.add(p.id));
      return next;
    });
  }

  function deselectAll() {
    setSelectedIds(new Set());
  }

  const ruleUnit = RULE_TYPES.find((r) => r.value === ruleType)?.unit ?? "%";
  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const rangeStart = total === 0 ? 0 : (filters.page - 1) * filters.pageSize + 1;
  const rangeEnd = Math.min(filters.page * filters.pageSize, total);

  const numericValue = useMemo(() => parseFloat(value), [value]);

  function openConfirm() {
    if (selectedIds.size === 0) {
      toast.warning("Please select at least one product.");
      return;
    }
    if (!numericValue || numericValue <= 0) {
      setValueError("Please enter a valid value greater than 0.");
      return;
    }
    setValueError("");
    setConfirmOpen(true);
  }

  function handleApply() {
    startApply(async () => {
      const ids = Array.from(selectedIds);
      const result = await applyBulkPriceRule(ids, ruleType, numericValue, rounding);
      setConfirmOpen(false);
      if (result.success) {
        toast.success(result.message ?? `Rule applied to ${result.updated} product(s).`);
        load(filters);
      } else {
        toast.error(result.message ?? "Failed to apply rule.");
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* Rule builder column */}
      <div className="space-y-4 lg:col-span-5 xl:col-span-4">
        <KpiCard
          label="Total Products"
          value={totalProducts}
          icon={ListChecks}
          helperText="Available in database"
          accent="chart-1"
        />

        <Card className="lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-4 w-4 text-primary" />
              Price Rule Builder
            </CardTitle>
            <CardDescription>Configure and apply bulk price changes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                <strong>Heads up!</strong> Rules apply to all{" "}
                <strong>selected products</strong>. Products without a price
                are skipped.
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-1 text-sm font-medium">
                <Globe className="h-3.5 w-3.5" />
                Filter by Website
              </label>
              <Select
                value={filters.website_id || "all"}
                onValueChange={handleWebsiteChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Websites</SelectItem>
                  {websites.map((w) => (
                    <SelectItem key={w.id} value={String(w.id)}>
                      {w.name}
                      {w.products_count ? ` (${w.products_count})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Rule Type</label>
              <div className="grid grid-cols-6 gap-2">
                {RULE_TYPES.map((rule) => {
                  const Icon = rule.icon;
                  const active = ruleType === rule.value;
                  return (
                    <button
                      key={rule.value}
                      type="button"
                      onClick={() => setRuleType(rule.value)}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-md border px-1 py-2.5 text-center transition-colors",
                        rule.span,
                        active
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-accent"
                      )}
                    >
                      <Icon className={cn("h-5 w-5", rule.colorClass)} />
                      <span className="text-xs font-semibold leading-tight">
                        {rule.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="ruleValue" className="text-sm font-medium">
                Value <span className="text-destructive">*</span>
              </label>
              <div className="flex">
                <Input
                  id="ruleValue"
                  type="number"
                  min={0}
                  step="0.01"
                  placeholder="e.g. 10"
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    if (Number(e.target.value) > 0) setValueError("");
                  }}
                  aria-invalid={Boolean(valueError)}
                  className="rounded-r-none"
                />
                <span className="flex items-center rounded-r-md border border-l-0 bg-muted px-3 text-sm text-muted-foreground">
                  {ruleUnit}
                </span>
              </div>
              {valueError && <p className="text-xs text-destructive">{valueError}</p>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">Price Rounding</label>
              <Select value={rounding} onValueChange={(v) => setRounding(v as PriceRounding)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="round">Round to 2 decimals (default)</SelectItem>
                  <SelectItem value="nearest_99">Nearest .99 (e.g. 14.99)</SelectItem>
                  <SelectItem value="nearest_00">Nearest whole number</SelectItem>
                  <SelectItem value="none">No rounding</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2 pt-1">
              <Button onClick={openConfirm} disabled={selectedIds.size === 0}>
                <ListChecks className="mr-1 h-4 w-4" />
                Apply to Selected ({selectedIds.size})
              </Button>
              <Button variant="secondary" size="sm" onClick={selectAllVisible}>
                <CheckSquare className="mr-1 h-4 w-4" />
                Select All Visible
              </Button>
              <Button variant="secondary" size="sm" onClick={deselectAll}>
                <Square className="mr-1 h-4 w-4" />
                Deselect All
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products table column */}
      <div className="lg:col-span-7 xl:col-span-8">
        <Card>
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-2">
            <div>
              <CardTitle>Products</CardTitle>
              <CardDescription>
                Check the products you want to apply the rule to
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-sm">
              {selectedIds.size} selected
            </Badge>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-start gap-2 rounded-md bg-accent px-3 py-2.5 text-sm text-accent-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Use the <strong>Filter by Website</strong> dropdown on the
                left to load products from a specific source. Tick checkboxes
                to select, then click <strong>Apply to Selected</strong>.
              </p>
            </div>

            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products…"
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                className="pl-8"
              />
            </div>

            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-10 text-center">
                      <Checkbox
                        checked={allVisibleSelected}
                        onCheckedChange={(c: boolean) => toggleAllVisible(Boolean(c))}
                        aria-label="Select all visible"
                      />
                    </TableHead>
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Current Price</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead>Website</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((p, i) => {
                    const qty = p.quantity;
                    const qtyClass =
                      qty === null
                        ? "bg-muted text-muted-foreground"
                        : qty <= 0
                        ? "bg-destructive text-white"
                        : qty <= 5
                        ? "bg-amber-500 text-white"
                        : "bg-emerald-600 text-white";

                    return (
                      <TableRow key={p.id} data-state={selectedIds.has(p.id) ? "selected" : undefined}>
                        <TableCell className="text-center">
                          <Checkbox
                            checked={selectedIds.has(p.id)}
                            onCheckedChange={(c: boolean) => toggleRow(p.id, Boolean(c))}
                            aria-label={`Select ${p.title}`}
                          />
                        </TableCell>
                        <TableCell className="text-center text-muted-foreground">
                          {(filters.page - 1) * filters.pageSize + i + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg border bg-muted">
                              {p.image_url ? (
                                <Image
                                  src={p.image_url}
                                  alt={p.title}
                                  fill
                                  sizes="48px"
                                  className="object-cover"
                                  unoptimized={p.image_url.startsWith("data:")}
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <ImageOff className="h-4 w-4 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="max-w-[200px] truncate text-[13px] font-medium" title={p.title}>
                                {p.title}
                              </p>
                              {p.category && (
                                <Badge variant="secondary" className="mt-1">
                                  {p.category}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {p.price !== null ? (
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                              {p.currency} {p.price.toFixed(2)}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell className="text-center">
                          {qty !== null ? (
                            <Badge className={cn(qtyClass)}>{qty}</Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {p.website ? (
                            <Badge className="bg-sky-600 text-white hover:bg-sky-600">
                              {p.website.name}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {!isLoading && products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="py-12 text-center">
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Inbox className="h-8 w-8" />
                          <p className="text-sm">No products found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">
                {total === 0
                  ? "No products"
                  : `Showing ${rangeStart} to ${rangeEnd} of ${total} products`}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={filters.page <= 1}
                  onClick={() => setFilters((prev) => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="px-2 text-sm text-muted-foreground">
                  Page {filters.page} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  disabled={filters.page >= totalPages}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))
                  }
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apply Price Rule?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-1">
                <p>
                  Rule:{" "}
                  <strong className="text-foreground">
                    {RULE_LABELS[ruleType](numericValue || 0)}
                  </strong>
                </p>
                <p>
                  Products: <strong className="text-foreground">{selectedIds.size}</strong>
                </p>
                <p className="text-amber-600 dark:text-amber-400">
                  Products without a price will be skipped.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isApplying}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleApply();
              }}
              disabled={isApplying}
            >
              {isApplying ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <ListChecks className="mr-1 h-4 w-4" />
              )}
              Apply Rule
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
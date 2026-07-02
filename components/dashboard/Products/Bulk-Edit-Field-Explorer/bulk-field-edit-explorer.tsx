"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Edit3,
  Info,
  AlertTriangle,
  Globe,
  DollarSign,
  Package,
  Tag,
  Building2,
  ListChecks,
  CheckSquare,
  Square,
  Search,
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
import { searchProducts, applyBulkFieldUpdate } from "@/lib/actions/products/actions";
import type {
  BulkEditableField,
  BulkFieldValues,
  ProductFilters,
  ProductRecord,
} from "@/lib/types";

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

const EMPTY_VALUES: BulkFieldValues = {
  price: "",
  quantity: "",
  category: "",
  brand: "",
  source_website_id: "",
};

const FIELD_LABELS: Record<BulkEditableField, string> = {
  price: "Price",
  quantity: "Stock / Quantity",
  category: "Category",
  brand: "Brand",
  source_website_id: "Source Website",
};

interface BulkFieldEditExplorerProps {
  totalProducts: number;
  websites: { id: number; name: string; products_count: number }[];
  categories: string[];
  brands: string[];
}

export function BulkFieldEditExplorer({
  totalProducts,
  websites,
  categories,
  brands,
}: BulkFieldEditExplorerProps) {
  const [filters, setFilters] = useState<ProductFilters>(EMPTY_FILTERS);
  const [searchDraft, setSearchDraft] = useState("");
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, startLoad] = useTransition();
  const [isApplying, startApply] = useTransition();

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [enabledFields, setEnabledFields] = useState<Set<BulkEditableField>>(new Set());
  const [values, setValues] = useState<BulkFieldValues>(EMPTY_VALUES);
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

  function toggleField(field: BulkEditableField, checked: boolean) {
    setEnabledFields((prev) => {
      const next = new Set(prev);
      if (checked) next.add(field);
      else next.delete(field);
      return next;
    });
  }

  function setFieldValue<K extends keyof BulkFieldValues>(key: K, value: BulkFieldValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
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

  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const rangeStart = total === 0 ? 0 : (filters.page - 1) * filters.pageSize + 1;
  const rangeEnd = Math.min(filters.page * filters.pageSize, total);

  const fieldsList = Array.from(enabledFields);
  const canApply = selectedIds.size > 0 && fieldsList.length > 0;

  function openConfirm() {
    if (selectedIds.size === 0) {
      toast.warning("Please select at least one product.");
      return;
    }
    if (fieldsList.length === 0) {
      toast.warning("Please tick at least one field to update.");
      return;
    }
    setConfirmOpen(true);
  }

  function handleApply() {
    startApply(async () => {
      const ids = Array.from(selectedIds);
      const result = await applyBulkFieldUpdate(ids, fieldsList, values);
      setConfirmOpen(false);
      if (result.success) {
        toast.success(result.message ?? `Updated ${result.updated} product(s) successfully.`);
        load(filters);
      } else {
        toast.error(result.message ?? "Failed to apply changes.");
      }
    });
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* Field editor column */}
      <div className="space-y-4 lg:col-span-5 xl:col-span-4">
        <KpiCard
          label="Total Products"
          value={totalProducts}
          icon={Edit3}
          helperText="Available in database"
          accent="chart-2"
        />

        <Card className="lg:sticky lg:top-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="h-4 w-4 text-sky-600" />
              Field Editor
            </CardTitle>
            <CardDescription>Tick a field to enable it, then set its value</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-2 rounded-md bg-accent px-3 py-2.5 text-sm text-accent-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                Only <strong>ticked fields</strong> will be updated. Unticked
                fields are left unchanged.
              </p>
            </div>

            <div className="space-y-2">
              <label className="flex items-center gap-1 text-sm font-medium">
                <Globe className="h-3.5 w-3.5" />
                Filter by Website
              </label>
              <Select value={filters.website_id || "all"} onValueChange={handleWebsiteChange}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Websites</SelectItem>
                  {websites.map((w) => (
                    <SelectItem key={w.id} value={String(w.id)}>
                      {w.name} ({w.products_count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="border-t pt-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Fields to Update
              </p>

              <div className="space-y-3">
                <FieldRow
                  icon={DollarSign}
                  iconClass="text-emerald-600"
                  label="Price"
                  checked={enabledFields.has("price")}
                  onCheckedChange={(c) => toggleField("price", c)}
                >
                  <Input
                    type="number"
                    step="0.01"
                    min={0}
                    placeholder="e.g. 25.99"
                    value={values.price}
                    onChange={(e) => setFieldValue("price", e.target.value)}
                    disabled={!enabledFields.has("price")}
                    className="h-8"
                  />
                </FieldRow>

                <FieldRow
                  icon={Package}
                  iconClass="text-amber-500"
                  label="Stock / Quantity"
                  checked={enabledFields.has("quantity")}
                  onCheckedChange={(c) => toggleField("quantity", c)}
                >
                  <Input
                    type="number"
                    min={0}
                    placeholder="e.g. 10"
                    value={values.quantity}
                    onChange={(e) => setFieldValue("quantity", e.target.value)}
                    disabled={!enabledFields.has("quantity")}
                    className="h-8"
                  />
                </FieldRow>

                <FieldRow
                  icon={Tag}
                  iconClass="text-primary"
                  label="Category"
                  checked={enabledFields.has("category")}
                  onCheckedChange={(c) => toggleField("category", c)}
                >
                  <Select
                    value={values.category || undefined}
                    onValueChange={(v) => setFieldValue("category", v)}
                    disabled={!enabledFields.has("category")}
                  >
                    <SelectTrigger size="sm" className="w-full">
                      <SelectValue placeholder="— Select category —" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldRow>

                <FieldRow
                  icon={Building2}
                  iconClass="text-muted-foreground"
                  label="Brand"
                  checked={enabledFields.has("brand")}
                  onCheckedChange={(c) => toggleField("brand", c)}
                >
                  <Select
                    value={values.brand || undefined}
                    onValueChange={(v) => setFieldValue("brand", v)}
                    disabled={!enabledFields.has("brand")}
                  >
                    <SelectTrigger size="sm" className="w-full">
                      <SelectValue placeholder="— Select brand —" />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map((b) => (
                        <SelectItem key={b} value={b}>
                          {b}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldRow>

                <FieldRow
                  icon={Globe}
                  iconClass="text-sky-600"
                  label="Source Website"
                  checked={enabledFields.has("source_website_id")}
                  onCheckedChange={(c) => toggleField("source_website_id", c)}
                >
                  <Select
                    value={values.source_website_id || undefined}
                    onValueChange={(v) => setFieldValue("source_website_id", v)}
                    disabled={!enabledFields.has("source_website_id")}
                  >
                    <SelectTrigger size="sm" className="w-full">
                      <SelectValue placeholder="— Select website —" />
                    </SelectTrigger>
                    <SelectContent>
                      {websites.map((w) => (
                        <SelectItem key={w.id} value={String(w.id)}>
                          {w.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FieldRow>
              </div>
            </div>

            <div className="grid gap-2 pt-1">
              <Button
                className="bg-sky-600 text-white hover:bg-sky-700"
                onClick={openConfirm}
                disabled={!canApply}
              >
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
              <CardDescription>Select the products you want to update</CardDescription>
            </div>
            <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100 dark:bg-sky-950 dark:text-sky-300">
              {selectedIds.size} selected
            </Badge>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                <strong>Heads up!</strong> Only <strong>ticked fields</strong>{" "}
                on the left will be updated. Use{" "}
                <strong>Filter by Website</strong> to narrow down products.
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
                        onCheckedChange={(c) => toggleAllVisible(Boolean(c))}
                        aria-label="Select all visible"
                      />
                    </TableHead>
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Price</TableHead>
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
                            onCheckedChange={(c) => toggleRow(p.id, Boolean(c))}
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
            <AlertDialogTitle>Apply Changes?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-1">
                <p>
                  Fields:{" "}
                  <strong className="text-foreground">
                    {fieldsList.map((f) => FIELD_LABELS[f]).join(", ")}
                  </strong>
                </p>
                <p>
                  Products: <strong className="text-foreground">{selectedIds.size}</strong>
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
              className="bg-sky-600 text-white hover:bg-sky-700"
            >
              {isApplying ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <ListChecks className="mr-1 h-4 w-4" />
              )}
              Apply
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

interface FieldRowProps {
  icon: typeof DollarSign;
  iconClass: string;
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  children: React.ReactNode;
}

function FieldRow({ icon: Icon, iconClass, label, checked, onCheckedChange, children }: FieldRowProps) {
  return (
    <div
      className={cn(
        "rounded-lg border p-3 transition-colors",
        checked && "border-emerald-300 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-950"
      )}
    >
      <div className="mb-2 flex items-center gap-2">
        <Checkbox checked={checked} onCheckedChange={(c) => onCheckedChange(Boolean(c))} />
        <label
          className="flex cursor-pointer items-center gap-1 text-sm font-semibold"
          onClick={() => onCheckedChange(!checked)}
        >
          <Icon className={cn("h-3.5 w-3.5", iconClass)} />
          {label}
        </label>
      </div>
      {children}
    </div>
  );
}
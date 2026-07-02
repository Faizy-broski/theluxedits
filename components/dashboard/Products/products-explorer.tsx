"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import Image from "next/image";
import {
  Plus,
  Info,
  Search,
  MoreHorizontal,
  Eye,
  Pencil,
  Trash2,
  ImageOff,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FilterSidebar } from "@/components/dashboard/Products/filter-sidebar";
import { ProductFormDialog } from "@/components/dashboard/Products/product-form-dialog";
import { ProductViewDialog } from "@/components/dashboard/Products/product-view-dialog";
import { DeleteProductDialog } from "@/components/dashboard/Products/delete-product-dialog";
import { searchProducts } from "@/lib/actions/products/actions";
import type {
  CategoryCount,
  ProductFilters,
  ProductRecord,
} from "@/lib/types";

const PAGE_SIZE_OPTIONS = [10, 15, 25, 50] as const;

const EMPTY_FILTERS: ProductFilters = {
  search: "",
  category: "",
  website_id: "",
  currency: "",
  price_min: "",
  price_max: "",
  page: 1,
  pageSize: 15,
};

interface ProductsExplorerProps {
  categoryCounts: CategoryCount[];
  websites: { id: number; name: string; products_count: number }[];
  brands: string[];
  categories: string[];
}

export function ProductsExplorer({
  categoryCounts,
  websites,
  brands,
  categories,
}: ProductsExplorerProps) {
  const [filters, setFilters] = useState<ProductFilters>(EMPTY_FILTERS);
  const [searchDraft, setSearchDraft] = useState("");
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, startLoad] = useTransition();

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRecord | null>(null);

  const [viewOpen, setViewOpen] = useState(false);
  const [viewingProduct, setViewingProduct] = useState<ProductRecord | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<ProductRecord | null>(null);

  function load(nextFilters: ProductFilters) {
    startLoad(async () => {
      const result = await searchProducts(nextFilters);
      setProducts(result.data);
      setTotal(result.total);
    });
  }

  // Initial load + reload whenever filters change.
  useEffect(() => {
    load(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  // Debounce the free-text search box, mirroring the DataTables keyup search.
  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((prev) =>
        prev.search === searchDraft ? prev : { ...prev, search: searchDraft, page: 1 }
      );
    }, 300);
    return () => clearTimeout(t);
  }, [searchDraft]);

  function toggleCategory(category: string) {
    setFilters((prev) => ({
      ...prev,
      category: prev.category === category ? "" : category,
      page: 1,
    }));
  }

  function toggleWebsite(id: string) {
    setFilters((prev) => ({
      ...prev,
      website_id: prev.website_id === id ? "" : id,
      page: 1,
    }));
  }

  function applyPriceAndCurrency(values: { currency: string; price_min: string; price_max: string }) {
    setFilters((prev) => ({ ...prev, ...values, page: 1 }));
  }

  function clearAll() {
    setSearchDraft("");
    setFilters(EMPTY_FILTERS);
  }

  const totalPages = Math.max(1, Math.ceil(total / filters.pageSize));
  const rangeStart = total === 0 ? 0 : (filters.page - 1) * filters.pageSize + 1;
  const rangeEnd = Math.min(filters.page * filters.pageSize, total);

  function openAdd() {
    setEditingProduct(null);
    setFormOpen(true);
  }
  function openEdit(product: ProductRecord) {
    setEditingProduct(product);
    setFormOpen(true);
  }
  function openView(product: ProductRecord) {
    setViewingProduct(product);
    setViewOpen(true);
  }
  function openDelete(product: ProductRecord) {
    setDeletingProduct(product);
    setDeleteOpen(true);
  }

  function handleSaved(message: string) {
    toast.success(message);
    load(filters);
  }
  function handleDeleted(message: string) {
    toast.success(message);
    load(filters);
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      <div className="lg:col-span-4 xl:col-span-3">
        <FilterSidebar
          categoryCounts={categoryCounts}
          websites={websites}
          filters={filters}
          onToggleCategory={toggleCategory}
          onToggleWebsite={(id) => toggleWebsite(id)}
          onApplyPriceAndCurrency={applyPriceAndCurrency}
          onClearAll={clearAll}
        />
      </div>

      <div className="lg:col-span-8 xl:col-span-9">
        <Card>
          <CardHeader className="flex-row flex-wrap items-center justify-between gap-3">
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={openAdd}>
              <Plus className="mr-1 h-4 w-4" />
              Add Product
            </Button>
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                value={searchDraft}
                onChange={(e) => setSearchDraft(e.target.value)}
                className="pl-8"
              />
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-start gap-2 rounded-md bg-accent px-3 py-2.5 text-sm text-accent-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                <strong>How it works:</strong> Click a <strong>Category</strong>{" "}
                or <strong>Website</strong> in the sidebar to filter. The
                action menu lets you <strong>View</strong>,{" "}
                <strong>Edit</strong> or <strong>Delete</strong>.
              </p>
            </div>

            <div className="overflow-hidden rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted/50">
                    <TableHead className="w-12 text-center">#</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Brand</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead className="text-center">Stock</TableHead>
                    <TableHead>Website</TableHead>
                    <TableHead className="w-16 text-center">Actions</TableHead>
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
                      <TableRow key={p.id}>
                        <TableCell className="text-center text-muted-foreground">
                          {(filters.page - 1) * filters.pageSize + i + 1}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-lg border bg-muted">
                              {p.image_url ? (
                                <Image
                                  src={p.image_url}
                                  alt={p.title}
                                  fill
                                  sizes="52px"
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
                              <p
                                className="max-w-[220px] truncate text-[13.5px] font-medium"
                                title={p.title}
                              >
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
                          {p.brand ?? <span className="text-muted-foreground">—</span>}
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
                        <TableCell className="text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openView(p)}>
                                <Eye className="mr-2 h-4 w-4 text-sky-600" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEdit(p)}>
                                <Pencil className="mr-2 h-4 w-4 text-amber-500" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem variant="destructive" onClick={() => openDelete(p)}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })}

                  {!isLoading && products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="py-12 text-center">
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
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {total === 0
                    ? "No products"
                    : `Showing ${rangeStart} to ${rangeEnd} of ${total} products`}
                </span>
                <Select
                  value={String(filters.pageSize)}
                  onValueChange={(v) =>
                    setFilters((prev) => ({ ...prev, pageSize: Number(v), page: 1 }))
                  }
                >
                  <SelectTrigger size="sm" className="w-[90px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZE_OPTIONS.map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {n} / page
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

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

      <ProductFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        product={editingProduct}
        brands={brands}
        categories={categories}
        websites={websites}
        onSaved={handleSaved}
      />
      <ProductViewDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        product={viewingProduct}
        onEdit={openEdit}
      />
      <DeleteProductDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        product={deletingProduct}
        onDeleted={handleDeleted}
      />
    </div>
  );
}

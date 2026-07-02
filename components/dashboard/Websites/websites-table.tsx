"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Info,
  Search,
  MoreHorizontal,
  Pencil,
  Trash2,
  Code2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
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
import { WebsiteFormDialog } from "@/components/dashboard/Websites/website-form-dialog";
import { DeleteWebsiteDialog } from "@/components/dashboard/Websites/delete-website-dialog";
import type { WebsiteRecord } from "@/lib/types";

const PAGE_SIZE_OPTIONS = [10, 25, 50] as const;

interface WebsitesTableProps {
  websites: WebsiteRecord[];
}

export function WebsitesTable({ websites }: WebsitesTableProps) {
  const [search, setSearch] = useState("");
  const [pageSize, setPageSize] = useState<number>(10);
  const [page, setPage] = useState(1);

  const [formOpen, setFormOpen] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<WebsiteRecord | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingWebsite, setDeletingWebsite] = useState<WebsiteRecord | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return websites;
    return websites.filter(
      (w) =>
        w.name.toLowerCase().includes(q) ||
        w.url.toLowerCase().includes(q) ||
        (w.scraper_class ?? "").toLowerCase().includes(q)
    );
  }, [websites, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const rangeStart = filtered.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const rangeEnd = Math.min(currentPage * pageSize, filtered.length);

  function openAddDialog() {
    setEditingWebsite(null);
    setFormOpen(true);
  }

  function openEditDialog(website: WebsiteRecord) {
    setEditingWebsite(website);
    setFormOpen(true);
  }

  function openDeleteDialog(website: WebsiteRecord) {
    setDeletingWebsite(website);
    setDeleteOpen(true);
  }

  function handleSaved(message: string) {
    toast.success(message);
  }

  function handleDeleted(message: string) {
    toast.success(message);
  }

  return (
    <Card>
      <CardHeader className="flex-row flex-wrap items-center justify-between gap-2">
        <div>
          <CardTitle>All Websites</CardTitle>
          <CardDescription>
            {websites.length} registered source{websites.length === 1 ? "" : "s"}
          </CardDescription>
        </div>
        <CardAction>
          <Button size="sm" onClick={openAddDialog}>
            <Plus className="mr-1 h-4 w-4" />
            Add Website
          </Button>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex items-start gap-2 rounded-md bg-accent px-3 py-2.5 text-sm text-accent-foreground">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          <p>
            <strong>Info:</strong> Below is the list of all registered
            scraping sources. Use <strong>Add Website</strong> to register a
            new one. The action menu lets you <strong>edit</strong> or{" "}
            <strong>delete</strong> any source. Deleting a website will{" "}
            <em>not</em> remove its already-scraped products.
          </p>
        </div>

        <div className="relative w-full max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search websites..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-8"
          />
        </div>

        <div className="overflow-hidden rounded-md border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-14">Sr No</TableHead>
                <TableHead>Website</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Scraper Class</TableHead>
                <TableHead>Products</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-16 text-center">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.map((site, i) => (
                <TableRow key={site.id}>
                  <TableCell className="font-medium text-muted-foreground">
                    {(currentPage - 1) * pageSize + i + 1}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
                        {site.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-semibold">{site.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block max-w-[200px] truncate text-primary underline-offset-2 hover:underline"
                    >
                      {site.url}
                    </a>
                  </TableCell>
                  <TableCell>
                    {site.scraper_class ? (
                      <code className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Code2 className="h-3.5 w-3.5" />
                        {site.scraper_class}
                      </code>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className="rounded-full">
                      {site.products_count.toLocaleString()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {site.is_active ? (
                      <Badge className="bg-emerald-600 text-white hover:bg-emerald-600">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">Inactive</Badge>
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
                        <DropdownMenuItem onClick={() => openEditDialog(site)}>
                          <Pencil className="mr-2 h-4 w-4 text-primary" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => openDeleteDialog(site)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}

              {paginated.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No websites found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>
              {filtered.length === 0
                ? "No websites"
                : `Showing ${rangeStart} to ${rangeEnd} of ${filtered.length} websites`}
            </span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                setPageSize(Number(v));
                setPage(1);
              }}
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
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>

      <WebsiteFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        website={editingWebsite}
        onSaved={handleSaved}
      />
      <DeleteWebsiteDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        website={deletingWebsite}
        onDeleted={handleDeleted}
      />
    </Card>
  );
}

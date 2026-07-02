"use client";

import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { Loader2, Save, X, Info, PlusCircle, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { createWebsite, updateWebsite } from "@/lib/actions/websites/actions";
import type { WebsiteFormValues, WebsiteRecord } from "@/lib/types";

const EMPTY_FORM: WebsiteFormValues = {
  name: "",
  url: "",
  scraper_class: "",
  is_active: true,
};

const URL_PATTERN = /^https?:\/\/.+/i;

interface WebsiteFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pass a website to edit it; leave undefined/null to add a new one. */
  website?: WebsiteRecord | null;
  onSaved: (message: string) => void;
}

export function WebsiteFormDialog({
  open,
  onOpenChange,
  website,
  onSaved,
}: WebsiteFormDialogProps) {
  const isEdit = Boolean(website);
  const [values, setValues] = useState<WebsiteFormValues>(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof WebsiteFormValues, string>>>({});
  const [isPending, startTransition] = useTransition();

  // Reset the form whenever the dialog opens, matching the Blade modal's
  // "populate on open" behavior for both add and edit.
  useEffect(() => {
    if (!open) return;
    setValues(
      website
        ? {
            name: website.name,
            url: website.url,
            scraper_class: website.scraper_class ?? "",
            is_active: website.is_active,
          }
        : EMPTY_FORM
    );
    setErrors({});
  }, [open, website]);

  function setField<K extends keyof WebsiteFormValues>(key: K, value: WebsiteFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validateClientSide() {
    const next: typeof errors = {};
    if (!values.name.trim()) next.name = "Please enter the website name.";
    if (!values.url.trim() || !URL_PATTERN.test(values.url.trim())) {
      next.url = "Please enter a valid URL (https://...).";
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateClientSide()) return;

    startTransition(async () => {
      const result = isEdit
        ? await updateWebsite(website!.id, values)
        : await createWebsite(values);

      if (result.success) {
        onOpenChange(false);
        onSaved(
          isEdit
            ? `"${values.name}" updated successfully!`
            : `"${values.name}" added successfully!`
        );
      } else if (result.errors) {
        setErrors(result.errors);
        toast.error("Please fix the highlighted fields.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {isEdit ? (
                <Pencil className="h-4 w-4 text-primary" />
              ) : (
                <PlusCircle className="h-4 w-4 text-primary" />
              )}
              {isEdit ? "Edit Website" : "Add Website"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="flex items-start gap-2 rounded-md bg-accent px-3 py-2.5 text-sm text-accent-foreground">
              <Info className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                {isEdit
                  ? "Update the details for this scraping source. Changes take effect immediately."
                  : "Fill in the details below to register a new scraping source."}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="wName">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="wName"
                placeholder="e.g. BQWatches"
                value={values.name}
                onChange={(e) => setField("name", e.target.value)}
                aria-invalid={Boolean(errors.name)}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="wUrl">
                URL <span className="text-destructive">*</span>
              </Label>
              <Input
                id="wUrl"
                type="url"
                placeholder="https://example.com"
                value={values.url}
                onChange={(e) => setField("url", e.target.value)}
                aria-invalid={Boolean(errors.url)}
              />
              {errors.url && (
                <p className="text-xs text-destructive">{errors.url}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="wScraper">Scraper Class</Label>
              <Input
                id="wScraper"
                placeholder="e.g. BQWatchesScraper"
                value={values.scraper_class}
                onChange={(e) => setField("scraper_class", e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                PHP class used to scrape this website
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="wActive"
                checked={values.is_active}
                onCheckedChange={(checked) => setField("is_active", checked)}
              />
              <Label htmlFor="wActive" className="cursor-pointer font-medium">
                Active
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              <X className="mr-1 h-4 w-4" />
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <Loader2 className="mr-1 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-1 h-4 w-4" />
              )}
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
